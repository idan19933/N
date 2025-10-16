// src/pages/OnboardingFlow.jsx - NEXON ENHANCED VERSION
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Brain, Target, BookOpen, MessageCircle } from 'lucide-react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

// Israeli curriculum topic bank by grade
const topicsByGrade = {
    '7': ['מספרים טבעיים ושלמים', 'חזקות ושורשים', 'ביטויים אלגבריים', 'משוואות פשוטות', 'אחוזים ויחסים', 'גאומטריה בסיסית'],
    '8': ['משוואות ואי-שוויונות', 'ביטויים אלגבריים מורכבים', 'פרופורציה ויחסים', 'דמיון ומשולשים', 'מעגל', 'גרפים של פונקציות'],
    '9': ['חזקות ושורשים ריבועיים', 'משוואות ריבועיות', 'גאומטריה מתקדמת', 'פונקציות קוויות וריבועיות', 'הסתברות'],
    '10-3': ['אלגברה בסיסית', 'משוואות ריבועיים', 'פונקציות', 'גאומטריה אנליטית', 'טריגונומטריה בסיסית'],
    '10-4': ['משוואות מעריכיות', 'פונקציות מעריכיות ולוגריתמיות', 'טריגונומטריה', 'גאומטריה אנליטית', 'סדרות'],
    '10-5': ['פונקציות מתקדמות', 'טריגונומטריה מתקדמת', 'גאומטריה אנליטית', 'סדרות', 'נגזרות בסיסיות'],
    '11-3': ['פונקציות ריבועיות ומעריכיות', 'בעיות קיצון', 'טריגונומטריה במרחב', 'הסתברות'],
    '11-4': ['חשבון דיפרנציאלי', 'פונקציות מעריכיות', 'גאומטריה במרחב', 'טריגונומטריה מתקדמת', 'הסתברות מותנית'],
    '11-5': ['חשבון דיפרנציאלי מתקדם', 'גאומטריה במרחב', 'פונקציות מתקדמות', 'טריגונומטריה במרחב', 'הסתברות בינומית'],
    '12-3': ['חזרה כללית', 'פונקציות מעריכיות בסיסיות', 'גרפים', 'הכנה לבגרות'],
    '12-4': ['אינטגרלים', 'נגזרות ואופטימיזציה', 'בעיות קיצון', 'הסתברות מתקדמת'],
    '12-5': ['אינטגרלים מתקדמים', 'אופטימיזציה', 'סדרות אינסופיות', 'הסתברות רציפה']
};

const OnboardingFlow = () => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const completeOnboarding = useAuthStore(state => state.completeOnboarding);

    const [formData, setFormData] = useState({
        // Nexon-specific fields
        name: '',
        grade: '',
        educationLevel: '',
        track: '',
        mathFeeling: '',
        learningStyle: '',
        goalFocus: '',
        topicMastery: {},
        strugglesText: '',

        // Keep existing fields for compatibility
        gradeLevel: '',
        mathLevel: 'intermediate',
        difficultSubjects: [],
        studyTime: '',
        goals: '',
        interests: []
    });

    const grades = ['7', '8', '9', '10', '11', '12'];
    const tracks = {
        'middle': ['הקבצה א', 'הקבצה ב', 'הקבצה ג'],
        'high': ['3 יחידות', '4 יחידות', '5 יחידות']
    };

    const mathFeelings = [
        { value: 'love', emoji: '😍', text: 'אני אוהב/ת מתמטיקה ונהנה/ת ממנה', enText: 'I love math and enjoy it' },
        { value: 'okay', emoji: '😐', text: 'אני בסדר עם מתמטיקה, אבל לפעמים זה מתסכל', enText: 'Math is okay, but sometimes frustrating' },
        { value: 'struggle', emoji: '😰', text: 'אני לא מסתדר/ת עם מתמטיקה בכלל', enText: 'I really struggle with math' }
    ];

    const learningStyles = [
        { value: 'independent', emoji: '💪', text: 'מנסה/ה לבד עד שמצליח/ה', enText: 'I try by myself until I succeed' },
        { value: 'ask', emoji: '🙋', text: 'שואל/ת חבר/ה או מורה/ה', enText: 'I ask friends or teachers for help' },
        { value: 'quit', emoji: '😔', text: 'מתייאש/ת או עובר/ת הלאה', enText: 'I get discouraged and move on' }
    ];

    const goalFocus = [
        { value: 'understanding', emoji: '💡', text: 'להבין יותר לעומק', enText: 'Deeper understanding' },
        { value: 'speed', emoji: '⚡', text: 'להיות מהיר/ה יותר בפתרון', enText: 'Faster problem solving' },
        { value: 'accuracy', emoji: '🎯', text: 'לא לטעות בשאלות טיפשיות', enText: 'Avoid silly mistakes' },
        { value: 'confidence', emoji: '💪', text: 'להרגיש ביטחון לפני מבחנים', enText: 'Feel confident before tests' }
    ];

    const handleTopicMasteryToggle = (topic, level) => {
        setFormData(prev => ({
            ...prev,
            topicMastery: {
                ...prev.topicMastery,
                [topic]: level
            }
        }));
    };

    const getTopicsForCurrentSelection = () => {
        const { grade, track } = formData;
        if (!grade) return [];

        if (parseInt(grade) <= 9) {
            return topicsByGrade[grade] || [];
        } else {
            // High school - need track
            const trackNum = track?.includes('3') ? '3' : track?.includes('4') ? '4' : track?.includes('5') ? '5' : '';
            const key = `${grade}-${trackNum}`;
            return topicsByGrade[key] || [];
        }
    };

    const canProceed = () => {
        switch(step) {
            case 1: return formData.name && formData.grade && (parseInt(formData.grade) <= 9 || formData.track);
            case 2: return formData.mathFeeling && formData.learningStyle;
            case 3: return formData.goalFocus;
            case 4: return Object.keys(formData.topicMastery).length > 0;
            case 5: return true; // Free text is optional
            default: return false;
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // Merge Nexon data with existing format for compatibility
            const combinedData = {
                ...formData,
                gradeLevel: formData.grade,
                onboardingCompleted: true,
                nexonProfile: true,
                completedAt: new Date().toISOString()
            };

            await completeOnboarding(combinedData);
            toast.success('🎉 פרופיל נוצר! Profile created!');

            setTimeout(() => {
                navigate('/dashboard', { replace: true });
            }, 1500);
        } catch (error) {
            console.error('Onboarding error:', error);
            toast.error('Failed to save profile');
            setLoading(false);
        }
    };

    const renderStep = () => {
        switch(step) {
            case 1:
                return (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center mb-6">
                            <Heart className="w-12 h-12 text-pink-400 mr-4" />
                            <div>
                                <h2 className="text-3xl font-bold text-white">
                                    היי! אני נקסון 👋
                                </h2>
                                <p className="text-gray-400">Your AI Math Tutor - Let's get to know you!</p>
                            </div>
                        </div>

                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                מה השם שלך? / What's your name?
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                placeholder="Your name..."
                                className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-pink-500 focus:outline-none"
                            />
                        </div>

                        {/* Grade */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                באיזו כיתה? / What grade?
                            </label>
                            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                                {grades.map(grade => (
                                    <button
                                        key={grade}
                                        onClick={() => {
                                            setFormData({
                                                ...formData,
                                                grade,
                                                educationLevel: parseInt(grade) <= 9 ? 'middle' : 'high',
                                                track: parseInt(grade) <= 9 ? 'הקבצה ב' : ''
                                            });
                                        }}
                                        className={`p-4 rounded-xl border-2 transition-all font-bold ${
                                            formData.grade === grade
                                                ? 'border-pink-500 bg-pink-500/20 text-white'
                                                : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
                                        }`}
                                    >
                                        כיתה {grade}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Track (only for high school) */}
                        {formData.grade && parseInt(formData.grade) >= 10 && (
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    באיזו רמת לימוד? / Which track?
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {tracks.high.map(track => (
                                        <button
                                            key={track}
                                            onClick={() => setFormData({...formData, track})}
                                            className={`p-4 rounded-xl border-2 transition-all ${
                                                formData.track === track
                                                    ? 'border-pink-500 bg-pink-500/20 text-white'
                                                    : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
                                            }`}
                                        >
                                            {track}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                );

            case 2:
                return (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="space-y-8"
                    >
                        <div className="flex items-center mb-6">
                            <Brain className="w-12 h-12 text-purple-400 mr-4" />
                            <div>
                                <h2 className="text-3xl font-bold text-white">
                                    איך אתה מרגיש כלפי מתמטיקה?
                                </h2>
                                <p className="text-gray-400">How do you feel about math?</p>
                            </div>
                        </div>

                        {/* Math Feeling */}
                        <div className="space-y-3">
                            {mathFeelings.map(feeling => (
                                <button
                                    key={feeling.value}
                                    onClick={() => setFormData({...formData, mathFeeling: feeling.value})}
                                    className={`w-full p-4 rounded-xl border-2 transition-all text-right ${
                                        formData.mathFeeling === feeling.value
                                            ? 'border-purple-500 bg-purple-500/20 text-white'
                                            : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
                                    }`}
                                >
                                    <div className="flex items-center">
                                        <span className="text-3xl ml-4">{feeling.emoji}</span>
                                        <div className="flex-1 text-right">
                                            <div className="font-semibold">{feeling.text}</div>
                                            <div className="text-sm text-gray-400">{feeling.enText}</div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Learning Style */}
                        <div>
                            <h3 className="text-xl font-bold text-white mb-4">
                                כשלא מבין/ה משהו, אתה בדרך כלל... / When you don't understand:
                            </h3>
                            <div className="space-y-3">
                                {learningStyles.map(style => (
                                    <button
                                        key={style.value}
                                        onClick={() => setFormData({...formData, learningStyle: style.value})}
                                        className={`w-full p-4 rounded-xl border-2 transition-all text-right ${
                                            formData.learningStyle === style.value
                                                ? 'border-purple-500 bg-purple-500/20 text-white'
                                                : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
                                        }`}
                                    >
                                        <div className="flex items-center">
                                            <span className="text-2xl ml-3">{style.emoji}</span>
                                            <div className="flex-1 text-right">
                                                <div className="font-semibold">{style.text}</div>
                                                <div className="text-sm text-gray-400">{style.enText}</div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                );

            case 3:
                return (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center mb-6">
                            <Target className="w-12 h-12 text-green-400 mr-4" />
                            <div>
                                <h2 className="text-3xl font-bold text-white">
                                    מה אתה הכי רוצה לשפר?
                                </h2>
                                <p className="text-gray-400">What do you most want to improve?</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {goalFocus.map(goal => (
                                <button
                                    key={goal.value}
                                    onClick={() => setFormData({...formData, goalFocus: goal.value})}
                                    className={`p-6 rounded-xl border-2 transition-all ${
                                        formData.goalFocus === goal.value
                                            ? 'border-green-500 bg-green-500/20 text-white'
                                            : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
                                    }`}
                                >
                                    <div className="text-4xl mb-3">{goal.emoji}</div>
                                    <div className="font-bold text-lg mb-1">{goal.text}</div>
                                    <div className="text-sm text-gray-400">{goal.enText}</div>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                );

            case 4:
                const topics = getTopicsForCurrentSelection();
                return (
                    <motion.div
                        key="step4"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center mb-6">
                            <BookOpen className="w-12 h-12 text-blue-400 mr-4" />
                            <div>
                                <h2 className="text-3xl font-bold text-white">
                                    במה נתמקד?
                                </h2>
                                <p className="text-gray-400">Rate your comfort level with each topic</p>
                            </div>
                        </div>

                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                            {topics.map(topic => (
                                <div key={topic} className="bg-gray-800/50 rounded-xl p-4">
                                    <div className="font-semibold text-white mb-3">{topic}</div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { value: 'good', label: 'שולט', emoji: '👍', color: 'green' },
                                            { value: 'needs-work', label: 'צריך חיזוק', emoji: '📚', color: 'yellow' },
                                            { value: 'struggle', label: 'מתקשה', emoji: '😓', color: 'red' }
                                        ].map(level => (
                                            <button
                                                key={level.value}
                                                onClick={() => handleTopicMasteryToggle(topic, level.value)}
                                                className={`p-2 rounded-lg border-2 transition-all text-sm ${
                                                    formData.topicMastery[topic] === level.value
                                                        ? `border-${level.color}-500 bg-${level.color}-500/20 text-white`
                                                        : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                                                }`}
                                            >
                                                <div className="text-xl mb-1">{level.emoji}</div>
                                                <div>{level.label}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                );

            case 5:
                return (
                    <motion.div
                        key="step5"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center mb-6">
                            <MessageCircle className="w-12 h-12 text-indigo-400 mr-4" />
                            <div>
                                <h2 className="text-3xl font-bold text-white">
                                    ספר/י לי במילים שלך
                                </h2>
                                <p className="text-gray-400">Tell me in your own words (optional)</p>
                            </div>
                        </div>

                        <textarea
                            value={formData.strugglesText}
                            onChange={(e) => setFormData({...formData, strugglesText: e.target.value})}
                            placeholder="באילו נושאים אתה מרגיש קושי? מה היית רוצה ללמוד קודם? / What topics are most challenging? What would you like to learn first?"
                            className="w-full p-4 bg-gray-800 border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none min-h-[200px]"
                            dir="auto"
                        />

                        <div className="bg-indigo-900/30 border border-indigo-500/50 rounded-xl p-6">
                            <h3 className="text-xl font-bold text-white mb-3">
                                🎉 נראה נכון!
                            </h3>
                            <div className="space-y-2 text-gray-300">
                                <div>• <strong>שם:</strong> {formData.name}</div>
                                <div>• <strong>כיתה:</strong> {formData.grade} {formData.track && `(${formData.track})`}</div>
                                <div>• <strong>יחס למתמטיקה:</strong> {mathFeelings.find(f => f.value === formData.mathFeeling)?.text}</div>
                                <div>• <strong>סגנון למידה:</strong> {learningStyles.find(s => s.value === formData.learningStyle)?.text}</div>
                                <div>• <strong>מטרה עיקרית:</strong> {goalFocus.find(g => g.value === formData.goalFocus)?.text}</div>
                                <div>• <strong>נושאים לחיזוק:</strong> {Object.entries(formData.topicMastery).filter(([_, v]) => v !== 'good').length} topics</div>
                            </div>
                        </div>
                    </motion.div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-6">
            <div className="max-w-4xl w-full">
                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between mb-2">
                        <span className="text-gray-400 text-sm">שלב {step} מתוך 5 • Step {step} of 5</span>
                        <span className="text-gray-400 text-sm">{Math.round((step / 5) * 100)}%</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${(step / 5) * 100}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                </div>

                {/* Main Content */}
                <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-800 min-h-[550px]">
                    <AnimatePresence mode="wait">
                        {renderStep()}
                    </AnimatePresence>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-6">
                    <button
                        onClick={() => setStep(Math.max(1, step - 1))}
                        disabled={step === 1}
                        className="px-6 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        Back • חזור
                    </button>

                    {step < 5 ? (
                        <button
                            onClick={() => setStep(step + 1)}
                            disabled={!canProceed()}
                            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
                        >
                            Next • הבא
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-8 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl hover:shadow-lg hover:shadow-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
                        >
                            {loading ? (
                                <>
                                    <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Saving...
                                </>
                            ) : (
                                'Complete Setup • סיימתי 🎉'
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OnboardingFlow;