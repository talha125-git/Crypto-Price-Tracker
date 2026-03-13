import { Link, useNavigate, useLocation } from "react-router-dom";
import { getCurrentUser, logout } from "../services/auth";
import { useEffect, useState } from "react";

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);

    // Check user status on route change (simple way to update navbar)
    useEffect(() => {
        setUser(getCurrentUser());
    }, [location]);

    const handleLogout = () => {
        logout();
        setUser(null);
        navigate("/login");
    };

    return (
        <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-40 backdrop-blur-md bg-opacity-80">
            <div className="container mx-auto px-4 h-16 grid grid-cols-2 md:grid-cols-3 items-center">
                {/* 1. Logo (Left) */}
                <div className="flex justify-start">
                    <Link to="/" className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent transform hover:scale-105 transition">
                        🚀 CryptoTracker
                    </Link>
                </div>

                {/* 2. Navigation Links (Center) - Hidden on mobile, centered on desktop */}
                <div className="hidden md:flex justify-center items-center space-x-8">
                    <NavLink to="/" label="Home" active={location.pathname === "/"} />
                    <NavLink to="/dashboard" label="Dashboard" active={location.pathname === "/dashboard"} />
                    <NavLink to="/watchlist" label="Watchlist" active={location.pathname === "/watchlist"} />
                </div>

                {/* 3. Auth Buttons (Right) */}
                <div className="flex justify-end items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-3 md:gap-4">
                            <span className="text-gray-400 hidden lg:block text-sm">
                                Hello, <span className="text-white font-bold">{user.username}</span>
                            </span>
                            <button
                                onClick={handleLogout}
                                className="text-xs md:text-sm bg-gray-800 hover:bg-gray-700 text-white px-3 md:px-4 py-2 rounded-lg transition border border-gray-800 hover:border-gray-600"
                            >
                                Log Out
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link to="/login" className="text-gray-400 hover:text-white text-sm font-medium transition">
                                Log In
                            </Link>
                            <Link to="/signup" className="hidden sm:block bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-5 py-2 rounded-full text-sm font-bold shadow-lg shadow-blue-900/20 transition transform hover:-translate-y-0.5">
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

const NavLink = ({ to, label, active }) => (
    <Link
        to={to}
        className={`text-sm font-medium transition-colors duration-300 ${active ? "text-blue-400" : "text-gray-400 hover:text-white"
            }`}
    >
        {label}
    </Link>
);

export default Navbar;
