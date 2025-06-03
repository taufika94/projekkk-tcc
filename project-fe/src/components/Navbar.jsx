import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Determine if we need to show the back button
    const showBackButton = !['/home', '/login', '/register'].includes(location.pathname);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-gray-800 shadow-lg navbar"> {/* Added 'navbar' class */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 navbar-container"> {/* Added 'navbar-container' class */}
                <div className="flex items-center">
                    {showBackButton && (
                        <button 
                            onClick={() => navigate(-1)}
                            className="navbar-back-btn" // Applied custom class
                            aria-label="Back"
                        >
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                className="h-6 w-6" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M10 19l-7-7m0 0l7-7m-7 7h18" 
                                />
                            </svg>
                        </button>
                    )}
                    
                    <div className="flex-shrink-0">
                        <span className="text-white font-bold navbar-brand">Weapon Management</span> {/* Added navbar-brand for consistent styling */}
                    </div>
                </div>
                
                {user && (
                    <div className="flex items-center">
                        <span className="text-gray-300 mr-4 hidden md:block">
                            Logged in as: <span className="font-medium">{user.name}</span>
                        </span>
                        <button
                            onClick={handleLogout}
                            className="navbar-logout-btn" // Applied custom class
                        >
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                className="h-5 w-5 mr-1" 
                                viewBox="0 0 20 20" 
                                fill="currentColor"
                            >
                                <path 
                                    fillRule="evenodd" 
                                    d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" 
                                    clipRule="evenodd" 
                                />
                            </svg>
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;