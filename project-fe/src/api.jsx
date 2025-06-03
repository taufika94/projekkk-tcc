import axios from 'axios';
import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as jwtDecode from 'jwt-decode';
import PropTypes from 'prop-types';
import Cookies from 'js-cookie';

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

export default api;

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser ] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();

    // Cek apakah pengguna terautentikasi saat memuat awal
    useEffect(() => {
        const token = Cookies.get('token'); // Ambil token dari cookies
        if (token) {
            const decodedToken = jwtDecode(token); // Dekode token
            const currentTime = Date.now() / 1000; // Waktu saat ini dalam detik

            // Cek apakah token masih valid
            if (decodedToken.exp > currentTime) {
                setIsAuthenticated(true);
                setUser (decodedToken); // Simpan data pengguna dari token
            } else {
                Cookies.remove('token'); // Hapus token jika sudah kedaluwarsa
            }
        }
    }, []);

    const login = async (email, password) => {
    try {
        const response = await axios.post(`${BASE_API}/login`, { // Menggunakan BASE_API
            email,
            password
        }, {
            withCredentials: true,
        });
        const { accessToken, safeUserData } = response.data;
        Cookies.set('token', accessToken, { expires: 1 });
        setUser (safeUserData);
        setIsAuthenticated(true);
        navigate('/home');
    } catch (error) {
        console.error('Login failed:', error);
        throw error;
    }
};

    const register = async (name, email, password) => {
    try {
        await axios.post(`${BASE_API}/register`, { // Menggunakan BASE_API
            name,
            email,
            password
        });
        navigate('/login');
    } catch (error) {
        console.error('Registration failed:', error);
        throw error;
    }
};

    const logout = async () => {
        try {
            await axios.delete(`${BASE_API}/logout`, {
                withCredentials: true
            });
            Cookies.remove('token'); // Hapus token dari cookies
            setUser (null);
            setIsAuthenticated(false);
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout, api }}>
            {children}
        </AuthContext.Provider>
    );
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export const useAuth = () => useContext(AuthContext);
