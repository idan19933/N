// src/components/ai/AILearningArea.jsx - FINAL FIX (Handles React 18 Strict Mode)
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen, ChevronRight, ChevronLeft, Sparkles, Brain, CheckCircle2,
    Lightbulb, Target, Play, Loader2, Award, Zap, ArrowLeft
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

// ✅ PERSIST ACROSS REMOUNTS (React 18 Strict Mode fix)
const generatedTopics = new Map();

const AILearningArea = ({ topic, subtopic, onComplete, onStartPractice, personality = 'nexon' }) => {
    const { user, nexonProfile } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [learningContent, setLearningContent] = useState(null);
    const [completedPages, setCompletedPages] = useState(new Set());
    const [quizAnswers, setQuizAnswers] = useState({});

    // Create unique key for this topic/subtopic
    const topicKey = `${topic?.id || topic?.name || 'unknown'}-${subtopic?.id || subtopic?.name || 'none'}`;

    useEffect(() => {
        console.log('🔍 AILearningArea mounted:', {
            topicKey,
            alreadyGenerated: generatedTopics.has(topicKey),
            cachedContent: generatedTopics.get(topicKey) ? 'YES' : 'NO'
        });

        // Check if we already generated for this topic
        const cachedContent = generatedTopics.get(topicKey);

        if (cachedContent) {
            console.log('✅ Using cached content (no API call)');
            setLearningContent(cachedContent);
            setLoading(false);
        } else {
            console.log('✅ Generating new content (first time)');
            generateLearningContent();
        }

        // No cleanup needed - we want to persist!
    }, [topicKey]);

    const generateLearningContent = async () => {
        try {
            setLoading(true);
            console.log('🎓 API Call: Generating learning content for:', topicKey);

            const response = await axios.post(`${API_URL}/api/learning/generate-content`, {
                topic: topic?.name || topic,
                subtopic: subtopic?.name || subtopic || null,
                topicId: topic?.id,
                subtopicId: subtopic?.id,
                grade: nexonProfile?.grade || user?.grade || '8',
                personality: nexonProfile?.personality || personality,
                userId: user?.uid
            });

            console.log('✅ API Response received');

            if (response.data?.content) {
                const content = response.data.content;
                setLearningContent(content);

                // ✅ Cache for future remounts
                generatedTopics.set(topicKey, content);
                console.log('💾 Content cached for:', topicKey);
            } else {
                throw new Error('No content received from server');
            }

            setLoading(false);
        } catch (error) {
            console.error('❌ Error generating learning content:', error);
            toast.error('שגיאה ביצירת תוכן הלימוד');
            setLoading(false);
        }
    };

    const handleNextPage = () => {
        setCompletedPages(prev => new Set([...prev, currentPage]));
        if (currentPage < learningContent.pages.length - 1) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 0) {
            setCurrentPage(prev => prev - 1);
        }
    };

    const handleQuizAnswer = (questionIndex, answer) => {
        setQuizAnswers(prev => ({
            ...prev,
            [currentPage]: {
                ...prev[currentPage],
                [questionIndex]: answer
            }
        }));
    };

    const checkQuizAnswers = () => {
        const currentQuiz = learningContent.pages[currentPage].quiz;
        const currentAnswers = quizAnswers[currentPage] || {};

        let correct = 0;
        currentQuiz.forEach((q, idx) => {
            if (currentAnswers[idx] === q.correctAnswer) {
                correct++;
            }
        });

        const percentage = (correct / currentQuiz.length) * 100;

        if (percentage >= 70) {
            toast.success(`מצוין! ${correct}/${currentQuiz.length} תשובות נכונות! 🎉`);
            handleNextPage();
        } else {
            toast.error(`צריך לשפר... ${correct}/${currentQuiz.length} תשובות נכונות. נסה שוב! 💪`);
        }
    };

    const handleStartPractice = () => {
        console.log('🚀 Starting practice from learning area');
        if (onStartPractice) {
            onStartPractice();
        } else {
            console.error('❌ onStartPractice callback not provided');
            toast.error('שגיאה במעבר לתרגול');
        }
    };

    const handleRetry = () => {
        console.log('🔄 Retrying - clearing cache for:', topicKey);
        generatedTopics.delete(topicKey);
        generateLearningContent();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center" dir="rtl">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full text-center"
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="inline-block mb-6"
                    >
                        <Brain className="w-20 h-20 text-purple-600" />
                    </motion.div>
                    <h2 className="text-3xl font-black text-gray-800 mb-4">
                        נקסון מכין עבורך תוכן לימוד...
                    </h2>
                    <p className="text-gray-600 text-lg">
                        יוצר חומר לימוד ייעודי עבור {subtopic?.name || topic?.name || topic}
                    </p>
                    <div className="mt-6 flex items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
                        <span className="text-purple-600 font-bold">טוען...</span>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (!learningContent || !learningContent.pages) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center" dir="rtl">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full text-center"
                >
                    <div className="text-6xl mb-6">😞</div>
                    <h2 className="text-3xl font-black text-gray-800 mb-4">
                        אופס! משהו השתבש
                    </h2>
                    <p className="text-gray-600 text-lg mb-6">
                        לא הצלחנו ליצור תוכן לימוד כרגע
                    </p>
                    <button
                        onClick={handleRetry}
                        className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                    >
                        נסה שוב
                    </button>
                </motion.div>
            </div>
        );
    }

    const currentPageContent = learningContent.pages[currentPage];
    const isLastPage = currentPage === learningContent.pages.length - 1;

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-4" dir="rtl">
            <div className="max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/10 backdrop-blur-md rounded-2xl p-4 mb-6 flex items-center justify-between"
                >
                    <div className="flex items-center gap-3">
                        <BookOpen className="w-8 h-8 text-white" />
                        <div>
                            <h1 className="text-2xl font-black text-white">
                                {learningContent.title || `לימוד: ${topic?.name || topic}`}
                            </h1>
                            <p className="text-white/80 text-sm font-semibold">
                                {subtopic?.name || 'חומר לימוד'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl">
                        <Target className="w-5 h-5 text-white" />
                        <span className="text-white font-bold">
                            {currentPage + 1} מתוך {learningContent.pages.length}
                        </span>
                    </div>
                </motion.div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentPage}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="bg-white rounded-3xl shadow-2xl overflow-hidden"
                    >
                        <div className="p-8 max-h-[70vh] overflow-y-auto">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-8"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl">
                                        <Sparkles className="w-6 h-6 text-white" />
                                    </div>
                                    <h2 className="text-3xl font-black text-gray-800">
                                        {currentPageContent.title}
                                    </h2>
                                </div>
                            </motion.div>

                            <div className="space-y-6 mb-8">
                                {currentPageContent.content && Array.isArray(currentPageContent.content) && currentPageContent.content.map((section, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6"
                                    >
                                        {section.type === 'text' && (
                                            <div className="prose prose-lg max-w-none">
                                                <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
                                                    {section.data}
                                                </p>
                                            </div>
                                        )}

                                        {section.type === 'example' && (
                                            <div className="border-r-4 border-purple-600 pr-6">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Lightbulb className="w-6 h-6 text-purple-600" />
                                                    <span className="text-xl font-black text-purple-600">דוגמה:</span>
                                                </div>
                                                <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
                                                    {section.data}
                                                </p>
                                            </div>
                                        )}

                                        {section.type === 'tip' && (
                                            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-5">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Target className="w-5 h-5 text-yellow-600" />
                                                    <span className="text-lg font-black text-yellow-600">טיפ:</span>
                                                </div>
                                                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                                    {section.data}
                                                </p>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>

                            {currentPageContent.quiz && currentPageContent.quiz.length > 0 && (
                                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 mb-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-3 bg-purple-600 rounded-2xl">
                                            <Brain className="w-6 h-6 text-white" />
                                        </div>
                                        <h3 className="text-2xl font-black text-gray-800">
                                            בדיקת הבנה מהירה
                                        </h3>
                                    </div>

                                    <div className="space-y-6">
                                        {currentPageContent.quiz.map((question, qIdx) => (
                                            <motion.div
                                                key={qIdx}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: qIdx * 0.1 }}
                                                className="bg-white rounded-xl p-6 shadow-lg"
                                            >
                                                <p className="text-lg font-bold text-gray-800 mb-4">
                                                    {qIdx + 1}. {question.question}
                                                </p>
                                                <div className="space-y-3">
                                                    {question.options && question.options.map((option, oIdx) => {
                                                        const isSelected = quizAnswers[currentPage]?.[qIdx] === oIdx;
                                                        return (
                                                            <button
                                                                key={oIdx}
                                                                onClick={() => handleQuizAnswer(qIdx, oIdx)}
                                                                className={`w-full text-right px-6 py-4 rounded-xl font-bold transition-all ${
                                                                    isSelected
                                                                        ? 'bg-purple-600 text-white shadow-lg transform scale-105'
                                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                                }`}
                                                            >
                                                                {option}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={checkQuizAnswers}
                                        disabled={!quizAnswers[currentPage] || Object.keys(quizAnswers[currentPage]).length < currentPageContent.quiz.length}
                                        className="w-full mt-6 px-8 py-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-black text-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            <CheckCircle2 className="w-6 h-6" />
                                            <span>בדוק תשובות</span>
                                        </div>
                                    </motion.button>
                                </div>
                            )}
                        </div>

                        <div className="bg-gray-50 px-8 py-6 flex items-center justify-between">
                            <button
                                onClick={handlePrevPage}
                                disabled={currentPage === 0}
                                className="flex items-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-xl font-bold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <ChevronRight className="w-5 h-5" />
                                <span>דף קודם</span>
                            </button>

                            <div className="flex items-center gap-2">
                                {learningContent.pages.map((_, idx) => (
                                    <div
                                        key={idx}
                                        className={`w-3 h-3 rounded-full transition-all ${
                                            idx === currentPage
                                                ? 'bg-purple-600 w-8'
                                                : completedPages.has(idx)
                                                    ? 'bg-green-500'
                                                    : 'bg-gray-300'
                                        }`}
                                    />
                                ))}
                            </div>

                            {!isLastPage ? (
                                <button
                                    onClick={handleNextPage}
                                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                                >
                                    <span>דף הבא</span>
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                            ) : (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleStartPractice}
                                    className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-black text-lg hover:shadow-2xl transition-all"
                                >
                                    <Zap className="w-6 h-6" />
                                    <span>התחל תרגול!</span>
                                    <Play className="w-6 h-6" />
                                </motion.button>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>

                {completedPages.size === learningContent.pages.length && isLastPage && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl p-8 text-center shadow-2xl"
                    >
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <Award className="w-20 h-20 text-white mx-auto mb-4" />
                        </motion.div>
                        <h2 className="text-4xl font-black text-white mb-3">
                            כל הכבוד! סיימת את חומר הלימוד! 🎉
                        </h2>
                        <p className="text-2xl text-white/90 mb-6">
                            עכשיו זה הזמן לתרגל ולבדוק את עצמך!
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleStartPractice}
                            className="px-12 py-5 bg-white text-green-600 rounded-2xl font-black text-xl shadow-2xl hover:shadow-white/50 transition-all inline-flex items-center gap-3"
                        >
                            <Play className="w-7 h-7" />
                            <span>התחל תרגול עכשיו!</span>
                        </motion.button>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default AILearningArea;