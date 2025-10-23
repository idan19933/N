// src/components/dashboard/ProgressStats.jsx - COMPLETE WITH PAGINATION & FILTERS
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp, TrendingDown, Clock, CheckCircle, AlertCircle,
    ChevronDown, ChevronUp, Filter, SortAsc, BarChart2,
    Target, Zap, Award, Calendar
} from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

// Topic ID to Hebrew name mapping
const TOPIC_NAMES = {
    'inequalities': 'אי-שוויונות',
    'systems-of-equations': 'מערכות משוואות',
    'polynomials': 'פולינומים',
    'quadratic-equations': 'משוואות ריבועיות',
    'linear-equations': 'משוואות לינאריות',
    'algebraic-expressions': 'ביטויים אלגבריים',
    'functions': 'פונקציות',
    'geometry': 'גאומטריה',
    'pythagorean-theorem': 'משפט פיתגורס',
    'sequences': 'סדרות',
    'probability': 'הסתברות',
    'statistics': 'סטטיסטיקה',
    'trigonometry': 'טריגונומטריה',
    'coordinate-geometry': 'גאומטריה אנליטית',
    'vectors': 'וקטורים',
    'derivatives': 'נגזרות',
    'integrals': 'אינטגרלים'
};

const ProgressStats = ({ userId, refreshTrigger }) => {
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAll, setShowAll] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'in_progress', 'completed'
    const [sortBy, setSortBy] = useState('recent'); // 'recent', 'progress', 'accuracy'

    useEffect(() => {
        if (userId) {
            loadStats();
        }
    }, [userId, refreshTrigger]);

    const loadStats = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await axios.get(
                `${API_URL}/api/curriculum/stats/topics/${userId}`
            );

            if (response.data.success) {
                const topicsData = response.data.topics || [];

                // Add Hebrew names
                const topicsWithNames = topicsData.map(topic => ({
                    ...topic,
                    hebrewName: TOPIC_NAMES[topic.topic_id] || topic.topic_id
                }));

                setTopics(topicsWithNames);
            }
        } catch (error) {
            console.error('Error loading curriculum stats:', error);
            setError('שגיאה בטעינת נתוני התקדמות');
        } finally {
            setLoading(false);
        }
    };

    // Filter topics by status
    const getFilteredTopics = () => {
        let filtered = [...topics];

        // Apply status filter
        if (filterStatus === 'in_progress') {
            filtered = filtered.filter(t => t.status === 'in_progress');
        } else if (filterStatus === 'completed') {
            filtered = filtered.filter(t => t.status === 'completed');
        }

        // Apply sorting
        if (sortBy === 'recent') {
            filtered.sort((a, b) => new Date(b.last_activity) - new Date(a.last_activity));
        } else if (sortBy === 'progress') {
            filtered.sort((a, b) => b.progress_percent - a.progress_percent);
        } else if (sortBy === 'accuracy') {
            filtered.sort((a, b) => parseFloat(b.accuracy) - parseFloat(a.accuracy));
        }

        return filtered;
    };

    const filteredTopics = getFilteredTopics();
    const displayTopics = showAll ? filteredTopics : filteredTopics.slice(0, 6);
    const hasMore = filteredTopics.length > 6;

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
            case 'in_progress':
                return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30';
            default:
                return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/30';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'completed':
                return 'הושלם';
            case 'in_progress':
                return 'בתהליך';
            default:
                return 'לא התחיל';
        }
    };

    const getProgressColor = (percent) => {
        if (percent >= 80) return 'bg-green-500';
        if (percent >= 60) return 'bg-blue-500';
        if (percent >= 40) return 'bg-yellow-500';
        return 'bg-orange-500';
    };

    const getAccuracyColor = (accuracy) => {
        const acc = parseFloat(accuracy);
        if (acc >= 80) return 'text-green-600 dark:text-green-400';
        if (acc >= 60) return 'text-blue-600 dark:text-blue-400';
        if (acc >= 40) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-orange-600 dark:text-orange-400';
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `לפני ${diffMins} דקות`;
        if (diffHours < 24) return `לפני ${diffHours} שעות`;
        if (diffDays === 1) return 'אתמול';
        if (diffDays < 7) return `לפני ${diffDays} ימים`;
        return date.toLocaleDateString('he-IL');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500 mb-3"></div>
                    <p className="text-gray-600 dark:text-gray-400">טוען נתוני התקדמות...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-2xl p-6 text-center">
                <AlertCircle className="w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-3" />
                <p className="text-red-600 dark:text-red-400 font-bold">{error}</p>
            </div>
        );
    }

    if (topics.length === 0) {
        return (
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-2xl p-8 text-center">
                <Target className="w-16 h-16 text-purple-600 dark:text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    התחל לתרגל!
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                    פתור תרגילים כדי לראות את ההתקדמות שלך כאן
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Filters and Sort */}
            <div className="flex flex-wrap gap-3 items-center justify-between">
                {/* Status Filter */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilterStatus('all')}
                        className={`px-4 py-2 rounded-xl font-bold transition-all ${
                            filterStatus === 'all'
                                ? 'bg-purple-500 text-white shadow-lg'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                    >
                        הכל ({topics.length})
                    </button>
                    <button
                        onClick={() => setFilterStatus('in_progress')}
                        className={`px-4 py-2 rounded-xl font-bold transition-all ${
                            filterStatus === 'in_progress'
                                ? 'bg-blue-500 text-white shadow-lg'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                    >
                        בתהליך ({topics.filter(t => t.status === 'in_progress').length})
                    </button>
                    <button
                        onClick={() => setFilterStatus('completed')}
                        className={`px-4 py-2 rounded-xl font-bold transition-all ${
                            filterStatus === 'completed'
                                ? 'bg-green-500 text-white shadow-lg'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                        }`}
                    >
                        הושלמו ({topics.filter(t => t.status === 'completed').length})
                    </button>
                </div>

                {/* Sort Options */}
                <div className="flex items-center gap-2">
                    <SortAsc className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-4 py-2 rounded-xl font-bold bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                    >
                        <option value="recent">לפי תאריך</option>
                        <option value="progress">לפי התקדמות</option>
                        <option value="accuracy">לפי דיוק</option>
                    </select>
                </div>
            </div>

            {/* Topics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence mode="popLayout">
                    {displayTopics.map((topic, index) => (
                        <motion.div
                            key={topic.topic_id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: index * 0.05 }}
                            className="group bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-md hover:shadow-xl transition-all border-2 border-gray-100 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600"
                        >
                            {/* Topic Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                        {topic.hebrewName}
                                    </h3>
                                    <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold ${getStatusColor(topic.status)}`}>
                                        {getStatusText(topic.status)}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-black text-gray-900 dark:text-white">
                                        {topic.progress_percent}%
                                    </div>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mb-4">
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${topic.progress_percent}%` }}
                                        transition={{ duration: 0.8, delay: index * 0.05 }}
                                        className={`h-full ${getProgressColor(topic.progress_percent)} rounded-full`}
                                    />
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-3 mb-4">
                                <div className="text-center">
                                    <div className="text-gray-500 dark:text-gray-400 text-xs mb-1">תרגילים</div>
                                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                                        {topic.exercises_completed}
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-gray-500 dark:text-gray-400 text-xs mb-1">נכונות</div>
                                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                                        {topic.exercises_correct}
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-gray-500 dark:text-gray-400 text-xs mb-1">דיוק</div>
                                    <div className={`text-lg font-bold ${getAccuracyColor(topic.accuracy)}`}>
                                        {parseFloat(topic.accuracy).toFixed(0)}%
                                    </div>
                                </div>
                            </div>

                            {/* Last Activity */}
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-200 dark:border-gray-700">
                                <Clock className="w-4 h-4" />
                                <span>{formatDate(topic.last_activity)}</span>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Show More/Less Button */}
            {hasMore && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center pt-4"
                >
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                        {showAll ? (
                            <>
                                <ChevronUp className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                                <span>הצג פחות</span>
                            </>
                        ) : (
                            <>
                                <ChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
                                <span>הצג עוד ({filteredTopics.length - 6} נוספים)</span>
                            </>
                        )}
                    </button>
                </motion.div>
            )}

            {/* Summary Stats */}
            {filteredTopics.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-2xl p-6 border-2 border-purple-200 dark:border-purple-800"
                >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <BarChart2 className="w-6 h-6 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                            <div className="text-2xl font-black text-gray-900 dark:text-white">
                                {filteredTopics.length}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">נושאים פעילים</div>
                        </div>
                        <div className="text-center">
                            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
                            <div className="text-2xl font-black text-gray-900 dark:text-white">
                                {filteredTopics.filter(t => t.status === 'completed').length}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">הושלמו</div>
                        </div>
                        <div className="text-center">
                            <Target className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                            <div className="text-2xl font-black text-gray-900 dark:text-white">
                                {filteredTopics.reduce((sum, t) => sum + t.exercises_completed, 0)}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">תרגילים סה״כ</div>
                        </div>
                        <div className="text-center">
                            <Award className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mx-auto mb-2" />
                            <div className="text-2xl font-black text-gray-900 dark:text-white">
                                {filteredTopics.length > 0
                                    ? Math.round(
                                        filteredTopics.reduce((sum, t) => sum + parseFloat(t.accuracy), 0) /
                                        filteredTopics.length
                                    )
                                    : 0}%
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">דיוק ממוצע</div>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default ProgressStats;