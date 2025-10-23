// src/pages/OnboardingFlow.jsx - ENHANCED HEBREW VERSION WITH PRD REQUIREMENTS
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Heart, Brain, Target, BookOpen, MessageCircle, Sparkles,
    Zap, TrendingUp, Calendar, Award, Clock, Star
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

// ==================== GRADE CONFIGURATION ====================
const GRADES = [
    { value: 'grade7', label: 'כיתה ז׳', displayName: 'ז׳' },
    { value: 'grade8', label: 'כיתה ח׳', displayName: 'ח׳' },
    { value: 'grade9', label: 'כיתה ט׳', displayName: 'ט׳' },
    { value: 'grade10', label: 'כיתה י׳', displayName: 'י׳' },
    { value: 'grade11', label: 'כיתה יא׳', displayName: 'יא׳' },
    { value: 'grade12', label: 'כיתה יב׳', displayName: 'יב׳' }
];

// ==================== TRACK CONFIGURATION ====================
const TRACKS = {
    middle: [ // Grades 7-9
        { value: 'regular', label: 'רגיל', description: 'מסלול בסיסי' }
    ],
    high: [ // Grades 10-12
        { value: '3-units', label: '3 יחידות', description: 'מסלול בסיסי' },
        { value: '4-units', label: '4 יחידות', description: 'מסלול מתקדם' },
        { value: '5-units', label: '5 יחידות', description: 'מסלול מורחב' }
    ]
};

// ==================== TOPICS BY GRADE ====================
const TOPICS_BY_GRADE = {
    'grade7': {
        'אלגברה': [
            { id: 'variables-expressions', name: 'משתנים וביטויים', icon: '🔤' },
            { id: 'combine-like-terms', name: 'כינוס איברים דומים', icon: '➕' },
            { id: 'distributive-law', name: 'חוק הפילוג', icon: '✖️' },
            { id: 'sequences', name: 'סדרות', icon: '🔢' },
            { id: 'linear-equations-basic', name: 'משוואות לינאריות', icon: '📐' }
        ],
        'גאומטריה': [
            { id: 'shapes-area', name: 'שטחים', icon: '⬜' },
            { id: 'angles', name: 'זוויות', icon: '∠' },
            { id: 'triangles', name: 'משולשים', icon: '△' }
        ],
        'מספרים': [
            { id: 'integers', name: 'מספרים שלמים', icon: '🔢' },
            { id: 'fractions', name: 'שברים', icon: '½' },
            { id: 'decimals', name: 'מספרים עשרוניים', icon: '0.5' }
        ]
    },
    'grade8': {
        'אלגברה': [
            { id: 'linear-equations-advanced', name: 'משוואות מתקדמות', icon: '📊' },
            { id: 'systems', name: 'מערכות משוואות', icon: '📈' },
            { id: 'inequalities', name: 'אי-שוויונות', icon: '≠' }
        ],
        'גאומטריה': [
            { id: 'similarity', name: 'דמיון', icon: '📐' },
            { id: 'pythagorean', name: 'משפט פיתגורס', icon: '📏' },
            { id: 'circles', name: 'מעגלים', icon: '⭕' }
        ]
    },
    'grade9': {
        'אלגברה': [
            { id: 'quadratic', name: 'משוואות ריבועיות', icon: '²' },
            { id: 'polynomials', name: 'פולינומים', icon: '🧮' },
            { id: 'functions', name: 'פונקציות', icon: '📈' }
        ],
        'גאומטריה': [
            { id: 'trigonometry', name: 'טריגונומטריה', icon: '📐' },
            { id: 'proofs', name: 'הוכחות', icon: '✓' }
        ],
        'סטטיסטיקה': [
            { id: 'probability', name: 'הסתברות', icon: '🎲' },
            { id: 'statistics', name: 'סטטיסטיקה', icon: '📊' }
        ]
    }
};

const OnboardingFlow = () => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { user, completeOnboarding } = useAuthStore();

    const [formData, setFormData] = useState({
        name: '',
        grade: '',
        educationLevel: '', // 'middle' or 'high'
        track: '',
        mathFeeling: '',
        confidenceLevel: '',
        learningStyle: '',
        studyHabits: '',
        goalFocus: '',
        annualGoals: [],
        weakTopics: [],
        strugglesText: '',
        examDates: {
            midterm: '',
            final: ''
        }
    });

    // Auto-fill name from user profile
    useEffect(() => {
        if (user) {
            const userName = user.displayName || user.email?.split('@')[0] || '';
            setFormData(prev => ({
                ...prev,
                name: userName
            }));
        }
    }, [user]);

    // Auto-set education level when grade changes
    useEffect(() => {
        if (formData.grade) {
            const gradeNum = parseInt(formData.grade.replace('grade', ''));
            const level = gradeNum <= 9 ? 'middle' : 'high';
            setFormData(prev => ({
                ...prev,
                educationLevel: level,
                track: level === 'middle' ? 'regular' : prev.track
            }));
        }
    }, [formData.grade]);

    // ==================== FORM OPTIONS ====================

    const mathFeelings = [
        {
            value: 'love',
            emoji: '😍',
            title: 'אוהב/ת מאוד',
            text: 'אני אוהב/ת מתמטיקה ונהנה/ת ממנה'
        },
        {
            value: 'like',
            emoji: '🙂',
            title: 'אוהב/ת',
            text: 'מתמטיקה זה בסדר, לפעמים אפילו מעניין'
        },
        {
            value: 'okay',
            emoji: '😐',
            title: 'ככה ככה',
            text: 'אני בסדר עם מתמטיקה, אבל זה לא התחום האהוב עליי'
        },
        {
            value: 'struggle',
            emoji: '😰',
            title: 'מתקשה/ת',
            text: 'אני לא מצליח/ה להבין מתמטיקה ולפעמים זה מתסכל'
        }
    ];

    const confidenceLevels = [
        {
            value: 'very-confident',
            emoji: '💪',
            title: 'בטוח/ה מאוד',
            text: 'אני מרגיש/ה בטוח/ה בכל הנושאים'
        },
        {
            value: 'confident',
            emoji: '👍',
            title: 'די בטוח/ה',
            text: 'אני מבין/ה את רוב הנושאים'
        },
        {
            value: 'somewhat',
            emoji: '🤔',
            title: 'בינוני',
            text: 'יש לי קשיים בחלק מהנושאים'
        },
        {
            value: 'not-confident',
            emoji: '😟',
            title: 'לא בטוח/ה',
            text: 'אני מרגיש/ה אבוד/ה ברוב הנושאים'
        }
    ];

    const learningStyles = [
        {
            value: 'visual',
            emoji: '👁️',
            title: 'חזותי',
            text: 'אני מבין/ה הכי טוב עם תמונות וסרטונים'
        },
        {
            value: 'practice',
            emoji: '✍️',
            title: 'תרגול',
            text: 'אני צריך/ה לתרגל הרבה כדי להבין'
        },
        {
            value: 'explanation',
            emoji: '🗣️',
            title: 'הסבר',
            text: 'אני צריך/ה הסבר מפורט שלב אחרי שלב'
        },
        {
            value: 'independent',
            emoji: '🚀',
            title: 'עצמאי',
            text: 'אני מעדיף/ה לנסות לבד ולגלות בעצמי'
        }
    ];

    const studyHabitsOptions = [
        {
            value: 'daily',
            emoji: '📅',
            title: 'יומי',
            text: 'אני לומד/ת כל יום קצת'
        },
        {
            value: 'before-test',
            emoji: '📚',
            title: 'לפני מבחנים',
            text: 'אני מתחיל/ה ללמוד כמה ימים לפני מבחן'
        },
        {
            value: 'last-minute',
            emoji: '⏰',
            title: 'ברגע האחרון',
            text: 'אני לומד/ת בעיקר ביום שלפני המבחן'
        },
        {
            value: 'irregular',
            emoji: '🎲',
            title: 'לא סדיר',
            text: 'אני לומד/ת רק כשיש לי זמן או מצב רוח'
        }
    ];

    const goalFocusOptions = [
        {
            value: 'understanding',
            emoji: '💡',
            title: 'הבנה עמוקה',
            text: 'אני רוצה להבין את החומר לעומק'
        },
        {
            value: 'grades',
            emoji: '📊',
            title: 'ציונים',
            text: 'המטרה שלי היא לשפר את הציונים'
        },
        {
            value: 'confidence',
            emoji: '💪',
            title: 'ביטחון עצמי',
            text: 'אני רוצה להרגיש בטוח/ה יותר בלימודים'
        },
        {
            value: 'speed',
            emoji: '⚡',
            title: 'מהירות',
            text: 'אני רוצה לפתור תרגילים מהר יותר'
        },
        {
            value: 'exams',
            emoji: '🎯',
            title: 'הצלחה במבחנים',
            text: 'המטרה העיקרית שלי היא להצליח במבחנים'
        }
    ];

    const annualGoalsOptions = [
        {
            value: 'improve-grade',
            emoji: '📈',
            text: 'לשפר את הציון השנתי'
        },
        {
            value: 'understand-all',
            emoji: '🧠',
            text: 'להבין את כל הנושאים'
        },
        {
            value: 'no-fails',
            emoji: '✅',
            text: 'לא להיכשל באף מבחן'
        },
        {
            value: 'advanced-level',
            emoji: '🚀',
            text: 'להגיע לרמה גבוהה יותר'
        },
        {
            value: 'help-others',
            emoji: '🤝',
            text: 'להיות מסוגל/ת לעזור לאחרים'
        },
        {
            value: 'enjoy-math',
            emoji: '😊',
            text: 'פשוט ליהנות מהמתמטיקה'
        }
    ];

    // ==================== HANDLERS ====================

    const handleTopicToggle = (topicId) => {
        setFormData(prev => ({
            ...prev,
            weakTopics: prev.weakTopics.includes(topicId)
                ? prev.weakTopics.filter(t => t !== topicId)
                : [...prev.weakTopics, topicId]
        }));
    };

    const handleGoalToggle = (goalValue) => {
        setFormData(prev => ({
            ...prev,
            annualGoals: prev.annualGoals.includes(goalValue)
                ? prev.annualGoals.filter(g => g !== goalValue)
                : [...prev.annualGoals, goalValue]
        }));
    };

    const canProceed = () => {
        switch (step) {
            case 1:
                return formData.name && formData.grade && formData.track;
            case 2:
                return formData.mathFeeling && formData.confidenceLevel;
            case 3:
                return formData.learningStyle && formData.studyHabits;
            case 4:
                return formData.goalFocus && formData.annualGoals.length > 0;
            case 5:
                return true; // Optional
            case 6:
                return true; // Final review
            default:
                return false;
        }
    };

    const handleSubmit = async () => {
        if (!canProceed()) {
            toast.error('אנא מלא/י את כל השדות הנדרשים');
            return;
        }

        setLoading(true);

        try {
            const profileData = {
                ...formData,
                onboardingCompleted: true,
                createdAt: new Date().toISOString()
            };

            await completeOnboarding(profileData);

            toast.success('🎉 הפרופיל שלך מוכן! ברוכ/ה הבא/ה לנקסון');

            setTimeout(() => {
                navigate('/dashboard');
            }, 1500);

        } catch (error) {
            console.error('Onboarding error:', error);
            toast.error('אופס! משהו השתבש. נסה/י שוב.');
        } finally {
            setLoading(false);
        }
    };

    // ==================== RENDER STEPS ====================

    const renderStep = () => {
        switch (step) {
            // ==================== STEP 1: BASIC INFO ====================
            case 1:
                return (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="space-y-8"
                    >
                        <div className="text-center space-y-4 mb-10">
                            <div className="inline-block">
                                <Sparkles className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                            </div>
                            <h2 className="text-4xl font-black text-white">
                                היי! בוא/י נכיר 👋
                            </h2>
                            <p className="text-xl text-gray-300">
                                ספר/י לי קצת על עצמך כדי שאוכל ללוות אותך בצורה הכי טובה
                            </p>
                        </div>

                        {/* Name */}
                        <div className="space-y-3">
                            <label className="text-xl font-bold text-white flex items-center gap-2">
                                <Heart className="w-6 h-6 text-pink-400" />
                                איך קוראים לך?
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="השם שלך..."
                                className="w-full p-5 bg-gray-800 border-2 border-gray-700 rounded-2xl text-white text-xl placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-all"
                                dir="auto"
                            />
                        </div>

                        {/* Grade Selection */}
                        <div className="space-y-4">
                            <label className="text-xl font-bold text-white flex items-center gap-2">
                                <BookOpen className="w-6 h-6 text-blue-400" />
                                באיזו כיתה את/ה לומד/ת?
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {GRADES.map((grade) => (
                                    <motion.button
                                        key={grade.value}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setFormData({ ...formData, grade: grade.value })}
                                        className={`p-6 rounded-2xl border-3 transition-all text-center ${
                                            formData.grade === grade.value
                                                ? 'bg-gradient-to-br from-purple-600 to-pink-600 border-purple-400 shadow-xl shadow-purple-500/50'
                                                : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                                        }`}
                                    >
                                        <div className="text-3xl font-black text-white mb-1">
                                            {grade.displayName}
                                        </div>
                                        <div className="text-sm text-gray-300">
                                            {grade.label}
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Track Selection (only for high school) */}
                        {formData.grade && formData.educationLevel === 'high' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="space-y-4"
                            >
                                <label className="text-xl font-bold text-white flex items-center gap-2">
                                    <Target className="w-6 h-6 text-green-400" />
                                    מה ההקבצה שלך?
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {TRACKS.high.map((track) => (
                                        <motion.button
                                            key={track.value}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setFormData({ ...formData, track: track.value })}
                                            className={`p-6 rounded-2xl border-3 transition-all ${
                                                formData.track === track.value
                                                    ? 'bg-gradient-to-br from-green-600 to-emerald-600 border-green-400 shadow-xl shadow-green-500/50'
                                                    : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                                            }`}
                                        >
                                            <div className="text-2xl font-black text-white mb-2">
                                                {track.label}
                                            </div>
                                            <div className="text-sm text-gray-300">
                                                {track.description}
                                            </div>
                                        </motion.button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                );

            // ==================== STEP 2: FEELINGS & CONFIDENCE ====================
            case 2:
                return (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="space-y-10"
                    >
                        <div className="text-center space-y-3">
                            <Heart className="w-16 h-16 text-red-400 mx-auto" />
                            <h2 className="text-4xl font-black text-white">
                                איך את/ה מרגיש/ה עם מתמטיקה?
                            </h2>
                            <p className="text-lg text-gray-300">
                                כן כן, זה חשוב! זה עוזר לי להתאים את הגישה שלי אליך
                            </p>
                        </div>

                        {/* Math Feeling */}
                        <div className="space-y-4">
                            <label className="text-xl font-bold text-white">
                                מה היחס שלך למתמטיקה?
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {mathFeelings.map((feeling) => (
                                    <motion.button
                                        key={feeling.value}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setFormData({ ...formData, mathFeeling: feeling.value })}
                                        className={`p-6 rounded-2xl border-3 transition-all text-right ${
                                            formData.mathFeeling === feeling.value
                                                ? 'bg-gradient-to-br from-purple-600 to-pink-600 border-purple-400 shadow-xl'
                                                : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                                        }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <span className="text-5xl">{feeling.emoji}</span>
                                            <div className="flex-1">
                                                <div className="text-xl font-black text-white mb-1">
                                                    {feeling.title}
                                                </div>
                                                <div className="text-sm text-gray-300">
                                                    {feeling.text}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Confidence Level */}
                        <div className="space-y-4">
                            <label className="text-xl font-bold text-white">
                                כמה את/ה מרגיש/ה בטוח/ה בחומר?
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {confidenceLevels.map((level) => (
                                    <motion.button
                                        key={level.value}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setFormData({ ...formData, confidenceLevel: level.value })}
                                        className={`p-6 rounded-2xl border-3 transition-all text-right ${
                                            formData.confidenceLevel === level.value
                                                ? 'bg-gradient-to-br from-blue-600 to-cyan-600 border-blue-400 shadow-xl'
                                                : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                                        }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <span className="text-5xl">{level.emoji}</span>
                                            <div className="flex-1">
                                                <div className="text-xl font-black text-white mb-1">
                                                    {level.title}
                                                </div>
                                                <div className="text-sm text-gray-300">
                                                    {level.text}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                );

            // ==================== STEP 3: LEARNING STYLE ====================
            case 3:
                return (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="space-y-10"
                    >
                        <div className="text-center space-y-3">
                            <Brain className="w-16 h-16 text-purple-400 mx-auto" />
                            <h2 className="text-4xl font-black text-white">
                                איך את/ה אוהב/ת ללמוד?
                            </h2>
                            <p className="text-lg text-gray-300">
                                כל אחד לומד אחרת - בוא/י נמצא מה מתאים לך
                            </p>
                        </div>

                        {/* Learning Style */}
                        <div className="space-y-4">
                            <label className="text-xl font-bold text-white">
                                מה הסגנון הכי נוח לך?
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {learningStyles.map((style) => (
                                    <motion.button
                                        key={style.value}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setFormData({ ...formData, learningStyle: style.value })}
                                        className={`p-6 rounded-2xl border-3 transition-all text-right ${
                                            formData.learningStyle === style.value
                                                ? 'bg-gradient-to-br from-indigo-600 to-purple-600 border-indigo-400 shadow-xl'
                                                : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                                        }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <span className="text-5xl">{style.emoji}</span>
                                            <div className="flex-1">
                                                <div className="text-xl font-black text-white mb-1">
                                                    {style.title}
                                                </div>
                                                <div className="text-sm text-gray-300">
                                                    {style.text}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Study Habits */}
                        <div className="space-y-4">
                            <label className="text-xl font-bold text-white">
                                מה הרגלי הלמידה שלך?
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {studyHabitsOptions.map((habit) => (
                                    <motion.button
                                        key={habit.value}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setFormData({ ...formData, studyHabits: habit.value })}
                                        className={`p-6 rounded-2xl border-3 transition-all text-right ${
                                            formData.studyHabits === habit.value
                                                ? 'bg-gradient-to-br from-orange-600 to-red-600 border-orange-400 shadow-xl'
                                                : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                                        }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <span className="text-5xl">{habit.emoji}</span>
                                            <div className="flex-1">
                                                <div className="text-xl font-black text-white mb-1">
                                                    {habit.title}
                                                </div>
                                                <div className="text-sm text-gray-300">
                                                    {habit.text}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                );

            // ==================== STEP 4: GOALS ====================
            case 4:
                return (
                    <motion.div
                        key="step4"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="space-y-10"
                    >
                        <div className="text-center space-y-3">
                            <Target className="w-16 h-16 text-green-400 mx-auto" />
                            <h2 className="text-4xl font-black text-white">
                                מה המטרות שלך?
                            </h2>
                            <p className="text-lg text-gray-300">
                                בוא/י נגדיר יעדים ברורים לשנה הזאת
                            </p>
                        </div>

                        {/* Main Goal Focus */}
                        <div className="space-y-4">
                            <label className="text-xl font-bold text-white">
                                מה הכי חשוב לך השנה?
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {goalFocusOptions.map((goal) => (
                                    <motion.button
                                        key={goal.value}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setFormData({ ...formData, goalFocus: goal.value })}
                                        className={`p-6 rounded-2xl border-3 transition-all text-center ${
                                            formData.goalFocus === goal.value
                                                ? 'bg-gradient-to-br from-green-600 to-emerald-600 border-green-400 shadow-xl'
                                                : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                                        }`}
                                    >
                                        <div className="text-5xl mb-3">{goal.emoji}</div>
                                        <div className="text-lg font-black text-white mb-1">
                                            {goal.title}
                                        </div>
                                        <div className="text-sm text-gray-300">
                                            {goal.text}
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Annual Goals - Multiple Select */}
                        <div className="space-y-4">
                            <label className="text-xl font-bold text-white">
                                בחר/י עוד מטרות לשנה (אפשר יותר מאחד)
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {annualGoalsOptions.map((goal) => (
                                    <motion.button
                                        key={goal.value}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleGoalToggle(goal.value)}
                                        className={`p-5 rounded-2xl border-2 transition-all text-right ${
                                            formData.annualGoals.includes(goal.value)
                                                ? 'bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-blue-400'
                                                : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-3xl">{goal.emoji}</span>
                                            <div className="text-base text-white">
                                                {goal.text}
                                            </div>
                                            {formData.annualGoals.includes(goal.value) && (
                                                <div className="mr-auto">
                                                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                                        <span className="text-white text-xs">✓</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                );

            // ==================== STEP 5: WEAK TOPICS ====================
            case 5:
                const currentTopics = TOPICS_BY_GRADE[formData.grade] || {};

                return (
                    <motion.div
                        key="step5"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="space-y-8"
                    >
                        <div className="text-center space-y-3">
                            <MessageCircle className="w-16 h-16 text-yellow-400 mx-auto" />
                            <h2 className="text-4xl font-black text-white">
                                באילו נושאים תרצה/י עזרה?
                            </h2>
                            <p className="text-lg text-gray-300">
                                זה עוזר לי לדעת איפה להתמקד (לא חובה לבחור)
                            </p>
                        </div>

                        {/* Topics by Category */}
                        {Object.keys(currentTopics).length > 0 ? (
                            <div className="space-y-6">
                                {Object.entries(currentTopics).map(([category, topics]) => (
                                    <div key={category} className="space-y-3">
                                        <h3 className="text-2xl font-bold text-white pr-2">
                                            {category}
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {topics.map((topic) => (
                                                <motion.button
                                                    key={topic.id}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => handleTopicToggle(topic.id)}
                                                    className={`p-4 rounded-xl border-2 transition-all text-right ${
                                                        formData.weakTopics.includes(topic.id)
                                                            ? 'bg-gradient-to-br from-orange-600/20 to-red-600/20 border-orange-400'
                                                            : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-2xl">{topic.icon}</span>
                                                        <div className="text-sm text-white flex-1">
                                                            {topic.name}
                                                        </div>
                                                        {formData.weakTopics.includes(topic.id) && (
                                                            <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                                                                <span className="text-white text-xs">✓</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-gray-400 p-10">
                                בחר/י כיתה כדי לראות את הנושאים
                            </div>
                        )}

                        {/* Free Text */}
                        <div className="space-y-3 pt-6">
                            <label className="text-lg font-bold text-white">
                                רוצה להוסיף משהו? (אופציונלי)
                            </label>
                            <textarea
                                value={formData.strugglesText}
                                onChange={(e) => setFormData({ ...formData, strugglesText: e.target.value })}
                                placeholder="למשל: 'אני תמיד מתבלבל עם שברים', 'קשה לי עם בעיות מילוליות' וכו'..."
                                className="w-full p-5 bg-gray-800 border-2 border-gray-700 rounded-2xl text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none min-h-[120px]"
                                dir="auto"
                            />
                        </div>
                    </motion.div>
                );

            // ==================== STEP 6: SUMMARY ====================
            case 6:
                const selectedGrade = GRADES.find(g => g.value === formData.grade);
                const selectedTrack = formData.educationLevel === 'high'
                    ? TRACKS.high.find(t => t.value === formData.track)
                    : { label: 'רגיל' };

                return (
                    <motion.div
                        key="step6"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="space-y-8"
                    >
                        <div className="text-center space-y-4">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full mb-4">
                                <Zap className="w-10 h-10 text-white" />
                            </div>
                            <h2 className="text-4xl font-black text-white">
                                מעולה! הפרופיל שלך מוכן 🎉
                            </h2>
                            <p className="text-xl text-gray-300">
                                הנה סיכום של מה שספרת לי
                            </p>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Basic Info */}
                            <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-2 border-purple-500/50 rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <BookOpen className="w-5 h-5" />
                                    מידע בסיסי
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">שם:</span>
                                        <span className="text-white font-bold">{formData.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">כיתה:</span>
                                        <span className="text-white font-bold">{selectedGrade?.label}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">הקבצה:</span>
                                        <span className="text-white font-bold">{selectedTrack?.label}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Feelings */}
                            <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 border-2 border-blue-500/50 rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <Heart className="w-5 h-5" />
                                    תחושות
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">יחס למתמטיקה:</span>
                                        <span className="text-xl">
                                            {mathFeelings.find(f => f.value === formData.mathFeeling)?.emoji}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">רמת ביטחון:</span>
                                        <span className="text-xl">
                                            {confidenceLevels.find(l => l.value === formData.confidenceLevel)?.emoji}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Learning Style */}
                            <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-2 border-indigo-500/50 rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <Brain className="w-5 h-5" />
                                    סגנון למידה
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">סגנון למידה:</span>
                                        <span className="text-white font-bold">
                                            {learningStyles.find(s => s.value === formData.learningStyle)?.title}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">הרגלי למידה:</span>
                                        <span className="text-white font-bold">
                                            {studyHabitsOptions.find(h => h.value === formData.studyHabits)?.title}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Goals */}
                            <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-2 border-green-500/50 rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <Target className="w-5 h-5" />
                                    מטרות
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">מטרה עיקרית:</span>
                                        <span className="text-white font-bold">
                                            {goalFocusOptions.find(g => g.value === formData.goalFocus)?.title}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-400">מטרות נוספות:</span>
                                        <span className="text-xl font-bold text-green-400">
                                            {formData.annualGoals.length}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Weak Topics Summary */}
                        {formData.weakTopics.length > 0 && (
                            <div className="bg-gradient-to-br from-orange-900/40 to-red-900/40 border-2 border-orange-500/50 rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <MessageCircle className="w-5 h-5" />
                                    נושאים לחיזוק
                                </h3>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-300">
                                        בחרת {formData.weakTopics.length} נושאים שתרצה/י לחזק
                                    </span>
                                    <span className="text-3xl font-bold text-orange-400">
                                        {formData.weakTopics.length}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Ready to Start */}
                        <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-500 rounded-2xl p-8 text-center">
                            <div className="text-6xl mb-4">🚀</div>
                            <h3 className="text-2xl font-black text-white mb-2">
                                אני מוכן ללוות אותך!
                            </h3>
                            <p className="text-lg text-gray-300 mb-6">
                                עכשיו אני יודע בדיוק איך לעזור לך להצליח במתמטיקה
                            </p>
                            <div className="bg-white/10 rounded-xl p-4">
                                <p className="text-green-300 font-semibold">
                                    ✨ לחץ/י על "סיום" כדי להתחיל את המסע שלנו יחד
                                </p>
                            </div>
                        </div>
                    </motion.div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4 md:p-6">
            <div className="max-w-6xl w-full">
                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-white font-semibold text-lg">
                            שלב {step} מתוך 6
                        </span>
                        <span className="text-purple-300 font-bold text-lg">
                            {Math.round((step / 6) * 100)}%
                        </span>
                    </div>
                    <div className="h-4 bg-gray-800 rounded-full overflow-hidden shadow-inner">
                        <motion.div
                            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${(step / 6) * 100}%` }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                        />
                    </div>
                </div>

                {/* Main Content Card */}
                <div className="bg-gray-900/80 backdrop-blur-2xl rounded-3xl p-6 md:p-12 border border-gray-700 shadow-2xl min-h-[650px]">
                    <AnimatePresence mode="wait">
                        {renderStep()}
                    </AnimatePresence>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8 gap-4">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setStep(Math.max(1, step - 1))}
                        disabled={step === 1}
                        className="px-8 py-4 bg-gray-800 text-white rounded-2xl hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-bold border border-gray-700 text-lg"
                    >
                        ← חזור
                    </motion.button>

                    {step < 6 ? (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setStep(step + 1)}
                            disabled={!canProceed()}
                            className="px-12 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl hover:shadow-2xl hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-black text-xl"
                        >
                            הבא →
                        </motion.button>
                    ) : (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-12 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl hover:shadow-2xl hover:shadow-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-black text-xl flex items-center gap-3"
                        >
                            {loading ? (
                                <>
                                    <div className="inline-block animate-spin rounded-full h-7 w-7 border-b-2 border-white"></div>
                                    <span>שומר...</span>
                                </>
                            ) : (
                                <>
                                    <span>סיום</span>
                                    <span className="text-3xl">🎉</span>
                                </>
                            )}
                        </motion.button>
                    )}
                </div>

                {/* Help Text */}
                <div className="text-center mt-6 text-gray-400">
                    💡 תמיד אפשר לשנות את ההעדפות בהגדרות
                </div>
            </div>
        </div>
    );
};

export default OnboardingFlow;