import { getFunctions, httpsCallable } from 'firebase/functions';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const functions = getFunctions();
const createCheckoutSessionFunction = httpsCallable(functions, 'createCheckoutSession');

export const createCheckoutSession = async (courseId, price) => {
    try {
        console.log('💳 Creating checkout session');
        console.log('📦 Received params:', { courseId, price });

        if (!auth.currentUser) {
            console.error('❌ No authenticated user');
            return { success: false, error: 'User not authenticated' };
        }

        const userId = auth.currentUser.uid;
        console.log('👤 User ID:', userId);

        // Validate courseId
        if (!courseId) {
            console.error('❌ Missing courseId');
            return { success: false, error: 'Course ID is required' };
        }

        // Validate and parse price
        let amount;
        if (typeof price === 'string') {
            amount = parseFloat(price);
        } else if (typeof price === 'number') {
            amount = price;
        } else {
            console.error('❌ Invalid price type:', typeof price, price);
            return { success: false, error: 'Invalid price format' };
        }

        if (isNaN(amount) || amount <= 0) {
            console.error('❌ Invalid amount:', amount);
            return { success: false, error: 'Invalid price amount' };
        }

        console.log('💰 Parsed amount:', amount);

        const requestData = {
            courseId: courseId,
            amount: amount,
            userId: userId,
            origin: window.location.origin
        };

        console.log('📤 Sending request:', requestData);

        const result = await createCheckoutSessionFunction(requestData);

        console.log('✅ Response received:', result.data);

        if (result.data && result.data.url) {
            return { success: true, url: result.data.url };
        } else {
            console.error('❌ No URL in response:', result.data);
            return { success: false, error: 'No checkout URL received' };
        }
    } catch (error) {
        console.error('❌ Error creating checkout session:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error details:', error.details);

        return {
            success: false,
            error: error.message || 'Unknown error occurred'
        };
    }
};

// Get user's purchased courses
export const getUserPurchases = async (userId) => {
    try {
        console.log('📦 Getting purchases for user:', userId);

        const purchasesQuery = query(
            collection(db, 'purchases'),
            where('userId', '==', userId),
            where('status', '==', 'completed')
        );

        const snapshot = await getDocs(purchasesQuery);

        const purchases = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        console.log('✅ Found purchases:', purchases.length);
        return purchases;
    } catch (error) {
        console.error('❌ Error getting purchases:', error);
        return [];
    }
};

// Check if user purchased a specific course
export const hasUserPurchasedCourse = async (userId, courseId) => {
    try {
        const purchasesQuery = query(
            collection(db, 'purchases'),
            where('userId', '==', userId),
            where('courseId', '==', courseId),
            where('status', '==', 'completed')
        );

        const snapshot = await getDocs(purchasesQuery);
        return !snapshot.empty;
    } catch (error) {
        console.error('Error checking purchase:', error);
        return false;
    }
};