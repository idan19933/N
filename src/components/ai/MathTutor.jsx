// src/components/ai/MathTutor.jsx - COMPLETE WITH FIXES
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Check, RefreshCw, Loader, Zap, Lightbulb, X, Sparkles, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../../store/authStore';
import { getAllGrades, getTopicsForGrade } from '../../config/gradeLevelsConfig';
import { questionDB } from '../../services/questionDatabaseService';
import { smartVerification } from '../../services/smartAnswerVerification';
import { aiVerification } from '../../services/aiAnswerVerification';
import AIChatAssistant from './AIChatAssistant';

const MathTutor = () => {
    const user = useAuthStore(state => state.user);
    const nexonProfile = useAuthStore(state => state.nexonProfile);
    const studentName = nexonProfile?.name || 'תלמיד';

    // State
    const [selectedGrade, setSelectedGrade] = useState(null);
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [steps, setSteps] = useState([{ value: '', feedback: null, isCorrect: false }]);
    const [activeStepIndex, setActiveStepIndex] = useState(0);
    const [showFinalResult, setShowFinalResult] = useState(false);
    const [finalResult, setFinalResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [useAI, setUseAI] = useState(false);
    const [score, setScore] = useState({ correct: 0, total: 0, streak: 0 });
    const [currentHintIndex, setCurrentHintIndex] = useState(0);
    const [showHint, setShowHint] = useState(false);
    const [liveCompliment, setLiveCompliment] = useState(null);
    const [showChat, setShowChat] = useState(false);
    const [chatContext, setChatContext] = useState(null);

    const inputRefs = useRef([]);
    const feedbackTimeout = useRef(null);

    const compliments = {
        typing: ['כיוון טוב!', 'ממשיך מצוין!', 'אתה בדרך!'],
        progress: ['מתקדם יפה!', 'יש לך את זה!', 'כיוון נכון!', 'עוד קצת!'],
        almost: ['כמעט שם!', 'קרוב מאוד!', 'עוד צעד קטן!', 'כמעט מושלם!'],
        correct: ['מעולה!', 'פצצה!', '🎉 מושלם!', 'גאון!', 'יפה מאוד!', 'כל הכבוד!'],
        final_correct: [
            `🎉 מדהים ${studentName}!`,
            `💪 חזק ${studentName}!`,
            `⭐ כוכב ${studentName}!`,
            `🏆 אלוף ${studentName}!`,
            `🔥 שרוף ${studentName}!`
        ],
        streak: ['🔥 רצף מטורף!', '⚡ לא עוצר!', '🚀 טס גבוה!', '💯 פרפקט!']
    };

    useEffect(() => {
        if (currentQuestion) {
            const context = {
                question: currentQuestion.question,
                answer: currentQuestion.answer,
                hints: currentQuestion.hints,
                steps: currentQuestion.steps,
                context: currentQuestion.context,
                currentSteps: steps.map(s => s.value).filter(v => v.trim()),
                topic: selectedTopic?.name,
                grade: selectedGrade?.name,
                studentName: studentName
            };
            setChatContext(context);
        }
    }, [currentQuestion, steps, selectedGrade, selectedTopic, studentName]);

    const loadNewQuestion = async () => {
        if (!selectedGrade || !selectedTopic) return;

        try {
            setLoading(true);
            setShowFinalResult(false);
            setFinalResult(null);
            setSteps([{ value: '', feedback: null, isCorrect: false }]);
            setActiveStepIndex(0);
            setCurrentHintIndex(0);
            setShowHint(false);
            setLiveCompliment(null);

            const question = await questionDB.getQuestion(selectedGrade, selectedTopic, useAI);
            setCurrentQuestion(question);
            setTimeout(() => inputRefs.current[0]?.focus(), 100);

        } catch (error) {
            console.error('❌ Error loading question:', error);
            toast.error('שגיאה בטעינת שאלה');
            setCurrentQuestion({
                question: '5 + 3 = ?',
                answer: '8',
                hints: ['חבר 5 ו-3'],
                steps: ['5 + 3', '= 8']
            });
        } finally {
            setLoading(false);
        }
    };

    const provideLiveFeedback = (value, stepIndex) => {
        if (!value.trim() || !currentQuestion) return;

        if (feedbackTimeout.current) {
            clearTimeout(feedbackTimeout.current);
        }

        feedbackTimeout.current = setTimeout(async () => {
            try {
                const isFinalAnswer = stepIndex === steps.length - 1;

                if (isFinalAnswer) {
                    const verification = smartVerification.verifyAnswer(value, currentQuestion.answer);
                    const newSteps = [...steps];

                    // ⚠️ אל תציג מחמאות חזקות - רק feedback עדין
                    if (verification.confidence > 70) {
                        newSteps[stepIndex].feedback = {
                            message: 'ממשיך...',
                            type: 'progress',
                            emoji: '✏️'
                        };
                    } else if (verification.confidence > 40) {
                        newSteps[stepIndex].feedback = {
                            message: 'כותב...',
                            type: 'info',
                            emoji: '💭'
                        };
                    }

                    setSteps(newSteps);
                    // ❌ לא מציג liveCompliment כאן!
                }
            } catch (error) {
                console.error('Feedback error:', error);
            }
        }, 800);
    };

    const handleStepChange = (index, value) => {
        const newSteps = [...steps];
        newSteps[index].value = value;
        newSteps[index].feedback = null;
        setSteps(newSteps);
        provideLiveFeedback(value, index);
    };

    const addStep = () => {
        const newSteps = [...steps, { value: '', feedback: null, isCorrect: false }];
        setSteps(newSteps);
        setActiveStepIndex(newSteps.length - 1);
        setTimeout(() => inputRefs.current[newSteps.length - 1]?.focus(), 100);
    };

    const removeStep = (index) => {
        if (steps.length <= 1) return;
        const newSteps = steps.filter((_, i) => i !== index);
        setSteps(newSteps);
        if (activeStepIndex >= newSteps.length) {
            setActiveStepIndex(newSteps.length - 1);
        }
    };

    const checkAnswer = async () => {
        let finalAnswer = '';
        for (let i = steps.length - 1; i >= 0; i--) {
            if (steps[i].value.trim()) {
                finalAnswer = steps[i].value.trim();
                break;
            }
        }

        if (!finalAnswer) {
            toast.error('נא להזין תשובה');
            return;
        }

        // ✅ נקה מחמאות קודמות לפני בדיקה
        setLiveCompliment(null);

        toast.loading('בודק תשובה עם AI...', { id: 'checking' });

        try {
            const verification = await aiVerification.verifyWithFallback(
                finalAnswer,
                currentQuestion.answer,
                currentQuestion.question,
                smartVerification,
                {
                    studentName,
                    grade: selectedGrade?.name,
                    topic: selectedTopic?.name
                }
            );

            toast.dismiss('checking');
            const isCorrect = verification.isCorrect;

            console.log('🎯 Verification result:', {
                isCorrect,
                confidence: verification.confidence,
                userAnswer: finalAnswer,
                expectedAnswer: currentQuestion.answer
            });

            setFinalResult({
                isCorrect,
                message: isCorrect ? getRandomItem(compliments.final_correct) : '❌ לא נכון, אבל תנסה שוב!',
                userAnswer: finalAnswer,
                correctAnswer: currentQuestion.answer,
                explanation: verification.mathematicalReasoning || verification.explanation || (currentQuestion.steps ? currentQuestion.steps.join(' → ') : null),
                note: verification.note,
                usedAI: verification.usedAI,
                aiConfidence: verification.confidence
            });

            setShowFinalResult(true);

            const newScore = {
                correct: score.correct + (isCorrect ? 1 : 0),
                total: score.total + 1,
                streak: isCorrect ? score.streak + 1 : 0
            };
            setScore(newScore);

            if (isCorrect) {
                // ✅ רק אם נכון - הצג מחמאה ועבור הלאה
                if (newScore.streak >= 3) {
                    setTimeout(() => {
                        toast.success(getRandomItem(compliments.streak), {
                            icon: '🔥',
                            duration: 3000
                        });
                    }, 500);
                } else {
                    toast.success(getRandomItem(compliments.correct));
                }
                setTimeout(() => loadNewQuestion(), 2500);
            } else {
                // ❌ אם לא נכון - אל תעבור הלאה!
                toast.error('נסה שוב! אתה יכול!');
                // לא קורא ל-loadNewQuestion()
            }

        } catch (error) {
            toast.dismiss('checking');
            toast.error('שגיאה בבדיקת התשובה');
            console.error('Check answer error:', error);
        }
    };

    const showNextHint = () => {
        if (!currentQuestion?.hints || currentHintIndex >= currentQuestion.hints.length) {
            toast('כבר הראיתי את כל הרמזים! נסה לפתור בעצמך 💪', { icon: '💡' });
            return;
        }
        setShowHint(true);
        setCurrentHintIndex(prev => prev + 1);
        setTimeout(() => setShowHint(false), 6000);
    };

    const getRandomItem = (array) => {
        return array[Math.floor(Math.random() * array.length)];
    };

    const mathKeyboard = [
        ['7', '8', '9', '÷', '←'],
        ['4', '5', '6', '×', '('],
        ['1', '2', '3', '-', ')'],
        ['0', '.', '=', '+', '/']
    ];

    const insertSymbol = (symbol) => {
        if (symbol === '=') {
            checkAnswer();
        } else if (symbol === '←') {
            const currentValue = steps[activeStepIndex]?.value || '';
            handleStepChange(activeStepIndex, currentValue.slice(0, -1));
        } else {
            const currentValue = steps[activeStepIndex]?.value || '';
            handleStepChange(activeStepIndex, currentValue + symbol);
        }
        inputRefs.current[activeStepIndex]?.focus();
    };

    // ========== UI RENDERING ==========

    // בחירת כיתה
    if (!selectedGrade) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 p-8" dir="rtl">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-24 h-24 bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl"
                        >
                            <Sparkles className="w-14 h-14 text-white" />
                        </motion.div>
                        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-3">
                            היי {studentName}! 👋
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-400">
                            בחר את הכיתה שלך ונתחיל לתרגל
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                        {getAllGrades().map(grade => (
                            <motion.button
                                key={grade.id}
                                whileHover={{ scale: 1.05, y: -5 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedGrade(grade)}
                                className="p-8 bg-white dark:bg-gray-800 rounded-3xl border-3 border-gray-200 dark:border-gray-700 hover:border-purple-500 hover:shadow-2xl transition-all"
                            >
                                <div className="text-7xl mb-4">{grade.emoji}</div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {grade.name}
                                </h3>
                            </motion.button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // בחירת נושא
    if (!selectedTopic) {
        const topics = getTopicsForGrade(selectedGrade.id);
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 p-8" dir="rtl">
                <div className="max-w-6xl mx-auto">
                    <button
                        onClick={() => setSelectedGrade(null)}
                        className="mb-6 px-6 py-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition"
                    >
                        ← חזור לבחירת כיתה
                    </button>

                    <div className="text-center mb-12">
                        <div className="text-7xl mb-4">{selectedGrade.emoji}</div>
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
                            {selectedGrade.name}
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-400">
                            בחר נושא לתרגול
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                        {topics.map(topic => (
                            <motion.button
                                key={topic.id}
                                whileHover={{ scale: 1.05, y: -5 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    setSelectedTopic(topic);
                                    setTimeout(() => loadNewQuestion(), 100);
                                }}
                                className="p-8 bg-white dark:bg-gray-800 rounded-3xl border-3 border-gray-200 dark:border-gray-700 hover:border-purple-500 hover:shadow-2xl transition-all"
                            >
                                <div className="text-7xl mb-4">{topic.icon}</div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {topic.name}
                                </h3>
                            </motion.button>
                        ))}
                    </div>

                    <div className="text-center">
                        <label className="inline-flex items-center gap-3 bg-white dark:bg-gray-800 px-8 py-4 rounded-2xl shadow-xl cursor-pointer hover:shadow-2xl transition">
                            <input
                                type="checkbox"
                                checked={useAI}
                                onChange={(e) => setUseAI(e.target.checked)}
                                className="w-6 h-6"
                            />
                            <Brain className="w-6 h-6 text-purple-500" />
                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                                שאלות מילוליות עם AI
                            </span>
                        </label>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
                <div className="text-center">
                    <Loader className="w-16 h-16 text-purple-600 animate-spin mx-auto mb-4" />
                    <p className="text-xl text-gray-600 dark:text-gray-400">מכין שאלה מעולה בשבילך...</p>
                </div>
            </div>
        );
    }

    if (!currentQuestion) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">אין שאלה זמינה</p>
                    <button
                        onClick={loadNewQuestion}
                        className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition"
                    >
                        טען שאלה
                    </button>
                </div>
            </div>
        );
    }

    // מסך תרגול
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8" dir="rtl">
            <div className="max-w-5xl mx-auto">
                <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-6 md:p-10 space-y-6">

                    {/* Header */}
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <div className="text-4xl">{selectedTopic.icon}</div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {selectedTopic.name}
                                </h2>
                                <p className="text-gray-500">{selectedGrade.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-center">
                                <div className="text-4xl font-bold text-purple-600">
                                    {score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0}%
                                </div>
                                <div className="text-sm text-gray-500">דיוק</div>
                            </div>
                            {score.streak > 0 && (
                                <div className="text-center">
                                    <div className="text-3xl">🔥</div>
                                    <div className="text-2xl font-bold text-orange-500">{score.streak}</div>
                                </div>
                            )}

                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowChat(!showChat)}
                                className={`relative px-6 py-3 rounded-2xl font-bold shadow-lg transition-all flex items-center gap-2 ${
                                    showChat
                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-xl'
                                }`}
                            >
                                <MessageCircle className="w-5 h-5" />
                                <span>עזרה</span>
                                {showChat && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"
                                    />
                                )}
                            </motion.button>

                            <button
                                onClick={() => {
                                    setSelectedTopic(null);
                                    setCurrentQuestion(null);
                                }}
                                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 transition"
                            >
                                🔙 שנה נושא
                            </button>
                        </div>
                    </div>

                    {/* Live Compliment */}
                    <AnimatePresence>
                        {liveCompliment && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="p-4 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-2xl text-center"
                            >
                                <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                                    {liveCompliment}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Question */}
                    <div className="bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-3xl p-10">
                        <div className="text-center">
                            <div className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                                {currentQuestion.question}
                            </div>
                            {currentQuestion.context && (
                                <div className="text-lg text-gray-600 dark:text-gray-400">
                                    📚 {currentQuestion.context}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Steps */}
                    <div className="space-y-4">
                        {steps.map((step, index) => (
                            <div key={index} className="flex items-start gap-3">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-lg ${
                                    step.isCorrect ? 'bg-green-500 scale-110' :
                                        step.feedback?.type === 'almost' ? 'bg-orange-500' :
                                            step.feedback?.type === 'progress' ? 'bg-blue-500' :
                                                'bg-gray-400'
                                }`}>
                                    {step.isCorrect ? <Check className="w-7 h-7" /> : index + 1}
                                </div>

                                <div className="flex-1">
                                    <input
                                        ref={el => inputRefs.current[index] = el}
                                        type="text"
                                        value={step.value}
                                        onChange={(e) => handleStepChange(index, e.target.value)}
                                        onFocus={() => setActiveStepIndex(index)}
                                        onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
                                        placeholder={`שלב ${index + 1}...`}
                                        disabled={showFinalResult && finalResult?.isCorrect}
                                        className="w-full px-6 py-4 text-2xl text-center bg-white dark:bg-gray-800 border-3 border-gray-300 dark:border-gray-600 focus:border-purple-500 rounded-2xl focus:outline-none transition font-mono shadow-lg"
                                    />

                                    {step.feedback && step.value && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 rounded-xl"
                                        >
                                            <div className="flex items-center gap-2 text-blue-800 dark:text-blue-300">
                                                <span className="text-2xl">{step.feedback.emoji}</span>
                                                <span className="font-bold">{step.feedback.message}</span>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>

                                {steps.length > 1 && (
                                    <button
                                        onClick={() => removeStep(index)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                )}
                            </div>
                        ))}

                        <button
                            onClick={addStep}
                            className="w-full py-4 border-3 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl hover:border-purple-500 transition flex items-center justify-center gap-2 text-lg font-bold text-gray-600 dark:text-gray-400 hover:text-purple-600"
                        >
                            ➕ הוסף שלב
                        </button>
                    </div>

                    {/* Hint */}
                    <AnimatePresence>
                        {showHint && currentQuestion.hints && currentQuestion.hints[currentHintIndex - 1] && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="p-6 bg-yellow-50 dark:bg-yellow-900/20 border-3 border-yellow-300 rounded-2xl"
                            >
                                <div className="flex items-start gap-4">
                                    <Lightbulb className="w-8 h-8 text-yellow-600 flex-shrink-0" />
                                    <div>
                                        <div className="text-xl font-bold text-yellow-900 dark:text-yellow-300 mb-2">
                                            רמז #{currentHintIndex}:
                                        </div>
                                        <div className="text-lg text-yellow-800 dark:text-yellow-200">
                                            {currentQuestion.hints[currentHintIndex - 1]}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Final Result */}
                    {showFinalResult && finalResult && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`p-8 rounded-3xl border-4 ${
                                finalResult.isCorrect
                                    ? 'bg-green-50 border-green-500 dark:bg-green-900/20'
                                    : 'bg-red-50 border-red-500 dark:bg-red-900/20'
                            }`}
                        >
                            <div className="flex items-start gap-6">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                                    finalResult.isCorrect ? 'bg-green-500' : 'bg-red-500'
                                }`}>
                                    {finalResult.isCorrect ?
                                        <Check className="w-10 h-10 text-white" /> :
                                        <X className="w-10 h-10 text-white" />
                                    }
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white">
                                        {finalResult.message}
                                    </h4>
                                    <div className="space-y-2 text-lg">
                                        <div><strong>התשובה שלך:</strong> {finalResult.userAnswer}</div>
                                        <div><strong>תשובה נכונה:</strong> {finalResult.correctAnswer}</div>

                                        {finalResult.usedAI && (
                                            <div className="flex items-center gap-2 text-sm bg-purple-100 dark:bg-purple-900/30 px-3 py-2 rounded-lg">
                                                <Brain className="w-4 h-4 text-purple-600" />
                                                <span className="text-purple-700 dark:text-purple-300">
                                                    נבדק ע"י AI • רמת ביטחון: {finalResult.aiConfidence}%
                                                </span>
                                            </div>
                                        )}

                                        {finalResult.note && (
                                            <div className="text-sm text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-gray-800/50 p-3 rounded-lg">
                                                💡 {finalResult.note}
                                            </div>
                                        )}
                                        {finalResult.explanation && (
                                            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                                <strong className="block mb-2">📝 הסבר מתמטי:</strong>
                                                <div className="whitespace-pre-wrap">{finalResult.explanation}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Math Keyboard */}
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6">
                        <div className="grid grid-cols-5 gap-3">
                            {mathKeyboard.flat().map((key, i) => (
                                <button
                                    key={i}
                                    onClick={() => insertSymbol(key)}
                                    className={`p-4 rounded-2xl font-bold text-2xl transition-all shadow-lg ${
                                        key === '='
                                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-2xl hover:scale-105'
                                            : 'bg-white dark:bg-gray-700 border-3 border-gray-200 dark:border-gray-600 hover:border-purple-500 hover:scale-105'
                                    }`}
                                >
                                    {key}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={checkAnswer}
                            disabled={!steps.some(s => s.value.trim()) || (showFinalResult && finalResult?.isCorrect)}
                            className="px-8 py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold text-2xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-2xl transition-all shadow-xl"
                        >
                            <Zap className="w-7 h-7" />
                            בדוק תשובה
                        </button>

                        <button
                            onClick={showNextHint}
                            className="px-8 py-5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-2xl font-bold text-2xl flex items-center justify-center gap-3 hover:bg-yellow-200 transition-all shadow-xl"
                        >
                            <Lightbulb className="w-7 h-7" />
                            רמז
                        </button>
                    </div>

                    <button
                        onClick={loadNewQuestion}
                        className="w-full px-8 py-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl font-bold text-xl flex items-center justify-center gap-3 hover:bg-gray-200 transition-all shadow-lg"
                    >
                        <RefreshCw className="w-6 h-6" />
                        שאלה חדשה
                    </button>
                </div>
            </div>

            {/* AI Chat Assistant */}
            <AnimatePresence>
                {showChat && chatContext && (
                    <motion.div
                        initial={{ opacity: 0, x: 300 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 300 }}
                        className="fixed left-4 top-20 bottom-4 w-96 z-50"
                    >
                        <div className="h-full bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border-4 border-purple-500 overflow-hidden">
                            <div className="h-full flex flex-col">
                                <div className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Brain className="w-6 h-6 text-white" />
                                        <h3 className="font-bold text-white text-lg">עוזר AI</h3>
                                    </div>
                                    <button
                                        onClick={() => setShowChat(false)}
                                        className="p-2 hover:bg-white/20 rounded-lg transition"
                                    >
                                        <X className="w-5 h-5 text-white" />
                                    </button>
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <AIChatAssistant context={chatContext} />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MathTutor;