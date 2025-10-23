// REPLACE YOUR ENTIRE src/pages/PersonalizedDashboard.jsx WITH THIS CODE
// This version properly passes selectedTopic, selectedSubtopic, mode, userId to MathTutor

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Brain, Target, TrendingUp, Calculator, Award, Zap, Sparkles, Clock,
    CheckCircle, ArrowRight, Play, Grid, Search, X, ArrowLeft, ChevronRight,
    Shuffle, List, BookOpen, Trophy, Flame, Star, Rocket, BarChart3,
    Activity, TrendingDown, Package, ChevronDown
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import { profileService } from '../services/profileService';
import { getUserGradeId, getGradeConfig, getSubtopics } from '../config/israeliCurriculum';
import MathTutor from '../components/ai/MathTutor';
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

    // Practice state
    const [showPractice, setShowPractice] = useState(false);
    const [practiceConfig, setPracticeConfig] = useState({
        topic: null,
        subtopic: null,
        mode: 'normal',
        userId: null
    });

    const [loading, setLoading] = useState(true);
    const [showSubtopics, setShowSubtopics] = useState(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

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

    // KEY FUNCTION: Properly launch practice with all props
    const handleQuickStart = (topic, subtopic = null, mode = 'normal') => {
        console.log('🚀 Dashboard launching practice:', {
            topic: topic?.name,
            subtopic: subtopic?.name,
            mode,
            userId: user?.id
        });

        setPracticeConfig({
            topic: topic,
            subtopic: subtopic,
            mode: mode,
            userId: user?.id
        });
        setShowPractice(true);
    };

    const handleClosePractice = () => {
        setShowPractice(false);
        setPracticeConfig({
            topic: null,
            subtopic: null,
            mode: 'normal',
            userId: null
        });
        setShowSubtopics(null);
        loadAllStats();
    };

    const successRate = stats.questionsAnswered > 0
        ? Math.round((stats.correctAnswers / stats.questionsAnswered) * 100)
        : 0;

    const getGradeDisplay = () => {
        const grade = profile?.grade || currentGrade;
        if (grade === 'grade7' || grade === '7' || grade === 'ז') return 'ז׳';
        if (grade === 'grade8' || grade === '8' || grade === 'ח') return 'ח׳';
        if (grade === 'grade9' || grade === '9' || grade === 'ט') return 'ט׳';
        if (grade === 'grade10' || grade === '10' || grade === 'י') return 'י׳';
        return grade || '';
    };

    const getWeaknessTopicsWithData = () => {
        if (!profile?.weakTopics || profile.weakTopics.length === 0) return [];
        return profile.weakTopics
            .map(topicId => availableTopics.find(t => t.id === topicId))
            .filter(Boolean);
    };

    const weaknessTopics = getWeaknessTopicsWithData();

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600 mb-4"></div>
                    <p className="text-xl font-bold text-gray-900">טוען נתונים...</p>
                </div>
            </div>
        );
    }

    // KEY RENDER: Pass all props to MathTutor
    if (showPractice) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
                <div className="container mx-auto px-4 py-8">
                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleClosePractice}
                        className="flex items-center gap-2 mb-6 px-6 py-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all text-gray-900 font-bold border-2 border-purple-200"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>חזור ללוח המחוונים</span>
                    </motion.button>

                    <MathTutor
                        selectedTopic={practiceConfig.topic}
                        selectedSubtopic={practiceConfig.subtopic}
                        mode={practiceConfig.mode}
                        userId={practiceConfig.userId}
                        onClose={handleClosePractice}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 mb-2">
                                {greeting} 👋
                            </h1>
                            <p className="text-gray-600 text-lg">כיתה {getGradeDisplay()} • {currentTrack}</p>
                        </div>
                        <div className="flex gap-3">
                            <motion.div whileHover={{ scale: 1.05 }} className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg">
                                <div className="flex items-center gap-2">
                                    <Flame className="w-5 h-5 text-white" />
                                    <span className="text-white font-bold">{stats.streak} רצף</span>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Cards */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="group bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1">
                        <Brain className="w-10 h-10 text-white mb-3 group-hover:scale-110 transition-transform" />
                        <p className="text-white/80 text-sm font-medium mb-1">תרגילים שנפתרו</p>
                        <p className="text-3xl font-black text-white">{stats.questionsAnswered || 0}</p>
                    </div>
                    <div className="group bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1">
                        <CheckCircle className="w-10 h-10 text-white mb-3 group-hover:scale-110 transition-transform" />
                        <p className="text-white/80 text-sm font-medium mb-1">תשובות נכונות</p>
                        <p className="text-3xl font-black text-white">{stats.correctAnswers || 0}</p>
                    </div>
                    <div className="group bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1">
                        <TrendingUp className="w-10 h-10 text-white mb-3 group-hover:scale-110 transition-transform" />
                        <p className="text-white/80 text-sm font-medium mb-1">אחוז הצלחה</p>
                        <p className="text-3xl font-black text-white">{successRate}%</p>
                    </div>
                    <div className="group bg-gradient-to-br from-orange-500 to-pink-600 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1">
                        <Clock className="w-10 h-10 text-white mb-3 group-hover:scale-110 transition-transform" />
                        <p className="text-white/80 text-sm font-medium mb-1">זמן תרגול</p>
                        <p className="text-3xl font-black text-white">{stats.practiceTime || 0} דק׳</p>
                    </div>
                </motion.div>

                {/* Quick Practice Modes */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-8">
                    <div className="flex items-center gap-3 mb-6">
                        <Rocket className="w-8 h-8 text-purple-600" />
                        <h2 className="text-3xl font-black text-gray-900">התחל מהר</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleQuickStart(null, null, 'random')} className="group relative overflow-hidden bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                            <div className="relative">
                                <Shuffle className="w-12 h-12 text-white mb-4 group-hover:rotate-180 transition-transform duration-500" />
                                <h3 className="text-xl font-bold text-white mb-2">תרגול אקראי</h3>
                                <p className="text-white/80 text-sm mb-4">שאלות מפתיעות מכל הנושאים</p>
                                <div className="flex items-center text-white font-bold">
                                    <span>התחל מיד</span>
                                    <Play className="w-4 h-4 mr-2" />
                                </div>
                            </div>
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleQuickStart(null, null, 'ai-adaptive')} className="group relative overflow-hidden bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                            <div className="relative">
                                <Sparkles className="w-12 h-12 text-white mb-4 group-hover:scale-110 transition-transform" />
                                <h3 className="text-xl font-bold text-white mb-2">תרגול חכם AI</h3>
                                <p className="text-white/80 text-sm mb-4">שאלות מותאמות אישית</p>
                                <div className="flex items-center text-white font-bold">
                                    <span>התחל מיד</span>
                                    <Play className="w-4 h-4 mr-2" />
                                </div>
                            </div>
                        </motion.button>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => weaknessTopics.length > 0 ? handleQuickStart(null, null, 'weakness-only') : toast.error('אין נושאים לחיזוק')} className={`group relative overflow-hidden rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all ${weaknessTopics.length > 0 ? 'bg-gradient-to-br from-orange-500 via-red-500 to-pink-500' : 'bg-gradient-to-br from-gray-400 to-gray-500 cursor-not-allowed'}`}>
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

                {/* Weakness Topics */}
                {weaknessTopics.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl p-8 border-2 border-orange-200 shadow-xl mb-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-orange-500 rounded-2xl">
                                <Target className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-gray-900">נושאים לחיזוק</h2>
                                <p className="text-gray-600">לחץ להתחלה מיידית</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {weaknessTopics.map((topic, index) => {
                                const subtopics = getSubtopics(gradeId, topic.id);
                                const isExpanded = showSubtopics === topic.id;
                                return (
                                    <div key={topic.id}>
                                        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 + index * 0.1 }} className="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border-2 border-orange-200 hover:border-orange-400">
                                            <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">{topic.icon}</div>
                                            <h3 className="font-bold text-gray-900 text-lg mb-1">{topic.name}</h3>
                                            <p className="text-sm text-gray-600 mb-4">{topic.nameEn}</p>
                                            <div className="space-y-2">
                                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleQuickStart(topic, null, 'normal')} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold hover:shadow-lg transition-all">
                                                    <Play className="w-4 h-4" />
                                                    <span>תרגל הכל</span>
                                                </motion.button>
                                                {subtopics.length > 0 && (
                                                    <button onClick={() => setShowSubtopics(isExpanded ? null : topic.id)} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all">
                                                        <span className="text-sm">{subtopics.length} תתי-נושאים</span>
                                                        <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                                    </button>
                                                )}
                                            </div>
                                        </motion.div>
                                        <AnimatePresence>
                                            {isExpanded && subtopics.length > 0 && (
                                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-2 bg-white rounded-xl p-4 shadow-lg border-2 border-orange-200">
                                                    <div className="space-y-2">
                                                        {subtopics.map((sub, subIndex) => (
                                                            <motion.button key={sub.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: subIndex * 0.05 }} whileHover={{ scale: 1.02, x: 5 }} whileTap={{ scale: 0.98 }} onClick={() => { setShowSubtopics(null); handleQuickStart(topic, sub, 'normal'); }} className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 rounded-lg text-gray-900 font-bold transition-all border border-orange-200">
                                                                <span className="text-sm">{sub.name}</span>
                                                                <Play className="w-4 h-4" />
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
                )}

                {/* Progress Stats */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 border-2 border-blue-200 shadow-xl mb-8">
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
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={loadAllStats} className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold transition-colors">
                            <Activity className="w-4 h-4" />
                            <span>רענן נתונים</span>
                        </motion.button>
                    </div>
                    <ProgressStats userId={user?.id} refreshTrigger={refreshTrigger} />
                </motion.div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/notebook')} className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-purple-300">
                        <BookOpen className="w-10 h-10 text-purple-600 mb-3 group-hover:rotate-12 transition-transform" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">המחברת שלי</h3>
                        <p className="text-gray-600 text-sm">רשום הערות ותרגל פתרון בעיות</p>
                    </motion.button>
                    <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/my-courses')} className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-300">
                        <Package className="w-10 h-10 text-blue-600 mb-3 group-hover:rotate-12 transition-transform" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">הקורסים שלי</h3>
                        <p className="text-gray-600 text-sm">המשך ללמוד מהקורסים שרכשת</p>
                    </motion.button>
                    <motion.button initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => navigate('/notifications')} className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-green-300">
                        <Trophy className="w-10 h-10 text-green-600 mb-3 group-hover:rotate-12 transition-transform" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">הישגים</h3>
                        <p className="text-gray-600 text-sm">עקוב אחר ההישגים שלך</p>
                    </motion.button>
                </div>

                {/* Motivational Quote */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }} className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-3xl p-8 shadow-2xl">
                    <div className="absolute inset-0 opacity-10">
                        <Sparkles className="absolute top-4 right-4 w-20 h-20" />
                        <Star className="absolute bottom-4 left-4 w-16 h-16" />
                    </div>
                    <div className="relative text-center">
                        <h3 className="text-2xl font-black text-white mb-3">💡 טיפ היום מנקסון</h3>
                        <p className="text-xl text-white/90 font-medium">
                            {stats.questionsAnswered === 0 ? 'כל מסע מתחיל בצעד ראשון. בוא נתחיל לתרגל ביחד! 🚀' : successRate >= 80 ? 'מדהים! אתה ממש שולט בזה. המשך ככה! 🌟' : successRate >= 60 ? 'התקדמות מצוינת! כל תרגול עושה אותך יותר טוב 💪' : 'זכור: טעויות הן חלק מהלמידה. המשך להתאמן! 📚'}
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default PersonalizedDashboard;