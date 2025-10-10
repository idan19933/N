import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, BookOpen, User, LogIn, UserPlus, LogOut, Menu, X, Shield } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { logoutUser } from '../../services/authService';
import { useState } from 'react';

const Sidebar = () => {
    const { isAuthenticated, user, logout, isAdmin } = useAuthStore();
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Debug: Log admin status
    console.log('Sidebar - isAdmin:', isAdmin, 'isAuthenticated:', isAuthenticated, 'user:', user);

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
            { path: '/', label: 'Home', icon: Home },
            { path: '/courses', label: 'All Courses', icon: BookOpen },
            { path: '/my-courses', label: 'My Courses', icon: User },
        ]
        : [
            { path: '/', label: 'Home', icon: Home },
            { path: '/courses', label: 'Courses', icon: BookOpen },
            { path: '/login', label: 'Login', icon: LogIn },
            { path: '/register', label: 'Register', icon: UserPlus },
        ];

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={toggleMobileMenu}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-indigo-600 text-white rounded-md"
            >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full bg-gray-900 text-white w-64 transform transition-transform duration-300 ease-in-out z-40
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
            >
                <div className="p-6">
                    <h1 className="text-2xl font-bold mb-8">Course Academy</h1>

                    {isAuthenticated && (
                        <div className="mb-6 p-4 bg-gray-800 rounded-lg">
                            <p className="text-sm text-gray-400">Welcome back,</p>
                            <p className="font-semibold">{user?.name || user?.email || 'User'}</p>
                            {isAdmin && (
                                <span className="inline-block mt-2 px-2 py-1 bg-indigo-600 text-xs rounded">
                                    Admin
                                </span>
                            )}
                        </div>
                    )}

                    <nav className="space-y-2">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                                        isActive(item.path)
                                            ? 'bg-indigo-600 text-white'
                                            : 'text-gray-300 hover:bg-gray-800'
                                    }`}
                                >
                                    <Icon size={20} />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}

                        {/* Admin Dashboard Link - Separate from menuItems */}
                        {isAuthenticated && isAdmin && (
                            <Link
                                to="/admin"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                                    isActive('/admin')
                                        ? 'bg-indigo-600 text-white'
                                        : 'text-gray-300 hover:bg-gray-800'
                                }`}
                            >
                                <Shield size={20} />
                                <span>Admin Dashboard</span>
                            </Link>
                        )}
                    </nav>

                    {isAuthenticated && (
                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-3 p-3 rounded-lg text-red-400 hover:bg-gray-800 w-full mt-4"
                        >
                            <LogOut size={20} />
                            <span>Logout</span>
                        </button>
                    )}
                </div>
            </aside>

            {/* Overlay for mobile */}
            {isMobileMenuOpen && (
                <div
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
                />
            )}
        </>
    );
};

export default Sidebar;