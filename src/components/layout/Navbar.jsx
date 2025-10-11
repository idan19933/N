import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import useAuthStore from '../../store/authStore';
import { Menu, X, User, LogOut, BookOpen, LayoutDashboard, Users as UsersIcon } from 'lucide-react';

const Navbar = () => {
    const { user, isAuthenticated, isAdmin, logout } = useAuthStore();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/');
        setIsMenuOpen(false);
    };

    return (
        <nav className="bg-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="flex items-center">
                        <img src="/logo.png" alt="Nexon" className="h-10 w-auto" />
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8 space-x-reverse">
                        <Link to="/courses" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">
                            כל הקורסים
                        </Link>

                        {isAuthenticated ? (
                            <>
                                {!isAdmin && (
                                    <>
                                        <Link to="/my-courses" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">
                                            הקורסים שלי
                                        </Link>

                                        <Link to="/dashboard" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors flex items-center gap-2">
                                            <User size={18} />
                                            איזור אישי
                                        </Link>
                                    </>
                                )}

                                {isAdmin && (
                                    <>
                                        <Link to="/admin" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors flex items-center gap-2">
                                            <LayoutDashboard size={18} />
                                            ניהול קורסים
                                        </Link>
                                        <Link to="/admin/users" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors flex items-center gap-2">
                                            <UsersIcon size={18} />
                                            ניהול משתמשים
                                        </Link>
                                    </>
                                )}

                                <div className="flex items-center gap-3">
                                    <span className="text-gray-700 font-medium">{user?.email}</span>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        <LogOut size={18} />
                                        התנתק
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link to="/login" className="text-gray-700 hover:text-indigo-600 font-medium transition-colors">
                                    התחבר
                                </Link>
                                <Link to="/register" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                                    הירשם
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="md:hidden p-2 rounded-lg hover:bg-gray-100"
                    >
                        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden pb-4">
                        <div className="flex flex-col space-y-3">
                            <Link
                                to="/courses"
                                className="text-gray-700 hover:text-indigo-600 font-medium py-2"
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
                                                className="text-gray-700 hover:text-indigo-600 font-medium py-2"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                הקורסים שלי
                                            </Link>

                                            <Link
                                                to="/dashboard"
                                                className="text-gray-700 hover:text-indigo-600 font-medium py-2 flex items-center gap-2"
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
                                                className="text-gray-700 hover:text-indigo-600 font-medium py-2 flex items-center gap-2"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                <LayoutDashboard size={18} />
                                                ניהול קורסים
                                            </Link>
                                            <Link
                                                to="/admin/users"
                                                className="text-gray-700 hover:text-indigo-600 font-medium py-2 flex items-center gap-2"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                <UsersIcon size={18} />
                                                ניהול משתמשים
                                            </Link>
                                        </>
                                    )}

                                    <div className="pt-3 border-t">
                                        <p className="text-gray-700 font-medium mb-3">{user?.email}</p>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                        >
                                            <LogOut size={18} />
                                            התנתק
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col gap-3 pt-3 border-t">
                                    <Link
                                        to="/login"
                                        className="text-center py-2 text-gray-700 hover:text-indigo-600 font-medium"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        התחבר
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="text-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
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