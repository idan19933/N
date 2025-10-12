import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, Trash2, Filter, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import {
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications
} from '../services/notificationService';
import { AnimatedPage, fadeInUp } from '../components/animations/AnimatedPage';
import { Spinner } from '../components/ui/Skeletons';
import toast from 'react-hot-toast';

const Notifications = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuthStore();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, unread, read
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        loadNotifications();
    }, [user, isAuthenticated]);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const data = await getUserNotifications(user.uid);
            setNotifications(data);
        } catch (error) {
            console.error('Error loading notifications:', error);
            toast.error('שגיאה בטעינת התראות');
        } finally {
            setLoading(false);
        }
    };

    const handleNotificationClick = async (notification) => {
        if (!notification.read) {
            await markAsRead(notification.id);
            setNotifications(prev =>
                prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
            );
        }

        if (notification.actionUrl) {
            navigate(notification.actionUrl);
        }
    };

    const handleMarkAllRead = async () => {
        await markAllAsRead(user.uid);
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        toast.success('כל ההתראות סומנו כנקראו');
    };

    const handleDeleteAll = async () => {
        if (window.confirm('האם אתה בטוח שברצונך למחוק את כל ההתראות?')) {
            await deleteAllNotifications(user.uid);
            setNotifications([]);
            toast.success('כל ההתראות נמחקו');
        }
    };

    const handleDelete = async (notificationId) => {
        await deleteNotification(notificationId);
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        toast.success('ההתראה נמחקה');
    };

    const getNotificationIcon = (type) => {
        const icons = {
            purchase: '🎉',
            course_completed: '🏆',
            new_course: '✨',
            discount: '💰',
            reminder: '⏰'
        };
        return icons[type] || '🔔';
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';

        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'עכשיו';
        if (diffMins < 60) return `לפני ${diffMins} דקות`;
        if (diffHours < 24) return `לפני ${diffHours} שעות`;
        if (diffDays < 7) return `לפני ${diffDays} ימים`;
        return date.toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    // Filter notifications
    const filteredNotifications = notifications.filter(notification => {
        // Filter by read/unread
        if (filter === 'unread' && notification.read) return false;
        if (filter === 'read' && !notification.read) return false;

        // Filter by search
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            return (
                notification.title.toLowerCase().includes(search) ||
                notification.message.toLowerCase().includes(search) ||
                notification.courseName?.toLowerCase().includes(search)
            );
        }

        return true;
    });

    const unreadCount = notifications.filter(n => !n.read).length;

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
                <Spinner size="lg" />
                <p className="text-gray-600 dark:text-gray-400 mt-4">טוען התראות...</p>
            </div>
        );
    }

    return (
        <AnimatedPage>
            <div className="max-w-4xl mx-auto px-4 py-8" dir="rtl">
                {/* Header */}
                <motion.div
                    variants={fadeInUp}
                    initial="initial"
                    animate="animate"
                    className="mb-8"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-black text-gray-800 dark:text-white mb-2">
                                התראות
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                {unreadCount > 0 ? `יש לך ${unreadCount} התראות שלא נקראו` : 'כל ההתראות נקראו'}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            {unreadCount > 0 && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleMarkAllRead}
                                    className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors flex items-center gap-2"
                                >
                                    <Check size={20} />
                                    סמן הכל כנקרא
                                </motion.button>
                            )}
                            {notifications.length > 0 && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleDeleteAll}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                                >
                                    <Trash2 size={20} />
                                    מחק הכל
                                </motion.button>
                            )}
                        </div>
                    </div>

                    {/* Search & Filter */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1 relative">
                                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="חפש התראות..."
                                    className="w-full pr-10 pl-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            {/* Filter */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setFilter('all')}
                                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                                        filter === 'all'
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    הכל ({notifications.length})
                                </button>
                                <button
                                    onClick={() => setFilter('unread')}
                                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                                        filter === 'unread'
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    לא נקראו ({unreadCount})
                                </button>
                                <button
                                    onClick={() => setFilter('read')}
                                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                                        filter === 'read'
                                            ? 'bg-indigo-600 text-white'
                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    נקראו ({notifications.length - unreadCount})
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Notifications List */}
                {filteredNotifications.length === 0 ? (
                    <motion.div
                        variants={fadeInUp}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center"
                    >
                        <Bell size={64} className="mx-auto mb-4 text-gray-400" />
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                            {searchTerm ? 'לא נמצאו תוצאות' : 'אין התראות'}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                            {searchTerm
                                ? 'נסה לחפש משהו אחר'
                                : 'כשיהיו לך התראות חדשות, הן יופיעו כאן'
                            }
                        </p>
                    </motion.div>
                ) : (
                    <div className="space-y-4">
                        <AnimatePresence>
                            {filteredNotifications.map((notification, index) => (
                                <motion.div
                                    key={notification.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -100 }}
                                    transition={{ delay: index * 0.05 }}
                                    whileHover={{ scale: 1.02 }}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 cursor-pointer transition-all ${
                                        !notification.read
                                            ? 'border-l-4 border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                                            : 'border-l-4 border-transparent'
                                    }`}
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Icon/Image */}
                                        <div className="flex-shrink-0">
                                            {notification.courseImage ? (
                                                <img
                                                    src={notification.courseImage}
                                                    alt=""
                                                    className="w-16 h-16 rounded-xl object-cover"
                                                />
                                            ) : (
                                                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl">
                                                    {getNotificationIcon(notification.type)}
                                                </div>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-1">
                                                        {notification.title}
                                                    </h3>
                                                    <p className="text-gray-600 dark:text-gray-300 mb-2">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {formatTime(notification.createdAt)}
                                                    </p>
                                                </div>

                                                {/* Delete Button */}
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(notification.id);
                                                    }}
                                                    className="text-gray-400 hover:text-red-500 transition-colors p-2"
                                                >
                                                    <Trash2 size={20} />
                                                </motion.button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </AnimatedPage>
    );
};

export default Notifications;