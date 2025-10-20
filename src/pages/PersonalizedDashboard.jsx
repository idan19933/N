// src/pages/PersonalizedDashboard.jsx - COMPLETE WITH TOPIC/SUBTOPIC SELECTION
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Brain, Target, TrendingUp, Calculator, Award, Zap, AlertCircle,
    Sparkles, Clock, CheckCircle, ArrowRight, Play, BookOpen,
    Trophy, Flame, Star, ChevronRight, X, Info, Search, Grid3x3,
    Send, Lightbulb, Loader2, RefreshCw, ChevronDown, List
} from 'lucide-react';
import toast from 'react-hot-toast';

// Mock Auth Store (replace with your actual implementation)
const useAuthStore = () => ({
    user: { uid: 'demo-user', email: 'student@example.com', displayName: 'תלמיד לדוגמה' },
    studentProfile: {
        grade: 'grade7',
        weakTopics: ['variables-expressions', 'combine-like-terms', 'distributive-law', 'sequences', 'powers']
    },
    nexonProfile: { name: 'תלמיד לדוגמה', grade: 'grade7' }
});

// Mock Profile Service
const profileService = {
    getUserStats: async (uid) => ({
        questionsAnswered: 23,
        correctAnswers: 18,
        streak: 5,
        practiceTime: 120
    })
};

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

// ==================== TOPIC CONFIGURATION ====================
const TOPIC_NAMES = {
    'variables-expressions': {
        name: 'משתנים וביטויים אלגבריים',
        nameEn: 'Variables & Expressions',
        icon: '🔤',
        gradient: 'from-purple-500 to-purple-600',
        description: 'ייצוג מצבים במשתנים וחישוב ביטויים',
        subtopics: [
            { id: 'basic-variables', name: 'משתנים בסיסיים', description: 'הכרת משתנים ושימוש בהם' },
            { id: 'algebraic-expressions', name: 'ביטויים אלגבריים', description: 'כתיבה וחישוב ביטויים' },
            { id: 'evaluating-expressions', name: 'הצבה בביטויים', description: 'הצבת ערכים בביטויים' }
        ]
    },
    'combine-like-terms': {
        name: 'כינוס איברים דומים',
        nameEn: 'Combining Like Terms',
        icon: '➕',
        gradient: 'from-blue-500 to-blue-600',
        description: 'פישוט ביטויים אלגבריים',
        subtopics: [
            { id: 'identifying-like-terms', name: 'זיהוי איברים דומים', description: 'מציאת איברים שניתן לצרף' },
            { id: 'combining-basic', name: 'כינוס בסיסי', description: 'צירוף איברים דומים פשוטים' },
            { id: 'combining-advanced', name: 'כינוס מתקדם', description: 'צירוף איברים מורכבים' }
        ]
    },
    'distributive-law': {
        name: 'חוק הפילוג',
        nameEn: 'Distributive Law',
        icon: '✖️',
        gradient: 'from-green-500 to-green-600',
        description: 'פתיחת סוגריים וחוק הפילוג',
        subtopics: [
            { id: 'opening-parentheses', name: 'פתיחת סוגריים', description: 'פתיחת סוגריים בסיסית' },
            { id: 'distributive-with-negatives', name: 'פילוג עם מינוס', description: 'פילוג כשיש מינוס' },
            { id: 'double-distributive', name: 'פילוג כפול', description: '(a+b)(c+d)' }
        ]
    },
    'sequences': {
        name: 'סדרות',
        nameEn: 'Sequences',
        icon: '🔢',
        gradient: 'from-indigo-500 to-indigo-600',
        description: 'דפוסים וחוקיות במספרים',
        subtopics: [
            { id: 'arithmetic-sequences', name: 'סדרות חשבוניות', description: 'סדרות עם הפרש קבוע' },
            { id: 'geometric-sequences', name: 'סדרות הנדסיות', description: 'סדרות עם מנה קבועה' },
            { id: 'sequence-patterns', name: 'דפוסים בסדרות', description: 'מציאת הכלל' }
        ]
    },
    'powers': {
        name: 'חזקות',
        nameEn: 'Powers',
        icon: '²',
        gradient: 'from-violet-500 to-violet-600',
        description: 'חזקות ושורשים ריבועיים',
        subtopics: [
            { id: 'basic-powers', name: 'חזקות בסיסיות', description: 'הבנת מושג החזקה' },
            { id: 'power-rules', name: 'חוקי חזקות', description: 'כפל וחילוק חזקות' },
            { id: 'negative-powers', name: 'חזקות שליליות', description: 'חזקות עם מעריך שלילי' }
        ]
    },
    'triangle-angles': {
        name: 'זוויות במשולש',
        nameEn: 'Triangle Angles',
        icon: '△',
        gradient: 'from-yellow-500 to-yellow-600',
        description: 'סכום זוויות במשולש',
        subtopics: [
            { id: 'angle-sum', name: 'סכום זוויות', description: 'סכום זוויות במשולש = 180°' },
            { id: 'finding-angles', name: 'מציאת זוויות', description: 'חישוב זווית חסרה' },
            { id: 'special-triangles', name: 'משולשים מיוחדים', description: 'משולשים שווי צלעות וישרי זווית' }
        ]
    }
};

const TOPIC_CATEGORIES = {
    'אלגברה': ['variables-expressions', 'combine-like-terms', 'distributive-law', 'sequences'],
    'חשבון': ['powers'],
    'זוויות': ['triangle-angles']
};

// ==================== MATH DISPLAY ====================
const MathDisplay = ({ children, className = '' }) => {
    return <span className={`font-serif ${className}`}>{children}</span>;
};

// ==================== SIMPLE MATH PRACTICE ====================
const SimpleMathPractice = ({ topic, subtopic, onClose }) => {
    const { user, studentProfile, nexonProfile } = useAuthStore();
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [feedback, setFeedback] = useState(null);
    const [showAnswer, setShowAnswer] = useState(false);
    const [timer, setTimer] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [stats, setStats] = useState({ correct: 0, total: 0, streak: 0, points: 0 });

    useEffect(() => {
        generateQuestion();
    }, []);

    useEffect(() => {
        let interval;
        if (isTimerRunning) {
            interval = setInterval(() => setTimer(t => t + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const generateQuestion = async () => {
        setIsGenerating(true);
        setFeedback(null);
        setUserAnswer('');
        setShowAnswer(false);
        setTimer(0);
        setIsTimerRunning(false);

        try {
            const requestBody = {
                topic: {
                    id: topic.id,
                    name: topic.name,
                    nameEn: topic.nameEn || ''
                },
                difficulty: 'intermediate',
                studentProfile: {
                    name: nexonProfile?.name || user?.displayName || 'תלמיד',
                    grade: studentProfile?.grade || 'grade7',
                    mathFeeling: 'okay',
                    learningStyle: 'ask',
                    studentId: user?.uid || 'demo'
                }
            };

            // Add subtopic if provided
            if (subtopic) {
                requestBody.subtopic = {
                    id: subtopic.id,
                    name: subtopic.name,
                    description: subtopic.description
                };
            }

            const response = await fetch(`${API_URL}/api/ai/generate-question`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();

            if (data.success && data.question) {
                setCurrentQuestion(data.question);
                setIsTimerRunning(true);
            } else {
                throw new Error(data.error || 'Failed to generate question');
            }
        } catch (error) {
            console.error('Error generating question:', error);
            toast.error('שגיאה ביצירת שאלה. בדוק שהשרת רץ.');
        } finally {
            setIsGenerating(false);
        }
    };

    const checkAnswer = () => {
        if (!userAnswer.trim() || !currentQuestion) return;
        setIsTimerRunning(false);

        const userAnswerNormalized = userAnswer.trim().toLowerCase().replace(/\s+/g, '');
        const correctAnswerNormalized = String(currentQuestion.correctAnswer).trim().toLowerCase().replace(/\s+/g, '');
        const isCorrect = userAnswerNormalized === correctAnswerNormalized;

        let points = 0;
        if (isCorrect) {
            points = Math.max(100 - (timer * 2), 10);
            setStats(prev => ({
                correct: prev.correct + 1,
                total: prev.total + 1,
                streak: prev.streak + 1,
                points: prev.points + points
            }));
        } else {
            setStats(prev => ({
                ...prev,
                total: prev.total + 1,
                streak: 0
            }));
        }

        setFeedback({
            isCorrect,
            points,
            message: isCorrect ? '🎉 מעולה! תשובה נכונה!' : '❌ לא נכון, נסה שוב!'
        });

        if (!isCorrect) {
            setShowAnswer(true);
        }
    };

    const nextQuestion = () => {
        generateQuestion();
    };

    if (isGenerating) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-3xl p-12 shadow-2xl text-center"
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-20 h-20 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-6"
                    />
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">נקסון מכין שאלה...</h3>
                    <p className="text-gray-600">רגע אחד ✨</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 rounded-3xl shadow-2xl p-5 mb-6"
                >
                    <div className="flex items-center justify-between mb-4">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onClose}
                            className="bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-2xl font-bold hover:bg-white/30 transition-all flex items-center gap-2 shadow-lg"
                        >
                            <ArrowRight className="w-5 h-5" />
                            סיים
                        </motion.button>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-5 py-3 rounded-2xl shadow-lg">
                                <Clock className="w-6 h-6 text-white" />
                                <span className="font-mono text-2xl font-black text-white">{formatTime(timer)}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-gradient-to-r from-orange-400 to-red-500 px-5 py-3 rounded-2xl shadow-lg">
                                <Flame className="w-6 h-6 text-white" />
                                <span className="text-2xl font-black text-white">{stats.streak}</span>
                            </div>
                            <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 px-5 py-3 rounded-2xl shadow-lg">
                                <Star className="w-6 h-6 text-white" />
                                <span className="text-2xl font-black text-white">{stats.points}</span>
                            </div>
                            <div className="bg-white/20 backdrop-blur-md px-5 py-3 rounded-2xl shadow-lg">
                                <div className="text-xl font-black text-white">{stats.correct}/{stats.total}</div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Question Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-3xl shadow-2xl p-10 border-4 border-purple-200"
                >
                    <div className="flex items-center gap-3 bg-purple-100 px-5 py-3 rounded-2xl shadow-md mb-6">
                        <span className="text-4xl">{topic.icon}</span>
                        <div>
                            <div className="font-black text-gray-800 text-lg">{topic.name}</div>
                            {subtopic && (
                                <div className="text-sm text-purple-600 font-bold">
                                    ⭐ {subtopic.name}
                                </div>
                            )}
                        </div>
                    </div>

                    {currentQuestion ? (
                        <div>
                            <div className="mb-8">
                                <h3 className="text-3xl font-black text-gray-800 mb-4 leading-relaxed">
                                    <MathDisplay>{currentQuestion.question}</MathDisplay>
                                </h3>
                            </div>

                            {feedback && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`mb-6 p-6 rounded-2xl ${
                                        feedback.isCorrect
                                            ? 'bg-green-50 border-4 border-green-300'
                                            : 'bg-red-50 border-4 border-red-300'
                                    }`}
                                >
                                    <div className="text-2xl font-black mb-2">{feedback.message}</div>
                                    {feedback.isCorrect && (
                                        <div className="text-lg text-gray-700">
                                            +{feedback.points} נקודות • {formatTime(timer)}
                                        </div>
                                    )}
                                    {showAnswer && (
                                        <div className="mt-4 p-4 bg-white rounded-xl">
                                            <div className="font-bold text-gray-700 mb-2">התשובה הנכונה:</div>
                                            <div className="text-3xl font-black text-gray-900">
                                                <MathDisplay>{currentQuestion.correctAnswer}</MathDisplay>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {!feedback && (
                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        value={userAnswer}
                                        onChange={(e) => setUserAnswer(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
                                        placeholder="כתוב/י את התשובה... ✍️"
                                        className="w-full px-8 py-5 text-2xl border-4 border-purple-300 rounded-3xl focus:ring-4 focus:ring-purple-200 focus:border-purple-400 transition-all font-bold"
                                        autoFocus
                                    />
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={checkAnswer}
                                        disabled={!userAnswer.trim()}
                                        className="w-full flex items-center justify-center gap-2 px-6 py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-3xl font-black hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all text-xl shadow-xl"
                                    >
                                        <CheckCircle className="w-6 h-6" />
                                        בדוק תשובה
                                    </motion.button>
                                </div>
                            )}

                            {feedback && (
                                <motion.button
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={nextQuestion}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-3xl font-black hover:shadow-2xl transition-all text-xl shadow-xl"
                                >
                                    <Sparkles className="w-6 h-6" />
                                    שאלה הבאה
                                    <ChevronRight className="w-6 h-6" />
                                </motion.button>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">טוען שאלה...</p>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

// ==================== TOPIC SELECTION MODAL ====================
const TopicSelectionModal = ({ topic, onSelectSubtopic, onSelectAll, onClose }) => {
    const topicInfo = TOPIC_NAMES[topic];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
            >
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className={`w-16 h-16 bg-gradient-to-br ${topicInfo.gradient} rounded-2xl flex items-center justify-center text-3xl shadow-lg`}>
                            {topicInfo.icon}
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">{topicInfo.name}</h2>
                            <p className="text-gray-600">{topicInfo.description}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                    >
                        <X className="w-6 h-6 text-gray-600" />
                    </button>
                </div>

                <p className="text-gray-700 mb-6 text-lg font-semibold">
                    בחר תת-נושא ספציפי או תרגל את כל הנושא:
                </p>

                <div className="space-y-3 mb-6">
                    {/* Practice All Button */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onSelectAll}
                        className="w-full p-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl hover:shadow-xl transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-xl flex items-center justify-center">
                                <Target className="w-7 h-7 text-white" />
                            </div>
                            <div className="flex-1 text-right">
                                <h3 className="font-black text-xl mb-1">תרגל את כל הנושא 🎯</h3>
                                <p className="text-sm text-white/80">שאלות מכל תתי הנושאים</p>
                            </div>
                        </div>
                    </motion.button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t-2 border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-gray-500 font-bold">או בחר תת-נושא</span>
                        </div>
                    </div>

                    {/* Subtopics */}
                    {topicInfo.subtopics?.map((subtopic, index) => (
                        <motion.button
                            key={subtopic.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onSelectSubtopic(subtopic)}
                            className="w-full p-6 bg-gradient-to-br from-gray-50 to-white hover:from-purple-50 hover:to-pink-50 rounded-2xl border-2 border-gray-200 hover:border-purple-300 transition-all shadow-md hover:shadow-xl text-right"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center flex-shrink-0 text-xl">
                                    {index + 1}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-900 text-lg mb-1">
                                        {subtopic.name}
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                        {subtopic.description}
                                    </p>
                                </div>
                                <ChevronRight className="w-6 h-6 text-purple-400 flex-shrink-0" />
                            </div>
                        </motion.button>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
};

// ==================== MAIN DASHBOARD ====================
const PersonalizedDashboard = () => {
    const navigate = useNavigate();
    const { user, studentProfile, nexonProfile } = useAuthStore();
    const profile = studentProfile;

    const [greeting, setGreeting] = useState('');
    const [stats, setStats] = useState({
        questionsAnswered: 0,
        correctAnswers: 0,
        streak: 0,
        practiceTime: 0
    });
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [selectedSubtopic, setSelectedSubtopic] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showPractice, setShowPractice] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showTopicBrowser, setShowTopicBrowser] = useState(false);
    const [showTopicSelection, setShowTopicSelection] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const hour = new Date().getHours();
        const name = user?.displayName || nexonProfile?.name || 'תלמיד';
        let greetingText = '';
        if (hour < 12) greetingText = `בוקר טוב, ${name}`;
        else if (hour < 18) greetingText = `שלום, ${name}`;
        else greetingText = `ערב טוב, ${name}`;
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

    const handleStartPractice = (topicId, subtopic = null) => {
        console.log('🎯 Starting practice:', { topicId, subtopic });

        const topicInfo = TOPIC_NAMES[topicId];

        // Check if topic has subtopics and no specific subtopic selected
        if (!subtopic && topicInfo.subtopics && topicInfo.subtopics.length > 0) {
            // Show selection modal
            setSelectedTopic(topicId);
            setShowTopicSelection(true);
        } else {
            // Start practice directly
            setSelectedTopic(topicId);
            setSelectedSubtopic(subtopic);
            setShowPractice(true);
            setShowTopicSelection(false);
            setShowCategoryModal(false);
            setShowTopicBrowser(false);
        }
    };

    const handleClosePractice = () => {
        setShowPractice(false);
        setSelectedTopic(null);
        setSelectedSubtopic(null);
        loadStats();
    };

    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
        setShowCategoryModal(true);
    };

    const successRate = stats.questionsAnswered > 0
        ? Math.round((stats.correctAnswers / stats.questionsAnswered) * 100)
        : 0;

    const getCategoriesWithWeakTopics = () => {
        const weakTopics = profile?.weakTopics || [];
        if (!Array.isArray(weakTopics) || weakTopics.length === 0) {
            return {};
        }
        const categories = {};
        Object.entries(TOPIC_CATEGORIES).forEach(([category, topics]) => {
            const weakInCategory = topics.filter(t => weakTopics.includes(t));
            if (weakInCategory.length > 0) {
                categories[category] = weakInCategory;
            }
        });
        return categories;
    };

    const getAllTopicsForGrade = () => {
        return Object.keys(TOPIC_NAMES);
    };

    const getFilteredTopics = () => {
        const allTopics = getAllTopicsForGrade();
        if (!searchQuery.trim()) return allTopics;
        const query = searchQuery.toLowerCase();
        return allTopics.filter(topicId => {
            const topic = TOPIC_NAMES[topicId];
            return (
                topic.name.includes(searchQuery) ||
                topic.nameEn.toLowerCase().includes(query) ||
                topic.description.includes(searchQuery)
            );
        });
    };

    const getMotivationalQuote = () => {
        const quotes = [
            { text: 'כל משוואה שפתרת מקרבת אותך למומחיות', emoji: '🎯' },
            { text: 'התרגול הוא המפתח להצלחה במתמטיקה', emoji: '🔑' },
            { text: 'כל טעות היא הזדמנות ללמידה', emoji: '💡' }
        ];
        return quotes[Math.floor(Math.random() * quotes.length)];
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
                <div className="text-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
                    />
                    <p className="text-gray-600 font-medium">טוען את לוח הבקרה שלך...</p>
                </div>
            </div>
        );
    }

    // Show Practice View
    if (showPractice && selectedTopic) {
        const topicInfo = TOPIC_NAMES[selectedTopic];
        return (
            <SimpleMathPractice
                topic={{
                    id: selectedTopic,
                    name: topicInfo.name,
                    nameEn: topicInfo.nameEn,
                    icon: topicInfo.icon,
                    description: topicInfo.description
                }}
                subtopic={selectedSubtopic}
                onClose={handleClosePractice}
            />
        );
    }

    const categoriesWithWeakTopics = getCategoriesWithWeakTopics();
    const motivationalQuote = getMotivationalQuote();
    const totalWeakTopics = profile?.weakTopics?.length || 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 md:p-12 shadow-2xl"
                >
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse" />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <motion.div
                                    animate={{ rotate: [0, 10, -10, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-xl"
                                >
                                    <Brain className="w-12 h-12 text-white" />
                                </motion.div>
                                <div>
                                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                                        {greeting} 👋
                                    </h1>
                                    <p className="text-white/90 text-lg md:text-xl">
                                        מוכן להמשיך לשפר את הכישורים שלך במתמטיקה?
                                    </p>
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowTopicBrowser(true)}
                                className="hidden md:flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-xl text-white rounded-2xl border-2 border-white/30 transition-all shadow-lg"
                            >
                                <Grid3x3 className="w-5 h-5" />
                                <span className="font-bold">כל הנושאים</span>
                            </motion.button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
                                <div className="flex items-center gap-3 mb-2">
                                    <Target className="w-6 h-6 text-white" />
                                    <span className="text-3xl font-bold text-white">{totalWeakTopics}</span>
                                </div>
                                <p className="text-white/80 text-sm">נושאים לתרגול</p>
                            </div>

                            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
                                <div className="flex items-center gap-3 mb-2">
                                    <CheckCircle className="w-6 h-6 text-white" />
                                    <span className="text-3xl font-bold text-white">{stats.questionsAnswered}</span>
                                </div>
                                <p className="text-white/80 text-sm">שאלות נענו</p>
                            </div>

                            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
                                <div className="flex items-center gap-3 mb-2">
                                    <Award className="w-6 h-6 text-white" />
                                    <span className="text-3xl font-bold text-white">{successRate}%</span>
                                </div>
                                <p className="text-white/80 text-sm">אחוז הצלחה</p>
                            </div>

                            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20">
                                <div className="flex items-center gap-3 mb-2">
                                    <Flame className="w-6 h-6 text-white" />
                                    <span className="text-3xl font-bold text-white">{stats.streak}</span>
                                </div>
                                <p className="text-white/80 text-sm">רצף ימים</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Motivational Quote */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 rounded-2xl p-6 shadow-lg"
                >
                    <div className="flex items-center gap-4">
                        <div className="text-4xl">{motivationalQuote.emoji}</div>
                        <div>
                            <h3 className="font-bold text-purple-900 text-lg mb-1">ציטוט היום</h3>
                            <p className="text-purple-800">{motivationalQuote.text}</p>
                        </div>
                    </div>
                </motion.div>

                {/* Quick Practice Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(profile?.weakTopics || []).map((topicId, index) => {
                        const topicInfo = TOPIC_NAMES[topicId];
                        if (!topicInfo) return null;

                        const hasSubtopics = topicInfo.subtopics && topicInfo.subtopics.length > 0;

                        return (
                            <motion.button
                                key={topicId}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ scale: 1.03, y: -5 }}
                                onClick={() => handleStartPractice(topicId)}
                                className="group bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all p-8 border-4 border-transparent hover:border-purple-300 text-right"
                            >
                                <div className={`w-16 h-16 bg-gradient-to-br ${topicInfo.gradient} rounded-2xl flex items-center justify-center text-4xl shadow-lg mb-4 group-hover:scale-110 transition-transform`}>
                                    {topicInfo.icon}
                                </div>
                                <h3 className="text-xl font-black text-gray-900 mb-2">{topicInfo.name}</h3>
                                <p className="text-sm text-gray-600 mb-4">{topicInfo.description}</p>

                                {hasSubtopics && (
                                    <div className="flex items-center gap-2 text-purple-500 text-xs font-bold mb-3">
                                        <List className="w-4 h-4" />
                                        <span>{topicInfo.subtopics.length} תתי-נושאים</span>
                                    </div>
                                )}

                                <div className="flex items-center gap-2 text-purple-600 font-bold">
                                    <Play className="w-5 h-5" />
                                    <span>{hasSubtopics ? 'בחר נושא' : 'התחל תרגול'}</span>
                                </div>
                            </motion.button>
                        );
                    })}
                </div>

                {/* Browse All Topics Button */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowTopicBrowser(true)}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-3xl py-6 font-black text-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3"
                >
                    <Grid3x3 className="w-6 h-6" />
                    עיין בכל הנושאים
                    <Sparkles className="w-6 h-6" />
                </motion.button>
            </div>

            {/* Topic Selection Modal */}
            <AnimatePresence>
                {showTopicSelection && selectedTopic && (
                    <TopicSelectionModal
                        topic={selectedTopic}
                        onSelectSubtopic={(subtopic) => handleStartPractice(selectedTopic, subtopic)}
                        onSelectAll={() => handleStartPractice(selectedTopic, null)}
                        onClose={() => setShowTopicSelection(false)}
                    />
                )}
            </AnimatePresence>

            {/* Topic Browser Modal */}
            <AnimatePresence>
                {showTopicBrowser && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowTopicBrowser(false)}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl p-8 max-w-4xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <Grid3x3 className="w-8 h-8 text-purple-600" />
                                    <h2 className="text-3xl font-bold text-gray-900">כל הנושאים</h2>
                                </div>
                                <button
                                    onClick={() => setShowTopicBrowser(false)}
                                    className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
                                >
                                    <X className="w-6 h-6 text-gray-600" />
                                </button>
                            </div>

                            <div className="relative mb-6">
                                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="חפש נושא..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pr-12 pl-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-purple-400 transition-colors text-right"
                                />
                            </div>

                            <div className="flex-1 overflow-y-auto">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                                    {getFilteredTopics().map((topicId, index) => {
                                        const topicInfo = TOPIC_NAMES[topicId];
                                        if (!topicInfo) return null;
                                        const isWeak = profile?.weakTopics?.includes(topicId);
                                        const hasSubtopics = topicInfo.subtopics && topicInfo.subtopics.length > 0;

                                        return (
                                            <motion.button
                                                key={topicId}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                onClick={() => {
                                                    setShowTopicBrowser(false);
                                                    handleStartPractice(topicId);
                                                }}
                                                className={`group relative overflow-hidden rounded-2xl p-5 border-2 transition-all shadow-md hover:shadow-xl text-right ${
                                                    isWeak
                                                        ? 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-300 hover:border-orange-400'
                                                        : 'bg-gradient-to-br from-gray-50 to-white border-gray-200 hover:border-purple-400'
                                                }`}
                                            >
                                                {isWeak && (
                                                    <div className="absolute top-3 left-3 px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded-lg">
                                                        לתרגול
                                                    </div>
                                                )}
                                                <div className="flex items-start gap-4">
                                                    <div className={`w-12 h-12 bg-gradient-to-br ${topicInfo.gradient} rounded-xl flex items-center justify-center text-xl shadow-lg group-hover:scale-110 transition-transform flex-shrink-0`}>
                                                        {topicInfo.icon}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-gray-900 mb-1">
                                                            {topicInfo.name}
                                                        </h4>
                                                        <p className="text-xs text-gray-600 mb-2">
                                                            {topicInfo.description}
                                                        </p>
                                                        {hasSubtopics && (
                                                            <div className="flex items-center gap-1 text-xs text-purple-600 font-bold mb-2">
                                                                <List className="w-3 h-3" />
                                                                <span>{topicInfo.subtopics.length} תתי-נושאים</span>
                                                            </div>
                                                        )}
                                                        <div className={`flex items-center gap-2 text-xs font-medium ${
                                                            isWeak ? 'text-orange-600' : 'text-purple-600'
                                                        }`}>
                                                            <Play className="w-3 h-3" />
                                                            <span>{hasSubtopics ? 'בחר נושא' : 'התחל תרגול'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PersonalizedDashboard;