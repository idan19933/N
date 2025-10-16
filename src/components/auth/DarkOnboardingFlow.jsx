// src/components/auth/DarkOnboardingFlow.jsx - COMPLETE
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Brain, Target, Clock, Sparkles } from 'lucide-react';

const DarkOnboardingFlow = ({ onComplete }) => {
    console.log('🎨 DarkOnboardingFlow RENDERING!');

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        gradeLevel: '',
        difficultSubjects: [],
        learningStyle: '',
        studyTime: '',
        goals: '',
        interests: []
    });

    const grades = ['Elementary (K-5)', '6th Grade', '7th Grade', '8th Grade',
        'High School', 'College', 'Graduate', 'Other'];

    const subjects = ['Math', 'Science', 'English', 'History', 'Languages', 'Other'];

    const learningStyles = ['Visual', 'Auditory', 'Reading/Writing', 'Kinesthetic'];

    const studyTimes = ['15-30 minutes', '30-45 minutes', '45-60 minutes', '1-2 hours', '2+ hours'];

    const interestAreas = ['Technology', 'Arts', 'Sports', 'Music', 'Reading', 'Gaming', 'Nature'];

    const handleSubjectToggle = (subject) => {
        setFormData(prev => ({
            ...prev,
            difficultSubjects: prev.difficultSubjects.includes(subject)
                ? prev.difficultSubjects.filter(s => s !== subject)
                : [...prev.difficultSubjects, subject]
        }));
    };

    const handleInterestToggle = (interest) => {
        setFormData(prev => ({
            ...prev,
            interests: prev.interests.includes(interest)
                ? prev.interests.filter(i => i !== interest)
                : [...prev.interests, interest]
        }));
    };

    const canProceed = () => {
        switch(step) {
            case 1: return formData.gradeLevel !== '';
            case 2: return formData.difficultSubjects.length > 0;
            case 3: return formData.learningStyle !== '';
            case 4: return formData.studyTime !== '';
            case 5: return formData.goals.trim() !== '' && formData.interests.length > 0;
            default: return false;
        }
    };

    const handleSubmit = () => {
        console.log('📝 Submitting onboarding data:', formData);
        onComplete({ ...formData, onboardingCompleted: true });
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
                            <GraduationCap className="w-12 h-12 text-indigo-400 mr-4" />
                            <div>
                                <h2 className="text-3xl font-bold text-white">What's your grade level?</h2>
                                <p className="text-gray-400">This helps us tailor content for you</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {grades.map(grade => (
                                <button
                                    key={grade}
                                    onClick={() => setFormData({...formData, gradeLevel: grade})}
                                    className={`p-4 rounded-xl border-2 transition-all ${
                                        formData.gradeLevel === grade
                                            ? 'border-indigo-500 bg-indigo-500/20 text-white'
                                            : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
                                    }`}
                                >
                                    {grade}
                                </button>
                            ))}
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
                        className="space-y-6"
                    >
                        <div className="flex items-center mb-6">
                            <Brain className="w-12 h-12 text-purple-400 mr-4" />
                            <div>
                                <h2 className="text-3xl font-bold text-white">Which subjects need extra help?</h2>
                                <p className="text-gray-400">Select all that apply</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {subjects.map(subject => (
                                <button
                                    key={subject}
                                    onClick={() => handleSubjectToggle(subject)}
                                    className={`p-4 rounded-xl border-2 transition-all ${
                                        formData.difficultSubjects.includes(subject)
                                            ? 'border-purple-500 bg-purple-500/20 text-white'
                                            : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
                                    }`}
                                >
                                    {subject}
                                </button>
                            ))}
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
                            <Sparkles className="w-12 h-12 text-pink-400 mr-4" />
                            <div>
                                <h2 className="text-3xl font-bold text-white">How do you learn best?</h2>
                                <p className="text-gray-400">Everyone has a unique style</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {learningStyles.map(style => (
                                <button
                                    key={style}
                                    onClick={() => setFormData({...formData, learningStyle: style})}
                                    className={`p-6 rounded-xl border-2 transition-all text-left ${
                                        formData.learningStyle === style
                                            ? 'border-pink-500 bg-pink-500/20 text-white'
                                            : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
                                    }`}
                                >
                                    <div className="font-bold text-lg mb-2">{style}</div>
                                    <div className="text-sm text-gray-400">
                                        {style === 'Visual' && 'Charts, diagrams, videos'}
                                        {style === 'Auditory' && 'Listening, discussions'}
                                        {style === 'Reading/Writing' && 'Notes, articles, books'}
                                        {style === 'Kinesthetic' && 'Hands-on, practice'}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                );

            case 4:
                return (
                    <motion.div
                        key="step4"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center mb-6">
                            <Clock className="w-12 h-12 text-blue-400 mr-4" />
                            <div>
                                <h2 className="text-3xl font-bold text-white">How much time can you study daily?</h2>
                                <p className="text-gray-400">Be realistic - consistency matters!</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {studyTimes.map(time => (
                                <button
                                    key={time}
                                    onClick={() => setFormData({...formData, studyTime: time})}
                                    className={`p-4 rounded-xl border-2 transition-all ${
                                        formData.studyTime === time
                                            ? 'border-blue-500 bg-blue-500/20 text-white'
                                            : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
                                    }`}
                                >
                                    {time}
                                </button>
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
                            <Target className="w-12 h-12 text-green-400 mr-4" />
                            <div>
                                <h2 className="text-3xl font-bold text-white">What are your learning goals?</h2>
                                <p className="text-gray-400">Tell us what you want to achieve</p>
                            </div>
                        </div>
                        <textarea
                            value={formData.goals}
                            onChange={(e) => setFormData({...formData, goals: e.target.value})}
                            placeholder="e.g., Improve my math grades, prepare for exams, understand concepts better..."
                            className="w-full p-4 bg-gray-800 border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-green-500 focus:outline-none min-h-[120px]"
                        />

                        <div className="mt-8">
                            <h3 className="text-xl font-bold text-white mb-4">What are you interested in?</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {interestAreas.map(interest => (
                                    <button
                                        key={interest}
                                        onClick={() => handleInterestToggle(interest)}
                                        className={`p-3 rounded-lg border-2 transition-all ${
                                            formData.interests.includes(interest)
                                                ? 'border-green-500 bg-green-500/20 text-white'
                                                : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
                                        }`}
                                    >
                                        {interest}
                                    </button>
                                ))}
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
                        <span className="text-gray-400 text-sm">Step {step} of 5</span>
                        <span className="text-gray-400 text-sm">{Math.round((step / 5) * 100)}%</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${(step / 5) * 100}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                </div>

                {/* Main Content */}
                <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl p-8 border border-gray-800 min-h-[500px]">
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
                        Back
                    </button>

                    {step < 5 ? (
                        <button
                            onClick={() => setStep(step + 1)}
                            disabled={!canProceed()}
                            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={!canProceed()}
                            className="px-8 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl hover:shadow-lg hover:shadow-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
                        >
                            Complete Setup 🎉
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DarkOnboardingFlow;