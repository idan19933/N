import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

export const saveVideoProgress = async (userId, courseId, lessonId, currentTime, duration, lessonDurationMinutes, completed = false) => {
    try {
        const progressRef = doc(db, 'progress', `${userId}_${courseId}_${lessonId}`);

        const percentage = (currentTime / duration) * 100;
        const isCompleted = completed || percentage >= 90;

        // ✅ חישוב דקות שנצפו בפועל
        const watchedMinutes = isCompleted
            ? lessonDurationMinutes
            : (currentTime / duration) * lessonDurationMinutes;

        await setDoc(progressRef, {
            userId,
            courseId,
            lessonId,
            currentTime,
            duration,
            percentage,
            completed: isCompleted,
            watchedMinutes: watchedMinutes, // ✅ דקות בפועל
            lessonDurationMinutes, // ✅ אורך השיעור הכולל
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

        return {
            currentTime: 0,
            percentage: 0,
            completed: false,
            watchedMinutes: 0
        };
    } catch (error) {
        console.error('Error getting progress:', error);
        return {
            currentTime: 0,
            percentage: 0,
            completed: false,
            watchedMinutes: 0
        };
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
        let totalWatchedMinutes = 0;
        let totalDurationMinutes = 0;

        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.completed) {
                completedLessons++;
            }
            // ✅ צבירת דקות שנצפו ודקות כוללות
            totalWatchedMinutes += data.watchedMinutes || 0;
            totalDurationMinutes += data.lessonDurationMinutes || 0;
        });

        // ✅ אחוז התקדמות לפי דקות בפועל
        const completionRate = totalDurationMinutes > 0
            ? (totalWatchedMinutes / totalDurationMinutes) * 100
            : 0;

        return {
            completedLessons,
            totalLessons,
            completionRate,
            totalWatchedMinutes,
            totalDurationMinutes
        };
    } catch (error) {
        console.error('Error getting course progress:', error);
        return {
            completedLessons: 0,
            totalLessons: 0,
            completionRate: 0,
            totalWatchedMinutes: 0,
            totalDurationMinutes: 0
        };
    }
};

// For UserDashboard - progress across all courses
export const getUserProgress = async (userId) => {
    try {
        const progressQuery = query(
            collection(db, 'progress'),
            where('userId', '==', userId)
        );

        const snapshot = await getDocs(progressQuery);

        const progressByCourse = {};

        snapshot.forEach(doc => {
            const data = doc.data();
            const courseId = data.courseId;

            if (!progressByCourse[courseId]) {
                progressByCourse[courseId] = {
                    totalLessons: 0,
                    completedLessons: 0,
                    totalWatchedMinutes: 0,
                    totalDurationMinutes: 0,
                    lastUpdated: data.lastUpdated
                };
            }

            progressByCourse[courseId].totalLessons++;
            if (data.completed) {
                progressByCourse[courseId].completedLessons++;
            }

            // ✅ צבירת דקות
            progressByCourse[courseId].totalWatchedMinutes += data.watchedMinutes || 0;
            progressByCourse[courseId].totalDurationMinutes += data.lessonDurationMinutes || 0;

            // Keep the most recent update time
            if (data.lastUpdated > progressByCourse[courseId].lastUpdated) {
                progressByCourse[courseId].lastUpdated = data.lastUpdated;
            }
        });

        // ✅ חישוב אחוז התקדמות לפי דקות
        Object.keys(progressByCourse).forEach(courseId => {
            const progress = progressByCourse[courseId];
            progress.completionRate = progress.totalDurationMinutes > 0
                ? (progress.totalWatchedMinutes / progress.totalDurationMinutes) * 100
                : 0;
        });

        return progressByCourse;
    } catch (error) {
        console.error('Error getting user progress:', error);
        return {};
    }
};