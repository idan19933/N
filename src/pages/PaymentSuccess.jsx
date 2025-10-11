import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { collection, addDoc, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import useAuthStore from '../store/authStore';

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user } = useAuthStore();
    const [saving, setSaving] = useState(true);
    const [error, setError] = useState(null);

    const sessionId = searchParams.get('session_id');
    const courseId = searchParams.get('courseId');

    useEffect(() => {
        console.log('💳 Payment Success Page');
        console.log('User:', user);
        console.log('Session ID:', sessionId);
        console.log('Course ID:', courseId);

        if (user && courseId && sessionId) {
            savePurchase();
        } else {
            console.error('Missing data:', { hasUser: !!user, sessionId, courseId });
            if (!user) {
                setTimeout(() => {
                    if (useAuthStore.getState().user) {
                        savePurchase();
                    }
                }, 1000);
            } else {
                setSaving(false);
            }
        }
    }, [user, courseId, sessionId]);

    const savePurchase = async () => {
        try {
            console.log('💾 Starting purchase save...');

            const currentUser = user || useAuthStore.getState().user;

            if (!currentUser || !currentUser.uid) {
                console.error('❌ No user!');
                setError('משתמש לא מחובר');
                setSaving(false);
                return;
            }

            console.log('👤 User ID:', currentUser.uid);
            console.log('📚 Course ID:', courseId);

            // Check if purchase already exists
            const purchasesRef = collection(db, 'purchases');
            const purchaseQuery = query(
                purchasesRef,
                where('userId', '==', currentUser.uid),
                where('courseId', '==', courseId)
            );

            console.log('🔍 Checking for existing purchase...');
            const existingPurchases = await getDocs(purchaseQuery);
            console.log('📦 Existing purchases:', existingPurchases.size);

            if (!existingPurchases.empty) {
                console.log('✅ Purchase already exists!');
                existingPurchases.forEach(doc => {
                    console.log('Existing purchase:', doc.id, doc.data());
                });
                setSaving(false);
                return;
            }

            // Get course details
            console.log('📚 Getting course details...');
            const courseRef = doc(db, 'courses', courseId);
            const courseDoc = await getDoc(courseRef);

            if (!courseDoc.exists()) {
                console.error('❌ Course not found!');
                setError('הקורס לא נמצא');
                setSaving(false);
                return;
            }

            const courseData = courseDoc.data();
            console.log('Course data:', courseData);

            // Create purchase
            const purchaseData = {
                userId: currentUser.uid,
                courseId: courseId,
                sessionId: sessionId,
                amount: parseFloat(courseData.price) || 0,
                status: 'completed',
                purchasedAt: new Date(),
                courseName: courseData.title,
                userEmail: currentUser.email
            };

            console.log('💾 Creating purchase with data:', purchaseData);

            const docRef = await addDoc(purchasesRef, purchaseData);

            console.log('✅ Purchase saved successfully with ID:', docRef.id);

            // Verify it was saved
            const verifyDoc = await getDoc(doc(db, 'purchases', docRef.id));
            console.log('✅ Verified purchase exists:', verifyDoc.exists(), verifyDoc.data());

            setSaving(false);

        } catch (error) {
            console.error('❌ Error saving purchase:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            setError('שגיאה בשמירת הרכישה: ' + error.message);
            setSaving(false);
        }
    };

    if (saving) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">מעבד את הרכישה...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
                    <div className="text-red-600 mb-4 text-4xl">❌</div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">שגיאה</h1>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <div className="flex gap-4">
                        <button
                            onClick={() => navigate('/courses')}
                            className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                        >
                            חזרה לקורסים
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                        >
                            נסה שוב
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-6 sm:p-8 text-center"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="flex justify-center mb-6"
                >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="text-green-600" size={40} />
                    </div>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4"
                >
                    תשלום בוצע בהצלחה! 🎉
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-gray-600 mb-6 sm:mb-8 text-base sm:text-lg"
                >
                    הקורס שלך מוכן! אתה יכול להתחיל ללמוד עכשיו.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-col gap-4"
                >
                    <button
                        onClick={() => {
                            console.log('🚀 Navigating to course:', courseId);
                            navigate(`/courses/${courseId}`);
                        }}
                        className="w-full px-6 py-3 sm:py-4 bg-indigo-600 text-white rounded-xl font-bold text-base sm:text-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-lg"
                    >
                        התחל ללמוד
                        <ArrowRight size={20} />
                    </button>

                    <button
                        onClick={() => navigate('/my-courses')}
                        className="w-full px-6 py-3 sm:py-4 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                    >
                        הקורסים שלי
                    </button>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default PaymentSuccess;