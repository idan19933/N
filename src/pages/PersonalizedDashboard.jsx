// src/pages/PersonalizedDashboard.jsx - FIXED SUBTOPICS ERROR
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Brain, Target, TrendingUp, Calculator, Award, Zap, Sparkles, Clock,
    CheckCircle, ArrowRight, Play, Grid, Search, X, ArrowLeft, ChevronRight,
    Shuffle, List, BookOpen, Trophy, Flame, Star, Rocket, BarChart3,
    Activity, TrendingDown, Package, ChevronDown, GraduationCap, Lightbulb
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import { profileService } from '../services/profileService';
import { getUserGradeId, getGradeConfig, getSubtopics } from '../config/israeliCurriculum';
import MathTutor from '../components/ai/MathTutor';
import LearningSpace from '../components/ai/LearningSpace';
import ProgressStats from '../components/dashboard/ProgressStats';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

const PersonalizedDashboard = () => {
    const navigate = useNavigate();
    const { user, studentProfile, nexonProfile } = useAuthStore();
    const profile = studentProfile || nexonProfile;

    const [greeting, setGreeting] = useState('');
    const [stats, setStats] = useState({
        questionsAnswered: 0,
        correctAnswers: 0,
        streak: 0,
        practiceTime: 0
    });

    const [showPractice, setShowPractice] = useState(false);
    const [showLearning, setShowLearning] = useState(false);
    const [practiceConfig, setPracticeConfig] = useState({
        topic: null,
        subtopic: null,
        mode: 'normal',
        userId: null,
        showLearningFirst: false
    });

    const [loading, setLoading] = useState(true);
    const [showSubtopics, setShowSubtopics] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [showChoiceModal, setShowChoiceModal] = useState(false);
    const [pendingTopic, setPendingTopic] = useState(null);
    const [pendingSubtopic, setPendingSubtopic] = useState(null);

    const currentGrade = profile?.grade || user?.grade || '8';
    const currentTrack = profile?.track || user?.track;
    const gradeId = getUserGradeId(currentGrade, currentTrack);
    const gradeConfig = getGradeConfig(gradeId);
    const availableTopics = gradeConfig?.topics || [];

    useEffect(() => {
        const hour = new Date().getHours();
        const name = user?.displayName || profile?.name || 'תלמיד';
        let greetingText = '';
        if (hour < 12) greetingText = `בוקר טוב, ${name}`;
        else if (hour < 18) greetingText = `שלום, ${name}`;
        else greetingText = `ערב טוב, ${name}`;
        setGreeting(greetingText);
    }, [user, profile]);

    useEffect(() => {
        loadAllStats();
    }, [user?.uid]);

    const loadAllStats = async () => {
        try {
            setLoading(true);
            if (user?.uid) {
                const userStats = await profileService.getUserStats(user.uid);
                console.log('📊 Loaded stats:', userStats);
                setStats(userStats || {
                    questionsAnswered: 0,
                    correctAnswers: 0,
                    streak: 0,
                    practiceTime: 0
                });
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        } finally {
            setLoading(false);
        }
        setRefreshTrigger(prev => prev + 1);
    };

    const handleTopicClick = (topic, subtopic = null, mode = 'normal') => {
        if (mode !== 'normal') {
            handleQuickStart(topic, subtopic, mode, false);
            return;
        }
        setPendingTopic(topic);
        setPendingSubtopic(subtopic);
        setShowChoiceModal(true);
    };

    const handleChoice = (learnFirst) => {
        setShowChoiceModal(false);
        handleQuickStart(pendingTopic, pendingSubtopic, 'normal', learnFirst);
        setPendingTopic(null);
        setPendingSubtopic(null);
    };

    const handleQuickStart = (topic, subtopic = null, mode = 'normal', showLearningFirst = false) => {
        console.log('🚀 Dashboard launching:', {
            topic: topic?.name,
            subtopic: subtopic?.name,
            mode,
            showLearningFirst,
            userId: user?.uid
        });

        setPracticeConfig({
            topic: topic,
            subtopic: subtopic,
            mode: mode,
            userId: user?.uid,
            showLearningFirst: showLearningFirst
        });

        if (showLearningFirst) {
            setShowLearning(true);
            setShowPractice(false);
        } else {
            setShowLearning(false);
            setShowPractice(true);
        }
    };

    const handleStartPracticeFromLearning = () => {
        console.log('✅ Learning complete, starting practice...');
        setShowLearning(false);
        setShowPractice(true);
    };

    const handleBackFromLearning = () => {
        setShowLearning(false);
        setPracticeConfig({
            topic: null,
            subtopic: null,
            mode: 'normal',
            userId: null,
            showLearningFirst: false
        });
    };

    const handleClosePractice = () => {
        setShowPractice(false);
        setShowLearning(false);
        setPracticeConfig({
            topic: null,
            subtopic: null,
            mode: 'normal',
            userId: null,
            showLearningFirst: false
        });
        loadAllStats();
    };

    const handleExitPractice = async () => {
        try {
            console.log('📊 Exit practice - refreshing stats...');
            await loadAllStats();
        } catch (error) {
            console.error('Error on exit:', error);
        } finally {
            handleClosePractice();
        }
    };

    const successRate = stats.questionsAnswered > 0 ? Math.round((stats.correctAnswers / stats.questionsAnswered) * 100) : 0;

    const weaknessTopics = (() => {
        console.log('🔍 Checking weakness topics:', {
            hasTopicStats: !!stats.topicStats,
            topicStats: stats.topicStats,
            availableTopicsCount: availableTopics.length
        });

        if (!stats.topicStats || Object.keys(stats.topicStats).length === 0) {
            console.log('⚠️ No topic stats - showing first 6 topics for learning');
            return availableTopics.slice(0, 6);
        }

        const filtered = availableTopics.filter(topic => {
            const topicStats = stats.topicStats[topic.id];
            if (!topicStats || topicStats.total < 5) return false;
            const accuracy = (topicStats.correct / topicStats.total) * 100;
            return accuracy < 70;
        }).slice(0, 6);

        console.log('📊 Found weakness topics:', filtered.length);
        return filtered;
    })();

    const masteredTopics = availableTopics.filter(topic => {
        const topicStats = stats.topicStats?.[topic.id];
        if (!topicStats || topicStats.total < 10) return false;
        const accuracy = (topicStats.correct / topicStats.total) * 100;
        return accuracy >= 90;
    });

    if (showLearning && practiceConfig.topic) {
        return (
            <LearningSpace
                topic={practiceConfig.topic}
                subtopic={practiceConfig.subtopic}
                userId={practiceConfig.userId || user?.uid}
                onStartPractice={handleStartPracticeFromLearning}
                onBack={handleBackFromLearning}
            />
        );
    }

    if (showPractice && practiceConfig.topic) {
        return (
            <MathTutor
                preSelectedTopic={practiceConfig.topic}
                preSelectedSubtopic={practiceConfig.subtopic}
                mode={practiceConfig.mode}
                onClose={handleExitPractice}
                userId={practiceConfig.userId || user?.uid}
            />
        );
    }

    const ChoiceModal = () => (
        <AnimatePresence>
            {showChoiceModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setShowChoiceModal(false)}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
                        dir="rtl"
                    >
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <GraduationCap className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 mb-2">איך תרצה להתחיל?</h2>
                            <p className="text-gray-600">בחר את דרך הלמידה שלך</p>
                        </div>

                        <div className="space-y-4">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleChoice(true)}
                                className="w-full p-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl font-bold hover:shadow-xl transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <BookOpen className="w-6 h-6" />
                                    </div>
                                    <div className="text-right flex-1">
                                        <div className="text-xl font-black mb-1">תחילה למידה</div>
                                        <div className="text-sm text-white/80">נסביר את הנושא ואז נתרגל</div>
                                    </div>
                                </div>
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleChoice(false)}
                                className="w-full p-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-bold hover:shadow-xl transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Zap className="w-6 h-6" />
                                    </div>
                                    <div className="text-right flex-1">
                                        <div className="text-xl font-black mb-1">ישר לתרגול</div>
                                        <div className="text-sm text-white/80">אני מוכן, בוא נתחיל!</div>
                                    </div>
                                </div>
                            </motion.button>

                            <button
                                onClick={() => setShowChoiceModal(false)}
                                className="w-full py-3 text-gray-600 font-bold hover:text-gray-800 transition-colors"
                            >
                                ביטול
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50" dir="rtl">
            <ChoiceModal />

            <div className="max-w-7xl mx-auto p-4 md:p-8">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between mb-2">
                        <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                            {greeting}
                        </h1>
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span className="font-bold">חזרה</span>
                        </button>
                    </div>
                    <p className="text-xl text-gray-600">בוא נלמד מתמטיקה ביחד! 🚀</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
                >
                    {[
                        { icon: Target, label: 'דיוק', value: `${successRate}%`, gradient: 'from-purple-500 to-purple-600' },
                        { icon: CheckCircle, label: 'שאלות נכונות', value: stats.correctAnswers, gradient: 'from-green-500 to-green-600' },
                        { icon: Flame, label: 'רצף נוכחי', value: stats.streak, gradient: 'from-orange-500 to-orange-600' },
                        { icon: Trophy, label: 'סה"כ שאלות', value: stats.questionsAnswered, gradient: 'from-blue-500 to-blue-600' }
                    ].map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 + index * 0.05 }}
                            className={`bg-gradient-to-br ${stat.gradient} rounded-2xl p-6 shadow-xl`}
                        >
                            <stat.icon className="w-8 h-8 text-white mb-2" />
                            <p className="text-white/80 text-sm mb-1">{stat.label}</p>
                            <p className="text-3xl font-black text-white">{stat.value}</p>
                        </motion.div>
                    ))}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-3xl p-8 shadow-xl mb-8 border-2 border-purple-200"
                >
                    <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                        <Zap className="w-8 h-8 text-purple-600" />
                        התחלה מהירה
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <motion.button
                            whileHover={{ scale: 1.03, y: -5 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleQuickStart(null, null, 'random')}
                            className="group relative overflow-hidden bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all"
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                            <div className="relative">
                                <Shuffle className="w-12 h-12 text-white mb-4 group-hover:scale-110 transition-transform" />
                                <h3 className="text-xl font-bold text-white mb-2">תרגול אקראי</h3>
                                <p className="text-white/80 text-sm mb-4">שאלות מכל הנושאים</p>
                                <div className="flex items-center text-white font-bold">
                                    <span>לחץ להתחלה</span>
                                    <Play className="w-4 h-4 mr-2" />
                                </div>
                            </div>
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.03, y: -5 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleQuickStart(null, null, 'ai-adaptive')}
                            className="group relative overflow-hidden bg-gradient-to-br from-blue-600 to-cyan-600 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all"
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                            <div className="relative">
                                <Brain className="w-12 h-12 text-white mb-4 group-hover:scale-110 transition-transform" />
                                <h3 className="text-xl font-bold text-white mb-2">תרגול חכם AI</h3>
                                <p className="text-white/80 text-sm mb-4">מותאם לרמה שלך</p>
                                <div className="flex items-center text-white font-bold">
                                    <span>לחץ להתחלה</span>
                                    <Play className="w-4 h-4 mr-2" />
                                </div>
                            </div>
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.03, y: -5 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleQuickStart(null, null, 'weakness-only')}
                            className="group relative overflow-hidden bg-gradient-to-br from-orange-600 to-red-600 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all"
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                            <div className="relative">
                                <Target className="w-12 h-12 text-white mb-4 group-hover:scale-110 transition-transform" />
                                <h3 className="text-xl font-bold text-white mb-2">חיזוק נושאים</h3>
                                <p className="text-white/80 text-sm mb-4">התמקד בנושאים שצריך לחזק</p>
                                <div className="flex items-center text-white font-bold">
                                    <span>{weaknessTopics.length} נושאים</span>
                                    <Play className="w-4 h-4 mr-2" />
                                </div>
                            </div>
                        </motion.button>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl p-8 border-2 border-orange-200 shadow-xl mb-8"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-orange-500 rounded-2xl">
                            <Target className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900">
                                {stats.topicStats && Object.keys(stats.topicStats).length > 0
                                    ? 'נושאים לחיזוק'
                                    : 'נושאים ללמידה'}
                            </h2>
                            <p className="text-gray-600">לחץ להתחלה - עם או בלי למידה מקדימה</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {weaknessTopics.map((topic, index) => {
                            const subtopics = getSubtopics(gradeId, topic.id) || [];
                            const isExpanded = showSubtopics === topic.id;
                            return (
                                <div key={topic.id}>
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.6 + index * 0.1 }}
                                        className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border-2 border-orange-200 hover:border-orange-400"
                                    >
                                        <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">
                                            {topic.icon}
                                        </div>
                                        <h3 className="font-bold text-gray-900 text-lg mb-1">{topic.name}</h3>
                                        <p className="text-sm text-gray-600 mb-4">{topic.nameEn}</p>
                                        <div className="space-y-2">
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleTopicClick(topic, null, 'normal')}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                                            >
                                                <GraduationCap className="w-4 h-4" />
                                                <span>בחר למידה או תרגול</span>
                                            </motion.button>
                                            {subtopics.length > 0 && (
                                                <button
                                                    onClick={() => setShowSubtopics(isExpanded ? null : topic.id)}
                                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
                                                >
                                                    <span className="text-sm">{subtopics.length} תתי-נושאים</span>
                                                    <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                    <AnimatePresence>
                                        {isExpanded && subtopics.length > 0 && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="mt-2 bg-white rounded-xl p-4 shadow-lg border-2 border-orange-200"
                                            >
                                                <div className="space-y-2">
                                                    {subtopics.map((sub, subIndex) => (
                                                        <motion.button
                                                            key={sub.id}
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: subIndex * 0.05 }}
                                                            whileHover={{ scale: 1.02, x: 5 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            onClick={() => {
                                                                setShowSubtopics(null);
                                                                handleTopicClick(topic, sub, 'normal');
                                                            }}
                                                            className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 rounded-lg text-gray-900 font-bold transition-all border border-orange-200"
                                                        >
                                                            <span className="text-sm">{sub.name}</span>
                                                            <GraduationCap className="w-4 h-4" />
                                                        </motion.button>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 border-2 border-blue-200 shadow-xl mb-8"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-500 rounded-2xl">
                                <BarChart3 className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-gray-900">התקדמות בלימודים</h2>
                                <p className="text-gray-600">מעקב אחר התקדמות בנושאים</p>
                            </div>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={loadAllStats}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold transition-colors"
                        >
                            <Activity className="w-4 h-4" />
                            <span>רענן נתונים</span>
                        </motion.button>
                    </div>
                    <ProgressStats userId={user?.uid} refreshTrigger={refreshTrigger} />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.1 }}
                    className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-3xl p-8 shadow-2xl"
                >
                    <div className="absolute inset-0 opacity-10">
                        <Sparkles className="absolute top-4 right-4 w-20 h-20" />
                        <Star className="absolute bottom-4 left-4 w-16 h-16" />
                    </div>
                    <div className="relative text-center">
                        <h3 className="text-2xl font-black text-white mb-3">💡 טיפ היום מנקסון</h3>
                        <p className="text-xl text-white/90 font-medium">
                            {stats.questionsAnswered === 0
                                ? 'כל מסע מתחיל בצעד ראשון. בוא נתחיל ללמוד ולתרגל ביחד! 🚀'
                                : successRate >= 80
                                    ? 'מדהים! אתה ממש שולט בזה. המשך ככה! 🌟'
                                    : successRate >= 60
                                        ? 'התקדמות מצוינת! כל תרגול עושה אותך יותר טוב 💪'
                                        : 'זכור: טעויות הן חלק מהלמידה. המשך להתאמן! 📚'}
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default PersonalizedDashboard;