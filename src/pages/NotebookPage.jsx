// src/pages/NotebookPage.jsx - ULTIMATE SMART AI SYSTEM 🚀
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen, Calendar, AlertCircle, TrendingUp, Filter,
    ChevronDown, ChevronUp, CheckCircle, XCircle, RefreshCw,
    Brain, Award, Clock, BarChart3, Target, Lightbulb,
    Search, SortAsc, SortDesc, Eye, EyeOff, Repeat,
    Zap, Flame, Trophy, Activity, Star, Sparkles,
    Play, ArrowUp, ArrowDown, Info, MessageCircle,
    BrainCircuit, GraduationCap, ChartBar, LineChart,
    PieChart, TrendingDown, Users, Gauge, Heart,
    Rocket, Coffee, Mountain, Shield, Smile
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';
import {
    LineChart as RechartsLineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart as RechartsBarChart,
    Bar,
    Area,
    AreaChart,
    PieChart as RechartsPieChart,
    Pie,
    Cell,
    RadialBarChart,
    RadialBar,
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ComposedChart
} from 'recharts';
import { getUserGradeId, getGradeConfig } from '../config/israeliCurriculum';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

// Enhanced Color Palette
const COLORS = {
    primary: ['#3b82f6', '#60a5fa', '#93bbfc'],
    success: ['#10b981', '#34d399', '#6ee7b7'],
    warning: ['#f59e0b', '#fbbf24', '#fcd34d'],
    danger: ['#ef4444', '#f87171', '#fca5a5'],
    purple: ['#8b5cf6', '#a78bfa', '#c4b5fd'],
    pink: ['#ec4899', '#f472b6', '#f9a8d4'],
    gradient: {
        success: 'from-green-400 to-emerald-600',
        warning: 'from-yellow-400 to-orange-600',
        danger: 'from-red-400 to-pink-600',
        info: 'from-blue-400 to-cyan-600',
        purple: 'from-purple-400 to-pink-600'
    }
};

// 🎯 SMART PERFORMANCE TRACKER WITH REAL-TIME UPDATES
const LivePerformanceMonitor = ({ userId, onDifficultyUpdate, onStatsUpdate }) => {
    const [liveStats, setLiveStats] = useState({
        totalQuestions: 0,
        correctAnswers: 0,
        accuracy: 0,
        activeDays: 0,
        todayQuestions: 0,
        weeklyActiveDays: 0,
        realtimeAccuracy: 0,
        lastActivity: null,
        currentStreak: 0,
        longestStreak: 0,
        averageTimePerQuestion: 0
    });

    const [isLive, setIsLive] = useState(true);
    const [performanceTrend, setPerformanceTrend] = useState('stable');
    const [showDetails, setShowDetails] = useState(false);
    const intervalRef = useRef(null);
    const previousStatsRef = useRef(null);

    useEffect(() => {
        if (userId && isLive) {
            fetchLiveStats();
            intervalRef.current = setInterval(fetchLiveStats, 3000); // Every 3 seconds
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [userId, isLive]);

    const fetchLiveStats = async () => {
        try {
            const response = await fetch(`${API_URL}/api/performance/live-stats?userId=${userId}`);
            const data = await response.json();

            if (data.success && data.stats) {
                const newStats = {
                    ...data.stats,
                    currentStreak: data.stats.weeklyActiveDays || 0,
                    longestStreak: data.stats.longestStreak || data.stats.weeklyActiveDays || 0
                };

                // Detect performance trend
                if (previousStatsRef.current) {
                    const accuracyDiff = newStats.realtimeAccuracy - previousStatsRef.current.realtimeAccuracy;
                    if (accuracyDiff > 5) {
                        setPerformanceTrend('improving');
                        toast.success('🚀 הביצועים שלך משתפרים!', { duration: 2000 });
                    } else if (accuracyDiff < -5) {
                        setPerformanceTrend('declining');
                    } else {
                        setPerformanceTrend('stable');
                    }
                }

                previousStatsRef.current = newStats;
                setLiveStats(newStats);

                // Update parent component
                if (onStatsUpdate) {
                    onStatsUpdate(newStats);
                }

                // Update suggested difficulty
                if (onDifficultyUpdate) {
                    const suggestedDiff = calculateSuggestedDifficulty(newStats);
                    onDifficultyUpdate(suggestedDiff);
                }
            }
        } catch (error) {
            console.error('❌ Error fetching live stats:', error);
        }
    };

    const calculateSuggestedDifficulty = (stats) => {
        const { realtimeAccuracy, todayQuestions } = stats;

        if (todayQuestions < 5) return 'medium'; // Start with medium
        if (realtimeAccuracy >= 85) return 'hard';
        if (realtimeAccuracy >= 70) return 'medium';
        return 'easy';
    };

    const getDifficultyLabel = (difficulty) => {
        const labels = { easy: 'קל', medium: 'בינוני', hard: 'קשה' };
        return labels[difficulty] || 'בינוני';
    };

    const getTrendIcon = () => {
        switch (performanceTrend) {
            case 'improving': return <TrendingUp className="w-6 h-6 text-green-400 animate-bounce" />;
            case 'declining': return <TrendingDown className="w-6 h-6 text-red-400" />;
            default: return <Activity className="w-6 h-6 text-blue-400" />;
        }
    };

    const getTrendMessage = () => {
        switch (performanceTrend) {
            case 'improving': return 'הביצועים שלך משתפרים! 🚀';
            case 'declining': return 'כדאי להתרכז יותר 🎯';
            default: return 'ביצועים יציבים ✨';
        }
    };

    const getMotivationalMessage = () => {
        const { realtimeAccuracy, todayQuestions, currentStreak } = liveStats;

        if (currentStreak >= 7) return '🔥 סטריק מדהים! אתה בלתי עצור!';
        if (currentStreak >= 3) return '⭐ המשך את הסטריק המנצח!';
        if (todayQuestions >= 20) return '💪 איזה עבודה קשה! כל הכבוד!';
        if (todayQuestions >= 10) return '🎯 אתה על המסלול הנכון!';
        if (realtimeAccuracy >= 90) return '🏆 ביצועים מושלמים!';
        if (realtimeAccuracy >= 80) return '🌟 עבודה מצוינת!';
        if (realtimeAccuracy >= 70) return '👍 ממשיך טוב!';
        return '💡 כל שאלה מקרבת אותך למטרה!';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-3xl p-8 mb-8 shadow-2xl"
        >
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                    backgroundSize: '40px 40px'
                }} />
            </div>

            {/* Content */}
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <motion.div
                            animate={{
                                scale: isLive ? [1, 1.2, 1] : 1,
                                opacity: isLive ? 1 : 0.5
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className={`w-4 h-4 rounded-full shadow-lg ${
                                isLive ? 'bg-green-400 shadow-green-400/50' : 'bg-gray-400'
                            }`}
                        />
                        <div>
                            <h3 className="text-3xl font-black flex items-center gap-3">
                                <Activity className="w-10 h-10" />
                                ביצועים בזמן אמת
                            </h3>
                            <motion.p
                                key={performanceTrend}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-sm mt-1 flex items-center gap-2"
                            >
                                {getTrendIcon()}
                                {getTrendMessage()}
                            </motion.p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowDetails(!showDetails)}
                            className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all font-bold"
                        >
                            {showDetails ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsLive(!isLive)}
                            className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all font-bold"
                        >
                            {isLive ? 'השהה' : 'הפעל'}
                        </motion.button>
                    </div>
                </div>

                {/* Main Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <motion.div
                        whileHover={{ scale: 1.05, y: -5 }}
                        className="bg-white/20 backdrop-blur-md rounded-2xl p-5 border border-white/30"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <motion.div
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <Flame className="w-10 h-10 text-orange-300" />
                            </motion.div>
                            <motion.div
                                key={liveStats.currentStreak}
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 200 }}
                                className="text-4xl font-black"
                            >
                                {liveStats.currentStreak}
                            </motion.div>
                        </div>
                        <div className="text-sm font-bold opacity-90">🔥 ימים ברצף</div>
                        <div className="text-xs opacity-75 mt-1">
                            שיא: {liveStats.longestStreak} ימים
                        </div>
                    </motion.div>

                    <motion.div
                        whileHover={{ scale: 1.05, y: -5 }}
                        className="bg-white/20 backdrop-blur-md rounded-2xl p-5 border border-white/30"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <Brain className="w-10 h-10 text-blue-300" />
                            <motion.div
                                key={liveStats.todayQuestions}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200 }}
                                className="text-4xl font-black"
                            >
                                {liveStats.todayQuestions}
                            </motion.div>
                        </div>
                        <div className="text-sm font-bold opacity-90">🧠 שאלות היום</div>
                        <div className="text-xs opacity-75 mt-1">
                            יעד: 20 שאלות
                        </div>
                    </motion.div>

                    <motion.div
                        whileHover={{ scale: 1.05, y: -5 }}
                        className="bg-white/20 backdrop-blur-md rounded-2xl p-5 border border-white/30"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <Target className="w-10 h-10 text-green-300" />
                            <div className="flex items-center gap-2">
                                <motion.div
                                    key={liveStats.realtimeAccuracy}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200 }}
                                    className="text-4xl font-black"
                                >
                                    {Math.round(liveStats.realtimeAccuracy)}%
                                </motion.div>
                                {getTrendIcon()}
                            </div>
                        </div>
                        <div className="text-sm font-bold opacity-90">🎯 דיוק נוכחי</div>
                        <div className="text-xs opacity-75 mt-1">
                            {liveStats.realtimeAccuracy >= 80 ? 'מעולה!' : 'ממשיך להשתפר'}
                        </div>
                    </motion.div>

                    <motion.div
                        whileHover={{ scale: 1.05, y: -5 }}
                        className="bg-white/20 backdrop-blur-md rounded-2xl p-5 border border-white/30"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <Trophy className="w-10 h-10 text-yellow-300" />
                            <div className="text-4xl font-black">
                                {liveStats.totalQuestions}
                            </div>
                        </div>
                        <div className="text-sm font-bold opacity-90">🏆 סה"כ שאלות</div>
                        <div className="text-xs opacity-75 mt-1">
                            דיוק כולל: {Math.round(liveStats.accuracy)}%
                        </div>
                    </motion.div>
                </div>

                {/* Motivational Message */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30 text-center"
                >
                    <motion.p
                        key={getMotivationalMessage()}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-lg font-black"
                    >
                        {getMotivationalMessage()}
                    </motion.p>
                </motion.div>

                {/* Detailed Stats (Expandable) */}
                <AnimatePresence>
                    {showDetails && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-6 grid md:grid-cols-3 gap-4"
                        >
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Clock className="w-5 h-5" />
                                    <span className="font-bold">זמן ממוצע</span>
                                </div>
                                <div className="text-2xl font-black">
                                    {Math.round(liveStats.averageTimePerQuestion || 120)} שניות
                                </div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Award className="w-5 h-5" />
                                    <span className="font-bold">דיוק שבועי</span>
                                </div>
                                <div className="text-2xl font-black">
                                    {Math.round(liveStats.weeklyAccuracy || liveStats.accuracy)}%
                                </div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Zap className="w-5 h-5" />
                                    <span className="font-bold">שאלות נכונות</span>
                                </div>
                                <div className="text-2xl font-black">
                                    {liveStats.correctAnswers} / {liveStats.totalQuestions}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

// 🤖 SMART AI INSIGHTS PANEL - COMPLETELY FIXED
const AIInsightsPanel = ({ userId, availableTopics, onNavigateToPractice }) => {
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (userId) {
            console.log('🔍 [AI Insights] Fetching for user:', userId);
            fetchInsights();
        }
    }, [userId]);

    const fetchInsights = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('📡 [AI Insights] Calling API:', `${API_URL}/api/ai/performance-analysis?userId=${userId}`);

            const response = await fetch(`${API_URL}/api/ai/performance-analysis?userId=${userId}`);
            const data = await response.json();

            console.log('📊 [AI Insights] Response:', {
                success: data.success,
                hasAnalysis: !!data.analysis,
                hasFeedback: !!data.analysis?.personalizedFeedback,
                recommendationsCount: data.analysis?.recommendations?.length || 0,
                weakTopicsCount: data.analysis?.weakTopics?.length || 0,
                weakTopics: data.analysis?.weakTopics
            });

            if (data.success && data.analysis) {
                setInsights(data.analysis);
                console.log('✅ [AI Insights] Insights loaded successfully');
            } else {
                console.warn('⚠️ [AI Insights] No analysis returned:', data.error);
                setError(data.error || 'לא נמצאו תובנות');
            }
        } catch (error) {
            console.error('❌ [AI Insights] Fetch error:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Smart topic matching with fuzzy logic
    const findMatchingTopic = (topicName) => {
        if (!topicName || !availableTopics || availableTopics.length === 0) {
            console.warn('⚠️ [Topic Match] Missing data:', { topicName, topicsCount: availableTopics?.length });
            return null;
        }

        // Exact match
        let match = availableTopics.find(t =>
            t.name === topicName ||
            t.nameEn === topicName ||
            t.id === topicName
        );

        if (match) {
            console.log('✅ [Topic Match] Exact match:', match.name);
            return match;
        }

        // Partial match
        match = availableTopics.find(t =>
            t.name.includes(topicName) ||
            topicName.includes(t.name) ||
            (t.nameEn && t.nameEn.toLowerCase().includes(topicName.toLowerCase()))
        );

        if (match) {
            console.log('✅ [Topic Match] Partial match:', match.name);
            return match;
        }

        // Fallback: create synthetic topic
        console.warn('⚠️ [Topic Match] No match found, creating synthetic:', topicName);
        return {
            name: topicName,
            id: topicName.replace(/\s+/g, '_').toLowerCase(),
            icon: '📚',
            difficulty: 'medium',
            description: topicName
        };
    };

    if (loading) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 rounded-3xl p-8 shadow-xl animate-pulse"
            >
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-purple-300 rounded-2xl animate-pulse" />
                    <div className="flex-1">
                        <div className="h-6 bg-purple-300 rounded-lg w-1/3 mb-2" />
                        <div className="h-4 bg-purple-200 rounded w-1/2" />
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="h-24 bg-white/50 rounded-2xl" />
                    <div className="h-24 bg-white/50 rounded-2xl" />
                    <div className="h-32 bg-white/50 rounded-2xl" />
                </div>
            </motion.div>
        );
    }

    if (error || !insights) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-3xl p-8 shadow-xl"
            >
                <div className="text-center">
                    <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <BrainCircuit className="w-16 h-16 mx-auto mb-4 text-blue-600" />
                    </motion.div>
                    <h3 className="text-2xl font-black text-gray-800 mb-3">
                        התחל לפתור שאלות! 🚀
                    </h3>
                    <p className="text-gray-700 mb-6">
                        ה-AI יתחיל לנתח את הביצועים שלך ולתת המלצות מותאמות אישית
                        <br />
                        ככל שתפתור יותר שאלות, התובנות יהיו מדויקות יותר
                    </p>
                    {error && (
                        <div className="bg-yellow-100 border-2 border-yellow-300 rounded-xl p-4 mb-4">
                            <p className="text-sm text-yellow-800">⚠️ {error}</p>
                        </div>
                    )}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={fetchInsights}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold shadow-lg"
                    >
                        <RefreshCw className="w-5 h-5 inline-block mr-2" />
                        נסה שוב
                    </motion.button>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 rounded-3xl p-8 shadow-2xl mb-8 border-2 border-purple-200"
        >
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-lg"
                    >
                        <BrainCircuit className="w-8 h-8 text-white" />
                    </motion.div>
                    <div>
                        <h3 className="text-3xl font-black text-gray-800 flex items-center gap-2">
                            תובנות AI מותאמות אישית
                            <Sparkles className="w-7 h-7 text-yellow-500" />
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                            המלצות חכמות מבוססות על הביצועים שלך
                        </p>
                    </div>
                </div>
                <motion.button
                    whileHover={{ scale: 1.1, rotate: 180 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setExpanded(!expanded)}
                    className="p-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                    {expanded ? (
                        <ChevronUp className="w-6 h-6 text-purple-600" />
                    ) : (
                        <ChevronDown className="w-6 h-6 text-purple-600" />
                    )}
                </motion.button>
            </div>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="space-y-6"
                    >
                        {/* Personal Feedback */}
                        {insights.personalizedFeedback && (
                            <motion.div
                                initial={{ x: -50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl p-6 border-2 border-blue-300 shadow-lg"
                            >
                                <div className="flex items-start gap-4">
                                    <motion.div
                                        animate={{ scale: [1, 1.1, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="p-3 bg-white rounded-xl shadow-md"
                                    >
                                        <MessageCircle className="w-7 h-7 text-blue-600" />
                                    </motion.div>
                                    <div className="flex-1">
                                        <h4 className="text-xl font-black text-blue-900 mb-3 flex items-center gap-2">
                                            💬 משוב אישי מה-AI
                                        </h4>
                                        <p className="text-gray-800 leading-relaxed text-lg">
                                            {insights.personalizedFeedback}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Recommendations Grid */}
                        {insights.recommendations && insights.recommendations.length > 0 && (
                            <div>
                                <h4 className="text-xl font-black text-gray-800 mb-4 flex items-center gap-2">
                                    <Lightbulb className="w-6 h-6 text-yellow-500" />
                                    המלצות מותאמות אישית
                                </h4>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {insights.recommendations.map((rec, index) => {
                                        const iconMap = {
                                            'rocket': Rocket,
                                            'foundation': BookOpen,
                                            'clock': Clock,
                                            'target': Target,
                                            'fire': Flame,
                                            'coffee': Coffee,
                                            'mountain': Mountain,
                                            'shield': Shield
                                        };

                                        const IconComponent = iconMap[rec.icon] || Target;

                                        const colorMap = {
                                            'difficulty': { bg: 'from-blue-100 to-cyan-100', border: 'border-blue-300', text: 'text-blue-600', icon: '#3b82f6' },
                                            'topics': { bg: 'from-purple-100 to-pink-100', border: 'border-purple-300', text: 'text-purple-600', icon: '#8b5cf6' },
                                            'time': { bg: 'from-orange-100 to-yellow-100', border: 'border-orange-300', text: 'text-orange-600', icon: '#f59e0b' },
                                            'motivation': { bg: 'from-green-100 to-emerald-100', border: 'border-green-300', text: 'text-green-600', icon: '#10b981' }
                                        };

                                        const colors = colorMap[rec.type] || colorMap['difficulty'];

                                        return (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.1 }}
                                                whileHover={{ scale: 1.03, y: -5 }}
                                                className={`bg-gradient-to-br ${colors.bg} rounded-xl p-5 border-2 ${colors.border} shadow-lg`}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className="p-2 bg-white rounded-lg shadow-md">
                                                        <IconComponent
                                                            className="w-7 h-7"
                                                            style={{ color: colors.icon }}
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className={`font-black ${colors.text} mb-2 text-lg`}>
                                                            {rec.type === 'difficulty' && '⭐ רמת קושי'}
                                                            {rec.type === 'topics' && '📚 נושאים לתרגול'}
                                                            {rec.type === 'time' && '⏰ ניהול זמן'}
                                                            {rec.type === 'motivation' && '💪 מוטיבציה'}
                                                        </div>
                                                        <p className="text-gray-800 font-medium">
                                                            {rec.message}
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Weak Topics - ENHANCED */}
                        {insights.weakTopics && insights.weakTopics.length > 0 ? (
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 rounded-2xl p-6 border-2 border-orange-300 shadow-xl"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <motion.div
                                        animate={{ rotate: [0, -10, 10, 0] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="p-3 bg-white rounded-xl shadow-md"
                                    >
                                        <AlertCircle className="w-8 h-8 text-orange-500" />
                                    </motion.div>
                                    <div>
                                        <h4 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                                            נושאים הדורשים תשומת לב 🎯
                                        </h4>
                                        <p className="text-sm text-orange-700 mt-1">
                                            נמצאו {insights.weakTopics.length} נושאים שכדאי לחזק
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-3 mb-6">
                                    {insights.weakTopics.map((topicName, index) => {
                                        const topicObj = findMatchingTopic(topicName);

                                        if (!topicObj) {
                                            console.error(`❌ [Weak Topics] Failed to match topic: ${topicName}`);
                                            return null;
                                        }

                                        console.log(`✅ [Weak Topics] Rendering button ${index + 1}:`, {
                                            name: topicObj.name,
                                            id: topicObj.id,
                                            icon: topicObj.icon
                                        });

                                        return (
                                            <motion.button
                                                key={`weak-${index}-${topicObj.id}`}
                                                initial={{ opacity: 0, scale: 0 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{
                                                    delay: index * 0.1,
                                                    type: "spring",
                                                    stiffness: 200
                                                }}
                                                whileHover={{
                                                    scale: 1.08,
                                                    boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
                                                }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => {
                                                    console.log('🚀 [Weak Topics] Navigate clicked:', topicObj);
                                                    onNavigateToPractice(topicObj);
                                                }}
                                                className="group relative px-6 py-4 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white rounded-2xl font-black shadow-lg hover:shadow-2xl transition-all"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl">{topicObj.icon}</span>
                                                    <span className="text-lg">{topicObj.name}</span>
                                                    <motion.div
                                                        animate={{ x: [0, 5, 0] }}
                                                        transition={{ duration: 1, repeat: Infinity }}
                                                    >
                                                        <Play className="w-6 h-6" />
                                                    </motion.div>
                                                </div>

                                                {/* Animated Glow Effect */}
                                                <motion.div
                                                    className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-400 to-pink-400 opacity-0 group-hover:opacity-30 blur-xl"
                                                    animate={{ scale: [1, 1.2, 1] }}
                                                    transition={{ duration: 2, repeat: Infinity }}
                                                />

                                                {/* Tooltip */}
                                                <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 rounded-xl text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
                                                    <div className="font-bold mb-1">התחל תרגול מותאם אישית</div>
                                                    <div className="text-xs opacity-75">לחץ להתחלה מיידית 🚀</div>
                                                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-900 rotate-45"></div>
                                                </div>
                                            </motion.button>
                                        );
                                    })}
                                </div>

                                {/* Pro Tip */}
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border-2 border-orange-200"
                                >
                                    <div className="flex items-start gap-3">
                                        <Sparkles className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
                                        <div>
                                            <p className="font-bold text-orange-900 mb-1">💡 טיפ מקצועי:</p>
                                            <p className="text-sm text-orange-800">
                                                התרגול המותאם אישית יתחיל ברמת הקושי המתאימה בדיוק לך,
                                                ויתאים את עצמו אוטומטית בהתאם להתקדמות שלך בזמן אמת!
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-300 text-center shadow-lg"
                            >
                                <motion.div
                                    animate={{
                                        rotate: [0, 10, -10, 0],
                                        scale: [1, 1.1, 1]
                                    }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    <Trophy className="w-20 h-20 text-green-600 mx-auto mb-4" />
                                </motion.div>
                                <h4 className="text-3xl font-black text-green-900 mb-3">
                                    מעולה! אין נושאים חלשים! 🎉
                                </h4>
                                <p className="text-xl text-green-700 mb-4">
                                    הביצועים שלך טובים בכל הנושאים
                                </p>
                                <p className="text-lg text-green-600">
                                    המשך ככה! אתה על המסלול המנצח! 🚀
                                </p>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// 📊 ADVANCED ANALYTICS DASHBOARD
const AdvancedAnalytics = ({ entries, analytics }) => {
    const [selectedMetric, setSelectedMetric] = useState('accuracy');
    const [timeRange, setTimeRange] = useState('week');
    const [chartType, setChartType] = useState('area');

    const prepareTimeSeriesData = () => {
        const grouped = entries.reduce((acc, entry) => {
            const date = new Date(entry.created_at).toLocaleDateString('he-IL', {
                day: '2-digit',
                month: '2-digit'
            });
            if (!acc[date]) {
                acc[date] = { date, correct: 0, total: 0, accuracy: 0 };
            }
            acc[date].total++;
            if (entry.is_correct) acc[date].correct++;
            acc[date].accuracy = Math.round((acc[date].correct / acc[date].total) * 100);
            return acc;
        }, {});

        return Object.values(grouped).slice(-30);
    };

    const prepareDifficultyData = () => {
        const difficultyMap = { easy: 'קל', medium: 'בינוני', hard: 'קשה' };
        return Object.entries(analytics.byDifficulty || {}).map(([diff, data]) => ({
            name: difficultyMap[diff] || diff,
            value: data.total,
            accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
            correct: data.correct,
            fill: diff === 'easy' ? COLORS.success[0] :
                diff === 'medium' ? COLORS.warning[0] :
                    COLORS.danger[0]
        }));
    };

    const prepareTopicRadarData = () => {
        return Object.entries(analytics.byTopic || {}).slice(0, 6).map(([topic, data]) => ({
            subject: topic.length > 15 ? topic.substring(0, 12) + '...' : topic,
            accuracy: data.accuracy,
            total: data.total,
            fullMark: 100
        }));
    };

    const timeSeriesData = prepareTimeSeriesData();
    const difficultyData = prepareDifficultyData();
    const radarData = prepareTopicRadarData();

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white border-2 border-blue-500 rounded-xl p-4 shadow-2xl">
                    <p className="font-bold text-gray-900 mb-2">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ color: entry.color }} className="font-bold">
                            {entry.name}: {entry.value}
                            {entry.name.includes('דיוק') && '%'}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-8 shadow-2xl mb-8"
        >
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg"
                    >
                        <ChartBar className="w-8 h-8 text-white" />
                    </motion.div>
                    <div>
                        <h3 className="text-3xl font-black text-gray-800">ניתוח מתקדם</h3>
                        <p className="text-gray-600">סטטיסטיקות מפורטות על הביצועים שלך</p>
                    </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                    {['day', 'week', 'month'].map((range) => (
                        <motion.button
                            key={range}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setTimeRange(range)}
                            className={`px-5 py-2 rounded-xl font-bold transition-all ${
                                timeRange === range
                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {range === 'day' ? 'יום' : range === 'week' ? 'שבוע' : 'חודש'}
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid lg:grid-cols-2 gap-8 mb-8">
                {/* Accuracy Over Time */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200 shadow-lg"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <LineChart className="w-6 h-6 text-blue-600" />
                            דיוק לאורך זמן
                        </h4>
                        <div className="flex gap-2">
                            {['area', 'line'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setChartType(type)}
                                    className={`px-3 py-1 rounded-lg text-sm font-bold ${
                                        chartType === type
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white text-gray-600'
                                    }`}
                                >
                                    {type === 'area' ? 'אזור' : 'קו'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                        {chartType === 'area' ? (
                            <AreaChart data={timeSeriesData}>
                                <defs>
                                    <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                                <YAxis stroke="#6b7280" domain={[0, 100]} />
                                <Tooltip content={<CustomTooltip />} />
                                <Area
                                    type="monotone"
                                    dataKey="accuracy"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorAccuracy)"
                                    name="דיוק"
                                />
                            </AreaChart>
                        ) : (
                            <RechartsLineChart data={timeSeriesData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                                <YAxis stroke="#6b7280" domain={[0, 100]} />
                                <Tooltip content={<CustomTooltip />} />
                                <Line
                                    type="monotone"
                                    dataKey="accuracy"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    dot={{ fill: '#3b82f6', r: 5 }}
                                    activeDot={{ r: 8 }}
                                    name="דיוק"
                                />
                            </RechartsLineChart>
                        )}
                    </ResponsiveContainer>
                </motion.div>

                {/* Difficulty Distribution */}
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200 shadow-lg"
                >
                    <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <PieChart className="w-6 h-6 text-purple-600" />
                        התפלגות רמות קושי
                    </h4>
                    <ResponsiveContainer width="100%" height={300}>
                        <RechartsPieChart>
                            <Pie
                                data={difficultyData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, value, accuracy }) => `${name}: ${value} (${accuracy}%)`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {difficultyData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </RechartsPieChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>

            {/* Topic Performance Radar */}
            {radarData.length > 0 && (
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200 shadow-lg"
                >
                    <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Target className="w-6 h-6 text-green-600" />
                        ביצועים לפי נושאים
                    </h4>
                    <ResponsiveContainer width="100%" height={400}>
                        <RadarChart data={radarData}>
                            <PolarGrid stroke="#d1d5db" />
                            <PolarAngleAxis
                                dataKey="subject"
                                stroke="#6b7280"
                                style={{ fontSize: '14px', fontWeight: 'bold' }}
                            />
                            <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#6b7280" />
                            <Radar
                                name="דיוק"
                                dataKey="accuracy"
                                stroke="#10b981"
                                fill="#10b981"
                                fillOpacity={0.6}
                                strokeWidth={3}
                            />
                            <Tooltip content={<CustomTooltip />} />
                        </RadarChart>
                    </ResponsiveContainer>
                </motion.div>
            )}
        </motion.div>
    );
};

// 📝 MAIN NOTEBOOK PAGE COMPONENT
const NotebookPage = () => {
    const navigate = useNavigate();
    const { user, nexonProfile } = useAuthStore();

    const [entries, setEntries] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('date-desc');
    const [searchQuery, setSearchQuery] = useState('');
    const [showOnlyIncorrect, setShowOnlyIncorrect] = useState(false);
    const [expandedEntries, setExpandedEntries] = useState(new Set());
    const [selectedDifficulty, setSelectedDifficulty] = useState('all');
    const [currentView, setCurrentView] = useState('entries');

    const [analytics, setAnalytics] = useState({
        byTopic: {},
        byDifficulty: {},
        streaks: {},
        timeSpent: 0
    });

    const [suggestedDifficulty, setSuggestedDifficulty] = useState('medium');
    const [liveStats, setLiveStats] = useState({
        realtimeAccuracy: 0,
        totalQuestions: 0,
        todayQuestions: 0,
        weeklyActiveDays: 0
    });

    // Get curriculum topics
    const currentGrade = nexonProfile?.grade || user?.grade || '8';
    const currentTrack = nexonProfile?.track || user?.track;
    const gradeId = getUserGradeId(currentGrade, currentTrack);
    const gradeConfig = getGradeConfig(gradeId);
    const availableTopics = gradeConfig?.topics || [];

    console.log('📚 [NotebookPage] Available topics:', {
        count: availableTopics.length,
        topics: availableTopics.map(t => ({ name: t.name, id: t.id, icon: t.icon }))
    });

    useEffect(() => {
        if (user?.uid) {
            loadNotebookData();
            loadAnalytics();
        }
    }, [user?.uid]);

    const loadNotebookData = async () => {
        try {
            setLoading(true);
            const userId = user?.uid;

            const [entriesRes, statsRes] = await Promise.all([
                fetch(`${API_URL}/api/notebook/entries?userId=${userId}`),
                fetch(`${API_URL}/api/notebook/stats?userId=${userId}`)
            ]);

            const [entriesData, statsData] = await Promise.all([
                entriesRes.json(),
                statsRes.json()
            ]);

            if (entriesData.success) {
                setEntries(entriesData.entries || []);
            }

            if (statsData.success) {
                setStats(statsData.stats);
            }
        } catch (error) {
            console.error('❌ Error loading notebook:', error);
            toast.error('שגיאה בטעינת המחברת');
        } finally {
            setLoading(false);
        }
    };

    const loadAnalytics = async () => {
        try {
            const userId = user?.uid;
            const entriesRes = await fetch(`${API_URL}/api/notebook/entries?userId=${userId}`);
            const entriesData = await entriesRes.json();

            if (entriesData.success && entriesData.entries) {
                const entries = entriesData.entries;

                const byTopic = {};
                entries.forEach(entry => {
                    const topic = entry.topic || 'ללא נושא';
                    if (!byTopic[topic]) {
                        byTopic[topic] = { total: 0, correct: 0, accuracy: 0 };
                    }
                    byTopic[topic].total++;
                    if (entry.is_correct) {
                        byTopic[topic].correct++;
                    }
                    byTopic[topic].accuracy = Math.round((byTopic[topic].correct / byTopic[topic].total) * 100);
                });

                const byDifficulty = {
                    easy: { total: 0, correct: 0 },
                    medium: { total: 0, correct: 0 },
                    hard: { total: 0, correct: 0 }
                };
                entries.forEach(entry => {
                    const diff = entry.difficulty || 'medium';
                    byDifficulty[diff].total++;
                    if (entry.is_correct) {
                        byDifficulty[diff].correct++;
                    }
                });

                setAnalytics({
                    byTopic,
                    byDifficulty,
                    streaks: calculateStreaks(entries),
                    timeSpent: entries.length * 3
                });
            }
        } catch (error) {
            console.error('❌ Error loading analytics:', error);
        }
    };

    const calculateStreaks = (entries) => {
        const sortedEntries = [...entries].sort((a, b) =>
            new Date(a.created_at) - new Date(b.created_at)
        );

        let currentStreak = 0;
        let maxStreak = 0;
        let lastDate = null;

        sortedEntries.forEach(entry => {
            const entryDate = new Date(entry.created_at).toDateString();
            if (lastDate !== entryDate) {
                currentStreak = 1;
                lastDate = entryDate;
            }
            maxStreak = Math.max(maxStreak, currentStreak);
        });

        return { current: currentStreak, max: maxStreak };
    };

    const toggleEntryExpansion = (entryId) => {
        const newExpanded = new Set(expandedEntries);
        if (newExpanded.has(entryId)) {
            newExpanded.delete(entryId);
        } else {
            newExpanded.add(entryId);
        }
        setExpandedEntries(newExpanded);
    };

    // 🚀 ENHANCED NAVIGATION TO PRACTICE
    const navigateToPractice = (topic) => {
        const topicObj = typeof topic === 'string'
            ? availableTopics.find(t => t.name === topic || t.id === topic) || {
            name: topic,
            id: topic.replace(/\s+/g, '_').toLowerCase(),
            icon: '📚',
            difficulty: 'medium'
        }
            : topic;

        console.log('🚀 [Navigation] Starting adaptive practice:', {
            topic: topicObj,
            difficulty: suggestedDifficulty,
            user: user?.uid,
            stats: liveStats
        });

        const navigationState = {
            // Critical flags
            autoStartPractice: true,
            fromNotebook: true,
            mode: 'adaptive',

            // Topic information (COMPLETE OBJECT)
            selectedTopic: topicObj,
            selectedSubtopic: null,

            // Adaptive difficulty
            suggestedDifficulty: suggestedDifficulty,
            difficulty: suggestedDifficulty,

            // User information
            userId: user?.uid,

            // Student profile with performance metrics
            studentProfile: {
                name: user?.displayName || user?.name || nexonProfile?.name || 'תלמיד',
                grade: currentGrade,
                track: currentTrack,
                mathFeeling: nexonProfile?.mathFeeling || 'okay',
                learningStyle: nexonProfile?.learningStyle || 'visual',
                goalFocus: nexonProfile?.goalFocus || 'understanding',
                personality: nexonProfile?.personality || 'nexon',

                // Performance metrics
                recentAccuracy: liveStats?.realtimeAccuracy || 0,
                totalQuestions: liveStats?.totalQuestions || 0,
                todayQuestions: liveStats?.todayQuestions || 0,
                currentStreak: liveStats?.weeklyActiveDays || 0,

                // Analytics
                analytics: analytics
            },

            // Additional context
            source: 'ai-insights',
            timestamp: Date.now()
        };

        console.log('📦 [Navigation] State prepared:', navigationState);

        navigate('/dashboard', { state: navigationState });

        toast.success(
            `🚀 מתחיל תרגול מותאם אישית!\n📚 ${topicObj.name}\n⭐ רמה: ${getDifficultyLabel(suggestedDifficulty)}`,
            { duration: 4000, icon: '🎯' }
        );
    };

    const getDifficultyLabel = (difficulty) => {
        const labels = { easy: 'קל', medium: 'בינוני', hard: 'קשה' };
        return labels[difficulty] || 'בינוני';
    };

    const retryQuestion = (entry) => {
        const topicObj = availableTopics.find(t => t.name === entry.topic) || {
            name: entry.topic,
            id: entry.topic.replace(/\s+/g, '_').toLowerCase(),
            icon: '📚',
            difficulty: entry.difficulty || 'medium'
        };

        navigate('/dashboard', {
            state: {
                autoStartPractice: true,
                fromNotebook: true,
                mode: 'retry',
                selectedTopic: topicObj,
                selectedSubtopic: entry.subtopic ? { name: entry.subtopic } : null,
                suggestedDifficulty: entry.difficulty || 'medium',
                retryQuestion: {
                    topic: entry.topic,
                    subtopic: entry.subtopic,
                    question: entry.question_text,
                    originalAnswer: entry.correct_answer
                },
                userId: user?.uid,
                studentProfile: {
                    name: user?.displayName || user?.name || 'תלמיד',
                    grade: currentGrade,
                    track: currentTrack,
                    mathFeeling: nexonProfile?.mathFeeling || 'okay'
                }
            }
        });

        toast.success('בוא נתרגל שוב! 💪');
    };

    const getFilteredAndSortedEntries = () => {
        let filtered = [...entries];

        if (filter !== 'all') {
            filtered = filtered.filter(e => e.topic === filter);
        }

        if (selectedDifficulty !== 'all') {
            filtered = filtered.filter(e => e.difficulty === selectedDifficulty);
        }

        if (showOnlyIncorrect) {
            filtered = filtered.filter(e => !e.is_correct);
        }

        if (searchQuery) {
            filtered = filtered.filter(e =>
                e.question_text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                e.topic?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                e.subtopic?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'date-desc':
                    return new Date(b.created_at) - new Date(a.created_at);
                case 'date-asc':
                    return new Date(a.created_at) - new Date(b.created_at);
                case 'topic':
                    return (a.topic || '').localeCompare(b.topic || '');
                case 'difficulty':
                    const diffOrder = { easy: 1, medium: 2, hard: 3 };
                    return diffOrder[a.difficulty] - diffOrder[b.difficulty];
                default:
                    return 0;
            }
        });

        return filtered;
    };

    const filteredEntries = getFilteredAndSortedEntries();
    const uniqueTopics = [...new Set(entries.map(e => e.topic).filter(Boolean))];

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'easy': return 'bg-green-100 text-green-700 border-green-300';
            case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
            case 'hard': return 'bg-red-100 text-red-700 border-red-300';
            default: return 'bg-gray-100 text-gray-700 border-gray-300';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
                <motion.div
                    className="relative"
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                        <Brain className="w-20 h-20 text-white" />
                    </motion.div>
                    <motion.div
                        className="absolute inset-0 w-20 h-20 border-4 border-purple-300 rounded-full"
                        animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                    />
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 py-8 px-4" dir="rtl">
            <div className="max-w-7xl mx-auto">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-10"
                >
                    <motion.div
                        animate={{
                            rotate: [0, 10, -10, 0],
                            scale: [1, 1.1, 1]
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="inline-block text-7xl mb-6"
                    >
                        📚
                    </motion.div>
                    <h1 className="text-6xl md:text-7xl font-black text-white mb-4 drop-shadow-2xl">
                        המחברת החכמה שלי
                    </h1>
                    <p className="text-2xl text-gray-200 max-w-3xl mx-auto">
                        מעקב אחר ההתקדמות שלך עם AI שמתאים את רמת הקושי בזמן אמת ⚡
                    </p>
                </motion.div>

                {/* Live Performance Monitor */}
                <LivePerformanceMonitor
                    userId={user?.uid}
                    onDifficultyUpdate={setSuggestedDifficulty}
                    onStatsUpdate={setLiveStats}
                />

                {/* AI Insights Panel */}
                <AIInsightsPanel
                    userId={user?.uid}
                    availableTopics={availableTopics}
                    onNavigateToPractice={navigateToPractice}
                />

                {/* View Selector */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/10 backdrop-blur-xl rounded-2xl p-2 mb-8 shadow-2xl flex gap-2"
                >
                    {[
                        { id: 'entries', label: 'תרגילים', icon: BookOpen },
                        { id: 'analytics', label: 'ניתוחים', icon: ChartBar },
                        { id: 'ai', label: 'תובנות AI', icon: BrainCircuit }
                    ].map((view) => (
                        <motion.button
                            key={view.id}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => setCurrentView(view.id)}
                            className={`flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-black text-lg transition-all ${
                                currentView === view.id
                                    ? 'bg-white text-purple-900 shadow-2xl'
                                    : 'text-white hover:bg-white/20'
                            }`}
                        >
                            <view.icon className="w-6 h-6" />
                            {view.label}
                        </motion.button>
                    ))}
                </motion.div>

                {/* Analytics View */}
                {currentView === 'analytics' && (
                    <AdvancedAnalytics entries={entries} analytics={analytics} />
                )}

                {/* AI View */}
                {currentView === 'ai' && (
                    <AIInsightsPanel
                        userId={user?.uid}
                        availableTopics={availableTopics}
                        onNavigateToPractice={navigateToPractice}
                    />
                )}

                {/* Entries View */}
                {currentView === 'entries' && (
                    <>
                        {/* Filters */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-3xl p-8 shadow-2xl mb-8"
                        >
                            {/* Search */}
                            <div className="mb-6">
                                <div className="relative">
                                    <Search className="absolute right-4 top-4 w-6 h-6 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="חיפוש לפי שאלה, נושא או תת-נושא..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pr-12 pl-6 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-purple-500 bg-gray-50 text-lg font-medium"
                                    />
                                </div>
                            </div>

                            {/* Filter Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="text-sm font-black text-gray-700 mb-2 block">
                                        📚 נושא
                                    </label>
                                    <select
                                        value={filter}
                                        onChange={(e) => setFilter(e.target.value)}
                                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 bg-white font-medium"
                                    >
                                        <option value="all">כל הנושאים ({entries.length})</option>
                                        {uniqueTopics.map(topic => {
                                            const count = entries.filter(e => e.topic === topic).length;
                                            return (
                                                <option key={topic} value={topic}>
                                                    {topic} ({count})
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-sm font-black text-gray-700 mb-2 block">
                                        ⭐ רמת קושי
                                    </label>
                                    <select
                                        value={selectedDifficulty}
                                        onChange={(e) => setSelectedDifficulty(e.target.value)}
                                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 bg-white font-medium"
                                    >
                                        <option value="all">כל הרמות</option>
                                        <option value="easy">קל</option>
                                        <option value="medium">בינוני</option>
                                        <option value="hard">קשה</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-sm font-black text-gray-700 mb-2 block">
                                        🔄 מיון לפי
                                    </label>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 bg-white font-medium"
                                    >
                                        <option value="date-desc">תאריך (חדש לישן)</option>
                                        <option value="date-asc">תאריך (ישן לחדש)</option>
                                        <option value="topic">נושא</option>
                                        <option value="difficulty">רמת קושי</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-sm font-black text-gray-700 mb-2 block">
                                        🎯 סינון
                                    </label>
                                    <motion.button
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => setShowOnlyIncorrect(!showOnlyIncorrect)}
                                        className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-black transition-all ${
                                            showOnlyIncorrect
                                                ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        <XCircle className="w-5 h-5" />
                                        {showOnlyIncorrect ? 'טעויות בלבד' : 'הצג הכל'}
                                    </motion.button>
                                </div>
                            </div>

                            <div className="mt-6 text-center text-gray-600 font-medium">
                                מציג <span className="font-black text-purple-600">{filteredEntries.length}</span> תוצאות
                                מתוך <span className="font-black text-blue-600">{entries.length}</span> רשומות
                            </div>
                        </motion.div>

                        {/* Entries List */}
                        <div className="space-y-6">
                            {filteredEntries.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-white rounded-3xl p-16 text-center shadow-2xl"
                                >
                                    <motion.div
                                        animate={{ y: [0, -15, 0] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        <BookOpen className="w-24 h-24 text-gray-400 mx-auto mb-6" />
                                    </motion.div>
                                    <h3 className="text-3xl font-black text-gray-700 mb-4">
                                        {searchQuery || filter !== 'all' || showOnlyIncorrect
                                            ? 'לא נמצאו תוצאות'
                                            : 'המחברת שלך ריקה'}
                                    </h3>
                                    <p className="text-xl text-gray-600 mb-8">
                                        {searchQuery || filter !== 'all' || showOnlyIncorrect
                                            ? 'נסה לשנות את הסינון או החיפוש'
                                            : 'התחל לפתור תרגילים כדי לראות כאן את ההתקדמות שלך!'}
                                    </p>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => navigate('/dashboard')}
                                        className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-black text-lg shadow-2xl"
                                    >
                                        <Rocket className="w-6 h-6 inline-block mr-2" />
                                        התחל לתרגל עכשיו
                                    </motion.button>
                                </motion.div>
                            ) : (
                                <AnimatePresence>
                                    {filteredEntries.map((entry, index) => {
                                        const isExpanded = expandedEntries.has(entry.id);

                                        return (
                                            <motion.div
                                                key={entry.id}
                                                initial={{ opacity: 0, y: 30 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -30 }}
                                                transition={{ delay: index * 0.05 }}
                                                className={`bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all ${
                                                    !entry.is_correct ? 'ring-4 ring-red-200' : ''
                                                }`}
                                            >
                                                <div
                                                    className="p-8 cursor-pointer"
                                                    onClick={() => toggleEntryExpansion(entry.id)}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-4 flex-wrap">
                                                                {entry.topic && (
                                                                    <motion.span
                                                                        whileHover={{ scale: 1.05 }}
                                                                        className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full text-sm font-black shadow-lg"
                                                                    >
                                                                        {entry.topic}
                                                                    </motion.span>
                                                                )}
                                                                {entry.subtopic && (
                                                                    <motion.span
                                                                        whileHover={{ scale: 1.05 }}
                                                                        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm font-black shadow-lg"
                                                                    >
                                                                        {entry.subtopic}
                                                                    </motion.span>
                                                                )}
                                                                <span className={`px-4 py-2 rounded-full text-sm font-black border-2 ${getDifficultyColor(entry.difficulty)}`}>
                                                                    {getDifficultyLabel(entry.difficulty)}
                                                                </span>
                                                            </div>

                                                            <h3 className="font-black text-2xl mb-3 text-gray-900">
                                                                {entry.question_text ?
                                                                    (entry.question_text.length > 100 ?
                                                                        entry.question_text.substring(0, 100) + '...' :
                                                                        entry.question_text)
                                                                    : 'שאלה ללא כותרת'}
                                                            </h3>

                                                            <div className="flex items-center gap-6 text-sm text-gray-600 font-medium">
                                                                <div className="flex items-center gap-2">
                                                                    <Calendar className="w-5 h-5" />
                                                                    {new Date(entry.created_at).toLocaleDateString('he-IL', {
                                                                        day: 'numeric',
                                                                        month: 'long',
                                                                        year: 'numeric'
                                                                    })}
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <Clock className="w-5 h-5" />
                                                                    {new Date(entry.created_at).toLocaleTimeString('he-IL', {
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-4">
                                                            <motion.div
                                                                animate={{
                                                                    scale: entry.is_correct ? [1, 1.2, 1] : 1,
                                                                    rotate: entry.is_correct ? [0, 10, -10, 0] : 0
                                                                }}
                                                                transition={{ duration: 0.5 }}
                                                            >
                                                                {entry.is_correct ?
                                                                    <CheckCircle className="w-12 h-12 text-green-500" /> :
                                                                    <XCircle className="w-12 h-12 text-red-500" />
                                                                }
                                                            </motion.div>
                                                            <motion.div
                                                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                                                transition={{ duration: 0.3 }}
                                                            >
                                                                <ChevronDown className="w-8 h-8 text-gray-400" />
                                                            </motion.div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <AnimatePresence>
                                                    {isExpanded && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.3 }}
                                                            className="border-t-4 border-gray-100"
                                                        >
                                                            <div className="p-8 space-y-6">
                                                                {/* Full Question */}
                                                                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border-2 border-gray-200">
                                                                    <h4 className="font-black text-gray-800 mb-3 flex items-center gap-2 text-lg">
                                                                        <Brain className="w-6 h-6 text-blue-600" />
                                                                        השאלה המלאה:
                                                                    </h4>
                                                                    <p className="text-gray-900 whitespace-pre-wrap text-lg font-medium leading-relaxed">
                                                                        {entry.question_text}
                                                                    </p>
                                                                </div>

                                                                {/* User Answer */}
                                                                <div className={`rounded-2xl p-6 border-4 ${
                                                                    entry.is_correct
                                                                        ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300'
                                                                        : 'bg-gradient-to-br from-red-50 to-pink-50 border-red-300'
                                                                }`}>
                                                                    <h4 className="font-black mb-3 flex items-center gap-2 text-lg">
                                                                        {entry.is_correct ?
                                                                            <CheckCircle className="w-6 h-6 text-green-600" /> :
                                                                            <XCircle className="w-6 h-6 text-red-600" />
                                                                        }
                                                                        <span className={entry.is_correct ? 'text-green-800' : 'text-red-800'}>
                                                                            התשובה שלך:
                                                                        </span>
                                                                    </h4>
                                                                    <p className={`font-mono text-2xl font-black ${
                                                                        entry.is_correct ? 'text-green-900' : 'text-red-900'
                                                                    }`}>
                                                                        {entry.user_answer || 'לא נענה'}
                                                                    </p>
                                                                </div>

                                                                {/* Correct Answer */}
                                                                {!entry.is_correct && (
                                                                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-4 border-green-300">
                                                                        <h4 className="font-black text-green-800 mb-3 flex items-center gap-2 text-lg">
                                                                            <Lightbulb className="w-6 h-6 text-yellow-500" />
                                                                            התשובה הנכונה:
                                                                        </h4>
                                                                        <p className="font-mono text-2xl font-black text-green-900">
                                                                            {entry.correct_answer}
                                                                        </p>
                                                                    </div>
                                                                )}

                                                                {/* Explanation */}
                                                                {entry.explanation && (
                                                                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-4 border-blue-300">
                                                                        <h4 className="font-black text-blue-800 mb-3 flex items-center gap-2 text-lg">
                                                                            <Brain className="w-6 h-6" />
                                                                            הסבר מפורט:
                                                                        </h4>
                                                                        <p className="text-blue-900 whitespace-pre-wrap text-lg leading-relaxed">
                                                                            {entry.explanation}
                                                                        </p>
                                                                    </div>
                                                                )}

                                                                {/* Action Buttons */}
                                                                <div className="flex gap-4 pt-4">
                                                                    {!entry.is_correct && (
                                                                        <motion.button
                                                                            whileHover={{ scale: 1.05 }}
                                                                            whileTap={{ scale: 0.95 }}
                                                                            onClick={() => retryQuestion(entry)}
                                                                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-black shadow-lg text-lg"
                                                                        >
                                                                            <RefreshCw className="w-5 h-5" />
                                                                            נסה שוב
                                                                        </motion.button>
                                                                    )}

                                                                    <motion.button
                                                                        whileHover={{ scale: 1.05 }}
                                                                        whileTap={{ scale: 0.95 }}
                                                                        onClick={() => {
                                                                            const topicObj = availableTopics.find(t => t.name === entry.topic) || {
                                                                                name: entry.topic,
                                                                                id: entry.topic.replace(/\s+/g, '_').toLowerCase(),
                                                                                icon: '📚'
                                                                            };
                                                                            navigateToPractice(topicObj);
                                                                        }}
                                                                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-black shadow-lg text-lg"
                                                                    >
                                                                        <Target className="w-5 h-5" />
                                                                        תרגל נושא זה
                                                                    </motion.button>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default NotebookPage;