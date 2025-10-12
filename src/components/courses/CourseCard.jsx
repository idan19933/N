import React from 'react';
import { motion } from 'framer-motion';
import { fadeInUp } from '../animations/AnimatedPage';
import { Clock, Award, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CourseCard = ({ course, index = 0 }) => {
    const navigate = useNavigate();

    return (
        <motion.div
            variants={fadeInUp}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            onClick={() => navigate(`/courses/${course.id}`)}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-2xl
                       transition-shadow cursor-pointer overflow-hidden
                       border border-gray-200 dark:border-gray-700 group"
        >
            {/* Image with Zoom Effect */}
            <div className="relative h-48 overflow-hidden">
                <motion.img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                />
                <motion.div
                    className="absolute top-4 right-4 bg-indigo-600 dark:bg-indigo-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                >
                    ${course.price}
                </motion.div>
            </div>

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

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg
                             hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors font-semibold"
                >
                    צפה בקורס
                </motion.button>
            </div>
        </motion.div>
    );
};

export default CourseCard;