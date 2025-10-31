// src/pages/PersonalizedDashboard.jsx - ENHANCED VERSION WITH FLIP CARDS
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Brain, BookOpen, Play, ChevronDown, Book, Rocket,
    Sparkles, Star, Target, TrendingUp, Award, Activity,
    CheckCircle2, AlertCircle, Heart, ArrowLeft, Zap,
    Users, Trophy, Clock, ChevronRight
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import { profileService } from '../services/profileService';
import { getUserGradeId, getGradeConfig, getSubtopics } from '../config/israeliCurriculum';
import MathTutor from '../components/ai/MathTutor';
import AILearningArea from '../components/learning/AILearningArea';
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

    const [currentMode, setCurrentMode] = useState('dashboard');
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [selectedSubtopic, setSelectedSubtopic] = useState(null);
    const [flippedCard, setFlippedCard] = useState(null);

    const [loading, setLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [statsError, setStatsError] = useState(null);

    // Get grade and topics with fallback
    const currentGrade = profile?.grade || user?.grade || 'grade10';
    const currentTrack = profile?.track || user?.track || '3-units';

    // Get onboarding data
    const mathFeeling = profile?.mathFeeling || 'okay';
    const goalFocus = profile?.goalFocus || 'understanding';
    const weakTopics = profile?.weakTopics || [];

    console.log('🎓 Dashboard Info:', { currentGrade, currentTrack, mathFeeling, goalFocus, weakTopics });

    const gradeId = getUserGradeId(currentGrade, currentTrack);
    const gradeConfig = getGradeConfig(gradeId);
    const curriculumTopics = gradeConfig?.topics || [];

    // Use curriculum topics - no fallback for cleaner experience
    const availableTopics = curriculumTopics;

    useEffect(() => {
        const hour = new Date().getHours();
        const name = profile?.name || user?.displayName || user?.email?.split('@')[0] || 'תלמיד';
        let greetingText = '';
        if (hour < 12) greetingText = `בוקר טוב, ${name}! 🌅`;
        else if (hour < 18) greetingText = `שלום, ${name}! 👋`;
        else greetingText = `ערב טוב, ${name}! 🌙`;
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

            if (!user?.uid) {
                setStats({ questionsAnswered: 0, correctAnswers: 0, streak: 0, practiceTime: 0 });
                return;
            }

            const userStats = await profileService.getUserStats(user.uid);

            if (userStats && typeof userStats === 'object') {
                setStats({
                    questionsAnswered: Number(userStats.questionsAnswered) || 0,
                    correctAnswers: Number(userStats.correctAnswers) || 0,
                    streak: Number(userStats.streak) || 0,
                    practiceTime: Number(userStats.practiceTime) || 0
                });
            } else {
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
        setSelectedTopic(topic);
        setSelectedSubtopic(subtopic);
        setCurrentMode('learning');
        toast.success('מכין חומר לימודי מותאם אישית... 📚');
    };

    const startPractice = (topic, subtopic = null) => {
        setSelectedTopic(topic);
        setSelectedSubtopic(subtopic);
        setCurrentMode('practice');

        if (!subtopic) {
            toast('תרגול מכל נושאי המשנה! 🎲', { icon: '📚' });
        }
    };

    const handleLearningComplete = () => {
        setCurrentMode('practice');
        toast.success('נהדר! עכשיו בואו נתרגל את מה שלמדת! 🚀');
    };

    const handleBackToDashboard = () => {
        setCurrentMode('dashboard');
        setSelectedTopic(null);
        setSelectedSubtopic(null);
        setRefreshTrigger(prev => prev + 1);
    };

    const handleAnswerSubmitted = async (isCorrect) => {
        try {
            const userStats = await profileService.getUserStats(user.uid);
            if (userStats && typeof userStats === 'object') {
                setStats({
                    questionsAnswered: Number(userStats.questionsAnswered) || 0,
                    correctAnswers: Number(userStats.correctAnswers) || 0,
                    streak: Number(userStats.streak) || 0,
                    practiceTime: Number(userStats.practiceTime) || 0
                });
            }
        } catch (error) {
            console.error('❌ Error refreshing stats after answer:', error);
        }
    };

    const successRate = stats.questionsAnswered > 0
        ? Math.round((stats.correctAnswers / stats.questionsAnswered) * 100)
        : 0;

    // Get personalized motivation based on onboarding
    const getPersonalizedMotivation = () => {
        if (stats.questionsAnswered === 0) {
            if (mathFeeling === 'struggle') {
                return 'אל תדאג/י! אני כאן כדי לעזור לך להבין את החומר בצורה הכי טובה 💪';
            } else if (mathFeeling === 'love') {
                return 'אני רואה שאת/ה אוהב/ת מתמטיקה! בוא/י נתחיל להתקדם יחד 🚀';
            }
            return 'כל מסע מתחיל בצעד ראשון! בוא/י נתחיל ללמוד ולתרגל ביחד 🌟';
        }

        if (successRate >= 80) {
            if (goalFocus === 'understanding') {
                return 'מדהים! אתה ממש מבין/ה את החומר! המשך ככה! 🌟';
            } else if (goalFocus === 'grades') {
                return 'הציונים שלך בטח ישתפרו עם הביצועים האלה! 📈';
            }
            return 'יש לך ביטחון עצמי גבוה! המשך ככה! 💪';
        }

        if (successRate >= 60) {
            return 'התקדמות מצוינת! כל תרגול עושה אותך יותר חזק/ה! 💪';
        }

        if (mathFeeling === 'struggle') {
            return 'זכור/י: טעויות הן חלק מהלמידה! אני כאן כדי לעזור לך 🤗';
        }

        return 'זכור/י: תרגול עושה את ההבדל! המשך/י להתאמן 📚';
    };

    // Check if topic is in weak topics
    const isWeakTopic = (topicId) => {
        return weakTopics && weakTopics.includes(topicId);
    };

    // Handle card flip
    const handleCardFlip = (topicId) => {
        if (flippedCard === topicId) {
            setFlippedCard(null);
        } else {
            setFlippedCard(topicId);
        }
    };

    // Learning Mode
    if (currentMode === 'learning') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-6">
                <div className="max-w-7xl mx-auto">
                    <motion.button
                        onClick={handleBackToDashboard}
                        whileHover={{ scale: 1.05 }}
                        className="mb-4 md:mb-6 px-4 md:px-6 py-2 md:py-3 bg-white text-gray-800 rounded-xl font-bold shadow-lg text-sm md:text-base flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                        <span>חזרה לדף הבית</span>
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

    // Practice Mode
    if (currentMode === 'practice') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4 md:p-6">
                <div className="max-w-7xl mx-auto">
                    <motion.button
                        onClick={handleBackToDashboard}
                        whileHover={{ scale: 1.05 }}
                        className="mb-4 md:mb-6 px-4 md:px-6 py-2 md:py-3 bg-white text-gray-800 rounded-xl font-bold shadow-lg text-sm md:text-base flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                        <span>חזרה לדף הבית</span>
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
        <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500" dir="rtl">
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-12 space-y-6 md:space-y-12">
                {/* Header - Enhanced with animation */}
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center text-white"
                >
                    <motion.h1
                        className="text-4xl md:text-6xl lg:text-7xl font-black mb-2 md:mb-4"
                        animate={{ scale: [1, 1.02, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        {greeting}
                    </motion.h1>
                    <p className="text-xl md:text-2xl lg:text-3xl font-bold flex items-center justify-center gap-2">
                        מוכן/ה להמשיך ללמוד ולהתקדם?
                        <motion.span
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 1, repeat: Infinity }}
                        >
                            🚀
                        </motion.span>
                    </p>
                </motion.div>

                {/* Stats Cards - Enhanced with better animations */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6"
                >
                    {[
                        { icon: Brain, emoji: '📝', value: stats.questionsAnswered, label: 'שאלות שנענו', color: 'blue' },
                        { icon: CheckCircle2, emoji: '✅', value: stats.correctAnswers, label: 'תשובות נכונות', color: 'green' },
                        { icon: Target, emoji: '🎯', value: `${successRate}%`, label: 'אחוז הצלחה', color: 'purple' },
                        { icon: Activity, emoji: '🔥', value: stats.streak, label: 'רצף ימים', color: 'orange' }
                    ].map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -5, scale: 1.05 }}
                            className="bg-white/95 backdrop-blur-lg rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-2xl overflow-hidden relative"
                        >
                            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-${stat.color}-400/20 to-${stat.color}-600/20 rounded-full blur-2xl`} />
                            <div className="flex items-center justify-between mb-2 md:mb-4 relative">
                                <stat.icon className={`w-8 h-8 md:w-12 md:h-12 text-${stat.color}-600`} />
                                <motion.span
                                    className="text-3xl md:text-5xl"
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                >
                                    {stat.emoji}
                                </motion.span>
                            </div>
                            <motion.div
                                className="text-3xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-1 md:mb-2"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 + index * 0.1 }}
                            >
                                {stat.value}
                            </motion.div>
                            <div className="text-xs md:text-lg lg:text-xl font-bold text-gray-600">{stat.label}</div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Personalized Motivation Banner - Enhanced */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative overflow-hidden bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 rounded-2xl md:rounded-3xl p-6 md:p-10 shadow-2xl"
                >
                    <motion.div
                        className="absolute inset-0 opacity-30"
                        animate={{
                            backgroundPosition: ['0% 0%', '100% 100%'],
                        }}
                        transition={{ duration: 20, repeat: Infinity, repeatType: 'reverse' }}
                        style={{
                            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.3) 0%, transparent 50%)',
                            backgroundSize: '200% 200%',
                        }}
                    />
                    <div className="relative text-center">
                        <motion.h3
                            className="text-2xl md:text-4xl lg:text-5xl font-black text-white mb-3 md:mb-6"
                            animate={{ y: [0, -5, 0] }}
                            transition={{ duration: 3, repeat: Infinity }}
                        >
                            💡 ההודעה שלך מנקסון
                        </motion.h3>
                        <p className="text-lg md:text-2xl lg:text-3xl text-white font-bold leading-relaxed">
                            {getPersonalizedMotivation()}
                        </p>
                    </div>
                </motion.div>

                {/* Weak Topics Highlight - Enhanced */}
                {weakTopics && weakTopics.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/20 backdrop-blur-lg rounded-2xl md:rounded-3xl p-4 md:p-6 border-2 border-white/30"
                        whileHover={{ scale: 1.02 }}
                    >
                        <div className="flex items-center gap-3 mb-3 md:mb-4">
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <Heart className="w-6 h-6 md:w-8 md:h-8 text-white" />
                            </motion.div>
                            <h3 className="text-xl md:text-2xl lg:text-3xl font-black text-white">
                                נושאים שבחרת לחזק 💪
                            </h3>
                        </div>
                        <p className="text-sm md:text-lg text-white/90">
                            זיהינו {weakTopics.length} נושאים שתרצה/י לשפר - הם מסומנים בכוכב ⭐
                        </p>
                    </motion.div>
                )}

                {/* Topics Section - Enhanced with Flip Cards */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6 md:space-y-8"
                >
                    <div className="text-center">
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white">נושאי הלימוד שלך</h2>
                        <p className="text-lg md:text-xl lg:text-2xl text-white/90 mt-2 flex items-center justify-center gap-2">
                            <Zap className="w-5 h-5 md:w-6 md:h-6" />
                            {availableTopics.length} נושאים זמינים
                        </p>
                    </div>

                    {availableTopics.length === 0 ? (
                        <div className="text-center text-white p-8 md:p-12">
                            <AlertCircle className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4" />
                            <p className="text-xl md:text-2xl font-bold">אין נושאים זמינים לשכבה שלך</p>
                            <p className="text-base md:text-lg mt-2">אנא פנה למנהל המערכת</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                            {availableTopics.map((topic, index) => {
                                const subtopics = getSubtopics(gradeId, topic.id) || [];
                                const isFlipped = flippedCard === topic.id;
                                const isWeak = isWeakTopic(topic.id);

                                return (
                                    <motion.div
                                        key={topic.id || index}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="relative h-[400px] md:h-[500px]"
                                        style={{ perspective: '1000px' }}
                                    >
                                        {/* Weak Topic Badge */}
                                        {isWeak && !isFlipped && (
                                            <motion.div
                                                className="absolute -top-2 -right-2 z-10 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs md:text-sm font-black shadow-lg flex items-center gap-1"
                                                animate={{ scale: [1, 1.1, 1] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                            >
                                                <Star className="w-3 h-3 md:w-4 md:h-4 fill-current" />
                                                <span>לחיזוק</span>
                                            </motion.div>
                                        )}

                                        <motion.div
                                            className="w-full h-full relative"
                                            animate={{ rotateY: isFlipped ? 180 : 0 }}
                                            transition={{ duration: 0.6, type: "spring" }}
                                            style={{ transformStyle: 'preserve-3d' }}
                                        >
                                            {/* Front of card */}
                                            <div
                                                className={`absolute inset-0 bg-white rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-2xl ${
                                                    isWeak ? 'ring-4 ring-yellow-400 ring-opacity-50' : ''
                                                }`}
                                                style={{ backfaceVisibility: 'hidden' }}
                                            >
                                                <div className="h-full flex flex-col">
                                                    <div className="text-5xl md:text-6xl lg:text-7xl mb-3 md:mb-6 text-center">
                                                        {topic.icon || '📚'}
                                                    </div>

                                                    <h3 className="font-black text-xl md:text-2xl lg:text-3xl text-gray-900 mb-2 md:mb-3 text-center">
                                                        {topic.name}
                                                    </h3>
                                                    <p className="text-sm md:text-base lg:text-lg text-gray-600 mb-4 md:mb-8 text-center">
                                                        {topic.nameEn}
                                                    </p>

                                                    <div className="space-y-2 md:space-y-3 flex-grow">
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => startLearning(topic)}
                                                            className="w-full flex items-center justify-center gap-2 md:gap-3 px-4 md:px-6 py-3 md:py-5 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-xl md:rounded-2xl font-black text-sm md:text-base lg:text-lg shadow-lg"
                                                        >
                                                            <Book className="w-4 h-4 md:w-6 md:h-6" />
                                                            <span>איזור למידה</span>
                                                        </motion.button>

                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => startPractice(topic)}
                                                            className="w-full flex items-center justify-center gap-2 md:gap-3 px-4 md:px-6 py-3 md:py-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl md:rounded-2xl font-black text-sm md:text-base lg:text-lg shadow-lg"
                                                        >
                                                            <Rocket className="w-4 h-4 md:w-6 md:h-6" />
                                                            <span>תרגול מיידי</span>
                                                        </motion.button>

                                                        {subtopics.length > 0 && (
                                                            <motion.button
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                onClick={() => handleCardFlip(topic.id)}
                                                                className="w-full flex items-center justify-center gap-2 px-4 md:px-5 py-3 md:py-4 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 rounded-xl md:rounded-2xl font-bold text-sm md:text-base shadow-lg"
                                                            >
                                                                <span>{subtopics.length} נושאי משנה</span>
                                                                <ChevronRight className="w-4 h-4 md:w-6 md:h-6" />
                                                            </motion.button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Back of card */}
                                            <div
                                                className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-2xl"
                                                style={{
                                                    backfaceVisibility: 'hidden',
                                                    transform: 'rotateY(180deg)'
                                                }}
                                            >
                                                <div className="h-full flex flex-col">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h3 className="text-xl md:text-2xl font-black text-white">
                                                            נושאי משנה
                                                        </h3>
                                                        <motion.button
                                                            whileHover={{ scale: 1.1 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => handleCardFlip(topic.id)}
                                                            className="p-2 bg-white/20 backdrop-blur-sm rounded-lg text-white"
                                                        >
                                                            <ArrowLeft className="w-5 h-5" />
                                                        </motion.button>
                                                    </div>

                                                    <div className="flex-grow overflow-y-auto space-y-3 pr-2">
                                                        {subtopics.map((sub) => {
                                                            const isWeakSubtopic = isWeakTopic(sub.id);

                                                            return (
                                                                <motion.div
                                                                    key={sub.id}
                                                                    className="bg-white/20 backdrop-blur-sm rounded-xl p-3 md:p-4"
                                                                    whileHover={{ scale: 1.02 }}
                                                                >
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <p className="text-sm md:text-base font-bold text-white flex-grow">
                                                                            {sub.name}
                                                                        </p>
                                                                        {isWeakSubtopic && (
                                                                            <Star className="w-3 h-3 md:w-4 md:h-4 text-yellow-300 fill-current" />
                                                                        )}
                                                                    </div>
                                                                    <div className="grid grid-cols-2 gap-2">
                                                                        <motion.button
                                                                            whileHover={{ scale: 1.05 }}
                                                                            whileTap={{ scale: 0.95 }}
                                                                            onClick={() => {
                                                                                handleCardFlip(null);
                                                                                startLearning(topic, sub);
                                                                            }}
                                                                            className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-500 text-white rounded-lg text-xs md:text-sm font-bold"
                                                                        >
                                                                            <Book className="w-3 h-3" />
                                                                            <span>למד</span>
                                                                        </motion.button>

                                                                        <motion.button
                                                                            whileHover={{ scale: 1.05 }}
                                                                            whileTap={{ scale: 0.95 }}
                                                                            onClick={() => {
                                                                                handleCardFlip(null);
                                                                                startPractice(topic, sub);
                                                                            }}
                                                                            className="flex items-center justify-center gap-1 px-3 py-2 bg-green-500 text-white rounded-lg text-xs md:text-sm font-bold"
                                                                        >
                                                                            <Play className="w-3 h-3" />
                                                                            <span>תרגל</span>
                                                                        </motion.button>
                                                                    </div>
                                                                </motion.div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </motion.div>

                {/* Goal Focus Reminder - Enhanced */}
                {goalFocus && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/20 backdrop-blur-lg rounded-2xl md:rounded-3xl p-4 md:p-6 border-2 border-white/30 text-center"
                        whileHover={{ scale: 1.02 }}
                    >
                        <div className="flex items-center justify-center gap-2 md:gap-3 mb-2 md:mb-3">
                            <motion.div
                                animate={{ rotate: [0, 360] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            >
                                <Target className="w-5 h-5 md:w-6 md:h-6 text-white" />
                            </motion.div>
                            <h3 className="text-lg md:text-xl lg:text-2xl font-black text-white">
                                המטרה שלך השנה
                            </h3>
                        </div>
                        <p className="text-base md:text-lg lg:text-xl text-white font-bold">
                            {goalFocus === 'understanding' && '💡 להבין טוב יותר את החומר'}
                            {goalFocus === 'grades' && '⭐ לשפר את הציונים'}
                            {goalFocus === 'confidence' && '💪 להרגיש בטוח/ה יותר'}
                            {goalFocus === 'exams' && '🎯 להצליח במבחנים'}
                        </p>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default PersonalizedDashboard;