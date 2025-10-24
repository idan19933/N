import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Check, X, Star, Zap, Crown, Sparkles, Trophy, Target,
    BookOpen, MessageCircle, BarChart3, Palette, Shield, Rocket
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { createCheckoutSession } from '../services/paymentService';
import toast from 'react-hot-toast';

const PlansPage = () => {
    const navigate = useNavigate();
    const { user, isPremium } = useAuthStore();
    const [billingCycle, setBillingCycle] = useState('monthly');
    const [loading, setLoading] = useState(false);

    // Define Premium product IDs
    const PREMIUM_PRODUCTS = {
        monthly: 'premium_monthly',
        yearly: 'premium_yearly'
    };

    const plans = [
        {
            name: 'Basic',
            nameHe: 'בסיסי',
            price: 0,
            priceYearly: 0,
            icon: BookOpen,
            color: 'from-blue-500 to-cyan-500',
            features: [
                { text: 'גישה לכל חומר התיאוריה', included: true, icon: BookOpen },
                { text: 'תרגול רגיל עם שאלות בסיסיות', included: true, icon: Target },
                { text: 'מחברת דיגיטלית בסיסית', included: true, icon: BookOpen },
                { text: 'מעקב התקדמות בסיסי', included: true, icon: BarChart3 },
                { text: 'שאלות מותאמות אישית עם AI', included: false, icon: Sparkles },
                { text: 'נקסון Ask - צ\'אט עם העוזר החכם', included: false, icon: MessageCircle },
                { text: 'אישיות מורה מותאמת אישית', included: false, icon: Palette },
                { text: 'המלצות תרגול חכמות', included: false, icon: Zap },
                { text: 'ניתוח תשובות מתמונה', included: false, icon: Shield },
                { text: 'סטטיסטיקות מתקדמות', included: false, icon: BarChart3 },
                { text: 'תמיכה מועדפת', included: false, icon: Star }
            ],
            cta: 'התחל חינם',
            popular: false
        },
        {
            name: 'Premium',
            nameHe: 'פרימיום',
            price: 49,
            priceYearly: 490,
            icon: Crown,
            color: 'from-purple-600 to-pink-600',
            features: [
                { text: 'גישה לכל חומר התיאוריה', included: true, icon: BookOpen },
                { text: 'תרגול רגיל עם שאלות בסיסיות', included: true, icon: Target },
                { text: 'מחברת דיגיטלית מלאה', included: true, icon: BookOpen },
                { text: 'מעקב התקדמות מתקדם', included: true, icon: BarChart3 },
                { text: 'שאלות מותאמות אישית עם AI', included: true, icon: Sparkles, highlight: true },
                { text: 'נקסון Ask - צ\'אט עם העוזר החכם', included: true, icon: MessageCircle, highlight: true },
                { text: 'אישיות מורה מותאמת אישית', included: true, icon: Palette, highlight: true },
                { text: 'המלצות תרגול חכמות', included: true, icon: Zap, highlight: true },
                { text: 'ניתוח תשובות מתמונה', included: true, icon: Shield, highlight: true },
                { text: 'סטטיסטיקות מתקדמות', included: true, icon: BarChart3 },
                { text: 'תמיכה מועדפת', included: true, icon: Star }
            ],
            cta: 'שדרג לפרימיום',
            popular: true
        }
    ];

    const handleUpgrade = async (plan) => {
        if (!user) {
            toast.error('יש להתחבר כדי לשדרג');
            navigate('/login');
            return;
        }

        if (plan !== 'premium') {
            navigate('/register');
            return;
        }

        if (isPremium) {
            toast.success('כבר יש לך חשבון פרימיום! 🎉');
            navigate('/dashboard');
            return;
        }

        setLoading(true);

        try {
            const productId = billingCycle === 'monthly'
                ? PREMIUM_PRODUCTS.monthly
                : PREMIUM_PRODUCTS.yearly;

            const price = billingCycle === 'monthly' ? 49 : 490;

            toast.loading('מעביר לתשלום מאובטח...', { duration: 2000 });

            const result = await createCheckoutSession(productId, price);

            if (result.success && result.url) {
                window.location.href = result.url;
            } else {
                throw new Error(result.error || 'שגיאה ביצירת תשלום');
            }
        } catch (error) {
            console.error('Payment error:', error);
            toast.error('שגיאה בתהליך התשלום. נסה שוב.');
        } finally {
            setLoading(false);
        }
    };

    const savings = Math.round(((plans[1].price * 12 - plans[1].priceYearly) / (plans[1].price * 12)) * 100);

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-orange-900 py-16 px-4" dir="rtl">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-lg rounded-full mb-4">
                        <Rocket className="w-5 h-5 text-yellow-400" />
                        <span className="text-white font-bold">בחר את התוכנית המתאימה לך</span>
                    </div>
                    <h1 className="text-5xl font-black text-white mb-4">
                        תוכניות ומחירים
                    </h1>
                    <p className="text-xl text-white/80 max-w-2xl mx-auto">
                        התחל חינם או שדרג לפרימיום עם כל היכולות של AI מתקדם
                    </p>
                    {isPremium && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
                        >
                            <Crown className="w-5 h-5 text-purple-900" />
                            <span className="text-purple-900 font-black">יש לך חשבון פרימיום פעיל! 🎉</span>
                        </motion.div>
                    )}
                </motion.div>

                {/* Billing Toggle */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="flex justify-center mb-12"
                >
                    <div className="bg-white/10 backdrop-blur-lg rounded-full p-1 flex gap-1">
                        <button
                            onClick={() => setBillingCycle('monthly')}
                            className={`px-6 py-3 rounded-full font-bold transition-all ${
                                billingCycle === 'monthly'
                                    ? 'bg-white text-purple-900 shadow-lg'
                                    : 'text-white hover:bg-white/10'
                            }`}
                        >
                            חודשי
                        </button>
                        <button
                            onClick={() => setBillingCycle('yearly')}
                            className={`px-6 py-3 rounded-full font-bold transition-all relative ${
                                billingCycle === 'yearly'
                                    ? 'bg-white text-purple-900 shadow-lg'
                                    : 'text-white hover:bg-white/10'
                            }`}
                        >
                            שנתי
                            <span className="absolute -top-2 -left-2 bg-yellow-400 text-purple-900 text-xs font-black px-2 py-1 rounded-full">
                                חסוך {savings}%
                            </span>
                        </button>
                    </div>
                </motion.div>

                {/* Plans Grid */}
                <div className="grid md:grid-cols-2 gap-8 mb-16">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + index * 0.1 }}
                            className={`relative bg-white/95 backdrop-blur-lg rounded-3xl p-8 shadow-2xl ${
                                plan.popular ? 'ring-4 ring-yellow-400' : ''
                            }`}
                        >
                            {plan.popular && (
                                <div className="absolute -top-4 right-1/2 transform translate-x-1/2">
                                    <div className="bg-gradient-to-r from-yellow-400 to-orange-400 px-6 py-2 rounded-full shadow-lg">
                                        <div className="flex items-center gap-2">
                                            <Star className="w-4 h-4 text-white fill-white" />
                                            <span className="text-white font-black text-sm">הכי פופולרי</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="text-center mb-8 mt-4">
                                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${plan.color} mb-4`}>
                                    <plan.icon className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-3xl font-black text-gray-900 mb-2">{plan.nameHe}</h2>
                                <div className="flex items-baseline justify-center gap-2">
                                    <span className="text-5xl font-black text-gray-900">
                                        ₪{billingCycle === 'monthly' ? plan.price : Math.round(plan.priceYearly / 12)}
                                    </span>
                                    <span className="text-gray-600 font-bold">/חודש</span>
                                </div>
                                {billingCycle === 'yearly' && plan.priceYearly > 0 && (
                                    <p className="text-sm text-gray-600 mt-2">
                                        ₪{plan.priceYearly} לשנה (חיוב שנתי)
                                    </p>
                                )}
                            </div>

                            <div className="space-y-3 mb-8">
                                {plan.features.map((feature, idx) => (
                                    <div
                                        key={idx}
                                        className={`flex items-start gap-3 ${
                                            feature.highlight ? 'bg-purple-50 p-2 rounded-lg' : ''
                                        }`}
                                    >
                                        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                                            feature.included ? 'bg-green-100' : 'bg-gray-100'
                                        }`}>
                                            {feature.included ? (
                                                <Check className="w-4 h-4 text-green-600" />
                                            ) : (
                                                <X className="w-4 h-4 text-gray-400" />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 flex-1">
                                            <feature.icon className={`w-4 h-4 ${
                                                feature.included ? 'text-purple-600' : 'text-gray-400'
                                            }`} />
                                            <span className={`text-sm ${
                                                feature.included ? 'text-gray-900 font-medium' : 'text-gray-500'
                                            }`}>
                                                {feature.text}
                                            </span>
                                            {feature.highlight && (
                                                <Sparkles className="w-4 h-4 text-yellow-500" />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleUpgrade(plan.name.toLowerCase())}
                                disabled={loading}
                                className={`w-full py-4 rounded-xl font-black text-lg transition-all ${
                                    plan.popular
                                        ? `bg-gradient-to-r ${plan.color} text-white shadow-lg hover:shadow-xl disabled:opacity-50`
                                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200 disabled:opacity-50'
                                }`}
                            >
                                {loading ? 'מעבד...' : plan.cta}
                            </motion.button>
                        </motion.div>
                    ))}
                </div>

                {/* FAQ */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white/10 backdrop-blur-lg rounded-3xl p-8"
                >
                    <h2 className="text-3xl font-black text-white text-center mb-8">שאלות נפוצות</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        {[
                            { q: 'האם אפשר לבטל בכל עת?', a: 'כן! אפשר לבטל את המנוי בכל רגע ללא עלויות נוספות.' },
                            { q: 'מה קורה אם אני מבטל את הפרימיום?', a: 'תחזור לגרסת Basic עם שמירה על כל ההתקדמות והמחברת שלך.' },
                            { q: 'האם יש הנחה לתלמידים?', a: 'כן! צור קשר עם התמיכה לקבלת הנחה מיוחדת לתלמידים.' },
                            { q: 'איך משדרגים לפרימיום?', a: 'לחץ על "שדרג לפרימיום" ובצע תשלום מאובטח. הגישה תפתח מיד!' }
                        ].map((faq, idx) => (
                            <div key={idx} className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
                                <h3 className="text-lg font-bold text-white mb-2">{faq.q}</h3>
                                <p className="text-white/80">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Trust Badges */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center mt-12"
                >
                    <div className="flex justify-center items-center gap-8 flex-wrap">
                        <div className="flex items-center gap-2 text-white/80">
                            <Shield className="w-5 h-5" />
                            <span className="text-sm">תשלום מאובטח</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/80">
                            <Trophy className="w-5 h-5" />
                            <span className="text-sm">מאות תלמידים מרוצים</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/80">
                            <Zap className="w-5 h-5" />
                            <span className="text-sm">תמיכה 24/7</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default PlansPage;