// src/pages/PersonalizedDashboard.jsx - FIXED WITH PROPER CALLBACK
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Brain, Shuffle, BookOpen, BarChart3, Play, ChevronDown, Book, Rocket,
    Sparkles, Star, Zap, Target, TrendingUp
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import { profileService } from '../services/profileService';
import { getUserGradeId, getGradeConfig, getSubtopics } from '../config/israeliCurriculum';
import MathTutor from '../components/ai/MathTutor';
import AILearningArea from '../components/learning/AILearningArea';
import ProgressStats from '../components/dashboard/ProgressStats';
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

    const [loading, setLoading] = useState(true);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [expandedTopic, setExpandedTopic] = useState(null);

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
            subtopic: subtopic?.name || subtopic
        });

        setSelectedTopic(topic);
        setSelectedSubtopic(subtopic);
        setCurrentMode('practice');
    };

    const handleLearningComplete = () => {
        console.log('✅ Learning complete, transitioning to practice');
        toast.success('מצוין! עכשיו בוא נתרגל את מה שלמדת! 🚀');
        setCurrentMode('practice');
    };

    const exitToDashboard = () => {
        setCurrentMode('dashboard');
        setSelectedTopic(null);
        setSelectedSubtopic(null);
        loadAllStats();
    };

    const successRate = stats.questionsAnswered > 0
        ? Math.round((stats.correctAnswers / stats.questionsAnswered) * 100)
        : 0;

    if (currentMode === 'learning') {
        return (
            <AILearningArea
                topic={selectedTopic}
                subtopic={selectedSubtopic}
                personality={profile?.personality || { group: 'balanced' }}
                onComplete={handleLearningComplete}
                onStartPractice={handleLearningComplete}
                onClose={exitToDashboard}
            />
        );
    }

    if (currentMode === 'practice') {
        return (
            <MathTutor
                selectedTopic={selectedTopic}
                selectedSubtopic={selectedSubtopic}
                mode="normal"
                userId={user?.uid}
                showLearningFirst={false}
                onClose={exitToDashboard}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 py-8 px-4" dir="rtl">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-5xl font-black text-white mb-3 drop-shadow-lg">
                        {greeting}! 👋
                    </h1>
                    <p className="text-2xl text-white/90 font-medium">
                        בוא נתרגל מתמטיקה ביחד! 🚀
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
                >
                    <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                            const randomTopic = availableTopics[Math.floor(Math.random() * availableTopics.length)];
                            startPractice(randomTopic);
                        }}
                        className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-2xl hover:shadow-purple-500/50 transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-white/20 rounded-2xl">
                                <Shuffle className="w-10 h-10 text-white" />
                            </div>
                            <div className="text-right">
                                <h3 className="text-2xl font-black text-white">תרגול מהיר</h3>
                                <p className="text-white/80">נושא אקראי</p>
                            </div>
                        </div>
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/notebook')}
                        className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-2xl hover:shadow-pink-500/50 transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-white/20 rounded-2xl">
                                <BookOpen className="w-10 h-10 text-white" />
                            </div>
                            <div className="text-right">
                                <h3 className="text-2xl font-black text-white">המחברת שלי</h3>
                                <p className="text-white/80">תרגילים שמורים</p>
                            </div>
                        </div>
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {}}
                        className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 shadow-2xl hover:shadow-orange-500/50 transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-white/20 rounded-2xl">
                                <BarChart3 className="w-10 h-10 text-white" />
                            </div>
                            <div className="text-right">
                                <h3 className="text-2xl font-black text-white">התקדמות</h3>
                                <p className="text-white/80">נתונים סטטיסטיים</p>
                            </div>
                        </div>
                    </motion.button>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl mb-8"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-white/20 rounded-2xl">
                            <Brain className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-white">בחר נושא לתרגול</h2>
                            <p className="text-white/80 text-lg">לחיצה אחת והתחלנו! 🚀</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {availableTopics.map((topic, index) => {
                            const subtopics = getSubtopics(gradeId, topic.id) || [];
                            const isExpanded = expandedTopic === topic.id;

                            return (
                                <div key={topic.id}>
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.3 + index * 0.05 }}
                                        className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all"
                                    >
                                        <div className="text-5xl mb-3">{topic.icon}</div>
                                        <h3 className="font-black text-xl text-gray-900 mb-2">{topic.name}</h3>
                                        <p className="text-sm text-gray-600 mb-4">{topic.nameEn}</p>

                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => startLearning(topic, null)}
                                            className="w-full mb-2 flex items-center justify-center gap-2 px-4 py-4 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-xl font-black hover:shadow-lg transition-all text-base"
                                        >
                                            <Book className="w-5 h-5" />
                                            <span>איזור למידה - למד עם AI</span>
                                        </motion.button>

                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => startPractice(topic, null)}
                                            className="w-full mb-2 flex items-center justify-center gap-2 px-4 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-black hover:shadow-lg transition-all text-base"
                                        >
                                            <Rocket className="w-5 h-5" />
                                            <span>תרגול מיידי</span>
                                        </motion.button>

                                        {subtopics.length > 0 && (
                                            <button
                                                onClick={() => setExpandedTopic(isExpanded ? null : topic.id)}
                                                className="w-full flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition-all text-sm"
                                            >
                                                <span>{subtopics.length} נושאי משנה</span>
                                                <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                            </button>
                                        )}
                                    </motion.div>

                                    <AnimatePresence>
                                        {isExpanded && subtopics.length > 0 && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="mt-2 bg-white rounded-xl p-4 shadow-lg"
                                            >
                                                <div className="space-y-2">
                                                    {subtopics.map((sub) => (
                                                        <div key={sub.id} className="space-y-2">
                                                            <p className="text-sm font-bold text-gray-700 mb-2">{sub.name}</p>
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <motion.button
                                                                    whileHover={{ scale: 1.02 }}
                                                                    whileTap={{ scale: 0.98 }}
                                                                    onClick={() => {
                                                                        setExpandedTopic(null);
                                                                        startLearning(topic, sub);
                                                                    }}
                                                                    className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-200 transition-all"
                                                                >
                                                                    <Book className="w-3 h-3" />
                                                                    <span>למד</span>
                                                                </motion.button>

                                                                <motion.button
                                                                    whileHover={{ scale: 1.02 }}
                                                                    whileTap={{ scale: 0.98 }}
                                                                    onClick={() => {
                                                                        setExpandedTopic(null);
                                                                        startPractice(topic, sub);
                                                                    }}
                                                                    className="flex items-center justify-center gap-1 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg text-xs font-bold hover:bg-purple-200 transition-all"
                                                                >
                                                                    <Play className="w-3 h-3" />
                                                                    <span>תרגל</span>
                                                                </motion.button>
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
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl mb-8"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-white/20 rounded-2xl">
                            <BarChart3 className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-white">התקדמות בלימודים</h2>
                            <p className="text-white/80 text-lg">מעקב אחר התקדמותך</p>
                        </div>
                    </div>
                    <ProgressStats userId={user?.uid} refreshTrigger={refreshTrigger} />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="relative overflow-hidden bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-3xl p-8 shadow-2xl"
                >
                    <div className="absolute inset-0 opacity-10">
                        <Sparkles className="absolute top-4 right-4 w-20 h-20" />
                        <Star className="absolute bottom-4 left-4 w-16 h-16" />
                    </div>
                    <div className="relative text-center">
                        <h3 className="text-3xl font-black text-white mb-3">💡 טיפ היום מנקסון</h3>
                        <p className="text-2xl text-white font-medium">
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