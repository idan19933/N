import { db, storage } from '../config/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';

// Upload video to Firebase Storage
export const uploadVideo = (file, onProgress) => {
    return new Promise((resolve, reject) => {
        const storageRef = ref(storage, `courses/videos/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                if (onProgress) onProgress(progress);
            },
            (error) => reject(error),
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                resolve({ url: downloadURL, path: uploadTask.snapshot.ref.fullPath });
            }
        );
    });
};

// Upload thumbnail image
export const uploadThumbnail = (file, onProgress) => {
    return new Promise((resolve, reject) => {
        const storageRef = ref(storage, `courses/thumbnails/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                if (onProgress) onProgress(progress);
            },
            (error) => reject(error),
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                resolve({ url: downloadURL, path: uploadTask.snapshot.ref.fullPath });
            }
        );
    });
};

// Create a new course
export const createCourse = async (courseData) => {
    try {
        const docRef = await addDoc(collection(db, 'courses'), {
            ...courseData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            students: 0,
            published: true
        });
        return docRef.id;
    } catch (error) {
        console.error('Error creating course:', error);
        throw error;
    }
};

// Update course
export const updateCourse = async (courseId, courseData) => {
    try {
        const courseRef = doc(db, 'courses', courseId);
        await updateDoc(courseRef, {
            ...courseData,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error updating course:', error);
        throw error;
    }
};

// Delete course
export const deleteCourse = async (courseId, videoPath, thumbnailPath) => {
    try {
        // Delete video and thumbnail from storage
        if (videoPath) {
            const videoRef = ref(storage, videoPath);
            await deleteObject(videoRef);
        }
        if (thumbnailPath) {
            const thumbnailRef = ref(storage, thumbnailPath);
            await deleteObject(thumbnailRef);
        }

        // Delete course document
        await deleteDoc(doc(db, 'courses', courseId));
    } catch (error) {
        console.error('Error deleting course:', error);
        throw error;
    }
};