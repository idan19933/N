// src/components/learning/AILearningArea.jsx - ULTIMATE FIXED VERSION
import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Book, ChevronLeft, ChevronRight, XCircle, Brain,
    Lightbulb, Play, ArrowLeft, Sparkles, Trophy
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

// ✅ MODULE-LEVEL CACHE - Persists across ALL component mounts/unmounts
const CONTENT_CACHE = new Map();
const LOADING_TRACKER = new Map();

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
        toast.success('כל הכבוד! סיימת את החומר');
        if (onComplete) onComplete();
        if (onStartPractice) onStartPractice();
    }, [onComplete, onStartPractice]);

    const handleRetry = useCallback(() => {
        setError(null);
        setLoading(false);
        hasLoadedRef.current = false;
        generateContent();
    }, [generateContent]);

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-12 max-w-md text-center">
                    <motion.div
                        animate={{
                            rotate: 360,
                            scale: [1, 1.2, 1]
                        }}
                        transition={{
                            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                            scale: { duration: 1, repeat: Infinity }
                        }}
                        className="mx-auto mb-6"
                    >
                        <Brain className="w-20 h-20 text-purple-600" />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                        יוצר חומר לימוד מותאם אישית
                    </h2>
                    <p className="text-gray-600">
                        רגע, אני מכין לך את התוכן הכי מתאים...
                    </p>
                    <div className="mt-6 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
                            animate={{
                                x: ['-100%', '100%']
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        />
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-12 max-w-md text-center">
                    <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                        שגיאה בטעינת התוכן
                    </h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <div className="flex gap-4">
                        <button
                            onClick={handleRetry}
                            className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all"
                        >
                            נסה שוב
                        </button>
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all"
                            >
                                חזור
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // No content yet
    if (!content || !content.pages || content.pages.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-12 max-w-md text-center">
                    <Book className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                        אין תוכן זמין
                    </h2>
                    <p className="text-gray-600 mb-6">
                        לא הצלחנו לטעון את חומר הלימוד
                    </p>
                    <button
                        onClick={handleRetry}
                        className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all"
                    >
                        טען מחדש
                    </button>
                </div>
            </div>
        );
    }

    const currentPageData = content.pages[currentPage];
    const isLastPage = currentPage === content.pages.length - 1;
    const progress = ((currentPage + 1) / content.pages.length) * 100;

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 p-4 md:p-8" dir="rtl">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={onClose}
                        className="flex items-center gap-2 text-white hover:text-white/80 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium">חזור</span>
                    </button>

                    <div className="text-white text-center">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2">
                            {content.title}
                        </h1>
                        <p className="text-white/90">
                            עמוד {currentPage + 1} מתוך {content.pages.length}
                        </p>
                    </div>

                    <div className="w-20"></div>
                </div>

                {/* Progress Bar */}
                <div className="bg-white/20 rounded-full h-3 mb-8 overflow-hidden backdrop-blur-sm">
                    <motion.div
                        className="h-full bg-white rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>

                {/* Content Card */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentPage}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white rounded-3xl p-8 md:p-12 mb-6 shadow-2xl"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-purple-900 mb-8 flex items-center gap-3">
                            <Book className="w-8 h-8" />
                            {currentPageData.title}
                        </h2>

                        {/* Content Items */}
                        <div className="space-y-6 mb-8">
                            {currentPageData.content.map((item, index) => (
                                <div key={index}>
                                    {item.type === 'text' && (
                                        <p className="text-lg text-gray-700 leading-relaxed">
                                            {item.value}
                                        </p>
                                    )}

                                    {item.type === 'example' && (
                                        <div className="bg-blue-50 border-r-4 border-blue-500 rounded-lg p-6">
                                            <div className="font-bold text-blue-700 mb-2 flex items-center gap-2">
                                                <Lightbulb className="w-5 h-5" />
                                                דוגמה:
                                            </div>
                                            <div className="text-gray-800 font-medium text-lg mb-3">
                                                {item.value}
                                            </div>
                                            {item.solution && (
                                                <div className="text-gray-700 mt-3 pt-3 border-t border-blue-200">
                                                    <strong>פתרון:</strong> {item.solution}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {item.type === 'tip' && (
                                        <div className="bg-yellow-50 border-r-4 border-yellow-500 rounded-lg p-4 flex items-start gap-3">
                                            <Sparkles className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-1" />
                                            <p className="text-gray-800">{item.value}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Quiz */}
                        {currentPageData.quiz && currentPageData.quiz.length > 0 && (
                            <div className="bg-purple-50 rounded-2xl p-6">
                                <h3 className="text-2xl font-bold text-purple-900 mb-4 flex items-center gap-2">
                                    <Trophy className="w-6 h-6" />
                                    שאלות לתרגול
                                </h3>

                                <div className="space-y-6">
                                    {currentPageData.quiz.map((question, qIndex) => (
                                        <div key={qIndex} className="bg-white rounded-xl p-5">
                                            <p className="text-lg font-bold text-gray-900 mb-4">
                                                {question.question}
                                            </p>

                                            <div className="space-y-2 mb-4">
                                                {question.options.map((option, oIndex) => {
                                                    const isSelected = quizAnswers[qIndex] === oIndex;
                                                    const isCorrect = question.correctAnswer === oIndex;
                                                    const showAnswer = showSolution[qIndex];

                                                    return (
                                                        <button
                                                            key={oIndex}
                                                            onClick={() => handleAnswerSelect(qIndex, oIndex)}
                                                            disabled={showAnswer}
                                                            className={`w-full text-right p-4 rounded-lg font-medium transition-all ${
                                                                showAnswer
                                                                    ? isCorrect
                                                                        ? 'bg-green-100 border-2 border-green-500 text-green-800'
                                                                        : isSelected
                                                                            ? 'bg-red-100 border-2 border-red-500 text-red-800'
                                                                            : 'bg-gray-100 text-gray-500'
                                                                    : isSelected
                                                                        ? 'bg-purple-100 border-2 border-purple-500 text-purple-900'
                                                                        : 'bg-gray-50 border-2 border-gray-200 hover:border-purple-300 text-gray-700'
                                                            }`}
                                                        >
                                                            {option}
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {quizAnswers[qIndex] !== undefined && !showSolution[qIndex] && (
                                                <button
                                                    onClick={() => handleCheckAnswer(qIndex)}
                                                    className="px-6 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-all"
                                                >
                                                    בדוק תשובה
                                                </button>
                                            )}

                                            {showSolution[qIndex] && (
                                                <div
                                                    className={`mt-4 p-4 rounded-lg ${
                                                        quizAnswers[qIndex] === question.correctAnswer
                                                            ? 'bg-green-50 border-2 border-green-500'
                                                            : 'bg-red-50 border-2 border-red-500'
                                                    }`}
                                                >
                                                    <p className="font-bold mb-2">
                                                        {quizAnswers[qIndex] === question.correctAnswer
                                                            ? '✅ נכון!'
                                                            : '❌ לא נכון'}
                                                    </p>
                                                    <p className="text-gray-700">{question.explanation}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex gap-4">
                    <button
                        onClick={handlePrevPage}
                        disabled={currentPage === 0}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white text-purple-600 rounded-2xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/90 transition-all"
                    >
                        <ChevronRight className="w-5 h-5" />
                        עמוד קודם
                    </button>

                    {!isLastPage ? (
                        <button
                            onClick={handleNextPage}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white text-purple-600 rounded-2xl font-bold hover:bg-white/90 transition-all"
                        >
                            עמוד הבא
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                    ) : (
                        <button
                            onClick={handleComplete}
                            className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-bold hover:shadow-xl transition-all"
                        >
                            <Play className="w-5 h-5" />
                            התחל תרגול!
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}, (prevProps, nextProps) => {
    // ✅ Comparison function - only re-render if topic/subtopic actually changed
    const topicChanged = (prevProps.topic?.name || prevProps.topic) !== (nextProps.topic?.name || nextProps.topic);
    const subtopicChanged = (prevProps.subtopic?.name || prevProps.subtopic) !== (nextProps.subtopic?.name || nextProps.subtopic);

    return !topicChanged && !subtopicChanged;
});

AILearningArea.displayName = 'AILearningArea';

export default AILearningArea;