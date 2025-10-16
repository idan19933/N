// src/pages/PersonalizedDashboard.jsx - COMPLETE WITH AI PRACTICE LINKS
import React from 'react';
import { motion } from 'framer-motion';
import { Brain, BookOpen, Target, TrendingUp, Zap, Award, Clock, MessageSquare, Calculator, BarChart } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { useNavigate } from 'react-router-dom';

const PersonalizedDashboard = () => {
    const user = useAuthStore(state => state.user);
    const studentProfile = useAuthStore(state => state.studentProfile);
    const navigate = useNavigate();

    // Get personalized greeting based on time
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'בוקר טוב';
        if (hour < 18) return 'צהריים טובים';
        return 'ערב טוב';
    };

    // Get icon for learning style
    const getLearningStyleIcon = () => {
        switch (studentProfile?.learningStyle) {
            case 'visual': return '👁️';
            case 'auditory': return '👂';
            case 'reading': return '📝';
            case 'kinesthetic': return '✋';
            default: return '🎓';
        }
    };

    // Get grade level emoji
    const getGradeEmoji = () => {
        switch (studentProfile?.gradeLevel) {
            case 'elementary': return '🎒';
            case 'middle': return '📚';
            case 'high': return '🎓';
            case 'college': return '🏫';
            case 'adult': return '👨‍🎓';
            default: return '📖';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 py-8 px-4" dir="rtl">
            <div className="max-w-7xl mx-auto">
                {/* Personalized Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        {getGreeting()}, {user?.displayName || 'תלמיד'}! 👋
                    </h1>
                    <p className="text-lg text-gray-600 flex items-center">
                        <span className="ml-2">{getGradeEmoji()}</span>
                        {studentProfile?.gradeLevel === 'elementary' && 'תלמיד בית ספר יסודי'}
                        {studentProfile?.gradeLevel === 'middle' && 'תלמיד חטיבת ביניים'}
                        {studentProfile?.gradeLevel === 'high' && 'תלמיד תיכון'}
                        {studentProfile?.gradeLevel === 'college' && 'סטודנט'}
                        {studentProfile?.gradeLevel === 'adult' && 'לומד למבוגרים'}
                        {!studentProfile?.gradeLevel && 'תלמיד'}
                    </p>
                </motion.div>

                {/* Personalized Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        icon={<Brain className="w-6 h-6" />}
                        title="רמה במתמטיקה"
                        value={studentProfile?.mathLevel || 'לא הוגדר'}
                        color="bg-purple-500"
                        gradient="from-purple-500 to-purple-600"
                    />
                    <StatCard
                        icon={<Target className="w-6 h-6" />}
                        title="יעדי למידה"
                        value={studentProfile?.goals?.length || 0}
                        color="bg-blue-500"
                        gradient="from-blue-500 to-blue-600"
                    />
                    <StatCard
                        icon={<Clock className="w-6 h-6" />}
                        title="זמן למידה יומי"
                        value={`${studentProfile?.studyTime || '30'} דק׳`}
                        color="bg-green-500"
                        gradient="from-green-500 to-green-600"
                    />
                    <StatCard
                        icon={<Award className="w-6 h-6" />}
                        title="הישגים"
                        value="5"
                        color="bg-orange-500"
                        gradient="from-orange-500 to-orange-600"
                    />
                </div>

                {/* Main AI Practice Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Math Practice Card */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-white rounded-2xl shadow-xl p-8 border-2 border-indigo-200 cursor-pointer relative overflow-hidden"
                        onClick={() => navigate('/practice')}
                    >
                        {/* Background Pattern */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100 rounded-full -mr-16 -mt-16 opacity-50"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-100 rounded-full -ml-12 -mb-12 opacity-50"></div>

                        <div className="relative z-10">
                            <div className="flex items-center mb-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white mr-4 shadow-lg">
                                    <Calculator className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">תרגול מתמטיקה AI</h3>
                                    <p className="text-sm text-gray-600">תרגילים מותאמים אישית</p>
                                </div>
                            </div>
                            <p className="text-gray-700 mb-6">
                                קבל תרגילים ברמה שלך: <strong className="text-indigo-600">{studentProfile?.mathLevel || 'בינוני'}</strong>
                                <br />
                                עם פתרונות מפורטים והסברים צעד אחר צעד
                            </p>

                            {/* Features */}
                            <div className="space-y-2 mb-6">
                                <div className="flex items-center text-sm text-gray-600">
                                    <div className="w-2 h-2 bg-green-500 rounded-full ml-2"></div>
                                    בעיות מתאימות לרמתך
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full ml-2"></div>
                                    רמזים והסברים מפורטים
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full ml-2"></div>
                                    מעקב אחר התקדמות
                                </div>
                            </div>

                            <button className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all flex items-center justify-center">
                                התחל תרגול עכשיו
                                <Zap className="w-5 h-5 mr-2" />
                            </button>
                        </div>
                    </motion.div>

                    {/* AI Chat Assistant Card */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-white rounded-2xl shadow-xl p-8 border-2 border-purple-200 cursor-pointer relative overflow-hidden"
                        onClick={() => navigate('/practice')}
                    >
                        {/* Background Pattern */}
                        <div className="absolute top-0 left-0 w-32 h-32 bg-purple-100 rounded-full -ml-16 -mt-16 opacity-50"></div>
                        <div className="absolute bottom-0 right-0 w-24 h-24 bg-pink-100 rounded-full -mr-12 -mb-12 opacity-50"></div>

                        <div className="relative z-10">
                            <div className="flex items-center mb-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center text-white mr-4 shadow-lg">
                                    <MessageSquare className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-gray-900">עוזר AI אישי</h3>
                                    <p className="text-sm text-gray-600">תמיד פה לעזור</p>
                                </div>
                            </div>
                            <p className="text-gray-700 mb-6">
                                שאל שאלות, קבל עזרה בשיעורי בית, והבן מושגים מורכבים עם העוזר האישי שלך
                            </p>

                            {/* Features */}
                            <div className="space-y-2 mb-6">
                                <div className="flex items-center text-sm text-gray-600">
                                    <div className="w-2 h-2 bg-pink-500 rounded-full ml-2"></div>
                                    תשובות מיידיות לשאלות
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full ml-2"></div>
                                    הסברים מפורטים וברורים
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full ml-2"></div>
                                    עזרה בכל המקצועות
                                </div>
                            </div>

                            <button className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all flex items-center justify-center">
                                התחל שיחה עכשיו
                                <MessageSquare className="w-5 h-5 mr-2" />
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* Subjects Focus & Daily Goal */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Recommended Topics */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-white rounded-2xl shadow-lg p-6"
                    >
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white mr-4">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">נושאים מומלצים</h3>
                        </div>
                        <div className="space-y-3">
                            {studentProfile?.weakSubjects && studentProfile.weakSubjects.length > 0 ? (
                                studentProfile.weakSubjects.map((subject, index) => (
                                    <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer">
                                        <span className="text-2xl ml-3">
                                            {subject === 'math' && '🔢'}
                                            {subject === 'science' && '🔬'}
                                            {subject === 'english' && '📖'}
                                            {subject === 'history' && '🏛️'}
                                            {subject === 'languages' && '🗣️'}
                                            {subject === 'coding' && '💻'}
                                        </span>
                                        <span className="text-gray-700 capitalize">{subject}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-center py-4">לא הוגדרו נושאים</p>
                            )}
                        </div>
                    </motion.div>

                    {/* Learning Style */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white"
                    >
                        <div className="flex items-center mb-4">
                            <Zap className="w-12 h-12 mr-4" />
                            <h3 className="text-xl font-bold">סגנון הלמידה שלך</h3>
                        </div>
                        <div className="text-center">
                            <div className="text-6xl mb-3">{getLearningStyleIcon()}</div>
                            <h4 className="text-2xl font-semibold mb-2">
                                {studentProfile?.learningStyle === 'visual' && 'לומד ויזואלי'}
                                {studentProfile?.learningStyle === 'auditory' && 'לומד שמיעתי'}
                                {studentProfile?.learningStyle === 'reading' && 'קריאה/כתיבה'}
                                {studentProfile?.learningStyle === 'kinesthetic' && 'למידה מעשית'}
                                {!studentProfile?.learningStyle && 'לא הוגדר'}
                            </h4>
                            <p className="text-indigo-100 text-sm">
                                התאמנו את החומרים במיוחד עבורך
                            </p>
                        </div>
                    </motion.div>

                    {/* Daily Goal */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white"
                    >
                        <div className="flex items-center mb-4">
                            <Target className="w-12 h-12 mr-4" />
                            <h3 className="text-xl font-bold">יעד היום</h3>
                        </div>
                        <p className="text-green-100 mb-4 text-lg">
                            השלם {studentProfile?.studyTime || '30'} דקות למידה
                        </p>
                        <div className="bg-white/20 rounded-full h-4 mb-2">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '60%' }}
                                transition={{ duration: 1, delay: 0.5 }}
                                className="bg-white h-4 rounded-full"
                            ></motion.div>
                        </div>
                        <p className="text-sm text-green-100">18 מתוך 30 דקות - כל הכבוד! 💪</p>
                    </motion.div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <QuickActionButton
                        icon="📚"
                        label="הקורסים שלי"
                        onClick={() => navigate('/my-courses')}
                    />
                    <QuickActionButton
                        icon="🎯"
                        label="היעדים שלי"
                        onClick={() => navigate('/user-dashboard')}
                    />
                    <QuickActionButton
                        icon="📊"
                        label="התקדמות מלאה"
                        onClick={() => navigate('/user-dashboard')}
                    />
                    <QuickActionButton
                        icon="🤖"
                        label="תרגול AI"
                        onClick={() => navigate('/practice')}
                    />
                </div>
            </div>
        </div>
    );
};

// Helper Components
const StatCard = ({ icon, title, value, color, gradient }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-lg p-6"
    >
        <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center text-white mb-3`}>
            {icon}
        </div>
        <p className="text-gray-600 text-sm mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900 capitalize">{value}</p>
    </motion.div>
);

const QuickActionButton = ({ icon, label, onClick }) => (
    <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition"
    >
        <div className="text-4xl mb-3">{icon}</div>
        <p className="text-sm font-semibold text-gray-700">{label}</p>
    </motion.button>
);

export default PersonalizedDashboard;