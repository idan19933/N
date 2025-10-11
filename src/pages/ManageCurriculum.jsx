import  React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, GripVertical, Video, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import {
    getSections,
    createSection,
    updateSection,
    deleteSection,
    reorderSections,
    getLessons,
    deleteLesson,
    reorderLessons
} from '../services/curriculumService';
import useAuthStore from '../store/authStore';

const ManageCurriculum = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { isAdmin, loading: authLoading } = useAuthStore();

    const [courseTitle, setCourseTitle] = useState('');
    const [sections, setSections] = useState([]);
    const [expandedSections, setExpandedSections] = useState({});
    const [loading, setLoading] = useState(true);
    const [showAddSection, setShowAddSection] = useState(false);
    const [newSectionTitle, setNewSectionTitle] = useState('');
    const [editingSection, setEditingSection] = useState(null);

    // Redirect if not admin
    useEffect(() => {
        if (!isAdmin && !authLoading) {
            navigate('/');
        }
    }, [isAdmin, authLoading, navigate]);

    useEffect(() => {
        if (isAdmin) {
            loadCurriculum();
        }
    }, [courseId, isAdmin]);

    const loadCurriculum = async () => {
        try {
            setLoading(true);

            // Load course info
            const courseRef = doc(db, 'courses', courseId);
            const courseSnap = await getDoc(courseRef);
            if (courseSnap.exists()) {
                setCourseTitle(courseSnap.data().title);
            }

            const sectionsData = await getSections(courseId);

            // Load lessons for each section
            const sectionsWithLessons = await Promise.all(
                sectionsData.map(async (section) => {
                    const lessons = await getLessons(courseId, section.id);
                    return { ...section, lessons };
                })
            );

            setSections(sectionsWithLessons);
        } catch (error) {
            console.error('Error loading curriculum:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddSection = async () => {
        if (!newSectionTitle.trim()) return;

        try {
            await createSection(courseId, {
                title: newSectionTitle,
                order: sections.length
            });

            setNewSectionTitle('');
            setShowAddSection(false);
            loadCurriculum();
        } catch (error) {
            console.error('Error adding section:', error);
        }
    };

    const handleDeleteSection = async (sectionId) => {
        if (!confirm('Delete this section and all its lessons?')) return;

        try {
            await deleteSection(courseId, sectionId);
            loadCurriculum();
        } catch (error) {
            console.error('Error deleting section:', error);
        }
    };

    const handleDeleteLesson = async (sectionId, lessonId, videoPath) => {
        if (!confirm('Delete this lesson?')) return;

        try {
            await deleteLesson(courseId, sectionId, lessonId, videoPath);
            loadCurriculum();
        } catch (error) {
            console.error('Error deleting lesson:', error);
        }
    };

    const toggleSection = (sectionId) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    const moveSectionUp = async (index) => {
        if (index === 0) return;

        const newSections = [...sections];
        [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];

        setSections(newSections);
        await reorderSections(courseId, newSections);
    };

    const moveSectionDown = async (index) => {
        if (index === sections.length - 1) return;

        const newSections = [...sections];
        [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];

        setSections(newSections);
        await reorderSections(courseId, newSections);
    };

    const moveLessonUp = async (sectionIndex, lessonIndex) => {
        if (lessonIndex === 0) return;

        const section = sections[sectionIndex];
        const newLessons = [...section.lessons];
        [newLessons[lessonIndex - 1], newLessons[lessonIndex]] = [newLessons[lessonIndex], newLessons[lessonIndex - 1]];

        const newSections = [...sections];
        newSections[sectionIndex] = { ...section, lessons: newLessons };
        setSections(newSections);

        await reorderLessons(courseId, section.id, newLessons);
    };

    const moveLessonDown = async (sectionIndex, lessonIndex) => {
        const section = sections[sectionIndex];
        if (lessonIndex === section.lessons.length - 1) return;

        const newLessons = [...section.lessons];
        [newLessons[lessonIndex], newLessons[lessonIndex + 1]] = [newLessons[lessonIndex + 1], newLessons[lessonIndex]];

        const newSections = [...sections];
        newSections[sectionIndex] = { ...section, lessons: newLessons };
        setSections(newSections);

        await reorderLessons(courseId, section.id, newLessons);
    };

    // Show loading while checking auth
    if (authLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    // Don't render if not admin
    if (!isAdmin) {
        return null;
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-6">
            {/* Header with Course Title */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                    <button
                        onClick={() => navigate('/admin')}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
                    >
                        ← Back to Admin
                    </button>
                </div>
                <h1 className="text-3xl font-bold text-gray-800">
                    {courseTitle}
                </h1>
                <p className="text-gray-600 mt-2">
                    Organize your course into sections and lessons
                </p>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">📚 How to Structure Your Course:</h3>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                    <li>Create <strong>Sections</strong> (e.g., "Introduction", "Advanced Topics")</li>
                    <li>Add <strong>Lessons</strong> to each section with videos and resources</li>
                    <li>Use arrows to reorder sections and lessons</li>
                    <li>Mark lessons as "Free Preview" to let anyone watch them</li>
                </ol>
            </div>

            {/* Add Section Button */}
            <div className="mb-6">
                {!showAddSection ? (
                    <button
                        onClick={() => setShowAddSection(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        <Plus size={20} />
                        Add Section
                    </button>
                ) : (
                    <div className="bg-white p-4 rounded-lg shadow-md">
                        <input
                            type="text"
                            value={newSectionTitle}
                            onChange={(e) => setNewSectionTitle(e.target.value)}
                            placeholder="Section title (e.g., Introduction)"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3"
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={handleAddSection}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                            >
                                Create Section
                            </button>
                            <button
                                onClick={() => {
                                    setShowAddSection(false);
                                    setNewSectionTitle('');
                                }}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Sections List */}
            {sections.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <Video size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 text-lg font-medium mb-2">No sections yet</p>
                    <p className="text-gray-500 text-sm">Click "Add Section" above to start building your course curriculum</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {sections.map((section, sectionIndex) => (
                        <div key={section.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                            {/* Section Header */}
                            <div className="bg-gray-50 p-4 flex items-center justify-between border-b">
                                <div className="flex items-center gap-3 flex-1">
                                    <div className="flex flex-col gap-1">
                                        <button
                                            onClick={() => moveSectionUp(sectionIndex)}
                                            disabled={sectionIndex === 0}
                                            className={`${sectionIndex === 0 ? 'text-gray-300' : 'text-gray-600 hover:text-indigo-600'}`}
                                        >
                                            <ChevronUp size={16} />
                                        </button>
                                        <button
                                            onClick={() => moveSectionDown(sectionIndex)}
                                            disabled={sectionIndex === sections.length - 1}
                                            className={`${sectionIndex === sections.length - 1 ? 'text-gray-300' : 'text-gray-600 hover:text-indigo-600'}`}
                                        >
                                            <ChevronDown size={16} />
                                        </button>
                                    </div>

                                    <GripVertical className="text-gray-400 cursor-move" size={20} />

                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg">
                                            Section {sectionIndex + 1}: {section.title}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {section.lessons?.length || 0} lessons
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => navigate(`/admin/course/${courseId}/section/${section.id}/add-lesson`)}
                                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 flex items-center gap-1"
                                    >
                                        <Plus size={16} />
                                        Add Lesson
                                    </button>
                                    <button
                                        onClick={() => toggleSection(section.id)}
                                        className="p-2 hover:bg-gray-200 rounded"
                                    >
                                        {expandedSections[section.id] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </button>
                                    <button
                                        onClick={() => handleDeleteSection(section.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>

                            {/* Lessons List */}
                            {expandedSections[section.id] && (
                                <div className="p-4">
                                    {section.lessons?.length === 0 ? (
                                        <p className="text-gray-500 text-center py-4">No lessons yet. Click "Add Lesson" to create one.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {section.lessons.map((lesson, lessonIndex) => (
                                                <div
                                                    key={lesson.id}
                                                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                                                >
                                                    <div className="flex flex-col gap-1">
                                                        <button
                                                            onClick={() => moveLessonUp(sectionIndex, lessonIndex)}
                                                            disabled={lessonIndex === 0}
                                                            className={`${lessonIndex === 0 ? 'text-gray-300' : 'text-gray-600 hover:text-indigo-600'}`}
                                                        >
                                                            <ChevronUp size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => moveLessonDown(sectionIndex, lessonIndex)}
                                                            disabled={lessonIndex === section.lessons.length - 1}
                                                            className={`${lessonIndex === section.lessons.length - 1 ? 'text-gray-300' : 'text-gray-600 hover:text-indigo-600'}`}
                                                        >
                                                            <ChevronDown size={14} />
                                                        </button>
                                                    </div>

                                                    <Video size={18} className="text-indigo-600" />

                                                    <div className="flex-1">
                                                        <p className="font-medium">{lesson.title}</p>
                                                        <div className="flex items-center gap-3 text-sm text-gray-600">
                                                            <span>{lesson.duration}</span>
                                                            {lesson.isFree && (
                                                                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                                                                    Free Preview
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => navigate(`/admin/course/${courseId}/section/${section.id}/lesson/${lesson.id}/edit`)}
                                                            className="p-2 text-gray-600 hover:bg-gray-200 rounded"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteLesson(section.id, lesson.id, lesson.videoPath)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ManageCurriculum;