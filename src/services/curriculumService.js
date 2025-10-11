import {
    collection,
    doc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy
} from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage } from '../config/firebase';

// Get all sections for a course
export const getSections = async (courseId) => {
    try {
        console.log('🔍 Getting sections for course:', courseId);
        const sectionsRef = collection(db, 'courses', courseId, 'sections');
        const q = query(sectionsRef, orderBy('order', 'asc'));
        const snapshot = await getDocs(q);

        const sections = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        console.log('✅ Found sections:', sections);
        return sections;
    } catch (error) {
        console.error('❌ Error getting sections:', error);
        return [];
    }
};

// Get all lessons for a section
export const getLessons = async (courseId, sectionId) => {
    try {
        console.log('🔍 Getting lessons for section:', { courseId, sectionId });
        const lessonsRef = collection(db, 'courses', courseId, 'sections', sectionId, 'lessons');
        const q = query(lessonsRef, orderBy('order', 'asc'));
        const snapshot = await getDocs(q);

        const lessons = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        console.log('✅ Found lessons:', lessons);
        return lessons;
    } catch (error) {
        console.error('❌ Error getting lessons:', error);
        return [];
    }
};

// Create a new section
export const createSection = async (courseId, sectionData) => {
    try {
        const sectionsRef = collection(db, 'courses', courseId, 'sections');
        const docRef = await addDoc(sectionsRef, {
            ...sectionData,
            createdAt: new Date()
        });
        console.log('✅ Section created:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('❌ Error creating section:', error);
        throw error;
    }
};

// Delete a section
export const deleteSection = async (courseId, sectionId) => {
    try {
        // Delete all lessons first
        const lessonsRef = collection(db, 'courses', courseId, 'sections', sectionId, 'lessons');
        const lessonsSnapshot = await getDocs(lessonsRef);

        console.log('🗑️ Deleting', lessonsSnapshot.size, 'lessons');

        for (const lessonDoc of lessonsSnapshot.docs) {
            const lessonData = lessonDoc.data();
            if (lessonData.videoPath) {
                try {
                    const videoRef = ref(storage, lessonData.videoPath);
                    await deleteObject(videoRef);
                } catch (error) {
                    console.error('Error deleting video:', error);
                }
            }
            await deleteDoc(lessonDoc.ref);
        }

        const sectionRef = doc(db, 'courses', courseId, 'sections', sectionId);
        await deleteDoc(sectionRef);
        console.log('✅ Section deleted');
    } catch (error) {
        console.error('❌ Error deleting section:', error);
        throw error;
    }
};

// Reorder sections
export const reorderSections = async (courseId, sections) => {
    try {
        const promises = sections.map((section, index) => {
            const sectionRef = doc(db, 'courses', courseId, 'sections', section.id);
            return updateDoc(sectionRef, { order: index });
        });
        await Promise.all(promises);
        console.log('✅ Sections reordered');
    } catch (error) {
        console.error('❌ Error reordering sections:', error);
        throw error;
    }
};

// Create a new lesson
export const createLesson = async (courseId, sectionId, lessonData) => {
    try {
        console.log('📝 Creating lesson:', { courseId, sectionId, lessonData });
        const lessonsRef = collection(db, 'courses', courseId, 'sections', sectionId, 'lessons');
        const docRef = await addDoc(lessonsRef, {
            ...lessonData,
            createdAt: new Date()
        });
        console.log('✅ Lesson created:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('❌ Error creating lesson:', error);
        throw error;
    }
};

// Delete a lesson
export const deleteLesson = async (courseId, sectionId, lessonId, videoPath) => {
    try {
        console.log('🗑️ Deleting lesson:', { courseId, sectionId, lessonId, videoPath });

        if (videoPath) {
            try {
                const videoRef = ref(storage, videoPath);
                await deleteObject(videoRef);
                console.log('✅ Video deleted from storage');
            } catch (error) {
                console.error('Error deleting video:', error);
            }
        }

        const lessonRef = doc(db, 'courses', courseId, 'sections', sectionId, 'lessons', lessonId);
        await deleteDoc(lessonRef);
        console.log('✅ Lesson deleted');
    } catch (error) {
        console.error('❌ Error deleting lesson:', error);
        throw error;
    }
};

// Reorder lessons
export const reorderLessons = async (courseId, sectionId, lessons) => {
    try {
        const promises = lessons.map((lesson, index) => {
            const lessonRef = doc(db, 'courses', courseId, 'sections', sectionId, 'lessons', lesson.id);
            return updateDoc(lessonRef, { order: index });
        });
        await Promise.all(promises);
        console.log('✅ Lessons reordered');
    } catch (error) {
        console.error('❌ Error reordering lessons:', error);
        throw error;
    }
};