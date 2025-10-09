import { BookOpen } from 'lucide-react';

const MyCourses = () => {
    const myCourses = [
        {
            id: 1,
            title: 'React Masterclass',
            progress: 65,
            lastAccessed: '2 days ago',
            image: 'https://picsum.photos/seed/mycourse1/400/300',
        },
        {
            id: 2,
            title: 'Node.js Complete Guide',
            progress: 30,
            lastAccessed: '1 week ago',
            image: 'https://picsum.photos/seed/mycourse2/400/300',
        },
    ];

    return (
        <div>
            <h1 className="text-4xl font-bold text-gray-800 mb-8">My Courses</h1>
            {myCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myCourses.map((course) => (
                        <div
                            key={course.id}
                            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                        >
                            <img
                                src={course.image}
                                alt={course.title}
                                className="w-full h-48 object-cover"
                            />
                            <div className="p-6">
                                <h3 className="text-xl font-semibold mb-2 text-gray-800">
                                    {course.title}
                                </h3>
                                <div className="mb-4">
                                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                                        <span>Progress</span>
                                        <span>{course.progress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-indigo-600 h-2 rounded-full"
                                            style={{ width: `${course.progress}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 mb-4">
                                    Last accessed: {course.lastAccessed}
                                </p>
                                <button className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center">
                                    <BookOpen size={18} className="mr-2" />
                                    Continue Learning
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16">
                    <BookOpen size={64} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 text-lg">
                        You haven't enrolled in any courses yet.
                    </p>
                </div>
            )}
        </div>
    );
};

export default MyCourses;