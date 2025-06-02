   import axios from 'axios';
   import { createContext, useContext, useEffect, useState } from 'react';
   import { useNavigate } from 'react-router-dom';

   const api = axios.create({
       baseURL: 'http://localhost:5000',
       withCredentials: true,
   });

   // Add a request interceptor to include the token in headers
   api.interceptors.request.use(
       (config) => {
           const token = localStorage.getItem('token');
           if (token) {
               config.headers['Authorization'] = `Bearer ${token}`;
           }
           return config;
       },
       (error) => {
           return Promise.reject(error);
       }
   );
   export default api;

   const AuthContext = createContext();

   export const AuthProvider = ({ children }) => {
       const [user, setUser ] = useState(null);
       const [token, setToken] = useState(localStorage.getItem('token'));
       const [isAuthenticated, setIsAuthenticated] = useState(false);
       const navigate = useNavigate();

       // Check if user is authenticated on initial load
       useEffect(() => {
           const verifyToken = async () => {
               if (token) {
                   try {
                       const response = await api.get('/users');
                       setIsAuthenticated(true);
                       setUser (response.data);
                   } catch (error) {
                    console.error(error);
                       logout(); // Call logout if token verification fails
                   }
               }
           };
           verifyToken();
       }, [token]);

       const login = async (email, password) => {
           try {
               const response = await api.post('/login', { email, password });
               const { accessToken, safeUserData } = response.data;
               localStorage.setItem('token', accessToken);
               setToken(accessToken);
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
               localStorage.removeItem('token');
               setToken(null);
               setUser (null);
               setIsAuthenticated(false);
               navigate('/login');
           } catch (error) {
               console.error('Logout failed:', error);
           }
       };

       return (
           <AuthContext.Provider value={{ user, token, isAuthenticated, login, register, logout, api }}>
               {children}
           </AuthContext.Provider>
       );
   };

   export const useAuth = () => useContext(AuthContext);
   