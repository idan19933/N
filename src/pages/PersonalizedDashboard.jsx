// src/pages/PersonalizedDashboard.jsx - NEXON ENHANCED VERSION
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Brain,
    Target,
    TrendingUp,
    BookOpen,
    Award,
    Zap,
    Heart,
    Calculator,
    CheckCircle,
    AlertCircle,
    Calendar,
    Clock
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import { getTopicsForStudent, getStudentLevelDisplay } from '../data/mathProblems';

const PersonalizedDashboard = () => {
    const navigate = useNavigate();
    const user = useAuthStore(state => state.user);
    const studentProfile = useAuthStore(state => state.studentProfile);
    const nexonProfile = useAuthStore(state => state.nexonProfile);

    const [greeting, setGreeting] = useState('');
    const [currentTime, setCurrentTime] = useState(new Date());

    // Get time-based greeting
    useEffect(() => {
        const hour = new Date().getHours();
        const name = nexonProfile?.name || user?.displayName || 'שלום';

        let greetingText = '';
        if (hour < 6) {
            greetingText = `${name}, אתה עדיין ער/ה? 😴`;
        } else if (hour < 12) {
            greetingText = `בוקר טוב ${name}! ☀️`;
        } else if (hour < 18) {
            greetingText = `שלום ${name}! 🌤️`;
        } else if (hour < 22) {
            greetingText = `ערב טוב ${name}! 🌆`;
        } else {
            greetingText = `${name}, זמן למנוחה! 🌙`;
        }

        setGreeting(greetingText);

        // Update time every minute
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);

        return () => clearInterval(interval);
    }, [nexonProfile, user]);

    // Get topics for student
    const studentTopics = nexonProfile ? getTopicsForStudent(nexonProfile) : [];
    const weakTopics = nexonProfile?.topicMastery
        ? Object.entries(nexonProfile.topicMastery)
            .filter(([_, level]) => level === 'struggle' || level === 'needs-work')
            .map(([topic]) => topic)
        : [];

    // Get motivational message based on their goal
    const getMotivationalMessage = () => {
        const goal = nexonProfile?.goalFocus;
        switch(goal) {
            case 'understanding':
                return 'היום נתמקד בהבנה עמוקה של המושגים 🧠';
            case 'speed':
                return 'בואו נתרגל פתרון מהיר ויעיל ⚡';
            case 'accuracy':
                return 'היום נשים לב לפרטים הקטנים 🎯';
            case 'confidence':
                return 'בואו נבנה ביטחון לקראת המבחן הבא 💪';
            default:
                return 'בואו נלמד ביחד משהו חדש היום! 🚀';
        }
    };

    // Get feeling emoji
    const getFeelingEmoji = () => {
        const feeling = nexonProfile?.mathFeeling;
        switch(feeling) {
            case 'love': return '😍';
            case 'okay': return '😐';
            case 'struggle': return '😰';
            default: return '🤔';
        }
    };

    // Get learning style icon
    const getLearningStyleIcon = () => {
        const style = nexonProfile?.learningStyle;
        switch(style) {
            case 'independent': return '💪';
            case 'ask': return '🙋';
            case 'quit': return '😔';
            default: return '📚';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Hero Section - Personalized Greeting */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-2xl"
                >
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center">
                                <Brain className="w-12 h-12 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold mb-2">{greeting}</h1>
                                <p className="text-purple-100 text-lg">
                                    {getMotivationalMessage()}
                                </p>
                                {nexonProfile && (
                                    <div className="flex items-center gap-3 mt-3 text-sm">
                                        <span className="px-3 py-1 bg-white/20 rounded-full">
                                            {getStudentLevelDisplay(nexonProfile)}
                                        </span>
                                        <span className="px-3 py-1 bg-white/20 rounded-full flex items-center gap-1">
                                            {getFeelingEmoji()} Math Feeling
                                        </span>
                                        <span className="px-3 py-1 bg-white/20 rounded-full flex items-center gap-1">
                                            {getLearningStyleIcon()} Learning Style
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold">{currentTime.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}</div>
                            <div className="text-purple-200 text-sm">
                                {currentTime.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Start Learning */}
                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        onClick={() => navigate('/practice')}
                        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all group"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Calculator className="w-8 h-8 text-white" />
                            </div>
                            <div className="flex-1 text-left">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">התחל ללמוד</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">Start Learning</p>
                            </div>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            תרגול עם נקסון - המורה הדיגיטלי שלך
                        </p>
                    </motion.button>

                    {/* Today's Goal */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center">
                                <Target className="w-8 h-8 text-white" />
                            </div>
                            <div className="flex-1 text-left">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">מטרת היום</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">Today's Goal</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">תרגילים שנפתרו</span>
                                <span className="font-bold text-blue-600">0/5</span>
                            </div>
                            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500" style={{ width: '0%' }}></div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Streak */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
                                <Award className="w-8 h-8 text-white" />
                            </div>
                            <div className="flex-1 text-left">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">רצף שלך</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">Your Streak</p>
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-5xl font-bold text-orange-500 mb-2">0🔥</div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">ימים רצופים של למידה</p>
                        </div>
                    </motion.div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Topics to Practice */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Weak Topics - Need Focus */}
                        {weakTopics.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <AlertCircle className="w-6 h-6 text-orange-500" />
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        נושאים שדורשים תשומת לב
                                    </h2>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    Topics that need attention • בואו נתמקד בהם היום
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {weakTopics.map((topic, index) => (
                                        <motion.div
                                            key={topic}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.5 + index * 0.1 }}
                                            className="p-4 bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-xl hover:shadow-lg transition-all cursor-pointer"
                                            onClick={() => navigate('/practice')}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <span className="text-white font-bold">!</span>
                                                </div>
                                                <div className="flex-1 text-right">
                                                    <div className="font-semibold text-gray-900 dark:text-white">
                                                        {topic}
                                                    </div>
                                                    <div className="text-xs text-orange-600 dark:text-orange-400">
                                                        {nexonProfile.topicMastery[topic] === 'struggle' ? 'מתקשה • Struggling' : 'צריך חיזוק • Needs work'}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* All Topics for Grade Level */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <BookOpen className="w-6 h-6 text-blue-500" />
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    נושאים לכיתה שלך
                                </h2>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Topics for your grade • {nexonProfile?.grade && `כיתה ${nexonProfile.grade}`}
                            </p>
                            {studentTopics.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                                    {studentTopics.map((topic, index) => {
                                        const topicObj = typeof topic === 'string' ? { name: topic } : topic;
                                        const topicName = topicObj.name || topicObj.id || topic;
                                        const mastery = nexonProfile?.topicMastery?.[topicName];

                                        let bgColor = 'bg-gray-50 dark:bg-gray-700';
                                        let borderColor = 'border-gray-200 dark:border-gray-600';
                                        let statusEmoji = '📚';

                                        if (mastery === 'good') {
                                            bgColor = 'bg-green-50 dark:bg-green-900/20';
                                            borderColor = 'border-green-200 dark:border-green-800';
                                            statusEmoji = '✅';
                                        } else if (mastery === 'needs-work') {
                                            bgColor = 'bg-yellow-50 dark:bg-yellow-900/20';
                                            borderColor = 'border-yellow-200 dark:border-yellow-800';
                                            statusEmoji = '📖';
                                        } else if (mastery === 'struggle') {
                                            bgColor = 'bg-red-50 dark:bg-red-900/20';
                                            borderColor = 'border-red-200 dark:border-red-800';
                                            statusEmoji = '❗';
                                        }

                                        return (
                                            <motion.div
                                                key={topicName}
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 0.7 + index * 0.05 }}
                                                className={`p-3 ${bgColor} border-2 ${borderColor} rounded-xl hover:shadow-lg transition-all cursor-pointer`}
                                                onClick={() => navigate('/practice')}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xl">{statusEmoji}</span>
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white flex-1 text-right">
                                                        {topicName}
                                                    </span>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                    <p>No topics found for your grade level</p>
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* Right Column - Profile & Stats */}
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
                                    <Heart className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                        {nexonProfile?.name || user?.displayName}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                                        {user?.email}
                                    </p>
                                </div>
                            </div>

                            {nexonProfile && (
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                        <span className="text-gray-600 dark:text-gray-400">כיתה • Grade</span>
                                        <span className="font-bold text-gray-900 dark:text-white">
                                            {nexonProfile.grade} {nexonProfile.track && `(${nexonProfile.track})`}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                        <span className="text-gray-600 dark:text-gray-400">יחס למתמטיקה</span>
                                        <span className="font-bold text-gray-900 dark:text-white">
                                            {getFeelingEmoji()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                        <span className="text-gray-600 dark:text-gray-400">סגנון למידה</span>
                                        <span className="font-bold text-gray-900 dark:text-white">
                                            {getLearningStyleIcon()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                        <span className="text-gray-600 dark:text-gray-400">מטרה עיקרית</span>
                                        <span className="font-bold text-gray-900 dark:text-white text-xs">
                                            {nexonProfile.goalFocus === 'understanding' && '💡 הבנה'}
                                            {nexonProfile.goalFocus === 'speed' && '⚡ מהירות'}
                                            {nexonProfile.goalFocus === 'accuracy' && '🎯 דיוק'}
                                            {nexonProfile.goalFocus === 'confidence' && '💪 ביטחון'}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </motion.div>

                        {/* Progress Stats */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <TrendingUp className="w-6 h-6 text-green-500" />
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                    ההתקדמות שלך
                                </h3>
                            </div>
                            <div className="space-y-4">
                                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                                    <div className="text-4xl font-bold text-green-600 mb-1">0</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">תרגילים נפתרו</div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                        <div className="text-2xl font-bold text-blue-600">0%</div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400">דיוק</div>
                                    </div>
                                    <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                                        <div className="text-2xl font-bold text-purple-600">0h</div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400">זמן למידה</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Quick Tip from Nexon */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 }}
                            className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border-2 border-purple-300 dark:border-purple-700 rounded-2xl p-6"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                                    <Zap className="w-5 h-5 text-white" />
                                </div>
                                <h4 className="font-bold text-purple-900 dark:text-purple-300">
                                    טיפ מנקסון 💡
                                </h4>
                            </div>
                            <p className="text-sm text-purple-800 dark:text-purple-200" dir="rtl">
                                {nexonProfile?.mathFeeling === 'struggle' &&
                                    'זכור - כל מומחה היה פעם מתחיל. לוקח זמן ללמוד מתמטיקה, ואתה בדרך הנכונה! 💪'
                                }
                                {nexonProfile?.mathFeeling === 'okay' &&
                                    'אתה עושה התקדמות טובה! תרגול קבוע יביא אותך למצוינות. המשך ככה! 🌟'
                                }
                                {nexonProfile?.mathFeeling === 'love' &&
                                    'מדהים שאתה אוהב מתמטיקה! בוא נאתגר אותך עם בעיות מתקדמות יותר 🚀'
                                }
                                {!nexonProfile?.mathFeeling &&
                                    'תרגול יומיומי של 15-20 דקות עושה פלאים! בוא נתחיל היום 📚'
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