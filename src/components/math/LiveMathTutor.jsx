// src/components/math/LiveMathTutor.jsx - COMPLETE INTELLIGENT TUTOR
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Send, AlertCircle, CheckCircle, Sparkles, Brain } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import claudeService from '../../services/claudeService';
import toast from 'react-hot-toast';

const EXERCISES = {
    fractions: [
        {
            id: 1,
            question: "Solve: 1/2 + 1/4",
            correctAnswer: "3/4",
            expectedSteps: [
                "Find common denominator",
                "Convert fractions",
                "Add numerators",
                "Simplify if needed"
            ],
            commonMistakes: [
                { pattern: /1\/2\s*\+\s*1\/4\s*=\s*2\/6/, hint: "❌ Don't add numerators and denominators directly! You need a common denominator first." },
                { pattern: /denominator.*8/, hint: "⚠️ 8 works, but 4 is simpler! Always use the smallest common denominator." },
            ]
        },
        {
            id: 2,
            question: "Solve: 2/3 + 1/6",
            correctAnswer: "5/6",
            expectedSteps: [
                "Common denominator is 6",
                "Convert 2/3 to 4/6",
                "Add: 4/6 + 1/6 = 5/6"
            ],
            hint: "The denominator 6 is already a common denominator. What is 2/3 in sixths?"
        },
        {
            id: 3,
            question: "Solve: 3/4 × 2/5",
            correctAnswer: "6/20 or 3/10",
            expectedSteps: [
                "Multiply numerators",
                "Multiply denominators",
                "Simplify the result"
            ],
            commonMistakes: [
                { pattern: /3\/4\s*\+\s*2\/5/, hint: "❌ This is multiplication, not addition! Multiply straight across." },
                { pattern: /6\/20/, hint: "✓ Correct! But can you simplify? Both 6 and 20 are divisible by 2." },
            ]
        }
    ],
    algebra: [
        {
            id: 1,
            question: "Solve for x: 2x + 5 = 13",
            correctAnswer: "x = 4",
            expectedSteps: [
                "Subtract 5 from both sides",
                "Get 2x = 8",
                "Divide both sides by 2",
                "x = 4"
            ],
            commonMistakes: [
                { pattern: /2x\s*=\s*18/, hint: "❌ When you move +5 to the right side, it becomes -5, not +5!" },
                { pattern: /x\s*=\s*8/, hint: "❌ Don't forget to divide by the coefficient 2!" },
                { pattern: /2x\s*=\s*8/, hint: "✓ Good! Now divide both sides by 2 to isolate x." },
            ]
        },
        {
            id: 2,
            question: "Solve for x: x - 7 = 3",
            correctAnswer: "x = 10",
            expectedSteps: [
                "Add 7 to both sides",
                "x = 10"
            ],
            commonMistakes: [
                { pattern: /x\s*=\s*-4/, hint: "❌ When moving -7, it becomes +7, not -7!" },
            ],
            hint: "When you move -7 to the other side, what does it become?"
        },
        {
            id: 3,
            question: "Solve for x: 3x - 4 = 11",
            correctAnswer: "x = 5",
            expectedSteps: [
                "Add 4 to both sides: 3x = 15",
                "Divide both sides by 3: x = 5"
            ],
            hint: "First isolate the term with x by moving the constant."
        }
    ]
};

function LiveMathTutor() {
    const { topic } = useParams();
    const navigate = useNavigate();
    const user = useAuthStore(state => state.user);
    const studentProfile = useAuthStore(state => state.studentProfile);

    const [exercises] = useState(EXERCISES[topic] || EXERCISES.fractions);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [studentWork, setStudentWork] = useState('');
    const [aiMessages, setAiMessages] = useState([]);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [lastAnalyzedWork, setLastAnalyzedWork] = useState('');
    const [detectedMistakes, setDetectedMistakes] = useState([]);
    const [isCorrect, setIsCorrect] = useState(false);
    const [stats, setStats] = useState({ correct: 0, total: 0, hintsUsed: 0 });

    const workAreaRef = useRef(null);
    const analysisTimeoutRef = useRef(null);

    const currentExercise = exercises[currentIndex];

    useEffect(() => {
        // Welcome message
        setAiMessages([{
            type: 'info',
            content: `👋 Hi! Let's solve: **${currentExercise.question}**\n\nShow me your work step by step. I'll watch and help if you go off track!`
        }]);
    }, [currentIndex]);

    // Real-time work analysis (debounced)
    useEffect(() => {
        if (studentWork.trim() && studentWork !== lastAnalyzedWork) {
            // Clear previous timeout
            if (analysisTimeoutRef.current) {
                clearTimeout(analysisTimeoutRef.current);
            }

            // Set new timeout for analysis
            analysisTimeoutRef.current = setTimeout(() => {
                analyzeWork();
            }, 2000); // Analyze 2 seconds after they stop typing
        }

        return () => {
            if (analysisTimeoutRef.current) {
                clearTimeout(analysisTimeoutRef.current);
            }
        };
    }, [studentWork]);

    const detectCommonMistakes = (work) => {
        const mistakes = [];
        if (currentExercise.commonMistakes) {
            currentExercise.commonMistakes.forEach(mistake => {
                if (mistake.pattern.test(work)) {
                    mistakes.push(mistake.hint);
                }
            });
        }
        return mistakes;
    };

    const analyzeWork = async () => {
        if (isAnalyzing || !studentWork.trim()) return;

        setIsAnalyzing(true);
        setLastAnalyzedWork(studentWork);

        try {
            // First, check for common mistakes
            const mistakes = detectCommonMistakes(studentWork);
            if (mistakes.length > 0) {
                setDetectedMistakes(mistakes);
                mistakes.forEach(mistake => {
                    setAiMessages(prev => [...prev, {
                        type: 'warning',
                        content: mistake
                    }]);
                });
                setIsAnalyzing(false);
                return;
            }

            // Send to AI for deeper analysis
            const prompt = `You are a patient math tutor. A ${studentProfile?.gradeLevel || 'student'} is solving: "${currentExercise.question}"

Their work so far:
"""
${studentWork}
"""

Correct answer: ${currentExercise.correctAnswer}

Expected steps: ${currentExercise.expectedSteps.join(', ')}

Analyze their work and respond with:
1. If they're on the right track, encourage them and tell them what to do next
2. If they made a mistake, point it out gently and give a hint (don't solve it for them)
3. If they're close to the answer, congratulate and ask them to verify
4. If they got it right, celebrate!

Keep your response SHORT (2-3 sentences max), friendly, and encouraging. Use emojis.`;

            const response = await claudeService.chat(user.id, prompt, { studentProfile });

            setAiMessages(prev => [...prev, {
                type: 'assistant',
                content: response.message
            }]);

            // Check if they got it right
            const workLower = studentWork.toLowerCase().replace(/\s/g, '');
            const answerLower = currentExercise.correctAnswer.toLowerCase().replace(/\s/g, '');

            if (workLower.includes(answerLower) || workLower.includes('=' + answerLower.split('=')[1])) {
                setIsCorrect(true);
                setStats(prev => ({ ...prev, correct: prev.correct + 1, total: prev.total + 1 }));

                setTimeout(() => {
                    if (currentIndex < exercises.length - 1) {
                        nextQuestion();
                    } else {
                        toast.success('🎉 All exercises completed!');
                        setTimeout(() => navigate('/dashboard'), 2000);
                    }
                }, 3000);
            }

        } catch (error) {
            console.error('Analysis error:', error);
            setAiMessages(prev => [...prev, {
                type: 'error',
                content: "I'm having trouble analyzing your work. Keep going, you're doing great! 💪"
            }]);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const requestHint = async () => {
        setStats(prev => ({ ...prev, hintsUsed: prev.hintsUsed + 1 }));

        try {
            const prompt = `Give a helpful hint for solving: ${currentExercise.question}

Expected steps: ${currentExercise.expectedSteps.join(', ')}

Student's current work:
"""
${studentWork || 'They haven\'t started yet'}
"""

Give ONE specific hint about what they should do next. Don't solve it for them. Keep it under 2 sentences.`;

            const response = await claudeService.chat(user.id, prompt, { studentProfile });

            setAiMessages(prev => [...prev, {
                type: 'hint',
                content: `💡 **Hint:** ${response.message}`
            }]);
        } catch (error) {
            setAiMessages(prev => [...prev, {
                type: 'hint',
                content: `💡 **Hint:** ${currentExercise.hint || currentExercise.expectedSteps[0]}`
            }]);
        }
    };

    const nextQuestion = () => {
        setCurrentIndex(prev => prev + 1);
        setStudentWork('');
        setAiMessages([]);
        setDetectedMistakes([]);
        setIsCorrect(false);
        setLastAnalyzedWork('');
    };

    const skipQuestion = () => {
        setStats(prev => ({ ...prev, total: prev.total + 1 }));
        nextQuestion();
    };

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col">
            {/* Header */}
            <div className="bg-gray-800 border-b border-gray-700 p-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back
                    </button>
                    <div className="flex items-center">
                        <Brain className="w-6 h-6 text-purple-400 mr-2" />
                        <h1 className="text-2xl font-bold text-white capitalize">
                            AI Math Tutor - {topic}
                        </h1>
                    </div>
                    <div className="flex items-center space-x-4 text-white">
                        <div>✅ {stats.correct}/{stats.total}</div>
                        <div>💡 {stats.hintsUsed}</div>
                    </div>
                </div>
            </div>

            {/* Main Split Screen */}
            <div className="flex-1 flex overflow-hidden">
                {/* LEFT - Work Area */}
                <div className="w-1/2 p-6 flex flex-col border-r border-gray-700">
                    {/* Question */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 mb-4">
                        <div className="text-white/80 text-sm mb-2">
                            Question {currentIndex + 1} of {exercises.length}
                        </div>
                        <h2 className="text-white text-3xl font-bold">
                            {currentExercise.question}
                        </h2>
                    </div>

                    {/* Work Area */}
                    <div className="flex-1 bg-gray-800 rounded-2xl p-4 mb-4 flex flex-col">
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-gray-400 font-semibold flex items-center">
                                📝 Show Your Work:
                                {isAnalyzing && (
                                    <span className="ml-2 text-purple-400 text-sm animate-pulse">
                                        AI is watching...
                                    </span>
                                )}
                            </label>
                            <button
                                onClick={() => setStudentWork('')}
                                className="text-red-400 hover:text-red-300 text-sm"
                            >
                                Clear All
                            </button>
                        </div>

                        <textarea
                            ref={workAreaRef}
                            value={studentWork}
                            onChange={(e) => setStudentWork(e.target.value)}
                            className="flex-1 bg-gray-700 text-white text-lg p-4 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                            placeholder="Write each step of your solution here...

Example:
Step 1: Find common denominator
Step 2: Convert fractions
Step 3: Add numerators
..."
                            autoFocus
                        />

                        {/* Success Indicator */}
                        <AnimatePresence>
                            {isCorrect && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-4 p-4 bg-green-900/30 border border-green-500 rounded-xl flex items-center"
                                >
                                    <CheckCircle className="w-6 h-6 text-green-400 mr-3" />
                                    <span className="text-green-400 font-bold text-lg">
                                        🎉 Perfect! Moving to next question...
                                    </span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-3 gap-3">
                        <button
                            onClick={requestHint}
                            disabled={isAnalyzing}
                            className="py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                        >
                            💡 Hint
                        </button>
                        <button
                            onClick={analyzeWork}
                            disabled={isAnalyzing || !studentWork.trim()}
                            className="py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center"
                        >
                            {isAnalyzing ? (
                                <span className="animate-spin">⏳</span>
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Check
                                </>
                            )}
                        </button>
                        <button
                            onClick={skipQuestion}
                            className="py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold transition-colors"
                        >
                            Skip
                        </button>
                    </div>
                </div>

                {/* RIGHT - AI Feedback */}
                <div className="w-1/2 p-6 bg-gray-950 flex flex-col overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-4 mb-4">
                        <h3 className="text-white text-xl font-bold flex items-center">
                            <Sparkles className="w-6 h-6 mr-2" />
                            AI Tutor - Live Feedback
                        </h3>
                    </div>

                    {/* AI Messages */}
                    <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                        <AnimatePresence>
                            {aiMessages.map((msg, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`p-4 rounded-xl ${
                                        msg.type === 'warning'
                                            ? 'bg-yellow-900/30 border border-yellow-500'
                                            : msg.type === 'hint'
                                                ? 'bg-blue-900/30 border border-blue-500'
                                                : msg.type === 'error'
                                                    ? 'bg-red-900/30 border border-red-500'
                                                    : 'bg-gray-800 border border-gray-700'
                                    }`}
                                >
                                    <div className="text-gray-100 whitespace-pre-wrap">
                                        {msg.content}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Expected Steps Guide */}
                    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
                        <h4 className="text-indigo-400 font-bold mb-3">📋 Expected Steps:</h4>
                        <ol className="space-y-2">
                            {currentExercise.expectedSteps.map((step, idx) => (
                                <li key={idx} className="flex items-start text-gray-300">
                                    <span className="text-indigo-400 font-bold mr-2">{idx + 1}.</span>
                                    <span>{step}</span>
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LiveMathTutor;