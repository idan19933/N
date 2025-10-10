import { Link } from 'react-router-dom';
import { Clock, Users, DollarSign, BookOpen } from 'lucide-react';

const CourseCard = ({ course }) => {
    return (
        <Link
            to={`/course/${course.id}`}
            className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
        >
            {/* Course Image */}
            <div className="relative h-48 overflow-hidden">
                <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3 bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    ${course.price}
                </div>
            </div>

            {/* Course Content */}
            <div className="p-5">
                <h3 className="font-bold text-lg mb-2 text-gray-800 line-clamp-2 hover:text-indigo-600 transition-colors">
                    {course.title}
                </h3>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {course.description}
                </p>

                {/* Course Stats */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                        <Clock size={16} />
                        <span>{course.duration}</span>
                    </div>

                    <div className="flex items-center gap-1">
                        <Users size={16} />
                        <span>{course.students || 0} students</span>
                    </div>

                    <div className="flex items-center gap-1">
                        <BookOpen size={16} />
                        <span>{course.totalLessons || 0} lessons</span>
                    </div>
                </div>

                {/* View Course Button */}
                <button className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors font-semibold">
                    View Course
                </button>
            </div>
        </Link>
    );
};

export default CourseCard;