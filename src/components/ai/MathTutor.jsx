// src/components/ai/MathTutor.jsx - WITH BETTER ERROR HANDLING
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Check, RefreshCw, Loader, Zap, Grid, Calculator, Sparkles, AlertCircle } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { mathTopics } from '../../data/mathProblems';
import { problemService } from '../../services/problemService';
import { newtonVerification } from '../../services/newtonVerificationService';

const MathTutor = ({ onProblemChange }) => {
    const studentProfile = useAuthStore(state => state.studentProfile);
    const userId = useAuthStore(state => state.user?.id);

    const [selectedTopic, setSelectedTopic] = useState(null);
    const [showTopicSelector, setShowTopicSelector] = useState(true);
    const [currentProblem, setCurrentProblem] = useState(null);
    const [steps, setSteps] = useState([{ value: '', confidence: 0, status: 'empty' }]);
    const [activeStepIndex, setActiveStepIndex] = useState(0);
    const [overallProgress, setOverallProgress] = useState(0);
    const [score, setScore] = useState({ correct: 0, total: 0, streak: 0 });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const [newtonFeedback, setNewtonFeedback] = useState(null);
    const inputRefs = useRef([]);

    const mathKeyboard = [
        ['+', '-', '×', '÷', '='],
        ['²', '³', '√', '^', '('],
        [')', '∫', 'C', 'd', 'x'],
        ['/', '±', '.', '0', '←']
    ];

    const analyzeStep = async (input, problem) => {
        if (!input.trim()) {
            return { confidence: 0, status: 'empty', feedback: null };
        }

        let confidence = 0;
        let status = 'typing';
        let feedback = null;

        // Use Newton if available
        if (problem.newton_operation && problem.newton_expression) {
            try {
                const verification = await newtonVerification.verify(
                    problem.newton_operation,
                    problem.newton_expression,
                    input
                );

                if (verification.verified) {
                    confidence = 100;
                    status = 'correct';
                    feedback = {
                        message: '✅ Newton API confirms: Correct!',
                        type: 'success',
                        newton: verification.newtonAnswer
                    };
                    setNewtonFeedback(verification);
                } else if (verification.newtonAnswer) {
                    const similarity = calculateSimilarity(input, verification.newtonAnswer);
                    confidence = similarity;
                    status = similarity > 70 ? 'almost' : 'progress';
                    feedback = {
                        message: similarity > 70 ? '⚠️ Very close! Check details' : '📝 Keep going...',
                        type: similarity > 70 ? 'warning' : 'info'
                    };
                }
            } catch (error) {
                console.log('Newton unavailable, using local validation');
            }
        }

        // Local validation fallback
        if (confidence === 0) {
            const normalized = input.toLowerCase().replace(/\s+/g, '');
            const expectedNormalized = String(problem.answer).toLowerCase().replace(/\s+/g, '');

            if (normalized === expectedNormalized) {
                confidence = 100;
                status = 'correct';
                feedback = { message: '✅ Correct!', type: 'success' };
            } else if (normalized.includes(expectedNormalized) || expectedNormalized.includes(normalized)) {
                confidence = 80;
                status = 'almost';
                feedback = { message: '⚠️ Almost! Check format', type: 'warning' };
            } else if (input.length > 3) {
                confidence = 40;
                status = 'progress';
                feedback = { message: '📝 Keep working...', type: 'info' };
            }
        }

        return { confidence, status, feedback };
    };

    const calculateSimilarity = (str1, str2) => {
        const s1 = String(str1).toLowerCase().replace(/[^a-z0-9]/g, '');
        const s2 = String(str2).toLowerCase().replace(/[^a-z0-9]/g, '');
        if (s1 === s2) return 100;
        let matches = 0;
        for (let i = 0; i < Math.min(s1.length, s2.length); i++) {
            if (s1[i] === s2[i]) matches++;
        }
        return Math.round((matches / Math.max(s1.length, s2.length)) * 100);
    };

    const handleStepChange = async (index, value) => {
        const newSteps = [...steps];
        newSteps[index].value = value;
        const analysis = await analyzeStep(value, currentProblem);
        newSteps[index] = { ...newSteps[index], ...analysis };
        setSteps(newSteps);
        const totalConfidence = newSteps.reduce((sum, step) => sum + step.confidence, 0);
        setOverallProgress(Math.min(totalConfidence / newSteps.length, 100));
        if (analysis.status === 'correct' && index === steps.length - 1) {
            setTimeout(() => addStep(), 500);
        }
    };

    const addStep = () => {
        const newSteps = [...steps, { value: '', confidence: 0, status: 'empty' }];
        setSteps(newSteps);
        setActiveStepIndex(newSteps.length - 1);
        setTimeout(() => inputRefs.current[newSteps.length - 1]?.focus(), 100);
    };

    const insertSymbol = (symbol) => {
        if (symbol === '←') {
            const newSteps = [...steps];
            newSteps[activeStepIndex].value = newSteps[activeStepIndex].value.slice(0, -1);
            handleStepChange(activeStepIndex, newSteps[activeStepIndex].value);
        } else {
            const newSteps = [...steps];
            newSteps[activeStepIndex].value += symbol;
            handleStepChange(activeStepIndex, newSteps[activeStepIndex].value);
        }
    };

    const loadNewProblem = async (topic = null) => {
        try {
            console.log('🔄 Loading problem for topic:', topic || selectedTopic);
            setIsLoading(true);
            setError(null);
            setNewtonFeedback(null);

            const problems = await problemService.getRandomProblems(
                topic || selectedTopic,
                studentProfile?.mathLevel || 'intermediate',
                1
            );

            console.log('📊 Received problems:', problems);

            if (problems && problems.length > 0) {
                console.log('✅ Setting problem:', problems[0]);
                setCurrentProblem(problems[0]);
                setSteps([{ value: '', confidence: 0, status: 'empty' }]);
                setOverallProgress(0);
                setActiveStepIndex(0);
                setStartTime(Date.now());
                if (onProblemChange) onProblemChange(problems[0]);
            } else {
                console.warn('⚠️ No problems returned');
                setError(`No problems found for ${topic || selectedTopic}/${studentProfile?.mathLevel || 'intermediate'}`);
            }
        } catch (error) {
            console.error('❌ Error loading problem:', error);
            setError(`Failed to load problem: ${error.message}`);
        } finally {
            console.log('✅ Loading complete, setting isLoading to false');
            setIsLoading(false);
        }
    };

    const selectTopic = (topic) => {
        console.log('✅ Topic selected:', topic);
        setSelectedTopic(topic);
        setShowTopicSelector(false);
        loadNewProblem(topic);
    };

    const submitAnswer = async () => {
        const hasCorrectStep = steps.some(s => s.status === 'correct');
        const avgConfidence = steps.reduce((sum, s) => sum + s.confidence, 0) / steps.length;
        const isCorrect = hasCorrectStep || avgConfidence >= 85;

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
            setTimeout(() => loadNewProblem(), 2000);
        }
    };

    // Topic Selector
    if (showTopicSelector) {
        return (
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                                className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="w-12 h-12 text-white" />
                    </motion.div>
                    <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        Math Tutor - 500+ Problems
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        Database Repository + Newton API Verification 🧮
                    </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
                    {Object.entries(mathTopics).map(([key, topic]) => (
                        <motion.button key={key} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                       onClick={() => selectTopic(key)}
                                       className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl border-2 hover:border-indigo-500 hover:shadow-2xl transition-all">
                            <div className="text-6xl mb-3">{topic.icon}</div>
                            <h3 className="font-bold text-xl text-gray-900 dark:text-white">{topic.name}</h3>
                        </motion.button>
                    ))}
                </div>
            </div>
        );
    }

    // Loading State
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-900 rounded-2xl shadow-xl">
                <Loader className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Loading problem...</p>
                <p className="text-sm text-gray-500 mt-2">Topic: {selectedTopic}</p>
            </div>
        );
    }

    // Error State
    if (error) {
        return (
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
                <div className="flex flex-col items-center justify-center text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Problem Loading Error
                    </h3>
                    <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
                    <div className="space-y-2 text-left bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-4">
                        <p className="text-sm font-semibold">Troubleshooting:</p>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc list-inside">
                            <li>Check if server is running: http://localhost:3001/api/health</li>
                            <li>Check database has problems: node verify_problems.js</li>
                            <li>Try generating problems: node quick_problems.js</li>
                        </ul>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => { setError(null); setShowTopicSelector(true); }}
                                className="px-6 py-3 bg-gray-200 dark:bg-gray-700 rounded-xl">
                            Choose Different Topic
                        </button>
                        <button onClick={() => { setError(null); loadNewProblem(); }}
                                className="px-6 py-3 bg-indigo-600 text-white rounded-xl">
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // No Problem State
    if (!currentProblem) {
        return (
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
                <div className="flex flex-col items-center justify-center">
                    <AlertCircle className="w-16 h-16 text-yellow-500 mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        No Problem Loaded
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Selected topic: {selectedTopic}
                    </p>
                    <button onClick={() => loadNewProblem()}
                            className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold">
                        Load Problem
                    </button>
                </div>
            </div>
        );
    }

    // Main Problem Interface
    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center">
                        <Brain className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {mathTopics[currentProblem.topic]?.icon} {mathTopics[currentProblem.topic]?.name}
                        </h2>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                                {currentProblem.level}
                            </span>
                            {currentProblem.newton_operation && (
                                <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center gap-1">
                                    <Zap className="w-3 h-3" />
                                    Newton {currentProblem.newton_operation}
                                </span>
                            )}
                            {score.streak > 0 && <span className="text-orange-500 font-bold">🔥 {score.streak}</span>}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-indigo-600">
                            {score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0}%
                        </div>
                        <div className="text-xs text-gray-500">דיוק</div>
                    </div>
                    <button onClick={() => { setShowTopicSelector(true); setCurrentProblem(null); }}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 transition">
                        <Grid className="w-4 h-4 inline mr-1" /> שנה נושא
                    </button>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">התקדמות</span>
                    <span className="font-bold text-indigo-600">{Math.round(overallProgress)}%</span>
                </div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div animate={{ width: `${overallProgress}%` }}
                                className={`h-full ${overallProgress >= 80 ? 'bg-green-500' : 'bg-blue-500'}`} />
                </div>
            </div>

            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }}
                        className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-3xl p-8">
                <div className="text-center">
                    <p className="text-gray-600 dark:text-gray-400 mb-3">פתור:</p>
                    <h3 className="text-5xl font-bold text-gray-900 dark:text-white mb-6" dir="ltr">
                        {currentProblem.question}
                    </h3>
                </div>

                <div className="max-w-3xl mx-auto space-y-4">
                    <AnimatePresence>
                        {steps.map((step, index) => (
                            <motion.div key={index} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <div className="flex items-start gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                                        step.status === 'correct' ? 'bg-green-500' :
                                            step.status === 'almost' ? 'bg-yellow-500' :
                                                step.status === 'progress' ? 'bg-blue-500' : 'bg-gray-400'}`}>
                                        {step.status === 'correct' ? <Check className="w-6 h-6" /> : index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <input ref={el => inputRefs.current[index] = el}
                                               value={step.value}
                                               onChange={(e) => handleStepChange(index, e.target.value)}
                                               onFocus={() => setActiveStepIndex(index)}
                                               placeholder={`שלב ${index + 1}...`} dir="ltr"
                                               className={`w-full px-6 py-4 text-xl bg-white dark:bg-gray-800 rounded-2xl border-3 ${
                                                   step.status === 'correct' ? 'border-green-500 ring-4 ring-green-200' :
                                                       step.status === 'almost' ? 'border-yellow-500 ring-4 ring-yellow-200' :
                                                           'border-gray-300 focus:border-indigo-500'
                                               } font-mono shadow-lg`} />
                                        {step.value && (
                                            <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <motion.div animate={{ width: `${step.confidence}%` }}
                                                            className={step.confidence >= 85 ? 'bg-green-500 h-full' : 'bg-blue-500 h-full'} />
                                            </div>
                                        )}
                                        {step.feedback && (
                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                                        className={`mt-3 p-4 rounded-xl ${
                                                            step.feedback.type === 'success' ? 'bg-green-100 text-green-800' :
                                                                step.feedback.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                                                                    'bg-blue-100 text-blue-800'}`}>
                                                <span className="font-semibold">{step.feedback.message}</span>
                                                {step.feedback.newton && (
                                                    <div className="text-sm mt-1">Newton answer: {step.feedback.newton}</div>
                                                )}
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    <button onClick={addStep}
                            className="w-full py-4 border-3 border-dashed border-gray-300 rounded-2xl hover:border-indigo-500 transition">
                        + הוסף שלב
                    </button>
                </div>
            </motion.div>

            {newtonFeedback && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-xl border-2 border-purple-500">
                    <div className="flex items-center gap-3">
                        <Zap className="w-6 h-6 text-purple-600" />
                        <div>
                            <div className="font-bold text-purple-900 dark:text-purple-300">
                                Newton API: {newtonFeedback.verified ? '✅ Verified' : '🔍 Checking...'}
                            </div>
                            <div className="text-sm text-purple-700 dark:text-purple-400" dir="ltr">
                                Answer: {newtonFeedback.newtonAnswer}
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6">
                <h4 className="font-bold mb-4 flex items-center gap-2">
                    <Calculator className="w-5 h-5" /> Math Keyboard
                </h4>
                <div className="grid grid-cols-5 gap-2">
                    {mathKeyboard.flat().map((symbol, i) => (
                        <button key={i} onClick={() => insertSymbol(symbol)}
                                className="px-4 py-3 bg-white dark:bg-gray-700 rounded-xl border-2 hover:border-indigo-500 hover:shadow-xl transition text-2xl font-bold">
                            {symbol}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button onClick={() => loadNewProblem()}
                        className="px-6 py-3 bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center gap-2 hover:bg-gray-300 transition">
                    <RefreshCw className="w-5 h-5" /> בעיה חדשה
                </button>
                <button onClick={submitAnswer} disabled={steps.every(s => !s.value)}
                        className="flex-1 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-50 hover:shadow-2xl transition">
                    <Zap className="w-6 h-6" /> בדוק תשובה
                </button>
            </div>
        </div>
    );
};

export default MathTutor;