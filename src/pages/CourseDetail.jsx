import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import useAuthStore from '../store/authStore';
import { createCheckoutSession } from '../services/paymentService';
import { Play, Lock, CheckCircle, Clock, Award, ChevronDown, ChevronUp } from 'lucide-react';
import { saveVideoProgress, getVideoProgress, getCourseProgress } from '../services/progressService';
import { getSections, getLessons } from '../services/curriculumService';

const CourseDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuthStore();
    const videoRef = useRef(null);

    const [course, setCourse] = useState(null);
    const [sections, setSections] = useState([]);
    const [expandedSections, setExpandedSections] = useState({});
    const [hasPurchased, setHasPurchased] = useState(false);
    const [loading, setLoading] = useState(true);
    const [checkingPurchase, setCheckingPurchase] = useState(true);
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [courseProgress, setCourseProgress] = useState(null);
    const [lessonProgress, setLessonProgress] = useState({});
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [totalCourseDuration, setTotalCourseDuration] = useState(0);
    const [completedDuration, setCompletedDuration] = useState(0);

    const FREE_SECTIONS_COUNT = 2;

    useEffect(() => {
        console.log('🔄 Course ID changed:', id);
        loadCourse();
    }, [id]);

    useEffect(() => {
        console.log('🔄 Purchase check effect');
        console.log('Has user:', !!user);
        console.log('User ID:', user?.uid);
        console.log('Course ID:', id);

        if (user && id) {
            checkPurchaseStatus();
        } else {
            setHasPurchased(false);
            setCheckingPurchase(false);
        }
    }, [user?.uid, id]);

    useEffect(() => {
        console.log('🔄 Progress effect triggered');
        console.log('Has user:', !!user);
        console.log('Sections length:', sections.length);

        if (user && sections.length > 0) {
            console.log('✅ Loading progress...');
            loadProgress();
        } else {
            console.log('⏭️ Skipping progress load');
        }
    }, [user?.uid, sections.length]);

    useEffect(() => {
        if (selectedLesson && user) {
            console.log('🎥 Selected lesson changed:', selectedLesson.title);
            loadLessonProgress();
        }
    }, [selectedLesson?.id, user?.uid]);

    useEffect(() => {
        if (!videoRef.current || !selectedLesson || !user) return;

        const video = videoRef.current;

        const handleTimeUpdate = () => {
            if (!video.paused) {
                saveVideoProgress(
                    user.uid,
                    id,
                    selectedLesson.id,
                    video.currentTime,
                    video.duration
                );
            }
        };

        const handleVideoEnd = async () => {
            console.log('🎬 Video ended, moving to next...');

            await saveVideoProgress(
                user.uid,
                id,
                selectedLesson.id,
                video.duration,
                video.duration,
                true
            );

            goToNextLesson();
        };

        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('ended', handleVideoEnd);

        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('ended', handleVideoEnd);
        };
    }, [selectedLesson, user]);

    useEffect(() => {
        console.log('🔢 Calculate durations triggered');
        console.log('Sections:', sections.length);
        console.log('Lesson progress keys:', Object.keys(lessonProgress).length);

        if (sections.length > 0) {
            calculateDurations();
        }
    }, [sections.length, lessonProgress]);

    const calculateDurations = () => {
        console.log('📊 Calculating durations...');

        let totalMinutes = 0;
        let completedMinutes = 0;

        sections.forEach((section, sIndex) => {
            section.lessons?.forEach((lesson, lIndex) => {
                const duration = parseDuration(lesson.duration);
                totalMinutes += duration;

                console.log(`Section ${sIndex+1}.${lIndex+1} (${lesson.title}): ${duration} mins`);

                const progress = lessonProgress[lesson.id];
                if (progress?.completed) {
                    completedMinutes += duration;
                    console.log(`  ✅ Completed: +${duration} mins`);
                } else if (progress) {
                    console.log(`  ⏸️ In progress: ${progress.percentage}%`);
                } else {
                    console.log(`  ⬜ Not started`);
                }
            });
        });

        console.log('📊 Total:', totalMinutes, 'mins');
        console.log('✅ Completed:', completedMinutes, 'mins');
        console.log('📈 Percentage:', totalMinutes > 0 ? (completedMinutes / totalMinutes * 100).toFixed(2) : 0, '%');

        setTotalCourseDuration(totalMinutes);
        setCompletedDuration(completedMinutes);
    };

    const parseDuration = (durationStr) => {
        if (!durationStr) return 0;
        const parts = durationStr.split(':');
        if (parts.length === 2) {
            const mins = parseInt(parts[0]) || 0;
            const secs = parseInt(parts[1]) || 0;
            return mins + (secs / 60);
        }
        return 0;
    };

    const goToNextLesson = () => {
        const currentSectionIndex = sections.findIndex(s =>
            s.lessons?.some(l => l.id === selectedLesson.id)
        );

        if (currentSectionIndex === -1) return;

        const currentSection = sections[currentSectionIndex];
        const currentLessonIndex = currentSection.lessons.findIndex(
            l => l.id === selectedLesson.id
        );

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
                setExpandedSections(prev => ({
                    ...prev,
                    [nextSection.id]: true
                }));
            }
        } else {
            console.log('🎉 Course completed!');
            sendCompletionNotification();
            alert('🎉 כל הכבוד! סיימת את הקורס!');
        }
    };

    const sendCompletionNotification = async () => {
        try {
            await addDoc(collection(db, 'notifications'), {
                type: 'course_completed',
                userId: user.uid,
                userName: user.displayName || user.email,
                courseId: id,
                courseName: course.title,
                timestamp: new Date(),
                read: false
            });
            console.log('✅ Completion notification sent');
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
            console.log('🔍 Checking purchase status...');
            setCheckingPurchase(true);

            const purchaseQuery = query(
                collection(db, 'purchases'),
                where('userId', '==', user.uid),
                where('courseId', '==', id)
            );

            const purchaseSnapshot = await getDocs(purchaseQuery);
            const purchased = !purchaseSnapshot.empty;

            console.log('💳 Purchase status:', purchased);
            console.log('📦 Purchases found:', purchaseSnapshot.size);

            setHasPurchased(purchased);
        } catch (error) {
            console.error('❌ Error checking purchase:', error);
            setHasPurchased(false);
        } finally {
            setCheckingPurchase(false);
        }
    };

    const loadCourse = async () => {
        try {
            setLoading(true);
            console.log('📚 Loading course:', id);

            const courseDoc = await getDoc(doc(db, 'courses', id));
            if (courseDoc.exists()) {
                const courseData = { id: courseDoc.id, ...courseDoc.data() };
                setCourse(courseData);
                console.log('✅ Course loaded:', courseData.title);
            } else {
                console.error('❌ Course not found');
            }

            const sectionsData = await getSections(id);
            console.log('📦 Sections loaded:', sectionsData.length);

            const sectionsWithLessons = await Promise.all(
                sectionsData.map(async (section) => {
                    const lessons = await getLessons(id, section.id);
                    console.log(`Section ${section.title}: ${lessons.length} lessons`);
                    return { ...section, lessons };
                })
            );

            setSections(sectionsWithLessons);

            if (sectionsWithLessons.length > 0) {
                setExpandedSections({ [sectionsWithLessons[0].id]: true });
            }
        } catch (error) {
            console.error('❌ Error loading course:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadProgress = async () => {
        try {
            console.log('📊 Loading progress...');
            console.log('User:', user.uid);
            console.log('Course:', id);
            console.log('Sections:', sections.length);

            const progress = await getCourseProgress(user.uid, id);
            console.log('Course progress:', progress);
            setCourseProgress(progress);

            const allLessons = sections.flatMap(s => s.lessons || []);
            console.log('Total lessons:', allLessons.length);

            const progressPromises = allLessons.map(lesson => {
                console.log('Loading progress for lesson:', lesson.id, lesson.title);
                return getVideoProgress(user.uid, id, lesson.id);
            });
            const progressResults = await Promise.all(progressPromises);

            console.log('Progress results:', progressResults);

            const progressMap = {};
            allLessons.forEach((lesson, index) => {
                progressMap[lesson.id] = progressResults[index];
                console.log(`Lesson ${lesson.title}:`, progressResults[index]);
            });

            console.log('Final progress map:', progressMap);
            setLessonProgress(progressMap);
        } catch (error) {
            console.error('❌ Error loading progress:', error);
        }
    };

    const loadLessonProgress = async () => {
        try {
            const progress = await getVideoProgress(user.uid, id, selectedLesson.id);
            console.log('Lesson progress:', progress);

            setLessonProgress(prev => ({
                ...prev,
                [selectedLesson.id]: progress
            }));

            if (videoRef.current && progress.currentTime > 0 && !progress.completed) {
                videoRef.current.currentTime = progress.currentTime;
            }
        } catch (error) {
            console.error('Error loading lesson progress:', error);
        }
    };

    const handleBuyNow = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        if (!course || !course.price) {
            console.error('❌ Invalid course data:', course);
            alert('שגיאה: מידע הקורס לא תקין');
            return;
        }

        try {
            console.log('🛒 Buying course:', course.title);
            console.log('💵 Price:', course.price);
            console.log('🆔 Course ID:', id);

            const result = await createCheckoutSession(id, course.price);

            console.log('📦 Checkout result:', result);

            if (result.success && result.url) {
                console.log('✅ Redirecting to:', result.url);
                window.location.href = result.url;
            } else {
                console.error('❌ Checkout failed:', result.error);
                alert('שגיאה ביצירת תשלום: ' + (result.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('❌ Error in handleBuyNow:', error);
            alert('שגיאה: ' + error.message);
        }
    };

    const handleLessonClick = (lesson, sectionIndex) => {
        console.log('🎯 Lesson clicked:', lesson.title);
        console.log('Can access:', canAccessLesson(sectionIndex, lesson));

        if (!canAccessLesson(sectionIndex, lesson)) {
            setShowPaymentModal(true);
            return;
        }
        setSelectedLesson(lesson);
    };

    const toggleSection = (sectionId) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    if (loading || checkingPurchase) {
        return (
            <div className="flex flex-col justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mb-4"></div>
                <p className="text-gray-600">טוען...</p>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="text-center py-16">
                <p className="text-xl text-gray-600">Course not found</p>
                <button
                    onClick={() => navigate('/courses')}
                    className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg"
                >
                    חזרה לקורסים
                </button>
            </div>
        );
    }

    const progressPercentage = totalCourseDuration > 0
        ? (completedDuration / totalCourseDuration) * 100
        : 0;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8" dir="rtl">
            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-8 max-w-md w-full">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Lock className="text-yellow-600" size={32} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-4">
                                תוכן זה דורש רכישה
                            </h3>
                            <p className="text-gray-600 mb-6">
                                2 הסקשנים הראשונים חינמיים! 🎉
                                <br />
                                כדי להמשיך לצפות בשיעורים נוספים, יש לרכוש את הקורס המלא.
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={handleBuyNow}
                                    className="flex-1 py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700"
                                >
                                    קנה עכשיו - ${course.price}
                                </button>
                                <button
                                    onClick={() => setShowPaymentModal(false)}
                                    className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300"
                                >
                                    סגור
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Enhanced Progress Bar */}
            {user && (
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-800">התקדמות בקורס</h3>
                        <span className="text-2xl font-bold text-indigo-600">
                            {Math.round(progressPercentage)}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                        <div
                            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-4 rounded-full transition-all duration-500"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                        <span>{Math.round(completedDuration)} דקות הושלמו</span>
                        <span>מתוך {Math.round(totalCourseDuration)} דקות</span>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Video Player */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
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
                                    }}
                                >
                                    Your browser does not support the video tag.
                                </video>
                                <div className="p-4">
                                    <h2 className="text-xl font-bold text-gray-800">{selectedLesson.title}</h2>
                                    <p className="text-gray-600 mt-2">{selectedLesson.description}</p>
                                </div>
                            </div>
                        ) : (
                            <img
                                src={course.image}
                                alt={course.title}
                                className="w-full h-96 object-cover"
                            />
                        )}
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h1 className="text-3xl font-bold text-gray-800 mb-4">{course.title}</h1>
                        <p className="text-gray-600 mb-6">{course.description}</p>

                        <div className="flex items-center gap-6 text-gray-600">
                            <div className="flex items-center gap-2">
                                <Clock size={20} />
                                <span>{course.duration}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Award size={20} />
                                <span>תעודה בסיום</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div>
                    {!hasPurchased && (
                        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                                <p className="text-green-800 text-sm font-medium">
                                    🎁 2 הסקשנים הראשונים חינמיים!
                                </p>
                            </div>
                            <div className="text-4xl font-bold text-indigo-600 mb-4">
                                ${course.price}
                            </div>
                            <button
                                onClick={handleBuyNow}
                                className="w-full py-4 bg-indigo-600 text-white rounded-lg font-bold text-lg hover:bg-indigo-700 transition-colors mb-4"
                            >
                                קנה גישה מלאה
                            </button>
                            <p className="text-sm text-gray-600 text-center">
                                גישה לכל התכנים לכל החיים
                            </p>
                        </div>
                    )}

                    {hasPurchased && (
                        <div className="bg-green-50 border-2 border-green-500 rounded-xl p-6 mb-6">
                            <div className="flex items-center gap-3 text-green-700">
                                <CheckCircle size={24} />
                                <span className="font-bold text-lg">יש לך גישה מלאה!</span>
                            </div>
                        </div>
                    )}

                    {/* Curriculum */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">תוכן הקורס</h3>
                        <div className="space-y-2">
                            {sections.map((section, sectionIndex) => {
                                const isFreeSection = sectionIndex < FREE_SECTIONS_COUNT;

                                return (
                                    <div key={section.id} className="border border-gray-200 rounded-lg">
                                        <button
                                            onClick={() => toggleSection(section.id)}
                                            className="w-full text-right p-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div>
                                                    <div className="font-bold text-gray-800 flex items-center gap-2">
                                                        {sectionIndex + 1}. {section.title}
                                                        {isFreeSection && (
                                                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-normal">
                                                                חינם
                                                            </span>
                                                        )}
                                                        {!isFreeSection && !hasPurchased && (
                                                            <Lock size={16} className="text-gray-400" />
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        {section.lessons?.length || 0} שיעורים
                                                    </div>
                                                </div>
                                            </div>
                                            {expandedSections[section.id] ? (
                                                <ChevronUp size={20} className="text-gray-600" />
                                            ) : (
                                                <ChevronDown size={20} className="text-gray-600" />
                                            )}
                                        </button>

                                        {expandedSections[section.id] && (
                                            <div className="border-t border-gray-200">
                                                {!section.lessons || section.lessons.length === 0 ? (
                                                    <div className="p-4 text-center text-gray-500 text-sm">
                                                        אין שיעורים בסקשן זה
                                                    </div>
                                                ) : (
                                                    section.lessons.map((lesson, lessonIndex) => {
                                                        const progress = lessonProgress[lesson.id];
                                                        const isCompleted = progress?.completed;
                                                        const canPlay = canAccessLesson(sectionIndex, lesson);

                                                        return (
                                                            <button
                                                                key={lesson.id}
                                                                onClick={() => handleLessonClick(lesson, sectionIndex)}
                                                                className={`w-full text-right p-3 transition-colors flex items-center justify-between ${
                                                                    selectedLesson?.id === lesson.id
                                                                        ? 'bg-indigo-50 border-l-4 border-indigo-600'
                                                                        : 'hover:bg-gray-50'
                                                                } ${!canPlay ? 'opacity-60' : 'cursor-pointer'}`}
                                                            >
                                                                <div className="flex items-center gap-3 flex-1">
                                                                    {canPlay ? (
                                                                        isCompleted ? (
                                                                            <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
                                                                        ) : (
                                                                            <Play className="text-indigo-600 flex-shrink-0" size={20} />
                                                                        )
                                                                    ) : (
                                                                        <Lock className="text-gray-400 flex-shrink-0" size={20} />
                                                                    )}
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="font-semibold text-gray-800 truncate">
                                                                            {sectionIndex + 1}.{lessonIndex + 1} {lesson.title}
                                                                        </div>
                                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                            <span>{lesson.duration}</span>
                                                                            {lesson.isFree && (
                                                                                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                                                                                    Free
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                {progress?.percentage > 0 && canPlay && (
                                                                    <div className="text-sm text-indigo-600 font-semibold flex-shrink-0">
                                                                        {Math.round(progress.percentage)}%
                                                                    </div>
                                                                )}
                                                            </button>
                                                        );
                                                    })
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetail;