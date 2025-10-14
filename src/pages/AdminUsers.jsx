import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Target, X, ChevronDown, ChevronUp, Key, Shield, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showGoalModal, setShowGoalModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [expandedUser, setExpandedUser] = useState(null);
    const [newGoal, setNewGoal] = useState({ title: '', description: '', progress: 0 });
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const usersSnapshot = await getDocs(collection(db, 'users'));
            const usersData = usersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            const purchasesSnapshot = await getDocs(collection(db, 'purchases'));
            const purchasesData = purchasesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            const coursesSnapshot = await getDocs(collection(db, 'courses'));
            const coursesMap = {};
            coursesSnapshot.docs.forEach(doc => {
                coursesMap[doc.id] = doc.data();
            });

            const enrichedUsers = usersData.map(user => {
                const userPurchases = purchasesData.filter(p => p.userId === user.id);
                const totalSpent = userPurchases.reduce((sum, p) => sum + (p.amount || 0), 0);

                return {
                    ...user,
                    totalCourses: userPurchases.length,
                    totalSpent,
                    purchases: userPurchases.map(p => ({
                        ...p,
                        courseName: coursesMap[p.courseId]?.title || 'Unknown Course'
                    }))
                };
            });

            setUsers(enrichedUsers);
            setPurchases(purchasesData);
        } catch (error) {
            console.error('Error loading data:', error);
            toast.error('שגיאה בטעינת נתונים');
        } finally {
            setLoading(false);
        }
    };

    const handleAddGoal = async () => {
        if (!selectedUser || !newGoal.title) {
            toast.error('נא למלא את כל השדות');
            return;
        }

        const loadingToast = toast.loading('מוסיף יעד...');
        try {
            const userRef = doc(db, 'users', selectedUser.id);
            const userDoc = await getDoc(userRef);
            const currentGoals = userDoc.data()?.goals || [];

            await updateDoc(userRef, {
                goals: [...currentGoals, { ...newGoal, createdAt: new Date() }]
            });

            toast.success('✅ יעד נוסף בהצלחה!', { id: loadingToast });
            setShowGoalModal(false);
            setNewGoal({ title: '', description: '', progress: 0 });
            loadData();
        } catch (error) {
            console.error('Error adding goal:', error);
            toast.error('❌ שגיאה בהוספת יעד', { id: loadingToast });
        }
    };

    const handleChangePassword = async () => {
        if (!newPassword || !confirmPassword) {
            toast.error('נא למלא את כל השדות');
            return;
        }

        if (newPassword.length < 6) {
            toast.error('הסיסמה חייבת להכיל לפחות 6 תווים');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('הסיסמאות אינן תואמות');
            return;
        }

        const loadingToast = toast.loading('משנה סיסמה...');
        try {
            // Note: In Firebase, you need to use Admin SDK or Firebase Auth to change password
            // This is a placeholder - you'll need to implement this via your backend/cloud function
            toast.error('פונקציה זו דורשת הגדרה בצד השרת', { id: loadingToast });

            // When implemented via cloud function:
            // await fetch('/api/changeUserPassword', {
            //     method: 'POST',
            //     body: JSON.stringify({ userId: selectedUser.id, newPassword })
            // });

            setShowPasswordModal(false);
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            console.error('Error changing password:', error);
            toast.error('❌ שגיאה בשינוי סיסמה', { id: loadingToast });
        }
    };

    const handleChangeRole = async (newRole) => {
        if (!selectedUser) return;

        const loadingToast = toast.loading('משנה הרשאות...');
        try {
            const userRef = doc(db, 'users', selectedUser.id);
            await updateDoc(userRef, {
                role: newRole,
                updatedAt: new Date()
            });

            toast.success(`✅ המשתמש עודכן ל${newRole === 'admin' ? 'מנהל' : 'משתמש רגיל'}!`, { id: loadingToast });
            setShowRoleModal(false);
            loadData();
        } catch (error) {
            console.error('Error changing role:', error);
            toast.error('❌ שגיאה בשינוי הרשאות', { id: loadingToast });
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8" dir="rtl">
                <div className="flex items-center justify-between mb-6 sm:mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 dark:text-white">ניהול משתמשים</h1>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2">
                            נהל משתמשים, שנה סיסמאות והרשאות
                        </p>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                        {users.length} משתמשים
                    </div>
                </div>

                {/* Users List - Mobile Cards / Desktop Table */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                    {/* Desktop Table */}
                    <div className="hidden lg:block overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="text-right py-4 px-6 font-semibold text-gray-700 dark:text-gray-200">אימייל</th>
                                <th className="text-right py-4 px-6 font-semibold text-gray-700 dark:text-gray-200">תפקיד</th>
                                <th className="text-right py-4 px-6 font-semibold text-gray-700 dark:text-gray-200">קורסים</th>
                                <th className="text-right py-4 px-6 font-semibold text-gray-700 dark:text-gray-200">סה"כ הוצאות</th>
                                <th className="text-right py-4 px-6 font-semibold text-gray-700 dark:text-gray-200">תאריך הצטרפות</th>
                                <th className="text-right py-4 px-6 font-semibold text-gray-700 dark:text-gray-200">פעולות</th>
                            </tr>
                            </thead>
                            <tbody>
                            {users.map((user) => (
                                <React.Fragment key={user.id}>
                                    <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="font-medium text-gray-800 dark:text-white">{user.email}</div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                                user.role === 'admin'
                                                    ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                                                    : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                                            }`}>
                                                {user.role === 'admin' ? 'מנהל' : 'משתמש'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="font-semibold text-gray-800 dark:text-white">{user.totalCourses}</span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="font-bold text-green-600 dark:text-green-400">
                                                ₪{user.totalSpent.toFixed(2)}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-gray-600 dark:text-gray-400">
                                            {user.createdAt?.toDate().toLocaleDateString('he-IL') || 'N/A'}
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setShowPasswordModal(true);
                                                    }}
                                                    className="px-3 py-2 bg-yellow-600 dark:bg-yellow-500 text-white rounded-lg hover:bg-yellow-700 dark:hover:bg-yellow-600 transition-colors text-sm font-semibold flex items-center gap-1"
                                                    title="שנה סיסמה"
                                                >
                                                    <Key size={16} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setShowRoleModal(true);
                                                    }}
                                                    className="px-3 py-2 bg-purple-600 dark:bg-purple-500 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors text-sm font-semibold flex items-center gap-1"
                                                    title="שנה הרשאות"
                                                >
                                                    <Shield size={16} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setShowGoalModal(true);
                                                    }}
                                                    className="px-3 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors text-sm font-semibold flex items-center gap-1"
                                                    title="הוסף יעד"
                                                >
                                                    <Target size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    {user.purchases.length > 0 && (
                                        <tr className="bg-gray-50 dark:bg-gray-700/50">
                                            <td colSpan="6" className="py-4 px-6">
                                                <div className="text-sm">
                                                    <div className="font-semibold text-gray-700 dark:text-gray-200 mb-2">רכישות:</div>
                                                    <div className="space-y-1">
                                                        {user.purchases.map((purchase, idx) => (
                                                            <div key={idx} className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 rounded">
                                                                <span className="text-gray-800 dark:text-white">{purchase.courseName}</span>
                                                                <span className="text-gray-600 dark:text-gray-400">
                                                                    {purchase.purchasedAt?.toDate().toLocaleDateString('he-IL')}
                                                                </span>
                                                                <span className="font-semibold text-green-600 dark:text-green-400">
                                                                    ₪{purchase.amount}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="lg:hidden divide-y divide-gray-200 dark:divide-gray-700">
                        {users.map((user) => (
                            <div key={user.id} className="p-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <div className="font-semibold text-gray-800 dark:text-white mb-1 break-all">{user.email}</div>
                                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                                            user.role === 'admin'
                                                ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                                                : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                                        }`}>
                                            {user.role === 'admin' ? 'מנהל' : 'משתמש'}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                                        className="text-gray-500 dark:text-gray-400 p-1"
                                    >
                                        {expandedUser === user.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                                    <div>
                                        <div className="text-gray-600 dark:text-gray-400 mb-1">קורסים</div>
                                        <div className="font-semibold text-gray-800 dark:text-white">{user.totalCourses}</div>
                                    </div>
                                    <div>
                                        <div className="text-gray-600 dark:text-gray-400 mb-1">סה"כ הוצאות</div>
                                        <div className="font-bold text-green-600 dark:text-green-400">
                                            ₪{user.totalSpent.toFixed(2)}
                                        </div>
                                    </div>
                                </div>

                                <div className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                                    הצטרף: {user.createdAt?.toDate().toLocaleDateString('he-IL') || 'N/A'}
                                </div>

                                {/* Expanded Content */}
                                {expandedUser === user.id && (
                                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                        {user.purchases.length > 0 && (
                                            <div className="mb-3">
                                                <div className="font-semibold text-gray-700 dark:text-gray-200 mb-2 text-sm">רכישות:</div>
                                                <div className="space-y-2">
                                                    {user.purchases.map((purchase, idx) => (
                                                        <div key={idx} className="bg-gray-50 dark:bg-gray-700 p-2 rounded text-sm">
                                                            <div className="font-medium text-gray-800 dark:text-white mb-1">{purchase.courseName}</div>
                                                            <div className="flex justify-between text-xs">
                                                                <span className="text-gray-600 dark:text-gray-400">
                                                                    {purchase.purchasedAt?.toDate().toLocaleDateString('he-IL')}
                                                                </span>
                                                                <span className="font-semibold text-green-600 dark:text-green-400">
                                                                    ₪{purchase.amount}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setShowPasswordModal(true);
                                                }}
                                                className="w-full px-4 py-2 bg-yellow-600 dark:bg-yellow-500 text-white rounded-lg hover:bg-yellow-700 dark:hover:bg-yellow-600 transition-colors text-sm font-semibold flex items-center justify-center gap-2"
                                            >
                                                <Key size={16} />
                                                שנה סיסמה
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setShowRoleModal(true);
                                                }}
                                                className="w-full px-4 py-2 bg-purple-600 dark:bg-purple-500 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors text-sm font-semibold flex items-center justify-center gap-2"
                                            >
                                                <Shield size={16} />
                                                שנה הרשאות
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setShowGoalModal(true);
                                                }}
                                                className="w-full px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors text-sm font-semibold flex items-center justify-center gap-2"
                                            >
                                                <Target size={16} />
                                                הוסף יעד
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Change Password Modal */}
                {showPasswordModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-4 sm:mb-6">
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                    <Key size={24} />
                                    שינוי סיסמה
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowPasswordModal(false);
                                        setNewPassword('');
                                        setConfirmPassword('');
                                    }}
                                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="mb-4">
                                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 flex items-center gap-2">
                                    <Mail size={16} />
                                    <span className="font-semibold break-all">{selectedUser?.email}</span>
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        סיסמה חדשה
                                    </label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-yellow-500 text-sm sm:text-base"
                                        placeholder="לפחות 6 תווים"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        אימות סיסמה
                                    </label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-yellow-500 text-sm sm:text-base"
                                        placeholder="הזן שוב את הסיסמה"
                                    />
                                </div>

                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                                    <p className="text-xs sm:text-sm text-yellow-800 dark:text-yellow-200">
                                        ⚠️ שים לב: פונקציה זו דורשת הגדרה בצד השרת באמצעות Firebase Admin SDK
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                    <button
                                        onClick={handleChangePassword}
                                        className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-yellow-600 dark:bg-yellow-500 text-white rounded-lg hover:bg-yellow-700 dark:hover:bg-yellow-600 transition-colors font-semibold text-sm sm:text-base"
                                    >
                                        שנה סיסמה
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowPasswordModal(false);
                                            setNewPassword('');
                                            setConfirmPassword('');
                                        }}
                                        className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-semibold text-sm sm:text-base"
                                    >
                                        ביטול
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Change Role Modal */}
                {showRoleModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-8 max-w-md w-full">
                            <div className="flex items-center justify-between mb-4 sm:mb-6">
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                    <Shield size={24} />
                                    שינוי הרשאות
                                </h2>
                                <button
                                    onClick={() => setShowRoleModal(false)}
                                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="mb-6">
                                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4">
                                    משתמש: <span className="font-semibold break-all">{selectedUser?.email}</span>
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    תפקיד נוכחי: <span className="font-semibold">{selectedUser?.role === 'admin' ? 'מנהל' : 'משתמש'}</span>
                                </p>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={() => handleChangeRole('user')}
                                    disabled={selectedUser?.role === 'user'}
                                    className={`w-full px-6 py-3 rounded-lg font-semibold transition-colors ${
                                        selectedUser?.role === 'user'
                                            ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                                >
                                    הפוך למשתמש רגיל
                                </button>
                                <button
                                    onClick={() => handleChangeRole('admin')}
                                    disabled={selectedUser?.role === 'admin'}
                                    className={`w-full px-6 py-3 rounded-lg font-semibold transition-colors ${
                                        selectedUser?.role === 'admin'
                                            ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                            : 'bg-red-600 text-white hover:bg-red-700'
                                    }`}
                                >
                                    הפוך למנהל
                                </button>
                                <button
                                    onClick={() => setShowRoleModal(false)}
                                    className="w-full px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-semibold"
                                >
                                    ביטול
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Add Goal Modal */}
                {showGoalModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-4 sm:mb-6">
                                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">הוסף יעד למשתמש</h2>
                                <button
                                    onClick={() => setShowGoalModal(false)}
                                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="mb-4">
                                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4">
                                    משתמש: <span className="font-semibold break-all">{selectedUser?.email}</span>
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        כותרת היעד
                                    </label>
                                    <input
                                        type="text"
                                        value={newGoal.title}
                                        onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                                        className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                                        placeholder="למשל: השלמת קורס React"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        תיאור
                                    </label>
                                    <textarea
                                        value={newGoal.description}
                                        onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                                        className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                                        rows={3}
                                        placeholder="תיאור היעד..."
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        אחוז התקדמות התחלתי
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={newGoal.progress}
                                        onChange={(e) => setNewGoal({ ...newGoal, progress: parseInt(e.target.value) })}
                                        className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                                    />
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                    <button
                                        onClick={handleAddGoal}
                                        className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors font-semibold text-sm sm:text-base"
                                    >
                                        הוסף יעד
                                    </button>
                                    <button
                                        onClick={() => setShowGoalModal(false)}
                                        className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-semibold text-sm sm:text-base"
                                    >
                                        ביטול
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminUsers;