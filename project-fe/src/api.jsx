import axios from 'axios';
import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import jwtDecode from 'jwt-decode';
import PropTypes from 'prop-types';

const BASE_URL = 'https://be-rest-928661779459.us-central1.run.app';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Helper functions
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
};

const setCookie = (name, value, maxAge) => {
  document.cookie = `${name}=${value}; path=/; secure; sameSite=Strict${maxAge ? `; max-age=${maxAge}` : ''}`;
};

const clearAuthCookies = () => {
  document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
};

// Request interceptor
api.interceptors.request.use(async (config) => {
  const token = getCookie('accessToken');
  
  if (token) {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      // Jika token akan expired dalam 15 detik
      if (decoded.exp < currentTime + 15) {
        try {
          const response = await axios.get(`${BASE_URL}/token`, { 
            withCredentials: true 
          });
          const newToken = response.data.accessToken;
          setCookie('accessToken', newToken, 30); // 30 detik
          config.headers.Authorization = `Bearer ${newToken}`;
          return config;
        } catch (refreshError) {
          clearAuthCookies();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }

      config.headers.Authorization = `Bearer ${token}`;
    } catch (error) {
      clearAuthCookies();
      return Promise.reject(error);
    }
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const response = await axios.get(`${BASE_URL}/token`, { 
          withCredentials: true 
        });
        const newToken = response.data.accessToken;
        setCookie('accessToken', newToken, 30);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        clearAuthCookies();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    if (error.response?.status === 403) {
      // Handle forbidden error
      window.location.href = '/unauthorized';
    }
    
    return Promise.reject(error);
  }
);

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const login = async (email, password) => {
    try {
      const res = await api.post('/login', { email, password });
      
      const { accessToken, safeUserData } = res.data;
      
      setAccessToken(accessToken);
      setUser(safeUserData);
      setCookie('accessToken', accessToken, 30); // 30 detik
      
      // Redirect berdasarkan role
      if (safeUserData.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/home');
      }
      
      return { success: true, user: safeUserData };
    } catch (err) {
      console.error('Login error:', err.response?.data);
      return { 
        success: false, 
        error: err.response?.data?.message || 'Email atau password salah' 
      };
    }
  };

  const register = async (name, email, password, role = 'petugas') => {
    try {
      const res = await api.post('/register', { name, email, password, role });
      if (res.status === 200) {
        navigate('/login');
        return { success: true };
      }
    } catch (error) {
      console.error('Registration error:', error.response?.data);
      return {
        success: false,
        error: error.response?.data?.message || 'Registrasi gagal'
      };
    }
  };

  const logout = async () => {
    try {
      await api.delete('/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setAccessToken(null);
      setUser(null);
      clearAuthCookies();
      navigate('/login');
    }
  };

  // Initialize auth state
  useEffect(() => {
    const token = getCookie('accessToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setAccessToken(token);
        setUser({
          id: decoded.id,
          name: decoded.name,
          email: decoded.email,
          role: decoded.role || 'petugas'
        });
      } catch (error) {
        clearAuthCookies();
      }
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ 
        user,
        accessToken,
        isAuthenticated: !!accessToken,
        login, 
        register,
        logout,
        api
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => useContext(AuthContext);
export default api;