import { useState } from 'react';
import { uploadVideo, uploadThumbnail, createCourse } from '../services/adminService';
import useAuthStore from '../store/authStore';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const { isAdmin } = useAuthStore();
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

    // Redirect if not admin
    if (!isAdmin) {
        navigate('/');
        return null;
    }

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

        } catch (error) {
            console.error('Error uploading course:', error);
            setMessage({ type: 'error', text: 'Error uploading course. Please try again.' });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

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
                            Course Video
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