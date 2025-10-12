import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import useAuthStore from '../store/authStore';
import { handleSuccessfulPurchase } from '../services/paymentService';
import { AnimatedPage } from '../components/animations/AnimatedPage';

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user } = useAuthStore();
    const [courseName, setCourseName] = useState('');
    const [courseImage, setCourseImage] = useState('');
    const courseId = searchParams.get('courseId');

    useEffect(() => {
        const loadCourse = async () => {
            if (courseId && user) {
                try {
                    const courseDoc = await getDoc(doc(db, 'courses', courseId));
                    if (courseDoc.exists()) {
                        const courseData = courseDoc.data();
                        setCourseName(courseData.title);
                        setCourseImage(courseData.image);

                        // ✅ שלח התראת רכישה עם כל הפרטים
                        await handleSuccessfulPurchase(
                            user.uid,                           // userId
                            user.displayName || user.email,     // userName
                            courseId,                           // courseId
                            courseData.title,                   // courseName
                            courseData.image || '',             // courseImage
                            courseData.price || 0,              // ✅ amount - הסכום מהקורס
                            user.email || ''                    // ✅ userEmail - אימייל המשתמש
                        );

                        console.log('✅ Purchase processed and notification sent');
                    }
                } catch (error) {
                    console.error('Error loading course:', error);
                }
            }
        };

        loadCourse();
    }, [courseId, user]);

    return (
        <AnimatedPage>
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="w-24 h-24 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                        <CheckCircle className="text-green-600 dark:text-green-400" size={48} />
                    </motion.div>

                    <h1 className="text-3xl font-black text-gray-800 dark:text-white mb-4">
                        הרכישה הושלמה בהצלחה! 🎉
                    </h1>

                    <p className="text-gray-600 dark:text-gray-300 mb-2">
                        {courseName ? `רכשת את הקורס` : 'הרכישה שלך הושלמה'}
                    </p>

                    {courseName && (
                        <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mb-6">
                            "{courseName}"
                        </p>
                    )}

                    {courseImage && (
                        <motion.img
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            src={courseImage}
                            alt={courseName}
                            className="w-full h-48 object-cover rounded-lg mb-6"
                        />
                    )}

                    <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-4 mb-6">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            🎓 הקורס זמין עכשיו במסך "הקורסים שלי"
                        </p>
                    </div>

                    <div className="space-y-3">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate(courseId ? `/courses/${courseId}` : '/my-courses')}
                            className="w-full py-3 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg font-bold hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
                        >
                            {courseId ? 'התחל ללמוד 🚀' : 'לקורסים שלי'}
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/')}
                            className="w-full py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                        >
                            <ArrowLeft size={20} />
                            חזרה לדף הבית
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        </AnimatedPage>
    );
};

export default PaymentSuccess;