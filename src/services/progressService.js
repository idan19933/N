// src/services/progressService.js
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getSections, getLessons } from './curriculumService';

/**
 * Parse duration string (e.g., "5:30") into minutes
 */
const parseDuration = (durationStr) => {
    if (!durationStr) return 0;
    if (typeof durationStr === 'number') return durationStr;

    const parts = String(durationStr).split(':');
    if (parts.length === 2) {
        const mins = parseInt(parts[0]) || 0;
        const secs = parseInt(parts[1]) || 0;
        return mins + (secs / 60);
    }

    const parsed = parseFloat(durationStr);
    return isNaN(parsed) ? 0 : parsed;
};

/**
 * Save video progress for a specific lesson
 */
export const saveVideoProgress = async (userId, courseId, lessonId, currentTime, duration, lessonDurationMinutes, completed = false) => {
    try {
        if (!userId || !courseId || !lessonId) {
            console.error('❌ Missing required parameters');
            return { success: false, error: 'Missing parameters' };
        }

        if (!duration || duration <= 0) {
            console.error('❌ Invalid video duration:', duration);
            return { success: false, error: 'Invalid duration' };
        }

        const progressRef = doc(db, 'progress', `${userId}_${courseId}_${lessonId}`);

        const percentage = Math.min((currentTime / duration) * 100, 100);
        const isCompleted = completed || percentage >= 90;

        // Calculate watched minutes correctly
        const watchedMinutes = isCompleted
            ? lessonDurationMinutes
            : (currentTime / 60);

        await setDoc(progressRef, {
            userId,
            courseId,
            lessonId,
            currentTime: Math.floor(currentTime),
            duration: Math.floor(duration),
            percentage: parseFloat(percentage.toFixed(2)),
            completed: isCompleted,
            watchedMinutes: parseFloat(watchedMinutes.toFixed(2)),
            lessonDurationMinutes: parseFloat(lessonDurationMinutes.toFixed(2)),
            lastUpdated: new Date()
        }, { merge: true });

        console.log('✅ Progress saved:', {
            lessonId,
            percentage: percentage.toFixed(2),
            completed: isCompleted,
            watchedMinutes: watchedMinutes.toFixed(2),
            totalDuration: lessonDurationMinutes.toFixed(2)
        });

        return { success: true };
    } catch (error) {
        console.error('❌ Error saving progress:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get progress for a specific video/lesson
 */
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
            watchedMinutes: 0,
            lessonDurationMinutes: 0
        };
    } catch (error) {
        console.error('Error getting progress:', error);
        return {
            currentTime: 0,
            percentage: 0,
            completed: false,
            watchedMinutes: 0,
            lessonDurationMinutes: 0
        };
    }
};

/**
 * Get total course metadata using curriculumService with smart estimation
 */
const getCourseTotals = async (userId, courseId) => {
    let totalLessons = 0;
    let totalDurationMinutes = 0;

    try {
        const sections = await getSections(courseId);
        console.log(`📚 Found ${sections.length} sections for course ${courseId}`);

        // Get all progress records to use actual video durations
        const progressQuery = query(
            collection(db, 'progress'),
            where('userId', '==', userId),
            where('courseId', '==', courseId)
        );
        const progressSnapshot = await getDocs(progressQuery);

        // Map lesson IDs to their actual durations from progress records
        const actualDurations = {};
        const actualDurationValues = [];

        progressSnapshot.forEach(doc => {
            const data = doc.data();
            if (data.lessonDurationMinutes && data.lessonDurationMinutes > 0) {
                actualDurations[data.lessonId] = data.lessonDurationMinutes;
                actualDurationValues.push(data.lessonDurationMinutes);
            }
        });

        // Calculate average actual duration for smart estimation
        const averageActualDuration = actualDurationValues.length > 0
            ? actualDurationValues.reduce((sum, val) => sum + val, 0) / actualDurationValues.length
            : 0;

        console.log(`📊 Smart estimation: ${actualDurationValues.length} lessons with actual durations, avg = ${averageActualDuration.toFixed(2)} mins`);

        for (const section of sections) {
            const lessons = await getLessons(courseId, section.id);
            console.log(`  Section "${section.title}": ${lessons.length} lessons`);

            totalLessons += lessons.length;

            lessons.forEach(lesson => {
                let durationMinutes;

                if (actualDurations[lesson.id]) {
                    // Use actual duration from progress (highest priority)
                    durationMinutes = actualDurations[lesson.id];
                    console.log(`    ✅ Lesson "${lesson.title}": ${durationMinutes.toFixed(2)} mins (from progress)`);
                } else if (lesson.actualDurationMinutes && lesson.actualDurationMinutes > 0) {
                    // Use actualDurationMinutes from lesson document (set when uploading)
                    durationMinutes = lesson.actualDurationMinutes;
                    console.log(`    ✅ Lesson "${lesson.title}": ${durationMinutes.toFixed(2)} mins (from lesson doc)`);
                } else if (averageActualDuration > 0) {
                    // Use average of actual durations instead of wrong field
                    durationMinutes = averageActualDuration;
                    console.log(`    📊 Lesson "${lesson.title}": ${durationMinutes.toFixed(2)} mins (estimated from avg)`);
                } else {
                    // Fallback to field duration only if no actual data exists
                    durationMinutes = parseDuration(lesson.duration);
                    console.log(`    ⚠️ Lesson "${lesson.title}": ${durationMinutes.toFixed(2)} mins (field - may be inaccurate)`);
                }

                totalDurationMinutes += durationMinutes;
            });
        }

        console.log(`✅ Course ${courseId}: ${totalLessons} lessons, ${totalDurationMinutes.toFixed(2)} minutes total`);
    } catch (error) {
        console.error(`❌ Error getting course totals for ${courseId}:`, error);
    }

    return { totalLessons, totalDurationMinutes };
};

/**
 * Get progress for a specific course
 */
export const getCourseProgress = async (userId, courseId) => {
    try {
        console.log(`📊 Getting progress for user ${userId}, course ${courseId}`);

        // Get user's progress records for this course
        const progressQuery = query(
            collection(db, 'progress'),
            where('userId', '==', userId),
            where('courseId', '==', courseId)
        );

        const snapshot = await getDocs(progressQuery);
        console.log(`📄 Found ${snapshot.size} progress records`);

        // Get total lessons and duration
        const { totalLessons, totalDurationMinutes } = await getCourseTotals(userId, courseId);

        // Calculate watched progress
        let completedLessons = 0;
        let totalWatchedMinutes = 0;

        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.completed) {
                completedLessons++;
            }
            totalWatchedMinutes += (data.watchedMinutes || 0);
        });

        console.log(`📊 Progress summary:`, {
            completedLessons,
            totalLessons,
            totalWatchedMinutes: totalWatchedMinutes.toFixed(2),
            totalDurationMinutes: totalDurationMinutes.toFixed(2)
        });

        // Prevent progress from exceeding 100%
        const completionRate = totalDurationMinutes > 0
            ? Math.min((totalWatchedMinutes / totalDurationMinutes) * 100, 100)
            : 0;

        const result = {
            completedLessons,
            totalLessons,
            completionRate: parseFloat(completionRate.toFixed(1)),
            totalWatchedMinutes: parseFloat(totalWatchedMinutes.toFixed(1)),
            totalDurationMinutes: parseFloat(totalDurationMinutes.toFixed(1))
        };

        console.log(`✅ Final result:`, result);
        return result;

    } catch (error) {
        console.error('❌ Error getting course progress:', error);
        return {
            completedLessons: 0,
            totalLessons: 0,
            completionRate: 0,
            totalWatchedMinutes: 0,
            totalDurationMinutes: 0
        };
    }
};

/**
 * Get progress for a specific section
 */
export const getSectionProgress = async (userId, courseId, sectionId) => {
    try {
        console.log(`📊 Getting section progress:`, { userId, courseId, sectionId });

        // Get lessons in this section
        const lessons = await getLessons(courseId, sectionId);

        let totalLessons = lessons.length;
        let completedLessons = 0;
        let totalDurationMinutes = 0;
        let totalWatchedMinutes = 0;

        // Get progress for each lesson in this section
        for (const lesson of lessons) {
            const progress = await getVideoProgress(userId, courseId, lesson.id);

            // Priority order for duration
            let lessonDuration;
            if (progress.lessonDurationMinutes && progress.lessonDurationMinutes > 0) {
                // Use from progress (actual played duration)
                lessonDuration = progress.lessonDurationMinutes;
            } else if (lesson.actualDurationMinutes && lesson.actualDurationMinutes > 0) {
                // Use from lesson document (set when uploading)
                lessonDuration = lesson.actualDurationMinutes;
            } else {
                // Fallback to parsing duration field
                lessonDuration = parseDuration(lesson.duration);
            }

            totalDurationMinutes += lessonDuration;

            if (progress.completed) {
                completedLessons++;
            }

            totalWatchedMinutes += (progress.watchedMinutes || 0);
        }

        // Cap at 100%
        const completionRate = totalDurationMinutes > 0
            ? Math.min((totalWatchedMinutes / totalDurationMinutes) * 100, 100)
            : 0;

        return {
            sectionId,
            totalLessons,
            completedLessons,
            totalDurationMinutes: parseFloat(totalDurationMinutes.toFixed(1)),
            totalWatchedMinutes: parseFloat(totalWatchedMinutes.toFixed(1)),
            completionRate: parseFloat(completionRate.toFixed(1))
        };

    } catch (error) {
        console.error('❌ Error getting section progress:', error);
        return {
            sectionId,
            totalLessons: 0,
            completedLessons: 0,
            totalDurationMinutes: 0,
            totalWatchedMinutes: 0,
            completionRate: 0
        };
    }
};

/**
 * Get progress for all sections in a course
 */
export const getAllSectionsProgress = async (userId, courseId) => {
    try {
        const sections = await getSections(courseId);

        const sectionProgressPromises = sections.map(section =>
            getSectionProgress(userId, courseId, section.id)
        );

        const sectionProgressArray = await Promise.all(sectionProgressPromises);

        // Convert to object with sectionId as key
        const progressBySectionId = {};
        sectionProgressArray.forEach(progress => {
            progressBySectionId[progress.sectionId] = progress;
        });

        return progressBySectionId;

    } catch (error) {
        console.error('Error getting all sections progress:', error);
        return {};
    }
};

/**
 * Get progress across ALL courses for a user
 */
export const getUserProgress = async (userId) => {
    try {
        console.log(`📊 Getting all progress for user ${userId}`);

        const progressQuery = query(
            collection(db, 'progress'),
            where('userId', '==', userId)
        );

        const snapshot = await getDocs(progressQuery);
        console.log(`📄 Found ${snapshot.size} total progress records`);

        const courseIds = new Set();
        snapshot.forEach(doc => {
            courseIds.add(doc.data().courseId);
        });

        console.log(`📚 User has progress in ${courseIds.size} courses`);

        const progressByCourse = {};

        for (const courseId of courseIds) {
            const { totalLessons, totalDurationMinutes } = await getCourseTotals(userId, courseId);

            progressByCourse[courseId] = {
                totalLessons,
                completedLessons: 0,
                totalWatchedMinutes: 0,
                totalDurationMinutes,
                lastUpdated: null
            };
        }

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

            if (data.completed) {
                progressByCourse[courseId].completedLessons++;
            }

            progressByCourse[courseId].totalWatchedMinutes += (data.watchedMinutes || 0);

            const currentLastUpdated = progressByCourse[courseId].lastUpdated;
            if (!currentLastUpdated || (data.lastUpdated && data.lastUpdated > currentLastUpdated)) {
                progressByCourse[courseId].lastUpdated = data.lastUpdated;
            }
        });

        Object.keys(progressByCourse).forEach(courseId => {
            const progress = progressByCourse[courseId];

            // Cap at 100%
            progress.completionRate = progress.totalDurationMinutes > 0
                ? Math.min((progress.totalWatchedMinutes / progress.totalDurationMinutes) * 100, 100)
                : 0;

            progress.completionRate = parseFloat(progress.completionRate.toFixed(1));
            progress.totalWatchedMinutes = parseFloat(progress.totalWatchedMinutes.toFixed(1));

            console.log(`  Course ${courseId}: ${progress.completionRate}% (${progress.totalWatchedMinutes}/${progress.totalDurationMinutes} mins)`);
        });

        return progressByCourse;

    } catch (error) {
        console.error('❌ Error getting user progress:', error);
        return {};
    }
};

/**
 * Get progress summary for all courses
 */
export const getProgressSummary = async (userId) => {
    try {
        const progressQuery = query(
            collection(db, 'progress'),
            where('userId', '==', userId)
        );

        const snapshot = await getDocs(progressQuery);

        let totalCompleted = 0;
        let totalWatchedMinutes = 0;
        const courses = new Set();

        snapshot.forEach(doc => {
            const data = doc.data();
            courses.add(data.courseId);

            if (data.completed) {
                totalCompleted++;
            }

            totalWatchedMinutes += (data.watchedMinutes || 0);
        });

        return {
            totalCourses: courses.size,
            totalCompletedLessons: totalCompleted,
            totalWatchedMinutes: parseFloat(totalWatchedMinutes.toFixed(1)),
            totalProgressRecords: snapshot.size
        };

    } catch (error) {
        console.error('Error getting progress summary:', error);
        return {
            totalCourses: 0,
            totalCompletedLessons: 0,
            totalWatchedMinutes: 0,
            totalProgressRecords: 0
        };
    }
};

/**
 * Delete all progress for a user
 */
export const deleteUserProgress = async (userId) => {
    try {
        const progressQuery = query(
            collection(db, 'progress'),
            where('userId', '==', userId)
        );

        const snapshot = await getDocs(progressQuery);
        const deletePromises = snapshot.docs.map(doc => doc.ref.delete());
        await Promise.all(deletePromises);

        return { success: true, deletedCount: snapshot.size };
    } catch (error) {
        console.error('Error deleting user progress:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Get progress percentage for quick display
 */
export const getQuickProgress = async (userId, courseId) => {
    try {
        const progress = await getCourseProgress(userId, courseId);
        return progress.completionRate || 0;
    } catch (error) {
        console.error('Error getting quick progress:', error);
        return 0;
    }
};