// src/components/ai/AILearningArea.jsx - FIXED BUTTON
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpen, ChevronRight, ChevronLeft, Sparkles, Brain, CheckCircle2,
    Lightbulb, Target, Play, Loader2, Award, Zap, ArrowLeft
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

const AILearningArea = ({ topic, subtopic, onComplete, onStartPractice, personality = 'nexon' }) => {
    const { user, nexonProfile } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [learningContent, setLearningContent] = useState(null);
    const [completedPages, setCompletedPages] = useState(new Set());
    const [quizAnswers, setQuizAnswers] = useState({});

    useEffect(() => {
        generateLearningContent();
    }, [topic, subtopic]);

    const generateLearningContent = async () => {
        try {
            setLoading(true);
            console.log('🎓 Generating learning content for:', { topic, subtopic });

            const response = await axios.post(`${API_URL}/api/learning/generate-content`, {
                topic: topic?.name || topic,
                subtopic: subtopic?.name || subtopic || null,
                topicId: topic?.id,
                subtopicId: subtopic?.id,
                grade: nexonProfile?.grade || user?.grade || '8',
                personality: nexonProfile?.personality || personality,
                userId: user?.uid
            });

            console.log('✅ Learning content generated:', response.data);
            setLearningContent(response.data.content);
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
                        onClick={generateLearningContent}
                        className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                    >
                        נסה שוב
                    </button>
                </motion.div>
            </div>
        );
    }

    const currentPageContent = learningContent.pages[currentPage];
    const progress = ((currentPage + 1) / learningContent.pages.length) * 100;
    const isLastPage = currentPage === learningContent.pages.length - 1;

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 py-8 px-4" dir="rtl">
            <div className="max-w-6xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 mb-6 shadow-2xl"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-white/20 rounded-2xl">
                                <BookOpen className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-white">
                                    {learningContent.title}
                                </h1>
                                <p className="text-white/90 text-lg">
                                    {subtopic?.name || topic?.name || 'תוכן כללי'}
                                </p>
                            </div>
                        </div>
                        <div className="text-left">
                            <div className="text-4xl font-black text-white">
                                {currentPage + 1}/{learningContent.pages.length}
                            </div>
                            <div className="text-white/80 text-sm">דפים</div>
                        </div>
                    </div>

                    <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5 }}
                            className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                        />
                    </div>
                </motion.div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentPage}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white rounded-3xl shadow-2xl overflow-hidden"
                    >
                        <div className="p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-purple-100 rounded-2xl">
                                    <Sparkles className="w-6 h-6 text-purple-600" />
                                </div>
                                <h2 className="text-3xl font-black text-gray-800">
                                    {currentPageContent.title}
                                </h2>
                            </div>

                            <div className="prose prose-lg max-w-none mb-8">
                                {currentPageContent.content.map((section, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="mb-6"
                                    >
                                        {section.type === 'text' && (
                                            <p className="text-gray-700 text-xl leading-relaxed">
                                                {section.value}
                                            </p>
                                        )}
                                        {section.type === 'example' && (
                                            <div className="bg-blue-50 border-r-4 border-blue-500 rounded-xl p-6 my-4">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Lightbulb className="w-6 h-6 text-blue-600" />
                                                    <h3 className="text-xl font-bold text-blue-900">דוגמה</h3>
                                                </div>
                                                <p className="text-gray-800 text-lg leading-relaxed">
                                                    {section.value}
                                                </p>
                                                {section.solution && (
                                                    <div className="mt-4 pt-4 border-t border-blue-200">
                                                        <p className="text-sm font-bold text-blue-700 mb-2">פתרון:</p>
                                                        <p className="text-gray-700">{section.solution}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        {section.type === 'tip' && (
                                            <div className="bg-yellow-50 border-r-4 border-yellow-500 rounded-xl p-6 my-4">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Target className="w-6 h-6 text-yellow-600" />
                                                    <h3 className="text-xl font-bold text-yellow-900">טיפ חשוב</h3>
                                                </div>
                                                <p className="text-gray-800 text-lg">
                                                    {section.value}
                                                </p>
                                            </div>
                                        )}
                                        {section.type === 'formula' && (
                                            <div className="bg-purple-50 border-2 border-purple-300 rounded-xl p-6 my-4 text-center">
                                                <div className="text-3xl font-black text-purple-900 mb-2">
                                                    {section.value}
                                                </div>
                                                {section.description && (
                                                    <p className="text-gray-600 text-sm">{section.description}</p>
                                                )}
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
                                                    {question.options.map((option, oIdx) => {
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