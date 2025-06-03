import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";

const Home = () => {
    const { user } = useAuth();

    const renderLinksByRole = () => {
        if (!user) return null;

        const baseButtonClasses = "home-action-button text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md hover:shadow-lg";
        const marginClass = "mb-4 md:mb-0 md:mr-4"; // Margin bottom for mobile, right for desktop

        switch (user.role) {
            case "admin":
                return (
                    <div className="flex flex-col md:flex-row justify-center items-center">
                        <Link
                            to="/weapons"
                            className={`${baseButtonClasses} bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 ${marginClass}`}
                        >
                            <i className="fas fa-gun mr-2"></i> Manage Weapons
                        </Link>
                        <Link
                            to="/transactions"
                            className={`${baseButtonClasses} bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 ${marginClass}`}
                        >
                            <i className="fas fa-exchange-alt mr-2"></i> View Transactions
                        </Link>
                        <Link
                            to="/users"
                            className={`${baseButtonClasses} bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900`}
                        >
                            <i className="fas fa-users-cog mr-2"></i> Manage Users
                        </Link>
                    </div>
                );
            case "petugas":
                return (
                    <div className="flex flex-col md:flex-row justify-center items-center">
                        <Link
                            to="/weapons"
                            className={`${baseButtonClasses} bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 ${marginClass}`}
                        >
                            <i className="fas fa-gun mr-2"></i> Manage Weapons
                        </Link>
                        <Link
                            to="/transactions"
                            className={`${baseButtonClasses} bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900`}
                        >
                            <i className="fas fa-exchange-alt mr-2"></i> Manage Transactions
                        </Link>
                    </div>
                );
            case "pengawas":
                return (
                    <div className="flex flex-col md:flex-row justify-center items-center">
                        <Link
                            to="/weapons"
                            className={`${baseButtonClasses} bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 ${marginClass}`}
                        >
                            <i className="fas fa-gun mr-2"></i> View Weapons
                        </Link>
                        <Link
                            to="/transactions"
                            className={`${baseButtonClasses} bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900`}
                        >
                            <i className="fas fa-exchange-alt mr-2"></i> View Transactions
                        </Link>
                    </div>
                );
            default:
                return <p className="text-red-500 text-center">Unknown role</p>;
        }
    };

    return (
        <div className="min-h-screen home-container flex flex-col items-center justify-center py-10 px-4">
            <div className="home-header text-center mb-12 w-full max-w-4xl">
                <h1 className="text-5xl font-extrabold text-white mb-4 leading-tight">
                    Welcome, <span className="text-green-400">{user?.name || 'Guest'}!</span>
                </h1>
                <p className="text-xl text-gray-300 font-light">
                    Your portal to managing and overseeing critical armory operations.
                </p>
            </div>

            <div className="home-content-card w-full max-w-4xl">
                {user ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* User Information Card */}
                        <div className="home-info-card flex flex-col justify-center items-center text-center">
                            <i className="fas fa-user-circle text-6xl text-blue-400 mb-4 animate-pulse"></i>
                            <h2 className="text-3xl font-semibold text-white mb-3">User Profile</h2>
                            <p className="mt-2 text-gray-300 text-lg">Name: <span className="font-medium text-white">{user.name}</span></p>
                            <p className="text-gray-300 text-lg">Email: <span className="font-medium text-white">{user.email}</span></p>
                            <p className="text-gray-300 text-lg">Role: <span className="font-bold text-green-400 uppercase">{user.role}</span></p>
                        </div>

                        {/* Actions Card */}
                        <div className="home-actions-card flex flex-col justify-center items-center text-center">
                            <i className="fas fa-cogs text-6xl text-purple-400 mb-4 animate-spin-slow"></i>
                            <h2 className="text-3xl font-semibold text-white mb-6">Quick Actions</h2>
                            <div className="mt-6 w-full space-y-4">
                                {renderLinksByRole()}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-gray-400 text-xl py-10">
                        Please log in to view your dashboard.
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;