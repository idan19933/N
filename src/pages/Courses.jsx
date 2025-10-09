import { useState } from 'react';
import CourseCard from '../components/courses/CourseCard';

const Courses = () => {
    const [courses] = useState(
        Array.from({ length: 12 }, (_, i) => ({
            id: i,
            title: `Professional Course ${i + 1}`,
            description: 'Comprehensive course with certification and lifetime access.',
            image: `https://picsum.photos/seed/course${i}/400/300`,
            duration: `${Math.floor(Math.random() * 30) + 10}h`,
            students: `${Math.floor(Math.random() * 50000) + 1000}`,
            price: Math.floor(Math.random() * 150) + 50,
        }))
    );

    return (
        <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-8">All Courses</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                    <CourseCard key={course.id} course={course} />
                ))}
            </div>
        </div>
    );
};

export default Courses;