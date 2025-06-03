   import axios from 'axios';
   import { createContext, useContext, useEffect, useState } from 'react';
   import { useNavigate } from 'react-router-dom';
   import Cookies from "js-cookie";

   const api = axios.create({
       baseURL: 'https://be-rest-928661779459.us-central1.run.app',
       withCredentials: true,
   });

   // Add a request interceptor to include the token in headers
   api.interceptors.request.use(async (config) => {
  let token = localStorage.getItem('accessToken');
  
  if (token) {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;

    if (decoded.exp < currentTime) {
      try {
        const response = await axios.get(`${BASE_URL}/token`, {
          withCredentials: true
        });
        token = response.data.accessToken;
        localStorage.setItem('accessToken', token);
      } catch (error) {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// Middleware Response: handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(Cookies.get("accessToken") || null);

  const login = async (username, password) => {
    try {
      const res = await axios.post(`${BASE_URL}/login`, { username, password });
      setAccessToken(res.data.accessToken);

      // Simpan refresh token di cookie (default 5 hari)
      Cookies.set("refreshToken", res.data.refreshToken, {
        secure: true,
        sameSite: "Strict",
        expires: 5,
      });

      return true;
    } catch (err) {
      console.error("Login failed:", err);
      return false;
    }
  };

  const logout = () => {
    setAccessToken(null);
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
  };

  const refreshAccessToken = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/token`, {
        withCredentials: true,
      });
      setAccessToken(res.data.accessToken);
      return res.data.accessToken;
    } catch (err) {
      console.error("Token refresh failed:", err);
      logout();
      return null;
    }
  };

  // Middleware untuk memeriksa token saat aplikasi dimuat
  useEffect(() => {
    const verifyToken = async () => {
      if (accessToken) {
        try {
          await axios.get(`${BASE_URL}/users`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
        } catch (error) {
          console.error("Token verification failed:", error);
          logout();
        }
      }
    };
    verifyToken();
  }, [accessToken]);

  return (
    <AuthContext.Provider
      value={{ accessToken, login, logout, refreshAccessToken }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuthContext = () => useContext(AuthContext);
