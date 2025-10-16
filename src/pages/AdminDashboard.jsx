import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import useAuthStore from '../store/authStore';
import { Plus, Edit2, Trash2, Users, BookOpen, DollarSign, TrendingUp, Bell, Target, Ticket, Menu, X, Clock, Upload } from 'lucide-react';
import { formatPrice } from '../utils/currency';
import { getSections, getLessons } from '../services/curriculumService';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { isAdmin, loading: authLoading } = useAuthStore();

    const [courses, setCourses] = useState([]);
    const [stats, setStats] = useState({
        totalCourses: 0,
        totalUsers: 0,
        totalRevenue: 0,
        totalEnrollments: 0,
        totalVideoDuration: 0
    });
    const [loading, setLoading] = useState(true);
    const [showAddCourse, setShowAddCourse] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const [showMobileMenu, setShowMobileMenu] = useState(false);

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
            const notificationsQuery = query(
                collection(db, 'notifications'),
                where('userId', '==', 'admin')
            );
            const notificationsSnapshot = await getDocs(notificationsQuery);
            const unread = notificationsSnapshot.docs.filter(doc => {
                const data = doc.data();
                return !data.read;
            }).length;
            setUnreadNotifications(unread);
        } catch (error) {
            console.error('Error loading notifications count:', error);
        }
    };

    const parseDuration = (durationStr) => {
        if (!durationStr) return 0;
        if (typeof durationStr === 'number') return durationStr;

        const parts = String(durationStr).split(':');
        if (parts.length === 2) {
            const mins = parseInt(parts[0]) || 0;
            const secs = parseInt(parts[1]) || 0;
            return mins + (secs / 60);
        }

        const parsed = parseFloat(durationStr);
        return isNaN(parsed) ? 0 : parsed;
    };

    const formatDuration = (totalMinutes) => {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = Math.round(totalMinutes % 60);

        if (hours === 0) {
            return `${minutes} דק'`;
        } else if (minutes === 0) {
            return `${hours} שעות`;
        } else {
            return `${hours}:${minutes.toString().padStart(2, '0')} שעות`;
        }
    };

    const getCourseDuration = async (courseId) => {
        try {
            const sections = await getSections(courseId);
            let totalMinutes = 0;

            for (const section of sections) {
                const lessons = await getLessons(courseId, section.id);

                lessons.forEach(lesson => {
                    const durationMinutes = lesson.actualDurationMinutes && lesson.actualDurationMinutes > 0
                        ? lesson.actualDurationMinutes
                        : parseDuration(lesson.duration);

                    totalMinutes += durationMinutes;
                });
            }

            return {
                formatted: formatDuration(totalMinutes),
                minutes: totalMinutes
            };
        } catch (error) {
            console.error('Error calculating course duration:', error);
            return null;
        }
    };

    const calculateTotalVideoDuration = async (coursesData) => {
        let totalMinutes = 0;

        try {
            for (const course of coursesData) {
                const sections = await getSections(course.id);

                for (const section of sections) {
                    const lessons = await getLessons(course.id, section.id);

                    lessons.forEach(lesson => {
                        const durationMinutes = lesson.actualDurationMinutes && lesson.actualDurationMinutes > 0
                            ? lesson.actualDurationMinutes
                            : parseDuration(lesson.duration);

                        totalMinutes += durationMinutes;
                    });
                }
            }

            console.log(`✅ Total video duration: ${totalMinutes.toFixed(2)} minutes (${(totalMinutes / 60).toFixed(2)} hours)`);
        } catch (error) {
            console.error('❌ Error calculating video duration:', error);
        }

        return totalMinutes;
    };

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const coursesSnapshot = await getDocs(collection(db, 'courses'));
            const coursesData = coursesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            console.log('📊 Calculating actual durations for all courses...');
            const coursesWithDuration = await Promise.all(
                coursesData.map(async (course) => {
                    const durationData = await getCourseDuration(course.id);
                    return {
                        ...course,
                        actualDuration: durationData?.formatted || course.duration,
                        actualDurationMinutes: durationData?.minutes || 0
                    };
                })
            );

            setCourses(coursesWithDuration);

            const usersSnapshot = await getDocs(collection(db, 'users'));
            const purchasesSnapshot = await getDocs(collection(db, 'purchases'));

            let totalRevenue = 0;
            purchasesSnapshot.forEach(doc => {
                totalRevenue += doc.data().amount || 0;
            });

            const totalVideoDuration = coursesWithDuration.reduce(
                (sum, course) => sum + (course.actualDurationMinutes || 0),
                0
            );

            setStats({
                totalCourses: coursesData.length,
                totalUsers: usersSnapshot.size,
                totalRevenue: totalRevenue,
                totalEnrollments: purchasesSnapshot.size,
                totalVideoDuration: totalVideoDuration
            });

            console.log('✅ Dashboard loaded with accurate durations');
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

    const resetCourseProgress = async (courseId) => {
        try {
            console.log(`🔄 Resetting progress for course ${courseId}...`);

            const progressQuery = query(
                collection(db, 'progress'),
                where('courseId', '==', courseId)
            );

            const progressSnapshot = await getDocs(progressQuery);
            console.log(`📊 Found ${progressSnapshot.size} progress records to reset`);

            const deletePromises = progressSnapshot.docs.map(doc =>
                deleteDoc(doc.ref)
            );

            await Promise.all(deletePromises);
            console.log(`✅ Reset ${progressSnapshot.size} progress records`);

            return progressSnapshot.size;
        } catch (error) {
            console.error('❌ Error resetting course progress:', error);
            throw error;
        }
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

                console.log('✅ Course updated, now resetting progress...');

                try {
                    toast.loading('מאפס התקדמות משתמשים...', { id: loadingToast });
                    const resetCount = await resetCourseProgress(editingCourse.id);

                    if (resetCount > 0) {
                        toast.success(
                            `✅ הקורס עודכן והתקדמות של ${resetCount} משתמשים אופסה!`,
                            { id: loadingToast, duration: 4000 }
                        );
                    } else {
                        toast.success('✅ הקורס עודכן בהצלחה! (אין התקדמות לאיפוס)', { id: loadingToast });
                    }
                } catch (resetError) {
                    console.error('❌ Error resetting progress:', resetError);
                    toast.success('✅ הקורס עודכן (אבל לא ניתן לאפס התקדמות)', { id: loadingToast });
                }
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
        setShowMobileMenu(false);
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
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-8" dir="rtl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white">לוח בקרה למנהל</h1>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">נהל את הקורסים והמשתמשים שלך</p>
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setShowMobileMenu(!showMobileMenu)}
                    className="sm:hidden p-2 bg-indigo-600 text-white rounded-lg"
                >
                    {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
                </button>

                {/* Desktop Navigation */}
                <div className="hidden sm:flex gap-2 lg:gap-3 flex-wrap">
                    <button
                        onClick={() => navigate('/admin/goals')}
                        className="px-3 lg:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 transition-colors text-sm"
                    >
                        <Target size={18} />
                        <span className="hidden lg:inline">יעדים</span>
                    </button>
                    <button
                        onClick={() => navigate('/admin/problems')}
                        className="px-3 lg:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 transition-colors text-sm"
                    >
                        <Upload size={18} />
                        <span className="hidden lg:inline">בעיות</span>
                    </button>
                    <button
                        onClick={() => navigate('/admin/codes')}
                        className="px-3 lg:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors text-sm"
                    >
                        <Ticket size={18} />
                        <span className="hidden lg:inline">קודים</span>
                    </button>
                    <button
                        onClick={() => navigate('/admin/notifications')}
                        className="relative px-3 lg:px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center gap-2 transition-colors text-sm"
                    >
                        <Bell size={18} />
                        <span className="hidden lg:inline">התראות</span>
                        {unreadNotifications > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
                                {unreadNotifications}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => navigate('/admin/users')}
                        className="px-3 lg:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2 transition-colors text-sm"
                    >
                        <Users size={18} />
                        <span className="hidden lg:inline">משתמשים</span>
                    </button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {showMobileMenu && (
                <div className="sm:hidden mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 space-y-2">
                    <button
                        onClick={() => { navigate('/admin/goals'); setShowMobileMenu(false); }}
                        className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 transition-colors"
                    >
                        <Target size={20} />
                        יעדים
                    </button>
                    <button
                        onClick={() => { navigate('/admin/problems'); setShowMobileMenu(false); }}
                        className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2 transition-colors"
                    >
                        <Upload size={20} />
                        בעיות מתמטיקה
                    </button>
                    <button
                        onClick={() => { navigate('/admin/codes'); setShowMobileMenu(false); }}
                        className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
                    >
                        <Ticket size={20} />
                        קודים
                    </button>
                    <button
                        onClick={() => { navigate('/admin/notifications'); setShowMobileMenu(false); }}
                        className="w-full relative px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 flex items-center gap-2 transition-colors"
                    >
                        <Bell size={20} />
                        התראות
                        {unreadNotifications > 0 && (
                            <span className="bg-red-600 text-white text-xs rounded-full px-2 py-1 font-bold">
                                {unreadNotifications}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => { navigate('/admin/users'); setShowMobileMenu(false); }}
                        className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2 transition-colors"
                    >
                        <Users size={20} />
                        משתמשים
                    </button>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-6 mb-6 sm:mb-8">
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700 text-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6">
                    <BookOpen size={24} className="sm:w-8 sm:h-8 mb-2 sm:mb-4" />
                    <div className="text-2xl sm:text-3xl font-bold mb-1">{stats.totalCourses}</div>
                    <div className="text-xs sm:text-base text-indigo-100 dark:text-indigo-200">סה"כ קורסים</div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 text-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6">
                    <Users size={24} className="sm:w-8 sm:h-8 mb-2 sm:mb-4" />
                    <div className="text-2xl sm:text-3xl font-bold mb-1">{stats.totalUsers}</div>
                    <div className="text-xs sm:text-base text-green-100 dark:text-green-200">סה"כ משתמשים</div>
                </div>

                <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 dark:from-yellow-600 dark:to-yellow-700 text-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6">
                    <DollarSign size={24} className="sm:w-8 sm:h-8 mb-2 sm:mb-4" />
                    <div className="text-xl sm:text-3xl font-bold mb-1">{formatPrice(stats.totalRevenue)}</div>
                    <div className="text-xs sm:text-base text-yellow-100 dark:text-yellow-200">סה"כ הכנסות</div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 text-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6">
                    <TrendingUp size={24} className="sm:w-8 sm:h-8 mb-2 sm:mb-4" />
                    <div className="text-2xl sm:text-3xl font-bold mb-1">{stats.totalEnrollments}</div>
                    <div className="text-xs sm:text-base text-purple-100 dark:text-purple-200">סה"כ רכישות</div>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6 col-span-2 lg:col-span-1">
                    <Clock size={24} className="sm:w-8 sm:h-8 mb-2 sm:mb-4" />
                    <div className="text-xl sm:text-2xl font-bold mb-1">{formatDuration(stats.totalVideoDuration)}</div>
                    <div className="text-xs sm:text-base text-blue-100 dark:text-blue-200">תוכן וידאו</div>
                </div>
            </div>

            {/* Add Course Button */}
            <div className="mb-4 sm:mb-6">
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
                        className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold transition-colors text-sm sm:text-base"
                    >
                        <Plus size={20} />
                        הוסף קורס חדש
                    </button>
                )}
            </div>

            {/* Add/Edit Course Form */}
            {showAddCourse && (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-4 sm:mb-6">
                        {editingCourse ? 'עריכת קורס' : 'הוספת קורס חדש'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    שם הקורס
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    שם המרצה
                                </label>
                                <input
                                    type="text"
                                    name="instructor"
                                    value={formData.instructor}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                תיאור
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                required
                                rows={4}
                                className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    מחיר (₪)
                                </label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    required
                                    step="0.01"
                                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    משך הקורס (לתצוגה)
                                </label>
                                <input
                                    type="text"
                                    name="duration"
                                    value={formData.duration}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="לדוגמה: 5 שעות"
                                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    המשך האמיתי יחושב אוטומטית מהווידאו
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    רמה
                                </label>
                                <select
                                    name="level"
                                    value={formData.level}
                                    onChange={handleInputChange}
                                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                                >
                                    <option value="beginner">מתחילים</option>
                                    <option value="intermediate">בינוני</option>
                                    <option value="advanced">מתקדמים</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                כתובת URL לתמונה
                            </label>
                            <input
                                type="url"
                                name="image"
                                value={formData.image}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                            <button
                                type="submit"
                                className="px-4 sm:px-6 py-2 sm:py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold transition-colors text-sm sm:text-base"
                            >
                                {editingCourse ? 'עדכן קורס' : 'צור קורס'}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowAddCourse(false);
                                    setEditingCourse(null);
                                }}
                                className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 font-semibold transition-colors text-sm sm:text-base"
                            >
                                ביטול
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Courses List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white">קורסים</h2>
                </div>

                {courses.length === 0 ? (
                    <div className="p-8 text-center text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                        אין עדיין קורסים. הוסף את הקורס הראשון שלך!
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                        {courses.map((course) => (
                            <div key={course.id} className="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                    <img
                                        src={course.image}
                                        alt={course.title}
                                        className="w-full sm:w-20 h-48 sm:h-20 object-cover rounded-lg"
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/150?text=No+Image';
                                        }}
                                    />
                                    <div className="flex-1 w-full">
                                        <h3 className="font-bold text-base sm:text-lg text-gray-800 dark:text-white">{course.title}</h3>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{course.instructor}</p>
                                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                                            <span>{formatPrice(course.price)}</span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                <Clock size={14} />
                                                {course.actualDuration || course.duration}
                                            </span>
                                            <span>•</span>
                                            <span className="capitalize">
                                                {course.level === 'beginner' ? 'מתחילים' :
                                                    course.level === 'intermediate' ? 'בינוני' : 'מתקדמים'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto">
                                        <button
                                            onClick={() => navigate(`/admin/course/${course.id}/curriculum`)}
                                            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 transition-colors text-xs sm:text-sm"
                                        >
                                            <BookOpen size={16} />
                                            <span className="hidden sm:inline">תוכנית לימודים</span>
                                            <span className="sm:hidden">תוכן</span>
                                        </button>
                                        <button
                                            onClick={() => handleEdit(course)}
                                            className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition-colors"
                                        >
                                            <Edit2 size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(course.id)}
                                            className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
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