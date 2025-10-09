import { useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import CourseCard from '../components/courses/CourseCard';

// Mock data generator
const generateCourses = (page) => {
    return Array.from({ length: 6 }, (_, i) => ({
        id: page * 6 + i,
        title: `Course ${page * 6 + i + 1}: ${['React', 'Node.js', 'Python', 'Java', 'AWS', 'Docker'][i % 6]}`,
        description: 'Learn the fundamentals and advanced concepts with hands-on projects and real-world examples.',
        image: `https://picsum.photos/seed/${page * 6 + i}/400/300`,
        duration: `${Math.floor(Math.random() * 20) + 5}h`,
        students: `${Math.floor(Math.random() * 10000) + 100}`,
        price: Math.floor(Math.random() * 100) + 29,
    }));
};

const Home = () => {
    const [courses, setCourses] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        // Load initial courses
        setCourses(generateCourses(0));
        setPage(1);
    }, []);

    const fetchMoreCourses = () => {
        setTimeout(() => {
            const newCourses = generateCourses(page);
            setCourses((prev) => [...prev, ...newCourses]);
            setPage((prev) => prev + 1);

            // Stop after 5 pages (30 courses)
            if (page >= 4) {
                setHasMore(false);
            }
        }, 1000);
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">
                    Welcome to Course Academy
                </h1>
                <p className="text-gray-600 text-lg">
                    Discover thousands of courses and start learning today!
                </p>
            </div>

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
        </div>
    );
};

export default Home;