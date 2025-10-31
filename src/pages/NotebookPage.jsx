// src/pages/NotebookPage.jsx - UPDATED WITH ADAPTIVE PRACTICE NAVIGATION
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
    PieChart, TrendingDown, Users, Gauge
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
    PolarRadiusAxis
} from 'recharts';
import { getUserGradeId, getGradeConfig } from '../config/israeliCurriculum';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

// Color palette
const COLORS = {
    primary: ['#3b82f6', '#60a5fa', '#93bbfc'],
    success: ['#10b981', '#34d399', '#6ee7b7'],
    warning: ['#f59e0b', '#fbbf24', '#fcd34d'],
    danger: ['#ef4444', '#f87171', '#fca5a5'],
    purple: ['#8b5cf6', '#a78bfa', '#c4b5fd'],
    pink: ['#ec4899', '#f472b6', '#f9a8d4']
};

// Live Performance Monitor Component
const LivePerformanceMonitor = ({ userId, onDifficultyUpdate }) => {
    const [liveStats, setLiveStats] = useState({
        totalQuestions: 0,
        correctAnswers: 0,
        accuracy: 0,
        activeDays: 0,
        todayQuestions: 0,
        weeklyActiveDays: 0,
        realtimeAccuracy: 0,
        lastActivity: null
    });

    const [isLive, setIsLive] = useState(true);
    const [performanceTrend, setPerformanceTrend] = useState('stable');
    const intervalRef = useRef(null);

    useEffect(() => {
        if (userId && isLive) {
            fetchLiveStats();
            intervalRef.current = setInterval(fetchLiveStats, 5000);
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
                const newStats = data.stats;

                if (liveStats.realtimeAccuracy > 0) {
                    if (newStats.realtimeAccuracy > liveStats.realtimeAccuracy + 10) {
                        setPerformanceTrend('improving');
                    } else if (newStats.realtimeAccuracy < liveStats.realtimeAccuracy - 10) {
                        setPerformanceTrend('declining');
                    } else {
                        setPerformanceTrend('stable');
                    }
                }

                setLiveStats(newStats);
            }
        } catch (error) {
            console.error('Error fetching live stats:', error);
        }
    };

    const getDifficultyLabel = (difficulty) => {
        const labels = { easy: 'קל', medium: 'בינוני', hard: 'קשה' };
        return labels[difficulty] || 'בינוני';
    };

    const getCurrentStreak = () => {
        return liveStats.weeklyActiveDays || 0;
    };

    const getTrendIcon = () => {
        switch (performanceTrend) {
            case 'improving': return <TrendingUp className="w-5 h-5 text-green-500" />;
            case 'declining': return <TrendingDown className="w-5 h-5 text-red-500" />;
            default: return <Activity className="w-5 h-5 text-blue-500" />;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-3xl p-6 mb-8 shadow-2xl"
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className={`w-3 h-3 rounded-full ${isLive ? 'bg-green-400' : 'bg-gray-400'}`}
                    />
                    <h3 className="text-2xl font-black flex items-center gap-2">
                        <Activity className="w-8 h-8" />
                        ביצועים בזמן אמת
                    </h3>
                </div>
                <button
                    onClick={() => setIsLive(!isLive)}
                    className="px-4 py-2 bg-white/20 rounded-xl hover:bg-white/30 transition-all"
                >
                    {isLive ? 'השהה' : 'הפעל'}
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-white/20 backdrop-blur-sm rounded-2xl p-4"
                >
                    <div className="flex items-center justify-between mb-2">
                        <Flame className="w-8 h-8 text-orange-300" />
                        <motion.div
                            key={getCurrentStreak()}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-3xl font-black"
                        >
                            {getCurrentStreak()}
                        </motion.div>
                    </div>
                    <div className="text-sm opacity-90">ימים פעילים</div>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-white/20 backdrop-blur-sm rounded-2xl p-4"
                >
                    <div className="flex items-center justify-between mb-2">
                        <Brain className="w-8 h-8 text-blue-300" />
                        <motion.div
                            key={liveStats.todayQuestions}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="text-3xl font-black"
                        >
                            {liveStats.todayQuestions}
                        </motion.div>
                    </div>
                    <div className="text-sm opacity-90">שאלות היום</div>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-white/20 backdrop-blur-sm rounded-2xl p-4"
                >
                    <div className="flex items-center justify-between mb-2">
                        <Target className="w-8 h-8 text-green-300" />
                        <div className="flex items-center gap-2">
                            <motion.div
                                key={liveStats.realtimeAccuracy}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="text-3xl font-black"
                            >
                                {Math.round(liveStats.realtimeAccuracy)}%
                            </motion.div>
                            {getTrendIcon()}
                        </div>
                    </div>
                    <div className="text-sm opacity-90">דיוק נוכחי</div>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-white/20 backdrop-blur-sm rounded-2xl p-4"
                >
                    <div className="flex items-center justify-between mb-2">
                        <Trophy className="w-8 h-8 text-yellow-300" />
                        <div className="text-xl font-black">
                            {liveStats.totalQuestions}
                        </div>
                    </div>
                    <div className="text-sm opacity-90">סה"כ שאלות</div>
                    <div className="text-xs mt-1 opacity-75">
                        דיוק כללי: {Math.round(liveStats.accuracy)}%
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

// AI Insights Component
// COMPLETE FIX FOR AI INSIGHTS PANEL
// Replace the AIInsightsPanel component in NotebookPage.jsx (lines ~138-274)

const AIInsightsPanel = ({ userId, availableTopics, onNavigateToPractice }) => {
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(true); // ✅ Default to expanded

    useEffect(() => {
        if (userId) {
            console.log('🔍 Fetching insights for user:', userId);
            fetchInsights();
        }
    }, [userId]);

    const fetchInsights = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/api/ai/performance-analysis?userId=${userId}`);
            const data = await response.json();

            console.log('📊 AI Insights response:', data);

            if (data.success) {
                setInsights(data.analysis);
                console.log('✅ Insights loaded:', {
                    feedback: data.analysis.personalizedFeedback?.substring(0, 50),
                    recommendations: data.analysis.recommendations?.length || 0,
                    weakTopics: data.analysis.weakTopics?.length || 0
                });
            } else {
                console.warn('⚠️ Failed to load insights:', data.error);
            }
        } catch (error) {
            console.error('❌ Error fetching AI insights:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl p-6 animate-pulse">
                <div className="h-8 bg-white/50 rounded-lg mb-4 w-1/3"></div>
                <div className="space-y-3">
                    <div className="h-4 bg-white/50 rounded w-full"></div>
                    <div className="h-4 bg-white/50 rounded w-3/4"></div>
                </div>
            </div>
        );
    }

    if (!insights) {
        console.warn('⚠️ No insights data available');
        return (
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl p-6">
                <div className="text-center text-gray-700">
                    <BrainCircuit className="w-12 h-12 mx-auto mb-3 text-purple-600" />
                    <p className="font-bold">לא נמצאו תובנות AI</p>
                    <p className="text-sm mt-2">תתחיל לפתור שאלות כדי לקבל המלצות מותאמות אישית</p>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl p-6 shadow-xl mb-8"
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-black text-gray-800 flex items-center gap-3">
                    <BrainCircuit className="w-8 h-8 text-purple-600" />
                    תובנות AI מותאמות אישית
                </h3>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                        setExpanded(!expanded);
                        console.log('🔄 Toggled expansion:', !expanded);
                    }}
                    className="p-2 bg-white rounded-xl shadow-md hover:bg-gray-50 transition-colors"
                >
                    {expanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-600" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                    )}
                </motion.button>
            </div>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        {/* Personal Feedback */}
                        {insights.personalizedFeedback && (
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 mb-4">
                                <div className="flex items-start gap-3">
                                    <MessageCircle className="w-6 h-6 text-purple-600 mt-1 flex-shrink-0" />
                                    <div className="flex-1">
                                        <div className="font-bold text-purple-900 mb-2">משוב אישי</div>
                                        <p className="text-gray-700 leading-relaxed">
                                            {insights.personalizedFeedback}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Recommendations Grid */}
                        {insights.recommendations && insights.recommendations.length > 0 && (
                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                                {insights.recommendations.map((rec, index) => {
                                    const IconComponent =
                                        rec.icon === 'rocket' ? Zap :
                                            rec.icon === 'foundation' ? BookOpen :
                                                rec.icon === 'clock' ? Clock :
                                                    rec.icon === 'target' ? Target :
                                                        rec.icon === 'fire' ? Flame : Target;

                                    const borderColor =
                                        rec.type === 'difficulty' ? 'border-blue-300' :
                                            rec.type === 'topics' ? 'border-purple-300' :
                                                rec.type === 'time' ? 'border-orange-300' : 'border-green-300';

                                    return (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className={`bg-white rounded-xl p-4 border-2 ${borderColor}`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <IconComponent className="w-6 h-6 flex-shrink-0" style={{
                                                    color: rec.type === 'difficulty' ? '#3b82f6' :
                                                        rec.type === 'topics' ? '#8b5cf6' :
                                                            rec.type === 'time' ? '#f59e0b' : '#10b981'
                                                }} />
                                                <div className="flex-1">
                                                    <div className="font-bold text-gray-800 mb-1">
                                                        {rec.type === 'difficulty' && 'רמת קושי'}
                                                        {rec.type === 'topics' && 'נושאים לתרגול'}
                                                        {rec.type === 'time' && 'ניהול זמן'}
                                                        {rec.type === 'motivation' && 'מוטיבציה'}
                                                    </div>
                                                    <p className="text-sm text-gray-600">{rec.message}</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Weak Topics - THE MAIN FIX */}
                        {insights.weakTopics && insights.weakTopics.length > 0 && (
                            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-5 border-2 border-orange-300">
                                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <AlertCircle className="w-6 h-6 text-orange-500" />
                                    <span className="text-lg">נושאים הדורשים תשומת לב</span>
                                    <span className="text-sm font-normal text-gray-600">
                                        ({insights.weakTopics.length} נושאים)
                                    </span>
                                </h4>

                                <div className="flex flex-wrap gap-3">
                                    {insights.weakTopics.map((topicName, index) => {
                                        console.log(`🔍 Looking for topic: "${topicName}" in`, availableTopics.length, 'topics');

                                        // ✅ CRITICAL FIX: Better topic matching
                                        const topicObj = availableTopics.find(t => {
                                            const match =
                                                t.name === topicName ||
                                                t.nameEn === topicName ||
                                                t.id === topicName ||
                                                t.name.includes(topicName) ||
                                                topicName.includes(t.name);

                                            if (match) {
                                                console.log(`✅ Found match: ${t.name} for "${topicName}"`);
                                            }
                                            return match;
                                        });

                                        const finalTopic = topicObj || {
                                            name: topicName,
                                            id: topicName,
                                            icon: '📚',
                                            difficulty: 'medium'
                                        };

                                        console.log(`📍 Topic ${index + 1}:`, finalTopic);

                                        return (
                                            <motion.button
                                                key={index}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => {
                                                    console.log('🚀 Navigating to practice:', finalTopic);
                                                    onNavigateToPractice(finalTopic);
                                                }}
                                                className="group relative px-5 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold shadow-lg hover:shadow-2xl transition-all flex items-center gap-2"
                                            >
                                                <span className="text-xl">{finalTopic.icon}</span>
                                                <span>{finalTopic.name}</span>
                                                <Play className="w-5 h-5 group-hover:translate-x-1 transition-transform" />

                                                {/* Tooltip */}
                                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                                    התחל תרגול מותאם אישית
                                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                                                </div>
                                            </motion.button>
                                        );
                                    })}
                                </div>

                                <p className="text-sm text-orange-700 mt-4 bg-white/50 rounded-lg p-3">
                                    💡 <strong>טיפ:</strong> לחץ על נושא כדי להתחיל תרגול מותאם אישית ברמת הקושי המתאימה לך
                                </p>
                            </div>
                        )}

                        {/* No weak topics message */}
                        {(!insights.weakTopics || insights.weakTopics.length === 0) && (
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border-2 border-green-300 text-center">
                                <Trophy className="w-12 h-12 text-green-600 mx-auto mb-3" />
                                <h4 className="font-bold text-green-900 mb-2 text-lg">
                                    מעולה! אין נושאים חלשים 🎉
                                </h4>
                                <p className="text-green-700">
                                    הביצועים שלך טובים בכל הנושאים. המשך ככה!
                                </p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// Advanced Analytics Dashboard
const AdvancedAnalytics = ({ entries, analytics }) => {
    const [selectedMetric, setSelectedMetric] = useState('accuracy');
    const [timeRange, setTimeRange] = useState('week');

    const prepareTimeSeriesData = () => {
        const grouped = entries.reduce((acc, entry) => {
            const date = new Date(entry.created_at).toLocaleDateString('he-IL');
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
        return Object.entries(analytics.byDifficulty).map(([diff, data]) => ({
            name: difficultyMap[diff] || diff,
            value: data.total,
            accuracy: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
            fill: diff === 'easy' ? COLORS.success[0] :
                diff === 'medium' ? COLORS.warning[0] :
                    COLORS.danger[0]
        }));
    };

    const prepareTopicRadarData = () => {
        return Object.entries(analytics.byTopic).slice(0, 6).map(([topic, data]) => ({
            subject: topic.length > 15 ? topic.substring(0, 12) + '...' : topic,
            accuracy: data.accuracy,
            fullMark: 100
        }));
    };

    const timeSeriesData = prepareTimeSeriesData();
    const difficultyData = prepareDifficultyData();
    const radarData = prepareTopicRadarData();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-8 shadow-2xl mb-8"
        >
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-3xl font-black text-gray-800 flex items-center gap-3">
                    <ChartBar className="w-10 h-10 text-blue-600" />
                    ניתוח מתקדם
                </h3>

                <div className="flex gap-2">
                    {['day', 'week', 'month'].map((range) => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-4 py-2 rounded-lg font-bold transition-all ${
                                timeRange === range
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {range === 'day' ? 'יום' : range === 'week' ? 'שבוע' : 'חודש'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6"
                >
                    <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <LineChart className="w-6 h-6 text-blue-600" />
                        דיוק לאורך זמן
                    </h4>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={timeSeriesData}>
                            <defs>
                                <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="date" stroke="#6b7280" />
                            <YAxis stroke="#6b7280" domain={[0, 100]} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#ffffff',
                                    border: '2px solid #3b82f6',
                                    borderRadius: '12px'
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="accuracy"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorAccuracy)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6"
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
                            <Tooltip />
                        </RechartsPieChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>
        </motion.div>
    );
};

// Main NotebookPage Component
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

    const [aiAnalysis, setAiAnalysis] = useState(null);
    const [suggestedDifficulty, setSuggestedDifficulty] = useState('medium');
    const [liveStats, setLiveStats] = useState({
        realtimeAccuracy: 0,
        totalQuestions: 0,
        todayQuestions: 0
    });

    // 🎯 Get curriculum topics for AI insights
    const currentGrade = nexonProfile?.grade || user?.grade || '8';
    const currentTrack = nexonProfile?.track || user?.track;
    const gradeId = getUserGradeId(currentGrade, currentTrack);
    const gradeConfig = getGradeConfig(gradeId);
    const availableTopics = gradeConfig?.topics || [];

    useEffect(() => {
        if (user?.uid) {
            loadNotebookData();
            loadAnalytics();
            loadAIAnalysis();
        }
    }, [user?.uid]);

    const loadNotebookData = async () => {
        try {
            setLoading(true);
            const userId = user?.uid;

            const entriesRes = await fetch(`${API_URL}/api/notebook/entries?userId=${userId}`);
            const entriesData = await entriesRes.json();

            const statsRes = await fetch(`${API_URL}/api/notebook/stats?userId=${userId}`);
            const statsData = await statsRes.json();

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

    const loadAIAnalysis = async () => {
        try {
            const response = await fetch(`${API_URL}/api/ai/performance-analysis?userId=${user?.uid}`);
            const data = await response.json();

            if (data.success) {
                setAiAnalysis(data.analysis);
                setSuggestedDifficulty(data.analysis.recommendedDifficulty || 'medium');
            }
        } catch (error) {
            console.error('Error loading AI analysis:', error);
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

    // 🚀 ENHANCED: Navigate to practice with ALL required props
    const navigateToPractice = (topic) => {
        // Ensure we have a valid topic object
        const topicObj = typeof topic === 'string'
            ? availableTopics.find(t => t.name === topic || t.id === topic) || { name: topic, id: topic, icon: '📚' }
            : topic;

        console.log('🎯 Navigating to practice with:', {
            topic: topicObj,
            difficulty: suggestedDifficulty,
            stats: liveStats
        });

        navigate('/dashboard', {
            state: {
                // ✅ Critical flags
                autoStartPractice: true,
                fromNotebook: true,
                mode: 'adaptive',

                // ✅ Topic information (FULL OBJECT)
                selectedTopic: topicObj,
                selectedSubtopic: null,

                // ✅ Adaptive difficulty
                suggestedDifficulty: suggestedDifficulty,
                difficulty: suggestedDifficulty,

                // ✅ User information
                userId: user?.uid,

                // ✅ Student profile with performance data
                studentProfile: {
                    name: user?.displayName || user?.name || nexonProfile?.name || 'תלמיד',
                    grade: currentGrade,
                    track: currentTrack,
                    mathFeeling: nexonProfile?.mathFeeling || 'okay',
                    learningStyle: nexonProfile?.learningStyle || 'visual',
                    goalFocus: nexonProfile?.goalFocus || 'understanding',
                    personality: nexonProfile?.personality || 'nexon',

                    // ✅ Performance metrics
                    recentAccuracy: liveStats?.realtimeAccuracy || 0,
                    totalQuestions: liveStats?.totalQuestions || 0,
                    todayQuestions: liveStats?.todayQuestions || 0,
                    currentStreak: liveStats?.weeklyActiveDays || 0
                }
            }
        });

        toast.success(
            `🚀 מתחיל תרגול מותאם אישית!\n📚 נושא: ${topicObj.name}\n⭐ רמת קושי: ${getDifficultyLabel(suggestedDifficulty)}`,
            {
                duration: 3000,
                icon: '🎯'
            }
        );
    };

    const getDifficultyLabel = (difficulty) => {
        const labels = { easy: 'קל', medium: 'בינוני', hard: 'קשה' };
        return labels[difficulty] || 'בינוני';
    };

    const retryQuestion = (entry) => {
        const topicObj = availableTopics.find(t => t.name === entry.topic) || {
            name: entry.topic,
            id: entry.topic,
            icon: '📚'
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

    const successRate = stats && stats.totalEntries > 0
        ? Math.round((stats.correctCount / stats.totalEntries) * 100)
        : 0;

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'easy': return 'bg-green-100 text-green-700';
            case 'medium': return 'bg-yellow-100 text-yellow-700';
            case 'hard': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="relative"
                >
                    <Brain className="w-16 h-16 text-white" />
                    <div className="absolute inset-0 w-16 h-16 border-4 border-purple-300 rounded-full animate-ping"></div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 py-8 px-4" dir="rtl">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        className="inline-block text-6xl mb-4"
                    >
                        📚
                    </motion.div>
                    <h1 className="text-5xl md:text-6xl font-black text-white mb-4">
                        המחברת החכמה שלי
                    </h1>
                    <p className="text-xl text-gray-200 max-w-3xl mx-auto">
                        מעקב אחר ההתקדמות שלך עם AI שמתאים את רמת הקושי בזמן אמת
                    </p>
                </motion.div>

                <LivePerformanceMonitor
                    userId={user?.uid}
                    onDifficultyUpdate={setSuggestedDifficulty}
                />

                <AIInsightsPanel
                    userId={user?.uid}
                    availableTopics={availableTopics}
                    onNavigateToPractice={navigateToPractice}
                />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/10 backdrop-blur-lg rounded-2xl p-2 mb-8 flex gap-2"
                >
                    {[
                        { id: 'entries', label: 'תרגילים', icon: BookOpen },
                        { id: 'analytics', label: 'ניתוחים', icon: ChartBar },
                        { id: 'ai', label: 'תובנות AI', icon: BrainCircuit }
                    ].map((view) => (
                        <motion.button
                            key={view.id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setCurrentView(view.id)}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all ${
                                currentView === view.id
                                    ? 'bg-white text-purple-900 shadow-lg'
                                    : 'text-white hover:bg-white/20'
                            }`}
                        >
                            <view.icon className="w-5 h-5" />
                            {view.label}
                        </motion.button>
                    ))}
                </motion.div>

                {currentView === 'analytics' && (
                    <AdvancedAnalytics entries={entries} analytics={analytics} />
                )}

                {currentView === 'entries' && (
                    <>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white rounded-2xl p-6 shadow-xl mb-6"
                        >
                            <div className="mb-4">
                                <div className="relative">
                                    <Search className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="חיפוש לפי שאלה, נושא או תת-נושא..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 bg-gray-50"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-600 mb-1 block">נושא</label>
                                    <select
                                        value={filter}
                                        onChange={(e) => setFilter(e.target.value)}
                                        className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500"
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
                                    <label className="text-sm font-medium text-gray-600 mb-1 block">רמת קושי</label>
                                    <select
                                        value={selectedDifficulty}
                                        onChange={(e) => setSelectedDifficulty(e.target.value)}
                                        className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500"
                                    >
                                        <option value="all">כל הרמות</option>
                                        <option value="easy">קל</option>
                                        <option value="medium">בינוני</option>
                                        <option value="hard">קשה</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-600 mb-1 block">מיון לפי</label>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500"
                                    >
                                        <option value="date-desc">תאריך (חדש לישן)</option>
                                        <option value="date-asc">תאריך (ישן לחדש)</option>
                                        <option value="topic">נושא</option>
                                        <option value="difficulty">רמת קושי</option>
                                    </select>
                                </div>

                                <div className="flex items-end">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setShowOnlyIncorrect(!showOnlyIncorrect)}
                                        className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                                            showOnlyIncorrect
                                                ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        <XCircle className="w-4 h-4" />
                                        {showOnlyIncorrect ? 'מציג טעויות בלבד' : 'הצג טעויות בלבד'}
                                    </motion.button>
                                </div>
                            </div>

                            <div className="mt-4 text-sm text-gray-600">
                                מציג {filteredEntries.length} תוצאות מתוך {entries.length} רשומות
                            </div>
                        </motion.div>

                        <div className="space-y-4">
                            {filteredEntries.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="bg-white rounded-3xl p-12 text-center shadow-xl"
                                >
                                    <motion.div
                                        animate={{ y: [0, -10, 0] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="inline-block"
                                    >
                                        <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    </motion.div>
                                    <h3 className="text-xl font-bold text-gray-700 mb-2">
                                        {searchQuery || filter !== 'all' || showOnlyIncorrect
                                            ? 'לא נמצאו תוצאות'
                                            : 'המחברת שלך ריקה'}
                                    </h3>
                                    <p className="text-gray-600 mb-4">
                                        {searchQuery || filter !== 'all' || showOnlyIncorrect
                                            ? 'נסה לשנות את הסינון או החיפוש'
                                            : 'התחל לפתור תרגילים כדי לראות כאן את ההתקדמות שלך!'}
                                    </p>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => navigate('/dashboard')}
                                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold shadow-lg"
                                    >
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
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                transition={{ delay: index * 0.05 }}
                                                className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all ${
                                                    !entry.is_correct ? 'ring-2 ring-red-200' : ''
                                                }`}
                                            >
                                                <div
                                                    className="p-6 cursor-pointer"
                                                    onClick={() => toggleEntryExpansion(entry.id)}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-3 flex-wrap">
                                                                {entry.topic && (
                                                                    <motion.span
                                                                        whileHover={{ scale: 1.05 }}
                                                                        className="px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full text-sm font-medium shadow-md"
                                                                    >
                                                                        {entry.topic}
                                                                    </motion.span>
                                                                )}
                                                                {entry.subtopic && (
                                                                    <motion.span
                                                                        whileHover={{ scale: 1.05 }}
                                                                        className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-sm font-medium shadow-md"
                                                                    >
                                                                        {entry.subtopic}
                                                                    </motion.span>
                                                                )}
                                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(entry.difficulty)}`}>
                                                                    {getDifficultyLabel(entry.difficulty)}
                                                                </span>
                                                            </div>

                                                            <h3 className="font-bold text-lg mb-2 text-gray-900">
                                                                {entry.question_text ?
                                                                    (entry.question_text.length > 100 ?
                                                                        entry.question_text.substring(0, 100) + '...' :
                                                                        entry.question_text)
                                                                    : 'שאלה ללא כותרת'}
                                                            </h3>

                                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                                <div className="flex items-center gap-1">
                                                                    <Calendar className="w-4 h-4" />
                                                                    {new Date(entry.created_at).toLocaleDateString('he-IL', {
                                                                        day: 'numeric',
                                                                        month: 'long',
                                                                        year: 'numeric'
                                                                    })}
                                                                </div>
                                                                <div className="flex items-center gap-1">
                                                                    <Clock className="w-4 h-4" />
                                                                    {new Date(entry.created_at).toLocaleTimeString('he-IL', {
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-3">
                                                            <motion.div
                                                                animate={{ scale: entry.is_correct ? [1, 1.2, 1] : 1 }}
                                                                transition={{ duration: 0.3 }}
                                                                className={`text-4xl ${entry.is_correct ? 'text-green-500' : 'text-red-500'}`}
                                                            >
                                                                {entry.is_correct ?
                                                                    <CheckCircle className="w-10 h-10" /> :
                                                                    <XCircle className="w-10 h-10" />
                                                                }
                                                            </motion.div>
                                                            <motion.div
                                                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                                                transition={{ duration: 0.3 }}
                                                            >
                                                                <ChevronDown className="w-6 h-6 text-gray-400" />
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
                                                            className="border-t border-gray-200"
                                                        >
                                                            <div className="p-6 space-y-4">
                                                                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4">
                                                                    <h4 className="font-bold text-gray-700 mb-2 flex items-center gap-2">
                                                                        <Brain className="w-5 h-5" />
                                                                        השאלה המלאה:
                                                                    </h4>
                                                                    <p className="text-gray-800 whitespace-pre-wrap font-medium">
                                                                        {entry.question_text}
                                                                    </p>
                                                                </div>

                                                                <div className={`rounded-2xl p-4 ${
                                                                    entry.is_correct
                                                                        ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300'
                                                                        : 'bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-300'
                                                                }`}>
                                                                    <h4 className="font-bold mb-2 flex items-center gap-2">
                                                                        {entry.is_correct ?
                                                                            <CheckCircle className="w-5 h-5 text-green-600" /> :
                                                                            <XCircle className="w-5 h-5 text-red-600" />
                                                                        }
                                                                        <span className={entry.is_correct ? 'text-green-700' : 'text-red-700'}>
                                                                            התשובה שלך:
                                                                        </span>
                                                                    </h4>
                                                                    <p className={`font-mono text-lg font-bold ${
                                                                        entry.is_correct ? 'text-green-800' : 'text-red-800'
                                                                    }`}>
                                                                        {entry.user_answer || 'לא נענה'}
                                                                    </p>
                                                                </div>

                                                                {!entry.is_correct && (
                                                                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border-2 border-green-300">
                                                                        <h4 className="font-bold text-green-700 mb-2 flex items-center gap-2">
                                                                            <Lightbulb className="w-5 h-5" />
                                                                            התשובה הנכונה:
                                                                        </h4>
                                                                        <p className="font-mono text-lg font-bold text-green-800">
                                                                            {entry.correct_answer}
                                                                        </p>
                                                                    </div>
                                                                )}

                                                                {entry.explanation && (
                                                                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 border-2 border-blue-300">
                                                                        <h4 className="font-bold text-blue-700 mb-2 flex items-center gap-2">
                                                                            <Brain className="w-5 h-5" />
                                                                            הסבר:
                                                                        </h4>
                                                                        <p className="text-blue-800 whitespace-pre-wrap">
                                                                            {entry.explanation}
                                                                        </p>
                                                                    </div>
                                                                )}

                                                                <div className="flex gap-3 pt-4">
                                                                    {!entry.is_correct && (
                                                                        <motion.button
                                                                            whileHover={{ scale: 1.05 }}
                                                                            whileTap={{ scale: 0.95 }}
                                                                            onClick={() => retryQuestion(entry)}
                                                                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium shadow-lg"
                                                                        >
                                                                            <RefreshCw className="w-4 h-4" />
                                                                            נסה שוב
                                                                        </motion.button>
                                                                    )}

                                                                    <motion.button
                                                                        whileHover={{ scale: 1.05 }}
                                                                        whileTap={{ scale: 0.95 }}
                                                                        onClick={() => {
                                                                            const topicObj = availableTopics.find(t => t.name === entry.topic) || {
                                                                                name: entry.topic,
                                                                                id: entry.topic,
                                                                                icon: '📚'
                                                                            };
                                                                            navigateToPractice(topicObj);
                                                                        }}
                                                                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-medium shadow-lg"
                                                                    >
                                                                        <Target className="w-4 h-4" />
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