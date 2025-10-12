import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, where, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Target, Plus, Trash2, Calendar, TrendingUp, CheckCircle } from 'lucide-react';
import { getSections, getLessons } from '../services/curriculumService';
import { getUserProgress } from '../services/progressService';

const AdminGoals = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [goals, setGoals] = useState([]);
    const [sections, setSections] = useState([]);
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddGoal, setShowAddGoal] = useState(false);
    const [currentUserProgress, setCurrentUserProgress] = useState(null);
    const [loadingProgress, setLoadingProgress] = useState(false);

    const [formData, setFormData] = useState({
        userId: '',
        courseId: '',
        goalType: 'course', // 'course', 'section', 'lesson'
        sectionId: '',
        lessonId: '',
        title: '',
        description: '',
        targetDate: '',
        targetCompletionRate: 100
    });

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (formData.courseId) {
            loadCourseSections();
        }
    }, [formData.courseId]);

    useEffect(() => {
        if (formData.courseId && formData.sectionId) {
            loadSectionLessons();
        }
    }, [formData.sectionId]);

    useEffect(() => {
        if (formData.userId && formData.courseId) {
            loadUserProgress();
        }
    }, [formData.userId, formData.courseId]);

    const loadData = async () => {
        try {
            setLoading(true);

            // Load users
            const usersSnapshot = await getDocs(collection(db, 'users'));
            const usersData = usersSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setUsers(usersData);

            // Load courses
            const coursesSnapshot = await getDocs(collection(db, 'courses'));
            const coursesData = coursesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setCourses(coursesData);

            // Load goals with progress
            await loadGoalsWithProgress();

        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadGoalsWithProgress = async () => {
        try {
            const goalsSnapshot = await getDocs(collection(db, 'goals'));
            const goalsData = await Promise.all(
                goalsSnapshot.docs.map(async (goalDoc) => {
                    const goal = { id: goalDoc.id, ...goalDoc.data() };

                    // Load user progress
                    const userProgress = await getUserProgress(goal.userId);
                    const courseProgress = userProgress[goal.courseId] || { completionRate: 0 };

                    // Calculate specific progress based on goal type
                    let currentProgress = 0;
                    if (goal.goalType === 'course') {
                        currentProgress = courseProgress.completionRate || 0;
                    } else if (goal.goalType === 'section') {
                        // Calculate section progress
                        const sectionLessons = await getLessons(goal.courseId, goal.sectionId);
                        const progressQuery = query(
                            collection(db, 'progress'),
                            where('userId', '==', goal.userId),
                            where('courseId', '==', goal.courseId)
                        );
                        const progressSnapshot = await getDocs(progressQuery);
                        const completedInSection = progressSnapshot.docs.filter(doc => {
                            const lessonId = doc.data().lessonId;
                            return sectionLessons.some(l => l.id === lessonId) && doc.data().completed;
                        }).length;
                        currentProgress = sectionLessons.length > 0
                            ? (completedInSection / sectionLessons.length) * 100
                            : 0;
                    } else if (goal.goalType === 'lesson') {
                        // Check if lesson is completed
                        const progressQuery = query(
                            collection(db, 'progress'),
                            where('userId', '==', goal.userId),
                            where('courseId', '==', goal.courseId),
                            where('lessonId', '==', goal.lessonId)
                        );
                        const progressSnapshot = await getDocs(progressQuery);
                        const lessonProgress = progressSnapshot.docs[0]?.data();
                        currentProgress = lessonProgress?.completed ? 100 : (lessonProgress?.percentage || 0);
                    }

                    // Load user and course details
                    const user = users.find(u => u.id === goal.userId);
                    const course = courses.find(c => c.id === goal.courseId);

                    return {
                        ...goal,
                        userName: user?.email || 'Unknown',
                        courseName: course?.title || 'Unknown',
                        currentProgress: currentProgress
                    };
                })
            );
            setGoals(goalsData);
        } catch (error) {
            console.error('Error loading goals:', error);
        }
    };

    const loadCourseSections = async () => {
        try {
            const sectionsData = await getSections(formData.courseId);
            setSections(sectionsData);
        } catch (error) {
            console.error('Error loading sections:', error);
        }
    };

    const loadSectionLessons = async () => {
        try {
            const lessonsData = await getLessons(formData.courseId, formData.sectionId);
            setLessons(lessonsData);
        } catch (error) {
            console.error('Error loading lessons:', error);
        }
    };

    const loadUserProgress = async () => {
        try {
            setLoadingProgress(true);
            const progress = await getUserProgress(formData.userId);
            const courseProgress = progress[formData.courseId];
            setCurrentUserProgress(courseProgress || { completionRate: 0, completedLessons: 0, totalLessons: 0 });
        } catch (error) {
            console.error('Error loading progress:', error);
            setCurrentUserProgress(null);
        } finally {
            setLoadingProgress(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Reset dependent fields when changing type
        if (name === 'goalType') {
            setFormData(prev => ({
                ...prev,
                [name]: value,
                sectionId: '',
                lessonId: ''
            }));
        } else if (name === 'sectionId') {
            setFormData(prev => ({
                ...prev,
                [name]: value,
                lessonId: ''
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const user = users.find(u => u.id === formData.userId);
            const course = courses.find(c => c.id === formData.courseId);

            let goalTitle = formData.title;
            let targetEntity = course?.title || 'Course';

            // Auto-generate title if empty
            if (!goalTitle) {
                if (formData.goalType === 'section') {
                    const section = sections.find(s => s.id === formData.sectionId);
                    targetEntity = section?.title || 'Section';
                    goalTitle = `השלמת סקשן: ${targetEntity}`;
                } else if (formData.goalType === 'lesson') {
                    const lesson = lessons.find(l => l.id === formData.lessonId);
                    targetEntity = lesson?.title || 'Lesson';
                    goalTitle = `השלמת שיעור: ${targetEntity}`;
                } else {
                    goalTitle = `השלמת קורס: ${targetEntity}`;
                }
            }

            const goalData = {
                userId: formData.userId,
                courseId: formData.courseId,
                goalType: formData.goalType,
                ...(formData.goalType === 'section' && { sectionId: formData.sectionId }),
                ...(formData.goalType === 'lesson' && {
                    sectionId: formData.sectionId,
                    lessonId: formData.lessonId
                }),
                title: goalTitle,
                description: formData.description,
                targetCompletionRate: parseInt(formData.targetCompletionRate),
                targetDate: new Date(formData.targetDate),
                createdAt: new Date(),
                status: 'active'
            };

            await addDoc(collection(db, 'goals'), goalData);

            // Send notification to user
            await addDoc(collection(db, 'notifications'), {
                type: 'goal_assigned',
                userId: formData.userId,
                userName: user?.email || 'User',
                courseId: formData.courseId,
                courseName: course?.title || 'Course',
                goalTitle: goalTitle,
                targetDate: new Date(formData.targetDate),
                timestamp: new Date(),
                read: false
            });

            alert('יעד נוסף בהצלחה!');
            resetForm();
            loadData();
        } catch (error) {
            console.error('Error adding goal:', error);
            alert('שגיאה בהוספת יעד: ' + error.message);
        }
    };

    const resetForm = () => {
        setFormData({
            userId: '',
            courseId: '',
            goalType: 'course',
            sectionId: '',
            lessonId: '',
            title: '',
            description: '',
            targetDate: '',
            targetCompletionRate: 100
        });
        setShowAddGoal(false);
        setSections([]);
        setLessons([]);
        setCurrentUserProgress(null);
    };

    const handleDelete = async (goalId) => {
        if (!window.confirm('האם למחוק יעד זה?')) return;

        try {
            await deleteDoc(doc(db, 'goals', goalId));
            loadData();
        } catch (error) {
            console.error('Error deleting goal:', error);
            alert('שגיאה במחיקת יעד: ' + error.message);
        }
    };

    const getGoalStatus = (goal) => {
        const targetDate = new Date(goal.targetDate.seconds ? goal.targetDate.toDate() : goal.targetDate);
        const now = new Date();
        const daysLeft = Math.ceil((targetDate - now) / (1000 * 60 * 60 * 24));

        if (goal.currentProgress >= goal.targetCompletionRate) {
            return { text: '✓ הושלם', color: 'green', days: daysLeft };
        } else if (daysLeft < 0) {
            return { text: 'פג תוקף', color: 'red', days: daysLeft };
        } else if (daysLeft <= 7) {
            return { text: `${daysLeft} ימים נותרו`, color: 'orange', days: daysLeft };
        } else {
            return { text: `${daysLeft} ימים נותרו`, color: 'green', days: daysLeft };
        }
    };

    const getGoalTypeLabel = (goalType) => {
        switch(goalType) {
            case 'course': return 'קורס מלא';
            case 'section': return 'סקשן';
            case 'lesson': return 'שיעור';
            default: return goalType;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8" dir="rtl">
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={() => navigate('/admin')}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                        ← חזרה
                    </button>
                </div>
                <div className="flex items-center gap-3">
                    <Target size={32} className="text-indigo-600" />
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">ניהול יעדים</h1>
                        <p className="text-gray-600">הגדר יעדים למשתמשים ועקוב אחר התקדמות</p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-md p-4">
                    <div className="text-2xl font-bold text-indigo-600">{goals.length}</div>
                    <div className="text-sm text-gray-600">סה"כ יעדים</div>
                </div>
                <div className="bg-white rounded-xl shadow-md p-4">
                    <div className="text-2xl font-bold text-green-600">
                        {goals.filter(g => g.currentProgress >= g.targetCompletionRate).length}
                    </div>
                    <div className="text-sm text-gray-600">הושלמו</div>
                </div>
                <div className="bg-white rounded-xl shadow-md p-4">
                    <div className="text-2xl font-bold text-orange-600">
                        {goals.filter(g => {
                            const daysLeft = Math.ceil((new Date(g.targetDate.seconds ? g.targetDate.toDate() : g.targetDate) - new Date()) / (1000 * 60 * 60 * 24));
                            return daysLeft <= 7 && daysLeft >= 0 && g.currentProgress < g.targetCompletionRate;
                        }).length}
                    </div>
                    <div className="text-sm text-gray-600">דחופים</div>
                </div>
                <div className="bg-white rounded-xl shadow-md p-4">
                    <div className="text-2xl font-bold text-red-600">
                        {goals.filter(g => {
                            const daysLeft = Math.ceil((new Date(g.targetDate.seconds ? g.targetDate.toDate() : g.targetDate) - new Date()) / (1000 * 60 * 60 * 24));
                            return daysLeft < 0 && g.currentProgress < g.targetCompletionRate;
                        }).length}
                    </div>
                    <div className="text-sm text-gray-600">פג תוקף</div>
                </div>
            </div>

            {/* Add Goal Button */}
            <div className="mb-6">
                {!showAddGoal && (
                    <button
                        onClick={() => setShowAddGoal(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
                    >
                        <Plus size={20} />
                        הוסף יעד חדש
                    </button>
                )}
            </div>

            {/* Add Goal Form */}
            {showAddGoal && (
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">הוסף יעד חדש</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    בחר משתמש *
                                </label>
                                <select
                                    name="userId"
                                    value={formData.userId}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">בחר משתמש</option>
                                    {users.map(user => (
                                        <option key={user.id} value={user.id}>
                                            {user.email} - {user.name || 'No name'}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    בחר קורס *
                                </label>
                                <select
                                    name="courseId"
                                    value={formData.courseId}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">בחר קורס</option>
                                    {courses.map(course => (
                                        <option key={course.id} value={course.id}>
                                            {course.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Current Progress Display */}
                        {currentUserProgress && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-semibold text-gray-800">התקדמות נוכחית בקורס</span>
                                    <span className="text-2xl font-bold text-indigo-600">
                                        {Math.round(currentUserProgress.completionRate)}%
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full"
                                        style={{ width: `${currentUserProgress.completionRate}%` }}
                                    />
                                </div>
                                <p className="text-sm text-gray-600 mt-2">
                                    {currentUserProgress.completedLessons} מתוך {currentUserProgress.totalLessons} שיעורים הושלמו
                                </p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                סוג יעד *
                            </label>
                            <select
                                name="goalType"
                                value={formData.goalType}
                                onChange={handleInputChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="course">קורס מלא</option>
                                <option value="section">סקשן ספציפי</option>
                                <option value="lesson">שיעור ספציפי</option>
                            </select>
                        </div>

                        {formData.goalType === 'section' && sections.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    בחר סקשן *
                                </label>
                                <select
                                    name="sectionId"
                                    value={formData.sectionId}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">בחר סקשן</option>
                                    {sections.map((section, index) => (
                                        <option key={section.id} value={section.id}>
                                            {index + 1}. {section.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {formData.goalType === 'lesson' && (
                            <>
                                {sections.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            בחר סקשן *
                                        </label>
                                        <select
                                            name="sectionId"
                                            value={formData.sectionId}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="">בחר סקשן</option>
                                            {sections.map((section, index) => (
                                                <option key={section.id} value={section.id}>
                                                    {index + 1}. {section.title}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                {lessons.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            בחר שיעור *
                                        </label>
                                        <select
                                            name="lessonId"
                                            value={formData.lessonId}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="">בחר שיעור</option>
                                            {lessons.map((lesson, index) => (
                                                <option key={lesson.id} value={lesson.id}>
                                                    {index + 1}. {lesson.title} ({lesson.duration})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                כותרת היעד (אופציונלי - ייווצר אוטומטית)
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="השאר ריק ליצירה אוטומטית"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                תיאור
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={3}
                                placeholder="פרטים נוספים על היעד..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    תאריך יעד *
                                </label>
                                <input
                                    type="date"
                                    name="targetDate"
                                    value={formData.targetDate}
                                    onChange={handleInputChange}
                                    required
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    אחוז יעד להשלמה (%)
                                </label>
                                <input
                                    type="number"
                                    name="targetCompletionRate"
                                    value={formData.targetCompletionRate}
                                    onChange={handleInputChange}
                                    min="0"
                                    max="100"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="submit"
                                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold"
                            >
                                הוסף יעד
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-semibold"
                            >
                                ביטול
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Goals List */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b">
                    <h2 className="text-xl font-bold text-gray-800">יעדים פעילים</h2>
                </div>

                {goals.length === 0 ? (
                    <div className="p-8 text-center text-gray-600">
                        <Target size={48} className="mx-auto text-gray-400 mb-4" />
                        <p>אין יעדים פעילים. הוסף יעד ראשון!</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {goals.map((goal) => {
                            const status = getGoalStatus(goal);
                            const progressPercentage = (goal.currentProgress / goal.targetCompletionRate) * 100;

                            return (
                                <div key={goal.id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-bold text-lg text-gray-800">
                                                    {goal.title}
                                                </h3>
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                    status.color === 'red' ? 'bg-red-100 text-red-700' :
                                                        status.color === 'orange' ? 'bg-orange-100 text-orange-700' :
                                                            'bg-green-100 text-green-700'
                                                }`}>
                                                    {status.text}
                                                </span>
                                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                                    {getGoalTypeLabel(goal.goalType)}
                                                </span>
                                            </div>

                                            {goal.description && (
                                                <p className="text-gray-600 mb-3">{goal.description}</p>
                                            )}

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                                                <div>
                                                    <span className="text-gray-500">משתמש:</span>
                                                    <p className="font-semibold">{goal.userName}</p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">קורס:</span>
                                                    <p className="font-semibold">{goal.courseName}</p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">תאריך יעד:</span>
                                                    <p className="font-semibold">
                                                        {new Date(goal.targetDate.seconds ? goal.targetDate.toDate() : goal.targetDate)
                                                            .toLocaleDateString('he-IL')}
                                                    </p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">יעד:</span>
                                                    <p className="font-semibold">{goal.targetCompletionRate}%</p>
                                                </div>
                                            </div>

                                            {/* Progress Bar */}
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm text-gray-600">התקדמות נוכחית</span>
                                                    <span className="text-sm font-bold">
                                                        {Math.round(goal.currentProgress)}% / {goal.targetCompletionRate}%
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-3 relative">
                                                    <div
                                                        className={`h-3 rounded-full transition-all ${
                                                            goal.currentProgress >= goal.targetCompletionRate
                                                                ? 'bg-gradient-to-r from-green-500 to-green-600'
                                                                : status.color === 'red'
                                                                    ? 'bg-gradient-to-r from-red-500 to-red-600'
                                                                    : 'bg-gradient-to-r from-indigo-500 to-purple-600'
                                                        }`}
                                                        style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                                                    />
                                                    {/* Target line */}
                                                    {progressPercentage < 100 && (
                                                        <div
                                                            className="absolute top-0 bottom-0 w-0.5 bg-gray-700"
                                                            style={{ left: '100%' }}
                                                        >
                                                            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 rotate-45 bg-gray-700"></div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleDelete(goal.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg mr-4"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminGoals;