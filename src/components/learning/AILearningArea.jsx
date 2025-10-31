// src/components/learning/AILearningArea.jsx - ULTIMATE ENHANCED MODERN UI 🎨✨
import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Book, ChevronLeft, ChevronRight, XCircle, Brain,
    Lightbulb, Play, ArrowLeft, Sparkles, Trophy,
    Target, CheckCircle2, Zap, Star, Flame, Award,
    TrendingUp, BookOpen, Rocket, Coffee, Smile,
    Activity, Bookmark, Heart, MessageCircle
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

// ✅ MODULE-LEVEL CACHE - Persists across ALL component mounts/unmounts
const CONTENT_CACHE = new Map();
const LOADING_TRACKER = new Map();

// ==================== 🎨 ANIMATION VARIANTS ====================
const pageTransition = {
    initial: { opacity: 0, y: 20, scale: 0.98 },
    animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
    },
    exit: {
        opacity: 0,
        y: -20,
        scale: 0.98,
        transition: { duration: 0.3 }
    }
};

const cardHover = {
    rest: { scale: 1, y: 0 },
    hover: {
        scale: 1.02,
        y: -4,
        transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
    },
    tap: { scale: 0.98 }
};

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (custom = 0) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: custom * 0.1,
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1]
        }
    })
};

const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 200,
            damping: 20
        }
    }
};

const slideInRight = {
    hidden: { opacity: 0, x: 50 },
    visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.4, ease: "easeOut" }
    }
};

const pulseGlow = {
    animate: {
        boxShadow: [
            '0 0 20px rgba(147, 51, 234, 0.3)',
            '0 0 40px rgba(147, 51, 234, 0.5)',
            '0 0 20px rgba(147, 51, 234, 0.3)'
        ],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
        }
    }
};

// ==================== 🎭 ENHANCED LOADING ANIMATION ====================
const ThinkingAnimation = ({ message = "יוצר חומר לימוד מותאם אישית..." }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-16"
        >
            <motion.div
                animate={{
                    rotate: 360,
                    scale: [1, 1.1, 1]
                }}
                transition={{
                    rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                    scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                }}
                className="relative mb-8"
            >
                {/* Outer Ring */}
                <motion.div
                    animate={{
                        rotate: -360,
                        scale: [1, 1.2, 1]
                    }}
                    transition={{
                        rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                        scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                    }}
                    className="absolute inset-0 w-32 h-32 border-4 border-purple-200 rounded-full"
                    style={{
                        borderTopColor: 'transparent',
                        borderRightColor: 'transparent'
                    }}
                />
                {/* Middle Ring */}
                <motion.div
                    animate={{
                        rotate: 360,
                        scale: [1, 1.15, 1]
                    }}
                    transition={{
                        rotate: { duration: 2.5, repeat: Infinity, ease: "linear" },
                        scale: { duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 0.2 }
                    }}
                    className="absolute inset-2 w-28 h-28 border-4 border-pink-200 rounded-full"
                    style={{
                        borderBottomColor: 'transparent',
                        borderLeftColor: 'transparent'
                    }}
                />
                {/* Center Icon */}
                <div className="w-32 h-32 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-full flex items-center justify-center shadow-2xl">
                    <Brain className="w-16 h-16 text-white" />
                </div>
            </motion.div>

            <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-2xl font-black text-white mb-4 text-center"
            >
                {message}
            </motion.div>

            {/* Animated Dots */}
            <div className="flex gap-2 mb-8">
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        animate={{
                            y: [0, -15, 0],
                            scale: [1, 1.3, 1]
                        }}
                        transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: i * 0.2
                        }}
                        className="w-4 h-4 bg-white rounded-full shadow-lg"
                    />
                ))}
            </div>

            {/* Progress Bar */}
            <div className="w-64 bg-white/20 rounded-full h-3 overflow-hidden backdrop-blur-sm">
                <motion.div
                    className="h-full bg-gradient-to-r from-white via-yellow-200 to-white rounded-full"
                    animate={{
                        x: ['-100%', '200%']
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            </div>

            {/* Floating Icons */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[Sparkles, Star, Zap, Trophy, Target].map((Icon, i) => (
                    <motion.div
                        key={i}
                        className="absolute"
                        style={{
                            left: `${15 + i * 18}%`,
                            top: `${30 + (i % 3) * 20}%`
                        }}
                        animate={{
                            y: [0, -20, 0],
                            rotate: [0, 360],
                            opacity: [0.3, 0.8, 0.3]
                        }}
                        transition={{
                            duration: 3 + i,
                            repeat: Infinity,
                            delay: i * 0.5
                        }}
                    >
                        <Icon className="w-8 h-8 text-white/40" />
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

// ==================== 📝 ENHANCED TEXT DISPLAY ====================
const EnhancedText = ({ children, className = '' }) => {
    return (
        <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-lg leading-relaxed text-gray-800 ${className}`}
            style={{
                fontFamily: "'Assistant', 'Segoe UI', 'Arial', sans-serif",
                letterSpacing: '0.02em'
            }}
        >
            {children}
        </motion.p>
    );
};

// ==================== 💡 EXAMPLE CARD ====================
const ExampleCard = ({ example, index }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <motion.div
            custom={index}
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="relative"
        >
            <motion.div
                variants={cardHover}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
                className="bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50 border-l-4 border-blue-500 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all overflow-hidden"
            >
                {/* Decorative Background Pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
                    <Lightbulb className="w-full h-full text-blue-600" />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <motion.div
                            animate={{
                                rotate: [0, 10, -10, 0],
                                scale: [1, 1.1, 1]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                repeatDelay: 3
                            }}
                            className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg"
                        >
                            <Lightbulb className="w-6 h-6 text-white" />
                        </motion.div>
                        <div>
                            <div className="font-black text-blue-900 text-xl">דוגמה {index + 1}</div>
                            <div className="text-blue-600 text-sm font-medium">לחץ להרחבה</div>
                        </div>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 mb-4 border-2 border-blue-200">
                        <EnhancedText className="text-gray-900 font-semibold text-xl">
                            {example.value}
                        </EnhancedText>
                    </div>

                    {example.solution && (
                        <motion.button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="w-full flex items-center justify-between px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold transition-all"
                        >
                            <span>{isExpanded ? 'הסתר פתרון' : 'הצג פתרון'}</span>
                            <motion.div
                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </motion.div>
                        </motion.button>
                    )}

                    <AnimatePresence>
                        {isExpanded && example.solution && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="overflow-hidden"
                            >
                                <div className="mt-4 p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-300">
                                    <div className="flex items-center gap-2 mb-3">
                                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                                        <span className="font-black text-green-900 text-lg">פתרון:</span>
                                    </div>
                                    <EnhancedText className="text-gray-800">
                                        {example.solution}
                                    </EnhancedText>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </motion.div>
    );
};

// ==================== ✨ TIP CARD ====================
const TipCard = ({ tip, index }) => {
    return (
        <motion.div
            custom={index}
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
        >
            <motion.div
                variants={cardHover}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
                className="relative bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 border-l-4 border-yellow-500 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all overflow-hidden"
            >
                {/* Decorative Stars */}
                <div className="absolute top-2 right-2 flex gap-1">
                    {[...Array(3)].map((_, i) => (
                        <motion.div
                            key={i}
                            animate={{
                                scale: [1, 1.2, 1],
                                rotate: [0, 180, 360]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: i * 0.3
                            }}
                        >
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        </motion.div>
                    ))}
                </div>

                <div className="flex items-start gap-4">
                    <motion.div
                        animate={{
                            rotate: [0, 360],
                            scale: [1, 1.1, 1]
                        }}
                        transition={{
                            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                            scale: { duration: 2, repeat: Infinity }
                        }}
                        className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
                    >
                        <Sparkles className="w-7 h-7 text-white" />
                    </motion.div>

                    <div className="flex-1">
                        <div className="font-black text-yellow-900 text-lg mb-3">💡 טיפ חשוב</div>
                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border-2 border-yellow-300">
                            <EnhancedText className="text-gray-800 font-medium">
                                {tip.value}
                            </EnhancedText>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

// ==================== 🎯 QUIZ QUESTION CARD ====================
const QuizQuestion = ({ question, qIndex, quizAnswers, showSolution, onAnswerSelect, onCheckAnswer }) => {
    const isAnswered = quizAnswers[qIndex] !== undefined;
    const isCorrect = showSolution[qIndex] && quizAnswers[qIndex] === question.correctAnswer;

    return (
        <motion.div
            custom={qIndex}
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="relative"
        >
            <motion.div
                variants={cardHover}
                initial="rest"
                whileHover={!showSolution[qIndex] ? "hover" : "rest"}
                className="bg-white rounded-2xl p-6 shadow-xl border-2 border-purple-200 overflow-hidden"
            >
                {/* Question Number Badge */}
                <div className="absolute top-4 left-4 w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-black text-lg">{qIndex + 1}</span>
                </div>

                {/* Question Text */}
                <div className="mb-6 pr-14">
                    <div className="flex items-start gap-3">
                        <Target className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                        <EnhancedText className="text-gray-900 font-bold text-xl">
                            {question.question}
                        </EnhancedText>
                    </div>
                </div>

                {/* Options */}
                <div className="space-y-3 mb-6">
                    {question.options.map((option, oIndex) => {
                        const isSelected = quizAnswers[qIndex] === oIndex;
                        const isCorrectAnswer = question.correctAnswer === oIndex;
                        const showAnswer = showSolution[qIndex];

                        let buttonClass = 'bg-gray-50 border-2 border-gray-200 hover:border-purple-300 text-gray-700 hover:bg-purple-50';

                        if (showAnswer) {
                            if (isCorrectAnswer) {
                                buttonClass = 'bg-gradient-to-r from-green-50 to-emerald-50 border-3 border-green-500 text-green-900 shadow-lg';
                            } else if (isSelected) {
                                buttonClass = 'bg-gradient-to-r from-red-50 to-pink-50 border-3 border-red-500 text-red-900';
                            } else {
                                buttonClass = 'bg-gray-100 border-2 border-gray-300 text-gray-500 opacity-60';
                            }
                        } else if (isSelected) {
                            buttonClass = 'bg-gradient-to-r from-purple-100 to-pink-100 border-3 border-purple-500 text-purple-900 shadow-lg';
                        }

                        return (
                            <motion.button
                                key={oIndex}
                                onClick={() => !showAnswer && onAnswerSelect(qIndex, oIndex)}
                                disabled={showAnswer}
                                variants={cardHover}
                                initial="rest"
                                whileHover={!showAnswer ? "hover" : "rest"}
                                whileTap={!showAnswer ? "tap" : "rest"}
                                className={`w-full text-right p-5 rounded-xl font-bold transition-all relative overflow-hidden ${buttonClass}`}
                            >
                                {/* Option Letter */}
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-lg ${
                                        showAnswer
                                            ? isCorrectAnswer
                                                ? 'bg-green-500 text-white'
                                                : isSelected
                                                    ? 'bg-red-500 text-white'
                                                    : 'bg-gray-300 text-gray-600'
                                            : isSelected
                                                ? 'bg-purple-500 text-white'
                                                : 'bg-gray-200 text-gray-600'
                                    }`}>
                                        {String.fromCharCode(65 + oIndex)}
                                    </div>
                                    <span className="flex-1 text-right text-lg">{option}</span>

                                    {/* Check/X Icon */}
                                    {showAnswer && (
                                        <motion.div
                                            initial={{ scale: 0, rotate: -180 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            transition={{ type: "spring", stiffness: 200 }}
                                        >
                                            {isCorrectAnswer ? (
                                                <CheckCircle2 className="w-7 h-7 text-green-600" />
                                            ) : isSelected ? (
                                                <XCircle className="w-7 h-7 text-red-600" />
                                            ) : null}
                                        </motion.div>
                                    )}
                                </div>
                            </motion.button>
                        );
                    })}
                </div>

                {/* Check Answer Button */}
                {isAnswered && !showSolution[qIndex] && (
                    <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onCheckAnswer(qIndex)}
                        className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-black text-lg shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2"
                    >
                        <Zap className="w-6 h-6" />
                        בדוק תשובה
                        <Sparkles className="w-6 h-6" />
                    </motion.button>
                )}

                {/* Explanation */}
                {showSolution[qIndex] && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.4 }}
                        className={`mt-6 p-6 rounded-2xl border-3 ${
                            isCorrect
                                ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-400'
                                : 'bg-gradient-to-br from-red-50 to-pink-50 border-red-400'
                        }`}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            {isCorrect ? (
                                <>
                                    <motion.div
                                        animate={{ rotate: [0, 360] }}
                                        transition={{ duration: 0.5 }}
                                    >
                                        <Trophy className="w-8 h-8 text-green-600" />
                                    </motion.div>
                                    <span className="text-2xl font-black text-green-900">
                                        מעולה! תשובה נכונה! 🎉
                                    </span>
                                </>
                            ) : (
                                <>
                                    <XCircle className="w-8 h-8 text-red-600" />
                                    <span className="text-2xl font-black text-red-900">
                                        לא נכון, אבל זה בסדר! 💪
                                    </span>
                                </>
                            )}
                        </div>

                        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border-2 border-gray-200">
                            <div className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                                <Brain className="w-5 h-5 text-purple-600" />
                                הסבר:
                            </div>
                            <EnhancedText className="text-gray-800">
                                {question.explanation}
                            </EnhancedText>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </motion.div>
    );
};

// ==================== 🎓 MAIN COMPONENT ====================
const AILearningArea = memo(({ topic, subtopic, personality, onComplete, onStartPractice, onClose }) => {
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState({});
    const [showSolution, setShowSolution] = useState({});

    // ✅ Single ref to track if this instance loaded content
    const hasLoadedRef = useRef(false);

    const user = useAuthStore(state => state.user);

    // Get topic key for caching
    const getTopicKey = useCallback(() => {
        const topicName = topic?.name || topic || 'general';
        const subtopicName = subtopic?.name || subtopic || 'none';
        return `${topicName}-${subtopicName}`.toLowerCase().replace(/\s+/g, '-');
    }, [topic, subtopic]);

    // ✅ Memoized function to generate content
    const generateContent = useCallback(async () => {
        const topicKey = getTopicKey();

        // Check if already loaded in this instance
        if (hasLoadedRef.current) {
            console.log('⏭️ Already loaded in this instance');
            return;
        }

        // Check module-level cache first
        const cached = CONTENT_CACHE.get(topicKey);
        if (cached) {
            console.log('💾 Using MODULE cache for:', topicKey);
            setContent(cached);
            hasLoadedRef.current = true;
            return;
        }

        // Check if another instance is already loading this
        if (LOADING_TRACKER.get(topicKey)) {
            console.log('⏳ Another instance is loading, waiting...');
            // Wait for the other instance to finish
            const checkInterval = setInterval(() => {
                const cached = CONTENT_CACHE.get(topicKey);
                if (cached) {
                    console.log('💾 Content now available from other instance');
                    setContent(cached);
                    hasLoadedRef.current = true;
                    clearInterval(checkInterval);
                }
            }, 100);
            return;
        }

        // Mark as loading globally
        LOADING_TRACKER.set(topicKey, true);
        console.log('🎓 SINGLE API CALL: Generating content for:', topicKey);

        setLoading(true);
        setError(null);

        try {
            const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

            const startTime = Date.now();
            console.log('⏱️ Generation started...');

            const response = await fetch(`${API_BASE_URL}/api/learning/generate-content`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    topic: topic?.name || topic,
                    subtopic: subtopic?.name || subtopic,
                    grade: user?.grade || '7',
                    personality: personality?.group || 'nexon',
                    userId: user?.uid || 'anonymous'
                })
            });

            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            console.log(`✅ API Response: ${response.status} (${elapsed}s)`);

            if (!response.ok) {
                const data = await response.json().catch(() => ({ error: 'Server error' }));
                throw new Error(data.error || `Server error: ${response.status}`);
            }

            const data = await response.json();

            if (data.success && data.content) {
                console.log(`💾 Content cached for: ${topicKey} (Total: ${elapsed}s)`);

                // Store in module-level cache
                CONTENT_CACHE.set(topicKey, data.content);

                setContent(data.content);
                hasLoadedRef.current = true;
            } else {
                throw new Error('Invalid response format from server');
            }

        } catch (err) {
            console.error('❌ Error:', err);

            let errorMessage = err.message;
            if (err.message.includes('Failed to fetch')) {
                errorMessage = 'לא ניתן להתחבר לשרת. בדוק שהשרת פועל.';
            }

            setError(errorMessage);
            toast.error('שגיאה בטעינת תוכן הלימוד');
        } finally {
            setLoading(false);
            LOADING_TRACKER.delete(topicKey); // Clear loading flag
        }
    }, [topic, subtopic, user, personality, getTopicKey]);

    // ✅ Effect - ONLY depends on topic/subtopic
    useEffect(() => {
        const topicKey = getTopicKey();

        console.log('🔍 Component effect triggered:', topicKey);

        // Reset for new topic
        hasLoadedRef.current = false;

        // Check cache immediately
        const cached = CONTENT_CACHE.get(topicKey);
        if (cached) {
            console.log('💾 Instant load from cache:', topicKey);
            setContent(cached);
            hasLoadedRef.current = true;
        } else {
            // Generate only if not cached
            generateContent();
        }

        return () => {
            // Cleanup
            console.log('🧹 Component unmounting');
        };
    }, [topic, subtopic]); // ONLY topic and subtopic!

    // ✅ Memoized handlers
    const handleNextPage = useCallback(() => {
        if (content && currentPage < content.pages.length - 1) {
            setCurrentPage(prev => prev + 1);
            setQuizAnswers({});
            setShowSolution({});
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [content, currentPage]);

    const handlePrevPage = useCallback(() => {
        if (currentPage > 0) {
            setCurrentPage(prev => prev - 1);
            setQuizAnswers({});
            setShowSolution({});
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [currentPage]);

    const handleAnswerSelect = useCallback((questionIndex, answerIndex) => {
        setQuizAnswers(prev => ({
            ...prev,
            [questionIndex]: answerIndex
        }));
    }, []);

    const handleCheckAnswer = useCallback((questionIndex) => {
        setShowSolution(prev => ({
            ...prev,
            [questionIndex]: true
        }));
    }, []);

    const handleComplete = useCallback(() => {
        toast.success('🎉 כל הכבוד! סיימת את החומר', {
            icon: '🏆',
            style: {
                borderRadius: '16px',
                background: '#10b981',
                color: '#fff',
            },
        });
        if (onComplete) onComplete();
        if (onStartPractice) onStartPractice();
    }, [onComplete, onStartPractice]);

    const handleRetry = useCallback(() => {
        setError(null);
        setLoading(false);
        hasLoadedRef.current = false;
        generateContent();
    }, [generateContent]);

    // ==================== 🎨 RENDER STATES ====================

    // Loading state
    if (loading) {
        return (
            <motion.div
                {...pageTransition}
                className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 flex items-center justify-center p-4"
            >
                <ThinkingAnimation message="נקסון מכין לך חומר לימוד מותאם אישית..." />
            </motion.div>
        );
    }

    // Error state
    if (error) {
        return (
            <motion.div
                {...pageTransition}
                className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 flex items-center justify-center p-4"
                dir="rtl"
            >
                <motion.div
                    variants={scaleIn}
                    initial="hidden"
                    animate="visible"
                    className="bg-white rounded-3xl p-12 max-w-md text-center shadow-2xl"
                >
                    <motion.div
                        animate={{
                            scale: [1, 1.1, 1],
                            rotate: [0, 10, -10, 0]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity
                        }}
                    >
                        <XCircle className="w-24 h-24 text-red-500 mx-auto mb-6" />
                    </motion.div>

                    <h2 className="text-3xl font-black text-gray-900 mb-4">
                        אופס! משהו השתבש
                    </h2>
                    <p className="text-gray-600 text-lg mb-8 leading-relaxed">{error}</p>

                    <div className="flex gap-4">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleRetry}
                            className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2"
                        >
                            <Activity className="w-6 h-6" />
                            נסה שוב
                        </motion.button>
                        {onClose && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onClose}
                                className="flex-1 px-6 py-4 bg-gray-200 text-gray-700 rounded-2xl font-black text-lg hover:bg-gray-300 transition-all flex items-center justify-center gap-2"
                            >
                                <ArrowLeft className="w-6 h-6" />
                                חזור
                            </motion.button>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        );
    }

    // No content yet
    if (!content || !content.pages || content.pages.length === 0) {
        return (
            <motion.div
                {...pageTransition}
                className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 flex items-center justify-center p-4"
                dir="rtl"
            >
                <motion.div
                    variants={scaleIn}
                    initial="hidden"
                    animate="visible"
                    className="bg-white rounded-3xl p-12 max-w-md text-center shadow-2xl"
                >
                    <BookOpen className="w-24 h-24 text-gray-400 mx-auto mb-6" />
                    <h2 className="text-3xl font-black text-gray-900 mb-4">
                        אין תוכן זמין
                    </h2>
                    <p className="text-gray-600 text-lg mb-8">
                        לא הצלחנו לטעון את חומר הלימוד
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleRetry}
                        className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-black text-lg shadow-xl hover:shadow-2xl transition-all"
                    >
                        טען מחדש
                    </motion.button>
                </motion.div>
            </motion.div>
        );
    }

    const currentPageData = content.pages[currentPage];
    const isLastPage = currentPage === content.pages.length - 1;
    const progress = ((currentPage + 1) / content.pages.length) * 100;

    // ==================== 📚 MAIN CONTENT VIEW ====================
    return (
        <motion.div
            {...pageTransition}
            className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 p-4 md:p-8"
            dir="rtl"
        >
            <div className="max-w-5xl mx-auto">
                {/* ==================== 🎯 HEADER ====================*/}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        {/* Back Button */}
                        <motion.button
                            whileHover={{ scale: 1.05, x: -5 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onClose}
                            className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-md text-white rounded-2xl font-bold hover:bg-white/30 transition-all"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span>חזרה</span>
                        </motion.button>

                        {/* Page Counter */}
                        <motion.div
                            animate={pulseGlow.animate}
                            className="px-6 py-3 bg-white/20 backdrop-blur-md rounded-2xl"
                        >
                            <div className="text-white text-center">
                                <div className="text-sm font-medium opacity-90">עמוד</div>
                                <div className="text-2xl font-black">
                                    {currentPage + 1} / {content.pages.length}
                                </div>
                            </div>
                        </motion.div>

                        {/* Trophy Icon */}
                        <motion.div
                            animate={{
                                rotate: [0, 10, -10, 0],
                                scale: [1, 1.1, 1]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                repeatDelay: 1
                            }}
                            className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl"
                        >
                            <Trophy className="w-8 h-8 text-white" />
                        </motion.div>
                    </div>

                    {/* Title */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-6"
                    >
                        <h1 className="text-4xl md:text-5xl font-black text-white mb-3 drop-shadow-lg">
                            {content.title}
                        </h1>
                        <div className="flex items-center justify-center gap-2 text-white/90 text-lg">
                            <BookOpen className="w-5 h-5" />
                            <span>מודול לימודי אינטראקטיבי</span>
                        </div>
                    </motion.div>

                    {/* Progress Bar */}
                    <div className="relative">
                        <div className="bg-white/20 rounded-full h-4 overflow-hidden backdrop-blur-sm shadow-inner">
                            <motion.div
                                className="h-full bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-full relative overflow-hidden"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                            >
                                {/* Shimmer Effect */}
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                    animate={{
                                        x: ['-100%', '200%']
                                    }}
                                    transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                />
                            </motion.div>
                        </div>

                        {/* Progress Percentage */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-10 left-1/2 -translate-x-1/2 px-4 py-2 bg-white rounded-full shadow-lg"
                        >
                            <span className="font-black text-purple-600 text-sm">
                                {Math.round(progress)}% הושלם
                            </span>
                        </motion.div>
                    </div>
                </div>

                {/* ==================== 📖 CONTENT CARD ==================== */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentPage}
                        variants={slideInRight}
                        initial="hidden"
                        animate="visible"
                        exit={{ opacity: 0, x: -50 }}
                        className="bg-white rounded-3xl p-8 md:p-12 mb-8 shadow-2xl relative overflow-hidden"
                    >
                        {/* Decorative Background Elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full blur-3xl opacity-30 -z-0" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-100 to-cyan-100 rounded-full blur-3xl opacity-30 -z-0" />

                        <div className="relative z-10">
                            {/* Page Title */}
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-10"
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <motion.div
                                        animate={{
                                            rotate: [0, 360],
                                            scale: [1, 1.1, 1]
                                        }}
                                        transition={{
                                            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                                            scale: { duration: 2, repeat: Infinity }
                                        }}
                                        className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl"
                                    >
                                        <Book className="w-9 h-9 text-white" />
                                    </motion.div>

                                    <div className="flex-1">
                                        <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-red-600">
                                            {currentPageData.title}
                                        </h2>
                                        <div className="flex items-center gap-2 mt-2 text-gray-600">
                                            <Bookmark className="w-4 h-4" />
                                            <span className="text-sm font-medium">נושא {currentPage + 1}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-1 bg-gradient-to-r from-purple-200 via-pink-200 to-red-200 rounded-full" />
                            </motion.div>

                            {/* Content Items */}
                            <div className="space-y-8 mb-10">
                                {currentPageData.content.map((item, index) => (
                                    <div key={index}>
                                        {item.type === 'text' && (
                                            <motion.div
                                                custom={index}
                                                variants={fadeInUp}
                                                initial="hidden"
                                                animate="visible"
                                                className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 border-2 border-gray-200 shadow-sm"
                                            >
                                                <EnhancedText>{item.value}</EnhancedText>
                                            </motion.div>
                                        )}

                                        {item.type === 'example' && (
                                            <ExampleCard example={item} index={index} />
                                        )}

                                        {item.type === 'tip' && (
                                            <TipCard tip={item} index={index} />
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Quiz Section */}
                            {currentPageData.quiz && currentPageData.quiz.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="bg-gradient-to-br from-purple-50 via-pink-50 to-red-50 rounded-3xl p-8 border-4 border-purple-200 shadow-xl"
                                >
                                    {/* Quiz Header */}
                                    <div className="flex items-center gap-4 mb-8">
                                        <motion.div
                                            animate={{
                                                rotate: [0, -10, 10, -10, 0],
                                                scale: [1, 1.1, 1]
                                            }}
                                            transition={{
                                                duration: 2,
                                                repeat: Infinity,
                                                repeatDelay: 2
                                            }}
                                            className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl"
                                        >
                                            <Trophy className="w-9 h-9 text-white" />
                                        </motion.div>

                                        <div>
                                            <h3 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                                                שאלות לתרגול
                                            </h3>
                                            <p className="text-gray-600 font-medium mt-1">
                                                בדוק את ההבנה שלך! 🎯
                                            </p>
                                        </div>
                                    </div>

                                    {/* Questions */}
                                    <div className="space-y-6">
                                        {currentPageData.quiz.map((question, qIndex) => (
                                            <QuizQuestion
                                                key={qIndex}
                                                question={question}
                                                qIndex={qIndex}
                                                quizAnswers={quizAnswers}
                                                showSolution={showSolution}
                                                onAnswerSelect={handleAnswerSelect}
                                                onCheckAnswer={handleCheckAnswer}
                                            />
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* ==================== 🎮 NAVIGATION BUTTONS ==================== */}
                <div className="flex gap-4">
                    {/* Previous Button */}
                    <motion.button
                        onClick={handlePrevPage}
                        disabled={currentPage === 0}
                        whileHover={currentPage > 0 ? { scale: 1.05, x: 5 } : {}}
                        whileTap={currentPage > 0 ? { scale: 0.95 } : {}}
                        className="flex-1 flex items-center justify-center gap-3 px-8 py-5 bg-white text-purple-600 rounded-2xl font-black text-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/90 transition-all shadow-xl"
                    >
                        <ChevronRight className="w-7 h-7" />
                        עמוד קודם
                    </motion.button>

                    {/* Next / Complete Button */}
                    {!isLastPage ? (
                        <motion.button
                            onClick={handleNextPage}
                            whileHover={{ scale: 1.05, x: -5 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex-1 flex items-center justify-center gap-3 px-8 py-5 bg-white text-purple-600 rounded-2xl font-black text-xl hover:bg-white/90 transition-all shadow-xl"
                        >
                            עמוד הבא
                            <ChevronLeft className="w-7 h-7" />
                        </motion.button>
                    ) : (
                        <motion.button
                            onClick={handleComplete}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            animate={pulseGlow.animate}
                            className="flex-1 flex items-center justify-center gap-3 px-8 py-5 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white rounded-2xl font-black text-xl shadow-2xl hover:shadow-3xl transition-all relative overflow-hidden"
                        >
                            {/* Shimmer Effect */}
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                animate={{
                                    x: ['-100%', '200%']
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            />

                            <Rocket className="w-7 h-7 relative z-10" />
                            <span className="relative z-10">התחל תרגול!</span>
                            <Sparkles className="w-7 h-7 relative z-10" />
                        </motion.button>
                    )}
                </div>

                {/* ==================== ☕ ENCOURAGEMENT MESSAGE ==================== */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8 text-center"
                >
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/20 backdrop-blur-md rounded-2xl">
                        <motion.div
                            animate={{
                                rotate: [0, 10, -10, 0]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity
                            }}
                        >
                            <Heart className="w-6 h-6 text-white fill-white" />
                        </motion.div>
                        <span className="text-white font-bold text-lg">
                            {currentPage === 0 && "בואו נתחיל למידה מהנה! 🚀"}
                            {currentPage > 0 && currentPage < content.pages.length - 1 && "אתה עושה עבודה מצוינת! 💪"}
                            {currentPage === content.pages.length - 1 && "כמעט סיימת! עוד קצת! 🎉"}
                        </span>
                        <Coffee className="w-6 h-6 text-white" />
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}, (prevProps, nextProps) => {
    // ✅ Comparison function - only re-render if topic/subtopic actually changed
    const topicChanged = (prevProps.topic?.name || prevProps.topic) !== (nextProps.topic?.name || nextProps.topic);
    const subtopicChanged = (prevProps.subtopic?.name || prevProps.subtopic) !== (nextProps.subtopic?.name || nextProps.subtopic);

    return !topicChanged && !subtopicChanged;
});

AILearningArea.displayName = 'AILearningArea';

export default AILearningArea;