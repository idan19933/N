import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import useAuthStore from '../store/authStore';
import { getUserProgress } from '../services/progressService';
import { Target, TrendingUp, BookOpen, Calendar, Award, Clock, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalCourses: 0,
        completedCourses: 0,
        inProgressCourses: 0,
        totalSpent: 0
    });
    const [goals, setGoals] = useState([]);
    const [purchases, setPurchases] = useState([]);
    const [coursesWithProgress, setCoursesWithProgress] = useState([]);

    useEffect(() => {
        if (user) {
            loadDashboardData();
        }
    }, [user]);

    const loadDashboardData = async () => {
        try {
            // טעינת רכישות
            const purchasesQuery = query(
                collection(db, 'purchases'),
                where('userId', '==', user.uid)
            );
            const purchasesSnapshot = await getDocs(purchasesQuery);
            const purchasesData = purchasesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // טעינת התקדמות בקורסים
            const progressData = await getUserProgress(user.uid);

            // שילוב עם רכישות וטעינת פרטי קורסים
            const enrichedPurchases = await Promise.all(
                purchasesData.map(async (purchase) => {
                    const courseDoc = await getDoc(doc(db, 'courses', purchase.courseId));
                    const courseData = courseDoc.data();
                    const progress = progressData.find(p => p.courseId === purchase.courseId);

                    return {
                        ...purchase,
                        courseName: courseData?.title || 'Unknown Course',
                        courseImage: courseData?.image,
                        courseDescription: courseData?.description,
                        progress: progress?.completionRate || 0,
                        completedLessons: progress?.completedLessons || 0,
                        totalLessons: progress?.totalLessons || 0
                    };
                })
            );

            setCoursesWithProgress(enrichedPurchases);
            setPurchases(purchasesData);

            // חישוב סטטיסטיקות
            const totalSpent = purchasesData.reduce((sum, p) => sum + (p.amount || 0), 0);
            const completedCourses = enrichedPurchases.filter(p => p.progress >= 95).length;
            const inProgressCourses = enrichedPurchases.filter(p => p.progress > 0 && p.progress < 95).length;

            setStats({
                totalCourses: purchasesData.length,
                completedCourses,
                inProgressCourses,
                totalSpent
            });

            // טעינת יעדים
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            const userData = userDoc.data();
            if (userData?.goals) {
                setGoals(userData.goals);
            }

        } catch (error) {
            console.error('Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8" dir="rtl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">שלום, {user.email}</h1>
                <p className="text-gray-600">ברוך הבא לאיזור האישי שלך</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <BookOpen size={32} />
                    </div>
                    <div className="text-3xl font-bold mb-1">{stats.totalCourses}</div>
                    <div className="text-blue-100">קורסים שנרכשו</div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <Award size={32} />
                    </div>
                    <div className="text-3xl font-bold mb-1">{stats.completedCourses}</div>
                    <div className="text-green-100">קורסים שהושלמו</div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <TrendingUp size={32} />
                    </div>
                    <div className="text-3xl font-bold mb-1">{stats.inProgressCourses}</div>
                    <div className="text-purple-100">קורסים בתהליך</div>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <Target size={32} />
                    </div>
                    <div className="text-3xl font-bold mb-1">${stats.totalSpent.toFixed(2)}</div>
                    <div className="text-orange-100">סה"כ השקעה</div>
                </div>
            </div>

            {/* My Courses with Progress */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <Play className="text-indigo-600" />
                    הקורסים שלי
                </h2>

                {coursesWithProgress.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {coursesWithProgress.map((course) => (
                            <div
                                key={course.id}
                                onClick={() => navigate(`/courses/${course.courseId}`)}
                                className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                            >
                                <img
                                    src={course.courseImage}
                                    alt={course.courseName}
                                    className="w-full h-48 object-cover"
                                />
                                <div className="p-4">
                                    <h3 className="font-bold text-lg mb-2">{course.courseName}</h3>
                                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                        {course.courseDescription}
                                    </p>

                                    {/* Progress Bar */}
                                    <div className="mb-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-gray-600">התקדמות</span>
                                            <span className="text-sm font-bold text-indigo-600">
                                                {Math.round(course.progress)}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div
                                                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all"
                                                style={{ width: `${course.progress}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {course.completedLessons} מתוך {course.totalLessons} שיעורים
                                        </p>
                                    </div>

                                    <button className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold">
                                        המשך ללמוד
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <BookOpen size={48} className="mx-auto mb-4 text-gray-400" />
                        <p>עדיין לא רכשת קורסים</p>
                        <button
                            onClick={() => navigate('/courses')}
                            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                            עבור לקורסים
                        </button>
                    </div>
                )}
            </div>

            {/* Goals Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Target className="text-indigo-600" />
                        היעדים שלי
                    </h2>
                </div>

                {goals.length > 0 ? (
                    <div className="space-y-4">
                        {goals.map((goal, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-semibold text-lg">{goal.title}</h3>
                                    <span className="text-sm text-gray-500">
                                        {goal.progress || 0}% הושלם
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all"
                                        style={{ width: `${goal.progress || 0}%` }}
                                    />
                                </div>
                                <p className="text-sm text-gray-600 mt-2">{goal.description}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <Target size={48} className="mx-auto mb-4 text-gray-400" />
                        <p>עדיין אין יעדים מוגדרים</p>
                        <p className="text-sm">המנהל יוכל להגדיר יעדים עבורך</p>
                    </div>
                )}
            </div>

            {/* Purchase History */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <Clock className="text-indigo-600" />
                    היסטוריית רכישות
                </h2>

                {purchases.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="border-b">
                                <th className="text-right py-3 px-4">קורס</th>
                                <th className="text-right py-3 px-4">תאריך רכישה</th>
                                <th className="text-right py-3 px-4">סכום</th>
                                <th className="text-right py-3 px-4">סטטוס</th>
                            </tr>
                            </thead>
                            <tbody>
                            {purchases.map((purchase) => (
                                <tr key={purchase.id} className="border-b hover:bg-gray-50">
                                    <td className="py-3 px-4">
                                        {coursesWithProgress.find(c => c.courseId === purchase.courseId)?.courseName ||
                                            'קורס #' + purchase.courseId.substring(0, 8)}
                                    </td>
                                    <td className="py-3 px-4">
                                        {purchase.purchasedAt?.toDate().toLocaleDateString('he-IL')}
                                    </td>
                                    <td className="py-3 px-4 font-semibold">${purchase.amount}</td>
                                    <td className="py-3 px-4">
                                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                                {purchase.status}
                                            </span>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <BookOpen size={48} className="mx-auto mb-4 text-gray-400" />
                        <p>עדיין לא רכשת קורסים</p>
                        <button
                            onClick={() => navigate('/courses')}
                            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                            עבור לקורסים
                        </button>
                    </div>
                )}
            </div>

            {/* Book Consultation */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-lg p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                            <Calendar size={28} />
                            תיאום שיחת ייעוץ
                        </h2>
                        <p className="text-indigo-100 mb-4">
                            קבע פגישה אישית עם אחד המומחים שלנו לקבלת ייעוץ מקצועי
                        </p>
                        <ul className="text-sm space-y-2 mb-6">
                            <li>✓ ייעוץ אישי להתקדמות בקורס</li>
                            <li>✓ הנחייה מקצועית</li>
                            <li>✓ תשובות לשאלות</li>
                        </ul>
                        <button className="px-8 py-3 bg-white text-indigo-600 rounded-lg font-bold hover:bg-gray-100 transition-colors">
                            קבע שיחה עכשיו
                        </button>
                    </div>
                    <div className="hidden md:block">
                        <Calendar size={120} className="text-white opacity-20" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;