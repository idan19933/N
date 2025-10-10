import { db, storage } from '../config/firebase';
import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    getDocs,
    getDoc,
    query,
    orderBy,
    serverTimestamp,
    writeBatch
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';

// ============================================
// SECTION OPERATIONS
// ============================================

// Create a new section in a course
export const createSection = async (courseId, sectionData) => {
    try {
        const sectionsRef = collection(db, 'courses', courseId, 'sections');
        const docRef = await addDoc(sectionsRef, {
            title: sectionData.title,
            description: sectionData.description || '',
            order: sectionData.order || 0,
            createdAt: serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
        console.error('Error creating section:', error);
        throw error;
    }
};

// Get all sections for a course
export const getSections = async (courseId) => {
    try {
        const sectionsRef = collection(db, 'courses', courseId, 'sections');
        const q = query(sectionsRef, orderBy('order', 'asc'));
        const querySnapshot = await getDocs(q);

        const sections = [];
        querySnapshot.forEach((doc) => {
            sections.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return sections;
    } catch (error) {
        console.error('Error fetching sections:', error);
        throw error;
    }
};

// Update section
export const updateSection = async (courseId, sectionId, sectionData) => {
    try {
        const sectionRef = doc(db, 'courses', courseId, 'sections', sectionId);
        await updateDoc(sectionRef, {
            ...sectionData,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error updating section:', error);
        throw error;
    }
};

// Delete section and all its lessons
export const deleteSection = async (courseId, sectionId) => {
    try {
        // First, delete all lessons in this section
        const lessonsRef = collection(db, 'courses', courseId, 'sections', sectionId, 'lessons');
        const lessonsSnapshot = await getDocs(lessonsRef);

        for (const lessonDoc of lessonsSnapshot.docs) {
            const lessonData = lessonDoc.data();
            // Delete video from storage if exists
            if (lessonData.videoPath) {
                const videoRef = ref(storage, lessonData.videoPath);
                await deleteObject(videoRef).catch(err => console.log('Video already deleted'));
            }
            await deleteDoc(lessonDoc.ref);
        }

        // Delete the section
        const sectionRef = doc(db, 'courses', courseId, 'sections', sectionId);
        await deleteDoc(sectionRef);
    } catch (error) {
        console.error('Error deleting section:', error);
        throw error;
    }
};

// Reorder sections
export const reorderSections = async (courseId, sections) => {
    try {
        const batch = writeBatch(db);

        sections.forEach((section, index) => {
            const sectionRef = doc(db, 'courses', courseId, 'sections', section.id);
            batch.update(sectionRef, { order: index });
        });

        await batch.commit();
    } catch (error) {
        console.error('Error reordering sections:', error);
        throw error;
    }
};

// ============================================
// LESSON OPERATIONS
// ============================================

// Upload lesson video
export const uploadLessonVideo = (file, courseId, sectionId, onProgress) => {
    return new Promise((resolve, reject) => {
        const storageRef = ref(storage, `courses/${courseId}/sections/${sectionId}/videos/${Date.now()}_${file.name}`);
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

// Upload lesson resource (PDF, ZIP, etc.)
export const uploadLessonResource = (file, courseId, sectionId, onProgress) => {
    return new Promise((resolve, reject) => {
        const storageRef = ref(storage, `courses/${courseId}/sections/${sectionId}/resources/${Date.now()}_${file.name}`);
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
                resolve({
                    name: file.name,
                    url: downloadURL,
                    path: uploadTask.snapshot.ref.fullPath
                });
            }
        );
    });
};

// Create a new lesson in a section
export const createLesson = async (courseId, sectionId, lessonData) => {
    try {
        const lessonsRef = collection(db, 'courses', courseId, 'sections', sectionId, 'lessons');
        const docRef = await addDoc(lessonsRef, {
            title: lessonData.title,
            description: lessonData.description || '',
            videoUrl: lessonData.videoUrl,
            videoPath: lessonData.videoPath,
            duration: lessonData.duration || '0:00',
            order: lessonData.order || 0,
            resources: lessonData.resources || [],
            isFree: lessonData.isFree || false,
            createdAt: serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
        console.error('Error creating lesson:', error);
        throw error;
    }
};

// Get all lessons in a section
export const getLessons = async (courseId, sectionId) => {
    try {
        const lessonsRef = collection(db, 'courses', courseId, 'sections', sectionId, 'lessons');
        const q = query(lessonsRef, orderBy('order', 'asc'));
        const querySnapshot = await getDocs(q);

        const lessons = [];
        querySnapshot.forEach((doc) => {
            lessons.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return lessons;
    } catch (error) {
        console.error('Error fetching lessons:', error);
        throw error;
    }
};

// Get single lesson
export const getLesson = async (courseId, sectionId, lessonId) => {
    try {
        const lessonRef = doc(db, 'courses', courseId, 'sections', sectionId, 'lessons', lessonId);
        const lessonSnap = await getDoc(lessonRef);

        if (lessonSnap.exists()) {
            return {
                id: lessonSnap.id,
                ...lessonSnap.data()
            };
        } else {
            throw new Error('Lesson not found');
        }
    } catch (error) {
        console.error('Error fetching lesson:', error);
        throw error;
    }
};

// Update lesson
export const updateLesson = async (courseId, sectionId, lessonId, lessonData) => {
    try {
        const lessonRef = doc(db, 'courses', courseId, 'sections', sectionId, 'lessons', lessonId);
        await updateDoc(lessonRef, {
            ...lessonData,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Error updating lesson:', error);
        throw error;
    }
};

// Delete lesson
export const deleteLesson = async (courseId, sectionId, lessonId, videoPath) => {
    try {
        // Delete video from storage
        if (videoPath) {
            const videoRef = ref(storage, videoPath);
            await deleteObject(videoRef).catch(err => console.log('Video already deleted'));
        }

        // Delete lesson document
        const lessonRef = doc(db, 'courses', courseId, 'sections', sectionId, 'lessons', lessonId);
        await deleteDoc(lessonRef);
    } catch (error) {
        console.error('Error deleting lesson:', error);
        throw error;
    }
};

// Reorder lessons within a section
export const reorderLessons = async (courseId, sectionId, lessons) => {
    try {
        const batch = writeBatch(db);

        lessons.forEach((lesson, index) => {
            const lessonRef = doc(db, 'courses', courseId, 'sections', sectionId, 'lessons', lesson.id);
            batch.update(lessonRef, { order: index });
        });

        await batch.commit();
    } catch (error) {
        console.error('Error reordering lessons:', error);
        throw error;
    }
};

// ============================================
// COURSE CURRICULUM OVERVIEW
// ============================================

// Get complete curriculum for a course (sections with lessons)
export const getCourseCurriculum = async (courseId) => {
    try {
        const sections = await getSections(courseId);

        const curriculum = await Promise.all(
            sections.map(async (section) => {
                const lessons = await getLessons(courseId, section.id);
                return {
                    ...section,
                    lessons
                };
            })
        );

        return curriculum;
    } catch (error) {
        console.error('Error fetching curriculum:', error);
        throw error;
    }
};