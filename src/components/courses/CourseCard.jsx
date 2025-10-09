import { Clock, Users } from 'lucide-react';

const CourseCard = ({ course }) => {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
            <img
                src={course.image}
                alt={course.title}
                className="w-full h-48 object-cover"
            />
            <div className="p-6">
                <h3 className="text-xl font-semibold mb-2 text-gray-800">{course.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <Clock size={16} className="mr-1" />
                {course.duration}
            </span>
                        <span className="flex items-center">
              <Users size={16} className="mr-1" />
                            {course.students}
            </span>
                    </div>
                    <span className="text-xl font-bold text-indigo-600">${course.price}</span>
                </div>
                <button className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                    Enroll Now
                </button>
            </div>
        </div>
    );
};

export default CourseCard;