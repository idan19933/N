// src/components/ai/MathTutor.jsx - FIXED WITH DIFFICULTY SELECTOR
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Check, RefreshCw, Loader, Zap, Grid, Calculator, Sparkles, AlertCircle, Plus, Star, Lightbulb, Target, TrendingUp, Gauge } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import {
    mathTopics,
    getPrioritizedTopicsForStudent,
    getRecommendedTopics
} from '../../data/mathProblems';
import { problemService } from '../../services/problemService';
import { newtonVerification } from '../../services/newtonVerificationService';
import { mathComparison } from '../../services/mathComparisonService';
import { difficultyManager } from '../../services/difficultyManager';
import { aiStepAnalyzer } from '../../services/aiStepAnalyzer';
import toast from 'react-hot-toast';

const DIFFICULTY_LEVELS = {
    beginner: { name: 'מתחיל', emoji: '🌱', range: [1, 2], color: 'green' },
    easy: { name: 'קל', emoji: '😊', range: [2, 3], color: 'blue' },
    medium: { name: 'בינוני', emoji: '💪', range: [3, 5], color: 'yellow' },
    hard: { name: 'קשה', emoji: '🔥', range: [5, 6], color: 'orange' },
    expert: { name: 'מומחה', emoji: '🎯', range: [6, 7], color: 'red' }
};

const MathTutor = ({ onProblemChange }) => {
    const studentProfile = useAuthStore(state => state.studentProfile);
    const nexonProfile = useAuthStore(state => state.nexonProfile);
    const userId = useAuthStore(state => state.user?.id);
    const studentName = nexonProfile?.name || '';

    // State
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [selectedDifficulty, setSelectedDifficulty] = useState('medium');
    const [showTopicSelector, setShowTopicSelector] = useState(true);
    const [showDifficultySelector, setShowDifficultySelector] = useState(false);
    const [currentProblem, setCurrentProblem] = useState(null);
    const [steps, setSteps] = useState([{ value: '', confidence: 0, status: 'empty', aiAnalysis: null }]);
    const [activeStepIndex, setActiveStepIndex] = useState(0);
    const [overallProgress, setOverallProgress] = useState(0);
    const [score, setScore] = useState({ correct: 0, total: 0, streak: 0 });
    const [isLoading, setIsLoading] = useState(false);
    const [aiAnalyzing, setAiAnalyzing] = useState(false);
    const [error, setError] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const [showFinalAnswer, setShowFinalAnswer] = useState(false);
    const [finalVerification, setFinalVerification] = useState(null);
    const [availableTopics, setAvailableTopics] = useState([]);
    const [prioritizedTopics, setPrioritizedTopics] = useState([]);
    const [showHint, setShowHint] = useState(false);
    const [currentHint, setCurrentHint] = useState(null);

    const inputRefs = useRef([]);
    const analyzeTimeout = useRef(null);

    const mathKeyboard = [
        ['+', '-', '×', '÷', '='],
        ['²', '³', '√', '^', '('],
        [')', '∫', 'sin', 'cos', 'tan'],
        ['/', '±', '.', '0', '←']
    ];

    // Initialize topics
    useEffect(() => {
        if (nexonProfile) {
            const prioritized = getPrioritizedTopicsForStudent(nexonProfile);
            setPrioritizedTopics(prioritized || []);
            const all = Object.keys(mathTopics);
            setAvailableTopics(all);
        } else {
            setPrioritizedTopics([]);
            setAvailableTopics(Object.keys(mathTopics));
        }
    }, [nexonProfile]);

    // AI Step Analysis with debounce
    const analyzeStepWithAI = async (value, stepIndex) => {
        if (!value.trim() || !currentProblem?.hasAISteps) return;

        if (analyzeTimeout.current) {
            clearTimeout(analyzeTimeout.current);
        }

        analyzeTimeout.current = setTimeout(async () => {
            setAiAnalyzing(true);
            try {
                const previousSteps = steps.slice(0, stepIndex);
                const analysis = await aiStepAnalyzer.analyzeStep(
                    value,
                    currentProblem,
                    previousSteps
                );

                const newSteps = [...steps];
                newSteps[stepIndex].aiAnalysis = analysis;
                newSteps[stepIndex].confidence = analysis.confidence;
                newSteps[stepIndex].status = analysis.isCorrect ? 'correct' :
                    analysis.confidence > 60 ? 'almost' : 'typing';
                setSteps(newSteps);

                const avgConfidence = newSteps.reduce((sum, s) => sum + s.confidence, 0) / newSteps.length;
                setOverallProgress(Math.min(avgConfidence, 100));

            } catch (error) {
                console.error('❌ AI analysis error:', error);
            } finally {
                setAiAnalyzing(false);
            }
        }, 1500);
    };

    const handleStepChange = (index, value) => {
        const newSteps = [...steps];
        newSteps[index].value = value;
        setSteps(newSteps);

        if (currentProblem?.hasAISteps) {
            analyzeStepWithAI(value, index);
        } else {
            const analysis = analyzeStepRegular(value, currentProblem);
            newSteps[index] = { ...newSteps[index], ...analysis };
            setSteps(newSteps);

            const totalConfidence = newSteps.reduce((sum, step) => sum + step.confidence, 0);
            const avgConfidence = totalConfidence / newSteps.length;
            setOverallProgress(Math.min(avgConfidence, 100));
        }
    };

    const analyzeStepRegular = (input, problem) => {
        if (!input.trim()) {
            return { confidence: 0, status: 'empty', feedback: null };
        }

        const analysis = mathComparison.analyzeProgress(
            input,
            problem.answer,
            problem.newton_operation
        );

        let confidence = analysis.similarity;
        let status = 'typing';
        let feedback = null;

        if (analysis.similarity >= 98) {
            confidence = 100;
            status = 'correct';
            feedback = { message: '✅ מושלם!', type: 'success' };
        } else if (analysis.similarity >= 70) {
            status = 'almost';
            feedback = { message: '⚠️ קרוב!', type: 'warning' };
        } else if (analysis.similarity >= 50) {
            status = 'progress';
            feedback = { message: '📝 בכיוון', type: 'info' };
        }

        return { confidence, status, feedback };
    };

    const addStep = () => {
        const newSteps = [...steps, { value: '', confidence: 0, status: 'empty', aiAnalysis: null }];
        setSteps(newSteps);
        setActiveStepIndex(newSteps.length - 1);
        setTimeout(() => inputRefs.current[newSteps.length - 1]?.focus(), 100);
    };

    const insertSymbol = (symbol) => {
        const currentValue = steps[activeStepIndex].value;
        if (symbol === '←') {
            handleStepChange(activeStepIndex, currentValue.slice(0, -1));
        } else {
            handleStepChange(activeStepIndex, currentValue + symbol);
        }
    };

    const requestHint = () => {
        if (!currentProblem) return;

        if (currentProblem.hasAISteps) {
            const currentStep = steps[activeStepIndex];
            const hint = aiStepAnalyzer.getContextualHint(
                currentStep.aiAnalysis?.stepNumber || 0,
                currentProblem
            );
            setCurrentHint(hint);
        } else {
            const hint = currentProblem.hints?.[0] || 'נסה לפרק את הבעיה לשלבים קטנים יותר';
            setCurrentHint(hint);
        }

        setShowHint(true);
        setTimeout(() => setShowHint(false), 8000);
    };

    const submitAnswer = async () => {
        setShowFinalAnswer(true);

        let mainAnswer = '';
        for (let i = steps.length - 1; i >= 0; i--) {
            if (steps[i].value.trim()) {
                mainAnswer = steps[i].value.trim();
                break;
            }
        }

        if (!mainAnswer) {
            setFinalVerification({
                verified: false,
                message: 'נא להזין תשובה!',
                userAnswer: '',
                correctAnswer: currentProblem.answer
            });
            return;
        }

        let isCorrect = false;

        if (currentProblem.hasAISteps) {
            const finalAnalysis = await aiStepAnalyzer.analyzeStep(mainAnswer, currentProblem, steps.slice(0, -1));
            isCorrect = finalAnalysis.isCorrect && finalAnalysis.confidence >= 90;

            setFinalVerification({
                verified: isCorrect,
                message: finalAnalysis.feedback,
                userAnswer: mainAnswer,
                correctAnswer: currentProblem.answer,
                aiSuggestion: finalAnalysis.nextStepSuggestion
            });
        } else {
            if (currentProblem.newton_operation && currentProblem.newton_expression) {
                try {
                    const verification = await newtonVerification.verify(
                        currentProblem.newton_operation,
                        currentProblem.newton_expression,
                        mainAnswer
                    );
                    isCorrect = verification.verified;
                    setFinalVerification(verification);
                } catch (error) {
                    isCorrect = mathComparison.compare(mainAnswer, currentProblem.answer);
                    setFinalVerification({
                        verified: isCorrect,
                        message: isCorrect ? '✅ נכון!' : '❌ לא נכון',
                        userAnswer: mainAnswer,
                        correctAnswer: currentProblem.answer
                    });
                }
            }
        }

        if (currentProblem.newton_operation) {
            const operationKey = `${currentProblem.topic}_${currentProblem.newton_operation}`;
            difficultyManager.recordAttempt(operationKey, isCorrect);
        }

        setScore(prev => ({
            correct: prev.correct + (isCorrect ? 1 : 0),
            total: prev.total + 1,
            streak: isCorrect ? prev.streak + 1 : 0
        }));

        if (userId && currentProblem?.id) {
            const timeSpent = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
            await problemService.recordAttempt(userId, currentProblem.id, isCorrect, timeSpent, 0, steps);
        }

        if (isCorrect) {
            toast.success('🎉 כל הכבוד! Excellent!');
            setTimeout(() => {
                loadNewProblem();
                setShowFinalAnswer(false);
                setFinalVerification(null);
            }, 3000);
        } else {
            toast.error('נסה שוב! Try again!');
        }
    };

    const loadNewProblem = async (topic = null, difficulty = null) => {
        try {
            setIsLoading(true);
            setError(null);
            setShowFinalAnswer(false);
            setFinalVerification(null);
            setShowHint(false);

            const difficultyLevel = difficulty || selectedDifficulty;
            const difficultyRange = DIFFICULTY_LEVELS[difficultyLevel].range;

            const problems = await problemService.getRandomProblems(
                topic || selectedTopic,
                difficultyRange,
                1
            );

            if (problems && problems.length > 0) {
                const problem = problems[0];
                setCurrentProblem(problem);
                setSteps([{ value: '', confidence: 0, status: 'empty', aiAnalysis: null }]);
                setOverallProgress(0);
                setActiveStepIndex(0);
                setStartTime(Date.now());

                console.log('📚 Problem loaded:', {
                    source: problem.source,
                    hasAISteps: problem.hasAISteps,
                    topic: problem.topic,
                    difficulty: problem.difficulty
                });

                if (onProblemChange) onProblemChange(problem);
            } else {
                setError('אין בעיות זמינות');
            }
        } catch (error) {
            console.error('❌ Error loading problem:', error);
            setError(`שגיאה: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const selectTopic = (topic) => {
        setSelectedTopic(topic);
        setShowTopicSelector(false);
        setShowDifficultySelector(true);
    };

    const selectDifficulty = (difficulty) => {
        setSelectedDifficulty(difficulty);
        setShowDifficultySelector(false);
        loadNewProblem(selectedTopic, difficulty);
    };

    // Difficulty Selector Screen
    if (showDifficultySelector) {
        return (
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-4"
                    >
                        <Gauge className="w-12 h-12 text-white" />
                    </motion.div>
                    <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        בחר רמת קושי
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Choose difficulty level for {mathTopics[selectedTopic]?.name}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
                    {Object.entries(DIFFICULTY_LEVELS).map(([key, level]) => (
                        <motion.button
                            key={key}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => selectDifficulty(key)}
                            className={`p-6 bg-gradient-to-br rounded-2xl border-3 hover:shadow-2xl transition ${
                                level.color === 'green' ? 'from-green-50 to-emerald-50 border-green-300 dark:from-green-900/20 dark:to-emerald-900/20' :
                                    level.color === 'blue' ? 'from-blue-50 to-cyan-50 border-blue-300 dark:from-blue-900/20 dark:to-cyan-900/20' :
                                        level.color === 'yellow' ? 'from-yellow-50 to-amber-50 border-yellow-300 dark:from-yellow-900/20 dark:to-amber-900/20' :
                                            level.color === 'orange' ? 'from-orange-50 to-red-50 border-orange-300 dark:from-orange-900/20 dark:to-red-900/20' :
                                                'from-red-50 to-pink-50 border-red-300 dark:from-red-900/20 dark:to-pink-900/20'
                            }`}
                        >
                            <div className="text-6xl mb-4">{level.emoji}</div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                {level.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                רמה {level.range[0]}-{level.range[1]} • Level {level.range[0]}-{level.range[1]}
                            </p>
                        </motion.button>
                    ))}
                </div>

                <div className="text-center mt-8">
                    <button
                        onClick={() => {
                            setShowDifficultySelector(false);
                            setShowTopicSelector(true);
                        }}
                        className="px-6 py-3 bg-gray-200 dark:bg-gray-700 rounded-xl hover:bg-gray-300 transition"
                    >
                        ← חזור לבחירת נושא
                    </button>
                </div>
            </div>
        );
    }

    // Topic Selector Screen
    if (showTopicSelector) {
        const recommendedTopics = nexonProfile ? getRecommendedTopics(nexonProfile) : [];

        // ✅ FIX: Filter out prioritized topics to avoid duplicates
        const regularTopics = availableTopics.filter(key => !prioritizedTopics.includes(key));

        return (
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-4"
                    >
                        <Sparkles className="w-12 h-12 text-white" />
                    </motion.div>
                    <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        נקסון - מורה דיגיטלי
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        {studentName ? `היי ${studentName}! ` : ''}AI Math Tutor with Smart Step Detection 🧠
                    </p>
                </div>

                {prioritizedTopics.length > 0 && (
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-4">
                            <Star className="w-6 h-6 text-orange-500" />
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                נושאים מומלצים
                            </h3>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {prioritizedTopics.map(key => {
                                const topic = mathTopics[key];
                                if (!topic) return null;
                                return (
                                    <motion.button
                                        key={`prioritized-${key}`}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => selectTopic(key)}
                                        className="p-6 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl border-2 border-orange-300 hover:shadow-xl transition"
                                    >
                                        <div className="text-6xl mb-3">{topic.icon}</div>
                                        <h3 className="font-bold text-xl text-gray-900 dark:text-white">
                                            {topic.name}
                                        </h3>
                                        <div className="text-xs text-orange-600 mt-2">⭐ מומלץ</div>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {regularTopics.length > 0 && (
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                            כל הנושאים
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {regularTopics.map(key => {
                                const topic = mathTopics[key];
                                if (!topic) return null;
                                return (
                                    <motion.button
                                        key={`regular-${key}`}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => selectTopic(key)}
                                        className="p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl border-2 border-gray-200 hover:border-purple-500 hover:shadow-xl transition"
                                    >
                                        <div className="text-6xl mb-3">{topic.icon}</div>
                                        <h3 className="font-bold text-xl text-gray-900 dark:text-white">
                                            {topic.name}
                                        </h3>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-900 rounded-2xl shadow-xl">
                <Loader className="w-12 h-12 text-purple-600 animate-spin mb-4" />
                <p className="text-gray-600 dark:text-gray-400 text-lg">טוען בעיה...</p>
            </div>
        );
    }

    if (!currentProblem) return null;

    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center">
                        <Brain className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {mathTopics[currentProblem.topic]?.icon} {mathTopics[currentProblem.topic]?.name}
                        </h2>
                        <div className="flex items-center gap-2 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                selectedDifficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                                    selectedDifficulty === 'easy' ? 'bg-blue-100 text-blue-700' :
                                        selectedDifficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                            selectedDifficulty === 'hard' ? 'bg-orange-100 text-orange-700' :
                                                'bg-red-100 text-red-700'
                            }`}>
                                {DIFFICULTY_LEVELS[selectedDifficulty].emoji} {DIFFICULTY_LEVELS[selectedDifficulty].name}
                            </span>
                            {currentProblem.source === 'database' && (
                                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded-full text-green-700 text-xs">
                                    📚 Database
                                </span>
                            )}
                            {currentProblem.hasAISteps && (
                                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-700 text-xs">
                                    🤖 AI Guided
                                </span>
                            )}
                            {score.streak > 0 && (
                                <span className="text-orange-500 font-bold">🔥 {score.streak}</span>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-purple-600">
                            {score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0}%
                        </div>
                        <div className="text-xs text-gray-500">Accuracy</div>
                    </div>
                    <button
                        onClick={() => {
                            setShowTopicSelector(true);
                            setCurrentProblem(null);
                            setShowDifficultySelector(false);
                        }}
                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 transition"
                    >
                        <Grid className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Progress */}
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                    animate={{ width: `${overallProgress}%` }}
                    className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
                />
            </div>

            {/* Problem */}
            <motion.div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 rounded-3xl p-8">
                <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-gray-900 dark:text-white" dir="ltr">
                        {currentProblem.question}
                    </div>
                </div>

                {/* Steps */}
                <div className="max-w-3xl mx-auto space-y-4">
                    {steps.map((step, index) => (
                        <div key={index} className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                                step.status === 'correct' ? 'bg-green-500' :
                                    step.status === 'almost' ? 'bg-yellow-500' : 'bg-gray-400'
                            }`}>
                                {step.status === 'correct' ? <Check className="w-6 h-6" /> : index + 1}
                            </div>
                            <div className="flex-1">
                                <input
                                    ref={el => inputRefs.current[index] = el}
                                    value={step.value}
                                    onChange={(e) => handleStepChange(index, e.target.value)}
                                    onFocus={() => setActiveStepIndex(index)}
                                    placeholder={`שלב ${index + 1}...`}
                                    dir="ltr"
                                    className={`w-full px-6 py-4 text-xl bg-white dark:bg-gray-800 rounded-2xl border-3 ${
                                        step.status === 'correct' ? 'border-green-500' :
                                            step.status === 'almost' ? 'border-yellow-500' : 'border-gray-300'
                                    } font-mono shadow-lg`}
                                />

                                {/* AI Feedback */}
                                {step.aiAnalysis && step.value && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl"
                                    >
                                        <div className="flex items-start gap-2">
                                            <Brain className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                            <div className="flex-1">
                                                <div className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                                                    {step.aiAnalysis.feedback}
                                                </div>
                                                {step.aiAnalysis.encouragement && (
                                                    <div className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                                                        {step.aiAnalysis.encouragement}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={addStep}
                        className="w-full py-4 border-3 border-dashed border-gray-300 rounded-2xl hover:border-purple-500 transition flex items-center justify-center gap-2"
                    >
                        <Plus className="w-5 h-5" /> הוסף שלב
                    </button>
                </div>
            </motion.div>

            {/* Hint Display */}
            <AnimatePresence>
                {showHint && currentHint && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-300 rounded-xl"
                    >
                        <div className="flex items-start gap-3">
                            <Lightbulb className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                            <div>
                                <div className="font-bold text-yellow-900 dark:text-yellow-300 mb-1">רמז:</div>
                                <div className="text-yellow-800 dark:text-yellow-200">{currentHint}</div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Final Answer */}
            {showFinalAnswer && finalVerification && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`p-6 rounded-2xl border-3 ${
                        finalVerification.verified ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'
                    }`}
                >
                    <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            finalVerification.verified ? 'bg-green-500' : 'bg-red-500'
                        }`}>
                            {finalVerification.verified ? <Check className="w-8 h-8 text-white" /> : <AlertCircle className="w-8 h-8 text-white" />}
                        </div>
                        <div>
                            <h4 className="text-xl font-bold mb-2">{finalVerification.message}</h4>
                            <div className="text-sm space-y-1">
                                <div><strong>התשובה שלך:</strong> {finalVerification.userAnswer}</div>
                                <div><strong>תשובה נכונה:</strong> {finalVerification.correctAnswer}</div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Math Keyboard */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6">
                <div className="grid grid-cols-5 gap-2">
                    {mathKeyboard.flat().map((symbol, i) => (
                        <button
                            key={i}
                            onClick={() => insertSymbol(symbol)}
                            className="px-4 py-3 bg-white dark:bg-gray-700 rounded-xl border-2 hover:border-purple-500 transition text-lg font-bold"
                        >
                            {symbol}
                        </button>
                    ))}
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
                <button
                    onClick={requestHint}
                    className="px-6 py-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 rounded-xl hover:bg-yellow-200 transition flex items-center gap-2"
                >
                    <Lightbulb className="w-5 h-5" /> רמז
                </button>
                <button
                    onClick={() => loadNewProblem()}
                    className="px-6 py-3 bg-gray-200 dark:bg-gray-700 rounded-xl hover:bg-gray-300 transition flex items-center gap-2"
                >
                    <RefreshCw className="w-5 h-5" /> בעיה חדשה
                </button>
                <button
                    onClick={submitAnswer}
                    disabled={steps.every(s => !s.value)}
                    className="flex-1 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-50 hover:shadow-2xl transition"
                >
                    <Zap className="w-6 h-6" /> {aiAnalyzing ? 'מנתח...' : 'בדוק תשובה'}
                </button>
            </div>
        </div>
    );
};

export default MathTutor;