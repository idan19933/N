import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import useAuthStore from '../store/authStore';
import { Plus, Edit2, Trash2, Users, BookOpen, DollarSign, TrendingUp, Bell, Target, Ticket } from 'lucide-react';
import { formatPrice } from '../utils/currency';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { isAdmin, loading: authLoading } = useAuthStore();

    const [courses, setCourses] = useState([]);
    const [stats, setStats] = useState({
        totalCourses: 0,
        totalUsers: 0,
        totalRevenue: 0,
        totalEnrollments: 0
    });
    const [loading, setLoading] = useState(true);
    const [showAddCourse, setShowAddCourse] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [unreadNotifications, setUnreadNotifications] = useState(0);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        duration: '',
        level: 'beginner',
        image: '',
        instructor: ''
    });

    useEffect(() => {
        if (!isAdmin && !authLoading) {
            navigate('/');
        }
    }, [isAdmin, authLoading, navigate]);

    useEffect(() => {
        if (isAdmin) {
            loadDashboardData();
            loadNotificationsCount();
        }
    }, [isAdmin]);

    const loadNotificationsCount = async () => {
        try {
            const notificationsSnapshot = await getDocs(collection(db, 'notifications'));
            const unread = notificationsSnapshot.docs.filter(doc => !doc.data().read).length;
            setUnreadNotifications(unread);
        } catch (error) {
            console.error('Error loading notifications count:', error);
        }
    };

    const loadDashboardData = async () => {
        try {
            setLoading(true);

            const coursesSnapshot = await getDocs(collection(db, 'courses'));
            const coursesData = coursesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setCourses(coursesData);

            const usersSnapshot = await getDocs(collection(db, 'users'));
            const purchasesSnapshot = await getDocs(collection(db, 'purchases'));

            let totalRevenue = 0;
            purchasesSnapshot.forEach(doc => {
                totalRevenue += doc.data().amount || 0;
            });

            setStats({
                totalCourses: coursesData.length,
                totalUsers: usersSnapshot.size,
                totalRevenue: totalRevenue,
                totalEnrollments: purchasesSnapshot.size
            });

        } catch (error) {
            console.error('Error loading dashboard data:', error);
            toast.error('שגיאה בטעינת נתונים');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const loadingToast = toast.loading(editingCourse ? 'מעדכן קורס...' : 'יוצר קורס...');

        try {
            if (editingCourse) {
                await updateDoc(doc(db, 'courses', editingCourse.id), {
                    ...formData,
                    price: parseFloat(formData.price),
                    updatedAt: new Date()
                });
                toast.success('✅ הקורס עודכן בהצלחה!', { id: loadingToast });
            } else {
                await addDoc(collection(db, 'courses'), {
                    ...formData,
                    price: parseFloat(formData.price),
                    createdAt: new Date(),
                    enrollmentCount: 0
                });
                toast.success('✅ הקורס נוצר בהצלחה!', { id: loadingToast });
            }

            setFormData({
                title: '',
                description: '',
                price: '',
                duration: '',
                level: 'beginner',
                image: '',
                instructor: ''
            });
            setShowAddCourse(false);
            setEditingCourse(null);
            loadDashboardData();
        } catch (error) {
            console.error('Error saving course:', error);
            toast.error('❌ שגיאה בשמירת הקורס', { id: loadingToast });
        }
    };

    const handleEdit = (course) => {
        setEditingCourse(course);
        setFormData({
            title: course.title,
            description: course.description,
            price: course.price.toString(),
            duration: course.duration,
            level: course.level,
            image: course.image,
            instructor: course.instructor
        });
        setShowAddCourse(true);
    };

    const handleDelete = async (courseId) => {
        if (!window.confirm('האם אתה בטוח שברצונך למחוק קורס זה?')) return;

        const loadingToast = toast.loading('מוחק קורס...');

        try {
            await deleteDoc(doc(db, 'courses', courseId));
            toast.success('✅ הקורס נמחק בהצלחה!', { id: loadingToast });
            loadDashboardData();
        } catch (error) {
            console.error('Error deleting course:', error);
            toast.error('❌ שגיאה במחיקת הקורס', { id: loadingToast });
        }
    };

    if (authLoading || loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-white dark:bg-gray-900">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
            </div>
        );
    }

    if (!isAdmin) {
        return null;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Admin Dashboard</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your courses and users</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/admin/goals')}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                    >
                        <Target size={20} />
                        יעדים
                    </button>
                    <button
                        onClick={() => navigate('/admin/codes')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                    >
                        <Ticket size={20} />
                        קודים
                    </button>
                    <button
                        onClick={() => navigate('/admin/notifications')}
                        className="relative px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center gap-2"
                    >
                        <Bell size={20} />
                        התראות
                        {unreadNotifications > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                                {unreadNotifications}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => navigate('/admin/users')}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
                    >
                        <Users size={20} />
                        Users
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700 text-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <BookOpen size={32} />
                    </div>
                    <div className="text-3xl font-bold mb-1">{stats.totalCourses}</div>
                    <div className="text-indigo-100 dark:text-indigo-200">Total Courses</div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 text-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <Users size={32} />
                    </div>
                    <div className="text-3xl font-bold mb-1">{stats.totalUsers}</div>
                    <div className="text-green-100 dark:text-green-200">Total Users</div>
                </div>

                <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 dark:from-yellow-600 dark:to-yellow-700 text-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <DollarSign size={32} />
                    </div>
                    <div className="text-3xl font-bold mb-1">{formatPrice(stats.totalRevenue)}</div>
                    <div className="text-yellow-100 dark:text-yellow-200">Total Revenue</div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 text-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <TrendingUp size={32} />
                    </div>
                    <div className="text-3xl font-bold mb-1">{stats.totalEnrollments}</div>
                    <div className="text-purple-100 dark:text-purple-200">Enrollments</div>
                </div>
            </div>

            {/* Add Course Button */}
            <div className="mb-6">
                {!showAddCourse && (
                    <button
                        onClick={() => {
                            setShowAddCourse(true);
                            setEditingCourse(null);
                            setFormData({
                                title: '',
                                description: '',
                                price: '',
                                duration: '',
                                level: 'beginner',
                                image: '',
                                instructor: ''
                            });
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
                    >
                        <Plus size={20} />
                        Add New Course
                    </button>
                )}
            </div>

            {/* Add/Edit Course Form */}
            {showAddCourse && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                        {editingCourse ? 'Edit Course' : 'Add New Course'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Course Title
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Instructor
                                </label>
                                <input
                                    type="text"
                                    name="instructor"
                                    value={formData.instructor}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                required
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Price (₪)
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    required
                                    step="0.01"
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Duration
                                </label>
                                <input
                                    type="text"
                                    name="duration"
                                    value={formData.duration}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g., 5h 30min"
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Level
                                </label>
                                <select
                                    name="level"
                                    value={formData.level}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    <option value="beginner">Beginner</option>
                                    <option value="intermediate">Intermediate</option>
                                    <option value="advanced">Advanced</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Image URL
                            </label>
                            <input
                                type="url"
                                name="image"
                                value={formData.image}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="submit"
                                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
                            >
                                {editingCourse ? 'Update Course' : 'Create Course'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowAddCourse(false);
                                    setEditingCourse(null);
                                }}
                                className="px-6 py-3 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 font-semibold"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Courses List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">Courses</h2>
                </div>

                {courses.length === 0 ? (
                    <div className="p-8 text-center text-gray-600 dark:text-gray-400">
                        No courses yet. Add your first course!
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {courses.map((course) => (
                            <div key={course.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 flex-1">
                                        <img
                                            src={course.image}
                                            alt={course.title}
                                            className="w-20 h-20 object-cover rounded-lg"
                                        />
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg text-gray-800 dark:text-white">{course.title}</h3>
                                            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{course.instructor}</p>
                                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                                                <span>{formatPrice(course.price)}</span>
                                                <span>•</span>
                                                <span>{course.duration}</span>
                                                <span>•</span>
                                                <span className="capitalize">{course.level}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => navigate(`/admin/course/${course.id}/curriculum`)}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                                        >
                                            <BookOpen size={16} />
                                            Curriculum
                                        </button>
                                        <button
                                            onClick={() => handleEdit(course)}
                                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg"
                                        >
                                            <Edit2 size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(course.id)}
                                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;