import { Link, useNavigate, useLocation } from "react-router-dom";
import { getCurrentUser, logout } from "../services/auth";
import { useEffect, useState } from "react";

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        setUser(getCurrentUser());
    }, [location]);

    // Close menu on route change
    useEffect(() => {
        setMenuOpen(false);
    }, [location]);

    const handleLogout = () => {
        logout();
        setUser(null);
        navigate("/login");
    };

    return (
        <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-40 backdrop-blur-md bg-opacity-80">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">

                {/* Logo */}
                <Link
                    to="/"
                    className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent transform hover:scale-105 transition"
                >
                    🚀 CryptoTracker
                </Link>

                {/* Desktop Nav Links - center */}
                <div className="hidden md:flex items-center space-x-8">
                    <NavLink to="/" label="Home" active={location.pathname === "/"} />
                    <NavLink to="/dashboard" label="Dashboard" active={location.pathname === "/dashboard"} />
                    <NavLink to="/watchlist" label="Watchlist" active={location.pathname === "/watchlist"} />
                </div>

                {/* Desktop Auth - right */}
                <div className="hidden md:flex items-center gap-4">
                    {user ? (
                        <>
                            <span className="text-gray-400 text-sm">
                                Hello, <span className="text-white font-bold">{user.username}</span>
                            </span>
                            <button
                                onClick={handleLogout}
                                className="text-sm bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition border border-gray-700 hover:border-gray-500"
                            >
                                Log Out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-gray-400 hover:text-white text-sm font-medium transition">
                                Log In
                            </Link>
                            <Link to="/signup" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full text-sm font-bold shadow-lg shadow-blue-900/20 transition transform hover:-translate-y-0.5">
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Hamburger Button */}
                <button
                    className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5"
                    onClick={() => setMenuOpen(!menuOpen)}
                    aria-label="Toggle menu"
                >
                    <span className={`block w-6 h-0.5 bg-gray-300 transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
                    <span className={`block w-6 h-0.5 bg-gray-300 transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
                    <span className={`block w-6 h-0.5 bg-gray-300 transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
                </button>
            </div>

            {/* Mobile Dropdown Menu */}
            {menuOpen && (
                <div className="md:hidden bg-gray-900 border-t border-gray-800 px-4 py-4 flex flex-col gap-4">

                    {/* User greeting on mobile */}
                    {user && (
                        <div className="text-gray-400 text-sm pb-2 border-b border-gray-800">
                            Hello, <span className="text-white font-bold">{user.username}</span>
                        </div>
                    )}

                    {/* Nav Links */}
                    <NavLink to="/" label="Home" active={location.pathname === "/"} />
                    <NavLink to="/dashboard" label="Dashboard" active={location.pathname === "/dashboard"} />
                    <NavLink to="/watchlist" label="Watchlist" active={location.pathname === "/watchlist"} />

                    {/* Auth Buttons */}
                    <div className="flex flex-col gap-3 pt-2 border-t border-gray-800">
                        {user ? (
                            <button
                                onClick={handleLogout}
                                className="w-full text-sm bg-gray-800 hover:bg-gray-700 text-white px-4 py-2.5 rounded-lg transition border border-gray-700"
                            >
                                Log Out
                            </button>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="w-full text-center text-sm text-gray-400 hover:text-white border border-gray-700 px-4 py-2.5 rounded-lg transition"
                                >
                                    Log In
                                </Link>
                                <Link
                                    to="/signup"
                                    className="w-full text-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-full text-sm font-bold transition"
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

const NavLink = ({ to, label, active }) => (
    <Link
        to={to}
        className={`text-sm font-medium transition-colors duration-300 ${active ? "text-blue-400" : "text-gray-400 hover:text-white"}`}
    >
        {label}
    </Link>
);

export default Navbar;