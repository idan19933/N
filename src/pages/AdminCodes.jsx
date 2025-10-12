import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import useAuthStore from '../store/authStore';
import { createCode, getAllCodes, deleteCode, toggleCodeStatus, CODE_TYPES } from '../services/codeService';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, Power, PowerOff, Ticket, Lock, Percent, Calendar, Hash } from 'lucide-react';

const AdminCodes = () => {
    const navigate = useNavigate();
    const { isAdmin, loading: authLoading } = useAuthStore();

    const [codes, setCodes] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    const [formData, setFormData] = useState({
        code: '',
        type: CODE_TYPES.DISCOUNT,
        courseId: '',
        discount: 10,
        usageLimit: 100,
        expiresAt: ''
    });

    useEffect(() => {
        if (!isAdmin && !authLoading) {
            navigate('/');
        }
    }, [isAdmin, authLoading, navigate]);

    useEffect(() => {
        if (isAdmin) {
            loadData();
        }
    }, [isAdmin]);

    const loadData = async () => {
        try {
            setLoading(true);

            // Load codes
            const codesData = await getAllCodes();
            setCodes(codesData);

            // Load courses for dropdown
            const coursesSnapshot = await getDocs(collection(db, 'courses'));
            const coursesData = coursesSnapshot.docs.map(doc => ({
                id: doc.id,
                title: doc.data().title
            }));
            setCourses(coursesData);
        } catch (error) {
            console.error('Error loading data:', error);
            toast.error('שגיאה בטעינת הנתונים');
        } finally {
            setLoading(false);
        }
    };

    const generateRandomCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData({ ...formData, code });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.code.trim()) {
            toast.error('נא להזין קוד');
            return;
        }

        const loadingToast = toast.loading('יוצר קוד...');

        try {
            const codeData = {
                code: formData.code.toUpperCase().trim(),
                type: formData.type,
                courseId: formData.courseId || null,
                discount: formData.type === CODE_TYPES.DISCOUNT ? parseInt(formData.discount) : null,
                usageLimit: parseInt(formData.usageLimit) || null,
                expiresAt: formData.expiresAt ? new Date(formData.expiresAt) : null
            };

            const result = await createCode(codeData);

            if (result.success) {
                toast.success('✅ הקוד נוצר בהצלחה!', { id: loadingToast });
                setShowAddModal(false);
                setFormData({
                    code: '',
                    type: CODE_TYPES.DISCOUNT,
                    courseId: '',
                    discount: 10,
                    usageLimit: 100,
                    expiresAt: ''
                });
                loadData();
            } else {
                toast.error('❌ שגיאה: ' + result.error, { id: loadingToast });
            }
        } catch (error) {
            console.error('Error creating code:', error);
            toast.error('❌ שגיאה ביצירת הקוד', { id: loadingToast });
        }
    };

    const handleDelete = async (codeId) => {
        if (!window.confirm('האם אתה בטוח שברצונך למחוק קוד זה?')) return;

        const loadingToast = toast.loading('מוחק...');

        try {
            const result = await deleteCode(codeId);
            if (result.success) {
                toast.success('✅ הקוד נמחק בהצלחה!', { id: loadingToast });
                loadData();
            } else {
                toast.error('❌ שגיאה במחיקה', { id: loadingToast });
            }
        } catch (error) {
            console.error('Error deleting code:', error);
            toast.error('❌ שגיאה במחיקת הקוד', { id: loadingToast });
        }
    };

    const handleToggleStatus = async (codeId, currentStatus) => {
        const loadingToast = toast.loading('מעדכן...');

        try {
            const result = await toggleCodeStatus(codeId, !currentStatus);
            if (result.success) {
                toast.success(`✅ הקוד ${!currentStatus ? 'הופעל' : 'הושבת'}!`, { id: loadingToast });
                loadData();
            } else {
                toast.error('❌ שגיאה בעדכון', { id: loadingToast });
            }
        } catch (error) {
            console.error('Error toggling status:', error);
            toast.error('❌ שגיאה בעדכון סטטוס', { id: loadingToast });
        }
    };

    const getCourseName = (courseId) => {
        if (!courseId) return 'כל הקורסים';
        const course = courses.find(c => c.id === courseId);
        return course ? course.title : 'קורס לא ידוע';
    };

    if (authLoading || loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!isAdmin) return null;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8" dir="rtl">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">ניהול קודים</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">צור והנהל קודי הנחה ופתיחת קורסים</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 font-semibold"
                >
                    <Plus size={20} />
                    צור קוד חדש
                </motion.button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">סך הכל קודים</p>
                            <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">{codes.length}</p>
                        </div>
                        <div className="bg-indigo-100 dark:bg-indigo-900 p-4 rounded-full">
                            <Ticket className="text-indigo-600 dark:text-indigo-400" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">קודים פעילים</p>
                            <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">
                                {codes.filter(c => c.active).length}
                            </p>
                        </div>
                        <div className="bg-green-100 dark:bg-green-900 p-4 rounded-full">
                            <Power className="text-green-600 dark:text-green-400" size={24} />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">סה"כ שימושים</p>
                            <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">
                                {codes.reduce((sum, c) => sum + (c.usedCount || 0), 0)}
                            </p>
                        </div>
                        <div className="bg-purple-100 dark:bg-purple-900 p-4 rounded-full">
                            <Hash className="text-purple-600 dark:text-purple-400" size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Codes Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">קודים</h2>
                </div>

                {codes.length === 0 ? (
                    <div className="p-8 text-center text-gray-600 dark:text-gray-400">
                        אין קודים עדיין. צור את הקוד הראשון!
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">קוד</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">סוג</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">קורס</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ערך</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">שימושים</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">תוקף</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">סטטוס</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">פעולות</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {codes.map((code) => (
                                <motion.tr
                                    key={code.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900 px-3 py-1 rounded">
                                                    {code.code}
                                                </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {code.type === CODE_TYPES.DISCOUNT ? (
                                            <span className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                                    <Percent size={16} />
                                                    הנחה
                                                </span>
                                        ) : (
                                            <span className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                                                    <Lock size={16} />
                                                    פתיחה
                                                </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                            <span className="text-sm text-gray-900 dark:text-gray-300">
                                                {getCourseName(code.courseId)}
                                            </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                {code.type === CODE_TYPES.DISCOUNT ? `${code.discount}%` : 'חינם'}
                                            </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-900 dark:text-gray-300">
                                                {code.usedCount || 0} / {code.usageLimit || '∞'}
                                            </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {code.expiresAt ? (
                                            <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                                    <Calendar size={14} />
                                                {code.expiresAt.toDate().toLocaleDateString('he-IL')}
                                                </span>
                                        ) : (
                                            <span className="text-sm text-gray-500 dark:text-gray-400">ללא תפוגה</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {code.active ? (
                                            <span className="px-2 py-1 text-xs font-semibold bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full">
                                                    פעיל
                                                </span>
                                        ) : (
                                            <span className="px-2 py-1 text-xs font-semibold bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-full">
                                                    מושבת
                                                </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleToggleStatus(code.id, code.active)}
                                                className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg"
                                                title={code.active ? 'השבת' : 'הפעל'}
                                            >
                                                {code.active ? <PowerOff size={18} /> : <Power size={18} />}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(code.id)}
                                                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg"
                                                title="מחק"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add Code Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowAddModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">צור קוד חדש</h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Code */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        קוד
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={formData.code}
                                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                            placeholder="לדוגמה: SUMMER2024"
                                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={generateRandomCode}
                                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                                        >
                                            🎲 אקראי
                                        </button>
                                    </div>
                                </div>

                                {/* Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        סוג קוד
                                    </label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value={CODE_TYPES.DISCOUNT}>הנחה באחוזים</option>
                                        <option value={CODE_TYPES.UNLOCK}>פתיחת קורס חינם</option>
                                    </select>
                                </div>

                                {/* Discount (only for discount type) */}
                                {formData.type === CODE_TYPES.DISCOUNT && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            אחוז הנחה (%)
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="100"
                                            value={formData.discount}
                                            onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500"
                                            required
                                        />
                                    </div>
                                )}

                                {/* Course */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        קורס ספציפי (אופציונלי)
                                    </label>
                                    <select
                                        value={formData.courseId}
                                        onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <option value="">כל הקורסים</option>
                                        {courses.map(course => (
                                            <option key={course.id} value={course.id}>{course.title}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Usage Limit */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        מגבלת שימוש (אופציונלי)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.usageLimit}
                                        onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                                        placeholder="100"
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">השאר ריק ללא הגבלה</p>
                                </div>

                                {/* Expiry Date */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        תאריך תפוגה (אופציונלי)
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.expiresAt}
                                        onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>

                                {/* Buttons */}
                                <div className="flex gap-4">
                                    <button
                                        type="submit"
                                        className="flex-1 py-3 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 font-semibold"
                                    >
                                        צור קוד
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 font-semibold"
                                    >
                                        ביטול
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminCodes;