import { db, storage } from '../config/firebase';
import {
    collection,
    query,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    orderBy,
    limit,
    startAfter,
    where,
    serverTimestamp
} from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';

// Fetch courses with pagination (for public/student view)
export const fetchCourses = async (lastVisible = null, pageSize = 6) => {
    try {
        let q;

        if (lastVisible) {
            q = query(
                collection(db, 'courses'),
                orderBy('createdAt', 'desc'),
                startAfter(lastVisible),
                limit(pageSize)
            );
        } else {
            q = query(
                collection(db, 'courses'),
                orderBy('createdAt', 'desc'),
                limit(pageSize)
            );
        }

        const querySnapshot = await getDocs(q);
        const courses = [];

        querySnapshot.forEach((doc) => {
            courses.push({
                id: doc.id,
                ...doc.data()
            });
        });

        const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];

        return {
            courses,
            lastVisible: lastDoc,
            hasMore: querySnapshot.docs.length === pageSize
        };
    } catch (error) {
        console.error('Error fetching courses:', error);
        throw error;
    }
};

// Fetch single course
export const fetchCourse = async (courseId) => {
    try {
        const docRef = doc(db, 'courses', courseId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return {
                id: docSnap.id,
                ...docSnap.data()
            };
        } else {
            throw new Error('Course not found');
        }
    } catch (error) {
        console.error('Error fetching course:', error);
        throw error;
    }
};

// Get all courses (for admin - no pagination)
export const getAllCourses = async () => {
    try {
        const coursesRef = collection(db, 'courses');
        const q = query(coursesRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);

        const courses = [];
        snapshot.forEach((doc) => {
            courses.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return courses;
    } catch (error) {
        console.error('Error fetching all courses:', error);
        throw error;
    }
};

// Create a new course
export const createCourse = async (courseData) => {
    try {
        const coursesRef = collection(db, 'courses');
        const docRef = await addDoc(coursesRef, {
            ...courseData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            students: 0
        });

        return {
            id: docRef.id,
            ...courseData,
            students: 0
        };
    } catch (error) {
        console.error('Error creating course:', error);
        throw error;
    }
};

// Update a course
export const updateCourse = async (courseId, courseData) => {
    try {
        const courseRef = doc(db, 'courses', courseId);
        await updateDoc(courseRef, {
            ...courseData,
            updatedAt: serverTimestamp()
        });

        return { success: true };
    } catch (error) {
        console.error('Error updating course:', error);
        throw error;
    }
};

// Delete a course and all its related data
export const deleteCourse = async (courseId) => {
    try {
        const deletePromises = [];

        // 1. Delete all curriculum sections and lessons for this course
        const curriculumRef = collection(db, 'curriculum');
        const curriculumQuery = query(curriculumRef, where('courseId', '==', courseId));
        const curriculumSnapshot = await getDocs(curriculumQuery);

        curriculumSnapshot.forEach((curriculumDoc) => {
            deletePromises.push(deleteDoc(curriculumDoc.ref));
        });

        // 2. Optional: Delete purchases (commented out to keep financial records)
        // If you want to delete purchases too, uncomment this:
        /*
        const purchasesRef = collection(db, 'purchases');
        const purchasesQuery = query(purchasesRef, where('courseId', '==', courseId));
        const purchasesSnapshot = await getDocs(purchasesQuery);

        purchasesSnapshot.forEach((purchaseDoc) => {
            deletePromises.push(deleteDoc(purchaseDoc.ref));
        });
        */

        // 3. Delete the course document itself
        const courseRef = doc(db, 'courses', courseId);
        deletePromises.push(deleteDoc(courseRef));

        // Execute all deletions
        await Promise.all(deletePromises);

        console.log('Course deleted successfully:', courseId);
        return { success: true };
    } catch (error) {
        console.error('Error deleting course:', error);
        throw error;
    }
};

// Get course count (useful for admin dashboard)
export const getCourseCount = async () => {
    try {
        const coursesRef = collection(db, 'courses');
        const snapshot = await getDocs(coursesRef);
        return snapshot.size;
    } catch (error) {
        console.error('Error getting course count:', error);
        throw error;
    }
};

// Search courses by title
export const searchCourses = async (searchTerm) => {
    try {
        const coursesRef = collection(db, 'courses');
        const snapshot = await getDocs(coursesRef);

        const courses = [];
        snapshot.forEach((doc) => {
            const courseData = { id: doc.id, ...doc.data() };
            // Simple client-side search (for better search, use Algolia or similar)
            if (courseData.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                courseData.description.toLowerCase().includes(searchTerm.toLowerCase())) {
                courses.push(courseData);
            }
        });

        return courses;
    } catch (error) {
        console.error('Error searching courses:', error);
        throw error;
    }
};