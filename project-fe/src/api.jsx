import axios from 'axios';
import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import jwtDecode from 'jwt-decode';
import PropTypes from 'prop-types';

const BASE_URL = 'https://be-rest-928661779459.us-central1.run.app';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Add a request interceptor to include the token in headers
api.interceptors.request.use(async (config) => {
  let token = Cookies.get('accessToken') || localStorage.getItem('accessToken');
  
  if (token) {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      if (decoded.exp < currentTime) {
        const response = await axios.get(`${BASE_URL}/token`, {
          withCredentials: true
        });
        token = response.data.accessToken;
        Cookies.set('accessToken', token, { secure: true, sameSite: 'Strict' });
        localStorage.setItem('accessToken', token);
      }

      config.headers.Authorization = `Bearer ${token}`;
    } catch (error) {
      Cookies.remove('accessToken');
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
      return Promise.reject(error);
    }
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response interceptor: handle 401
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
        Cookies.set('accessToken', newToken, { secure: true, sameSite: 'Strict' });
        localStorage.setItem('accessToken', newToken);
        
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        Cookies.remove('accessToken');
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(
    Cookies.get('accessToken') || localStorage.getItem('accessToken') || null
  );
  const navigate = useNavigate();

  const login = async (username, password) => {
    try {
      const res = await api.post('/login', { username, password });
      setAccessToken(res.data.accessToken);

      // Simpan token di Cookies dan localStorage
      Cookies.set('accessToken', res.data.accessToken, {
        secure: true,
        sameSite: 'Strict',
        expires: 1, // 1 hari
      });
      localStorage.setItem('accessToken', res.data.accessToken);

      // Simpan refresh token di cookie
      Cookies.set('refreshToken', res.data.refreshToken, {
        secure: true,
        sameSite: 'Strict',
        expires: 5, // 5 hari
      });

      navigate('/home');
      return true;
    } catch (err) {
      console.error('Login failed:', err);
      return false;
    }
  };

  const logout = () => {
    setAccessToken(null);
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    localStorage.removeItem('accessToken');
    navigate('/login');
  };

  const refreshAccessToken = async () => {
    try {
      const res = await api.get('/token');
      const newToken = res.data.accessToken;
      setAccessToken(newToken);
      Cookies.set('accessToken', newToken, { secure: true, sameSite: 'Strict' });
      localStorage.setItem('accessToken', newToken);
      return newToken;
    } catch (err) {
      console.error('Token refresh failed:', err);
      logout();
      return null;
    }
  };

  // Verifikasi token saat komponen mount
  useEffect(() => {
    const verifyToken = async () => {
      if (accessToken) {
        try {
          await api.get('/users/me');
        } catch (error) {
          console.error('Token verification failed:', error);
          logout();
        }
      }
    };
    verifyToken();
  }, [accessToken]);

  return (
    <AuthContext.Provider
      value={{ 
        accessToken, 
        isAuthenticated: !!accessToken,
        login, 
        logout, 
        refreshAccessToken,
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