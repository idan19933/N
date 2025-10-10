import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { uploadVideo, uploadThumbnail, createCourse } from '../services/adminService';
import useAuthStore from '../store/authStore';

const AdminDashboard = () => {
    const { isAdmin, loading: authLoading } = useAuthStore();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        duration: ''
    });

    const [videoFile, setVideoFile] = useState(null);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({ video: 0, thumbnail: 0 });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [courses, setCourses] = useState([]);
    const [loadingCourses, setLoadingCourses] = useState(true);

    // Redirect if not admin
    useEffect(() => {
        if (!isAdmin && !authLoading) {
            navigate('/');
        }
    }, [isAdmin, authLoading, navigate]);

    useEffect(() => {
        if (isAdmin) {
            loadCourses();
        }
    }, [isAdmin]);

    const loadCourses = async () => {
        try {
            setLoadingCourses(true);
            const coursesRef = collection(db, 'courses');
            const q = query(coursesRef, orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);

            const coursesData = [];
            snapshot.forEach(doc => {
                coursesData.push({ id: doc.id, ...doc.data() });
            });

            setCourses(coursesData);
        } catch (error) {
            console.error('Error loading courses:', error);
        } finally {
            setLoadingCourses(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
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

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setThumbnailFile(file);
        } else {
            setMessage({ type: 'error', text: 'Please select a valid image file' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!videoFile || !thumbnailFile) {
            setMessage({ type: 'error', text: 'Please select both video and thumbnail' });
            return;
        }

        setUploading(true);
        setMessage({ type: '', text: '' });

        try {
            // Upload video
            const videoData = await uploadVideo(videoFile, (progress) => {
                setUploadProgress(prev => ({ ...prev, video: progress }));
            });

            // Upload thumbnail
            const thumbnailData = await uploadThumbnail(thumbnailFile, (progress) => {
                setUploadProgress(prev => ({ ...prev, thumbnail: progress }));
            });

            // Create course document
            const courseData = {
                title: formData.title,
                description: formData.description,
                price: parseFloat(formData.price),
                duration: formData.duration,
                videoUrl: videoData.url,
                videoPath: videoData.path,
                image: thumbnailData.url,
                thumbnailPath: thumbnailData.path
            };

            await createCourse(courseData);

            setMessage({ type: 'success', text: 'Course uploaded successfully!' });

            // Reset form
            setFormData({ title: '', description: '', price: '', duration: '' });
            setVideoFile(null);
            setThumbnailFile(null);
            setUploadProgress({ video: 0, thumbnail: 0 });

            // Reset file inputs
            document.getElementById('video-upload').value = '';
            document.getElementById('thumbnail-upload').value = '';

            // Reload courses
            loadCourses();

        } catch (error) {
            console.error('Error uploading course:', error);
            setMessage({ type: 'error', text: 'Error uploading course. Please try again.' });
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
        <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

            {/* Existing Courses Section */}
            <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Your Courses</h2>
                {loadingCourses ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                ) : courses.length === 0 ? (
                    <div className="bg-gray-50 rounded-lg p-6 text-center">
                        <p className="text-gray-600">No courses yet. Upload your first course below!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map(course => (
                            <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                                <img
                                    src={course.image}
                                    alt={course.title}
                                    className="w-full h-48 object-cover"
                                />
                                <div className="p-4">
                                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">{course.title}</h3>
                                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{course.description}</p>
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-indigo-600 font-bold">${course.price}</span>
                                        <span className="text-gray-500 text-sm">{course.duration}</span>
                                    </div>
                                    <button
                                        onClick={() => navigate(`/admin/course/${course.id}/curriculum`)}
                                        className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                    >
                                        Manage Curriculum
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Upload New Course Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold mb-6">Upload New Course</h2>

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
                            Course Title
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="e.g., Complete React Course"
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
                            required
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Course description..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Price ($)
                            </label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleInputChange}
                                required
                                min="0"
                                step="0.01"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="29.99"
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
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="e.g., 10h 30m"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Course Intro Video
                        </label>
                        <input
                            id="video-upload"
                            type="file"
                            accept="video/*"
                            onChange={handleVideoChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                        {videoFile && (
                            <p className="mt-2 text-sm text-gray-600">
                                Selected: {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(2)} MB)
                            </p>
                        )}
                        {uploading && uploadProgress.video > 0 && (
                            <div className="mt-2">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-indigo-600 h-2 rounded-full transition-all"
                                        style={{ width: `${uploadProgress.video}%` }}
                                    />
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                    Video: {uploadProgress.video.toFixed(0)}%
                                </p>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Thumbnail Image
                        </label>
                        <input
                            id="thumbnail-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleThumbnailChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                        {thumbnailFile && (
                            <div className="mt-2">
                                <p className="text-sm text-gray-600">
                                    Selected: {thumbnailFile.name}
                                </p>
                                <img
                                    src={URL.createObjectURL(thumbnailFile)}
                                    alt="Preview"
                                    className="mt-2 w-48 h-32 object-cover rounded"
                                />
                            </div>
                        )}
                        {uploading && uploadProgress.thumbnail > 0 && (
                            <div className="mt-2">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-indigo-600 h-2 rounded-full transition-all"
                                        style={{ width: `${uploadProgress.thumbnail}%` }}
                                    />
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                    Thumbnail: {uploadProgress.thumbnail.toFixed(0)}%
                                </p>
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
                        {uploading ? 'Uploading...' : 'Upload Course'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminDashboard;