import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { subscribeToNotifications } from '../../services/notificationService';
import useAuthStore from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

const NotificationBell = () => {
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const { user, isAdmin } = useAuthStore();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) return;

        // ✅ אם מנהל - הצג התראות אדמין, אחרת - התראות משתמש
        const userId = isAdmin ? 'admin' : user.uid;

        const unsubscribe = subscribeToNotifications(
            (newNotifications) => {
                setNotifications(newNotifications);
            },
            userId,
            10
        );

        return () => unsubscribe();
    }, [user, isAdmin]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleNotificationClick = () => {
        setIsOpen(false);
        // ✅ נווט למיקום המתאים
        if (isAdmin) {
            navigate('/admin/notifications');
        } else {
            navigate('/notifications');
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
                <Bell size={22} className="text-gray-700 dark:text-gray-300" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop for mobile - closes dropdown when clicked */}
                        <div
                            className="fixed inset-0 bg-black bg-opacity-25 sm:hidden z-40"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Notification Dropdown */}
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 top-16 sm:top-auto mt-0 sm:mt-2 w-auto sm:w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 max-h-[80vh] sm:max-h-[28rem] flex flex-col"
                        >
                            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                                <h3 className="font-bold text-gray-800 dark:text-white">
                                    {isAdmin ? 'התראות מנהל' : 'התראות'}
                                </h3>
                            </div>

                            <div className="overflow-y-auto flex-1">
                                {notifications.length === 0 ? (
                                    <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                                        אין התראות חדשות
                                    </div>
                                ) : (
                                    notifications.slice(0, 5).map((notification) => (
                                        <div
                                            key={notification.id}
                                            className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                                                !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                            }`}
                                        >
                                            <h4 className="font-semibold text-gray-800 dark:text-white text-sm">
                                                {notification.title}
                                            </h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                                                {notification.message}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>

                            {notifications.length > 0 && (
                                <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                                    <button
                                        onClick={handleNotificationClick}
                                        className="w-full py-2 text-center text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
                                    >
                                        צפה בכל ההתראות
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationBell;