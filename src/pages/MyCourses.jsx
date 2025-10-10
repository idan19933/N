import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CourseCard from '../components/courses/CourseCard';
import { getUserPurchases } from '../services/paymentService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import useAuthStore from '../store/authStore';

const MyCourses = () => {
    const { user, isAuthenticated } = useAuthStore();
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        loadMyCourses();
    }, [user, isAuthenticated]);

    const loadMyCourses = async () => {
        try {
            setLoading(true);
            const purchases = await getUserPurchases(user.uid);

            // Fetch course details for each purchase
            const coursesData = await Promise.all(
                purchases.map(async (purchase) => {
                    const courseRef = doc(db, 'courses', purchase.courseId);
                    const courseSnap = await getDoc(courseRef);
                    if (courseSnap.exists()) {
                        return {
                            id: courseSnap.id,
                            ...courseSnap.data()
                        };
                    }
                    return null;
                })
            );

            setCourses(coursesData.filter(course => course !== null));
        } catch (error) {
            console.error('Error loading courses:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">
                    My Courses
                </h1>
                <p className="text-gray-600 text-lg">
                    Continue learning from your purchased courses
                </p>
            </div>

            {courses.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 text-lg mb-4">You haven't purchased any courses yet.</p>
                    <button
                        onClick={() => navigate('/courses')}
                        className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        Browse Courses
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((course) => (
                        <CourseCard key={course.id} course={course} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyCourses;