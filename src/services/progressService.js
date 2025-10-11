import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

// שמירת התקדמות וידאו
export const saveVideoProgress = async (userId, courseId, lessonId, currentTime, duration) => {
    try {
        const progressRef = doc(db, 'progress', `${userId}_${courseId}_${lessonId}`);

        const progressData = {
            userId,
            courseId,
            lessonId,
            currentTime,
            duration,
            percentage: (currentTime / duration) * 100,
            lastUpdated: new Date(),
            completed: currentTime >= duration * 0.95 // נחשב כהושלם אם צפה ב-95%
        };

        await setDoc(progressRef, progressData, { merge: true });

        // עדכון התקדמות כללית בקורס
        await updateCourseProgress(userId, courseId);

        return { success: true };
    } catch (error) {
        console.error('Error saving video progress:', error);
        return { success: false, error };
    }
};

// קבלת התקדמות וידאו
export const getVideoProgress = async (userId, courseId, lessonId) => {
    try {
        const progressRef = doc(db, 'progress', `${userId}_${courseId}_${lessonId}`);
        const progressDoc = await getDoc(progressRef);

        if (progressDoc.exists()) {
            return progressDoc.data();
        }

        return { currentTime: 0, percentage: 0, completed: false };
    } catch (error) {
        console.error('Error getting video progress:', error);
        return { currentTime: 0, percentage: 0, completed: false };
    }
};

// עדכון התקדמות כללית בקורס
export const updateCourseProgress = async (userId, courseId) => {
    try {
        // שליפת כל השיעורים בקורס
        const curriculumRef = collection(db, 'curriculum');
        const q = query(curriculumRef, where('courseId', '==', courseId));
        const curriculumSnapshot = await getDocs(q);

        const totalLessons = curriculumSnapshot.size;

        if (totalLessons === 0) {
            return { success: false, message: 'No lessons found' };
        }

        // שליפת התקדמות בכל השיעורים
        const progressQuery = query(
            collection(db, 'progress'),
            where('userId', '==', userId),
            where('courseId', '==', courseId)
        );
        const progressSnapshot = await getDocs(progressQuery);

        let completedLessons = 0;
        let totalPercentage = 0;

        progressSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.completed) {
                completedLessons++;
            }
            totalPercentage += data.percentage || 0;
        });

        const averageProgress = totalPercentage / totalLessons;
        const completionRate = (completedLessons / totalLessons) * 100;

        // שמירת התקדמות כללית
        const courseProgressRef = doc(db, 'courseProgress', `${userId}_${courseId}`);
        await setDoc(courseProgressRef, {
            userId,
            courseId,
            totalLessons,
            completedLessons,
            averageProgress,
            completionRate,
            lastUpdated: new Date()
        }, { merge: true });

        return {
            success: true,
            completedLessons,
            totalLessons,
            completionRate,
            averageProgress
        };
    } catch (error) {
        console.error('Error updating course progress:', error);
        return { success: false, error };
    }
};

// קבלת התקדמות כללית בקורס
export const getCourseProgress = async (userId, courseId) => {
    try {
        const courseProgressRef = doc(db, 'courseProgress', `${userId}_${courseId}`);
        const progressDoc = await getDoc(courseProgressRef);

        if (progressDoc.exists()) {
            return progressDoc.data();
        }

        return {
            totalLessons: 0,
            completedLessons: 0,
            averageProgress: 0,
            completionRate: 0
        };
    } catch (error) {
        console.error('Error getting course progress:', error);
        return {
            totalLessons: 0,
            completedLessons: 0,
            averageProgress: 0,
            completionRate: 0
        };
    }
};

// קבלת כל ההתקדמות של משתמש
export const getUserProgress = async (userId) => {
    try {
        const progressQuery = query(
            collection(db, 'courseProgress'),
            where('userId', '==', userId)
        );
        const snapshot = await getDocs(progressQuery);

        const progress = [];
        snapshot.forEach(doc => {
            progress.push({ id: doc.id, ...doc.data() });
        });

        return progress;
    } catch (error) {
        console.error('Error getting user progress:', error);
        return [];
    }
};