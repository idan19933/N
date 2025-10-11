import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Users, BookOpen, ChevronDown, ChevronUp, PlayCircle, Lock, CheckCircle } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getCourseCurriculum } from '../services/curriculumService';
import { checkCourseOwnership, createCheckoutSession } from '../services/paymentService';
import useAuthStore from '../store/authStore';

const CourseDetail = () => {
    const { id: courseId } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuthStore();

    const [course, setCourse] = useState(null);
    const [curriculum, setCurriculum] = useState([]);
    const [expandedSections, setExpandedSections] = useState({});
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(false);
    const [owned, setOwned] = useState(false);
    const [selectedLesson, setSelectedLesson] = useState(null);

    useEffect(() => {
        loadCourseData();
    }, [courseId, user]);

    const loadCourseData = async () => {
        try {
            setLoading(true);

            // Load course info
            const courseRef = doc(db, 'courses', courseId);
            const courseSnap = await getDoc(courseRef);

            if (!courseSnap.exists()) {
                navigate('/');
                return;
            }

            setCourse({ id: courseSnap.id, ...courseSnap.data() });

            // Load curriculum
            const curriculumData = await getCourseCurriculum(courseId);
            setCurriculum(curriculumData);

            // Check if user owns the course
            if (user) {
                const isOwned = await checkCourseOwnership(user.uid, courseId);
                setOwned(isOwned);
            }

        } catch (error) {
            console.error('Error loading course:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSection = (sectionId) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    const handlePurchase = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        setPurchasing(true);
        try {
            // Redirect to Stripe Checkout
            await createCheckoutSession(
                courseId,
                course.title,
                course.price,
                user.uid
            );
            // User will be redirected to Stripe Checkout automatically
            // After successful payment, Stripe webhook will create the purchase record
            // and user will be redirected to /payment-success
        } catch (error) {
            console.error('Payment error:', error);
            alert('Failed to start checkout. Please try again.');
            setPurchasing(false);
        }
    };

    const handleLessonClick = (lesson) => {
        if (owned || lesson.isFree) {
            setSelectedLesson(lesson);
        }
    };

    const calculateTotalStats = () => {
        let totalLessons = 0;
        let totalDuration = 0;

        curriculum.forEach(section => {
            totalLessons += section.lessons?.length || 0;
        });

        return { totalLessons };
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!course) {
        return <div>Course not found</div>;
    }

    const stats = calculateTotalStats();

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Course Header */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Left Column - Course Info */}
                <div className="lg:col-span-2">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-8 text-white">
                        <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
                        <p className="text-lg mb-6 opacity-90">{course.description}</p>

                        <div className="flex flex-wrap gap-6 text-sm">
                            <div className="flex items-center gap-2">
                                <Clock size={20} />
                                <span>{course.duration}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <BookOpen size={20} />
                                <span>{stats.totalLessons} lessons</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users size={20} />
                                <span>{course.students || 0} students</span>
                            </div>
                        </div>

                        {owned && (
                            <div className="mt-6 flex items-center gap-2 bg-green-500 bg-opacity-20 rounded-lg px-4 py-2 w-fit">
                                <CheckCircle size={20} />
                                <span className="font-semibold">You own this course</span>
                            </div>
                        )}
                    </div>

                    {/* Course Preview Video */}
                    {course.videoUrl && (
                        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-2xl font-bold mb-4">Course Preview</h2>
                            <video
                                controls
                                className="w-full rounded-lg"
                                poster={course.image}
                            >
                                <source src={course.videoUrl} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                        </div>
                    )}

                    {/* Selected Lesson Player */}
                    {selectedLesson && (
                        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-2xl font-bold mb-4">{selectedLesson.title}</h2>
                            <video
                                controls
                                className="w-full rounded-lg mb-4"
                                key={selectedLesson.videoUrl}
                            >
                                <source src={selectedLesson.videoUrl} type="video/mp4" />
                                Your browser does not support the video tag.
                            </video>
                            <p className="text-gray-600">{selectedLesson.description}</p>
                        </div>
                    )}
                </div>

                {/* Right Column - Purchase Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
                        <div className="text-center mb-6">
                            <img
                                src={course.image}
                                alt={course.title}
                                className="w-full h-48 object-cover rounded-lg mb-4"
                            />
                            <div className="text-4xl font-bold text-indigo-600 mb-2">
                                ${course.price}
                            </div>
                        </div>

                        {owned ? (
                            <button
                                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                                disabled
                            >
                                <CheckCircle size={20} />
                                Already Purchased
                            </button>
                        ) : (
                            <button
                                onClick={handlePurchase}
                                disabled={purchasing}
                                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {purchasing ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </span>
                                ) : (
                                    'Buy Now'
                                )}
                            </button>
                        )}

                        <div className="mt-6 space-y-3 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <CheckCircle size={16} className="text-green-600" />
                                <span>Lifetime access</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle size={16} className="text-green-600" />
                                <span>All course materials included</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle size={16} className="text-green-600" />
                                <span>Certificate of completion</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CheckCircle size={16} className="text-green-600" />
                                <span>30-day money back guarantee</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Course Curriculum */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-3xl font-bold mb-6">Course Curriculum</h2>

                {curriculum.length === 0 ? (
                    <p className="text-gray-600">This course doesn't have a curriculum yet.</p>
                ) : (
                    <div className="space-y-4">
                        {curriculum.map((section, sectionIndex) => (
                            <div key={section.id} className="border border-gray-200 rounded-lg overflow-hidden">
                                {/* Section Header */}
                                <button
                                    onClick={() => toggleSection(section.id)}
                                    className="w-full bg-gray-50 p-4 flex items-center justify-between hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="font-semibold text-lg">
                                            Section {sectionIndex + 1}: {section.title}
                                        </span>
                                        <span className="text-sm text-gray-600">
                                            ({section.lessons?.length || 0} lessons)
                                        </span>
                                    </div>
                                    {expandedSections[section.id] ?
                                        <ChevronUp size={20} /> :
                                        <ChevronDown size={20} />
                                    }
                                </button>

                                {/* Lessons List */}
                                {expandedSections[section.id] && (
                                    <div className="p-4 space-y-2">
                                        {section.lessons?.map((lesson, lessonIndex) => {
                                            const canAccess = owned || lesson.isFree;

                                            return (
                                                <button
                                                    key={lesson.id}
                                                    onClick={() => handleLessonClick(lesson)}
                                                    disabled={!canAccess}
                                                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                                                        canAccess
                                                            ? 'hover:bg-gray-100 cursor-pointer'
                                                            : 'opacity-50 cursor-not-allowed'
                                                    } ${selectedLesson?.id === lesson.id ? 'bg-indigo-50' : ''}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        {canAccess ? (
                                                            <PlayCircle size={20} className="text-indigo-600" />
                                                        ) : (
                                                            <Lock size={20} className="text-gray-400" />
                                                        )}
                                                        <div className="text-left">
                                                            <p className="font-medium">
                                                                {lessonIndex + 1}. {lesson.title}
                                                            </p>
                                                            {lesson.isFree && (
                                                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                                                    Free Preview
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <span className="text-sm text-gray-600">
                                                        {lesson.duration}
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CourseDetail;