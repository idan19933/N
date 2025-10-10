import { db } from '../config/firebase';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';

// Create a purchase record
export const createPurchase = async (userId, courseId, amount) => {
    try {
        const purchaseRef = await addDoc(collection(db, 'purchases'), {
            userId,
            courseId,
            amount,
            status: 'completed',
            purchasedAt: serverTimestamp()
        });
        return purchaseRef.id;
    } catch (error) {
        console.error('Error creating purchase:', error);
        throw error;
    }
};

// Check if user owns a course
export const checkCourseOwnership = async (userId, courseId) => {
    try {
        const purchasesRef = collection(db, 'purchases');
        const q = query(
            purchasesRef,
            where('userId', '==', userId),
            where('courseId', '==', courseId),
            where('status', '==', 'completed')
        );

        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty;
    } catch (error) {
        console.error('Error checking ownership:', error);
        return false;
    }
};

// Get all user's purchased courses
export const getUserPurchases = async (userId) => {
    try {
        const purchasesRef = collection(db, 'purchases');
        const q = query(
            purchasesRef,
            where('userId', '==', userId),
            where('status', '==', 'completed')
        );

        const querySnapshot = await getDocs(q);
        const purchases = [];

        querySnapshot.forEach((doc) => {
            purchases.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return purchases;
    } catch (error) {
        console.error('Error fetching purchases:', error);
        throw error;
    }
};

// Simulate payment (replace with real Stripe integration)
export const processPayment = async (courseId, amount) => {
    // In production, this would call Stripe API
    // For now, we'll simulate a successful payment
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                transactionId: `sim_${Date.now()}`
            });
        }, 1500);
    });
};