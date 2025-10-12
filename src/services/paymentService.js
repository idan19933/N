import { getFunctions, httpsCallable } from 'firebase/functions';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const functions = getFunctions();
const createCheckoutSessionFunction = httpsCallable(functions, 'createCheckoutSession');

export const createCheckoutSession = async (courseId, price, codeId = null) => {
    try {
        console.log('💳 Creating checkout session');
        console.log('📦 Received params:', { courseId, price, codeId });

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

        if (isNaN(amount) || amount < 0) {
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

        // ✅ הוסף codeId אם קיים
        if (codeId) {
            requestData.codeId = codeId;
            console.log('🎟️ Code ID included:', codeId);
        }

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

// ✅ תוקן - Get user's purchased courses (כולל רכישות עם קופון)
export const getUserPurchases = async (userId) => {
    try {
        console.log('📦 Getting purchases for user:', userId);

        // ✅ הסרנו את התנאי status כדי לתפוס את כל הרכישות
        const purchasesQuery = query(
            collection(db, 'purchases'),
            where('userId', '==', userId)
        );

        const snapshot = await getDocs(purchasesQuery);

        const purchases = snapshot.docs.map(doc => {
            const data = doc.data();
            console.log('📄 Purchase found:', {
                id: doc.id,
                courseId: data.courseId,
                amount: data.amount,
                status: data.status,
                paymentMethod: data.paymentMethod
            });
            return {
                id: doc.id,
                ...data
            };
        });

        console.log('✅ Total purchases found:', purchases.length);
        console.log('🎁 Promo code purchases:', purchases.filter(p => p.paymentMethod === 'promo_code').length);
        console.log('💳 Regular purchases:', purchases.filter(p => p.paymentMethod !== 'promo_code').length);

        return purchases;
    } catch (error) {
        console.error('❌ Error getting purchases:', error);
        return [];
    }
};

// ✅ תוקן - Check if user purchased a specific course (כולל רכישות עם קופון)
export const hasUserPurchasedCourse = async (userId, courseId) => {
    try {
        console.log('🔍 Checking purchase for:', { userId, courseId });

        // ✅ הסרנו את התנאי status
        const purchasesQuery = query(
            collection(db, 'purchases'),
            where('userId', '==', userId),
            where('courseId', '==', courseId)
        );

        const snapshot = await getDocs(purchasesQuery);
        const hasPurchased = !snapshot.empty;

        console.log(hasPurchased ? '✅ User has purchased this course' : '❌ User has NOT purchased this course');

        if (hasPurchased) {
            snapshot.forEach(doc => {
                const data = doc.data();
                console.log('📦 Purchase details:', {
                    amount: data.amount,
                    paymentMethod: data.paymentMethod,
                    status: data.status,
                    purchaseDate: data.purchaseDate || data.purchasedAt
                });
            });
        }

        return hasPurchased;
    } catch (error) {
        console.error('❌ Error checking purchase:', error);
        return false;
    }
};

// ✅ חדש - פונקציה לסינון רכישות תקפות בלבד
export const getValidUserPurchases = async (userId) => {
    try {
        console.log('📦 Getting valid purchases for user:', userId);

        const allPurchases = await getUserPurchases(userId);

        // סנן רק רכישות תקפות (completed או עם amount >= 0)
        const validPurchases = allPurchases.filter(purchase => {
            const isValid =
                purchase.status === 'completed' ||
                purchase.paymentMethod === 'promo_code' ||
                (purchase.amount !== undefined && purchase.amount >= 0);

            if (!isValid) {
                console.log('⏭️ Skipping invalid purchase:', purchase);
            }

            return isValid;
        });

        console.log('✅ Valid purchases:', validPurchases.length);
        return validPurchases;
    } catch (error) {
        console.error('❌ Error getting valid purchases:', error);
        return [];
    }
};