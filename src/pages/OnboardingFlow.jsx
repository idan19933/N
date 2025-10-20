// src/pages/OnboardingFlow.jsx - COMPLETE NEXON ENHANCED VERSION
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Brain, Target, BookOpen, MessageCircle, Sparkles, Zap } from 'lucide-react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

// ==================== TOPIC CONFIGURATION ====================
// Organized by category for Grade 7 (matching PersonalizedDashboard)
const topicsByGrade = {
    'grade7': {
        'אלגברה': [
            { id: 'variables-expressions', name: 'משתנים וביטויים אלגבריים', icon: '🔤' },
            { id: 'combine-like-terms', name: 'כינוס איברים דומים', icon: '➕' },
            { id: 'distributive-law', name: 'חוק הפילוג', icon: '✖️' },
            { id: 'equivalent-expressions', name: 'ביטויים שווים', icon: '⚖️' },
            { id: 'sequences', name: 'סדרות', icon: '🔢' },
            { id: 'linear-equations-grade7', name: 'משוואות ממעלה ראשונה', icon: '📐' },
            { id: 'word-problems', name: 'בעיות מילוליות', icon: '📝' }
        ],
        'חשבון': [
            { id: 'arithmetic-laws', name: 'חוקי פעולות החשבון', icon: '🧮' },
            { id: 'order-of-operations', name: 'סדר פעולות', icon: '📊' },
            { id: 'reciprocals', name: 'מספרים הופכיים', icon: '🔄' },
            { id: 'neutral-elements', name: 'איברים נייטרליים', icon: '0️⃣' },
            { id: 'powers', name: 'חזקות', icon: '²' },
            { id: 'square-roots', name: 'שורשים ריבועיים', icon: '√' }
        ],
        'גאומטריה בסיסית': [
            { id: 'rectangle-perimeter', name: 'מלבן - היקף', icon: '⬜' },
            { id: 'rectangle-area', name: 'מלבן - שטח', icon: '🟦' },
            { id: 'perpendicularity', name: 'ניצבות', icon: '⊥' },
            { id: 'parallel-lines', name: 'ישרים מקבילים', icon: '∥' },
            { id: 'box-surface-area', name: 'תיבה - שטח פנים', icon: '📦' },
            { id: 'box-volume', name: 'תיבה - נפח', icon: '🧊' },
            { id: 'box-net', name: 'פריסת תיבה', icon: '📐' }
        ],
        'מספרים מכוונים': [
            { id: 'number-line', name: 'ציר המספרים', icon: '↔️' },
            { id: 'opposite-numbers', name: 'מספרים נגדיים', icon: '↕️' },
            { id: 'directed-addition', name: 'חיבור במספרים מכוונים', icon: '➕' },
            { id: 'directed-subtraction', name: 'חיסור במספרים מכוונים', icon: '➖' },
            { id: 'directed-multiplication', name: 'כפל במספרים מכוונים', icon: '✖️' },
            { id: 'directed-division', name: 'חילוק במספרים מכוונים', icon: '➗' }
        ],
        'שטחים': [
            { id: 'right-triangle-area', name: 'שטח משולש ישר-זווית', icon: '📐' },
            { id: 'general-triangle-area', name: 'שטח משולש כללי', icon: '△' },
            { id: 'triangle-height', name: 'גובה במשולש', icon: '📏' },
            { id: 'parallelogram-area', name: 'שטח מקבילית', icon: '▱' },
            { id: 'trapezoid-area', name: 'שטח טרפז', icon: '⏢' },
            { id: 'polygon-area', name: 'שטח מצולע', icon: '⬡' },
            { id: 'circle-area-intro', name: 'שטח עיגול - מבוא', icon: '⭕' }
        ],
        'זוויות': [
            { id: 'angle-definition', name: 'זווית - הגדרה', icon: '∠' },
            { id: 'angle-measurement', name: 'מדידת זוויות', icon: '📐' },
            { id: 'adjacent-angles', name: 'זוויות צמודות', icon: '⌐' },
            { id: 'vertical-angles', name: 'זוויות קודקודיות', icon: '✕' },
            { id: 'angle-bisector', name: 'חוצה זווית', icon: '⟋' },
            { id: 'alternate-angles', name: 'זוויות מתחלפות', icon: '⫽' },
            { id: 'triangle-angles', name: 'זוויות במשולש', icon: '△' },
            { id: 'quadrilateral-angles', name: 'זוויות במרובע', icon: '▭' },
            { id: 'polygon-angles', name: 'זוויות במצולע', icon: '⬢' }
        ]
    },
    'grade8': {
        'אלגברה': [
            { id: 'linear-equations-advanced', name: 'משוואות לינאריות מתקדמות', icon: '🔢' },
            { id: 'systems-of-equations', name: 'מערכת משוואות', icon: '📊' },
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
            { id: 'quadratic-equations', name: 'משוואות ריבועיות', icon: '²' },
            { id: 'polynomials', name: 'פולינומים', icon: '🧮' },
            { id: 'functions', name: 'פונקציות', icon: '📈' }
        ],
        'גאומטריה': [
            { id: 'trigonometry', name: 'טריגונומטריה', icon: '📐' },
            { id: 'geometry-proofs', name: 'הוכחות גאומטריות', icon: '✓' }
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
        educationLevel: '',
        track: '',
        mathFeeling: '',
        learningStyle: '',
        goalFocus: '',
        weakTopics: [],
        strugglesText: ''
    });

    // 🔥 AUTO-FILL NAME FROM USER PROFILE
    useEffect(() => {
        if (user) {
            const userName = user.displayName || user.email?.split('@')[0] || '';
            setFormData(prev => ({
                ...prev,
                name: userName
            }));
        }
    }, [user]);

    const grades = ['7', '8', '9'];

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

    const handleTopicToggle = (topicId) => {
        setFormData(prev => ({
            ...prev,
            weakTopics: prev.weakTopics.includes(topicId)
                ? prev.weakTopics.filter(t => t !== topicId)
                : [...prev.weakTopics, topicId]
        }));
    };

    const getTopicsForCurrentGrade = () => {
        if (!formData.grade) return {};
        return topicsByGrade[formData.grade] || {};
    };

    const canProceed = () => {
        switch(step) {
            case 1: return formData.grade;
            case 2: return formData.mathFeeling && formData.learningStyle;
            case 3: return formData.goalFocus;
            case 4: return formData.weakTopics.length > 0;
            case 5: return true;
            default: return false;
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            // Prepare data for saving
            const profileData = {
                name: formData.name,
                grade: formData.grade,
                educationLevel: formData.educationLevel,
                track: formData.track,
                mathFeeling: formData.mathFeeling,
                learningStyle: formData.learningStyle,
                goalFocus: formData.goalFocus,
                weakTopics: formData.weakTopics,
                strugglesText: formData.strugglesText,
                onboardingCompleted: true,
                completedAt: new Date().toISOString()
            };

            console.log('💾 Saving onboarding profile:', profileData);

            await completeOnboarding(profileData);

            toast.success('🎉 פרופיל נוצר בהצלחה!', {
                duration: 2000,
                style: {
                    background: '#10b981',
                    color: '#fff',
                }
            });

            setTimeout(() => {
                navigate('/dashboard', { replace: true });
            }, 1500);
        } catch (error) {
            console.error('❌ Onboarding error:', error);
            toast.error('שגיאה בשמירת הפרופיל');
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
                        className="space-y-8"
                    >
                        <div className="text-center mb-8">
                            <motion.div
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl"
                            >
                                <Brain className="w-14 h-14 text-white" />
                            </motion.div>
                            <h2 className="text-4xl font-bold text-white mb-3">
                                היי {formData.name}! 👋
                            </h2>
                            <p className="text-xl text-gray-300 mb-2">
                                אני נקסון, המורה הדיגיטלי שלך
                            </p>
                            <p className="text-gray-400">
                                Your AI Math Tutor - Let's personalize your learning!
                            </p>
                        </div>

                        {/* Grade Selection */}
                        <div>
                            <label className="block text-lg font-semibold text-white mb-4 text-center">
                                באיזו כיתה את/ה? / What grade are you in?
                            </label>
                            <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
                                {grades.map(grade => (
                                    <motion.button
                                        key={grade}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => {
                                            setFormData({
                                                ...formData,
                                                grade: `grade${grade}`,
                                                educationLevel: parseInt(grade) <= 9 ? 'middle' : 'high',
                                                track: parseInt(grade) <= 9 ? 'standard' : ''
                                            });
                                        }}
                                        className={`relative p-8 rounded-2xl border-3 transition-all font-bold text-xl ${
                                            formData.grade === `grade${grade}`
                                                ? 'border-purple-500 bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-white shadow-xl shadow-purple-500/30'
                                                : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-600 hover:bg-gray-800'
                                        }`}
                                    >
                                        <div className="text-5xl mb-2">
                                            {grade === '7' ? '🎯' : grade === '8' ? '🚀' : '⭐'}
                                        </div>
                                        <div>כיתה {grade}</div>
                                        {formData.grade === `grade${grade}` && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="absolute top-2 right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
                                            >
                                                ✓
                                            </motion.div>
                                        )}
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        <div className="text-center text-sm text-gray-500 mt-6">
                            💡 נתמקד בתכנית הלימודים הישראלית לכיתה שלך
                        </div>
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
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Heart className="w-10 h-10 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-2">
                                מה היחס שלך למתמטיקה?
                            </h2>
                            <p className="text-gray-400">How do you feel about math?</p>
                        </div>

                        {/* Math Feeling */}
                        <div className="space-y-4">
                            {mathFeelings.map(feeling => (
                                <motion.button
                                    key={feeling.value}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setFormData({...formData, mathFeeling: feeling.value})}
                                    className={`w-full p-6 rounded-2xl border-2 transition-all ${
                                        formData.mathFeeling === feeling.value
                                            ? 'border-purple-500 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white shadow-lg'
                                            : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-600'
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="text-5xl">{feeling.emoji}</div>
                                        <div className="flex-1 text-right">
                                            <div className="font-bold text-lg mb-1">{feeling.text}</div>
                                            <div className="text-sm text-gray-400">{feeling.enText}</div>
                                        </div>
                                        {formData.mathFeeling === feeling.value && (
                                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                                ✓
                                            </div>
                                        )}
                                    </div>
                                </motion.button>
                            ))}
                        </div>

                        {/* Learning Style */}
                        <div className="mt-10">
                            <h3 className="text-xl font-bold text-white mb-4 text-center">
                                כשלא מבין/ה משהו, אתה... / When stuck, you usually:
                            </h3>
                            <div className="space-y-4">
                                {learningStyles.map(style => (
                                    <motion.button
                                        key={style.value}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setFormData({...formData, learningStyle: style.value})}
                                        className={`w-full p-6 rounded-2xl border-2 transition-all ${
                                            formData.learningStyle === style.value
                                                ? 'border-indigo-500 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-white shadow-lg'
                                                : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-600'
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="text-4xl">{style.emoji}</div>
                                            <div className="flex-1 text-right">
                                                <div className="font-bold text-lg mb-1">{style.text}</div>
                                                <div className="text-sm text-gray-400">{style.enText}</div>
                                            </div>
                                            {formData.learningStyle === style.value && (
                                                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                                    ✓
                                                </div>
                                            )}
                                        </div>
                                    </motion.button>
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
                        className="space-y-8"
                    >
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Target className="w-10 h-10 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-2">
                                מה המטרה העיקרית שלך?
                            </h2>
                            <p className="text-gray-400">What's your main goal?</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {goalFocus.map(goal => (
                                <motion.button
                                    key={goal.value}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setFormData({...formData, goalFocus: goal.value})}
                                    className={`p-8 rounded-2xl border-2 transition-all ${
                                        formData.goalFocus === goal.value
                                            ? 'border-green-500 bg-gradient-to-br from-green-500/20 to-emerald-500/20 text-white shadow-xl'
                                            : 'border-gray-700 bg-gray-800/50 text-gray-300 hover:border-gray-600'
                                    }`}
                                >
                                    <div className="text-5xl mb-4">{goal.emoji}</div>
                                    <div className="font-bold text-xl mb-2">{goal.text}</div>
                                    <div className="text-sm text-gray-400">{goal.enText}</div>
                                    {formData.goalFocus === goal.value && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="mt-4 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mx-auto"
                                        >
                                            ✓
                                        </motion.div>
                                    )}
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                );

            case 4:
                const topicCategories = getTopicsForCurrentGrade();
                return (
                    <motion.div
                        key="step4"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="space-y-6"
                    >
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <BookOpen className="w-10 h-10 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-2">
                                באילו נושאים תרצה להתחזק?
                            </h2>
                            <p className="text-gray-400">
                                Which topics would you like to strengthen?
                            </p>
                            <p className="text-sm text-purple-400 mt-2">
                                בחר את הנושאים שאתה מרגיש שצריך לחזק 💪
                            </p>
                        </div>

                        <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-gray-800">
                            {Object.entries(topicCategories).map(([category, topics]) => (
                                <div key={category} className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700">
                                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                        <Sparkles className="w-6 h-6 text-yellow-400" />
                                        {category}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {topics.map(topic => (
                                            <motion.button
                                                key={topic.id}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleTopicToggle(topic.id)}
                                                className={`p-4 rounded-xl border-2 transition-all text-right ${
                                                    formData.weakTopics.includes(topic.id)
                                                        ? 'border-orange-500 bg-gradient-to-r from-orange-500/20 to-red-500/20 text-white shadow-lg'
                                                        : 'border-gray-700 bg-gray-800/50 text-gray-400 hover:border-gray-600'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="text-2xl">{topic.icon}</div>
                                                    <div className="flex-1 font-semibold">{topic.name}</div>
                                                    {formData.weakTopics.includes(topic.id) && (
                                                        <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-sm">
                                                            ✓
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="bg-purple-900/30 border border-purple-500/50 rounded-xl p-4 text-center">
                            <p className="text-purple-200">
                                נבחרו <strong className="text-white text-xl">{formData.weakTopics.length}</strong> נושאים
                            </p>
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
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <MessageCircle className="w-10 h-10 text-white" />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-2">
                                רוצה לספר עוד משהו?
                            </h2>
                            <p className="text-gray-400">Any additional thoughts? (optional)</p>
                        </div>

                        <textarea
                            value={formData.strugglesText}
                            onChange={(e) => setFormData({...formData, strugglesText: e.target.value})}
                            placeholder="למשל: אני מתקשה במיוחד בשאלות מילוליות, או שאני רוצה להתמקד בגיאומטריה לקראת מבחן..."
                            className="w-full p-6 bg-gray-800 border-2 border-gray-700 rounded-2xl text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none min-h-[180px] text-lg"
                            dir="auto"
                        />

                        {/* Summary */}
                        <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-2 border-purple-500/50 rounded-2xl p-8 space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                                <Zap className="w-8 h-8 text-yellow-400" />
                                <h3 className="text-2xl font-bold text-white">
                                    סיכום הפרופיל שלך
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
                                <div className="bg-white/10 rounded-xl p-4">
                                    <div className="text-gray-400 text-sm mb-1">שם</div>
                                    <div className="font-bold text-lg">{formData.name}</div>
                                </div>

                                <div className="bg-white/10 rounded-xl p-4">
                                    <div className="text-gray-400 text-sm mb-1">כיתה</div>
                                    <div className="font-bold text-lg">
                                        כיתה {formData.grade?.replace('grade', '')}
                                    </div>
                                </div>

                                <div className="bg-white/10 rounded-xl p-4">
                                    <div className="text-gray-400 text-sm mb-1">יחס למתמטיקה</div>
                                    <div className="font-bold">
                                        {mathFeelings.find(f => f.value === formData.mathFeeling)?.emoji} {' '}
                                        {mathFeelings.find(f => f.value === formData.mathFeeling)?.text.split(' ')[0]}
                                    </div>
                                </div>

                                <div className="bg-white/10 rounded-xl p-4">
                                    <div className="text-gray-400 text-sm mb-1">סגנון למידה</div>
                                    <div className="font-bold">
                                        {learningStyles.find(s => s.value === formData.learningStyle)?.emoji}
                                    </div>
                                </div>

                                <div className="bg-white/10 rounded-xl p-4">
                                    <div className="text-gray-400 text-sm mb-1">מטרה עיקרית</div>
                                    <div className="font-bold">
                                        {goalFocus.find(g => g.value === formData.goalFocus)?.emoji} {' '}
                                        {goalFocus.find(g => g.value === formData.goalFocus)?.text.split(' ')[0]}
                                    </div>
                                </div>

                                <div className="bg-white/10 rounded-xl p-4">
                                    <div className="text-gray-400 text-sm mb-1">נושאים לחיזוק</div>
                                    <div className="font-bold text-xl text-orange-400">
                                        {formData.weakTopics.length} נושאים
                                    </div>
                                </div>
                            </div>

                            <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-4 mt-6">
                                <p className="text-green-200 text-center font-semibold">
                                    ✨ הכל מוכן! לחץ על "סיום" כדי להתחיל ללמוד
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
            <div className="max-w-5xl w-full">
                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-white font-semibold">שלב {step} מתוך 5</span>
                        <span className="text-purple-300">{Math.round((step / 5) * 100)}%</span>
                    </div>
                    <div className="h-3 bg-gray-800 rounded-full overflow-hidden shadow-inner">
                        <motion.div
                            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${(step / 5) * 100}%` }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                        />
                    </div>
                </div>

                {/* Main Content Card */}
                <div className="bg-gray-900/70 backdrop-blur-2xl rounded-3xl p-6 md:p-10 border border-gray-700 shadow-2xl min-h-[600px]">
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
                        className="px-8 py-4 bg-gray-800 text-white rounded-2xl hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-semibold border border-gray-700"
                    >
                        ← חזור
                    </motion.button>

                    {step < 5 ? (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setStep(step + 1)}
                            disabled={!canProceed()}
                            className="px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl hover:shadow-2xl hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-lg"
                        >
                            הבא →
                        </motion.button>
                    ) : (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-10 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl hover:shadow-2xl hover:shadow-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-lg flex items-center gap-3"
                        >
                            {loading ? (
                                <>
                                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                    שומר...
                                </>
                            ) : (
                                <>
                                    <span>סיום</span>
                                    <span className="text-2xl">🎉</span>
                                </>
                            )}
                        </motion.button>
                    )}
                </div>

                {/* Help Text */}
                <div className="text-center mt-6 text-gray-500 text-sm">
                    💡 אפשר תמיד לשנות את ההעדפות בהגדרות
                </div>
            </div>
        </div>
    );
};

export default OnboardingFlow;