import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Bell, CheckCircle, Trophy, ShoppingCart, ChevronLeft, DollarSign, Tag, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatPrice } from '../utils/currency';

const AdminNotifications = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, unread, purchase, completion

    useEffect(() => {
        // Query for admin notifications
        const q = query(
            collection(db, 'notifications'),
            where('userId', '==', 'admin'),
            orderBy('timestamp', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notifs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setNotifications(notifs);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const markAsRead = async (notificationId) => {
        try {
            await updateDoc(doc(db, 'notifications', notificationId), {
                read: true,
                readAt: new Date()
            });
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            const unreadNotifs = notifications.filter(n => !n.read);
            const promises = unreadNotifs.map(n =>
                updateDoc(doc(db, 'notifications', n.id), {
                    read: true,
                    readAt: new Date()
                })
            );
            await Promise.all(promises);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const getFilteredNotifications = () => {
        switch (filter) {
            case 'unread':
                return notifications.filter(n => !n.read);
            case 'purchase':
                return notifications.filter(n => n.type === 'course_purchase');
            case 'completion':
                return notifications.filter(n => n.type === 'course_completed');
            default:
                return notifications;
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'course_purchase':
                return (
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                        <ShoppingCart className="text-green-600 dark:text-green-400" size={24} />
                    </div>
                );
            case 'course_completed':
                return (
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                        <Trophy className="text-purple-600 dark:text-purple-400" size={24} />
                    </div>
                );
            default:
                return (
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <Bell className="text-blue-600 dark:text-blue-400" size={24} />
                    </div>
                );
        }
    };

    const formatTimeAgo = (timestamp) => {
        const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'לפני רגע';
        if (diffInSeconds < 3600) return `לפני ${Math.floor(diffInSeconds / 60)} דקות`;
        if (diffInSeconds < 86400) return `לפני ${Math.floor(diffInSeconds / 3600)} שעות`;
        if (diffInSeconds < 604800) return `לפני ${Math.floor(diffInSeconds / 86400)} ימים`;

        return date.toLocaleDateString('he-IL');
    };

    const renderNotificationContent = (notification) => {
        if (notification.type === 'course_purchase') {
            return (
                <>
                    <h3 className="font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                        💰 רכישת קורס חדשה!
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-3">
                        <strong>{notification.purchaseDetails?.buyerName || 'משתמש'}</strong> רכש את הקורס{' '}
                        <strong>"{notification.purchaseDetails?.courseName}"</strong>
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                            <DollarSign size={16} />
                            {formatPrice(notification.purchaseDetails?.amount || 0)}
                        </span>
                        {notification.purchaseDetails?.codeUsed && (
                            <span className="flex items-center gap-1">
                                <Tag size={16} />
                                קוד: {notification.purchaseDetails.codeUsed}
                            </span>
                        )}
                        <span className="flex items-center gap-1">
                            <User size={16} />
                            {notification.purchaseDetails?.buyerName || notification.purchaseDetails?.buyerEmail}
                        </span>
                    </div>
                </>
            );
        }

        if (notification.type === 'course_completed') {
            return (
                <>
                    <h3 className="font-bold text-gray-800 dark:text-white mb-2">
                        🎉 סיום קורס
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-3">
                        <strong>{notification.courseDetails?.completedByName || notification.userName}</strong> סיים/ה את הקורס{' '}
                        <strong>"{notification.courseDetails?.courseName || notification.courseName}"</strong>
                    </p>
                </>
            );
        }

        // Default notification content
        return (
            <>
                <h3 className="font-bold text-gray-800 dark:text-white mb-2">
                    {notification.title || 'התראה'}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                    {notification.message}
                </p>
            </>
        );
    };

    const filteredNotifications = getFilteredNotifications();
    const unreadCount = notifications.filter(n => !n.read).length;

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-8" dir="rtl">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => navigate('/admin')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 mb-4"
                >
                    <ChevronLeft size={20} />
                    חזרה לדשבורד
                </button>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Bell size={32} className="text-indigo-600 dark:text-indigo-400" />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">התראות</h1>
                            {unreadCount > 0 && (
                                <p className="text-gray-600 dark:text-gray-400">
                                    {unreadCount} התראות חדשות
                                </p>
                            )}
                        </div>
                    </div>

                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="px-4 py-2 bg-gray-600 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 flex items-center gap-2"
                        >
                            <CheckCircle size={20} />
                            סמן הכל כנקרא
                        </button>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                        filter === 'all'
                            ? 'bg-indigo-600 dark:bg-indigo-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                >
                    הכל ({notifications.length})
                </button>
                <button
                    onClick={() => setFilter('unread')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                        filter === 'unread'
                            ? 'bg-indigo-600 dark:bg-indigo-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                >
                    לא נקראו ({unreadCount})
                </button>
                <button
                    onClick={() => setFilter('purchase')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                        filter === 'purchase'
                            ? 'bg-green-600 dark:bg-green-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                >
                    <ShoppingCart size={18} />
                    רכישות
                </button>
                <button
                    onClick={() => setFilter('completion')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                        filter === 'completion'
                            ? 'bg-purple-600 dark:bg-purple-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                >
                    <Trophy size={18} />
                    סיומים
                </button>
            </div>

            {/* Notifications List */}
            {filteredNotifications.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Bell size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                        {filter === 'unread' ? 'אין התראות חדשות' : 'אין התראות'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredNotifications.map(notification => (
                        <div
                            key={notification.id}
                            className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-all ${
                                !notification.read
                                    ? 'border-l-4 border-indigo-600 dark:border-indigo-400 bg-indigo-50/50 dark:bg-indigo-900/20'
                                    : ''
                            }`}
                            onClick={() => !notification.read && markAsRead(notification.id)}
                        >
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0">
                                    {getNotificationIcon(notification.type)}
                                </div>
                                <div className="flex-1">
                                    {renderNotificationContent(notification)}
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                                        {formatTimeAgo(notification.timestamp)}
                                    </p>
                                </div>
                                {!notification.read && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            markAsRead(notification.id);
                                        }}
                                        className="flex-shrink-0 px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 text-sm"
                                    >
                                        סמן כנקרא
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminNotifications;