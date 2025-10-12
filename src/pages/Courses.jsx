import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { motion } from 'framer-motion';
import { Clock, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatPrice } from '../utils/currency';
import toast from 'react-hot-toast';

const Courses = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCourses();
    }, []);

    const loadCourses = async () => {
        try {
            setLoading(true);
            const coursesSnapshot = await getDocs(collection(db, 'courses'));
            const coursesData = coursesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setCourses(coursesData);
        } catch (error) {
            console.error('Error loading courses:', error);
            toast.error('שגיאה בטעינת קורסים');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-48 mb-8 animate-pulse"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden animate-pulse">
                            <div className="bg-gray-300 dark:bg-gray-700 h-48 w-full"></div>
                            <div className="p-6">
                                <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
                                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full mb-2"></div>
                                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6 mb-4"></div>
                                <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-bold text-gray-900 dark:text-white mb-8"
                dir="rtl"
            >
                כל הקורסים
            </motion.h1>

            {courses.length === 0 ? (
                <div className="text-center py-16">
                    <p className="text-gray-600 dark:text-gray-400">אין קורסים זמינים כרגע</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course, index) => (
                        <motion.div
                            key={course.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -8, transition: { duration: 0.2 } }}
                            onClick={() => navigate(`/courses/${course.id}`)}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-2xl
                                       transition-shadow cursor-pointer overflow-hidden
                                       border border-gray-200 dark:border-gray-700 group"
                        >
                            {/* Image */}
                            <div className="relative h-48 overflow-hidden">
                                <img
                                    src={course.image}
                                    alt={course.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                                <div className="absolute top-4 right-4 bg-indigo-600 dark:bg-indigo-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                                    {formatPrice(course.price)}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2
                                              group-hover:text-indigo-600 dark:group-hover:text-indigo-400
                                              transition-colors line-clamp-2">
                                    {course.title}
                                </h3>

                                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                                    {course.description}
                                </p>

                                {/* Stats */}
                                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                                    <div className="flex items-center gap-2">
                                        <Clock size={16} />
                                        <span>{course.duration}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Award size={16} />
                                        <span className="capitalize">{course.level}</span>
                                    </div>
                                </div>

                                <button className="w-full py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg
                                                 hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors font-semibold">
                                    צפה בקורס
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Courses;