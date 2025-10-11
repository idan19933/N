import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, EffectCoverflow } from 'swiper/modules';
import { BookOpen, Users, Award, TrendingUp, Sparkles, Zap, ArrowLeft } from 'lucide-react';
import CourseCard from '../components/courses/CourseCard';
import { fetchCourses } from '../services/courseService';
import useAuthStore from '../store/authStore';
import MagneticButton from '../components/common/MagneticButton';
import TextReveal from '../components/common/TextReveal';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-coverflow';

const Home = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuthStore();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 150]);
    const y2 = useTransform(scrollY, [0, 500], [0, -100]);
    const opacity = useTransform(scrollY, [0, 300], [1, 0]);

    useEffect(() => {
        loadCourses();
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

    const featuredCourses = courses.slice(0, 6);
    const trendingCourses = courses.slice(6, 12);

    return (
        <div className="min-h-screen bg-gray-50" dir="rtl">
            {/* Hero Section with Parallax */}
            <div className="relative overflow-hidden bg-gradient-to-br from-[#5b21b6] via-[#7c3aed] to-[#06b6d4] min-h-screen sm:min-h-[90vh] flex items-center">
                {/* Animated Background with Parallax */}
                <motion.div
                    style={{ y: y1 }}
                    className="absolute inset-0 overflow-hidden"
                >
                    <div className="absolute top-10 right-10 w-72 h-72 sm:w-96 sm:h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"></div>
                    <div className="absolute top-20 left-10 w-72 h-72 sm:w-96 sm:h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '2s' }}></div>
                    <div className="absolute -bottom-20 left-1/3 w-72 h-72 sm:w-96 sm:h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" style={{ animationDelay: '4s' }}></div>
                    <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                </motion.div>

                {/* Hero Content with Parallax */}
                <motion.div
                    style={{ y: y2, opacity }}
                    className="relative z-10 w-full max-w-7xl mx-auto px-4 py-12 sm:py-16"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center"
                    >
                        {/* Logo */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6 }}
                            className="mb-6 sm:mb-8 flex justify-center"
                        >
                            <div className="relative group">
                                <div className="absolute inset-0 bg-white/20 rounded-3xl blur-2xl group-hover:bg-white/30 transition-all duration-500"></div>
                                <img
                                    src="/logo.png"
                                    alt="Nexon Education"
                                    className="relative h-20 sm:h-28 md:h-36 w-auto drop-shadow-2xl hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                        </motion.div>

                        {/* Main Heading with Text Reveal */}
                        <TextReveal
                            text="למצוא את הגרסון הבא שמתחבר"
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

                        {/* Stats with Stagger Animation */}
                        <motion.div
                            className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto mb-8 sm:mb-12 px-4"
                            initial="hidden"
                            animate="visible"
                            variants={{
                                hidden: { opacity: 0 },
                                visible: {
                                    opacity: 1,
                                    transition: {
                                        delayChildren: 0.6,
                                        staggerChildren: 0.2
                                    }
                                }
                            }}
                        >
                            {[
                                { value: `${courses.length || 0}+`, label: 'קורסים זמינים', gradient: 'from-purple-500 to-purple-700' },
                                { value: '10,000+', label: 'סטודנטים מרוצים', gradient: 'from-cyan-500 to-cyan-700' },
                                { value: '98%', label: 'דירוג שביעות רצון', gradient: 'from-pink-500 to-pink-700' }
                            ].map((stat, index) => (
                                <motion.div
                                    key={index}
                                    variants={{
                                        hidden: { opacity: 0, y: 50 },
                                        visible: { opacity: 1, y: 0 }
                                    }}
                                    whileHover={{ scale: 1.05, y: -5 }}
                                    className="bg-white/95 backdrop-blur-xl rounded-2xl p-4 sm:p-6 shadow-2xl cursor-pointer"
                                >
                                    <div className={`text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-2`}>
                                        {stat.value}
                                    </div>
                                    <div className="text-gray-700 font-semibold text-sm sm:text-base lg:text-lg">{stat.label}</div>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* CTA Buttons with Magnetic Effect */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.8, duration: 0.5 }}
                            className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center px-4"
                        >
                            <MagneticButton
                                onClick={() => navigate('/courses')}
                                className="w-full sm:w-auto group relative px-6 sm:px-10 py-3 sm:py-5 bg-white text-purple-700 rounded-2xl font-black text-base sm:text-lg lg:text-xl shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-purple-500/50"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
                                    <Sparkles size={20} className="sm:w-6 sm:h-6" />
                                    צפו בכל הקורסים
                                    <ArrowLeft size={20} className="sm:w-6 sm:h-6 group-hover:translate-x-2 transition-transform" />
                                </span>
                            </MagneticButton>

                            {!isAuthenticated && (
                                <MagneticButton
                                    onClick={() => navigate('/register')}
                                    className="w-full sm:w-auto px-6 sm:px-10 py-3 sm:py-5 bg-gradient-to-r from-pink-500 to-purple-600 text-white border-4 border-white rounded-2xl font-black text-base sm:text-lg lg:text-xl shadow-2xl transition-all duration-300"
                                >
                                    הצטרפו עכשיו בחינם 🎉
                                </MagneticButton>
                            )}
                        </motion.div>
                    </motion.div>
                </motion.div>

                {/* Modern Wave Divider */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg className="w-full h-16 sm:h-24" viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                        <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#f9fafb"/>
                    </svg>
                </div>
            </div>

            {/* Featured Courses */}
            <section className="py-12 sm:py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-12 sm:mb-16"
                    >
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent mb-4">
                            הקורסים המובילים שלנו
                        </h2>
                        <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 font-semibold">
                            התחילו ללמוד היום! 🚀
                        </p>
                    </motion.div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600"></div>
                        </div>
                    ) : featuredCourses.length > 0 ? (
                        <Swiper
                            modules={[Autoplay, Pagination, Navigation, EffectCoverflow]}
                            effect="coverflow"
                            grabCursor={true}
                            centeredSlides={true}
                            slidesPerView="auto"
                            coverflowEffect={{
                                rotate: 50,
                                stretch: 0,
                                depth: 100,
                                modifier: 1,
                                slideShadows: true,
                            }}
                            autoplay={{
                                delay: 3000,
                                disableOnInteraction: false,
                            }}
                            pagination={{ clickable: true }}
                            navigation={true}
                            className="featured-swiper"
                            breakpoints={{
                                320: { slidesPerView: 1, spaceBetween: 20 },
                                768: { slidesPerView: 2, spaceBetween: 30 },
                                1024: { slidesPerView: 3, spaceBetween: 30 }
                            }}
                        >
                            {featuredCourses.map((course) => (
                                <SwiperSlide key={course.id} className="pb-12">
                                    <CourseCard course={course} />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    ) : (
                        <p className="text-center text-gray-600 text-lg sm:text-xl">אין קורסים זמינים כרגע</p>
                    )}
                </div>
            </section>

            {/* Features Section with Hover Effects */}
            <section className="py-12 sm:py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12 sm:mb-16"
                    >
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-800 mb-4">
                            למה לבחור ב-Nexon? 🌟
                        </h2>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
                        {[
                            { icon: BookOpen, title: 'תוכן איכותי', desc: 'וידאו באיכות 4K', color: 'from-blue-500 to-cyan-500' },
                            { icon: Users, title: 'מרצים מומחים', desc: 'מקצוענים מהתעשייה', color: 'from-purple-500 to-pink-500' },
                            { icon: Award, title: 'תעודת הסמכה', desc: 'מוכרת בתעשייה', color: 'from-orange-500 to-red-500' },
                            { icon: TrendingUp, title: 'גישה לכל החיים', desc: 'שלם פעם אחת', color: 'from-green-500 to-teal-500' },
                        ].map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ scale: 1.05, y: -10 }}
                                    className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 cursor-pointer group"
                                >
                                    <motion.div
                                        whileHover={{ rotate: 360 }}
                                        transition={{ duration: 0.6 }}
                                        className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 sm:mb-6 shadow-lg`}
                                    >
                                        <Icon size={32} className="text-white sm:w-10 sm:h-10" />
                                    </motion.div>
                                    <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">{feature.title}</h3>
                                    <p className="text-gray-600 text-base sm:text-lg">{feature.desc}</p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Trending Courses */}
            {trendingCourses.length > 0 && (
                <section className="py-12 sm:py-20 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
                    <div className="max-w-7xl mx-auto px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-12 sm:mb-16"
                        >
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4">
                                🔥 קורסים חמים השבוע
                            </h2>
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                            {trendingCourses.map((course, index) => (
                                <motion.div
                                    key={course.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <CourseCard course={course} />
                                </motion.div>
                            ))}
                        </div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            className="text-center mt-8 sm:mt-12"
                        >
                            <MagneticButton
                                onClick={() => navigate('/courses')}
                                className="px-8 sm:px-12 py-4 sm:py-5 bg-white text-purple-700 rounded-2xl font-black text-lg sm:text-xl shadow-2xl"
                            >
                                צפו בכל הקורסים
                            </MagneticButton>
                        </motion.div>
                    </div>
                </section>
            )}

            {/* CTA Section */}
            {!isAuthenticated && (
                <section className="py-12 sm:py-20 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="max-w-4xl mx-auto text-center px-4 relative z-10"
                    >
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                        >
                            <Zap size={60} className="mx-auto mb-6 drop-shadow-2xl sm:w-20 sm:h-20" />
                        </motion.div>
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 sm:mb-6">
                            מוכנים להתחיל? 🚀
                        </h2>
                        <p className="text-lg sm:text-xl lg:text-2xl mb-8 sm:mb-10 font-bold">
                            הצטרפו לאלפי סטודנטים מצליחים
                        </p>
                        <MagneticButton
                            onClick={() => navigate('/register')}
                            className="px-8 sm:px-12 py-4 sm:py-6 bg-white text-purple-700 rounded-2xl font-black text-xl sm:text-2xl shadow-2xl"
                        >
                            הצטרפו עכשיו בחינם! 🎉
                        </MagneticButton>
                    </motion.div>
                </section>
            )}
        </div>
    );
};

export default Home;