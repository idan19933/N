// src/pages/GradeLevelPractice.jsx - חלק 1
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Brain, Check, X, Zap, Lightbulb, RefreshCw,
    Sparkles, Award, Loader, Grid
} from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import { getAllGrades, getTopicsForGrade } from '../config/gradeLevelsConfig';
import { questionDB } from '../services/questionDatabaseService';
import { smartVerification } from '../services/smartAnswerVerification';

const GradeLevelPractice = () => {
    const user = useAuthStore(state => state.user);

    // State
    const [selectedGrade, setSelectedGrade] = useState(null);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [showResult, setShowResult] = useState(false);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [useAI, setUseAI] = useState(false);
    const [score, setScore] = useState({ correct: 0, total: 0, streak: 0 });
    const [showHint, setShowHint] = useState(false);
    const [currentHintIndex, setCurrentHintIndex] = useState(0);

    const inputRef = useRef(null);

    // טען שאלה
    const loadNewQuestion = async () => {
        if (!selectedGrade || !selectedTopic) return;

        try {
            setLoading(true);
            setShowResult(false);
            setResult(null);
            setUserAnswer('');
            setShowHint(false);
            setCurrentHintIndex(0);

            const question = await questionDB.getQuestion(selectedGrade, selectedTopic, useAI);
            setCurrentQuestion(question);
            setTimeout(() => inputRef.current?.focus(), 100);

        } catch (error) {
            console.error('Error loading question:', error);
            toast.error('שגיאה בטעינת שאלה');
        } finally {
            setLoading(false);
        }
    };

    // ✅ בדיקת תשובה עם האימות החכם
    const checkAnswer = () => {
        if (!userAnswer.trim()) {
            toast.error('נא להזין תשובה');
            return;
        }

        // ✅ אימות חכם - מתקן את הבעיה!
        const verification = smartVerification.verifyAnswer(userAnswer, currentQuestion.answer);

        console.log('🔍 Verification Result:', verification);

        setResult(verification);
        setShowResult(true);

        if (verification.isCorrect) {
            setScore(prev => ({
                correct: prev.correct + 1,
                total: prev.total + 1,
                streak: prev.streak + 1
            }));
            toast.success('🎉 מעולה!');
            setTimeout(() => loadNewQuestion(), 2000);
        } else {
            setScore(prev => ({
                ...prev,
                total: prev.total + 1,
                streak: 0
            }));
            toast.error('נסה שוב');
        }
    };

    // הצג רמז
    const showNextHint = () => {
        if (!currentQuestion?.hints || currentHintIndex >= currentQuestion.hints.length) {
            toast('אין רמזים נוספים', { icon: '💡' });
            return;
        }
        setShowHint(true);
        setCurrentHintIndex(prev => prev + 1);
    };

    // מקלדת מתמטית
    const mathKeyboard = [
        ['7', '8', '9', '÷'],
        ['4', '5', '6', '×'],
        ['1', '2', '3', '-'],
        ['0', '.', '=', '+']
    ];

    const insertSymbol = (symbol) => {
        if (symbol === '=') {
            checkAnswer();
        } else {
            setUserAnswer(prev => prev + symbol);
            inputRef.current?.focus();
        }
    };
    if (!selectedGrade) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 p-8" dir="rtl">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-4"
                        >
                            <Sparkles className="w-12 h-12 text-white" />
                        </motion.div>
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                            בחר את הכיתה שלך
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            תרגילים מותאמים לרמה שלך
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {getAllGrades().map(grade => (
                            <motion.button
                                key={grade.id}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedGrade(grade)}
                                className="p-6 bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 transition shadow-lg"
                            >
                                <div className="text-6xl mb-3">{grade.emoji}</div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {grade.name}
                                </h3>
                            </motion.button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // ========== תצוגת בחירת נושא ==========
    if (!selectedTopic) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 p-8" dir="rtl">
                <div className="max-w-6xl mx-auto">
                    <button
                        onClick={() => setSelectedGrade(null)}
                        className="mb-6 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 transition"
                    >
                        ← חזור לבחירת כיתה
                    </button>

                    <div className="text-center mb-12">
                        <div className="text-6xl mb-4">{selectedGrade.emoji}</div>
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                            {selectedGrade.name}
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            בחר נושא לתרגול
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {getTopicsForGrade(selectedGrade.id).map(topic => (
                            <motion.button
                                key={topic.id}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    setSelectedTopic(topic);
                                    setTimeout(() => loadNewQuestion(), 100);
                                }}
                                className="p-6 bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 transition shadow-lg"
                            >
                                <div className="text-6xl mb-3">{topic.icon}</div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {topic.name}
                                </h3>
                            </motion.button>
                        ))}
                    </div>

                    {/* כפתור AI */}
                    <div className="mt-8 text-center">
                        <label className="inline-flex items-center gap-3 bg-white dark:bg-gray-800 px-6 py-3 rounded-xl shadow-lg cursor-pointer">
                            <input
                                type="checkbox"
                                checked={useAI}
                                onChange={(e) => setUseAI(e.target.checked)}
                                className="w-5 h-5"
                            />
                            <Brain className="w-5 h-5 text-purple-500" />
                            <span className="text-gray-900 dark:text-white font-medium">
                                השתמש ב-AI לשאלות מילוליות
                            </span>
                        </label>
                    </div>
                </div>
            </div>
        );
    }

    // ========== מסך טעינה ==========
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
                <div className="text-center">
                    <Loader className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">טוען שאלה...</p>
                </div>
            </div>
        );
    }

    if (!currentQuestion) return null;

    // ========== מסך תרגול ==========
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8" dir="rtl">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-6 md:p-10 space-y-6">

                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="text-3xl">{selectedTopic.icon}</div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {selectedTopic.name}
                                </h2>
                                <p className="text-sm text-gray-500">{selectedGrade.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-purple-600">
                                    {score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0}%
                                </div>
                                <div className="text-xs text-gray-500">דיוק</div>
                            </div>
                            {score.streak > 0 && (
                                <div className="text-2xl">🔥 {score.streak}</div>
                            )}
                            <button
                                onClick={() => {
                                    setSelectedTopic(null);
                                    setCurrentQuestion(null);
                                }}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                            >
                                <Grid className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Question */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 text-center">
                        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            {currentQuestion.question}
                        </div>
                        {currentQuestion.context && (
                            <div className="text-sm text-gray-500">
                                {currentQuestion.context}
                            </div>
                        )}
                    </div>

                    {/* Answer Input */}
                    <div className="space-y-4">
                        <input
                            ref={inputRef}
                            type="text"
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
                            placeholder="הזן תשובה..."
                            disabled={showResult && result?.isCorrect}
                            className="w-full px-6 py-4 text-2xl text-center bg-white dark:bg-gray-800 border-3 border-gray-300 dark:border-gray-600 focus:border-purple-500 rounded-2xl focus:outline-none transition font-mono"
                        />

                        {/* Result */}
                        {showResult && result && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`p-6 rounded-2xl border-3 ${
                                    result.isCorrect
                                        ? 'bg-green-50 border-green-500 dark:bg-green-900/20'
                                        : 'bg-red-50 border-red-500 dark:bg-red-900/20'
                                }`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                        result.isCorrect ? 'bg-green-500' : 'bg-red-500'
                                    }`}>
                                        {result.isCorrect ?
                                            <Check className="w-8 h-8 text-white" /> :
                                            <X className="w-8 h-8 text-white" />
                                        }
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                                            {result.message}
                                        </h4>
                                        {result.hint && (
                                            <p className="text-gray-700 dark:text-gray-300">
                                                {result.hint}
                                            </p>
                                        )}
                                        {result.note && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                                {result.note}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Hint */}
                        {showHint && currentQuestion.hints && currentQuestion.hints[currentHintIndex - 1] && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-300 rounded-xl"
                            >
                                <div className="flex items-start gap-3">
                                    <Lightbulb className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <div className="font-bold text-yellow-900 dark:text-yellow-300 mb-1">
                                            רמז:
                                        </div>
                                        <div className="text-yellow-800 dark:text-yellow-200">
                                            {currentQuestion.hints[currentHintIndex - 1]}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Math Keyboard */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
                        <div className="grid grid-cols-4 gap-2">
                            {mathKeyboard.flat().map((key, i) => (
                                <button
                                    key={i}
                                    onClick={() => insertSymbol(key)}
                                    className={`p-4 rounded-xl font-bold text-xl transition ${
                                        key === '='
                                            ? 'bg-purple-600 text-white hover:bg-purple-700'
                                            : 'bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 hover:border-purple-500'
                                    }`}
                                >
                                    {key}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={checkAnswer}
                            disabled={!userAnswer.trim() || (showResult && result?.isCorrect)}
                            className="px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl transition"
                        >
                            <Zap className="w-5 h-5" />
                            בדוק תשובה
                        </button>

                        <button
                            onClick={showNextHint}
                            className="px-6 py-4 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-yellow-200 transition"
                        >
                            <Lightbulb className="w-5 h-5" />
                            רמז
                        </button>
                    </div>

                    <button
                        onClick={loadNewQuestion}
                        className="w-full px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-gray-300 transition"
                    >
                        <RefreshCw className="w-5 h-5" />
                        שאלה חדשה
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GradeLevelPractice;

