import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import useAuthStore from '../../store/authStore';
import NotificationBell from '../common/NotificationBell'; // ✅ הוסף
import { Menu, X, User, LogOut, BookOpen, LayoutDashboard, Users as UsersIcon, Moon, Sun } from 'lucide-react';

const Navbar = () => {
    const { user, isAuthenticated, isAdmin, logout } = useAuthStore();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('theme');
        if (saved === 'dark') {
            setIsDark(true);
            document.documentElement.classList.add('dark');
        }
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

    return (
        <nav className="bg-white dark:bg-gray-900 shadow-md dark:shadow-gray-700 sticky top-0 z-50 transition-colors">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="flex items-center">
                        <img src="/logo.png" alt="Nexon" className="h-10 w-auto" />
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8 space-x-reverse">
                        <Link
                            to="/courses"
                            className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors"
                        >
                            כל הקורסים
                        </Link>

                        {isAuthenticated ? (
                            <>
                                {!isAdmin && (
                                    <>
                                        <Link
                                            to="/my-courses"
                                            className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors"
                                        >
                                            הקורסים שלי
                                        </Link>

                                        <Link
                                            to="/dashboard"
                                            className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors flex items-center gap-2"
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
                                            className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors flex items-center gap-2"
                                        >
                                            <LayoutDashboard size={18} />
                                            ניהול קורסים
                                        </Link>
                                        <Link
                                            to="/admin/users"
                                            className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors flex items-center gap-2"
                                        >
                                            <UsersIcon size={18} />
                                            ניהול משתמשים
                                        </Link>
                                    </>
                                )}

                                {/* ✅ הוסף NotificationBell */}
                                <NotificationBell />

                                <button
                                    onClick={toggleTheme}
                                    className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                >
                                    {isDark ? (
                                        <Sun size={20} className="text-yellow-400" />
                                    ) : (
                                        <Moon size={20} className="text-gray-700" />
                                    )}
                                </button>

                                <div className="flex items-center gap-3">
                                    <span className="text-gray-700 dark:text-gray-300 font-medium">{user?.email}</span>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-2 px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-800 transition-colors"
                                    >
                                        <LogOut size={18} />
                                        התנתק
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={toggleTheme}
                                    className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                >
                                    {isDark ? (
                                        <Sun size={20} className="text-yellow-400" />
                                    ) : (
                                        <Moon size={20} className="text-gray-700" />
                                    )}
                                </button>

                                <div className="flex items-center gap-3">
                                    <Link
                                        to="/login"
                                        className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors"
                                    >
                                        התחבר
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
                                    >
                                        הירשם
                                    </Link>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-2">
                        {/* ✅ הוסף NotificationBell במובייל */}
                        {isAuthenticated && <NotificationBell />}

                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        >
                            {isDark ? (
                                <Sun size={20} className="text-yellow-400" />
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
                        <div className="flex flex-col space-y-3 pt-4">
                            <Link
                                to="/courses"
                                className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium py-2 px-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                כל הקורסים
                            </Link>

                            {isAuthenticated ? (
                                <>
                                    {!isAdmin && (
                                        <>
                                            <Link
                                                to="/my-courses"
                                                className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium py-2 px-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                הקורסים שלי
                                            </Link>

                                            <Link
                                                to="/dashboard"
                                                className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium py-2 px-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
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
                                                className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium py-2 px-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                <LayoutDashboard size={18} />
                                                ניהול קורסים
                                            </Link>
                                            <Link
                                                to="/admin/users"
                                                className="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium py-2 px-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                <UsersIcon size={18} />
                                                ניהול משתמשים
                                            </Link>
                                        </>
                                    )}

                                    <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                                        <p className="text-gray-700 dark:text-gray-300 font-medium mb-3 px-2">
                                            {user?.email}
                                        </p>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-800 transition-colors"
                                        >
                                            <LogOut size={18} />
                                            התנתק
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                    <Link
                                        to="/login"
                                        className="text-center py-2 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        התחבר
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="text-center px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        הירשם
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