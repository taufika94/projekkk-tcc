import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser ] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();

    // Check if user is authenticated on initial load
    // useEffect(() => {
      
    //     const verifyToken = async () => {
    //         if (token) {
    //             try {
    //                 const response = await axios.get('http://localhost:5000/users', {
    //                     headers: {
    //                         'Authorization': `Bearer ${token}`
    //                     }
    //                 });
    //                 setIsAuthenticated(true);
                    
    //                 setUser (response.data);
    //             } catch (error) {
                  
    //             }
    //         }
    //     };
    //     verifyToken();
    // }, [token]);

    const login = async (email, password) => {
        try {
            const response = await axios.post('http://localhost:5000/login', {
                email,
                password
            },
            {
              withCredentials: true, // penting agar cookie terkirim
            });
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
            await axios.post('http://localhost:5000/register', {
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

    // In your AuthContext.js
  const logout = async () => {
    console.log("click");
    
      try {
          const response = await axios.delete('http://localhost:5000/logout', {
              withCredentials: true
          });
          console.log(response);
          
          if (response.status === 200) {
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
            setIsAuthenticated(false);
            navigate('/login');
          }
          
      } catch (error) {
          console.error('Logout failed:', error);
      }
  };

  // Add logout to the AuthContext.Provider value
  return (
      <AuthContext.Provider value={{ user, token, isAuthenticated, login, register, logout, api }}>
          {children}
      </AuthContext.Provider>
  );


    
};

export const useAuth = () => useContext(AuthContext);
