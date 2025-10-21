// src/pages/PersonalizedDashboard.jsx - PERFECT INTEGRATION WITH MATHTUTOR
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Brain, Target, TrendingUp, Calculator, Award, Zap, Sparkles, Clock, CheckCircle, ArrowRight, Play, Grid, Search, X, ArrowLeft, ChevronRight, Shuffle, List, BookOpen } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { profileService } from '../services/profileService';
import { getUserGradeId, getGradeConfig, getSubtopics } from '../config/israeliCurriculum';
import MathTutor from '../components/ai/MathTutor';
import toast from 'react-hot-toast';

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

    const [view, setView] = useState('dashboard'); // 'dashboard', 'all-topics', 'practice'
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [selectedSubtopic, setSelectedSubtopic] = useState(null);
    const [practiceMode, setPracticeMode] = useState('normal'); // 'normal', 'mixed', 'weakness-only'
    const [showPractice, setShowPractice] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showSubtopics, setShowSubtopics] = useState(null);

    // 🔥 GET CURRICULUM DATA
    const currentGrade = profile?.grade || user?.grade || '8';
    const currentTrack = profile?.track || user?.track;
    const gradeId = getUserGradeId(currentGrade, currentTrack);
    const gradeConfig = getGradeConfig(gradeId);
    const availableTopics = gradeConfig?.topics || [];

    console.log('🔍 DASHBOARD DEBUG:', {
        currentGrade,
        currentTrack,
        gradeId,
        gradeConfig: gradeConfig ? 'exists' : 'null',
        availableTopicsCount: availableTopics.length,
        gradeConfigKeys: gradeConfig ? Object.keys(gradeConfig) : []
    });

    // 🔥 GROUP TOPICS BY CATEGORY
    const groupedTopics = availableTopics.reduce((acc, topic) => {
        const category = topic.category || 'אחר';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(topic);
        return acc;
    }, {});

    const categories = Object.keys(groupedTopics);

    useEffect(() => {
        const hour = new Date().getHours();
        const name = user?.displayName || profile?.name || 'תלמיד';
        let greetingText = '';
        if (hour < 12) greetingText = `בוקר טוב ${name}! ☀️`;
        else if (hour < 18) greetingText = `שלום ${name}! 🌤️`;
        else greetingText = `ערב טוב ${name}! 🌆`;
        setGreeting(greetingText);
    }, [user, profile]);

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

    const handleStartPractice = (topic, subtopic = null, mode = 'normal') => {
        console.log('🎯 Starting practice:', { topic: topic?.name, subtopic: subtopic?.name, mode });
        setSelectedTopic(topic);
        setSelectedSubtopic(subtopic);
        setPracticeMode(mode);
        setShowPractice(true);
    };

    const handleClosePractice = () => {
        console.log('🔙 Closing practice, returning to dashboard');
        setShowPractice(false);
        setSelectedTopic(null);
        setSelectedSubtopic(null);
        setPracticeMode('normal');
        loadStats(); // Reload stats after practice
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

    // 🔥 GET WEAKNESS TOPICS WITH FULL DATA
    const getWeaknessTopicsWithData = () => {
        if (!profile?.weakTopics || profile.weakTopics.length === 0) return [];
        return profile.weakTopics
            .map(topicId => availableTopics.find(t => t.id === topicId))
            .filter(Boolean);
    };

    const weaknessTopics = getWeaknessTopicsWithData();

    // 🔥 FILTER TOPICS
    const filteredTopics = availableTopics.filter(topic => {
        const matchesSearch = topic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            topic.nameEn.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || topic.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

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

    // ==================== PRACTICE VIEW ====================
    if (showPractice) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
                {/* Pass correct props to MathTutor */}
                <MathTutor
                    topicId={selectedTopic?.id}
                    gradeId={currentGrade}
                    onClose={handleClosePractice}
                />
            </div>
        );
    }

    // ==================== ALL TOPICS VIEW WITH SUBTOPICS ====================
    if (view === 'all-topics') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setView('dashboard')}
                            className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-2xl shadow-lg hover:shadow-xl transition-all font-bold"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            חזרה
                        </motion.button>

                        <div className="flex-1 max-w-md mx-4">
                            <div className="relative">
                                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="חפש נושא..."
                                    className="w-full pr-12 pl-4 py-3 bg-white rounded-2xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none shadow-lg"
                                />
                                {searchQuery && (
                                    <button onClick={() => setSearchQuery('')} className="absolute left-4 top-1/2 -translate-y-1/2">
                                        <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="text-xl font-bold text-gray-800">
                            {filteredTopics.length} נושאים
                        </div>
                    </div>

                    {/* Category Filters */}
                    {categories.length > 0 && (
                        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
                            <button
                                onClick={() => setSelectedCategory('all')}
                                className={`px-6 py-2 rounded-full font-bold whitespace-nowrap transition-all ${
                                    selectedCategory === 'all'
                                        ? 'bg-purple-600 text-white shadow-lg'
                                        : 'bg-white text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                הכל ({availableTopics.length})
                            </button>
                            {categories.map(category => (
                                <button
                                    key={category}
                                    onClick={() => setSelectedCategory(category)}
                                    className={`px-6 py-2 rounded-full font-bold whitespace-nowrap transition-all ${
                                        selectedCategory === category
                                            ? 'bg-purple-600 text-white shadow-lg'
                                            : 'bg-white text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    {category} ({groupedTopics[category].length})
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Topics Grid WITH SUBTOPICS */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredTopics.map((topic, index) => {
                            const subtopics = getSubtopics(gradeId, topic.id);
                            const isWeakness = profile?.weakTopics?.includes(topic.id);
                            const isExpanded = showSubtopics === topic.id;

                            return (
                                <motion.div
                                    key={topic.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all p-6 border-4 ${
                                        isWeakness
                                            ? 'border-orange-300 bg-gradient-to-br from-orange-50 to-red-50'
                                            : 'border-transparent hover:border-purple-300'
                                    }`}
                                >
                                    {isWeakness && (
                                        <div className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                                            <Target className="w-3 h-3" />
                                            לחיזוק
                                        </div>
                                    )}

                                    <div className="text-6xl mb-4">{topic.icon}</div>
                                    <h3 className="text-xl font-black text-gray-800 mb-2">{topic.name}</h3>
                                    <p className="text-sm text-gray-500 mb-4 font-semibold">{topic.nameEn}</p>

                                    {/* Practice whole topic button */}
                                    <button
                                        onClick={() => handleStartPractice(topic, null, 'normal')}
                                        className="w-full mb-3 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 font-bold"
                                    >
                                        <Play className="w-4 h-4" />
                                        תרגל נושא שלם
                                    </button>

                                    {/* Subtopics section */}
                                    {subtopics.length > 0 && (
                                        <div>
                                            <button
                                                onClick={() => setShowSubtopics(isExpanded ? null : topic.id)}
                                                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all flex items-center justify-between font-semibold text-sm"
                                            >
                                                <span>{subtopics.length} תתי-נושאים</span>
                                                <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                            </button>

                                            <AnimatePresence>
                                                {isExpanded && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="mt-3 space-y-2 overflow-hidden"
                                                    >
                                                        {subtopics.map((subtopic) => (
                                                            <button
                                                                key={subtopic.id}
                                                                onClick={() => handleStartPractice(topic, subtopic, 'normal')}
                                                                className="w-full px-3 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-gray-800 rounded-lg transition-all text-right text-sm font-medium flex items-center justify-between group"
                                                            >
                                                                <span>{subtopic.name}</span>
                                                                <Play className="w-3 h-3 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                            </button>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    )}

                                    <div className="mt-4 flex items-center justify-between">
                                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                                            topic.difficulty === 'easy' || topic.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                                                topic.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                        }`}>
                                            {topic.difficulty === 'easy' || topic.difficulty === 'beginner' ? 'קל' :
                                                topic.difficulty === 'intermediate' ? 'בינוני' : 'מתקדם'}
                                        </span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    {filteredTopics.length === 0 && (
                        <div className="text-center py-20">
                            <div className="text-6xl mb-4">🔍</div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">לא נמצאו נושאים</h3>
                            <p className="text-gray-500">נסה לשנות את החיפוש או הסינון</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // ==================== DASHBOARD VIEW ====================
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-6">
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
                                <p className="text-purple-100 text-lg">
                                    {stats.questionsAnswered === 0 ? 'בואו נתחיל את המסע שלך במתמטיקה! 🚀' :
                                        successRate >= 80 ? 'היום נתמקד בהבנה עמוקה 🧠' :
                                            successRate >= 60 ? 'בואו נשפר את הדיוק שלך! 🎯' :
                                                'בואו נתרגל יחד ונשתפר! 💪'}
                                </p>
                                {profile && (
                                    <div className="flex items-center gap-3 mt-3 text-sm">
                                        <span className="px-3 py-1 bg-white/20 rounded-full">כיתה {getGradeDisplay()}</span>
                                        <span className="px-3 py-1 bg-white/20 rounded-full">{availableTopics.length} נושאים זמינים</span>
                                        {weaknessTopics.length > 0 && (
                                            <span className="px-3 py-1 bg-white/20 rounded-full">{weaknessTopics.length} נושאים לתרגול</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid grid-cols-4 gap-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <Target className="w-8 h-8 text-purple-500" />
                            <span className="text-3xl font-bold text-gray-800">{stats.questionsAnswered}</span>
                        </div>
                        <p className="text-gray-600 text-sm">שאלות נענו</p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <CheckCircle className="w-8 h-8 text-green-500" />
                            <span className="text-3xl font-bold text-gray-800">{successRate}%</span>
                        </div>
                        <p className="text-gray-600 text-sm">אחוז הצלחה</p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <Zap className="w-8 h-8 text-orange-500" />
                            <span className="text-3xl font-bold text-gray-800">{stats.streak}</span>
                        </div>
                        <p className="text-gray-600 text-sm">רצף ימים</p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-2">
                            <Clock className="w-8 h-8 text-blue-500" />
                            <span className="text-3xl font-bold text-gray-800">{Math.floor(stats.practiceTime / 60)}</span>
                        </div>
                        <p className="text-gray-600 text-sm">דקות תרגול</p>
                    </motion.div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* LEFT: Practice Options */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* PRACTICE MODE SELECTOR */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white rounded-2xl p-6 shadow-xl"
                        >
                            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Calculator className="w-6 h-6 text-purple-600" />
                                בחר סוג תרגול
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Mixed Practice */}
                                <button
                                    onClick={() => {
                                        // For mixed practice, we'll use the first topic as a proxy
                                        if (availableTopics.length > 0) {
                                            handleStartPractice(availableTopics[0], null, 'mixed');
                                        } else {
                                            toast.error('אין נושאים זמינים');
                                        }
                                    }}
                                    className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-2xl border-2 border-green-200 hover:border-green-400 transition-all shadow-md hover:shadow-xl group"
                                >
                                    <Shuffle className="w-12 h-12 text-green-600 mb-3 mx-auto group-hover:rotate-12 transition-transform" />
                                    <h3 className="font-bold text-gray-800 text-center mb-2">תרגול מעורב</h3>
                                    <p className="text-xs text-gray-600 text-center">שאלות מכל הנושאים</p>
                                </button>

                                {/* Weakness Only */}
                                {weaknessTopics.length > 0 && (
                                    <button
                                        onClick={() => {
                                            // Start with first weakness topic
                                            handleStartPractice(weaknessTopics[0], null, 'weakness-only');
                                        }}
                                        className="p-6 bg-gradient-to-br from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 rounded-2xl border-2 border-orange-200 hover:border-orange-400 transition-all shadow-md hover:shadow-xl group"
                                    >
                                        <Target className="w-12 h-12 text-orange-600 mb-3 mx-auto group-hover:scale-110 transition-transform" />
                                        <h3 className="font-bold text-gray-800 text-center mb-2">נושאים לחיזוק</h3>
                                        <p className="text-xs text-gray-600 text-center">{weaknessTopics.length} נושאים שבחרת</p>
                                    </button>
                                )}

                                {/* All Topics Browser */}
                                <button
                                    onClick={() => setView('all-topics')}
                                    className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-2xl border-2 border-purple-200 hover:border-purple-400 transition-all shadow-md hover:shadow-xl group"
                                >
                                    <Grid className="w-12 h-12 text-purple-600 mb-3 mx-auto group-hover:scale-110 transition-transform" />
                                    <h3 className="font-bold text-gray-800 text-center mb-2">בחר נושא ספציפי</h3>
                                    <p className="text-xs text-gray-600 text-center">{availableTopics.length} נושאים זמינים</p>
                                </button>
                            </div>
                        </motion.div>

                        {/* Weakness Topics Quick Access */}
                        {weaknessTopics.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="bg-white rounded-2xl p-6 shadow-xl"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <Target className="w-8 h-8 text-orange-500" />
                                        <h2 className="text-2xl font-bold text-gray-900">גישה מהירה - נושאים לחיזוק</h2>
                                    </div>
                                    <span className="text-sm text-gray-500">{weaknessTopics.length} נושאים</span>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {weaknessTopics.map((topic, index) => {
                                        const subtopics = getSubtopics(gradeId, topic.id);
                                        return (
                                            <motion.div
                                                key={topic.id}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: 0.6 + index * 0.1 }}
                                                className="group p-4 bg-gradient-to-br from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 rounded-2xl border-2 border-orange-200 hover:border-orange-400 transition-all shadow-md hover:shadow-xl"
                                            >
                                                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform text-center">
                                                    {topic.icon}
                                                </div>
                                                <h3 className="font-bold text-gray-800 mb-2 text-center">{topic.name}</h3>

                                                {/* Quick action buttons */}
                                                <div className="flex flex-col gap-2 mt-3">
                                                    <button
                                                        onClick={() => handleStartPractice(topic, null, 'normal')}
                                                        className="w-full px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <Play className="w-3 h-3" />
                                                        תרגל נושא
                                                    </button>

                                                    {subtopics.length > 0 && (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedTopic(topic);
                                                                setView('all-topics');
                                                                setShowSubtopics(topic.id);
                                                            }}
                                                            className="w-full px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1"
                                                        >
                                                            <List className="w-3 h-3" />
                                                            {subtopics.length} תתי-נושאים
                                                        </button>
                                                    )}
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* RIGHT: Profile & Stats */}
                    <div className="space-y-6">
                        {/* Profile Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-white rounded-2xl p-6 shadow-xl"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center">
                                    <span className="text-3xl">🎓</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">{user?.displayName || profile?.name || 'תלמיד'}</h3>
                                    <p className="text-gray-500 text-sm">כיתה {getGradeDisplay()}</p>
                                </div>
                            </div>

                            {profile && (
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                        <span className="text-gray-600">נושאים זמינים</span>
                                        <span className="font-bold text-purple-600">{availableTopics.length}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                        <span className="text-gray-600">נושאים לתרגול</span>
                                        <span className="font-bold text-orange-600">{weaknessTopics.length}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                        <span className="text-gray-600">שאלות נענו</span>
                                        <span className="font-bold text-gray-900">{stats.questionsAnswered}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                        <span className="text-gray-600">אחוז הצלחה</span>
                                        <span className="font-bold text-green-600">{successRate}%</span>
                                    </div>
                                </div>
                            )}
                        </motion.div>

                        {/* Progress */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                            className="bg-white rounded-2xl p-6 shadow-xl"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <TrendingUp className="w-6 h-6 text-green-500" />
                                <h3 className="text-xl font-bold text-gray-900">התקדמות</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="text-center p-4 bg-green-50 rounded-xl">
                                    <div className="text-4xl font-bold text-green-600">{stats.correctAnswers}</div>
                                    <div className="text-sm text-gray-600">תשובות נכונות</div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="text-center p-3 bg-blue-50 rounded-xl">
                                        <div className="text-2xl font-bold text-blue-600">{successRate}%</div>
                                        <div className="text-xs text-gray-600">דיוק</div>
                                    </div>
                                    <div className="text-center p-3 bg-purple-50 rounded-xl">
                                        <div className="text-2xl font-bold text-purple-600">{Math.floor(stats.practiceTime / 60)}m</div>
                                        <div className="text-xs text-gray-600">זמן</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Tip */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            className="bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-300 rounded-2xl p-6"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <Sparkles className="w-6 h-6 text-purple-600" />
                                <h4 className="font-bold text-purple-900">טיפ מנקסון</h4>
                            </div>
                            <p className="text-sm text-purple-800">
                                {stats.questionsAnswered === 0
                                    ? 'בוא נתחיל! בחר סוג תרגול למעלה והתחל לתרגל 🚀'
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