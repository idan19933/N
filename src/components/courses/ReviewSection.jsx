import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const staggerContainer = {
    animate: { transition: { staggerChildren: 0.1 } }
};

const ReviewSection = ({ courseId, userId, hasPurchased }) => {
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (courseId) {
            loadReviews();
        }
    }, [courseId]);

    const loadReviews = async () => {
        try {
            setLoading(true);

            const reviewsQuery = query(
                collection(db, 'reviews'),
                where('courseId', '==', courseId)
            );

            const snapshot = await getDocs(reviewsQuery);

            if (snapshot.empty) {
                console.log('No reviews found for this course');
                setReviews([]);
                setLoading(false);
                return;
            }

            const reviewsData = await Promise.all(
                snapshot.docs.map(async (reviewDoc) => {
                    const review = { id: reviewDoc.id, ...reviewDoc.data() };

                    try {
                        const userDoc = await getDoc(doc(db, 'users', review.userId));
                        if (userDoc.exists()) {
                            review.userName = userDoc.data().name || userDoc.data().email;
                        } else {
                            review.userName = 'משתמש';
                        }
                    } catch (error) {
                        console.error('Error loading user:', error);
                        review.userName = 'משתמש';
                    }

                    return review;
                })
            );

            // Sort by date (newest first)
            const sortedReviews = reviewsData.sort((a, b) => {
                const dateA = a.createdAt?.toDate?.() || new Date(0);
                const dateB = b.createdAt?.toDate?.() || new Date(0);
                return dateB - dateA;
            });

            setReviews(sortedReviews);
        } catch (error) {
            console.error('Error loading reviews:', error);
            setReviews([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!userId) {
            toast.error('יש להתחבר כדי לכתוב ביקורת');
            return;
        }

        if (!hasPurchased) {
            toast.error('רק משתמשים שרכשו את הקורס יכולים לכתוב ביקורת');
            return;
        }

        if (rating === 0) {
            toast.error('אנא בחר דירוג');
            return;
        }

        if (!comment.trim()) {
            toast.error('אנא כתוב תוכן לביקורת');
            return;
        }

        try {
            setSubmitting(true);

            await addDoc(collection(db, 'reviews'), {
                courseId,
                userId,
                rating,
                comment: comment.trim(),
                createdAt: new Date()
            });

            toast.success('✅ הביקורת נשלחה בהצלחה!');
            setRating(0);
            setComment('');
            loadReviews();
        } catch (error) {
            console.error('Error submitting review:', error);
            toast.error('❌ שגיאה בשליחת הביקורת');
        } finally {
            setSubmitting(false);
        }
    };

    const averageRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : 0;

    return (
        <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8"
            dir="rtl"
        >
            {/* Header with Average Rating */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    ביקורות ודירוגים
                </h2>
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                            {averageRating}
                        </div>
                        <div className="flex justify-end mb-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    size={20}
                                    className={star <= averageRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}
                                />
                            ))}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {reviews.length} ביקורות
                        </p>
                    </div>
                </div>
            </div>

            {/* Add Review Form */}
            {userId && hasPurchased && (
                <motion.form
                    variants={fadeInUp}
                    onSubmit={handleSubmit}
                    className="mb-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                    <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">
                        כתוב ביקורת
                    </h3>

                    {/* Star Rating */}
                    <div className="flex gap-2 mb-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onMouseEnter={() => setHoveredRating(star)}
                                onMouseLeave={() => setHoveredRating(0)}
                                onClick={() => setRating(star)}
                                className="transition-transform hover:scale-110"
                            >
                                <Star
                                    size={36}
                                    className={`cursor-pointer transition-all ${
                                        star <= (hoveredRating || rating)
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-gray-300 dark:text-gray-600'
                                    }`}
                                />
                            </button>
                        ))}
                        {rating > 0 && (
                            <span className="mr-2 text-gray-600 dark:text-gray-400">
                                ({rating} מתוך 5)
                            </span>
                        )}
                    </div>

                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="ספר לנו מה דעתך על הקורס..."
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600
                                 bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                                 rounded-lg mb-4 focus:ring-2 focus:ring-indigo-500
                                 focus:border-transparent"
                        rows={4}
                        required
                    />

                    <button
                        type="submit"
                        disabled={rating === 0 || submitting || !comment.trim()}
                        className="px-6 py-3 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg
                                 hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-50
                                 disabled:cursor-not-allowed font-semibold transition-colors"
                    >
                        {submitting ? 'שולח...' : 'שלח ביקורת'}
                    </button>
                </motion.form>
            )}

            {/* Reviews List */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="animate-pulse">
                            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                        </div>
                    ))}
                </div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p className="text-lg">עדיין אין ביקורות לקורס זה</p>
                    {hasPurchased && (
                        <p className="text-sm mt-2">היה הראשון לכתוב ביקורת!</p>
                    )}
                </div>
            ) : (
                <motion.div
                    variants={staggerContainer}
                    initial="initial"
                    animate="animate"
                    className="space-y-4"
                >
                    {reviews.map((review) => (
                        <motion.div
                            key={review.id}
                            variants={fadeInUp}
                            className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600
                                                  rounded-full flex items-center justify-center text-white
                                                  font-bold text-lg flex-shrink-0">
                                        {review.userName?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {review.userName || 'משתמש'}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <div className="flex">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        size={16}
                                                        className={star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                                {review.createdAt?.toDate?.()?.toLocaleDateString('he-IL') || 'לאחרונה'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-700 dark:text-gray-300 mr-15">
                                {review.comment}
                            </p>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </motion.div>
    );
};

export default ReviewSection;