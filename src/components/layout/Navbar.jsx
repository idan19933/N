import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import useAuthStore from '../../store/authStore';
import NotificationBell from '../common/NotificationBell';
import { Menu, X, User, LogOut, LayoutDashboard, Users, Moon, Sun, BookOpen, ArrowLeft, ChevronLeft } from 'lucide-react';

const Navbar = () => {
    const { user, isAuthenticated, isAdmin, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Check if we should show the back button (not on home page)
    const showBackButton = location.pathname !== '/';

    useEffect(() => {
        const saved = localStorage.getItem('theme');
        if (saved === 'dark') {
            setIsDark(true);
            document.documentElement.classList.add('dark');
        }

        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleTheme = () => {
        setIsDark(!isDark);
        if (!isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
        setIsMenuOpen(false);
    };

    const handleBack = () => {
        if (window.history.length > 1) {
            navigate(-1);
        } else {
            navigate('/');
        }
    };

    return (
        <nav
            className={`sticky top-0 z-50 transition-all duration-300 ${
                scrolled
                    ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-lg'
                    : 'bg-white dark:bg-gray-900 shadow-md'
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Right Side: Back Button + Logo */}
                    <div className="flex items-center gap-3">
                        {/* Back Button - Animated */}
                        {showBackButton && (
                            <button
                                onClick={handleBack}
                                className="group flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-700 hover:from-indigo-500 hover:to-purple-500 rounded-lg transition-all duration-300 shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-600"
                                aria-label="חזור"
                            >
                                <ChevronLeft
                                    size={20}
                                    className="text-gray-700 dark:text-gray-300 group-hover:text-white transition-all duration-300 group-hover:-translate-x-1"
                                />
                                <span className="hidden sm:block text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-white transition-colors duration-300">
                                    חזור
                                </span>
                            </button>
                        )}

                        {/* Logo - Enhanced with circular design */}
                        <Link to="/" className="flex items-center group">
                            <div className="relative">
                                {/* Glow effect on hover */}
                                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>

                                {/* Circular container for logo */}
                                <div className="relative bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-full p-[3px] shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                                    <div className="bg-white dark:bg-gray-800 rounded-full p-2 sm:p-2.5">
                                        <img
                                            src="/logo.png"
                                            alt="Nexon Education"
                                            className="h-8 sm:h-10 w-8 sm:w-10 object-contain group-hover:scale-110 transition-transform duration-300"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                const fallback = document.createElement('div');
                                                fallback.className = 'h-8 sm:h-10 w-8 sm:w-10 flex items-center justify-center';
                                                fallback.innerHTML = '<span class="text-xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">N</span>';
                                                e.target.parentElement.appendChild(fallback);
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Brand name - hidden on mobile */}
                            <span className="hidden sm:block mr-3 text-xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
                                NEXON
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-2 lg:gap-4">
                        <Link
                            to="/courses"
                            className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 rounded-lg font-medium transition-all duration-300 group"
                        >
                            <BookOpen size={18} className="group-hover:rotate-12 transition-transform" />
                            כל הקורסים
                        </Link>

                        {isAuthenticated ? (
                            <>
                                {!isAdmin && (
                                    <>
                                        <Link
                                            to="/my-courses"
                                            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 rounded-lg font-medium transition-all duration-300"
                                        >
                                            הקורסים שלי
                                        </Link>

                                        <Link
                                            to="/dashboard"
                                            className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-pink-600 hover:to-rose-600 rounded-lg font-medium transition-all duration-300"
                                        >
                                            <User size={18} />
                                            איזור אישי
                                        </Link>
                                    </>
                                )}

                                {isAdmin && (
                                    <>
                                        <Link
                                            to="/admin"
                                            className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 rounded-lg font-medium transition-all duration-300"
                                        >
                                            <LayoutDashboard size={18} />
                                            ניהול קורסים
                                        </Link>
                                        <Link
                                            to="/admin/users"
                                            className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 rounded-lg font-medium transition-all duration-300"
                                        >
                                            <Users size={18} />
                                            ניהול משתמשים
                                        </Link>
                                    </>
                                )}

                                <div className="flex items-center gap-2 mr-2">
                                    <NotificationBell />

                                    <button
                                        onClick={toggleTheme}
                                        className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gradient-to-r hover:from-yellow-400 hover:to-orange-400 hover:shadow-lg transition-all duration-300 group"
                                    >
                                        {isDark ? (
                                            <Sun size={20} className="text-yellow-500 group-hover:text-white group-hover:rotate-180 transition-transform duration-500" />
                                        ) : (
                                            <Moon size={20} className="text-gray-700 group-hover:text-white group-hover:-rotate-12 transition-transform duration-300" />
                                        )}
                                    </button>
                                </div>

                                <div className="flex items-center gap-3 mr-2 pr-3 border-r-2 border-gray-200 dark:border-gray-700">
                                    <div className="hidden lg:flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                            {user?.email?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">
                                            {user?.email?.split('@')[0]}
                                        </span>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 hover:shadow-lg transition-all duration-300 font-medium"
                                    >
                                        <LogOut size={18} />
                                        <span className="hidden lg:inline">התנתק</span>
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={toggleTheme}
                                    className="p-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gradient-to-r hover:from-yellow-400 hover:to-orange-400 hover:shadow-lg transition-all duration-300 group"
                                >
                                    {isDark ? (
                                        <Sun size={20} className="text-yellow-500 group-hover:text-white group-hover:rotate-180 transition-transform duration-500" />
                                    ) : (
                                        <Moon size={20} className="text-gray-700 group-hover:text-white group-hover:-rotate-12 transition-transform duration-300" />
                                    )}
                                </button>

                                <div className="flex items-center gap-3 mr-2">
                                    <Link
                                        to="/login"
                                        className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors"
                                    >
                                        התחבר
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300 font-bold"
                                    >
                                        הירשם עכשיו
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-2">
                        {isAuthenticated && <NotificationBell />}

                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        >
                            {isDark ? (
                                <Sun size={20} className="text-yellow-500" />
                            ) : (
                                <Moon size={20} className="text-gray-700" />
                            )}
                        </button>

                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            {isMenuOpen ? (
                                <X size={24} className="text-gray-700 dark:text-gray-300" />
                            ) : (
                                <Menu size={24} className="text-gray-700 dark:text-gray-300" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden pb-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex flex-col space-y-2 pt-4">
                            {/* Back Button in Mobile Menu */}
                            {showBackButton && (
                                <button
                                    onClick={() => {
                                        handleBack();
                                        setIsMenuOpen(false);
                                    }}
                                    className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-gray-600 hover:to-gray-700 font-medium py-3 px-4 rounded-lg transition-all border border-gray-200 dark:border-gray-700"
                                >
                                    <ChevronLeft size={18} />
                                    חזור לדף הקודם
                                </button>
                            )}

                            <Link
                                to="/courses"
                                className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 font-medium py-3 px-4 rounded-lg transition-all"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <BookOpen size={18} />
                                כל הקורסים
                            </Link>

                            {isAuthenticated ? (
                                <>
                                    {!isAdmin && (
                                        <>
                                            <Link
                                                to="/my-courses"
                                                className="text-gray-700 dark:text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 font-medium py-3 px-4 rounded-lg transition-all"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                הקורסים שלי
                                            </Link>

                                            <Link
                                                to="/dashboard"
                                                className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-pink-600 hover:to-rose-600 font-medium py-3 px-4 rounded-lg transition-all"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                <User size={18} />
                                                איזור אישי
                                            </Link>
                                        </>
                                    )}

                                    {isAdmin && (
                                        <>
                                            <Link
                                                to="/admin"
                                                className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 font-medium py-3 px-4 rounded-lg transition-all"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                <LayoutDashboard size={18} />
                                                ניהול קורסים
                                            </Link>
                                            <Link
                                                to="/admin/users"
                                                className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 font-medium py-3 px-4 rounded-lg transition-all"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                <Users size={18} />
                                                ניהול משתמשים
                                            </Link>
                                        </>
                                    )}

                                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700 mt-2">
                                        <div className="flex items-center gap-3 mb-3 px-4 py-2">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg">
                                                {user?.email?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-gray-700 dark:text-gray-300 font-bold text-sm">
                                                    {user?.email?.split('@')[0]}
                                                </p>
                                                <p className="text-gray-500 dark:text-gray-400 text-xs">
                                                    {user?.email}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all font-medium"
                                        >
                                            <LogOut size={18} />
                                            התנתק
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col gap-2 pt-3 border-t border-gray-200 dark:border-gray-700 mt-2">
                                    <Link
                                        to="/login"
                                        className="text-center py-3 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        התחבר
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="text-center px-4 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all font-bold"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        הירשם עכשיו
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;