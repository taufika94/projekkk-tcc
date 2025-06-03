import axios from 'axios';
import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as jwtDecode from 'jwt-decode';
import PropTypes from 'prop-types';

const BASE_URL = 'https://be-rest-928661779459.us-central1.run.app';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Add a request interceptor to include the token in headers
api.interceptors.request.use(async (config) => {
  // Get token from cookies
  const token = document.cookie.split('; ').find(row => row.startsWith('accessToken='))?.split('=')[1];
  
  if (token) {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      if (decoded.exp < currentTime) {
        // Token expired, try to refresh
        const response = await axios.get(`${BASE_URL}/token`, {
          withCredentials: true
        });
        const newToken = response.data.accessToken;
        // Set new token in cookie
        document.cookie = `accessToken=${newToken}; path=/; secure; sameSite=Strict; max-age=${60 * 60 * 24}`; // 1 day
        config.headers.Authorization = `Bearer ${newToken}`;
        return config;
      }

      config.headers.Authorization = `Bearer ${token}`;
    } catch (error) {
      // Clear token on error
      document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
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
        document.cookie = `accessToken=${newToken}; path=/; secure; sameSite=Strict; max-age=${60 * 60 * 24}`;
        
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
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
    document.cookie.split('; ').find(row => row.startsWith('accessToken='))?.split('=')[1] || null
  );
  const navigate = useNavigate();

  

  const login = async (email, password) => {
    try {
      const res = await api.post('/login', { email, password });
      
      // Sesuai dengan response dari backend
      const { accessToken, safeUserData } = res.data;
      
      setAccessToken(accessToken);
      setUser(safeUserData);
      document.cookie = `accessToken=${accessToken}; path=/; secure; sameSite=Strict; max-age=30`;
      
      navigate('/home');
      return { success: true, user: safeUserData };
    } catch (err) {
      console.error('Login failed:', err);
      return { success: false, error: err.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (name, email, password) => {
    try {
      await api.post('/register', { name, email, password });
      navigate('/login');
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await api.delete('/logout');
    } catch (err) {
      console.error('Logout API error:', err);
    } finally {
      setAccessToken(null);
      // Clear all auth cookies
      document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      navigate('/login');
    }
  };

  const refreshAccessToken = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/token`, {
        withCredentials: true,
      });
      const accessToken = response.data.accessToken;
      document.cookie = `accessToken=${accessToken}; path=/; secure; sameSite=Strict; max-age=${60 * 60 * 24}`;
      const decoded = jwtDecode(accessToken);
      setAccessToken(accessToken);
      return { accessToken, decoded };
    } catch (error) {
      logout();
      throw error;
    }
  };

  // Verify token on component mount
  useEffect(() => {
    const verifyToken = async () => {
      if (accessToken) {
        try {
          await api.get('/users');
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
        register,
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