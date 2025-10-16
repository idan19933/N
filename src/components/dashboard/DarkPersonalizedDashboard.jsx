// src/components/dashboard/DarkPersonalizedDashboard.jsx - COMPLETE
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Target, TrendingUp, Award, Clock, Sparkles, Play, Brain } from 'lucide-react';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';

const DarkPersonalizedDashboard = ({ studentProfile, user, onCourseClick, onViewAllCourses }) => {
    console.log('🎨 DarkPersonalizedDashboard RENDERING!');

    const navigate = useNavigate();
    const [recommendedCourses, setRecommendedCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        completedLessons: 0,
        currentStreak: 0,
        totalPoints: 0,
        weeklyGoal: 0
    });

    const getTheme = () => {
        const subjects = studentProfile?.difficultSubjects || [];
        if (subjects.includes('Math')) return {
            gradient: 'from-blue-500 via-purple-500 to-pink-500',
            icon: '🧮'
        };
        if (subjects.includes('Science')) return {
            gradient: 'from-green-500 via-teal-500 to-blue-500',
            icon: '⚗️'
        };
        return {
            gradient: 'from-orange-500 via-red-500 to-pink-500',
            icon: '✨'
        };
    };

    const theme = getTheme();

    useEffect(() => {
        loadRecommendedCourses();
    }, [studentProfile]);

    const loadRecommendedCourses = async () => {
        try {
            console.log('Loading courses from Firestore...');

            const coursesRef = collection(db, 'courses');
            const coursesQuery = query(coursesRef);
            const coursesSnapshot = await getDocs(coursesQuery);

            const allCourses = coursesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            console.log('All courses loaded:', allCourses.length);

            let filtered = allCourses;
            if (studentProfile?.difficultSubjects && studentProfile.difficultSubjects.length > 0) {
                filtered = allCourses.filter(course =>
                    studentProfile.difficultSubjects.some(subject =>
                        course.subject?.toLowerCase().includes(subject.toLowerCase()) ||
                        course.category?.toLowerCase().includes(subject.toLowerCase()) ||
                        course.title?.toLowerCase().includes(subject.toLowerCase())
                    )
                );
            }

            if (filtered.length === 0) {
                filtered = allCourses.slice(0, 6);
            } else {
                filtered = filtered.slice(0, 6);
            }

            console.log('Filtered courses:', filtered.length);
            setRecommendedCourses(filtered);

        } catch (error) {
            console.error('Failed to load courses:', error);
            setRecommendedCourses([]);
        } finally {
            setIsLoading(false);
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <motion.div
                        animate={{
                            rotate: 360,
                            scale: [1, 1.2, 1]
                        }}
                        transition={{
                            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                            scale: { duration: 1, repeat: Infinity }
                        }}
                        className="text-6xl mb-4"
                    >
                        {theme.icon}
                    </motion.div>
                    <h2 className="text-2xl font-bold text-gray-100 mb-2">
                        Preparing Your Learning Space
                    </h2>
                    <p className="text-gray-400">Setting up your personalized courses...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900">
            <div className={`bg-gradient-to-r ${theme.gradient}`}>
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                        <h1 className="text-4xl font-bold mb-2 text-white">
                            {getGreeting()}, {user?.name || user?.email?.split('@')[0] || 'Student'}! 👋
                        </h1>
                        <p className="text-white/90 text-lg">
                            Ready to continue your learning journey?
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                        {[
                            { icon: BookOpen, label: 'Lessons', value: stats.completedLessons, suffix: '' },
                            { icon: Target, label: 'Streak', value: stats.currentStreak, suffix: ' days' },
                            { icon: Award, label: 'Points', value: stats.totalPoints, suffix: '' },
                            { icon: Clock, label: 'This Week', value: stats.weeklyGoal, suffix: '%' }
                        ].map((stat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20"
                            >
                                <stat.icon className="w-6 h-6 mb-2 text-white" />
                                <p className="text-3xl font-bold text-white">{stat.value}{stat.suffix}</p>
                                <p className="text-white/80 text-sm">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* AI PRACTICE SECTION */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="bg-gradient-to-r from-green-600 via-teal-600 to-blue-600 rounded-2xl p-6 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                <div className="flex items-center mb-2">
                                    <Brain className="w-8 h-8 text-white mr-3" />
                                    <h3 className="text-2xl font-bold text-white">AI Math Practice</h3>
                                </div>
                                <p className="text-white/90 mb-4">
                                    Practice with our AI tutor! Real-time feedback, mistake detection, and step-by-step guidance.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => navigate('/practice/fractions')}
                                        className="px-6 py-3 bg-white text-green-600 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center"
                                    >
                                        🍕 Fractions
                                    </button>
                                    <button
                                        onClick={() => navigate('/practice/algebra')}
                                        className="px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center"
                                    >
                                        🔢 Algebra
                                    </button>
                                </div>
                            </div>
                            <div className="hidden md:block text-9xl opacity-20">
                                🎯
                            </div>
                        </div>
                    </div>
                </motion.div>

                {studentProfile && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border-l-4 border-orange-500 rounded-2xl p-6 mb-8">
                        <div className="flex items-start">
                            <Sparkles className="w-6 h-6 text-orange-400 mr-3 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="font-semibold text-gray-100 mb-2">
                                    Your Personalized Learning Path 🎯
                                </h3>
                                <p className="text-gray-300">
                                    Based on your profile, we've selected courses that match your {studentProfile.gradeLevel || 'grade'} level
                                    {studentProfile.difficultSubjects?.length > 0 && (
                                        <> and focus on {studentProfile.difficultSubjects.join(', ')}</>
                                    )}
                                    {studentProfile.learningStyle && (
                                        <>. Each lesson is tailored to your {studentProfile.learningStyle} learning style!</>
                                    )}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}

                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-100">
                            {studentProfile?.difficultSubjects?.length > 0 ? 'Recommended For You' : 'Available Courses'}
                        </h2>
                        <button onClick={onViewAllCourses}
                                className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center">
                            View All Courses →
                        </button>
                    </div>

                    {recommendedCourses.length === 0 ? (
                        <div className="text-center py-12 bg-gray-800 rounded-2xl border border-gray-700">
                            <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-400 mb-4">No courses available yet</p>
                            <button onClick={onViewAllCourses}
                                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors">
                                Browse All Courses
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {recommendedCourses.map((course, idx) => (
                                <motion.div key={course.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }} onClick={() => onCourseClick(course.id)}
                                            className="bg-gray-800 border border-gray-700 rounded-2xl shadow-lg hover:shadow-2xl hover:border-indigo-500/50 transition-all duration-300 overflow-hidden group cursor-pointer">
                                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                                        <div className="text-4xl mb-3">{course.icon || '📚'}</div>
                                        <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                                        <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                                            {course.level || 'All Levels'}
                                        </span>
                                    </div>
                                    <div className="p-6">
                                        <p className="text-gray-400 mb-4 line-clamp-2">
                                            {course.description || 'Explore this comprehensive course'}
                                        </p>
                                        <button className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-500/50 transition-all flex items-center justify-center">
                                            <Play className="w-5 h-5 mr-2" />
                                            Start Learning
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DarkPersonalizedDashboard;