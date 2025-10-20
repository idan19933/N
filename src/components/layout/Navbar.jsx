import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import useAuthStore from '../../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';

import NotificationBell from '../common/NotificationBell';
import { Menu, X, User, LogOut, LayoutDashboard, Users, Moon, Sun, ChevronLeft, Brain, Sparkles, BookOpen } from 'lucide-react';

const Navbar = () => {
    const { user, isAuthenticated, isAdmin, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Check if we should show the back button (not on home or dashboard)
    const showBackButton = location.pathname !== '/' && location.pathname !== '/dashboard';

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
            navigate('/dashboard');
        }
    };

    return (
        <nav
            className={`sticky top-0 z-50 transition-all duration-300 ${
                scrolled
                    ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-2xl border-b border-purple-200/30 dark:border-purple-800/30'
                    : 'bg-gradient-to-r from-white via-purple-50/30 to-pink-50/30 dark:from-gray-900 dark:via-purple-900/10 dark:to-pink-900/10 shadow-lg'
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Right Side: Back Button + Logo */}
                    <div className="flex items-center gap-3">
                        {/* Back Button - Modern Gradient Style */}
                        {showBackButton && (
                            <motion.button
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                onClick={handleBack}
                                className="group flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 hover:from-purple-500 hover:to-pink-500 rounded-2xl transition-all duration-300 shadow-md hover:shadow-xl border-2 border-purple-200 dark:border-purple-700 hover:border-transparent"
                            >
                                <ChevronLeft
                                    size={20}
                                    className="text-purple-700 dark:text-purple-300 group-hover:text-white transition-all duration-300 group-hover:-translate-x-1"
                                />
                                <span className="hidden sm:block text-sm font-bold text-purple-700 dark:text-purple-300 group-hover:text-white transition-colors duration-300">
                                    חזור
                                </span>
                            </motion.button>
                        )}

                        {/* Logo - Enhanced Modern Design */}
                        <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center group relative">
                            {/* Animated glow effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500"></div>

                            {/* Logo container with gradient border */}
                            <div className="relative bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-2xl p-[2px] shadow-xl group-hover:shadow-2xl transition-all duration-300">
                                <div className="bg-white dark:bg-gray-800 rounded-2xl p-2.5 sm:p-3 flex items-center gap-3">
                                    {/* Brain icon instead of logo image */}
                                    <div className="relative">
                                        <Brain className="h-8 w-8 sm:h-10 sm:w-10 text-transparent bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600 bg-clip-text group-hover:scale-110 transition-transform duration-300" style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }} />
                                        <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-yellow-400 group-hover:rotate-12 transition-transform duration-300" />
                                    </div>

                                    {/* Brand name */}
                                    <div className="hidden sm:flex flex-col">
                                        <span className="text-2xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
                                            NEXON
                                        </span>
                                        <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 -mt-1">
                                            AI Math Tutor
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-3">
                        {isAuthenticated ? (
                            <>
                                {!isAdmin && (
                                    <>
                                        {/* Dashboard/Learning Area Button */}
                                        <Link
                                            to="/dashboard"
                                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 hover:from-purple-600 hover:to-pink-600 text-purple-700 dark:text-purple-300 hover:text-white rounded-2xl font-bold transition-all duration-300 shadow-md hover:shadow-xl border-2 border-purple-200 dark:border-purple-700 hover:border-transparent"
                                        >
                                            <BookOpen size={18} />
                                            <span className="hidden lg:inline">איזור למידה</span>
                                        </Link>
                                    </>
                                )}

                                {isAdmin && (
                                    <>
                                        <Link
                                            to="/admin"
                                            className="flex items-center gap-2 px-5 py-2.5 text-gray-700 dark:text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 rounded-2xl font-bold transition-all duration-300 shadow-md hover:shadow-xl"
                                        >
                                            <LayoutDashboard size={18} />
                                            <span className="hidden lg:inline">ניהול</span>
                                        </Link>
                                        <Link
                                            to="/admin/users"
                                            className="flex items-center gap-2 px-5 py-2.5 text-gray-700 dark:text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 rounded-2xl font-bold transition-all duration-300 shadow-md hover:shadow-xl"
                                        >
                                            <Users size={18} />
                                            <span className="hidden lg:inline">משתמשים</span>
                                        </Link>
                                    </>
                                )}

                                {/* Theme Toggle + Notifications */}
                                <div className="flex items-center gap-2 mr-2">
                                    <NotificationBell />

                                    <button
                                        onClick={toggleTheme}
                                        className="p-3 rounded-2xl bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-gray-800 dark:to-gray-700 hover:shadow-xl transition-all duration-300 group border-2 border-yellow-200 dark:border-gray-600"
                                    >
                                        {isDark ? (
                                            <Sun size={20} className="text-yellow-500 group-hover:text-yellow-400 group-hover:rotate-180 transition-all duration-500" />
                                        ) : (
                                            <Moon size={20} className="text-gray-700 group-hover:text-gray-900 group-hover:-rotate-12 transition-all duration-300" />
                                        )}
                                    </button>
                                </div>

                                {/* User Menu */}
                                <div className="flex items-center gap-3 mr-2 pr-4 border-r-2 border-purple-200 dark:border-purple-700">
                                    <div className="hidden lg:flex items-center gap-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 px-4 py-2 rounded-2xl border-2 border-purple-200 dark:border-purple-700">
                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center text-white font-black text-lg shadow-lg">
                                            {user?.email?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                        <span className="text-gray-800 dark:text-gray-200 font-bold text-sm">
                                            {user?.email?.split('@')[0]}
                                        </span>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl hover:from-red-600 hover:to-red-700 hover:shadow-xl transition-all duration-300 font-bold shadow-md"
                                    >
                                        <LogOut size={18} />
                                        <span className="hidden lg:inline">יציאה</span>
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                {/* Theme Toggle (Not Authenticated) */}
                                <button
                                    onClick={toggleTheme}
                                    className="p-3 rounded-2xl bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-gray-800 dark:to-gray-700 hover:shadow-xl transition-all duration-300 group border-2 border-yellow-200 dark:border-gray-600"
                                >
                                    {isDark ? (
                                        <Sun size={20} className="text-yellow-500 group-hover:rotate-180 transition-transform duration-500" />
                                    ) : (
                                        <Moon size={20} className="text-gray-700 group-hover:-rotate-12 transition-transform duration-300" />
                                    )}
                                </button>

                                {/* Auth Buttons */}
                                <div className="flex items-center gap-3 mr-2">
                                    <Link
                                        to="/login"
                                        className="px-5 py-2.5 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-bold transition-colors rounded-2xl hover:bg-purple-50 dark:hover:bg-purple-900/20"
                                    >
                                        התחבר
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="px-6 py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white rounded-2xl hover:shadow-2xl hover:scale-105 transition-all duration-300 font-black shadow-lg"
                                    >
                                        הצטרף עכשיו
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
                            className="p-2.5 rounded-xl bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-gray-800 dark:to-gray-700 transition-colors border-2 border-yellow-200 dark:border-gray-600"
                        >
                            {isDark ? (
                                <Sun size={20} className="text-yellow-500" />
                            ) : (
                                <Moon size={20} className="text-gray-700" />
                            )}
                        </button>

                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2.5 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors border-2 border-transparent hover:border-purple-300 dark:hover:border-purple-700"
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
                    <div className="md:hidden pb-4 bg-gradient-to-b from-purple-50/50 to-pink-50/50 dark:from-gray-900 dark:to-gray-800 border-t-2 border-purple-200 dark:border-purple-800 rounded-b-3xl">
                        <div className="flex flex-col space-y-2 pt-4">
                            {/* Back Button in Mobile Menu */}
                            {showBackButton && (
                                <button
                                    onClick={() => {
                                        handleBack();
                                        setIsMenuOpen(false);
                                    }}
                                    className="flex items-center gap-2 text-purple-700 dark:text-purple-300 hover:text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 font-bold py-3 px-4 rounded-2xl transition-all border-2 border-purple-200 dark:border-purple-700 shadow-md"
                                >
                                    <ChevronLeft size={18} />
                                    חזור לדף הקודם
                                </button>
                            )}

                            {isAuthenticated ? (
                                <>
                                    {!isAdmin && (
                                        <>
                                            <Link
                                                to="/dashboard"
                                                className="flex items-center gap-2 text-purple-700 dark:text-purple-300 hover:text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 font-bold py-3 px-4 rounded-2xl transition-all border-2 border-purple-200 dark:border-purple-700 shadow-md"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                <BookOpen size={18} />
                                                איזור למידה
                                            </Link>
                                        </>
                                    )}

                                    {isAdmin && (
                                        <>
                                            <Link
                                                to="/admin"
                                                className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 font-bold py-3 px-4 rounded-2xl transition-all shadow-md"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                <LayoutDashboard size={18} />
                                                ניהול קורסים
                                            </Link>
                                            <Link
                                                to="/admin/users"
                                                className="flex items-center gap-2 text-gray-700 dark:text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 font-bold py-3 px-4 rounded-2xl transition-all shadow-md"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                <Users size={18} />
                                                ניהול משתמשים
                                            </Link>
                                        </>
                                    )}

                                    {/* User Info + Logout */}
                                    <div className="pt-3 border-t-2 border-purple-200 dark:border-purple-700 mt-2">
                                        <div className="flex items-center gap-3 mb-3 px-4 py-3 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-2xl border-2 border-purple-200 dark:border-purple-700">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center text-white font-black text-lg shadow-lg">
                                                {user?.email?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-gray-800 dark:text-gray-200 font-black text-sm">
                                                    {user?.email?.split('@')[0]}
                                                </p>
                                                <p className="text-gray-600 dark:text-gray-400 text-xs">
                                                    {user?.email}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl hover:from-red-600 hover:to-red-700 transition-all font-black shadow-lg"
                                        >
                                            <LogOut size={18} />
                                            התנתק
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col gap-2 pt-3 border-t-2 border-purple-200 dark:border-purple-700 mt-2">
                                    <Link
                                        to="/login"
                                        className="text-center py-3 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 font-bold rounded-2xl hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors border-2 border-transparent hover:border-purple-200 dark:hover:border-purple-700"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        התחבר
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="text-center px-4 py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white rounded-2xl hover:shadow-2xl transition-all font-black shadow-lg"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        הצטרף עכשיו
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