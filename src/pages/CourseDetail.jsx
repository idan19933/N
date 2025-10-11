import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
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
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [courseProgress, setCourseProgress] = useState(null);
    const [lessonProgress, setLessonProgress] = useState({});

    useEffect(() => {
        loadCourse();
    }, [id]);

    useEffect(() => {
        if (user && hasPurchased) {
            loadProgress();
        }
    }, [user, hasPurchased]);

    useEffect(() => {
        if (selectedLesson && user && hasPurchased) {
            loadLessonProgress();
        }
    }, [selectedLesson]);

    useEffect(() => {
        if (!videoRef.current || !selectedLesson || !user || !hasPurchased) return;

        const interval = setInterval(() => {
            const video = videoRef.current;
            if (video && !video.paused) {
                saveVideoProgress(
                    user.uid,
                    id,
                    selectedLesson.id,
                    video.currentTime,
                    video.duration
                );
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [selectedLesson, user, hasPurchased]);

    const loadCourse = async () => {
        try {
            const courseDoc = await getDoc(doc(db, 'courses', id));
            if (courseDoc.exists()) {
                setCourse({ id: courseDoc.id, ...courseDoc.data() });
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

            if (user) {
                const purchaseQuery = query(
                    collection(db, 'purchases'),
                    where('userId', '==', user.uid),
                    where('courseId', '==', id)
                );
                const purchaseSnapshot = await getDocs(purchaseQuery);
                setHasPurchased(!purchaseSnapshot.empty);
            }
        } catch (error) {
            console.error('Error loading course:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadProgress = async () => {
        const progress = await getCourseProgress(user.uid, id);
        setCourseProgress(progress);

        const allLessons = sections.flatMap(s => s.lessons || []);
        const progressPromises = allLessons.map(lesson =>
            getVideoProgress(user.uid, id, lesson.id)
        );
        const progressResults = await Promise.all(progressPromises);

        const progressMap = {};
        allLessons.forEach((lesson, index) => {
            progressMap[lesson.id] = progressResults[index];
        });
        setLessonProgress(progressMap);
    };

    const loadLessonProgress = async () => {
        const progress = await getVideoProgress(user.uid, id, selectedLesson.id);
        setLessonProgress(prev => ({
            ...prev,
            [selectedLesson.id]: progress
        }));

        if (videoRef.current && progress.currentTime > 0) {
            videoRef.current.currentTime = progress.currentTime;
        }
    };

    // ✅ MODIFIED FUNCTION: Fixed course.price -> parsed and validated
    const handleBuyNow = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        const price = parseFloat(course?.price);

        if (isNaN(price)) {
            console.error('❌ Invalid course price:', course?.price);
            alert('שגיאה: מחיר הקורס אינו תקין');
            return;
        }

        try {
            const result = await createCheckoutSession(id, course.title, price, user.uid);
            if (result.success && result.url) {
                window.location.href = result.url;
            }
        } catch (error) {
            console.error('Error creating checkout:', error);
        }
    };

    const handleLessonClick = (lesson) => {
        if (!hasPurchased && !lesson.isFree) return;
        setSelectedLesson(lesson);
    };

    const toggleSection = (sectionId) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!course) {
        return <div className="text-center py-16">Course not found</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8" dir="rtl">
            {hasPurchased && courseProgress && (
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-800">התקדמות בקורס</h3>
                        <span className="text-2xl font-bold text-indigo-600">
                            {Math.round(courseProgress.completionRate)}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                        <div
                            className="bg-gradient-to-r from-indigo-500 to-purple-600 h-4 rounded-full transition-all"
                            style={{ width: `${courseProgress.completionRate}%` }}
                        />
                    </div>
                    <p className="text-gray-600 text-sm">
                        {courseProgress.completedLessons} מתוך {courseProgress.totalLessons} שיעורים הושלמו
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
                        {selectedLesson && (hasPurchased || selectedLesson.isFree) ? (
                            <div className="relative">
                                <video
                                    ref={videoRef}
                                    controls
                                    className="w-full"
                                    src={selectedLesson.videoUrl}
                                    onLoadedMetadata={(e) => {
                                        const progress = lessonProgress[selectedLesson.id];
                                        if (progress?.currentTime > 0) {
                                            e.target.currentTime = progress.currentTime;
                                        }
                                    }}
                                >
                                    Your browser does not support the video tag.
                                </video>
                                {lessonProgress[selectedLesson.id]?.percentage > 0 && (
                                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-sm">
                                        התקדמות: {Math.round(lessonProgress[selectedLesson.id].percentage)}%
                                    </div>
                                )}
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

                <div>
                    {!hasPurchased ? (
                        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                            <div className="text-4xl font-bold text-indigo-600 mb-4">
                                ${course.price}
                            </div>
                            <button
                                onClick={handleBuyNow}
                                className="w-full py-4 bg-indigo-600 text-white rounded-lg font-bold text-lg hover:bg-indigo-700 transition-colors mb-4"
                            >
                                קנה עכשיו
                            </button>
                            <p className="text-sm text-gray-600 text-center">
                                גישה מלאה לכל החיים
                            </p>
                        </div>
                    ) : null}

                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">תוכן הקורס</h3>
                        <div className="space-y-2">
                            {sections.map((section, sectionIndex) => (
                                <div key={section.id} className="border border-gray-200 rounded-lg">
                                    <button
                                        onClick={() => toggleSection(section.id)}
                                        className="w-full text-right p-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
                                    >
                                        <div>
                                            <div className="font-bold text-gray-800">
                                                {sectionIndex + 1}. {section.title}
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {section.lessons?.length || 0} שיעורים
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
                                            {section.lessons?.map((lesson, lessonIndex) => {
                                                const progress = lessonProgress[lesson.id];
                                                const isCompleted = progress?.completed;
                                                const canPlay = hasPurchased || lesson.isFree;

                                                return (
                                                    <button
                                                        key={lesson.id}
                                                        onClick={() => handleLessonClick(lesson)}
                                                        disabled={!canPlay}
                                                        className={`w-full text-right p-3 transition-colors flex items-center justify-between ${
                                                            selectedLesson?.id === lesson.id
                                                                ? 'bg-indigo-50 border-l-4 border-indigo-600'
                                                                : 'hover:bg-gray-50'
                                                        } ${!canPlay ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
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
                                                        {hasPurchased && progress?.percentage > 0 && (
                                                            <div className="text-sm text-indigo-600 font-semibold flex-shrink-0">
                                                                {Math.round(progress.percentage)}%
                                                            </div>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseDetail;
