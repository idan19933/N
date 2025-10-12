import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import useAuthStore from '../store/authStore';
import { BookOpen, Award, Clock, Play } from 'lucide-react';
import { motion } from 'framer-motion';

const MyCourses = () => {
    const { user, isAuthenticated } = useAuthStore();
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        loadMyCourses();
    }, [user, isAuthenticated, navigate]);

    const loadMyCourses = async () => {
        try {
            console.log('🔥 === STARTING LOAD MY COURSES ===');
            console.log('👤 User ID:', user?.uid);
            setLoading(true);

            if (!user?.uid) {
                console.error('❌ No user UID');
                setCourses([]);
                setLoading(false);
                return;
            }

            // ✅ קריאה ישירה ל-Firestore ללא תנאי status
            const purchasesQuery = query(
                collection(db, 'purchases'),
                where('userId', '==', user.uid)
            );

            console.log('🔍 Querying purchases collection...');
            const purchasesSnapshot = await getDocs(purchasesQuery);
            console.log('📦 Total purchases found:', purchasesSnapshot.size);

            if (purchasesSnapshot.empty) {
                console.log('⚠️ No purchases found for this user');
                setCourses([]);
                setLoading(false);
                return;
            }

            // הדפס כל רכישה
            purchasesSnapshot.forEach((doc, index) => {
                const data = doc.data();
                console.log(`Purchase ${index + 1}:`, {
                    id: doc.id,
                    courseId: data.courseId,
                    amount: data.amount,
                    status: data.status,
                    paymentMethod: data.paymentMethod,
                    purchaseDate: data.purchaseDate,
                    purchasedAt: data.purchasedAt
                });
            });

            // טען את פרטי הקורסים
            const coursesData = await Promise.all(
                purchasesSnapshot.docs.map(async (purchaseDoc) => {
                    const purchase = purchaseDoc.data();
                    console.log('🎓 Loading course:', purchase.courseId);

                    try {
                        const courseRef = doc(db, 'courses', purchase.courseId);
                        const courseSnap = await getDoc(courseRef);

                        if (courseSnap.exists()) {
                            const courseData = courseSnap.data();
                            console.log('✅ Course loaded:', courseData.title);
                            return {
                                id: courseSnap.id,
                                ...courseData,
                                purchaseInfo: purchase
                            };
                        } else {
                            console.log('❌ Course not found:', purchase.courseId);
                        }
                    } catch (error) {
                        console.error('❌ Error loading course:', purchase.courseId, error);
                    }
                    return null;
                })
            );

            const validCourses = coursesData.filter(course => course !== null);
            console.log('✅ Valid courses loaded:', validCourses.length);
            console.log('📚 Courses:', validCourses.map(c => ({ id: c.id, title: c.title })));

            setCourses(validCourses);

        } catch (error) {
            console.error('❌ Error in loadMyCourses:', error);
        } finally {
            setLoading(false);
            console.log('🏁 === FINISHED LOAD MY COURSES ===');
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-white dark:bg-gray-900">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
                <p className="text-gray-600 dark:text-gray-400 mt-4">טוען קורסים...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8" dir="rtl">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-3">
                    <BookOpen className="text-indigo-600 dark:text-indigo-400" size={40} />
                    הקורסים שלי
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                    המשך ללמוד מהקורסים שרכשת
                </p>
            </motion.div>

            {courses.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg"
                >
                    <div className="mb-6">
                        <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <BookOpen className="text-gray-400 dark:text-gray-500" size={48} />
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-lg mb-2 font-medium">
                            עדיין לא רכשת קורסים
                        </p>
                        <p className="text-gray-500 dark:text-gray-500 text-sm">
                            התחל את מסע הלמידה שלך עכשיו!
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-600 mt-4">
                            User ID: {user?.uid?.substring(0, 8)}...
                        </p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/courses')}
                        className="px-8 py-3 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 font-semibold inline-flex items-center gap-2"
                    >
                        <Play size={20} />
                        עבור לקורסים
                    </motion.button>
                </motion.div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700 text-white rounded-xl p-6 shadow-lg"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <BookOpen size={32} />
                            </div>
                            <div className="text-3xl font-bold mb-1">{courses.length}</div>
                            <div className="text-indigo-100 dark:text-indigo-200">קורסים פעילים</div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 text-white rounded-xl p-6 shadow-lg"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <Award size={32} />
                            </div>
                            <div className="text-3xl font-bold mb-1">
                                {courses.filter(c => c.purchaseInfo?.paymentMethod === 'promo_code').length}
                            </div>
                            <div className="text-green-100 dark:text-green-200">עם קופון</div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 text-white rounded-xl p-6 shadow-lg"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <Clock size={32} />
                            </div>
                            <div className="text-3xl font-bold mb-1">
                                {courses.reduce((sum, c) => sum + (parseInt(c.duration) || 0), 0)}h+
                            </div>
                            <div className="text-purple-100 dark:text-purple-200">תוכן לצפייה</div>
                        </motion.div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course, index) => (
                            <motion.div
                                key={course.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                onClick={() => navigate(`/courses/${course.id}`)}
                                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer border border-gray-200 dark:border-gray-700 group"
                            >
                                <div className="relative h-48 overflow-hidden">
                                    <img
                                        src={course.image}
                                        alt={course.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                    {course.purchaseInfo?.paymentMethod === 'promo_code' && (
                                        <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                                            🎁 קופון
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                                            <div className="flex items-center gap-2 text-white font-semibold bg-indigo-600 px-4 py-2 rounded-full">
                                                <Play size={16} />
                                                המשך לצפות
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2 line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                        {course.title}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
                                        {course.description}
                                    </p>

                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
                                            <div className="flex items-center gap-1">
                                                <Clock size={16} />
                                                <span>{course.duration}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Award size={16} />
                                                <span className="capitalize">{course.level}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {course.purchaseInfo && (
                                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
                                            נרכש ב-{course.purchaseInfo.purchaseDate?.toDate?.()?.toLocaleDateString('he-IL') ||
                                            course.purchaseInfo.purchasedAt?.toDate?.()?.toLocaleDateString('he-IL') ||
                                            'לא זמין'}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default MyCourses;