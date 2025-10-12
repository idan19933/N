import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import useAuthStore from '../store/authStore';
import { getUserProgress } from '../services/progressService';
import { formatPrice } from '../utils/currency';
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
            console.log('📊 Loading dashboard for user:', user.uid);

            // טעינת רכישות
            const purchasesQuery = query(
                collection(db, 'purchases'),
                where('userId', '==', user.uid),
                where('status', '==', 'completed')
            );
            const purchasesSnapshot = await getDocs(purchasesQuery);
            const purchasesData = purchasesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            console.log('💳 Found purchases:', purchasesData.length, purchasesData);

            // טעינת התקדמות בקורסים
            const progressData = await getUserProgress(user.uid);
            console.log('📈 Progress data:', progressData);

            // שילוב עם רכישות וטעינת פרטי קורסים
            const enrichedPurchases = await Promise.all(
                purchasesData.map(async (purchase) => {
                    console.log('🔍 Loading course:', purchase.courseId);

                    const courseDoc = await getDoc(doc(db, 'courses', purchase.courseId));

                    if (!courseDoc.exists()) {
                        console.log('❌ Course not found:', purchase.courseId);
                        return null;
                    }

                    const courseData = courseDoc.data();
                    console.log('✅ Course loaded:', courseData.title);

                    const progress = progressData[purchase.courseId] || {
                        completionRate: 0,
                        completedLessons: 0,
                        totalLessons: 0
                    };

                    console.log('Progress for course:', progress);

                    return {
                        ...purchase,
                        courseName: courseData.title,
                        courseImage: courseData.image,
                        courseDescription: courseData.description,
                        progress: progress.completionRate || 0,
                        completedLessons: progress.completedLessons || 0,
                        totalLessons: progress.totalLessons || 0
                    };
                })
            );

            const validCourses = enrichedPurchases.filter(c => c !== null);
            console.log('✅ Valid courses:', validCourses.length, validCourses);

            setCoursesWithProgress(validCourses);
            setPurchases(purchasesData);

            // חישוב סטטיסטיקות
            const totalSpent = purchasesData.reduce((sum, p) => sum + (p.amount || 0), 0);
            const completedCourses = validCourses.filter(p => p.progress >= 95).length;
            const inProgressCourses = validCourses.filter(p => p.progress > 0 && p.progress < 95).length;

            setStats({
                totalCourses: purchasesData.length,
                completedCourses,
                inProgressCourses,
                totalSpent
            });

            // טעינת יעדים מ-Firestore
            const goalsQuery = query(
                collection(db, 'goals'),
                where('userId', '==', user.uid),
                where('status', '==', 'active')
            );
            const goalsSnapshot = await getDocs(goalsQuery);
            const goalsData = await Promise.all(
                goalsSnapshot.docs.map(async (goalDoc) => {
                    const goalData = goalDoc.data();

                    // טען התקדמות בקורס
                    const courseProgress = progressData[goalData.courseId] || {
                        completionRate: 0
                    };

                    // חשב ימים נותרים
                    const targetDate = new Date(goalData.targetDate.seconds ? goalData.targetDate.toDate() : goalData.targetDate);
                    const now = new Date();
                    const daysLeft = Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24));

                    // טען פרטי קורס
                    const courseDoc = await getDoc(doc(db, 'courses', goalData.courseId));
                    const courseTitle = courseDoc.exists() ? courseDoc.data().title : 'קורס לא ידוע';

                    return {
                        id: goalDoc.id,
                        ...goalData,
                        courseTitle,
                        currentProgress: courseProgress.completionRate || 0,
                        daysLeft,
                        isOverdue: daysLeft < 0
                    };
                })
            );

            setGoals(goalsData);
            console.log('✅ Goals loaded:', goalsData);

            console.log('✅ Dashboard loaded successfully');

        } catch (error) {
            console.error('❌ Error loading dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-white dark:bg-gray-900">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8" dir="rtl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
                    שלום, {user.displayName || user.email}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">ברוך הבא לאיזור האישי שלך</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <BookOpen size={32} />
                    </div>
                    <div className="text-3xl font-bold mb-1">{stats.totalCourses}</div>
                    <div className="text-blue-100 dark:text-blue-200">קורסים שנרכשו</div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 text-white rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <Award size={32} />
                    </div>
                    <div className="text-3xl font-bold mb-1">{stats.completedCourses}</div>
                    <div className="text-green-100 dark:text-green-200">קורסים שהושלמו</div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 text-white rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <TrendingUp size={32} />
                    </div>
                    <div className="text-3xl font-bold mb-1">{stats.inProgressCourses}</div>
                    <div className="text-purple-100 dark:text-purple-200">קורסים בתהליך</div>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 text-white rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <Target size={32} />
                    </div>
                    <div className="text-3xl font-bold mb-1">{formatPrice(stats.totalSpent)}</div>
                    <div className="text-orange-100 dark:text-orange-200">סה"כ השקעה</div>
                </div>
            </div>

            {/* My Courses with Progress */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                    <Play className="text-indigo-600 dark:text-indigo-400" />
                    הקורסים שלי
                </h2>

                {coursesWithProgress.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {coursesWithProgress.map((course) => (
                            <div
                                key={course.id}
                                onClick={() => navigate(`/courses/${course.courseId}`)}
                                className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer bg-white dark:bg-gray-900"
                            >
                                <img
                                    src={course.courseImage}
                                    alt={course.courseName}
                                    className="w-full h-48 object-cover"
                                />
                                <div className="p-4">
                                    <h3 className="font-bold text-lg mb-2 text-gray-800 dark:text-white">{course.courseName}</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                                        {course.courseDescription}
                                    </p>

                                    {/* Progress Bar */}
                                    <div className="mb-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">התקדמות</span>
                                            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                                                {Math.round(course.progress)}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                                            <div
                                                className="bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700 h-3 rounded-full transition-all"
                                                style={{ width: `${course.progress}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            {course.completedLessons} מתוך {course.totalLessons} שיעורים
                                        </p>
                                    </div>

                                    <button className="w-full py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors font-semibold">
                                        המשך ללמוד
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <BookOpen size={48} className="mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                        <p>עדיין לא רכשת קורסים</p>
                        <button
                            onClick={() => navigate('/courses')}
                            className="mt-4 px-6 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600"
                        >
                            עבור לקורסים
                        </button>
                    </div>
                )}
            </div>

            {/* Goals Section */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <Target className="text-indigo-600 dark:text-indigo-400" />
                        היעדים שלי
                    </h2>
                </div>

                {goals.length > 0 ? (
                    <div className="space-y-4">
                        {goals.map((goal) => (
                            <div key={goal.id} className={`border rounded-lg p-4 ${
                                goal.isOverdue ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20' :
                                    goal.daysLeft <= 7 ? 'border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20' :
                                        'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'
                            }`}>
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg mb-1 text-gray-800 dark:text-white">{goal.title}</h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{goal.courseTitle}</p>
                                        {goal.description && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{goal.description}</p>
                                        )}
                                    </div>
                                    <div className="text-left">
                                        {goal.isOverdue ? (
                                            <span className="px-3 py-1 bg-red-600 dark:bg-red-700 text-white rounded-full text-xs font-semibold">
                                                פג תוקף
                                            </span>
                                        ) : goal.daysLeft <= 7 ? (
                                            <span className="px-3 py-1 bg-orange-600 dark:bg-orange-700 text-white rounded-full text-xs font-semibold">
                                                {goal.daysLeft} ימים
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 bg-green-600 dark:bg-green-700 text-white rounded-full text-xs font-semibold">
                                                {goal.daysLeft} ימים
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="mb-2">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">התקדמות נוכחית</span>
                                        <span className="text-sm font-semibold text-gray-800 dark:text-white">
                                            {Math.round(goal.currentProgress)}% / {goal.targetCompletionRate}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 relative">
                                        <div
                                            className={`h-3 rounded-full transition-all ${
                                                goal.currentProgress >= goal.targetCompletionRate
                                                    ? 'bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700'
                                                    : goal.isOverdue
                                                        ? 'bg-gradient-to-r from-red-500 to-red-600 dark:from-red-600 dark:to-red-700'
                                                        : 'bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-600 dark:to-purple-700'
                                            }`}
                                            style={{ width: `${Math.min(goal.currentProgress, 100)}%` }}
                                        />
                                        {/* Target line */}
                                        <div
                                            className="absolute top-0 bottom-0 w-0.5 bg-gray-700 dark:bg-gray-300"
                                            style={{ left: `${goal.targetCompletionRate}%` }}
                                        >
                                            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 rotate-45 bg-gray-700 dark:bg-gray-300"></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                    <span>תאריך יעד: {new Date(goal.targetDate.seconds ? goal.targetDate.toDate() : goal.targetDate).toLocaleDateString('he-IL')}</span>
                                    {goal.currentProgress >= goal.targetCompletionRate ? (
                                        <span className="text-green-600 dark:text-green-400 font-semibold">✓ הושלם!</span>
                                    ) : goal.isOverdue ? (
                                        <span className="text-red-600 dark:text-red-400 font-semibold">⚠ מאחר ביעד</span>
                                    ) : goal.daysLeft > 0 ? (
                                        <span>ממוצע נדרש: {((goal.targetCompletionRate - goal.currentProgress) / goal.daysLeft).toFixed(1)}% ליום</span>
                                    ) : null}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <Target size={48} className="mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                        <p>עדיין אין יעדים מוגדרים</p>
                        <p className="text-sm">המנהל יוכל להגדיר יעדים עבורך</p>
                    </div>
                )}
            </div>

            {/* Purchase History */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                    <Clock className="text-indigo-600 dark:text-indigo-400" />
                    היסטוריית רכישות
                </h2>

                {purchases.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-700">
                                <th className="text-right py-3 px-4 text-gray-700 dark:text-gray-300">קורס</th>
                                <th className="text-right py-3 px-4 text-gray-700 dark:text-gray-300">תאריך רכישה</th>
                                <th className="text-right py-3 px-4 text-gray-700 dark:text-gray-300">סכום</th>
                                <th className="text-right py-3 px-4 text-gray-700 dark:text-gray-300">סטטוס</th>
                            </tr>
                            </thead>
                            <tbody>
                            {purchases.map((purchase) => (
                                <tr key={purchase.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="py-3 px-4 text-gray-800 dark:text-gray-200">
                                        {coursesWithProgress.find(c => c.courseId === purchase.courseId)?.courseName ||
                                            purchase.courseName ||
                                            'קורס #' + purchase.courseId.substring(0, 8)}
                                    </td>
                                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                                        {purchase.purchasedAt?.toDate ?
                                            purchase.purchasedAt.toDate().toLocaleDateString('he-IL') :
                                            new Date(purchase.purchasedAt).toLocaleDateString('he-IL')
                                        }
                                    </td>
                                    <td className="py-3 px-4 font-semibold text-gray-800 dark:text-white">
                                        {formatPrice(purchase.amount || 0)}
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm">
                                            {purchase.status || 'completed'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <BookOpen size={48} className="mx-auto mb-4 text-gray-400 dark:text-gray-500" />
                        <p>עדיין לא רכשת קורסים</p>
                        <button
                            onClick={() => navigate('/courses')}
                            className="mt-4 px-6 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600"
                        >
                            עבור לקורסים
                        </button>
                    </div>
                )}
            </div>

            {/* Book Consultation */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700 text-white rounded-xl shadow-lg p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                            <Calendar size={28} />
                            תיאום שיחת ייעוץ
                        </h2>
                        <p className="text-indigo-100 dark:text-indigo-200 mb-4">
                            קבע פגישה אישית עם אחד המומחים שלנו לקבלת ייעוץ מקצועי
                        </p>
                        <ul className="text-sm space-y-2 mb-6 text-indigo-100 dark:text-indigo-200">
                            <li>✓ ייעוץ אישי להתקדמות בקורס</li>
                            <li>✓ הנחייה מקצועית</li>
                            <li>✓ תשובות לשאלות</li>
                        </ul>
                        <button className="px-8 py-3 bg-white dark:bg-gray-100 text-indigo-600 dark:text-indigo-700 rounded-lg font-bold hover:bg-gray-100 dark:hover:bg-gray-200 transition-colors">
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