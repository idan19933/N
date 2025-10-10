import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, X, FileText } from 'lucide-react';
import {
    uploadLessonVideo,
    uploadLessonResource,
    createLesson,
    updateLesson,
    getLesson,
    getLessons
} from '../services/curriculumService';
import useAuthStore from '../store/authStore';

const AddEditLesson = () => {
    const { courseId, sectionId, lessonId } = useParams();
    const navigate = useNavigate();
    const { isAdmin, loading: authLoading } = useAuthStore();
    const isEditMode = !!lessonId;

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        duration: '',
        isFree: false
    });

    const [videoFile, setVideoFile] = useState(null);
    const [existingVideoUrl, setExistingVideoUrl] = useState('');
    const [resources, setResources] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({ video: 0, resource: 0 });
    const [message, setMessage] = useState({ type: '', text: '' });

    // Redirect if not admin
    useEffect(() => {
        if (!isAdmin && !authLoading) {
            navigate('/');
        }
    }, [isAdmin, authLoading, navigate]);

    useEffect(() => {
        if (isEditMode && isAdmin) {
            loadLesson();
        }
    }, [lessonId, isAdmin]);

    const loadLesson = async () => {
        try {
            const lesson = await getLesson(courseId, sectionId, lessonId);
            setFormData({
                title: lesson.title,
                description: lesson.description,
                duration: lesson.duration,
                isFree: lesson.isFree
            });
            setExistingVideoUrl(lesson.videoUrl);
            setResources(lesson.resources || []);
        } catch (error) {
            console.error('Error loading lesson:', error);
            setMessage({ type: 'error', text: 'Error loading lesson' });
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleVideoChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('video/')) {
            setVideoFile(file);
        } else {
            setMessage({ type: 'error', text: 'Please select a valid video file' });
        }
    };

    const handleResourceUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setMessage({ type: '', text: 'Uploading resource...' });

            const resourceData = await uploadLessonResource(
                file,
                courseId,
                sectionId,
                (progress) => {
                    setUploadProgress(prev => ({ ...prev, resource: progress }));
                }
            );

            setResources([...resources, resourceData]);
            setMessage({ type: 'success', text: 'Resource uploaded!' });

            // Reset file input
            e.target.value = '';
        } catch (error) {
            console.error('Error uploading resource:', error);
            setMessage({ type: 'error', text: 'Error uploading resource' });
        }
    };

    const removeResource = (index) => {
        setResources(resources.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isEditMode && !videoFile) {
            setMessage({ type: 'error', text: 'Please select a video file' });
            return;
        }

        setUploading(true);
        setMessage({ type: '', text: '' });

        try {
            let videoData = null;

            // Upload new video if provided
            if (videoFile) {
                setMessage({ type: '', text: 'Uploading video...' });
                videoData = await uploadLessonVideo(
                    videoFile,
                    courseId,
                    sectionId,
                    (progress) => {
                        setUploadProgress(prev => ({ ...prev, video: progress }));
                    }
                );
            }

            // Get order for new lesson
            let order = 0;
            if (!isEditMode) {
                const lessons = await getLessons(courseId, sectionId);
                order = lessons.length;
            }

            const lessonData = {
                title: formData.title,
                description: formData.description,
                duration: formData.duration,
                isFree: formData.isFree,
                resources: resources,
                ...(videoData ? {
                    videoUrl: videoData.url,
                    videoPath: videoData.path
                } : {}),
                ...(!isEditMode ? { order } : {})
            };

            if (isEditMode) {
                await updateLesson(courseId, sectionId, lessonId, lessonData);
                setMessage({ type: 'success', text: 'Lesson updated successfully!' });
            } else {
                await createLesson(courseId, sectionId, lessonData);
                setMessage({ type: 'success', text: 'Lesson created successfully!' });
            }

            setTimeout(() => {
                navigate(`/admin/course/${courseId}/curriculum`);
            }, 1500);

        } catch (error) {
            console.error('Error saving lesson:', error);
            setMessage({ type: 'error', text: 'Error saving lesson. Please try again.' });
        } finally {
            setUploading(false);
        }
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

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">
                    {isEditMode ? 'Edit Lesson' : 'Add New Lesson'}
                </h1>
                <button
                    onClick={() => navigate(`/admin/course/${courseId}/curriculum`)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                    Back
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
                {message.text && (
                    <div className={`mb-4 p-4 rounded ${
                        message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Lesson Title *
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            placeholder="e.g., Introduction to React Hooks"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            placeholder="What will students learn in this lesson?"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Duration
                        </label>
                        <input
                            type="text"
                            name="duration"
                            value={formData.duration}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                            placeholder="e.g., 10:30"
                        />
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            name="isFree"
                            checked={formData.isFree}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <label className="ml-2 text-sm text-gray-700">
                            Free preview (allow anyone to watch this lesson)
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Lesson Video {!isEditMode && '*'}
                        </label>
                        {existingVideoUrl && (
                            <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">Current video uploaded</p>
                                <p className="text-xs text-gray-500 mt-1">Upload a new video to replace it</p>
                            </div>
                        )}
                        <input
                            type="file"
                            accept="video/*"
                            onChange={handleVideoChange}
                            required={!isEditMode && !existingVideoUrl}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                        {videoFile && (
                            <p className="mt-2 text-sm text-gray-600">
                                Selected: {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)} MB)
                            </p>
                        )}
                        {uploading && uploadProgress.video > 0 && (
                            <div className="mt-3">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-indigo-600 h-2 rounded-full transition-all"
                                        style={{ width: `${uploadProgress.video}%` }}
                                    />
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                    Uploading: {uploadProgress.video.toFixed(0)}%
                                </p>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Additional Resources (PDFs, Files, etc.)
                        </label>
                        <input
                            type="file"
                            onChange={handleResourceUpload}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />

                        {resources.length > 0 && (
                            <div className="mt-3 space-y-2">
                                {resources.map((resource, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                        <div className="flex items-center gap-2">
                                            <FileText size={18} className="text-gray-600" />
                                            <span className="text-sm">{resource.name}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeResource(index)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={uploading}
                        className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors ${
                            uploading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-indigo-600 hover:bg-indigo-700'
                        }`}
                    >
                        {uploading ? 'Saving...' : isEditMode ? 'Update Lesson' : 'Create Lesson'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddEditLesson;