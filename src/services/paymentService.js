import { db, functions } from '../config/firebase';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { getAuth } from 'firebase/auth';

// Create a purchase record (used by webhook)
export const createPurchase = async (userId, courseId, amount, paymentIntentId) => {
    try {
        const purchaseRef = await addDoc(collection(db, 'purchases'), {
            userId,
            courseId,
            amount,
            status: 'completed',
            paymentIntentId,
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

// Create Stripe Checkout Session (Real Payment)
export const createCheckoutSession = async (courseId, courseName, amount, userId) => {
    try {
        // Check if user is authenticated
        const auth = getAuth();
        const currentUser = auth.currentUser;

        console.log('Current User:', currentUser);
        console.log('User ID:', userId);

        if (!currentUser) {
            throw new Error('User must be logged in to make a purchase');
        }

        // Get the current ID token
        const idToken = await currentUser.getIdToken();
        console.log('ID Token obtained:', idToken ? 'Yes' : 'No');

        const createCheckout = httpsCallable(functions, 'createCheckoutSession');

        console.log('Calling createCheckoutSession with:', {
            courseId,
            courseName,
            amount: Math.round(amount * 100),
            userId,
            origin: window.location.origin
        });

        const result = await createCheckout({
            courseId,
            courseName,
            amount: Math.round(amount * 100), // Convert to cents
            userId,
            origin: window.location.origin
        });

        console.log('Function result:', result);

        const { sessionId, url } = result.data;

        // NEW: Redirect directly to the checkout URL
        if (url) {
            window.location.href = url;
        } else {
            throw new Error('No checkout URL returned from server');
        }
    } catch (error) {
        console.error('Error creating checkout session:', error);
        console.error('Error details:', {
            code: error.code,
            message: error.message,
            details: error.details
        });
        throw error;
    }
};

// Verify payment and complete purchase
export const verifyPaymentAndCompletePurchase = async (sessionId) => {
    try {
        const verifyPayment = httpsCallable(functions, 'verifyPayment');
        const result = await verifyPayment({ sessionId });
        return result.data;
    } catch (error) {
        console.error('Error verifying payment:', error);
        throw error;
    }
};

// DEPRECATED: Old fake payment function
export const processPayment = async (courseId, amount) => {
    console.warn('processPayment is deprecated. Use createCheckoutSession for real Stripe payments.');
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                transactionId: `sim_${Date.now()}`
            });
        }, 1500);
    });
};