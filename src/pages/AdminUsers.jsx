import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Users, TrendingUp, DollarSign, BookOpen, Target, Plus, X } from 'lucide-react';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showGoalModal, setShowGoalModal] = useState(false);
    const [newGoal, setNewGoal] = useState({ title: '', description: '', progress: 0 });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            // טעינת משתמשים
            const usersSnapshot = await getDocs(collection(db, 'users'));
            const usersData = usersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // טעינת רכישות
            const purchasesSnapshot = await getDocs(collection(db, 'purchases'));
            const purchasesData = purchasesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // טעינת קורסים
            const coursesSnapshot = await getDocs(collection(db, 'courses'));
            const coursesMap = {};
            coursesSnapshot.docs.forEach(doc => {
                coursesMap[doc.id] = doc.data();
            });

            // שילוב נתונים
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
        } finally {
            setLoading(false);
        }
    };

    const handleAddGoal = async () => {
        if (!selectedUser || !newGoal.title) return;

        try {
            const userRef = doc(db, 'users', selectedUser.id);
            const userDoc = await getDoc(userRef);
            const currentGoals = userDoc.data()?.goals || [];

            await updateDoc(userRef, {
                goals: [...currentGoals, { ...newGoal, createdAt: new Date() }]
            });

            setShowGoalModal(false);
            setNewGoal({ title: '', description: '', progress: 0 });
            loadData();
            alert('יעד נוסף בהצלחה!');
        } catch (error) {
            console.error('Error adding goal:', error);
            alert('שגיאה בהוספת יעד');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    const totalUsers = users.length;
    const totalRevenue = users.reduce((sum, u) => sum + u.totalSpent, 0);
    const totalCoursesSold = users.reduce((sum, u) => sum + u.totalCourses, 0);

    return (
        <div className="max-w-7xl mx-auto px-4 py-8" dir="rtl">
            <h1 className="text-4xl font-bold text-gray-800 mb-8">ניהול משתמשים</h1>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
                    <Users size={32} className="mb-4" />
                    <div className="text-3xl font-bold mb-1">{totalUsers}</div>
                    <div className="text-blue-100">סה"כ משתמשים</div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
                    <DollarSign size={32} className="mb-4" />
                    <div className="text-3xl font-bold mb-1">${totalRevenue.toFixed(2)}</div>
                    <div className="text-green-100">סה"כ הכנסות</div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
                    <BookOpen size={32} className="mb-4" />
                    <div className="text-3xl font-bold mb-1">{totalCoursesSold}</div>
                    <div className="text-purple-100">קורסים שנמכרו</div>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-6 shadow-lg">
                    <TrendingUp size={32} className="mb-4" />
                    <div className="text-3xl font-bold mb-1">
                        ${totalUsers > 0 ? (totalRevenue / totalUsers).toFixed(2) : '0'}
                    </div>
                    <div className="text-orange-100">ממוצע למשתמש</div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="text-right py-4 px-6 font-semibold text-gray-700">אימייל</th>
                            <th className="text-right py-4 px-6 font-semibold text-gray-700">תפקיד</th>
                            <th className="text-right py-4 px-6 font-semibold text-gray-700">קורסים</th>
                            <th className="text-right py-4 px-6 font-semibold text-gray-700">סה"כ הוצאות</th>
                            <th className="text-right py-4 px-6 font-semibold text-gray-700">תאריך הצטרפות</th>
                            <th className="text-right py-4 px-6 font-semibold text-gray-700">פעולות</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map((user) => (
                            <React.Fragment key={user.id}>
                                <tr className="border-b hover:bg-gray-50 transition-colors">
                                    <td className="py-4 px-6">
                                        <div className="font-medium text-gray-800">{user.email}</div>
                                    </td>
                                    <td className="py-4 px-6">
                                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                                user.role === 'admin'
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-blue-100 text-blue-800'
                                            }`}>
                                                {user.role === 'admin' ? 'מנהל' : 'משתמש'}
                                            </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-2">
                                            <BookOpen size={16} className="text-gray-500" />
                                            <span className="font-semibold">{user.totalCourses}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="font-bold text-green-600">
                                            ${user.totalSpent.toFixed(2)}
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-gray-600">
                                        {user.createdAt?.toDate().toLocaleDateString('he-IL') || 'N/A'}
                                    </td>
                                    <td className="py-4 px-6">
                                        <button
                                            onClick={() => {
                                                setSelectedUser(user);
                                                setShowGoalModal(true);
                                            }}
                                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-semibold flex items-center gap-2"
                                        >
                                            <Target size={16} />
                                            הוסף יעד
                                        </button>
                                    </td>
                                </tr>
                                {/* Expanded Row - Purchases */}
                                {user.purchases.length > 0 && (
                                    <tr className="bg-gray-50">
                                        <td colSpan="6" className="py-4 px-6">
                                            <div className="text-sm">
                                                <div className="font-semibold text-gray-700 mb-2">רכישות:</div>
                                                <div className="space-y-1">
                                                    {user.purchases.map((purchase, idx) => (
                                                        <div key={idx} className="flex items-center justify-between bg-white p-2 rounded">
                                                            <span>{purchase.courseName}</span>
                                                            <span className="text-gray-600">
                                                                    {purchase.purchasedAt?.toDate().toLocaleDateString('he-IL')}
                                                                </span>
                                                            <span className="font-semibold text-green-600">
                                                                    ${purchase.amount}
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
            </div>

            {/* Add Goal Modal */}
            {showGoalModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-8 max-w-md w-full">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">הוסף יעד למשתמש</h2>
                            <button
                                onClick={() => setShowGoalModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="mb-4">
                            <p className="text-gray-600 mb-4">
                                משתמש: <span className="font-semibold">{selectedUser?.email}</span>
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    כותרת היעד
                                </label>
                                <input
                                    type="text"
                                    value={newGoal.title}
                                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    placeholder="למשל: השלמת קורס React"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    תיאור
                                </label>
                                <textarea
                                    value={newGoal.description}
                                    onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    rows={3}
                                    placeholder="תיאור היעד..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    אחוז התקדמות התחלתי
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={newGoal.progress}
                                    onChange={(e) => setNewGoal({ ...newGoal, progress: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={handleAddGoal}
                                    className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
                                >
                                    הוסף יעד
                                </button>
                                <button
                                    onClick={() => setShowGoalModal(false)}
                                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                                >
                                    ביטול
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;