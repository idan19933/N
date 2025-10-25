// src/pages/HomePage.jsx - MODERN NEXON HOMEPAGE WITH ANIMATIONS
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import {
    Brain, Zap, Target, TrendingUp, Sparkles, Star, CheckCircle,
    Trophy, Rocket, Flame, PlayCircle, BookOpen, Award, Users,
    Clock, Shield, ArrowLeft, ChevronLeft
} from 'lucide-react';
import useAuthStore from '../store/authStore';

// Smooth scroll animation variants
const fadeInUpVariants = {
    hidden: { opacity: 0, y: 60 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.8,
            ease: [0.25, 0.46, 0.45, 0.94],
        },
    },
};

const staggerContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15,
            delayChildren: 0.2,
        },
    },
};

const staggerItemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: [0.25, 0.46, 0.45, 0.94],
        },
    },
};

// Section wrapper
const SmoothSection = ({ children, className }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={fadeInUpVariants}
            className={className}
        >
            {children}
        </motion.div>
    );
};

// Floating Particles
const FloatingParticles = () => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(30)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                        background: i % 3 === 0 ? '#8b5cf6' : i % 3 === 1 ? '#ec4899' : '#f59e0b',
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                        y: [0, -30, 0],
                        x: [0, Math.random() * 20 - 10, 0],
                        opacity: [0.2, 0.5, 0.2],
                        scale: [1, 1.5, 1],
                    }}
                    transition={{
                        duration: 3 + Math.random() * 2,
                        repeat: Infinity,
                        delay: Math.random() * 2,
                        ease: "easeInOut",
                    }}
                />
            ))}
        </div>
    );
};

// Animated Background
const AnimatedBackground = () => {
    const { scrollY } = useScroll();
    const y1 = useSpring(useTransform(scrollY, [0, 500], [0, 150]), { stiffness: 100, damping: 30 });
    const y2 = useSpring(useTransform(scrollY, [0, 500], [0, -100]), { stiffness: 100, damping: 30 });

    return (
        <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400" />

            <motion.div
                className="absolute inset-0 bg-gradient-to-tr from-purple-600/50 via-transparent to-orange-400/50"
                animate={{
                    backgroundPosition: ['0% 0%', '100% 100%'],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    ease: "linear",
                }}
            />

            <motion.div style={{ y: y1 }}>
                <div className="absolute top-20 right-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob" />
            </motion.div>

            <motion.div style={{ y: y2 }}>
                <div className="absolute top-40 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000" />
            </motion.div>

            <FloatingParticles />
        </div>
    );
};

// Feature Card
const FeatureCard = ({ feature, index }) => {
    const Icon = feature.icon;
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={staggerItemVariants}
            whileHover={{ y: -10, scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className="relative group h-full"
        >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 rounded-3xl blur-xl opacity-0 group-hover:opacity-60 transition-all duration-500" />

            <div className="relative h-full bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 hover:border-purple-500/50 transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-orange-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 flex items-center justify-center mb-6 shadow-2xl"
                >
                    <Icon size={36} className="text-white" />
                </motion.div>

                <h3 className="text-2xl font-black text-gray-900 mb-3 relative">
                    {feature.title}
                </h3>

                <p className="text-gray-600 leading-relaxed relative">
                    {feature.description}
                </p>

                {feature.badge && (
                    <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        <span className="text-sm font-bold text-purple-700">{feature.badge}</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

const HomePage = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();

    const features = [
        {
            icon: Brain,
            title: 'בינה מלאכותית מתקדמת',
            description: 'נקסון משתמש ב-AI מתקדם כדי להתאים את הלמידה במיוחד עבורך, מזהה נקודות חוזק וחולשה ומתאים את רמת הקושי',
            badge: 'טכנולוגיה חדשנית'
        },
        {
            icon: Target,
            title: 'למידה מותאמת אישית',
            description: 'כל תלמיד מקבל תוכנית לימוד ייחודית המבוססת על היכולות, המטרות וסגנון הלמידה שלו',
            badge: 'מותאם במיוחד'
        },
        {
            icon: TrendingUp,
            title: 'מעקב אחר התקדמות',
            description: 'צפה בהתקדמות שלך בזמן אמת, עם גרפים ונתונים מפורטים על הביצועים שלך בכל נושא',
            badge: 'נתונים בזמן אמת'
        },
        {
            icon: BookOpen,
            title: 'תיאוריה ותרגול',
            description: 'שילוב מושלם בין למידת תיאוריה לתרגול מעשי, עם מעבר חלק בין שני האזורים',
            badge: 'למידה שלמה'
        },
        {
            icon: Trophy,
            title: 'גמיפיקציה מוטיבציה',
            description: 'הישג משחקים, אתגרים יומיים, ודירוג מתקדם ששומר על המוטיבציה גבוהה',
            badge: 'כיף ללמוד'
        },
        {
            icon: Users,
            title: 'תמיכה צמודה 24/7',
            description: 'נקסון זמין בכל שעה כדי לענות על שאלות, להסביר מחדש ולתת עזרה נוספת',
            badge: 'תמיד פה בשבילך'
        }
    ];

    const stats = [
        { icon: Users, value: '10,000+', label: 'תלמידים פעילים' },
        { icon: BookOpen, value: '50,000+', label: 'שיעורים הושלמו' },
        { icon: Trophy, value: '95%', label: 'שיעור הצלחה' },
        { icon: Star, value: '4.9/5', label: 'דירוג ממוצע' }
    ];

    const testimonials = [
        {
            name: 'שרה כהן',
            grade: 'כיתה ט׳',
            avatar: '👧',
            rating: 5,
            text: 'נקסון שינה לי את הגישה למתמטיקה! עכשיו אני מבינה הכל ואפילו נהנית מהשיעורים',
            badge: 'תלמידת מצטיינת'
        },
        {
            name: 'דניאל לוי',
            grade: 'כיתה יא׳',
            avatar: '👦',
            rating: 5,
            text: 'החומר המותאם אישית והתרגילים המגוונים עזרו לי להעלות את הציון שלי מ-70 ל-95!',
            badge: 'שיפור מדהים'
        },
        {
            name: 'נועה גולן',
            grade: 'כיתה ח׳',
            avatar: '👩',
            rating: 5,
            text: 'נקסון הפך להיות המורה הפרטי שלי. הוא תמיד סבלני ומסביר בדיוק מה שאני צריכה',
            badge: 'לומדת מצטיינת'
        }
    ];

    const handleGetStarted = () => {
        if (user) {
            navigate('/dashboard');
        } else {
            navigate('/register');
        }
    };

    return (
        <div className="min-h-screen bg-white" dir="rtl">
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
                <AnimatedBackground />

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
                        className="text-center"
                    >
                        {/* Logo/Brand */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="mb-8 inline-flex items-center justify-center"
                        >
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-2xl opacity-50 animate-pulse" />
                                <div className="relative bg-white rounded-full p-6 shadow-2xl">
                                    <Brain className="w-20 h-20 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500" style={{ fill: 'url(#gradient)' }} />
                                    <svg width="0" height="0">
                                        <defs>
                                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset="0%" stopColor="#8b5cf6" />
                                                <stop offset="50%" stopColor="#ec4899" />
                                                <stop offset="100%" stopColor="#f59e0b" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                </div>
                            </div>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="text-7xl md:text-8xl font-black text-white mb-6 drop-shadow-2xl"
                        >
                            נקסון
                        </motion.h1>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="mb-8"
                        >
                            <p className="text-3xl md:text-4xl text-white font-bold mb-4">
                                המורה הפרטי שלך למתמטיקה 🚀
                            </p>
                            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                                למד מתמטיקה בצורה חכמה, מהנה ומותאמת אישית עם בינה מלאכותית מתקדמת
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.5 }}
                            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                        >
                            <motion.button
                                whileHover={{ scale: 1.05, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleGetStarted}
                                className="group relative px-12 py-6 bg-white text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-2xl font-black text-2xl shadow-2xl overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-white" />
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 opacity-0 group-hover:opacity-10 transition-opacity" />
                                <span className="relative flex items-center gap-3">
                                    <Rocket className="w-7 h-7" style={{ color: '#8b5cf6' }} />
                                    התחל ללמוד עכשיו!
                                </span>
                            </motion.button>

                            {!user && (
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => navigate('/login')}
                                    className="px-12 py-6 bg-white/10 backdrop-blur-lg text-white rounded-2xl font-bold text-xl border-2 border-white/30 hover:bg-white/20 transition-all shadow-xl"
                                >
                                    כבר יש לי חשבון
                                </motion.button>
                            )}
                        </motion.div>

                        {/* Quick Stats */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.6 }}
                            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
                        >
                            {stats.map((stat, index) => {
                                const Icon = stat.icon;
                                return (
                                    <motion.div
                                        key={index}
                                        whileHover={{ y: -5, scale: 1.05 }}
                                        className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
                                    >
                                        <Icon className="w-8 h-8 text-white mb-3 mx-auto" />
                                        <div className="text-4xl font-black text-white mb-2">{stat.value}</div>
                                        <div className="text-white/80 font-medium">{stat.label}</div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    </motion.div>
                </div>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
                >
                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="text-white text-center"
                    >
                        <ChevronLeft className="w-8 h-8 mx-auto rotate-90" />
                        <p className="text-sm font-medium">גלול למטה</p>
                    </motion.div>
                </motion.div>
            </section>

            {/* Features Section */}
            <SmoothSection className="py-24 px-4 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        variants={staggerContainerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        className="text-center mb-16"
                    >
                        <motion.div variants={staggerItemVariants} className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full mb-6">
                            <Sparkles className="w-5 h-5 text-purple-600" />
                            <span className="text-purple-700 font-bold">למה נקסון?</span>
                        </motion.div>

                        <motion.h2 variants={staggerItemVariants} className="text-5xl md:text-6xl font-black text-gray-900 mb-6">
                            למידה חכמה ומותאמת אישית
                        </motion.h2>

                        <motion.p variants={staggerItemVariants} className="text-xl text-gray-600 max-w-3xl mx-auto">
                            נקסון משלב טכנולוגיה מתקדמת עם פדגוגיה מוכחת כדי לתת לך את חווית הלמידה הטובה ביותר
                        </motion.p>
                    </motion.div>

                    <motion.div
                        variants={staggerContainerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {features.map((feature, index) => (
                            <FeatureCard key={index} feature={feature} index={index} />
                        ))}
                    </motion.div>
                </div>
            </SmoothSection>

            {/* How It Works */}
            <SmoothSection className="py-24 px-4 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full mb-6">
                            <Zap className="w-5 h-5 text-purple-600" />
                            <span className="text-purple-700 font-bold">איך זה עובד?</span>
                        </div>

                        <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-6">
                            3 צעדים פשוטים להצלחה
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                step: '1',
                                icon: Target,
                                title: 'הרשמה ומיפוי',
                                description: 'השלם שאלון קצר ונקסון ילמד את הצרכים והיכולות שלך'
                            },
                            {
                                step: '2',
                                icon: BookOpen,
                                title: 'למד ותרגל',
                                description: 'קבל תוכנית לימוד מותאמת אישית ותרגול חכם עם פידבק מיידי'
                            },
                            {
                                step: '3',
                                icon: Trophy,
                                title: 'התקדם והצלח',
                                description: 'עקוב אחר ההתקדמות שלך וראה את השיפור בזמן אמת'
                            }
                        ].map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.2 }}
                                    whileHover={{ y: -10 }}
                                    className="relative"
                                >
                                    <div className="text-center">
                                        <div className="relative inline-block mb-6">
                                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-xl opacity-30" />
                                            <div className="relative w-24 h-24 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-2xl">
                                                <span className="text-4xl font-black text-white">{item.step}</span>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <Icon className="w-12 h-12 text-purple-600 mx-auto" />
                                        </div>

                                        <h3 className="text-2xl font-black text-gray-900 mb-3">
                                            {item.title}
                                        </h3>

                                        <p className="text-gray-600 leading-relaxed">
                                            {item.description}
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </SmoothSection>

            {/* Testimonials */}
            <SmoothSection className="py-24 px-4 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-lg rounded-full mb-6">
                            <Star className="w-5 h-5 text-white" />
                            <span className="text-white font-bold">מה אומרים עלינו</span>
                        </div>

                        <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
                            תלמידים מרוצים משתפים
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -10, scale: 1.02 }}
                                className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="text-5xl">{testimonial.avatar}</div>
                                            <div>
                                                <h4 className="font-black text-xl text-gray-900">{testimonial.name}</h4>
                                                <p className="text-gray-600">{testimonial.grade}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
                                        {testimonial.badge}
                                    </span>
                                </div>

                                <div className="flex gap-1 mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                    ))}
                                </div>

                                <p className="text-gray-700 leading-relaxed">
                                    "{testimonial.text}"
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </SmoothSection>

            {/* CTA Section */}
            <SmoothSection className="py-24 px-4 bg-gray-900">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-6" />

                        <h2 className="text-5xl md:text-6xl font-black text-white mb-6">
                            מוכן להתחיל?
                        </h2>

                        <p className="text-2xl text-gray-300 mb-10 max-w-2xl mx-auto">
                            הצטרף אלפי תלמידים שכבר משפרים את הציונים שלהם עם נקסון
                        </p>

                        <motion.button
                            whileHover={{ scale: 1.05, boxShadow: "0 20px 60px rgba(139, 92, 246, 0.5)" }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleGetStarted}
                            className="inline-flex items-center gap-3 px-12 py-6 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white text-2xl font-black rounded-2xl shadow-2xl hover:shadow-purple-500/50 transition-all"
                        >
                            <Rocket className="w-7 h-7" />
                            התחל בחינם עכשיו!
                        </motion.button>

                        <p className="text-gray-400 mt-6">
                            ✓ ללא כרטיס אשראי ✓ גישה מיידית ✓ ביטול בכל עת
                        </p>
                    </motion.div>
                </div>
            </SmoothSection>

            {/* Footer */}
            <footer className="bg-gray-950 text-gray-400 py-12 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Brain className="w-8 h-8 text-purple-500" />
                        <span className="text-2xl font-black text-white">נקסון</span>
                    </div>

                    <p className="mb-6">המורה הפרטי שלך למתמטיקה • זמין 24/7</p>

                    <div className="flex justify-center gap-6 mb-6">
                        <a href="#" className="hover:text-white transition-colors">תנאי שימוש</a>
                        <a href="#" className="hover:text-white transition-colors">מדיניות פרטיות</a>
                        <a href="#" className="hover:text-white transition-colors">צור קשר</a>
                    </div>

                    <p className="text-sm">
                        © 2025 נקסון. כל הזכויות שמורות.
                    </p>
                </div>
            </footer>

            <style jsx>{`
                @keyframes blob {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    25% { transform: translate(20px, -50px) scale(1.1); }
                    50% { transform: translate(-20px, 20px) scale(0.9); }
                    75% { transform: translate(50px, 50px) scale(1.05); }
                }

                .animate-blob {
                    animation: blob 7s infinite;
                }

                .animation-delay-2000 {
                    animation-delay: 2s;
                }

                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </div>
    );
};

export default HomePage;