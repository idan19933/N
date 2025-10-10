import { db } from '../config/firebase';
import { collection, query, getDocs, orderBy, limit, startAfter, doc, getDoc } from 'firebase/firestore';

// Fetch courses with pagination
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