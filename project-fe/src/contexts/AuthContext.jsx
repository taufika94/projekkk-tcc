import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie'; // Import the cookie library

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser ] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();

    // Check if user is authenticated on initial load
    useEffect(() => {
        const verifyToken = async () => {
            const token = Cookies.get('token'); // Get token from cookies
            if (token) {
                try {
                    const response = await axios.get('https://be-rest-928661779459.us-central1.run.app0/users', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    setIsAuthenticated(true);
                    setUser (response.data);
                } catch (error) {
                    logout(); // Call logout if token verification fails
                }
            }
        };
        verifyToken();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await axios.post('https://be-rest-928661779459.us-central1.run.app/login', {
                email,
                password
            });
            const { accessToken, safeUserData } = response.data;
            Cookies.set('token', accessToken, { expires: 1 }); // Set token in cookies
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
            await axios.post('https://be-rest-928661779459.us-central1.run.app/register', {
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
            await axios.delete('https://be-rest-928661779459.us-central1.run.app/logout', {
                withCredentials: true // Ensure cookies are sent
            });
            Cookies.remove('token'); // Remove token from cookies
            setUser (null);
            setIsAuthenticated(false);
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
