// src/pages/PersonalizedDashboard.jsx - FIXED VERSION WITH STATS REFRESH
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Brain, BookOpen, Play, ChevronDown, Book, Rocket,
    Sparkles, Star, Target, TrendingUp, Award, Activity, CheckCircle2, AlertCircle
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import { profileService } from '../services/profileService';
import { getUserGradeId, getGradeConfig, getSubtopics } from '../config/israeliCurriculum';
import MathTutor from '../components/ai/MathTutor';
import AILearningArea from '../components/learning/AILearningArea';
import toast from 'react-hot-toast';

// Fallback topics if curriculum doesn't load
const FALLBACK_TOPICS = [
    { id: 'algebra', name: 'אלגברה', nameEn: 'Algebra', icon: '📐' },
    { id: 'geometry', name: 'גיאומטריה', nameEn: 'Geometry', icon: '📏' },
    { id: 'calculus', name: 'חשבון דיפרנציאלי', nameEn: 'Calculus', icon: '∫' },
    { id: 'probability', name: 'הסתברות', nameEn: 'Probability', icon: '🎲' },
    { id: 'statistics', name: 'סטטיסטיקה', nameEn: 'Statistics', icon: '📊' }
];

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

    const [currentMode, setCurrentMode] = useState('dashboard');
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [selectedSubtopic, setSelectedSubtopic] = useState(null);

    const [loading, setLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [expandedTopic, setExpandedTopic] = useState(null);
    const [statsError, setStatsError] = useState(null);

    // Get grade and topics with fallback
    const currentGrade = profile?.grade || user?.grade || 'grade10';
    const currentTrack = profile?.track || user?.track || 'advanced';

    console.log('🎓 Dashboard Grade Info:', { currentGrade, currentTrack, user: user?.uid });

    const gradeId = getUserGradeId(currentGrade, currentTrack);
    console.log('🆔 Grade ID:', gradeId);

    const gradeConfig = getGradeConfig(gradeId);
    console.log('⚙️ Grade Config:', gradeConfig);

    const curriculumTopics = gradeConfig?.topics || [];
    console.log('📚 Curriculum Topics:', curriculumTopics);

    // Use curriculum topics or fallback
    const availableTopics = curriculumTopics.length > 0 ? curriculumTopics : FALLBACK_TOPICS;
    console.log('✅ Available Topics:', availableTopics);

    useEffect(() => {
        const hour = new Date().getHours();
        const name = user?.displayName || profile?.name || 'תלמיד';
        let greetingText = '';
        if (hour < 12) greetingText = `בוקר טוב, ${name}`;
        else if (hour < 18) greetingText = `שלום, ${name}`;
        else greetingText = `ערב טוב, ${name}`;
        setGreeting(greetingText);
    }, [user, profile]);

    // Load stats on mount and when refreshTrigger changes
    useEffect(() => {
        if (currentMode === 'dashboard') {
            loadAllStats();
        }
    }, [user?.uid, refreshTrigger, currentMode]);

    const loadAllStats = async () => {
        try {
            setLoading(true);
            setStatsError(null);

            console.log('📊 [Dashboard] Fetching stats for user:', user?.uid);

            if (!user?.uid) {
                console.warn('⚠️ [Dashboard] No user UID');
                setStats({ questionsAnswered: 0, correctAnswers: 0, streak: 0, practiceTime: 0 });
                return;
            }

            const userStats = await profileService.getUserStats(user.uid);
            console.log('✅ [Dashboard] Stats received:', userStats);

            if (userStats && typeof userStats === 'object') {
                setStats({
                    questionsAnswered: Number(userStats.questionsAnswered) || 0,
                    correctAnswers: Number(userStats.correctAnswers) || 0,
                    streak: Number(userStats.streak) || 0,
                    practiceTime: Number(userStats.practiceTime) || 0
                });
                console.log('✅ [Dashboard] Stats updated successfully');
            } else {
                console.error('❌ [Dashboard] Invalid stats format:', userStats);
                setStatsError('Invalid stats format');
            }
        } catch (error) {
            console.error('❌ [Dashboard] Error loading stats:', error);
            setStatsError(error.message);
            setStats({ questionsAnswered: 0, correctAnswers: 0, streak: 0, practiceTime: 0 });
        } finally {
            setLoading(false);
        }
    };

    const startLearning = (topic, subtopic = null) => {
        console.log('📚 Starting learning mode:', {
            topic: topic?.name || topic,
            subtopic: subtopic?.name || subtopic
        });

        setSelectedTopic(topic);
        setSelectedSubtopic(subtopic);
        setCurrentMode('learning');
        toast.success('מכין חומר לימודי מותאם אישית... 📚');
    };

    const startPractice = (topic, subtopic = null) => {
        console.log('🚀 Starting practice mode:', {
            topic: topic?.name || topic,
            subtopic: subtopic?.name || subtopic || 'ALL (random)'
        });

        // 🔥 NEW: Keep subtopic as null for "תרגול מיידי" - this triggers random subtopic selection
        // Only set a specific subtopic if explicitly provided (e.g., from subtopic selection screen)

        setSelectedTopic(topic);
        setSelectedSubtopic(subtopic); // Can be null - that's fine! Random mode!
        setCurrentMode('practice');

        if (!subtopic) {
            toast('תרגול מכל נושאי המשנה! 🎲', { icon: '📚' });
        }
    };

    const handleLearningComplete = () => {
        console.log('✅ Learning complete, transitioning to practice');
        setCurrentMode('practice');
        toast.success('נהדר! עכשיו בואו נתרגל את מה שלמדת! 🚀');
    };

    const handleBackToDashboard = () => {
        console.log('🏠 Returning to dashboard');
        setCurrentMode('dashboard');
        setSelectedTopic(null);
        setSelectedSubtopic(null);

        // 🔥 CRITICAL FIX: Refresh stats when returning to dashboard
        setRefreshTrigger(prev => prev + 1);
    };

    // 🔥 NEW: Handler for when answer is submitted in MathTutor
    const handleAnswerSubmitted = async (isCorrect) => {
        console.log('✅ [Dashboard] Answer submitted, refreshing stats...', { isCorrect });

        // Immediately refresh stats after answer submission
        try {
            const userStats = await profileService.getUserStats(user.uid);
            if (userStats && typeof userStats === 'object') {
                setStats({
                    questionsAnswered: Number(userStats.questionsAnswered) || 0,
                    correctAnswers: Number(userStats.correctAnswers) || 0,
                    streak: Number(userStats.streak) || 0,
                    practiceTime: Number(userStats.practiceTime) || 0
                });
                console.log('✅ [Dashboard] Stats refreshed after answer:', userStats);
            }
        } catch (error) {
            console.error('❌ [Dashboard] Error refreshing stats after answer:', error);
        }
    };

    const successRate = stats.questionsAnswered > 0
        ? Math.round((stats.correctAnswers / stats.questionsAnswered) * 100)
        : 0;

    // Learning Mode (AILearningArea)
    if (currentMode === 'learning') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <motion.button
                        onClick={handleBackToDashboard}
                        whileHover={{ scale: 1.05 }}
                        className="mb-6 px-6 py-3 bg-white text-gray-800 rounded-xl font-bold shadow-lg"
                    >
                        ← חזרה לדף הבית
                    </motion.button>

                    <AILearningArea
                        topic={selectedTopic}
                        subtopic={selectedSubtopic}
                        onComplete={handleLearningComplete}
                    />
                </div>
            </div>
        );
    }

    // Practice Mode (MathTutor)
    if (currentMode === 'practice') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <motion.button
                        onClick={handleBackToDashboard}
                        whileHover={{ scale: 1.05 }}
                        className="mb-6 px-6 py-3 bg-white text-gray-800 rounded-xl font-bold shadow-lg"
                    >
                        ← חזרה לדף הבית
                    </motion.button>

                    <MathTutor
                        selectedTopic={selectedTopic}
                        selectedSubtopic={selectedSubtopic}
                        userId={user?.uid}
                        onAnswerSubmitted={handleAnswerSubmitted}
                        onClose={handleBackToDashboard}
                        mode="practice"
                    />
                </div>
            </div>
        );
    }

    // Dashboard Mode
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600" dir="rtl">
            <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center text-white"
                >
                    <h1 className="text-7xl font-black mb-4">{greeting}</h1>
                    <p className="text-3xl font-bold">מוכן להמשיך ללמוד ולהתקדם? 🚀</p>
                </motion.div>

                {/* Stats Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-8 shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <Brain className="w-12 h-12 text-blue-600" />
                            <span className="text-5xl">📝</span>
                        </div>
                        <div className="text-6xl font-black text-gray-900 mb-2">{stats.questionsAnswered}</div>
                        <div className="text-xl font-bold text-gray-600">שאלות שנענו</div>
                    </div>

                    <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-8 shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <CheckCircle2 className="w-12 h-12 text-green-600" />
                            <span className="text-5xl">✅</span>
                        </div>
                        <div className="text-6xl font-black text-gray-900 mb-2">{stats.correctAnswers}</div>
                        <div className="text-xl font-bold text-gray-600">תשובות נכונות</div>
                    </div>

                    <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-8 shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <Target className="w-12 h-12 text-purple-600" />
                            <span className="text-5xl">🎯</span>
                        </div>
                        <div className="text-6xl font-black text-gray-900 mb-2">{successRate}%</div>
                        <div className="text-xl font-bold text-gray-600">אחוז הצלחה</div>
                    </div>

                    <div className="bg-white/95 backdrop-blur-lg rounded-3xl p-8 shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <Activity className="w-12 h-12 text-orange-600" />
                            <span className="text-5xl">🔥</span>
                        </div>
                        <div className="text-6xl font-black text-gray-900 mb-2">{stats.streak}</div>
                        <div className="text-xl font-bold text-gray-600">רצף ימים</div>
                    </div>
                </motion.div>

                {/* Debug/Refresh Button - Remove in production */}
                <motion.button
                    onClick={() => setRefreshTrigger(prev => prev + 1)}
                    className="mx-auto block px-6 py-3 bg-yellow-500 text-white rounded-xl font-bold shadow-lg"
                >
                    🔄 רענן סטטיסטיקות ידנית
                </motion.button>

                {/* Topics Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-8"
                >
                    <div className="text-center">
                        <div>
                            <h2 className="text-5xl font-black text-white">נושאי הלימוד שלך</h2>
                            <p className="text-2xl text-white/90 mt-2">
                                {availableTopics.length} נושאים זמינים
                            </p>
                        </div>
                    </div>

                    {availableTopics.length === 0 ? (
                        <div className="text-center text-white p-12">
                            <AlertCircle className="w-16 h-16 mx-auto mb-4" />
                            <p className="text-2xl font-bold">אין נושאים זמינים לשכבה שלך</p>
                            <p className="text-lg mt-2">אנא פנה למנהל המערכת</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {availableTopics.map((topic, index) => {
                                const subtopics = getSubtopics(gradeId, topic.id) || [];
                                const isExpanded = expandedTopic === topic.id;

                                return (
                                    <div key={topic.id || index}>
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.1 }}
                                            whileHover={{ y: -10 }}
                                            className="bg-white rounded-3xl p-8 shadow-2xl"
                                        >
                                            <div className="text-7xl mb-6 text-center">
                                                {topic.icon || '📚'}
                                            </div>

                                            <h3 className="font-black text-3xl text-gray-900 mb-3 text-center">
                                                {topic.name}
                                            </h3>
                                            <p className="text-lg text-gray-600 mb-8 text-center">
                                                {topic.nameEn}
                                            </p>

                                            <div className="space-y-3">
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    onClick={() => startLearning(topic)}
                                                    className="w-full flex items-center justify-center gap-3 px-6 py-5 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-2xl font-black text-lg"
                                                >
                                                    <Book className="w-6 h-6" />
                                                    <span>איזור למידה</span>
                                                </motion.button>

                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    onClick={() => startPractice(topic)}
                                                    className="w-full flex items-center justify-center gap-3 px-6 py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-black text-lg"
                                                >
                                                    <Rocket className="w-6 h-6" />
                                                    <span>תרגול מיידי</span>
                                                </motion.button>

                                                {subtopics.length > 0 && (
                                                    <button
                                                        onClick={() => setExpandedTopic(isExpanded ? null : topic.id)}
                                                        className="w-full flex items-center justify-center gap-2 px-5 py-4 bg-gray-100 text-gray-800 rounded-2xl font-bold"
                                                    >
                                                        <span>{subtopics.length} נושאי משנה</span>
                                                        <ChevronDown className={`w-6 h-6 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
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
                                                    className="mt-4 bg-white rounded-2xl p-6 shadow-xl"
                                                >
                                                    <div className="space-y-4">
                                                        {subtopics.map((sub) => (
                                                            <div key={sub.id} className="border-b border-gray-200 last:border-0 pb-4 last:pb-0">
                                                                <p className="text-base font-bold text-gray-800 mb-3">{sub.name}</p>
                                                                <div className="grid grid-cols-2 gap-3">
                                                                    <button
                                                                        onClick={() => {
                                                                            setExpandedTopic(null);
                                                                            startLearning(topic, sub);
                                                                        }}
                                                                        className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-100 text-blue-700 rounded-xl text-sm font-bold"
                                                                    >
                                                                        <Book className="w-4 h-4" />
                                                                        <span>למד</span>
                                                                    </button>

                                                                    <button
                                                                        onClick={() => {
                                                                            setExpandedTopic(null);
                                                                            startPractice(topic, sub);
                                                                        }}
                                                                        className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-100 text-purple-700 rounded-xl text-sm font-bold"
                                                                    >
                                                                        <Play className="w-4 h-4" />
                                                                        <span>תרגל</span>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </motion.div>

                {/* Motivational Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 rounded-3xl p-12 shadow-2xl"
                >
                    <div className="relative text-center">
                        <h3 className="text-5xl font-black text-white mb-6">💡 טיפ היום מנקסון</h3>
                        <p className="text-3xl text-white font-bold leading-relaxed">
                            {stats.questionsAnswered === 0
                                ? 'כל מסע מתחיל בצעד ראשון! בוא נתחיל ללמוד ולתרגל ביחד 🚀'
                                : successRate >= 80
                                    ? 'מדהים! אתה ממש שולט בזה! המשך ככה! 🌟'
                                    : successRate >= 60
                                        ? 'התקדמות מצוינת! כל תרגול עושה אותך יותר חזק! 💪'
                                        : 'זכור: טעויות הן חלק מהלמידה! 📚'}
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default PersonalizedDashboard;
