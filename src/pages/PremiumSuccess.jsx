import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crown, Sparkles, CheckCircle, ArrowRight } from 'lucide-react';
import useAuthStore from '../store/authStore';
import toast from 'react-hot-toast';

const PremiumSuccess = () => {
    const navigate = useNavigate();
    const checkPremiumStatus = useAuthStore(state => state.checkPremiumStatus);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const verifyPremium = async () => {
            await new Promise(resolve => setTimeout(resolve, 2000));
            await checkPremiumStatus();
            setChecking(false);
            toast.success('🎉 ברוך הבא לפרימיום!');
        };

        verifyPremium();
    }, [checkPremiumStatus]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 flex items-center justify-center p-4" dir="rtl">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl p-12 max-w-2xl w-full text-center shadow-2xl"
            >
                {checking ? (
                    <>
                        <div className="animate-spin w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-6" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            מעבד את התשלום...
                        </h2>
                        <p className="text-gray-600">אנא המתן רגע</p>
                    </>
                ) : (
                    <>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', duration: 0.5 }}
                            className="inline-flex p-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mb-6"
                        >
                            <Crown className="w-16 h-16 text-white" />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h1 className="text-4xl font-black text-gray-900 mb-4">
                                ברוך הבא לפרימיום! 🎉
                            </h1>
                            <p className="text-xl text-gray-600 mb-8">
                                החשבון שלך שודרג בהצלחה. כעת יש לך גישה לכל היכולות המתקדמות!
                            </p>

                            <div className="bg-purple-50 rounded-2xl p-6 mb-8 text-right">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">
                                    מה חדש בפרימיום:
                                </h3>
                                <div className="space-y-3">
                                    {[
                                        'שאלות מותאמות אישית עם AI מתקדם',
                                        'נקסון Ask - צ\'אט חכם 24/7',
                                        'אישיות מורה מותאמת אישית',
                                        'ניתוח תשובות מתמונה',
                                        'סטטיסטיקות מתקדמות',
                                        'תמיכה מועדפת'
                                    ].map((feature, idx) => (
                                        <div key={idx} className="flex items-center gap-3">
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                            <span className="text-gray-900">{feature}</span>
                                            <Sparkles className="w-4 h-4 text-yellow-500" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => navigate('/dashboard')}
                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-black text-lg flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                            >
                                <span>התחל ללמוד</span>
                                <ArrowRight className="w-5 h-5" />
                            </motion.button>
                        </motion.div>
                    </>
                )}
            </motion.div>
        </div>
    );
};

export default PremiumSuccess;