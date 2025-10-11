import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

export const saveVideoProgress = async (userId, courseId, lessonId, currentTime, duration, completed = false) => {
    try {
        const progressRef = doc(db, 'progress', `${userId}_${courseId}_${lessonId}`);

        const percentage = (currentTime / duration) * 100;
        const isCompleted = completed || percentage >= 90;

        await setDoc(progressRef, {
            userId,
            courseId,
            lessonId,
            currentTime,
            duration,
            percentage,
            completed: isCompleted,
            lastUpdated: new Date()
        }, { merge: true });

        return { success: true };
    } catch (error) {
        console.error('Error saving progress:', error);
        return { success: false, error: error.message };
    }
};

export const getVideoProgress = async (userId, courseId, lessonId) => {
    try {
        const progressRef = doc(db, 'progress', `${userId}_${courseId}_${lessonId}`);
        const progressDoc = await getDoc(progressRef);

        if (progressDoc.exists()) {
            return progressDoc.data();
        }

        return { currentTime: 0, percentage: 0, completed: false };
    } catch (error) {
        console.error('Error getting progress:', error);
        return { currentTime: 0, percentage: 0, completed: false };
    }
};

export const getCourseProgress = async (userId, courseId) => {
    try {
        const progressQuery = query(
            collection(db, 'progress'),
            where('userId', '==', userId),
            where('courseId', '==', courseId)
        );

        const snapshot = await getDocs(progressQuery);

        let completedLessons = 0;
        let totalLessons = snapshot.size;

        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.completed) {
                completedLessons++;
            }
        });

        const completionRate = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

        return {
            completedLessons,
            totalLessons,
            completionRate
        };
    } catch (error) {
        console.error('Error getting course progress:', error);
        return {
            completedLessons: 0,
            totalLessons: 0,
            completionRate: 0
        };
    }
};

// New function for UserDashboard
export const getUserProgress = async (userId) => {
    try {
        const progressQuery = query(
            collection(db, 'progress'),
            where('userId', '==', userId)
        );

        const snapshot = await getDocs(progressQuery);

        const progressByeCourse = {};

        snapshot.forEach(doc => {
            const data = doc.data();
            const courseId = data.courseId;

            if (!progressByeCourse[courseId]) {
                progressByeCourse[courseId] = {
                    totalLessons: 0,
                    completedLessons: 0,
                    lastUpdated: data.lastUpdated
                };
            }

            progressByeCourse[courseId].totalLessons++;
            if (data.completed) {
                progressByeCourse[courseId].completedLessons++;
            }

            // Keep the most recent update time
            if (data.lastUpdated > progressByeCourse[courseId].lastUpdated) {
                progressByeCourse[courseId].lastUpdated = data.lastUpdated;
            }
        });

        // Calculate completion rate for each course
        Object.keys(progressByeCourse).forEach(courseId => {
            const progress = progressByeCourse[courseId];
            progress.completionRate = progress.totalLessons > 0
                ? (progress.completedLessons / progress.totalLessons) * 100
                : 0;
        });

        return progressByeCourse;
    } catch (error) {
        console.error('Error getting user progress:', error);
        return {};
    }
};