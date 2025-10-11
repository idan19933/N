import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Video } from 'lucide-react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';
import { createLesson, getLessons } from '../services/curriculumService';

const AddLesson = () => {
    const { courseId, sectionId } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        duration: '',
        isFree: false
    });

    const [videoFile, setVideoFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [message, setMessage] = useState({ type: '', text: '' });

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
            setMessage({ type: '', text: '' });
        } else {
            setMessage({ type: 'error', text: 'אנא בחר קובץ וידאו תקין' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log('📝 Form submitted');
        console.log('📦 Form data:', formData);
        console.log('🎥 Video file:', videoFile);
        console.log('🎯 Course ID:', courseId);
        console.log('📂 Section ID:', sectionId);

        if (!videoFile) {
            alert('אנא בחר קובץ וידאו');
            return;
        }

        setUploading(true);
        setMessage({ type: '', text: '' });

        try {
            // Upload video
            const videoPath = `courses/${courseId}/sections/${sectionId}/lessons/${Date.now()}_${videoFile.name}`;
            console.log('📤 Uploading to path:', videoPath);

            const videoRef = ref(storage, videoPath);
            const uploadTask = uploadBytesResumable(videoRef, videoFile);

            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setUploadProgress(progress);
                    console.log('📊 Upload progress:', progress.toFixed(2) + '%');
                },
                (error) => {
                    console.error('❌ Upload error:', error);
                    setMessage({ type: 'error', text: 'שגיאה בהעלאת הווידאו: ' + error.message });
                    setUploading(false);
                },
                async () => {
                    console.log('✅ Upload complete!');

                    try {
                        // Get download URL
                        const videoUrl = await getDownloadURL(uploadTask.snapshot.ref);
                        console.log('🔗 Video URL:', videoUrl);

                        // Get current lesson count
                        const lessons = await getLessons(courseId, sectionId);
                        console.log('📚 Current lessons count:', lessons.length);

                        // Create lesson document
                        const lessonData = {
                            title: formData.title,
                            description: formData.description,
                            duration: formData.duration,
                            videoUrl,
                            videoPath,
                            isFree: formData.isFree,
                            order: lessons.length
                        };

                        console.log('💾 Creating lesson with data:', lessonData);

                        const lessonId = await createLesson(courseId, sectionId, lessonData);
                        console.log('✅ Lesson created with ID:', lessonId);

                        setMessage({ type: 'success', text: 'השיעור נוסף בהצלחה!' });

                        setTimeout(() => {
                            navigate(`/admin/course/${courseId}/curriculum`);
                        }, 1500);
                    } catch (error) {
                        console.error('❌ Error creating lesson:', error);
                        setMessage({ type: 'error', text: 'שגיאה ביצירת השיעור: ' + error.message });
                        setUploading(false);
                    }
                }
            );
        } catch (error) {
            console.error('❌ Error adding lesson:', error);
            setMessage({ type: 'error', text: 'שגיאה בהוספת השיעור: ' + error.message });
            setUploading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8" dir="rtl">
            <button
                onClick={() => navigate(`/admin/course/${courseId}/curriculum`)}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6"
            >
                <ArrowLeft size={20} />
                חזרה לניהול הקורס
            </button>

            <div className="bg-white rounded-xl shadow-lg p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">הוספת שיעור חדש</h1>

                {message.text && (
                    <div className={`mb-6 p-4 rounded-lg ${
                        message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            כותרת השיעור *
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="לדוגמה: מבוא ל-React Hooks"
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
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="תיאור השיעור..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            משך זמן *
                        </label>
                        <input
                            type="text"
                            name="duration"
                            value={formData.duration}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="לדוגמה: 15:30"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            קובץ וידאו *
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                            <div className="flex flex-col items-center justify-center">
                                <Upload className="text-gray-400 mb-4" size={48} />
                                <input
                                    type="file"
                                    accept="video/*"
                                    onChange={handleVideoChange}
                                    required
                                    className="w-full"
                                />
                            </div>
                            {videoFile && (
                                <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-3 rounded">
                                    <Video size={20} className="text-indigo-600" />
                                    <div>
                                        <div className="font-medium">{videoFile.name}</div>
                                        <div className="text-xs">{(videoFile.size / 1024 / 1024).toFixed(2)} MB</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="isFree"
                            name="isFree"
                            checked={formData.isFree}
                            onChange={handleInputChange}
                            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                        />
                        <label htmlFor="isFree" className="text-sm font-medium text-gray-700">
                            הפוך את השיעור לחינמי (תצוגה מקדימה)
                        </label>
                    </div>

                    {uploading && (
                        <div>
                            <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                                <div
                                    className="bg-indigo-600 h-4 rounded-full transition-all"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                            <p className="text-sm text-gray-600 text-center">
                                מעלה: {uploadProgress.toFixed(0)}%
                            </p>
                        </div>
                    )}

                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={uploading}
                            className={`flex-1 py-3 px-4 rounded-lg font-semibold text-white transition-colors ${
                                uploading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700'
                            }`}
                        >
                            {uploading ? 'מעלה...' : 'הוסף שיעור'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate(`/admin/course/${courseId}/curriculum`)}
                            disabled={uploading}
                            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 disabled:opacity-50"
                        >
                            ביטול
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddLesson;