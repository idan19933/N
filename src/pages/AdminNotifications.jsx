import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Bell, CheckCircle, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminNotifications = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(
            collection(db, 'notifications'),
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
                read: true
            });
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6" dir="rtl">
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={() => navigate('/admin')}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                        ← חזרה
                    </button>
                </div>
                <div className="flex items-center gap-3">
                    <Bell size={32} className="text-indigo-600" />
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">התראות</h1>
                        {unreadCount > 0 && (
                            <p className="text-gray-600">{unreadCount} התראות חדשות</p>
                        )}
                    </div>
                </div>
            </div>

            {notifications.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <Bell size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">אין התראות</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {notifications.map(notification => (
                        <div
                            key={notification.id}
                            className={`bg-white rounded-lg shadow-md p-6 ${
                                !notification.read ? 'border-l-4 border-indigo-600' : ''
                            }`}
                        >
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                        <Trophy className="text-green-600" size={24} />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-800 mb-2">
                                        🎉 סיום קורס
                                    </h3>
                                    <p className="text-gray-600 mb-3">
                                        <strong>{notification.userName}</strong> סיים/ה את הקורס{' '}
                                        <strong>{notification.courseName}</strong>
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {new Date(notification.timestamp?.toDate()).toLocaleString('he-IL')}
                                    </p>
                                </div>
                                {!notification.read && (
                                    <button
                                        onClick={() => markAsRead(notification.id)}
                                        className="flex-shrink-0 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
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