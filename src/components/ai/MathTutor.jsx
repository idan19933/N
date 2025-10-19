// src/components/ai/MathTutor.jsx - LIVE AI FEEDBACK SYSTEM (COMPLETE & FIXED)
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Brain, Send, BookOpen, Target, Sparkles, ChevronRight,
    Loader2, Lightbulb, CheckCircle2, XCircle, ArrowLeft,
    Trophy, Star, Zap, Flame, Clock, BarChart3, Award, Play,
    AlertCircle, RefreshCw, TrendingUp
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { getUserGradeId, getGradeConfig, getSubtopics } from '../../config/israeliCurriculum';
import toast from 'react-hot-toast';
import { aiVerification } from '../../services/aiAnswerVerification';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

// ==================== LOADING ANIMATION ====================
const ThinkingAnimation = ({ message = "נקסון חושב..." }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-16"
        >
            <motion.div
                animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                transition={{
                    rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                    scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                }}
                className="relative mb-6"
            >
                <motion.div
                    animate={{ rotate: -360, scale: [1, 1.2, 1] }}
                    transition={{
                        rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                        scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                    }}
                    className="absolute inset-0 w-32 h-32 border-4 border-purple-200 rounded-full"
                    style={{ borderTopColor: 'transparent', borderRightColor: 'transparent' }}
                />
                <motion.div
                    animate={{ rotate: 360, scale: [1, 1.15, 1] }}
                    transition={{
                        rotate: { duration: 2.5, repeat: Infinity, ease: "linear" },
                        scale: { duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 0.2 }
                    }}
                    className="absolute inset-2 w-28 h-28 border-4 border-pink-200 rounded-full"
                    style={{ borderBottomColor: 'transparent', borderLeftColor: 'transparent' }}
                />
                <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-2xl">
                    <Brain className="w-16 h-16 text-white" />
                </div>
            </motion.div>

            <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-xl font-bold text-gray-700 mb-2"
            >
                {message}
            </motion.div>

            <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        animate={{ y: [0, -10, 0], scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                        className="w-3 h-3 bg-purple-500 rounded-full"
                    />
                ))}
            </div>
        </motion.div>
    );
};

// ==================== LIVE FEEDBACK INDICATOR ====================
const LiveFeedbackIndicator = ({ status }) => {
    if (status === 'idle') return null;

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={status}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2"
            >
                {status === 'checking' && (
                    <>
                        <Loader2 className="w-4 h-4 text-purple-500 animate-spin" />
                        <span className="text-sm text-purple-600 font-medium">בודק...</span>
                    </>
                )}

                {status === 'correct' && (
                    <>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500 }}
                        >
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                        </motion.div>
                        <span className="text-sm text-green-600 font-bold">נכון! ✓</span>
                    </>
                )}

                {status === 'wrong' && (
                    <>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500 }}
                        >
                            <XCircle className="w-5 h-5 text-red-500" />
                        </motion.div>
                        <span className="text-sm text-red-600 font-medium">לא נכון</span>
                    </>
                )}

                {status === 'partial' && (
                    <>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500 }}
                        >
                            <AlertCircle className="w-5 h-5 text-yellow-500" />
                        </motion.div>
                        <span className="text-sm text-yellow-600 font-medium">כמעט!</span>
                    </>
                )}
            </motion.div>
        </AnimatePresence>
    );
};

const MathTutor = () => {
    const user = useAuthStore(state => state.user);
    const nexonProfile = useAuthStore(state => state.nexonProfile);

    // View states
    const [view, setView] = useState('home');
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [selectedSubtopic, setSelectedSubtopic] = useState(null);

    // Question states
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false);
    const [hintCount, setHintCount] = useState(0);
    const [currentHints, setCurrentHints] = useState([]);

    // Live feedback states
    const [feedbackStatus, setFeedbackStatus] = useState('idle');
    const [liveFeedback, setLiveFeedback] = useState(null);
    const [finalFeedback, setFinalFeedback] = useState(null);
    const [attemptCount, setAttemptCount] = useState(0);

    const autoCheckTimerRef = useRef(null);
    const lastCheckedAnswerRef = useRef('');

    // Session stats
    const [sessionStats, setSessionStats] = useState({
        correct: 0,
        total: 0,
        attempts: 0,
        streak: 0,
        maxStreak: 0,
        points: 0,
        startTime: null,
        questionTimes: []
    });

    // Timer
    const [timer, setTimer] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const timerRef = useRef(null);
    const inputRef = useRef(null);

    // Get curriculum - prioritize nexonProfile over user
    const currentGrade = nexonProfile?.grade || user?.grade || '8';
    const currentTrack = nexonProfile?.track || user?.track;
    const gradeId = getUserGradeId(currentGrade, currentTrack);
    const gradeConfig = getGradeConfig(gradeId);
    const availableTopics = gradeConfig?.topics || [];

    // Log curriculum info only once when it changes
    useEffect(() => {
        console.log('📚 Curriculum loaded:', { currentGrade, currentTrack, gradeId, topicsCount: availableTopics.length });
    }, [currentGrade, currentTrack, gradeId]);

    // Timer effect
    useEffect(() => {
        if (isTimerRunning) {
            timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isTimerRunning]);

    // Live feedback effect - auto-check after 3 seconds
    useEffect(() => {
        if (!userAnswer.trim() || finalFeedback?.isCorrect) {
            if (autoCheckTimerRef.current) {
                clearTimeout(autoCheckTimerRef.current);
                autoCheckTimerRef.current = null;
            }
            setFeedbackStatus('idle');
            return;
        }

        // Don't re-check the same answer
        if (userAnswer === lastCheckedAnswerRef.current) {
            return;
        }

        // Clear previous timer
        if (autoCheckTimerRef.current) {
            clearTimeout(autoCheckTimerRef.current);
        }

        // Show "checking..." after typing stops
        const checkTimer = setTimeout(() => {
            setFeedbackStatus('checking');
        }, 2500);

        // Auto-check after 3 seconds
        autoCheckTimerRef.current = setTimeout(() => {
            checkAnswerLive();
        }, 3000);

        return () => {
            clearTimeout(checkTimer);
            if (autoCheckTimerRef.current) {
                clearTimeout(autoCheckTimerRef.current);
            }
        };
    }, [userAnswer, finalFeedback]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const startPractice = async (topic, subtopic) => {
        setSelectedTopic(topic);
        setSelectedSubtopic(subtopic);
        setView('practice');
        setSessionStats({
            correct: 0,
            total: 0,
            attempts: 0,
            streak: 0,
            maxStreak: 0,
            points: 0,
            startTime: Date.now(),
            questionTimes: []
        });
        await generateNewQuestion(topic, subtopic);
    };

    const generateNewQuestion = async (topic, subtopic) => {
        setIsGeneratingQuestion(true);
        setTimer(0);
        setHintCount(0);
        setCurrentHints([]);
        setUserAnswer('');
        setLiveFeedback(null);
        setFinalFeedback(null);
        setFeedbackStatus('idle');
        setCurrentQuestion(null);
        setAttemptCount(0);
        lastCheckedAnswerRef.current = '';

        try {
            const requestBody = {
                topic: {
                    id: topic.id,
                    name: topic.name,
                    nameEn: topic.nameEn
                },
                subtopic: subtopic ? {
                    id: subtopic.id,
                    name: subtopic.name,
                    nameEn: subtopic.nameEn
                } : null,
                difficulty: topic.difficulty || 'intermediate',
                studentProfile: {
                    name: nexonProfile?.name || user?.name || 'תלמיד',
                    grade: nexonProfile?.grade || user?.grade || '8',
                    track: nexonProfile?.track || user?.track,
                    mathFeeling: nexonProfile?.mathFeeling || 'okay',
                    learningStyle: nexonProfile?.learningStyle || 'ask',
                    goalFocus: nexonProfile?.goalFocus || 'understanding'
                }
            };

            console.log('🚀 Sending question request:', requestBody);

            const response = await fetch(`${API_URL}/api/ai/generate-question`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();

            console.log('📥 Backend response:', data);

            if (!response.ok) {
                throw new Error(data.error || data.message || `Backend error: ${response.status}`);
            }

            if (data.success && data.question) {
                await new Promise(resolve => setTimeout(resolve, 1500));
                setCurrentQuestion(data.question);
                setIsTimerRunning(true);
                setTimeout(() => inputRef.current?.focus(), 100);
            } else {
                throw new Error(data.error || 'Failed to generate question');
            }
        } catch (error) {
            console.error('❌ Question generation error:', error);
            toast.error(`שגיאה ביצירת שאלה: ${error.message}`);

            // Return to topic selection
            setView('topic-select');
        } finally {
            setIsGeneratingQuestion(false);
        }
    };

    // Live check - shows status but doesn't finalize
    const checkAnswerLive = async () => {
        if (!userAnswer.trim() || !currentQuestion) return;

        lastCheckedAnswerRef.current = userAnswer;

        try {
            const result = await aiVerification.verifyAnswer(
                userAnswer,
                currentQuestion.correctAnswer,
                currentQuestion.question,
                {
                    studentName: nexonProfile?.name || user?.name || 'תלמיד',
                    grade: nexonProfile?.grade || user?.grade || '8',
                    topic: selectedTopic?.name,
                    subtopic: selectedSubtopic?.id
                }
            );

            setLiveFeedback(result);

            if (result.isCorrect) {
                setFeedbackStatus('correct');
            } else if (result.isPartial) {
                setFeedbackStatus('partial');
            } else {
                setFeedbackStatus('wrong');
            }

        } catch (error) {
            console.error('Live check error:', error);
            setFeedbackStatus('idle');
        }
    };

    // Final submit - locks answer and allows next question
    const submitAnswer = async () => {
        if (!userAnswer.trim() || !currentQuestion) return;
        if (finalFeedback?.isCorrect) {
            nextQuestion();
            return;
        }

        setIsTimerRunning(false);

        // If we already have live feedback, use it
        let result = liveFeedback;

        // Otherwise check now
        if (!result || lastCheckedAnswerRef.current !== userAnswer) {
            try {
                result = await aiVerification.verifyAnswer(
                    userAnswer,
                    currentQuestion.correctAnswer,
                    currentQuestion.question,
                    {
                        studentName: nexonProfile?.name || user?.name || 'תלמיד',
                        grade: nexonProfile?.grade || user?.grade || '8',
                        topic: selectedTopic?.name,
                        subtopic: selectedSubtopic?.id
                    }
                );
            } catch (error) {
                console.error('Submit error:', error);
                toast.error('שגיאה בבדיקת תשובה');
                return;
            }
        }

        const isCorrect = result.isCorrect;
        const isPartial = result.isPartial || false;

        // Calculate points
        let pointsEarned = 0;
        if (isCorrect) {
            if (attemptCount === 0) {
                pointsEarned = 100 - (hintCount * 10);
            } else if (attemptCount === 1) {
                pointsEarned = 60;
            } else if (attemptCount === 2) {
                pointsEarned = 30;
            } else {
                pointsEarned = 10;
            }
            pointsEarned = Math.max(pointsEarned, 10);
        }

        setFinalFeedback({
            ...result,
            timeTaken: timer,
            pointsEarned,
            attemptNumber: attemptCount + 1
        });

        // Update stats if correct
        if (isCorrect) {
            setSessionStats(prev => {
                const newStreak = prev.streak + 1;
                return {
                    ...prev,
                    correct: prev.correct + 1,
                    total: prev.total + 1,
                    attempts: prev.attempts + attemptCount + 1,
                    streak: newStreak,
                    maxStreak: Math.max(newStreak, prev.maxStreak),
                    points: prev.points + pointsEarned,
                    questionTimes: [...prev.questionTimes, timer]
                };
            });
        } else {
            // Wrong - increment attempt
            setAttemptCount(prev => prev + 1);
            setSessionStats(prev => ({
                ...prev,
                streak: 0
            }));
        }
    };

    const getHint = async () => {
        if (hintCount >= 3) return;

        try {
            const response = await fetch(`${API_URL}/api/ai/get-hint`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: currentQuestion.question,
                    hintIndex: hintCount,
                    studentProfile: {
                        name: nexonProfile?.name || user?.name || 'תלמיד',
                        learningStyle: nexonProfile?.learningStyle || 'ask'
                    }
                })
            });

            const data = await response.json();

            if (data.success) {
                setCurrentHints([...currentHints, data.hint]);
                setHintCount(hintCount + 1);
            }
        } catch (error) {
            console.error('Hint error:', error);
            toast.error('שגיאה בקבלת רמז');
        }
    };

    const nextQuestion = () => {
        if (finalFeedback?.isCorrect) {
            generateNewQuestion(selectedTopic, selectedSubtopic);
        }
    };

    const tryAgain = () => {
        setUserAnswer('');
        setLiveFeedback(null);
        setFinalFeedback(null);
        setFeedbackStatus('idle');
        lastCheckedAnswerRef.current = '';
        setIsTimerRunning(true);
        inputRef.current?.focus();
    };

    const endSession = () => {
        setView('results');
        setIsTimerRunning(false);
    };

    // HOME VIEW
    if (view === 'home') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-4" dir="rtl">
                <div className="max-w-4xl mx-auto pt-12">
                    <motion.div
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                            className="inline-block mb-6"
                        >
                            <div className="w-24 h-24 bg-white/20 backdrop-blur-xl rounded-3xl flex items-center justify-center mx-auto">
                                <Brain className="w-14 h-14 text-white" />
                            </div>
                        </motion.div>

                        <h1 className="text-6xl font-black text-white mb-4 drop-shadow-lg">נקסון</h1>
                        <p className="text-2xl text-white/90 mb-2">המורה הדיגיטלי שלך</p>
                        <p className="text-lg text-white/80">
                            {gradeConfig?.name} • {availableTopics.length} נושאים
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-3 gap-4 mb-8">
                        {[
                            { icon: Trophy, label: 'הרמה שלך', value: 'Level 5', color: 'yellow' },
                            { icon: Flame, label: 'רצף תשובות', value: '12', color: 'orange' },
                            { icon: Star, label: 'נקודות', value: '2,450', color: 'blue' }
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white/20 backdrop-blur-xl rounded-2xl p-4 text-center"
                            >
                                <stat.icon className={`w-8 h-8 text-${stat.color}-300 mx-auto mb-2`} />
                                <div className="text-2xl font-bold text-white">{stat.value}</div>
                                <div className="text-sm text-white/80">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setView('topic-select')}
                        className="w-full bg-white text-purple-600 rounded-2xl py-6 font-bold text-xl shadow-2xl hover:shadow-3xl transition-all mb-6 flex items-center justify-center gap-3"
                    >
                        <Play className="w-6 h-6" />
                        התחל תרגול
                        <Sparkles className="w-6 h-6" />
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        onClick={() => toast.success('סטטיסטיקות בקרוב!')}
                        className="w-full bg-white/10 backdrop-blur-xl text-white rounded-2xl py-4 font-semibold hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                    >
                        <BarChart3 className="w-5 h-5" />
                        הסטטיסטיקה שלי
                    </motion.button>
                </div>
            </div>
        );
    }

    // TOPIC SELECT VIEW
    if (view === 'topic-select') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-4" dir="rtl">
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={() => setView('home')}
                            className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            חזרה
                        </button>
                        <h2 className="text-2xl font-bold text-gray-800">בחר נושא לתרגול</h2>
                        <div className="w-20" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {availableTopics.map((topic, index) => (
                            <motion.div
                                key={topic.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 cursor-pointer border-2 border-transparent hover:border-purple-300"
                                onClick={() => {
                                    setSelectedTopic(topic);
                                    const subtopics = getSubtopics(gradeId, topic.id);
                                    if (subtopics.length === 0) {
                                        startPractice(topic, null);
                                    }
                                }}
                            >
                                <div className="text-5xl mb-3">{topic.icon}</div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">{topic.name}</h3>
                                <p className="text-sm text-gray-500 mb-4">{topic.nameEn}</p>

                                {selectedTopic?.id === topic.id && getSubtopics(gradeId, topic.id).length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="space-y-2 mt-4 pt-4 border-t"
                                    >
                                        {getSubtopics(gradeId, topic.id).map(subtopic => (
                                            <button
                                                key={subtopic.id}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    startPractice(topic, subtopic);
                                                }}
                                                className="w-full text-right px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-xl transition-all text-sm font-medium text-gray-700 hover:text-purple-700"
                                            >
                                                {subtopic.name}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}

                                {getSubtopics(gradeId, topic.id).length > 0 && selectedTopic?.id !== topic.id && (
                                    <div className="text-xs text-gray-400 flex items-center gap-1">
                                        <ChevronRight className="w-3 h-3" />
                                        {getSubtopics(gradeId, topic.id).length} תתי-נושאים
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // PRACTICE VIEW - WITH LIVE FEEDBACK
    if (view === 'practice') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4" dir="rtl">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="bg-white rounded-2xl shadow-lg p-4 mb-4 flex items-center justify-between">
                        <button
                            onClick={endSession}
                            className="text-gray-600 hover:text-gray-800 font-medium"
                        >
                            סיים
                        </button>

                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-purple-600" />
                                <span className="font-mono text-lg font-bold">{formatTime(timer)}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <Flame className="w-5 h-5 text-orange-500" />
                                <span className="font-bold text-orange-600">{sessionStats.streak}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <Star className="w-5 h-5 text-yellow-500" />
                                <span className="font-bold text-yellow-600">{sessionStats.points}</span>
                            </div>

                            <div className="text-sm font-medium text-gray-600">
                                {sessionStats.correct}/{sessionStats.total}
                            </div>
                        </div>
                    </div>

                    {/* Question Card */}
                    <motion.div
                        key={currentQuestion?.question || 'loading'}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-3xl shadow-2xl p-8 mb-4"
                    >
                        <AnimatePresence mode="wait">
                            {isGeneratingQuestion ? (
                                <ThinkingAnimation message="נקסון מכין שאלה מיוחדת בשבילך..." />
                            ) : currentQuestion ? (
                                <motion.div
                                    key="question-content"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                >
                                    {/* Topic Badge */}
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-2">
                                            <span className="text-3xl">{selectedTopic?.icon}</span>
                                            <div>
                                                <div className="font-semibold text-gray-800">{selectedTopic?.name}</div>
                                                {selectedSubtopic && (
                                                    <div className="text-sm text-gray-500">{selectedSubtopic.name}</div>
                                                )}
                                            </div>
                                        </div>

                                        {attemptCount > 0 && (
                                            <div className="flex items-center gap-2 bg-orange-50 px-3 py-1 rounded-full">
                                                <RefreshCw className="w-4 h-4 text-orange-600" />
                                                <span className="text-sm font-medium text-orange-600">
                                                    ניסיון {attemptCount + 1}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Question */}
                                    <div className="mb-8">
                                        <h3 className="text-2xl font-bold text-gray-800 mb-4 leading-relaxed">
                                            {currentQuestion.question}
                                        </h3>
                                    </div>

                                    {/* Hints */}
                                    {currentHints.length > 0 && (
                                        <div className="mb-6 space-y-2">
                                            {currentHints.map((hint, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className="bg-yellow-50 border-r-4 border-yellow-400 p-4 rounded-lg"
                                                >
                                                    <div className="flex items-start gap-2">
                                                        <Lightbulb className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-1" />
                                                        <div className="text-gray-700">{hint}</div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Live Feedback Panel */}
                                    {liveFeedback && !finalFeedback && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`mb-6 p-4 rounded-xl border-2 ${
                                                feedbackStatus === 'correct'
                                                    ? 'bg-green-50 border-green-300'
                                                    : feedbackStatus === 'partial'
                                                        ? 'bg-yellow-50 border-yellow-300'
                                                        : 'bg-red-50 border-red-300'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2 text-sm">
                                                {feedbackStatus === 'correct' && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                                                {feedbackStatus === 'partial' && <AlertCircle className="w-4 h-4 text-yellow-600" />}
                                                {feedbackStatus === 'wrong' && <XCircle className="w-4 h-4 text-red-600" />}
                                                <span className="font-medium text-gray-700">{liveFeedback.explanation}</span>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Final Feedback (after submit) */}
                                    {finalFeedback && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`mb-6 p-6 rounded-2xl ${
                                                finalFeedback.isCorrect
                                                    ? 'bg-green-50 border-2 border-green-200'
                                                    : finalFeedback.isPartial
                                                        ? 'bg-yellow-50 border-2 border-yellow-200'
                                                        : 'bg-red-50 border-2 border-red-200'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 mb-3">
                                                {finalFeedback.isCorrect ? (
                                                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                                                ) : (
                                                    <XCircle className="w-8 h-8 text-red-600" />
                                                )}
                                                <div className="flex-1">
                                                    <div className="text-xl font-bold">{finalFeedback.feedback}</div>
                                                    {finalFeedback.isCorrect && finalFeedback.pointsEarned > 0 && (
                                                        <div className="text-sm text-gray-600">
                                                            +{finalFeedback.pointsEarned} נקודות • {formatTime(finalFeedback.timeTaken)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {finalFeedback.explanation && (
                                                <div className="bg-white/50 rounded-lg p-4 mb-3">
                                                    <div className="font-semibold text-gray-700 mb-2">💡 הסבר:</div>
                                                    <div className="text-gray-700">{finalFeedback.explanation}</div>
                                                </div>
                                            )}

                                            {!finalFeedback.isCorrect && (
                                                <div className="bg-white/50 rounded-lg p-4">
                                                    <div className="font-semibold text-gray-700 mb-1">התשובה הנכונה:</div>
                                                    <div className="text-xl font-bold text-gray-800">{currentQuestion.correctAnswer}</div>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}

                                    {/* Input Area */}
                                    {!finalFeedback && (
                                        <div className="space-y-4">
                                            <div className="relative">
                                                <input
                                                    ref={inputRef}
                                                    type="text"
                                                    value={userAnswer}
                                                    onChange={(e) => setUserAnswer(e.target.value)}
                                                    onKeyPress={(e) => e.key === 'Enter' && submitAnswer()}
                                                    placeholder="כתוב/י את התשובה..."
                                                    className="w-full px-6 py-4 pr-32 text-xl border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-200 focus:border-purple-400 transition-all"
                                                />
                                                <LiveFeedbackIndicator status={feedbackStatus} />
                                            </div>

                                            <div className="flex gap-3">
                                                <button
                                                    onClick={getHint}
                                                    disabled={hintCount >= 3}
                                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-yellow-500 text-white rounded-2xl font-bold hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                                >
                                                    <Lightbulb className="w-5 h-5" />
                                                    רמז ({3 - hintCount})
                                                </button>

                                                <button
                                                    onClick={submitAnswer}
                                                    disabled={!userAnswer.trim()}
                                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                                >
                                                    <CheckCircle2 className="w-5 h-5" />
                                                    שלח תשובה
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Action Buttons After Feedback */}
                                    {finalFeedback && (
                                        <div className="flex gap-3">
                                            {!finalFeedback.isCorrect && (
                                                <button
                                                    onClick={tryAgain}
                                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-orange-500 text-white rounded-2xl font-bold hover:bg-orange-600 transition-all"
                                                >
                                                    <RefreshCw className="w-5 h-5" />
                                                    נסה שוב
                                                </button>
                                            )}

                                            {finalFeedback.isCorrect && (
                                                <button
                                                    onClick={nextQuestion}
                                                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-bold hover:shadow-lg transition-all"
                                                >
                                                    <Sparkles className="w-5 h-5" />
                                                    שאלה הבאה
                                                    <ChevronRight className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            ) : null}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>
        );
    }

    // RESULTS VIEW
    if (view === 'results') {
        const avgTime = sessionStats.questionTimes.length > 0
            ? Math.round(sessionStats.questionTimes.reduce((a, b) => a + b, 0) / sessionStats.questionTimes.length)
            : 0;
        const accuracy = sessionStats.total > 0 ? Math.round((sessionStats.correct / sessionStats.total) * 100) : 0;
        const avgAttempts = sessionStats.total > 0 ? (sessionStats.attempts / sessionStats.total).toFixed(1) : 0;

        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-4 flex items-center justify-center" dir="rtl">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full"
                >
                    <div className="text-center mb-6">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", delay: 0.2 }}
                        >
                            <Award className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
                        </motion.div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">סיימת!</h2>
                        <p className="text-gray-600">תוצאות המפגש</p>
                    </div>

                    <div className="space-y-4 mb-6">
                        {[
                            { icon: Target, label: 'דיוק', value: `${accuracy}%`, color: 'purple' },
                            { icon: CheckCircle2, label: 'נכונות', value: `${sessionStats.correct}/${sessionStats.total}`, color: 'green' },
                            { icon: TrendingUp, label: 'ניסיונות ממוצעים', value: avgAttempts, color: 'blue' },
                            { icon: Flame, label: 'רצף מקסימלי', value: sessionStats.maxStreak, color: 'orange' },
                            { icon: Star, label: 'נקודות', value: sessionStats.points, color: 'yellow' },
                            { icon: Clock, label: 'זמן ממוצע', value: formatTime(avgTime), color: 'pink' }
                        ].map((stat, i) => (
                            <div key={i} className={`bg-${stat.color}-50 rounded-2xl p-4 flex items-center justify-between`}>
                                <div>
                                    <div className="text-sm text-gray-600">{stat.label}</div>
                                    <div className={`text-3xl font-bold text-${stat.color}-600`}>{stat.value}</div>
                                </div>
                                <stat.icon className={`w-10 h-10 text-${stat.color}-400`} />
                            </div>
                        ))}
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => startPractice(selectedTopic, selectedSubtopic)}
                            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold hover:shadow-lg transition-all"
                        >
                            תרגל שוב
                        </button>

                        <button
                            onClick={() => {
                                setView('topic-select');
                                setSelectedTopic(null);
                                setSelectedSubtopic(null);
                            }}
                            className="w-full py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                        >
                            נושא אחר
                        </button>

                        <button
                            onClick={() => setView('home')}
                            className="w-full py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-2xl font-bold hover:border-gray-300 transition-all"
                        >
                            חזרה לדף הבית
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return null;
};

export default MathTutor;