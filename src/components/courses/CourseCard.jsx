import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Star } from 'lucide-react';

const CourseCard = ({ course }) => {
    const navigate = useNavigate();

    if (!course) {
        console.warn("⚠️ CourseCard received undefined course");
        return null;
    }

    return (
        <div
            onClick={() => navigate(`/courses/${course.id}`)}
            className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 cursor-pointer"
        >
            <div className="relative h-48">
                <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full shadow-lg">
                    <span className="text-indigo-600 font-bold">${course.price}</span>
                </div>
            </div>

            <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2">
                    {course.title}
                </h3>

                <p className="text-gray-600 mb-4 line-clamp-2 text-sm">
                    {course.description}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                        <Clock size={16} />
                        <span>{course.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Star size={16} className="text-yellow-400 fill-yellow-400" />
                        <span className="font-semibold">4.8</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseCard;
