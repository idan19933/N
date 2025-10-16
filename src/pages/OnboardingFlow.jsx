// src/pages/OnboardingFlow.jsx - MULTI-STEP WITH AI QUESTIONS
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles, Rocket, ChevronRight, ChevronLeft,
    Brain, Target, Clock, BookOpen, Zap
} from 'lucide-react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const OnboardingFlow = () => {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({
        gradeLevel: '',
        mathLevel: '',
        learningStyle: '',
        goals: [],
        weakSubjects: [],
        studyTime: '',
        preferredTime: '',
        motivation: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const completeOnboarding = useAuthStore(state => state.completeOnboarding);
    const user = useAuthStore(state => state.user);

    const steps = [
        {
            id: 'welcome',
            title: 'Welcome to Your AI Learning Journey!',
            subtitle: `Hi ${user?.displayName || 'there'}! Let's personalize your experience in just 2 minutes.`,
            icon: <Sparkles className="w-12 h-12" />
        },
        {
            id: 'grade',
            title: 'What grade are you in?',
            subtitle: 'This helps us match content to your level',
            icon: <BookOpen className="w-12 h-12" />
        },
        {
            id: 'math',
            title: 'How comfortable are you with math?',
            subtitle: 'Be honest - this helps us start at the right level',
            icon: <Brain className="w-12 h-12" />
        },
        {
            id: 'style',
            title: 'How do you learn best?',
            subtitle: 'Everyone learns differently',
            icon: <Zap className="w-12 h-12" />
        },
        {
            id: 'goals',
            title: 'What are your learning goals?',
            subtitle: 'Select all that apply',
            icon: <Target className="w-12 h-12" />
        },
        {
            id: 'subjects',
            title: 'Which subjects need the most help?',
            subtitle: 'We\'ll focus your AI tutor on these areas',
            icon: <BookOpen className="w-12 h-12" />
        },
        {
            id: 'schedule',
            title: 'When do you prefer to study?',
            subtitle: 'We\'ll send reminders at the best time',
            icon: <Clock className="w-12 h-12" />
        },
        {
            id: 'motivation',
            title: 'What motivates you to learn?',
            subtitle: 'This helps us keep you engaged',
            icon: <Rocket className="w-12 h-12" />
        }
    ];

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await completeOnboarding(formData);
            toast.success('Profile created! 🎉 Generating your personalized dashboard...');
            setTimeout(() => {
                navigate('/dashboard', { replace: true });
            }, 1500);
        } catch (error) {
            console.error('Onboarding error:', error);
            toast.error('Failed to save profile');
            setLoading(false);
        }
    };

    const toggleArrayItem = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].includes(value)
                ? prev[field].filter(item => item !== value)
                : [...prev[field], value]
        }));
    };

    const canProceed = () => {
        const step = steps[currentStep];
        switch (step.id) {
            case 'welcome': return true;
            case 'grade': return formData.gradeLevel !== '';
            case 'math': return formData.mathLevel !== '';
            case 'style': return formData.learningStyle !== '';
            case 'goals': return formData.goals.length > 0;
            case 'subjects': return formData.weakSubjects.length > 0;
            case 'schedule': return formData.preferredTime !== '';
            case 'motivation': return formData.motivation !== '';
            default: return true;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Animation */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                    transition={{ duration: 20, repeat: Infinity }}
                    className="absolute top-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
                />
            </div>

            <div className="relative z-10 w-full max-w-3xl">
                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-400">Step {currentStep + 1} of {steps.length}</span>
                        <span className="text-sm text-gray-400">{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                            transition={{ duration: 0.3 }}
                            className="h-full bg-gradient-to-r from-indigo-600 to-purple-600"
                        />
                    </div>
                </div>

                {/* Step Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-800 shadow-2xl"
                    >
                        {/* Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white">
                                {steps[currentStep].icon}
                            </div>
                        </div>

                        {/* Title */}
                        <h2 className="text-3xl font-bold text-white text-center mb-2">
                            {steps[currentStep].title}
                        </h2>
                        <p className="text-gray-400 text-center mb-8">
                            {steps[currentStep].subtitle}
                        </p>

                        {/* Step Content */}
                        <div className="min-h-[300px]">
                            {renderStepContent(steps[currentStep].id, formData, setFormData, toggleArrayItem)}
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex justify-between mt-8">
                            <button
                                onClick={handleBack}
                                disabled={currentStep === 0}
                                className="px-6 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                                <ChevronLeft className="w-5 h-5 mr-2" />
                                Back
                            </button>

                            <button
                                onClick={handleNext}
                                disabled={!canProceed() || loading}
                                className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-semibold"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Creating...
                                    </>
                                ) : currentStep === steps.length - 1 ? (
                                    <>
                                        Complete
                                        <Rocket className="w-5 h-5 ml-2" />
                                    </>
                                ) : (
                                    <>
                                        Next
                                        <ChevronRight className="w-5 h-5 ml-2" />
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

// ============================================
// RENDER STEP CONTENT
// ============================================
function renderStepContent(stepId, formData, setFormData, toggleArrayItem) {
    switch (stepId) {
        case 'welcome':
            return (
                <div className="text-center space-y-4">
                    <p className="text-lg text-gray-300">
                        We'll ask you a few questions to create a personalized learning experience with:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                        <FeatureCard icon="🤖" title="AI Tutor" desc="24/7 personalized help" />
                        <FeatureCard icon="📊" title="Progress Tracking" desc="See your improvement" />
                        <FeatureCard icon="🎯" title="Custom Goals" desc="Tailored to your needs" />
                    </div>
                </div>
            );

        case 'grade':
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        { value: 'elementary', label: 'Elementary (K-5)', emoji: '🎒' },
                        { value: 'middle', label: 'Middle School (6-8)', emoji: '📚' },
                        { value: 'high', label: 'High School (9-12)', emoji: '🎓' },
                        { value: 'college', label: 'College/University', emoji: '🏫' },
                        { value: 'adult', label: 'Adult Learner', emoji: '👨‍🎓' },
                        { value: 'other', label: 'Other', emoji: '📖' }
                    ].map(option => (
                        <OptionCard
                            key={option.value}
                            selected={formData.gradeLevel === option.value}
                            onClick={() => setFormData({ ...formData, gradeLevel: option.value })}
                            emoji={option.emoji}
                            label={option.label}
                        />
                    ))}
                </div>
            );

        case 'math':
            return (
                <div className="space-y-4">
                    {[
                        { value: 'beginner', label: 'Beginner', desc: 'I struggle with basic concepts', emoji: '🌱' },
                        { value: 'intermediate', label: 'Intermediate', desc: 'I can handle most problems with some help', emoji: '📈' },
                        { value: 'advanced', label: 'Advanced', desc: 'I excel and want challenges', emoji: '🚀' },
                        { value: 'expert', label: 'Expert', desc: 'I can teach others', emoji: '🏆' }
                    ].map(option => (
                        <OptionCardHorizontal
                            key={option.value}
                            selected={formData.mathLevel === option.value}
                            onClick={() => setFormData({ ...formData, mathLevel: option.value })}
                            emoji={option.emoji}
                            label={option.label}
                            desc={option.desc}
                        />
                    ))}
                </div>
            );

        case 'style':
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        { value: 'visual', label: 'Visual', desc: 'I learn best with diagrams and videos', emoji: '👁️' },
                        { value: 'auditory', label: 'Auditory', desc: 'I prefer listening and discussions', emoji: '👂' },
                        { value: 'reading', label: 'Reading/Writing', desc: 'I like reading and taking notes', emoji: '📝' },
                        { value: 'kinesthetic', label: 'Hands-on', desc: 'I learn by doing and practicing', emoji: '✋' }
                    ].map(option => (
                        <OptionCard
                            key={option.value}
                            selected={formData.learningStyle === option.value}
                            onClick={() => setFormData({ ...formData, learningStyle: option.value })}
                            emoji={option.emoji}
                            label={option.label}
                            desc={option.desc}
                        />
                    ))}
                </div>
            );

        case 'goals':
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        { value: 'grades', label: 'Improve Grades', emoji: '📈' },
                        { value: 'exam', label: 'Prepare for Exam', emoji: '📝' },
                        { value: 'understanding', label: 'Better Understanding', emoji: '💡' },
                        { value: 'homework', label: 'Homework Help', emoji: '✏️' },
                        { value: 'advanced', label: 'Advanced Topics', emoji: '🚀' },
                        { value: 'fun', label: 'Learn for Fun', emoji: '🎉' }
                    ].map(option => (
                        <MultiSelectCard
                            key={option.value}
                            selected={formData.goals.includes(option.value)}
                            onClick={() => toggleArrayItem('goals', option.value)}
                            emoji={option.emoji}
                            label={option.label}
                        />
                    ))}
                </div>
            );

        case 'subjects':
            return (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                        { value: 'math', label: 'Math', emoji: '🔢' },
                        { value: 'science', label: 'Science', emoji: '🔬' },
                        { value: 'english', label: 'English', emoji: '📖' },
                        { value: 'history', label: 'History', emoji: '🏛️' },
                        { value: 'languages', label: 'Languages', emoji: '🗣️' },
                        { value: 'coding', label: 'Coding', emoji: '💻' }
                    ].map(option => (
                        <MultiSelectCard
                            key={option.value}
                            selected={formData.weakSubjects.includes(option.value)}
                            onClick={() => toggleArrayItem('weakSubjects', option.value)}
                            emoji={option.emoji}
                            label={option.label}
                            small
                        />
                    ))}
                </div>
            );

        case 'schedule':
            return (
                <div className="space-y-4">
                    {[
                        { value: 'morning', label: 'Morning (6am - 12pm)', desc: 'Start the day fresh', emoji: '🌅' },
                        { value: 'afternoon', label: 'Afternoon (12pm - 6pm)', desc: 'Mid-day focus', emoji: '☀️' },
                        { value: 'evening', label: 'Evening (6pm - 10pm)', desc: 'After school/work', emoji: '🌆' },
                        { value: 'night', label: 'Night (10pm - 12am)', desc: 'Quiet study time', emoji: '🌙' }
                    ].map(option => (
                        <OptionCardHorizontal
                            key={option.value}
                            selected={formData.preferredTime === option.value}
                            onClick={() => setFormData({ ...formData, preferredTime: option.value })}
                            emoji={option.emoji}
                            label={option.label}
                            desc={option.desc}
                        />
                    ))}
                </div>
            );

        case 'motivation':
            return (
                <div className="space-y-4">
                    {[
                        { value: 'achievement', label: 'Achievements & Badges', emoji: '🏆' },
                        { value: 'progress', label: 'Seeing My Progress', emoji: '📊' },
                        { value: 'competition', label: 'Friendly Competition', emoji: '🎯' },
                        { value: 'knowledge', label: 'Love of Learning', emoji: '❤️' }
                    ].map(option => (
                        <OptionCardHorizontal
                            key={option.value}
                            selected={formData.motivation === option.value}
                            onClick={() => setFormData({ ...formData, motivation: option.value })}
                            emoji={option.emoji}
                            label={option.label}
                        />
                    ))}
                </div>
            );

        default:
            return null;
    }
}

// ============================================
// HELPER COMPONENTS
// ============================================
const FeatureCard = ({ icon, title, desc }) => (
    <div className="bg-gray-800/50 rounded-xl p-6 text-center">
        <div className="text-4xl mb-2">{icon}</div>
        <h3 className="text-white font-semibold mb-1">{title}</h3>
        <p className="text-gray-400 text-sm">{desc}</p>
    </div>
);

const OptionCard = ({ selected, onClick, emoji, label, desc }) => (
    <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={`p-6 rounded-xl border-2 transition-all text-left ${
            selected
                ? 'border-indigo-500 bg-indigo-500/20'
                : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
        }`}
    >
        <div className="text-4xl mb-3">{emoji}</div>
        <h3 className="text-white font-semibold mb-1">{label}</h3>
        {desc && <p className="text-gray-400 text-sm">{desc}</p>}
    </motion.button>
);

const OptionCardHorizontal = ({ selected, onClick, emoji, label, desc }) => (
    <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={`p-4 rounded-xl border-2 transition-all flex items-center space-x-4 ${
            selected
                ? 'border-indigo-500 bg-indigo-500/20'
                : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
        }`}
    >
        <div className="text-3xl">{emoji}</div>
        <div className="flex-1 text-left">
            <h3 className="text-white font-semibold">{label}</h3>
            {desc && <p className="text-gray-400 text-sm">{desc}</p>}
        </div>
    </motion.button>
);

const MultiSelectCard = ({ selected, onClick, emoji, label, small }) => (
    <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={`p-4 rounded-xl border-2 transition-all ${
            selected
                ? 'border-indigo-500 bg-indigo-500/20'
                : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
        } ${small ? 'text-center' : ''}`}
    >
        <div className={`${small ? 'text-2xl' : 'text-3xl'} mb-2`}>{emoji}</div>
        <h3 className="text-white font-semibold text-sm">{label}</h3>
    </motion.button>
);

export default OnboardingFlow;