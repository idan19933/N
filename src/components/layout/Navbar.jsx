import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, Home, GraduationCap, Crown, Sparkles, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../../store/authStore';

const Navbar = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, logout, isAdmin, isPremium } = useAuthStore();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/');
        setUserMenuOpen(false);
        setMobileMenuOpen(false);
    };

    return (
        <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-40" dir="rtl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center gap-4">
                        <Link to="/" className="flex items-center gap-3">
                            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-lg">
                                <GraduationCap className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-2xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                NEXON
                            </span>
                        </Link>

                        {/* ✅ PREMIUM BADGE - Show next to logo for premium users */}
                        {isAuthenticated && isPremium && !isAdmin && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="hidden md:flex items-center gap-1.5 bg-gradient-to-r from-yellow-400 to-orange-400 px-3 py-1.5 rounded-full shadow-lg"
                            >
                                <Crown className="w-4 h-4 text-purple-900" />
                                <span className="text-purple-900 font-black text-sm">Premium</span>
                                <Sparkles className="w-3 h-3 text-purple-900" />
                            </motion.div>
                        )}
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link
                            to="/"
                            className="text-gray-300 hover:text-white transition-colors flex items-center gap-2"
                        >
                            <Home className="w-4 h-4" />
                            <span>בית</span>
                        </Link>

                        {/* ✅ LEARNING AREA LINK - Show for all authenticated users */}
                        {isAuthenticated && !isAdmin && (
                            <Link
                                to="/dashboard"
                                className="text-gray-300 hover:text-white transition-colors flex items-center gap-2"
                            >
                                <BookOpen className="w-4 h-4" />
                                <span>איזור למידה</span>
                            </Link>
                        )}

                        {/* ✅ PLANS LINK - Only show for NON-premium users */}
                        {isAuthenticated && !isAdmin && !isPremium && (
                            <Link
                                to="/plans"
                                className="text-yellow-400 hover:text-yellow-300 font-bold transition-colors flex items-center gap-2"
                            >
                                <Crown className="w-4 h-4 animate-pulse" />
                                <span>שדרג לפרימיום</span>
                                <span className="bg-yellow-400 text-gray-900 text-xs px-2 py-0.5 rounded-full font-black">
                                    חדש!
                                </span>
                            </Link>
                        )}

                        {isAuthenticated && (
                            <div className="relative">
                                <button
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                                >
                                    <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                                        <User className="w-5 h-5 text-white" />
                                    </div>
                                </button>

                                <AnimatePresence>
                                    {userMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute left-0 mt-2 w-56 bg-gray-800 rounded-lg shadow-xl border border-gray-700 overflow-hidden"
                                        >
                                            <div className="p-3 border-b border-gray-700">
                                                <p className="text-white font-bold text-sm">
                                                    {user?.displayName || user?.email}
                                                </p>
                                                {isPremium && (
                                                    <div className="flex items-center gap-1.5 mt-2 bg-gradient-to-r from-yellow-400 to-orange-400 px-2 py-1 rounded-full w-fit">
                                                        <Crown className="w-3 h-3 text-purple-900" />
                                                        <span className="text-purple-900 font-black text-xs">Premium</span>
                                                    </div>
                                                )}
                                            </div>

                                            {isAdmin && (
                                                <Link
                                                    to="/admin"
                                                    className="block px-4 py-2 text-gray-300 hover:bg-gray-700 transition-colors"
                                                    onClick={() => setUserMenuOpen(false)}
                                                >
                                                    ניהול מערכת
                                                </Link>
                                            )}

                                            <Link
                                                to="/dashboard"
                                                className="block px-4 py-2 text-gray-300 hover:bg-gray-700 transition-colors"
                                                onClick={() => setUserMenuOpen(false)}
                                            >
                                                דשבורד
                                            </Link>

                                            <Link
                                                to="/notebook"
                                                className="block px-4 py-2 text-gray-300 hover:bg-gray-700 transition-colors"
                                                onClick={() => setUserMenuOpen(false)}
                                            >
                                                המחברת שלי
                                            </Link>

                                            {!isPremium && (
                                                <Link
                                                    to="/plans"
                                                    className="block px-4 py-2 text-yellow-400 hover:bg-gray-700 transition-colors font-bold"
                                                    onClick={() => setUserMenuOpen(false)}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <Crown className="w-4 h-4" />
                                                        <span>שדרג לפרימיום</span>
                                                    </div>
                                                </Link>
                                            )}

                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-right px-4 py-2 text-red-400 hover:bg-gray-700 transition-colors flex items-center gap-2"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                <span>התנתק</span>
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}

                        {!isAuthenticated && (
                            <div className="flex items-center gap-4">
                                <Link
                                    to="/login"
                                    className="text-gray-300 hover:text-white transition-colors"
                                >
                                    התחבר
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg font-bold hover:shadow-lg transition-all"
                                >
                                    הרשם
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden text-gray-300 hover:text-white"
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-gray-800 border-t border-gray-700"
                    >
                        <div className="px-4 py-4 space-y-3">
                            {/* ✅ PREMIUM BADGE - Mobile */}
                            {isAuthenticated && isPremium && !isAdmin && (
                                <div className="flex items-center gap-1.5 bg-gradient-to-r from-yellow-400 to-orange-400 px-3 py-2 rounded-full w-fit mb-2">
                                    <Crown className="w-4 h-4 text-purple-900" />
                                    <span className="text-purple-900 font-black text-sm">Premium Member</span>
                                    <Sparkles className="w-3 h-3 text-purple-900" />
                                </div>
                            )}

                            <Link
                                to="/"
                                className="block text-gray-300 hover:text-white transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                בית
                            </Link>

                            {/* ✅ LEARNING AREA - Mobile */}
                            {isAuthenticated && !isAdmin && (
                                <Link
                                    to="/dashboard"
                                    className="block text-gray-300 hover:text-white transition-colors"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    📚 איזור למידה
                                </Link>
                            )}

                            {/* ✅ PLANS LINK - Only show for NON-premium users (Mobile) */}
                            {isAuthenticated && !isAdmin && !isPremium && (
                                <Link
                                    to="/plans"
                                    className="block text-yellow-400 hover:text-yellow-300 font-bold transition-colors"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <div className="flex items-center gap-2">
                                        <Crown className="w-4 h-4" />
                                        <span>שדרג לפרימיום</span>
                                        <span className="bg-yellow-400 text-gray-900 text-xs px-2 py-0.5 rounded-full font-black">
                                            חדש!
                                        </span>
                                    </div>
                                </Link>
                            )}

                            {isAuthenticated ? (
                                <>
                                    <Link
                                        to="/notebook"
                                        className="block text-gray-300 hover:text-white transition-colors"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        📓 המחברת שלי
                                    </Link>
                                    {isAdmin && (
                                        <Link
                                            to="/admin"
                                            className="block text-gray-300 hover:text-white transition-colors"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            ניהול מערכת
                                        </Link>
                                    )}
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-right text-red-400 hover:text-red-300 transition-colors"
                                    >
                                        התנתק
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        className="block text-gray-300 hover:text-white transition-colors"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        התחבר
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg font-bold text-center"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        הרשם
                                    </Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
