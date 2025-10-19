// src/pages/PersonalizedDashboard.jsx - COMPLETE WITH ONBOARDING INTEGRATION
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Brain, Target, TrendingUp, Calculator, Award, Zap, AlertCircle, Sparkles, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { profileService } from '../services/profileService';
import MathTutor from '../components/ai/MathTutor';

const TOPIC_NAMES = {
    // Grade 7
    'similar-triangles': { name: 'דמיון במשולשים', icon: '📐', color: 'purple' },
    'proportions': { name: 'פרופורציה ויחסים', icon: '⚖️', color: 'blue' },
    'linear-equations': { name: 'משוואות לינאריות', icon: '🔢', color: 'green' },
    'graphs-functions': { name: 'גרפים של פונקציות', icon: '📊', color: 'pink' },
    'percentages': { name: 'אחוזים', icon: '%', color: 'yellow' },
    'triangles': { name: 'משולשים', icon: '△', color: 'indigo' },

    // Grade 8
    'quadratic-equations': { name: 'משוואות ריבועיות', icon: '²', color: 'red' },
    'polynomials': { name: 'פולינומים', icon: '🧮', color: 'orange' },
    'inequalities': { name: 'אי-שוויונות', icon: '≠', color: 'teal' },
    'pythagorean': { name: 'משפט פיתגורס', icon: '📏', color: 'cyan' },

    // Grade 9
    'powers-roots': { name: 'חזקות ושורשים', icon: '√', color: 'violet' },
    'geometry-advanced': { name: 'גאומטריה מתקדמת', icon: '⬡', color: 'fuchsia' },
    'probability': { name: 'הסתברות', icon: '🎲', color: 'rose' },
    'statistics': { name: 'סטטיסטיקה', icon: '📈', color: 'emerald' }
};

const PersonalizedDashboard = () => {
    const navigate = useNavigate();
    const { user, studentProfile, nexonProfile } = useAuthStore();
    const profile = studentProfile; // Alias for easier access
    const [greeting, setGreeting] = useState('');
    const [stats, setStats] = useState({
        questionsAnswered: 0,
        correctAnswers: 0,
        streak: 0,
        practiceTime: 0
    });
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [showPractice, setShowPractice] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Set greeting based on time
        const hour = new Date().getHours();
        const name = user?.displayName || nexonProfile?.name || 'תלמיד';

        let greetingText = '';
        if (hour < 12) greetingText = `בוקר טוב ${name}! ☀️`;
        else if (hour < 18) greetingText = `שלום ${name}! 🌤️`;
        else greetingText = `ערב טוב ${name}! 🌆`;

        setGreeting(greetingText);
    }, [user, nexonProfile]);

    useEffect(() => {
        loadStats();
    }, [user?.uid]);

    const loadStats = async () => {
        try {
            if (!user?.uid) return;

            const userStats = await profileService.getUserStats(user.uid);
            setStats(userStats || {
                questionsAnswered: 0,
                correctAnswers: 0,
                streak: 0,
                practiceTime: 0
            });
        } catch (error) {
            console.error('Error loading stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartPractice = (topicId) => {
        setSelectedTopic(topicId);
        setShowPractice(true);
    };

    const handleClosePractice = () => {
        setShowPractice(false);
        setSelectedTopic(null);
        loadStats(); // Reload stats after practice
    };

    const successRate = stats.questionsAnswered > 0
        ? Math.round((stats.correctAnswers / stats.questionsAnswered) * 100)
        : 0;

    const getMotivationalMessage = () => {
        if (stats.questionsAnswered === 0) {
            return 'בואו נתחיל את המסע שלך במתמטיקה! 🚀';
        }
        if (successRate >= 80) {
            return 'היום נתמקד בהבנה עמוקה 🧠';
        }
        if (successRate >= 60) {
            return 'בואו נשפר את הדיוק שלך! 🎯';
        }
        return 'בואו נתרגל יחד ונשתפר! 💪';
    };

    const getGradeDisplay = () => {
        const grade = nexonProfile?.grade || profile?.grade;
        if (grade === 'grade7' || grade === '7' || grade === 'ז') return 'ז׳';
        if (grade === 'grade8' || grade === '8' || grade === 'ח') return 'ח׳';
        if (grade === 'grade9' || grade === '9' || grade === 'ט') return 'ט׳';
        return grade || '';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
                    <p className="text-gray-600">טוען...</p>
                </div>
            </div>
        );
    }

    if (showPractice && selectedTopic) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
                <div className="max-w-4xl mx-auto">
                    <button
                        onClick={handleClosePractice}
                        className="mb-4 px-6 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors shadow-md"
                    >
                        ← חזרה ל-Dashboard
                    </button>

                    <MathTutor
                        gradeId={profile?.grade}
                        topicId={selectedTopic}
                        onClose={handleClosePractice}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 p-6">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Hero Greeting */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-2xl"
                >
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center">
                                <Brain className="w-12 h-12" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold mb-2">{greeting}</h1>
                                <p className="text-purple-100 text-lg">{getMotivationalMessage()}</p>
                                {profile && (
                                    <div className="flex items-center gap-3 mt-3 text-sm">
                                        <span className="px-3 py-1 bg-white/20 rounded-full">
                                            כיתה {getGradeDisplay()}
                                        </span>
                                        <span className="px-3 py-1 bg-white/20 rounded-full">
                                            {(profile.weakTopics?.length || Object.keys(nexonProfile?.topicMastery || {}).length || 0)} נושאים לתרגול
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid grid-cols-4 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <Target className="w-8 h-8 text-purple-500" />
                            <span className="text-3xl font-bold text-gray-800 dark:text-white">
                                {stats.questionsAnswered}
                            </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">שאלות נענו</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <CheckCircle className="w-8 h-8 text-green-500" />
                            <span className="text-3xl font-bold text-gray-800 dark:text-white">
                                {successRate}%
                            </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">אחוז הצלחה</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <Zap className="w-8 h-8 text-orange-500" />
                            <span className="text-3xl font-bold text-gray-800 dark:text-white">
                                {stats.streak}
                            </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">רצף ימים</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <Clock className="w-8 h-8 text-blue-500" />
                            <span className="text-3xl font-bold text-gray-800 dark:text-white">
                                {Math.floor(stats.practiceTime / 60)}
                            </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">דקות תרגול</p>
                    </motion.div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* LEFT: Weak Topics */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Your Selected Topics */}
                        {profile?.weakTopics && profile.weakTopics.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <Target className="w-8 h-8 text-orange-500" />
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        הנושאים שבחרת לתרגול
                                    </h2>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">
                                    בחרת {profile.weakTopics.length} נושאים שתרצה לחזק. בוא נתרגל אותם! 💪
                                </p>

                                <div className="grid grid-cols-2 gap-4">
                                    {profile.weakTopics.map((topicId, index) => {
                                        const topicInfo = TOPIC_NAMES[topicId];
                                        if (!topicInfo) return null;

                                        return (
                                            <motion.button
                                                key={topicId}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 0.5 + index * 0.1 }}
                                                onClick={() => handleStartPractice(topicId)}
                                                className="group p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 hover:from-purple-100 hover:to-pink-100 rounded-2xl border-2 border-purple-200 hover:border-purple-400 transition-all shadow-md hover:shadow-xl"
                                            >
                                                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                                                    {topicInfo.icon}
                                                </div>
                                                <h3 className="font-bold text-gray-800 dark:text-white mb-1">
                                                    {topicInfo.name}
                                                </h3>
                                                <div className="flex items-center justify-center gap-2 text-sm text-purple-600 dark:text-purple-400 font-medium">
                                                    <Sparkles className="w-4 h-4" />
                                                    <span>התחל תרגול</span>
                                                </div>
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}

                        {/* Quick Actions */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <motion.button
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                onClick={() => navigate('/practice')}
                                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all"
                            >
                                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Calculator className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center">תרגול רגיל</h3>
                            </motion.button>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 }}
                                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl text-center"
                            >
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Target className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">מטרת היום</h3>
                                <div className="text-3xl font-bold text-blue-600">{stats.questionsAnswered}/5</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">תרגילים</div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 }}
                                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl text-center"
                            >
                                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Award className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">רצף שלך</h3>
                                <div className="text-5xl font-bold text-orange-500">{stats.streak}🔥</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">ימים</div>
                            </motion.div>
                        </div>
                    </div>

                    {/* RIGHT: Profile & Progress */}
                    <div className="space-y-6">
                        {/* Profile Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center">
                                    <span className="text-3xl">🎓</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                        {user?.displayName || profile?.name || 'תלמיד'}
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                                        כיתה {getGradeDisplay()}
                                    </p>
                                </div>
                            </div>

                            {profile && (
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                        <span className="text-gray-600 dark:text-gray-400">נושאים לתרגול</span>
                                        <span className="font-bold text-purple-600 dark:text-purple-400">
                                            {profile.weakTopics?.length || 0}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                        <span className="text-gray-600 dark:text-gray-400">שאלות נענו</span>
                                        <span className="font-bold text-gray-900 dark:text-white">
                                            {stats.questionsAnswered}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                        <span className="text-gray-600 dark:text-gray-400">אחוז הצלחה</span>
                                        <span className="font-bold text-green-600 dark:text-green-400">
                                            {successRate}%
                                        </span>
                                    </div>
                                </div>
                            )}
                        </motion.div>

                        {/* Progress */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <TrendingUp className="w-6 h-6 text-green-500" />
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">התקדמות</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                                    <div className="text-4xl font-bold text-green-600">{stats.correctAnswers}</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">תשובות נכונות</div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                        <div className="text-2xl font-bold text-blue-600">{successRate}%</div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400">דיוק</div>
                                    </div>
                                    <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                                        <div className="text-2xl font-bold text-purple-600">
                                            {Math.floor(stats.practiceTime / 60)}m
                                        </div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400">זמן</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Personalized Tip */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border-2 border-purple-300 dark:border-purple-700 rounded-2xl p-6"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                <h4 className="font-bold text-purple-900 dark:text-purple-300">טיפ מנקסון</h4>
                            </div>
                            <p className="text-sm text-purple-800 dark:text-purple-200">
                                {stats.questionsAnswered === 0
                                    ? 'בוא נתחיל! בחר נושא למעלה והתחל לתרגל 🚀'
                                    : successRate >= 80
                                        ? 'אתה עושה עבודה מצוינת! המשך ככה! 🌟'
                                        : 'כל תרגול מקרב אותך למטרה. המשך להתאמן! 💪'
                                }
                            </p>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PersonalizedDashboard;