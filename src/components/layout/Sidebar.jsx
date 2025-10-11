import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, BookOpen, User, LogIn, UserPlus, LogOut, Menu, X, Shield } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { logoutUser } from '../../services/authService';


const Sidebar = () => {
    const { isAuthenticated, user, logout, isAdmin } = useAuthStore();
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const isActive = (path) => location.pathname === path;
    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    const handleLogout = async () => {
        try {
            await logoutUser();
            logout();
            setIsMobileMenuOpen(false);
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const menuItems = isAuthenticated
        ? [
            { path: '/', label: 'בית', icon: Home },
            { path: '/courses', label: 'כל הקורסים', icon: BookOpen },
            { path: '/my-courses', label: 'הקורסים שלי', icon: User },
        ]
        : [
            { path: '/', label: 'בית', icon: Home },
            { path: '/courses', label: 'קורסים', icon: BookOpen },
            { path: '/login', label: 'התחברות', icon: LogIn },
            { path: '/register', label: 'הרשמה', icon: UserPlus },
        ];

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={toggleMobileMenu}
                className="lg:hidden fixed top-4 right-4 z-50 p-3 bg-nexon-gradient text-white rounded-xl shadow-2xl hover:scale-110 transition-transform backdrop-blur-md"
                aria-label="תפריט"
            >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar */}
            <aside
                className={`fixed top-0 right-0 h-full bg-gradient-to-b from-gray-900/95 via-nexon-purple-900/90 to-gray-900/95 backdrop-blur-xl text-white w-72 transform transition-all duration-300 ease-in-out z-40 shadow-2xl border-l border-nexon-purple-500/20
          ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0`}
            >
                <div className="p-6 h-full flex flex-col">
                    {/* Logo Section */}
                    <Link to="/" className="mb-8 group" onClick={() => setIsMobileMenuOpen(false)}>
                        <div className="relative">
                            {/* Logo Background Glow */}
                            <div className="absolute inset-0 bg-nexon-gradient opacity-20 blur-2xl group-hover:opacity-30 transition-opacity"></div>

                            {/* Logo Image */}
                            <img
                                src="/logo.png"
                                alt="Nexon Education"
                                className="w-full h-auto relative z-10 opacity-90 group-hover:opacity-100 transition-opacity drop-shadow-2xl"
                            />
                        </div>
                        <p className="text-center text-xs text-nexon-blue-300 mt-2 opacity-75">
                            למצוא את הגרסון הבא שמתחבר
                        </p>
                    </Link>

                    {/* User Info Card */}
                    {isAuthenticated && (
                        <div className="mb-6 p-4 bg-gradient-to-br from-nexon-purple-600/30 to-nexon-blue-600/30 backdrop-blur-md rounded-xl shadow-lg border border-nexon-purple-400/30 hover:border-nexon-purple-400/50 transition-all">
                            <p className="text-sm text-nexon-blue-200">שלום,</p>
                            <p className="font-semibold text-white truncate text-lg">{user?.name || user?.email || 'משתמש'}</p>
                            {isAdmin && (
                                <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 text-xs font-bold rounded-full shadow-lg">
                                    <span>👑</span>
                                    <span>מנהל</span>
                                </span>
                            )}
                        </div>
                    )}

                    {/* Navigation */}
                    <nav className="space-y-2 flex-1 overflow-y-auto custom-scrollbar">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.path);
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`group flex items-center space-x-3 space-x-reverse p-3 rounded-xl transition-all duration-200 relative overflow-hidden ${
                                        active
                                            ? 'bg-nexon-gradient text-white shadow-lg shadow-nexon-purple-500/50 scale-105'
                                            : 'text-gray-300 hover:bg-white/10 hover:text-white backdrop-blur-sm'
                                    }`}
                                >
                                    {active && (
                                        <div className="absolute inset-0 bg-white/10 animate-pulse"></div>
                                    )}
                                    <Icon size={20} className={`relative z-10 ${active ? 'drop-shadow-lg' : ''}`} />
                                    <span className="font-medium relative z-10">{item.label}</span>
                                    {active && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-full"></div>
                                    )}
                                </Link>
                            );
                        })}

                        {/* Admin Dashboard Link */}
                        {isAuthenticated && isAdmin && (
                            <Link
                                to="/admin"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`group flex items-center space-x-3 space-x-reverse p-3 rounded-xl transition-all duration-200 relative overflow-hidden border-2 ${
                                    isActive('/admin')
                                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 border-yellow-400 text-white shadow-lg shadow-yellow-500/50 scale-105'
                                        : 'border-yellow-500/50 text-yellow-400 hover:bg-yellow-900/30 hover:border-yellow-400 hover:text-yellow-300 backdrop-blur-sm'
                                }`}
                            >
                                <Shield size={20} className="relative z-10 drop-shadow-lg" />
                                <span className="font-medium relative z-10">לוח בקרה</span>
                            </Link>
                        )}
                    </nav>

                    {/* Logout Button */}
                    {isAuthenticated && (
                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-3 space-x-reverse p-3 rounded-xl text-red-400 hover:bg-red-900/30 hover:text-red-300 w-full mt-4 transition-all duration-200 border border-red-500/30 hover:border-red-400 backdrop-blur-sm group"
                        >
                            <LogOut size={20} className="group-hover:rotate-180 transition-transform duration-500" />
                            <span className="font-medium">התנתקות</span>
                        </button>
                    )}

                    {/* Footer with Wave Effect */}
                    <div className="mt-6 pt-6 border-t border-nexon-purple-500/20 relative">
                        <div className="absolute -top-6 left-0 right-0 h-px bg-gradient-to-r from-transparent via-nexon-purple-400 to-transparent"></div>
                        <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-2">
                            <span className="inline-block w-2 h-2 bg-nexon-blue-400 rounded-full animate-pulse"></span>
                            <span>© 2025 Nexon Education</span>
                            <span className="inline-block w-2 h-2 bg-nexon-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></span>
                        </p>
                    </div>
                </div>
            </aside>

            {/* Overlay for mobile */}
            {isMobileMenuOpen && (
                <div
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden animate-fadeIn"
                />
            )}
        </>
    );
};

export default Sidebar;