import { useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import CourseCard from '../components/courses/CourseCard';
import { fetchCourses } from '../services/courseService';

const Courses = () => {
    const [courses, setCourses] = useState([]);
    const [lastVisible, setLastVisible] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadInitialCourses();
    }, []);

    const loadInitialCourses = async () => {
        try {
            const { courses: newCourses, lastVisible: lastDoc, hasMore: more } = await fetchCourses();
            setCourses(newCourses);
            setLastVisible(lastDoc);
            setHasMore(more);
        } catch (error) {
            console.error('Error loading courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMoreCourses = async () => {
        try {
            const { courses: newCourses, lastVisible: lastDoc, hasMore: more } = await fetchCourses(lastVisible);
            setCourses((prev) => [...prev, ...newCourses]);
            setLastVisible(lastDoc);
            setHasMore(more);
        } catch (error) {
            console.error('Error loading more courses:', error);
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
                    All Courses
                </h1>
                <p className="text-gray-600 text-lg">
                    Browse our complete collection of courses
                </p>
            </div>

            {courses.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 text-lg">No courses available yet.</p>
                </div>
            ) : (
                <InfiniteScroll
                    dataLength={courses.length}
                    next={fetchMoreCourses}
                    hasMore={hasMore}
                    loader={
                        <div className="text-center py-8">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                            <p className="mt-2 text-gray-600">Loading more courses...</p>
                        </div>
                    }
                    endMessage={
                        <p className="text-center py-8 text-gray-600 font-semibold">
                            You've seen all available courses!
                        </p>
                    }
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course) => (
                            <CourseCard key={course.id} course={course} />
                        ))}
                    </div>
                </InfiniteScroll>
            )}
        </div>
    );
};

export default Courses;