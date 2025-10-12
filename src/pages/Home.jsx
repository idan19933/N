import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectCoverflow } from 'swiper/modules';
import { BookOpen, Users, Award, TrendingUp, Sparkles, Zap, ArrowLeft, Star, Quote, Rocket, Globe, Code, Palette } from 'lucide-react';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import CourseCard from '../components/courses/CourseCard';
import { fetchCourses } from '../services/courseService';
import useAuthStore from '../store/authStore';
import MagneticButton from '../components/common/MagneticButton';
import TextReveal from '../components/common/TextReveal';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-coverflow';

// Enhanced Animated Background Component
const AnimatedBackground = () => {
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 150]);
    const y2 = useTransform(scrollY, [0, 500], [0, -100]);
    const y3 = useTransform(scrollY, [0, 500], [0, 50]);
    const rotate = useTransform(scrollY, [0, 500], [0, 360]);

    return (
        <div className="absolute inset-0 overflow-hidden">
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 animate-gradient-shift bg-gradient-to-br from-[#5b21b6] via-[#7c3aed] to-[#06b6d4]" />

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-grid-pattern opacity-5" />

            {/* Noise Texture */}
            <div className="noise-overlay" />

            {/* Morphing Blobs */}
            <motion.div style={{ y: y1 }}>
                <div className="absolute top-10 right-10 w-72 h-72 sm:w-96 sm:h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
            </motion.div>

            <motion.div style={{ y: y2, rotate }}>
                <div className="absolute top-20 left-10 w-72 h-72 sm:w-96 sm:h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
            </motion.div>

            <motion.div style={{ y: y3 }}>
                <div className="absolute -bottom-20 left-1/3 w-72 h-72 sm:w-96 sm:h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-morphing" />
            </motion.div>

            {/* Additional Floating Elements */}
            <motion.div
                animate={{
                    x: [0, 100, 0],
                    y: [0, -100, 0],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
                }}
                className="absolute top-1/4 right-1/4 w-32 h-32 opacity-20"
            >
                <div className="w-full h-full rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 blur-2xl" />
            </motion.div>
        </div>
    );
};

// Enhanced Text Reveal with Shimmer
const ShimmerTextReveal = ({ text, className }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }}
            className={className}
        >
            <span className="relative">
                {text}
                <span className="absolute inset-0 text-shimmer">{text}</span>
            </span>
        </motion.div>
    );
};

// Enhanced Feature Card with 3D Effect
const Feature3DCard = ({ feature, index }) => {
    const cardRef = useRef(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]));
    const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]));

    const handleMouseMove = (e) => {
        const rect = cardRef.current?.getBoundingClientRect();
        if (rect) {
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            mouseX.set(x);
            mouseY.set(y);
        }
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
    };

    const Icon = feature.icon;

    return (
        <motion.div
            ref={cardRef}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
            }}
            className="relative group"
        >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500" />

            <div className="relative bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 dark:border-gray-700 hover-lift glass-morphism">
                <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 sm:mb-6 shadow-lg animate-pulse-glow`}
                    style={{
                        transform: "translateZ(50px)"
                    }}
                >
                    <Icon size={32} className="text-white sm:w-10 sm:h-10" />
                </motion.div>

                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg">{feature.desc}</p>

                <motion.div
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    initial={{ scale: 0 }}
                    whileHover={{ scale: 1 }}
                >
                    <Sparkles className="text-purple-500" size={20} />
                </motion.div>
            </div>
        </motion.div>
    );
};

// Enhanced Wave SVG with Animation
const AnimatedWave = () => {
    return (
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden">
            <svg className="w-full h-16 sm:h-24" viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                <motion.path
                    d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
                    fill="#f9fafb"
                    className="dark:fill-gray-900"
                    animate={{
                        d: [
                            "M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z",
                            "M0 120L60 110C120 100 240 80 360 65C480 50 600 50 720 52.5C840 55 960 65 1080 70C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z",
                            "M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
                        ]
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            </svg>

            {/* Additional Wave Layers */}
            <svg className="absolute top-0 w-full h-16 sm:h-24 opacity-50" viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                <motion.path
                    d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
                    fill="#e5e7eb"
                    className="dark:fill-gray-800"
                    animate={{
                        d: [
                            "M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z",
                            "M0 120L60 100C120 80 240 40 360 25C480 10 600 10 720 22.5C840 35 960 55 1080 65C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z",
                            "M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
                        ]
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.5
                    }}
                />
            </svg>
        </div>
    );
};

// Enhanced Stats Counter
const AnimatedCounter = ({ value, label, gradient }) => {
    const [count, setCount] = useState(0);
    const targetValue = parseInt(value.replace(/[^0-9]/g, '')) || 0;

    useEffect(() => {
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
    }, [targetValue]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl p-4 sm:p-6 shadow-2xl cursor-pointer glass-morphism"
        >
            <div className={`text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r ${gradient} bg-clip-text text-transparent mb-2 animated-gradient-text`}>
                {count}{value.includes('+') ? '+' : ''}{value.includes('%') ? '%' : ''}
            </div>
            <div className="text-gray-700 dark:text-gray-300 font-semibold text-sm sm:text-base lg:text-lg">{label}</div>
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
    const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
    const heroY = useTransform(scrollY, [0, 500], [0, -100]);

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
    const trendingCourses = courses.slice(6, 12);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 custom-scrollbar" dir="rtl">
            {/* Enhanced Hero Section */}
            <div className="relative overflow-hidden min-h-screen sm:min-h-[90vh] flex items-center">
                {/* Animated Background */}
                <AnimatedBackground />

                {/* Hero Content */}
                <motion.div
                    style={{ y: heroY, opacity: heroOpacity }}
                    className="relative z-10 w-full max-w-7xl mx-auto px-4 py-12 sm:py-16"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center"
                    >
                        {/* Enhanced Logo */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6 }}
                            whileHover={{ scale: 1.05 }}
                            className="mb-6 sm:mb-8 flex justify-center"
                        >
                            <div className="relative group">
                                <motion.div
                                    className="absolute inset-0 bg-white/20 rounded-3xl blur-2xl group-hover:bg-white/30 transition-all duration-500"
                                    animate={{
                                        scale: [1, 1.2, 1],
                                    }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                />
                                <img
                                    src="/logo.png"
                                    alt="Nexon Education"
                                    className="relative h-20 sm:h-28 md:h-36 w-auto drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.parentElement.innerHTML = '<div class="text-white text-6xl font-black animated-gradient-text">NEXON</div>';
                                    }}
                                />
                            </div>
                        </motion.div>

                        {/* Main Heading with Shimmer */}
                        <ShimmerTextReveal
                            text="למד את הכישורים של המחר"
                            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-4 sm:mb-6 leading-tight text-white drop-shadow-2xl px-2"
                        />

                        <motion.p
                            className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl mb-8 sm:mb-10 text-white font-bold max-w-3xl mx-auto drop-shadow-lg px-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                        >
                            פלטפורמת הלמידה המובילה בישראל
                        </motion.p>

                        {/* Enhanced Stats */}
                        <motion.div
                            className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto mb-8 sm:mb-12 px-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                        >
                            <AnimatedCounter value={`${courses.length || 0}+`} label="קורסים זמינים" gradient="from-purple-500 to-purple-700" />
                            <AnimatedCounter value="10000+" label="סטודנטים מרוצים" gradient="from-cyan-500 to-cyan-700" />
                            <AnimatedCounter value="98%" label="דירוג שביעות רצון" gradient="from-pink-500 to-pink-700" />
                        </motion.div>

                        {/* Enhanced CTA Buttons */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.8, duration: 0.5 }}
                            className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4"
                        >
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <MagneticButton
                                    onClick={() => navigate('/courses')}
                                    className="w-full sm:w-auto group relative px-6 sm:px-10 py-3 sm:py-5 bg-white text-purple-700 rounded-2xl font-black text-base sm:text-lg lg:text-xl shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-purple-500/50 glass-morphism"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
                                        <Sparkles size={20} className="sm:w-6 sm:h-6" />
                                        צפו בכל הקורסים
                                        <ArrowLeft size={20} className="sm:w-6 sm:h-6 group-hover:translate-x-2 transition-transform" />
                                    </span>
                                </MagneticButton>
                            </motion.div>

                            {!isAuthenticated && (
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <MagneticButton
                                        onClick={() => navigate('/register')}
                                        className="w-full sm:w-auto px-6 sm:px-10 py-3 sm:py-5 bg-gradient-to-r from-pink-500 to-purple-600 text-white border-4 border-white rounded-2xl font-black text-base sm:text-lg lg:text-xl shadow-2xl transition-all duration-300 animate-pulse-glow"
                                    >
                                        הצטרפו עכשיו בחינם 🎉
                                    </MagneticButton>
                                </motion.div>
                            )}
                        </motion.div>
                    </motion.div>
                </motion.div>

                {/* Enhanced Wave Divider */}
                <AnimatedWave />
            </div>

            {/* Features Section with 3D Cards */}
            <section className="py-12 sm:py-20 bg-white dark:bg-gray-800">
                <div className="max-w-7xl mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12 sm:mb-16"
                    >
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-800 dark:text-white mb-4 animated-gradient-text">
                            למה לבחור בנו? 🌟
                        </h2>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                        {[
                            { icon: BookOpen, title: 'תוכן איכותי', desc: 'וידאו באיכות 4K', color: 'from-blue-500 to-cyan-500' },
                            { icon: Users, title: 'מרצים מומחים', desc: 'מקצוענים מהתעשייה', color: 'from-purple-500 to-pink-500' },
                            { icon: Award, title: 'תעודת הסמכה', desc: 'מוכרת בתעשייה', color: 'from-orange-500 to-red-500' },
                            { icon: TrendingUp, title: 'גישה לכל החיים', desc: 'שלם פעם אחת', color: 'from-green-500 to-teal-500' },
                        ].map((feature, index) => (
                            <Feature3DCard key={index} feature={feature} index={index} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Add existing sections (Featured Courses, Reviews, Trending Courses, CTA) here... */}
            {/* They remain the same as in your original code */}
        </div>
    );
};

export default Home;