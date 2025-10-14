// src/pages/CourseDetail.jsx
import React, { useState, useEffect, useRef } from 'react';
import { notifyCourseCompleted, notifyCoursePurchase } from '../services/notificationService';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import useAuthStore from '../store/authStore';
import { createCheckoutSession } from '../services/paymentService';
import { Play, Lock, CheckCircle, Clock, Award, ChevronDown, Ticket } from 'lucide-react';
import {
    saveVideoProgress,
    getVideoProgress,
    getCourseProgress,
    getAllSectionsProgress
} from '../services/progressService';
import { getSections, getLessons } from '../services/curriculumService';
import { validateCode, useCode, CODE_TYPES } from '../services/codeService';
import { formatPrice } from '../utils/currency';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedPage, fadeInUp } from '../components/animations/AnimatedPage';
import { Spinner } from '../components/ui/Skeletons';
import ReviewSection from '../components/courses/ReviewSection';

const CourseDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuthStore();
    const videoRef = useRef(null);
    const videoContainerRef = useRef(null);

    const [course, setCourse] = useState(null);
    const [sections, setSections] = useState([]);
    const [expandedSections, setExpandedSections] = useState({});
    const [hasPurchased, setHasPurchased] = useState(false);
    const [loading, setLoading] = useState(true);
    const [checkingPurchase, setCheckingPurchase] = useState(true);
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [courseProgress, setCourseProgress] = useState(null);
    const [lessonProgress, setLessonProgress] = useState({});
    const [sectionProgress, setSectionProgress] = useState({});
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [promoCode, setPromoCode] = useState('');
    const [appliedCode, setAppliedCode] = useState(null);
    const [applyingCode, setApplyingCode] = useState(false);

    const FREE_SECTIONS_COUNT = 2;

    const isMobile = () => {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
    };

    useEffect(() => {
        loadCourse();
    }, [id]);

    useEffect(() => {
        if (user && id) {
            checkPurchaseStatus();
        } else {
            setHasPurchased(false);
            setCheckingPurchase(false);
        }
    }, [user?.uid, id]);

    // ✅ FIXED: Single useEffect that loads all progress together
    useEffect(() => {
        if (user && sections.length > 0) {
            loadProgress();
        }
    }, [user?.uid, sections.length]);

    useEffect(() => {
        if (selectedLesson && user) {
            loadLessonProgress();
        }
    }, [selectedLesson?.id, user?.uid]);

    useEffect(() => {
        if (selectedLesson && videoContainerRef.current) {
            const scrollDelay = isMobile() ? 300 : 100;
            const scrollTimer = setTimeout(() => {
                if (videoContainerRef.current) {
                    const yOffset = isMobile() ? -80 : -20;
                    const element = videoContainerRef.current;
                    const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                    window.scrollTo({ top: y, behavior: 'smooth' });
                }
            }, scrollDelay);
            return () => clearTimeout(scrollTimer);
        }
    }, [selectedLesson]);

    // ✅ Updated video event listeners - uses ACTUAL video duration
    useEffect(() => {
        if (!videoRef.current || !selectedLesson || !user) return;

        const video = videoRef.current;

        const handleTimeUpdate = () => {
            if (!video.paused && video.duration) {
                const actualVideoDurationMinutes = video.duration / 60;

                saveVideoProgress(
                    user.uid,
                    id,
                    selectedLesson.id,
                    video.currentTime,
                    video.duration,
                    actualVideoDurationMinutes
                );
            }
        };

        const handleVideoEnd = async () => {
            if (!video.duration) {
                console.error('⚠️ Video duration not available');
                toast.error('שגיאה: לא ניתן לשמור התקדמות');
                return;
            }

            const actualVideoDurationMinutes = video.duration / 60;

            console.log('💾 Saving completed lesson:', {
                lessonId: selectedLesson.id,
                lessonTitle: selectedLesson.title,
                actualDurationMinutes: actualVideoDurationMinutes.toFixed(2),
                durationField: selectedLesson.duration
            });

            await saveVideoProgress(
                user.uid,
                id,
                selectedLesson.id,
                video.duration,
                video.duration,
                actualVideoDurationMinutes,
                true
            );

            // ✅ FIX: Add delay and reload all progress together
            setTimeout(async () => {
                await loadProgress();
                goToNextLesson();
            }, 500);
        };

        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('ended', handleVideoEnd);

        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('ended', handleVideoEnd);
        };
    }, [selectedLesson, user, id]);

    const goToNextLesson = () => {
        const currentSectionIndex = sections.findIndex(s =>
            s.lessons?.some(l => l.id === selectedLesson.id)
        );

        if (currentSectionIndex === -1) return;

        const currentSection = sections[currentSectionIndex];
        const currentLessonIndex = currentSection.lessons.findIndex(l => l.id === selectedLesson.id);

        if (currentLessonIndex < currentSection.lessons.length - 1) {
            const nextLesson = currentSection.lessons[currentLessonIndex + 1];
            if (!canAccessLesson(currentSectionIndex, nextLesson)) {
                setShowPaymentModal(true);
                return;
            }
            setSelectedLesson(nextLesson);
            return;
        }

        if (currentSectionIndex < sections.length - 1) {
            const nextSection = sections[currentSectionIndex + 1];
            if (nextSection.lessons && nextSection.lessons.length > 0) {
                const nextLesson = nextSection.lessons[0];
                if (!canAccessLesson(currentSectionIndex + 1, nextLesson)) {
                    setShowPaymentModal(true);
                    return;
                }
                setSelectedLesson(nextLesson);
                setExpandedSections(prev => ({ ...prev, [nextSection.id]: true }));
            }
        } else {
            sendCompletionNotification();
            toast.success('🎉 כל הכבוד! סיימת את הקורס!', { duration: 5000 });
        }
    };

    const sendCompletionNotification = async () => {
        try {
            await notifyCourseCompleted(
                user.uid,
                user.displayName || user.email,
                id,
                course.title,
                course.image
            );
        } catch (error) {
            console.error('Error sending notification:', error);
        }
    };

    const canAccessLesson = (sectionIndex, lesson) => {
        if (sectionIndex < FREE_SECTIONS_COUNT) return true;
        if (lesson.isFree) return true;
        return hasPurchased;
    };

    const checkPurchaseStatus = async () => {
        try {
            setCheckingPurchase(true);
            const purchaseQuery = query(
                collection(db, 'purchases'),
                where('userId', '==', user.uid),
                where('courseId', '==', id)
            );
            const purchaseSnapshot = await getDocs(purchaseQuery);
            setHasPurchased(!purchaseSnapshot.empty);
        } catch (error) {
            console.error('Error checking purchase:', error);
            setHasPurchased(false);
        } finally {
            setCheckingPurchase(false);
        }
    };

    const loadCourse = async () => {
        try {
            setLoading(true);
            const courseDoc = await getDoc(doc(db, 'courses', id));

            if (courseDoc.exists()) {
                setCourse({ id: courseDoc.id, ...courseDoc.data() });
            } else {
                toast.error('הקורס לא נמצא');
            }

            const sectionsData = await getSections(id);
            const sectionsWithLessons = await Promise.all(
                sectionsData.map(async (section) => {
                    const lessons = await getLessons(id, section.id);
                    return { ...section, lessons };
                })
            );

            setSections(sectionsWithLessons);

            if (sectionsWithLessons.length > 0) {
                setExpandedSections({ [sectionsWithLessons[0].id]: true });
            }
        } catch (error) {
            console.error('Error loading course:', error);
            toast.error('שגיאה בטעינת הקורס');
        } finally {
            setLoading(false);
        }
    };

    // ✅ FIXED: Combined progress loading function
    const loadProgress = async () => {
        if (!user) return;

        try {
            console.log('📊 Loading all progress for course:', id);

            const allLessons = sections.flatMap(s => s.lessons || []);

            // Load all progress types in parallel
            const [courseProgressData, sectionProgressData, ...lessonProgressResults] = await Promise.all([
                getCourseProgress(user.uid, id),
                getAllSectionsProgress(user.uid, id),
                ...allLessons.map(lesson => getVideoProgress(user.uid, id, lesson.id))
            ]);

            console.log('✅ Progress loaded:', {
                course: courseProgressData,
                sections: Object.keys(sectionProgressData).length,
                lessons: lessonProgressResults.length
            });

            // Update all state together
            setCourseProgress(courseProgressData);
            setSectionProgress(sectionProgressData);

            // Map lesson progress
            const progressMap = {};
            allLessons.forEach((lesson, index) => {
                progressMap[lesson.id] = lessonProgressResults[index];
            });
            setLessonProgress(progressMap);

        } catch (error) {
            console.error('❌ Error loading progress:', error);
        }
    };

    const loadLessonProgress = async () => {
        try {
            const progress = await getVideoProgress(user.uid, id, selectedLesson.id);
            setLessonProgress(prev => ({ ...prev, [selectedLesson.id]: progress }));

            if (videoRef.current && progress.currentTime > 0 && !progress.completed) {
                videoRef.current.currentTime = progress.currentTime;
            }
        } catch (error) {
            console.error('Error loading lesson progress:', error);
        }
    };

    const handleApplyCode = async () => {
        if (!isAuthenticated) {
            toast.error('יש להתחבר כדי להשתמש בקוד');
            navigate('/login');
            return;
        }

        if (!promoCode.trim()) {
            toast.error('נא להזין קוד');
            return;
        }

        setApplyingCode(true);
        const loadingToast = toast.loading('בודק קוד...');

        try {
            const result = await validateCode(promoCode, id);

            if (result.valid) {
                setAppliedCode(result.codeData);
                toast.success(`✅ ${result.message}`, { id: loadingToast });
            } else {
                toast.error(`❌ ${result.message}`, { id: loadingToast });
            }
        } catch (error) {
            console.error('Error applying code:', error);
            toast.error('שגיאה בבדיקת הקוד', { id: loadingToast });
        } finally {
            setApplyingCode(false);
        }
    };

    const handleBuyNow = async () => {
        if (!isAuthenticated) {
            toast.error('יש להתחבר כדי לרכוש את הקורס');
            navigate('/login');
            return;
        }

        if (!course || !course.price) {
            toast.error('שגיאה: מידע הקורס לא תקין');
            return;
        }

        if (appliedCode && appliedCode.type === CODE_TYPES.UNLOCK) {
            const loadingToast = toast.loading('פותח קורס...');

            try {
                const purchaseData = {
                    userId: user.uid,
                    courseId: id,
                    amount: 0,
                    status: 'completed',
                    purchaseDate: new Date(),
                    purchasedAt: new Date(),
                    paymentMethod: 'promo_code',
                    codeUsed: appliedCode.code,
                    courseName: course.title,
                    courseImage: course.image
                };

                await addDoc(collection(db, 'purchases'), purchaseData);
                await notifyCoursePurchase({
                    userId: user.uid,
                    userName: user.displayName || user.email,
                    userEmail: user.email,
                    courseId: id,
                    courseName: course.title,
                    courseImage: course.image,
                    amount: 0,
                    paymentMethod: 'promo_code',
                    codeUsed: appliedCode.code
                });
                await useCode(appliedCode.id);

                toast.success('🎉 הקורס נפתח בהצלחה!', { id: loadingToast });
                setHasPurchased(true);
                setAppliedCode(null);
                setPromoCode('');

                setTimeout(() => window.location.reload(), 1500);
                return;
            } catch (error) {
                console.error('Error unlocking course:', error);
                toast.error('שגיאה בפתיחת הקורס: ' + error.message, { id: loadingToast });
                return;
            }
        }

        const finalPrice = appliedCode && appliedCode.type === CODE_TYPES.DISCOUNT
            ? course.price * (1 - appliedCode.discount / 100)
            : course.price;

        const loadingToast = toast.loading('מכין את עמוד התשלום...');

        try {
            const result = await createCheckoutSession(id, finalPrice, appliedCode?.id, {
                userId: user.uid,
                userName: user.displayName || user.email,
                userEmail: user.email,
                courseName: course.title,
                courseImage: course.image
            });

            if (result.success && result.url) {
                toast.success('מעביר לתשלום...', { id: loadingToast });
                if (appliedCode) await useCode(appliedCode.id);
                window.location.href = result.url;
            } else {
                toast.error('שגיאה ביצירת תשלום: ' + (result.error || 'Unknown error'), { id: loadingToast });
            }
        } catch (error) {
            console.error('Error in handleBuyNow:', error);
            toast.error('שגיאה: ' + error.message, { id: loadingToast });
        }
    };

    const handleLessonClick = (lesson, sectionIndex) => {
        if (!canAccessLesson(sectionIndex, lesson)) {
            setShowPaymentModal(true);
            toast.error('🔒 תוכן זה דורש רכישה');
            return;
        }

        if (selectedLesson?.id === lesson.id && videoContainerRef.current) {
            const yOffset = isMobile() ? -80 : -20;
            const element = videoContainerRef.current;
            const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
            return;
        }

        setSelectedLesson(lesson);
    };

    const toggleSection = (sectionId) => {
        setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
    };

    const PurchaseCard = () => {
        if (hasPurchased) {
            return (
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-green-50 dark:bg-green-900 border-2 border-green-500 dark:border-green-600 rounded-xl p-6"
                >
                    <div className="flex items-center gap-3 text-green-700 dark:text-green-300">
                        <CheckCircle size={24} />
                        <span className="font-bold text-lg">יש לך גישה מלאה!</span>
                    </div>
                </motion.div>
            );
        }

        return (
            <motion.div variants={fadeInUp} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-4 mb-4">
                    <p className="text-green-800 dark:text-green-200 text-sm font-medium">
                        🎁 2 הסקשנים הראשונים חינמיים!
                    </p>
                </div>

                {isAuthenticated && (
                    <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                            <Ticket size={16} />
                            יש לך קוד?
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={promoCode}
                                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                placeholder="הזן קוד"
                                disabled={applyingCode}
                                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg font-mono"
                            />
                            <button
                                onClick={handleApplyCode}
                                disabled={applyingCode || !promoCode.trim()}
                                className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {applyingCode ? '...' : 'החל'}
                            </button>
                        </div>
                        {appliedCode && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-3 p-3 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg"
                            >
                                <p className="text-green-800 dark:text-green-200 text-sm font-semibold">
                                    {appliedCode.type === CODE_TYPES.DISCOUNT
                                        ? `🎉 הנחה של ${appliedCode.discount}% הופעלה!`
                                        : `🎉 קורס חינם!`}
                                </p>
                            </motion.div>
                        )}
                    </div>
                )}

                <div className="mb-4">
                    {appliedCode && appliedCode.type === CODE_TYPES.DISCOUNT ? (
                        <>
                            <div className="text-2xl text-gray-500 dark:text-gray-400 line-through">
                                {formatPrice(course.price)}
                            </div>
                            <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                                {formatPrice(course.price * (1 - appliedCode.discount / 100))}
                            </div>
                            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                                חסכת {formatPrice(course.price * (appliedCode.discount / 100))}!
                            </p>
                        </>
                    ) : appliedCode && appliedCode.type === CODE_TYPES.UNLOCK ? (
                        <div className="text-4xl font-bold text-green-600 dark:text-green-400">
                            חינם! 🎁
                        </div>
                    ) : (
                        <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                            {formatPrice(course.price)}
                        </div>
                    )}
                </div>

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleBuyNow}
                    className="w-full py-4 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg font-bold text-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors mb-4"
                >
                    {appliedCode && appliedCode.type === CODE_TYPES.UNLOCK
                        ? 'פתח את הקורס חינם'
                        : 'קנה גישה מלאה'}
                </motion.button>

                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    גישה לכל התכנים לכל החיים
                </p>
            </motion.div>
        );
    };

    const CurriculumContent = () => (
        <div className="space-y-2">
            {sections.map((section, sectionIndex) => {
                const isFreeSection = sectionIndex < FREE_SECTIONS_COUNT;
                const secProgress = sectionProgress[section.id];

                return (
                    <motion.div
                        key={section.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: sectionIndex * 0.1 }}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                    >
                        <button
                            onClick={() => toggleSection(section.id)}
                            className="w-full text-right p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3 flex-1">
                                <div className="flex-1">
                                    <div className="font-bold text-gray-800 dark:text-white flex items-center gap-2 flex-wrap">
                                        <span>{sectionIndex + 1}. {section.title}</span>

                                        {secProgress && secProgress.totalLessons > 0 && (
                                            <span className="text-sm font-normal text-indigo-600 dark:text-indigo-400">
                                                ({secProgress.completionRate.toFixed(0)}%)
                                            </span>
                                        )}

                                        {isFreeSection && (
                                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded text-xs font-normal">
                                                חינם
                                            </span>
                                        )}
                                        {!isFreeSection && !hasPurchased && (
                                            <Lock size={16} className="text-gray-400 dark:text-gray-500" />
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        {secProgress ? (
                                            <span>
                                                {secProgress.completedLessons} מתוך {secProgress.totalLessons} שיעורים הושלמו
                                            </span>
                                        ) : (
                                            <span>{section.lessons?.length || 0} שיעורים</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <motion.div
                                animate={{ rotate: expandedSections[section.id] ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <ChevronDown size={20} className="text-gray-600 dark:text-gray-400" />
                            </motion.div>
                        </button>

                        <AnimatePresence>
                            {expandedSections[section.id] && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="border-t border-gray-200 dark:border-gray-700 overflow-hidden"
                                >
                                    {!section.lessons || section.lessons.length === 0 ? (
                                        <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                                            אין שיעורים בסקשן זה
                                        </div>
                                    ) : (
                                        section.lessons.map((lesson, lessonIndex) => {
                                            const progress = lessonProgress[lesson.id];
                                            const isCompleted = progress?.completed;
                                            const canPlay = canAccessLesson(sectionIndex, lesson);
                                            const isSelected = selectedLesson?.id === lesson.id;

                                            return (
                                                <motion.button
                                                    key={lesson.id}
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: lessonIndex * 0.05 }}
                                                    whileHover={canPlay ? { backgroundColor: "rgba(99, 102, 241, 0.05)" } : {}}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleLessonClick(lesson, sectionIndex);
                                                    }}
                                                    className={`w-full text-right p-3 transition-colors flex items-center justify-between ${
                                                        isSelected
                                                            ? 'bg-indigo-50 dark:bg-indigo-900 border-l-4 border-indigo-600 dark:border-indigo-400'
                                                            : ''
                                                    } ${!canPlay ? 'opacity-60' : 'cursor-pointer'}`}
                                                >
                                                    <div className="flex items-center gap-3 flex-1">
                                                        {canPlay ? (
                                                            isCompleted ? (
                                                                <CheckCircle className="text-green-600 dark:text-green-400 flex-shrink-0" size={20} />
                                                            ) : isSelected ? (
                                                                <div className="animate-pulse">
                                                                    <Play className="text-indigo-600 dark:text-indigo-400 flex-shrink-0" size={20} />
                                                                </div>
                                                            ) : (
                                                                <Play className="text-indigo-600 dark:text-indigo-400 flex-shrink-0" size={20} />
                                                            )
                                                        ) : (
                                                            <Lock className="text-gray-400 dark:text-gray-500 flex-shrink-0" size={20} />
                                                        )}

                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-semibold text-gray-800 dark:text-white truncate">
                                                                {sectionIndex + 1}.{lessonIndex + 1} {lesson.title}
                                                            </div>
                                                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                                                <span>{lesson.duration}</span>
                                                                {lesson.isFree && (
                                                                    <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded text-xs">
                                                                        Free
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {progress?.percentage > 0 && canPlay && (
                                                        <div className="text-sm text-indigo-600 dark:text-indigo-400 font-semibold flex-shrink-0">
                                                            {Math.round(progress.percentage)}%
                                                        </div>
                                                    )}
                                                </motion.button>
                                            );
                                        })
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                );
            })}
        </div>
    );

    if (loading || checkingPurchase) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
                <Spinner size="lg" />
                <p className="text-gray-600 dark:text-gray-400 mt-4">טוען קורס...</p>
            </div>
        );
    }

    if (!course) {
        return (
            <AnimatedPage>
                <div className="text-center py-16">
                    <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">הקורס לא נמצא</p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/courses')}
                        className="px-6 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600"
                    >
                        חזרה לקורסים
                    </motion.button>
                </div>
            </AnimatedPage>
        );
    }

    const progressPercentage = courseProgress?.completionRate || 0;
    const totalCourseDuration = courseProgress?.totalDurationMinutes || 0;
    const completedDuration = courseProgress?.totalWatchedMinutes || 0;

    return (
        <AnimatedPage>
            <div className="max-w-7xl mx-auto px-4 py-8" dir="rtl">
                <AnimatePresence>
                    {showPaymentModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                            onClick={() => setShowPaymentModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                transition={{ type: "spring", duration: 0.3 }}
                                className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="text-center">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.2, type: "spring" }}
                                        className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4"
                                    >
                                        <Lock className="text-yellow-600 dark:text-yellow-400" size={32} />
                                    </motion.div>
                                    <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                                        תוכן זה דורש רכישה
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                                        2 הסקשנים הראשונים חינמיים! 🎉
                                        <br />
                                        כדי להמשיך לצפות בשיעורים נוספים, יש לרכוש את הקורס המלא.
                                    </p>
                                    <div className="flex gap-4">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={handleBuyNow}
                                            className="flex-1 py-3 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg font-bold hover:bg-indigo-700 dark:hover:bg-indigo-600"
                                        >
                                            קנה עכשיו - {formatPrice(course.price)}
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setShowPaymentModal(false)}
                                            className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600"
                                        >
                                            סגור
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {user && courseProgress && courseProgress.totalLessons > 0 && (
                    <motion.div
                        variants={fadeInUp}
                        initial="initial"
                        animate="animate"
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                                התקדמות בקורס
                            </h3>
                            <motion.span
                                key={progressPercentage.toFixed(1)}
                                initial={{ scale: 1.2 }}
                                animate={{ scale: 1 }}
                                className="text-2xl font-bold text-indigo-600 dark:text-indigo-400"
                            >
                                {progressPercentage.toFixed(1)}%
                            </motion.span>
                        </div>

                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-3 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(progressPercentage, 100)}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-4 rounded-full"
                            />
                        </div>

                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <span>{completedDuration.toFixed(1)} דקות נצפו</span>
                            <span>מתוך {totalCourseDuration.toFixed(0)} דקות</span>
                        </div>

                        <div className="text-sm text-gray-500 dark:text-gray-500">
                            {courseProgress.completedLessons} מתוך {courseProgress.totalLessons} שיעורים הושלמו
                        </div>
                    </motion.div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <motion.div
                            ref={videoContainerRef}
                            variants={fadeInUp}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-6"
                        >
                            {selectedLesson ? (
                                <div className="relative">
                                    <video
                                        ref={videoRef}
                                        controls
                                        className="w-full"
                                        src={selectedLesson.videoUrl}
                                        onLoadedMetadata={(e) => {
                                            const progress = lessonProgress[selectedLesson.id];
                                            if (progress?.currentTime > 0 && !progress.completed) {
                                                e.target.currentTime = progress.currentTime;
                                            }

                                            const actualDurationMinutes = e.target.duration / 60;
                                            console.log('🎬 Video loaded:', {
                                                title: selectedLesson.title,
                                                actualDuration: actualDurationMinutes.toFixed(2) + ' mins',
                                                fieldDuration: selectedLesson.duration
                                            });
                                        }}
                                    >
                                        Your browser does not support the video tag.
                                    </video>
                                    <div className="p-4">
                                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                                            {selectedLesson.title}
                                        </h2>
                                        <p className="text-gray-600 dark:text-gray-300 mt-2">
                                            {selectedLesson.description}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <motion.img
                                    whileHover={{ scale: 1.02 }}
                                    src={course.image}
                                    alt={course.title}
                                    className="w-full h-96 object-cover"
                                />
                            )}
                        </motion.div>

                        <motion.div
                            variants={fadeInUp}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6"
                        >
                            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
                                {course.title}
                            </h1>
                            <p className="text-gray-600 dark:text-gray-300 mb-6">
                                {course.description}
                            </p>
                            <div className="flex items-center gap-6 text-gray-600 dark:text-gray-400">
                                <div className="flex items-center gap-2">
                                    <Clock size={20} />
                                    <span>{course.duration}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Award size={20} />
                                    <span>תעודה בסיום</span>
                                </div>
                            </div>
                        </motion.div>

                        <div className="mb-6">
                            <PurchaseCard />
                        </div>

                        <motion.div
                            variants={fadeInUp}
                            className="lg:hidden bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8"
                        >
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                                תוכן הקורס
                            </h3>
                            <CurriculumContent />
                        </motion.div>

                        <ReviewSection
                            courseId={id}
                            userId={user?.uid}
                            hasPurchased={hasPurchased}
                        />
                    </div>

                    <div className="hidden lg:block lg:sticky lg:top-8 lg:self-start">
                        <motion.div
                            variants={fadeInUp}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
                        >
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                                תוכן הקורס
                            </h3>
                            <CurriculumContent />
                        </motion.div>
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
};

export default CourseDetail;