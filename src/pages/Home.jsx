import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { BookOpen, Users, Award, TrendingUp, Sparkles, Zap, ArrowLeft, Star, CheckCircle, Shield, Clock, Trophy, Rocket, Flame, Target, PlayCircle } from 'lucide-react';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import CourseCard from '../components/courses/CourseCard';
import { fetchCourses } from '../services/courseService';
import useAuthStore from '../store/authStore';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

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

const fadeInVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { duration: 1, ease: 'easeOut' },
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

const scaleInVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.8,
            ease: [0.25, 0.46, 0.45, 0.94],
        },
    },
};

// Section wrapper with smooth transitions
const SmoothSection = ({ children, className, delay = 0 }) => {
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
                        background: i % 3 === 0 ? '#667eea' : i % 3 === 1 ? '#764ba2' : '#f093fb',
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

// Animated Background with Parallax
const AnimatedBackground = () => {
    const { scrollY } = useScroll();
    const y1 = useSpring(useTransform(scrollY, [0, 500], [0, 150]), { stiffness: 100, damping: 30 });
    const y2 = useSpring(useTransform(scrollY, [0, 500], [0, -100]), { stiffness: 100, damping: 30 });
    const y3 = useSpring(useTransform(scrollY, [0, 500], [0, 50]), { stiffness: 100, damping: 30 });
    const rotate = useSpring(useTransform(scrollY, [0, 500], [0, 360]), { stiffness: 100, damping: 30 });
    const scale = useSpring(useTransform(scrollY, [0, 300], [1, 1.2]), { stiffness: 100, damping: 30 });

    return (
        <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[#667eea] via-[#764ba2] to-[#f093fb]" />

            <motion.div
                className="absolute inset-0 bg-gradient-to-tr from-[#667eea]/50 via-transparent to-[#f093fb]/50"
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

            <motion.div style={{ y: y1, scale }}>
                <div className="absolute top-20 right-20 w-96 h-96 bg-[#667eea] rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob" />
            </motion.div>

            <motion.div style={{ y: y2, rotate }}>
                <div className="absolute top-40 left-20 w-96 h-96 bg-[#764ba2] rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000" />
            </motion.div>

            <motion.div style={{ y: y3 }}>
                <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-[#f093fb] rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000" />
            </motion.div>

            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20" />

            <FloatingParticles />
        </div>
    );
};

// Modern Feature Card
const ModernFeatureCard = ({ feature, index }) => {
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
            <div className="absolute inset-0 bg-gradient-to-r from-[#667eea] via-[#764ba2] to-[#f093fb] rounded-3xl blur-xl opacity-0 group-hover:opacity-60 transition-all duration-500" />

            <div className="relative h-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-gray-700/50 hover:border-[#667eea]/50 transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#667eea]/5 via-[#764ba2]/5 to-[#f093fb]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-[#667eea] via-[#764ba2] to-[#f093fb] flex items-center justify-center mb-6 shadow-2xl"
                >
                    <Icon size={36} className="text-white" />
                    <motion.div
                        className="absolute inset-0 rounded-2xl bg-white"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                </motion.div>

                <h3 className="relative text-2xl font-black text-gray-800 dark:text-white mb-3 bg-gradient-to-r from-[#667eea] via-[#764ba2] to-[#f093fb] bg-clip-text text-transparent">
                    {feature.title}
                </h3>
                <p className="relative text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                    {feature.desc}
                </p>

                <div className="absolute top-4 left-4 w-16 h-16 bg-gradient-to-br from-[#667eea]/10 to-transparent rounded-full blur-2xl" />
                <div className="absolute bottom-4 right-4 w-20 h-20 bg-gradient-to-tl from-[#f093fb]/10 to-transparent rounded-full blur-2xl" />
            </div>
        </motion.div>
    );
};

// Animated Wave
const AnimatedWave = () => {
    return (
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
            <svg className="w-full h-24" viewBox="0 0 1440 120" preserveAspectRatio="none">
                <motion.path
                    d="M0,64 C320,96 640,32 960,64 C1280,96 1440,64 1440,64 L1440,120 L0,120 Z"
                    fill="currentColor"
                    className="text-gray-50 dark:text-gray-900"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                />
            </svg>
        </div>
    );
};

// Enhanced Stats Counter
const AnimatedCounter = ({ value, label, gradient, icon: Icon }) => {
    const [count, setCount] = useState(0);
    const targetValue = parseInt(value.replace(/[^0-9]/g, '')) || 0;
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    useEffect(() => {
        if (!isInView) return;

        const duration = 2000;
        const steps = 60;
        const increment = targetValue / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= targetValue) {
                setCount(targetValue);
                clearInterval(timer);
            } else {
                setCount(Math.floor(current));
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [targetValue, isInView]);

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={scaleInVariants}
            whileHover={{ scale: 1.08, y: -8 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative group cursor-pointer"
        >
            <div className="absolute inset-0 bg-gradient-to-r from-[#667eea] via-[#764ba2] to-[#f093fb] rounded-2xl blur-2xl opacity-30 group-hover:opacity-60 transition-all duration-500" />

            <div className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/50 dark:border-gray-700/50 overflow-hidden">
                <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-[#667eea]/10 via-[#764ba2]/10 to-[#f093fb]/10"
                    animate={{
                        backgroundPosition: ['0% 0%', '100% 100%'],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        repeatType: 'reverse',
                        ease: "linear",
                    }}
                />

                {Icon && (
                    <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="relative mb-2"
                    >
                        <Icon className="w-8 h-8 text-[#667eea]" />
                    </motion.div>
                )}

                <div className={`relative text-5xl font-black bg-gradient-to-r ${gradient} bg-clip-text text-transparent mb-2`}>
                    {count}{value.includes('+') ? '+' : ''}{value.includes('%') ? '%' : ''}
                </div>

                <div className="relative text-gray-700 dark:text-gray-300 font-bold text-lg">
                    {label}
                </div>
            </div>
        </motion.div>
    );
};

// Benefit Card
const BenefitCard = ({ icon: Icon, title, items, index }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={{
                hidden: { opacity: 0, y: 50 },
                visible: {
                    opacity: 1,
                    y: 0,
                    transition: {
                        duration: 0.6,
                        delay: index * 0.1,
                        ease: [0.25, 0.46, 0.45, 0.94],
                    },
                },
            }}
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ duration: 0.3 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-300"
        >
            <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#667eea] to-[#764ba2] flex items-center justify-center shadow-lg">
                    <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-black text-gray-800 dark:text-white">{title}</h3>
            </div>
            <motion.ul
                className="space-y-2"
                variants={staggerContainerVariants}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
            >
                {items.map((item, i) => (
                    <motion.li
                        key={i}
                        variants={staggerItemVariants}
                        className="flex items-center gap-2 text-gray-700 dark:text-gray-300"
                    >
                        <CheckCircle className="w-5 h-5 text-[#667eea] flex-shrink-0" />
                        <span>{item}</span>
                    </motion.li>
                ))}
            </motion.ul>
        </motion.div>
    );
};

const Home = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState([]);

    const { scrollY } = useScroll();
    // Fade ONLY happens after significant scrolling - most of hero stays visible
    const heroOpacity = useSpring(useTransform(scrollY, [400, 1000], [1, 0]), { stiffness: 100, damping: 30 });
    const heroY = useSpring(useTransform(scrollY, [0, 800], [0, -100]), { stiffness: 100, damping: 30 });

    useEffect(() => {
        loadCourses();
        loadTopReviews();
    }, []);

    const loadCourses = async () => {
        try {
            const { courses: newCourses } = await fetchCourses(null, 12);
            setCourses(newCourses);
        } catch (error) {
            console.error('Error loading courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadTopReviews = async () => {
        try {
            const reviewsQuery = query(
                collection(db, 'reviews'),
                where('rating', '>=', 4),
                orderBy('rating', 'desc'),
                orderBy('createdAt', 'desc'),
                limit(6)
            );

            const reviewsSnapshot = await getDocs(reviewsQuery);
            const reviewsData = reviewsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setReviews(reviewsData);
        } catch (error) {
            console.error('Error loading reviews:', error);
        }
    };

    const featuredCourses = courses.slice(0, 6);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900" dir="rtl">
            {/* Hero Section */}
            <div className="relative overflow-hidden min-h-screen flex items-center">
                <AnimatedBackground />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-transparent z-[5]" />

                <div className="relative z-10 w-full max-w-7xl mx-auto px-4 py-20">
                    <div className="text-center">
                        {/* Content that fades with scroll */}
                        <motion.div style={{ opacity: heroOpacity, y: heroY }}>
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                                className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full px-6 py-3 mb-8"
                            >
                                <Flame className="w-5 h-5 text-orange-400" />
                                <span className="text-white font-bold">הפלטפורמה המובילה בישראל</span>
                                <Sparkles className="w-5 h-5 text-yellow-400" />
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
                                className="mb-8 flex justify-center"
                            >
                                <motion.div
                                    whileHover={{ scale: 1.05, rotate: 5 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                    className="relative group"
                                >
                                    <div className="absolute inset-0 bg-white rounded-full blur-3xl opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                                    <div className="relative bg-white rounded-full p-8 shadow-2xl border-4 border-white/50">
                                        <img
                                            src="/logo.png"
                                            alt="Nexon Education"
                                            className="h-32 w-auto object-contain"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.parentElement.innerHTML = '<div class="text-6xl font-black bg-gradient-to-r from-[#667eea] via-[#764ba2] to-[#f093fb] bg-clip-text text-transparent">NEXON</div>';
                                            }}
                                        />
                                    </div>
                                </motion.div>
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                                className="text-white text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-6 px-4 drop-shadow-2xl leading-tight"
                            >
                                למד את הכישורים
                                <br />
                                <span className="bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                                    של המחר
                                </span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6, duration: 0.8, ease: "easeOut" }}
                                className="text-white/95 text-xl sm:text-2xl md:text-3xl mb-12 font-bold max-w-3xl mx-auto px-4 drop-shadow-lg"
                            >
                                הצטרפו ל-10,000+ סטודנטים מצליחים 🚀
                            </motion.p>
                        </motion.div>

                        {/* Stats - Don't fade */}
                        <motion.div
                            className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12 px-4"
                            initial="hidden"
                            animate="visible"
                            variants={staggerContainerVariants}
                        >
                            <AnimatedCounter
                                value={`${courses.length || 0}+`}
                                label="קורסים זמינים"
                                gradient="from-[#667eea] to-[#764ba2]"
                                icon={BookOpen}
                            />
                            <AnimatedCounter
                                value="10000+"
                                label="סטודנטים מרוצים"
                                gradient="from-[#764ba2] to-[#f093fb]"
                                icon={Users}
                            />
                            <AnimatedCounter
                                value="98%"
                                label="דירוג שביעות רצון"
                                gradient="from-[#f093fb] to-[#667eea]"
                                icon={Trophy}
                            />
                        </motion.div>

                        {/* CTA Buttons - NEVER fade, always visible and clickable */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                            className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4 relative z-20"
                        >
                            <motion.button
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                onClick={() => navigate('/courses')}
                                className="group w-full sm:w-auto px-12 py-5 bg-white text-[#667eea] rounded-2xl font-black text-xl shadow-2xl hover:shadow-[#667eea]/50 transition-all relative overflow-hidden"
                            >
                                <span className="absolute inset-0 bg-gradient-to-r from-[#667eea] via-[#764ba2] to-[#f093fb] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <span className="relative flex items-center justify-center gap-2 group-hover:text-white transition-colors duration-300">
                                    <Sparkles className="w-6 h-6" />
                                    צפו בכל הקורסים
                                    <ArrowLeft className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" />
                                </span>
                            </motion.button>

                            {!isAuthenticated && (
                                <motion.button
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                    onClick={() => navigate('/register')}
                                    className="w-full sm:w-auto px-12 py-5 bg-gradient-to-r from-[#667eea] via-[#764ba2] to-[#f093fb] text-white border-4 border-white/30 rounded-2xl font-black text-xl shadow-2xl hover:shadow-purple-500/50 transition-all"
                                >
                                    הצטרפו עכשיו בחינם 🎉
                                </motion.button>
                            )}
                        </motion.div>
                    </div>
                </div>

                <AnimatedWave />
            </div>

            {/* Trust Badges Section */}
            <SmoothSection className="py-12 bg-gray-50 dark:bg-gray-900">
                <motion.div
                    variants={staggerContainerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="max-w-7xl mx-auto px-4"
                >
                    <div className="flex flex-wrap justify-center items-center gap-8 text-gray-600 dark:text-gray-400">
                        {[
                            { icon: Shield, text: 'תשלום מאובטח' },
                            { icon: CheckCircle, text: 'תעודה מוכרת' },
                            { icon: Clock, text: 'גישה מיידית' },
                            { icon: Trophy, text: 'אחריות 30 יום' },
                        ].map((badge, i) => (
                            <motion.div
                                key={i}
                                variants={staggerItemVariants}
                                className="flex items-center gap-2"
                            >
                                <badge.icon className="w-6 h-6 text-[#667eea]" />
                                <span className="font-bold">{badge.text}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </SmoothSection>

            {/* Features Section */}
            <SmoothSection className="py-20 bg-white dark:bg-gray-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#667eea]/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#f093fb]/10 rounded-full blur-3xl" />

                <div className="max-w-7xl mx-auto px-4 relative">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={fadeInUpVariants}
                        className="text-center mb-16"
                    >
                        <motion.div
                            animate={{ rotate: [0, 360] }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="inline-block mb-4"
                        >
                            <Sparkles className="w-12 h-12 text-[#667eea]" />
                        </motion.div>
                        <h2 className="text-5xl font-black text-gray-800 dark:text-white mb-4">
                            למה לבחור בנו?
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-400">
                            הסיבות שהופכות אותנו למובילים בתחום
                        </p>
                    </motion.div>

                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                        variants={staggerContainerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                    >
                        {[
                            { icon: BookOpen, title: 'תוכן איכותי', desc: 'וידאו באיכות 4K עם הסברים ברורים ומפורטים' },
                            { icon: Users, title: 'מרצים מומחים', desc: 'מקצוענים מובילים מהתעשייה עם ניסיון עשיר' },
                            { icon: Award, title: 'תעודת הסמכה', desc: 'תעודה מוכרת בתעשייה שתגביר את הסיכויים שלך' },
                            { icon: TrendingUp, title: 'גישה לכל החיים', desc: 'שלם פעם אחת וקבל גישה ללא הגבלת זמן' },
                        ].map((feature, index) => (
                            <ModernFeatureCard key={index} feature={feature} index={index} />
                        ))}
                    </motion.div>
                </div>
            </SmoothSection>

            {/* Benefits Section */}
            <SmoothSection className="py-20 bg-gray-50 dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-4">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={fadeInUpVariants}
                        className="text-center mb-16"
                    >
                        <h2 className="text-5xl font-black text-gray-800 dark:text-white mb-4">
                            מה תקבלו? 🎁
                        </h2>
                        <p className="text-xl text-gray-600 dark:text-gray-400">
                            חבילה מלאה לחוויית למידה מושלמת
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            {
                                icon: Rocket,
                                title: 'למידה מתקדמת',
                                items: ['תוכן מעודכן שבועית', 'פרויקטים מעשיים', 'קהילת תמיכה פעילה', 'עזרה צמודה מהמדריכים'],
                            },
                            {
                                icon: Target,
                                title: 'כלים מקצועיים',
                                items: ['משאבים להורדה', 'תבניות ודוגמאות', 'כלים נוספים', 'גישה למשאבים בלעדיים'],
                            },
                            {
                                icon: Trophy,
                                title: 'הכרה והסמכה',
                                items: ['תעודה דיגיטלית', 'תג LinkedIn', 'פרופיל בוגרים', 'המלצות מקצועיות'],
                            },
                        ].map((benefit, i) => (
                            <BenefitCard key={i} {...benefit} index={i} />
                        ))}
                    </div>
                </div>
            </SmoothSection>

            {/* Featured Courses */}
            {featuredCourses.length > 0 && (
                <SmoothSection className="py-20 bg-white dark:bg-gray-800">
                    <div className="max-w-7xl mx-auto px-4">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                            variants={fadeInUpVariants}
                            className="text-center mb-16"
                        >
                            <h2 className="text-5xl font-black text-gray-800 dark:text-white mb-4">
                                הקורסים המומלצים שלנו ⭐
                            </h2>
                            <p className="text-xl text-gray-600 dark:text-gray-400">
                                הקורסים הפופולריים והמבוקשים ביותר
                            </p>
                        </motion.div>

                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                            variants={staggerContainerVariants}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-50px" }}
                        >
                            {featuredCourses.map((course, index) => (
                                <motion.div
                                    key={course.id}
                                    variants={staggerItemVariants}
                                >
                                    <CourseCard course={course} />
                                </motion.div>
                            ))}
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                            className="text-center mt-12"
                        >
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                onClick={() => navigate('/courses')}
                                className="px-10 py-4 bg-gradient-to-r from-[#667eea] via-[#764ba2] to-[#f093fb] text-white rounded-xl font-bold text-lg shadow-2xl hover:shadow-[#667eea]/50 transition-all"
                            >
                                צפו בכל הקורסים
                            </motion.button>
                        </motion.div>
                    </div>
                </SmoothSection>
            )}

            {/* Reviews Section */}
            {reviews.length > 0 && (
                <SmoothSection className="py-20 bg-gray-50 dark:bg-gray-900">
                    <div className="max-w-7xl mx-auto px-4">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-100px" }}
                            variants={fadeInUpVariants}
                            className="text-center mb-16"
                        >
                            <h2 className="text-5xl font-black text-gray-800 dark:text-white mb-4">
                                מה אומרים עלינו? 💬
                            </h2>
                            <p className="text-xl text-gray-600 dark:text-gray-400">
                                חוות דעת אמיתיות מסטודנטים מרוצים
                            </p>
                        </motion.div>

                        <Swiper
                            modules={[Autoplay, Pagination, Navigation]}
                            spaceBetween={30}
                            slidesPerView={1}
                            autoplay={{ delay: 5000, disableOnInteraction: false }}
                            pagination={{ clickable: true }}
                            navigation
                            breakpoints={{
                                640: { slidesPerView: 2 },
                                1024: { slidesPerView: 3 },
                            }}
                            className="pb-12"
                        >
                            {reviews.map((review) => (
                                <SwiperSlide key={review.id}>
                                    <motion.div
                                        whileHover={{ y: -5 }}
                                        transition={{ duration: 0.3 }}
                                        className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all border border-gray-200/50 dark:border-gray-700/50 h-full"
                                    >
                                        <div className="flex items-center gap-1 mb-4">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    size={20}
                                                    className={i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">{review.comment}</p>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-[#667eea] via-[#764ba2] to-[#f093fb] rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                                                {review.userName?.charAt(0) || 'A'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-800 dark:text-white">{review.userName || 'אנונימי'}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>
                </SmoothSection>
            )}

            {/* Final CTA */}
            {!isAuthenticated && (
                <SmoothSection className="relative py-20 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#667eea] via-[#764ba2] to-[#f093fb]" />

                    <div className="absolute inset-0 opacity-30">
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, 30, 0] }}
                            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute top-10 left-1/4 w-96 h-96 bg-white rounded-full filter blur-3xl"
                        />
                        <motion.div
                            animate={{ scale: [1, 1.3, 1], x: [0, -50, 0], y: [0, -30, 0] }}
                            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute bottom-10 right-1/4 w-96 h-96 bg-pink-300 rounded-full filter blur-3xl"
                        />
                    </div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={fadeInUpVariants}
                        className="relative max-w-4xl mx-auto text-center px-4"
                    >
                        <motion.div
                            animate={{
                                rotate: [0, 10, -10, 0],
                                scale: [1, 1.1, 1],
                            }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <Rocket size={80} className="mx-auto mb-6 text-white drop-shadow-2xl" />
                        </motion.div>
                        <h2 className="text-5xl md:text-6xl font-black mb-6 text-white drop-shadow-lg">
                            מוכנים להתחיל את המסע? 🚀
                        </h2>
                        <p className="text-2xl mb-10 font-bold text-white/95 drop-shadow-md">
                            הצטרפו עכשיו ותקבלו גישה מיידית לכל הקורסים
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.1, y: -5 }}
                            whileTap={{ scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 400, damping: 17 }}
                            onClick={() => navigate('/register')}
                            className="px-12 py-6 bg-white text-[#667eea] rounded-2xl font-black text-2xl shadow-2xl hover:shadow-white/50 transition-all"
                        >
                            הצטרפו עכשיו בחינם! 🎉
                        </motion.button>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                            className="mt-8 flex items-center justify-center gap-2 text-white/90"
                        >
                            <Users className="w-5 h-5" />
                            <span className="text-sm font-semibold">הצטרפו ל-10,000+ סטודנטים מרוצים</span>
                        </motion.div>
                    </motion.div>
                </SmoothSection>
            )}
        </div>
    );
};

export default Home;