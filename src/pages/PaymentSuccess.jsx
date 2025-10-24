import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Sparkles, Rocket, ArrowRight, Book, Target, Trophy } from 'lucide-react';
import useAuthStore from '../store/authStore';

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const user = useAuthStore(state => state.user);
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        // Auto-redirect after 5 seconds
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    navigate('/dashboard');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [navigate]);

    const sessionId = searchParams.get('session_id');

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4" dir="rtl">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-white/95 backdrop-blur-lg rounded-3xl p-12 max-w-2xl w-full shadow-2xl"
            >
                {/* Success Icon */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="flex justify-center mb-8"
                >
                    <div className="relative">
                        <div className="absolute inset-0 bg-green-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
                        <div className="relative bg-gradient-to-br from-green-400 to-emerald-600 rounded-full p-6">
                            <CheckCircle className="w-20 h-20 text-white" strokeWidth={3} />
                        </div>
                    </div>
                </motion.div>

                {/* Title */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-4xl font-black text-gray-900 mb-3 flex items-center justify-center gap-3">
                        <Sparkles className="w-8 h-8 text-yellow-500" />
                        הרכישה הושלמה בהצלחה!
                        <Sparkles className="w-8 h-8 text-yellow-500" />
                    </h1>
                    <p className="text-xl text-gray-600">
                        הרכישה שלך הושלמה והקורס כבר מחכה לך
                    </p>
                </motion.div>

                {/* Details Box */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 mb-8"
                >
                    <div className="flex items-start gap-4 mb-4">
                        <div className="p-3 bg-white rounded-xl shadow-sm">
                            <Trophy className="w-6 h-6 text-purple-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-gray-900 mb-2">הקורס זמין עכשיו! 🎉</h3>
                            <p className="text-gray-700 text-sm leading-relaxed">
                                נקודתי זיכוי נוספו למערכת והקורס מחכה לך באזור "הקורסים שלי"
                            </p>
                        </div>
                    </div>

                    {sessionId && (
                        <div className="bg-white rounded-xl p-4 mt-4">
                            <p className="text-xs text-gray-500 mb-1">מזהה עסקה:</p>
                            <p className="text-sm font-mono text-gray-900 break-all">{sessionId}</p>
                        </div>
                    )}
                </motion.div>

                {/* Features List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-3 mb-8"
                >
                    {[
                        { icon: Book, text: 'גישה מלאה לכל חומרי הקורס' },
                        { icon: Target, text: 'תרגול ממוקד עם נקסון AI' },
                        { icon: Sparkles, text: 'מעקב התקדמות חכם' }
                    ].map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 + idx * 0.1 }}
                            className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-transparent rounded-xl"
                        >
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <item.icon className="w-5 h-5 text-purple-600" />
                            </div>
                            <span className="text-gray-900 font-medium">{item.text}</span>
                        </motion.div>
                    ))}
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="space-y-3"
                >
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate('/dashboard')}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-black text-lg flex items-center justify-center gap-3 hover:shadow-xl transition-all"
                    >
                        <Rocket className="w-6 h-6" />
                        <span>התחל ללמוד</span>
                        <ArrowRight className="w-5 h-5" />
                    </motion.button>

                    <button
                        onClick={() => navigate('/my-courses')}
                        className="w-full bg-gray-100 text-gray-900 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all"
                    >
                        לך לקורסים שלי
                    </button>
                </motion.div>

                {/* Auto Redirect Counter */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="text-center mt-6"
                >
                    <p className="text-sm text-gray-500">
                        מועבר אוטומטית לדשבורד בעוד {countdown} שניות...
                    </p>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default PaymentSuccess;