// src/pages/PersonalizedDashboard.jsx - COMPLETE SMART DASHBOARD
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Brain, Target, TrendingUp, Calculator, Award, Zap, AlertCircle, Sparkles } from 'lucide-react';
import useAuthStore from '../store/authStore';

const PersonalizedDashboard = () => {
    const navigate = useNavigate();
    const nexonProfile = useAuthStore(state => state.nexonProfile);
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const hour = new Date().getHours();
        const name = nexonProfile?.name || 'תלמיד';

        let greetingText = '';
        if (hour < 12) greetingText = `בוקר טוב ${name}! ☀️`;
        else if (hour < 18) greetingText = `שלום ${name}! 🌤️`;
        else greetingText = `ערב טוב ${name}! 🌆`;

        setGreeting(greetingText);
    }, [nexonProfile]);

    const getWeakTopics = () => {
        if (!nexonProfile?.topicMastery) return [];

        return Object.entries(nexonProfile.topicMastery)
            .filter(([_, level]) => level === 'struggle' || level === 'needs-work')
            .map(([topic, level]) => ({ topic, level }));
    };

    const weakTopics = getWeakTopics();

    const getMotivationalMessage = () => {
        const goal = nexonProfile?.goalFocus;
        switch(goal) {
            case 'understanding': return 'היום נתמקד בהבנה עמוקה 🧠';
            case 'speed': return 'בואו נתרגל פתרון מהיר ⚡';
            case 'accuracy': return 'היום נשים לב לפרטים 🎯';
            case 'confidence': return 'בואו נבנה ביטחון 💪';
            default: return 'בואו נלמד משהו חדש! 🚀';
        }
    };

    const getFeelingEmoji = () => {
        switch(nexonProfile?.mathFeeling) {
            case 'love': return '😍';
            case 'okay': return '😐';
            case 'struggle': return '😰';
            default: return '🤔';
        }
    };

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
                                {nexonProfile && (
                                    <div className="flex items-center gap-3 mt-3 text-sm">
                                        <span className="px-3 py-1 bg-white/20 rounded-full">
                                            {nexonProfile.grade && `כיתה ${nexonProfile.grade}`}
                                            {nexonProfile.track && ` (${nexonProfile.track})`}
                                        </span>
                                        <span className="px-3 py-1 bg-white/20 rounded-full">
                                            {getFeelingEmoji()} Math Feeling
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* MATH TUTOR HERO */}
                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => navigate('/math-tutor')}
                    className="w-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 shadow-2xl hover:shadow-purple-500/50 transition-all relative overflow-hidden group"
                >
                    <div className="relative z-10 text-white">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Brain className="w-12 h-12" />
                                </div>
                                <div className="text-right">
                                    <h2 className="text-4xl font-bold mb-2">מורה מתמטיקה חכם AI</h2>
                                    <p className="text-purple-100 text-lg mb-3">
                                        תרגול מותאם אישית עם פידבק מיידי
                                    </p>
                                    <div className="flex items-center gap-3 text-sm flex-wrap">
                                        <span className="px-3 py-1 bg-white/20 rounded-full flex items-center gap-1">
                                            <Sparkles className="w-4 h-4" />
                                            פידבק בזמן אמת
                                        </span>
                                        <span className="px-3 py-1 bg-white/20 rounded-full flex items-center gap-1">
                                            <Zap className="w-4 h-4" />
                                            עוזר AI חכם
                                        </span>
                                        <span className="px-3 py-1 bg-white/20 rounded-full flex items-center gap-1">
                                            <Target className="w-4 h-4" />
                                            מותאם לרמה שלך
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-6xl mb-2">🚀</div>
                                <div className="px-6 py-3 bg-white/30 backdrop-blur-sm rounded-2xl font-bold text-xl">
                                    התחל עכשיו!
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
                        <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-300 rounded-full blur-3xl animate-pulse"></div>
                    </div>
                </motion.button>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* LEFT: Weak Topics */}
                    <div className="lg:col-span-2 space-y-6">

                        {weakTopics.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <AlertCircle className="w-6 h-6 text-orange-500" />
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        נושאים שדורשים תשומת לב
                                    </h2>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    בואו נתמקד בהם היום! תתחיל מה-Math Tutor למעלה
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {weakTopics.map(({ topic, level }, index) => (
                                        <motion.button
                                            key={topic}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.3 + index * 0.1 }}
                                            onClick={() => navigate('/math-tutor')}
                                            className={`p-4 rounded-xl border-2 hover:shadow-lg transition-all text-right ${
                                                level === 'struggle'
                                                    ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-800'
                                                    : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-800'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                                    level === 'struggle' ? 'bg-red-500' : 'bg-yellow-500'
                                                }`}>
                                                    <span className="text-white font-bold text-xl">
                                                        {level === 'struggle' ? '!' : '📖'}
                                                    </span>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-semibold text-gray-900 dark:text-white">
                                                        {topic}
                                                    </div>
                                                    <div className={`text-xs ${
                                                        level === 'struggle'
                                                            ? 'text-red-600 dark:text-red-400'
                                                            : 'text-yellow-600 dark:text-yellow-400'
                                                    }`}>
                                                        {level === 'struggle' ? 'מתקשה - בוא נתרגל!' : 'צריך חיזוק'}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Quick Actions */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <motion.button
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
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
                                transition={{ delay: 0.5 }}
                                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl text-center"
                            >
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Target className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">מטרת היום</h3>
                                <div className="text-3xl font-bold text-blue-600">0/5</div>
                                <div className="text-sm text-gray-500">תרגילים</div>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl text-center"
                            >
                                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Award className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">רצף שלך</h3>
                                <div className="text-5xl font-bold text-orange-500">0🔥</div>
                                <div className="text-sm text-gray-500">ימים</div>
                            </motion.div>
                        </div>
                    </div>

                    {/* RIGHT: Profile & Progress */}
                    <div className="space-y-6">
                        {/* Profile Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center">
                                    <span className="text-3xl">{getFeelingEmoji()}</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                        {nexonProfile?.name}
                                    </h3>
                                    <p className="text-gray-500 text-sm">
                                        {nexonProfile?.grade && `כיתה ${nexonProfile.grade}`}
                                    </p>
                                </div>
                            </div>

                            {nexonProfile && (
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                        <span className="text-gray-600 dark:text-gray-400">רמה</span>
                                        <span className="font-bold">{nexonProfile.track || 'רגיל'}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                        <span className="text-gray-600 dark:text-gray-400">מטרה</span>
                                        <span className="font-bold">
                                            {nexonProfile.goalFocus === 'understanding' && '💡 הבנה'}
                                            {nexonProfile.goalFocus === 'speed' && '⚡ מהירות'}
                                            {nexonProfile.goalFocus === 'accuracy' && '🎯 דיוק'}
                                            {nexonProfile.goalFocus === 'confidence' && '💪 ביטחון'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                        <span className="text-gray-600 dark:text-gray-400">נושאים חלשים</span>
                                        <span className="font-bold text-orange-600">{weakTopics.length}</span>
                                    </div>
                                </div>
                            )}
                        </motion.div>

                        {/* Progress */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <TrendingUp className="w-6 h-6 text-green-500" />
                                <h3 className="text-xl font-bold">התקדמות</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                                    <div className="text-4xl font-bold text-green-600">0</div>
                                    <div className="text-sm text-gray-600">תרגילים נפתרו</div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                        <div className="text-2xl font-bold text-blue-600">0%</div>
                                        <div className="text-xs text-gray-600">דיוק</div>
                                    </div>
                                    <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                                        <div className="text-2xl font-bold text-purple-600">0h</div>
                                        <div className="text-xs text-gray-600">זמן</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Personalized Tip */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 border-2 border-purple-300 rounded-2xl p-6"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <Zap className="w-6 h-6 text-purple-600" />
                                <h4 className="font-bold text-purple-900 dark:text-purple-300">טיפ מנקסון</h4>
                            </div>
                            <p className="text-sm text-purple-800 dark:text-purple-200">
                                {weakTopics.length > 0
                                    ? `יש לך ${weakTopics.length} נושאים שדורשים תשומת לב. בוא נתמקד בהם היום! 💪`
                                    : 'אתה עושה עבודה מצוינת! המשך ככה! 🌟'
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