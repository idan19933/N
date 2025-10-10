import { useState, useEffect } from 'react';
import CourseCard from '../components/courses/CourseCard';
import { fetchCourses } from '../services/courseService';

const Home = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCourses();
    }, []);

    const loadCourses = async () => {
        try {
            const { courses: newCourses } = await fetchCourses(null, 6);
            setCourses(newCourses);
        } catch (error) {
            console.error('Error loading courses:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20 px-6 rounded-lg mb-12">
                <div className="max-w-4xl mx-auto text-center">
                    <h1 className="text-5xl font-bold mb-6">
                        Welcome to Course Academy
                    </h1>
                    <p className="text-xl mb-8 opacity-90">
                        Learn from industry experts and advance your career with our comprehensive courses
                    </p>
                    <button
                        onClick={() => window.location.href = '/courses'}
                        className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                    >
                        Browse All Courses
                    </button>
                </div>
            </div>

            {/* Featured Courses */}
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Featured Courses</h2>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                ) : courses.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <p className="text-gray-600 text-lg">No courses available yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course) => (
                            <CourseCard key={course.id} course={course} />
                        ))}
                    </div>
                )}
            </div>

            {/* Why Choose Us Section */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <div className="text-4xl mb-4">📚</div>
                    <h3 className="text-xl font-bold mb-2">Expert Instructors</h3>
                    <p className="text-gray-600">Learn from industry professionals with years of experience</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <div className="text-4xl mb-4">🎓</div>
                    <h3 className="text-xl font-bold mb-2">Lifetime Access</h3>
                    <p className="text-gray-600">Purchase once and access your courses forever</p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                    <div className="text-4xl mb-4">⭐</div>
                    <h3 className="text-xl font-bold mb-2">Quality Content</h3>
                    <p className="text-gray-600">High-quality video lessons and course materials</p>
                </div>
            </div>
        </div>
    );
};

export default Home;