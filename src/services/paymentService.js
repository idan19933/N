import { getFunctions, httpsCallable } from 'firebase/functions';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { notifyPurchase } from './notificationService';

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

        // Add codeId if exists
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

// Get user's purchased courses (including promo codes)
export const getUserPurchases = async (userId) => {
    try {
        console.log('📦 Getting purchases for user:', userId);

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

// Check if user purchased a specific course (including promo codes)
export const hasUserPurchasedCourse = async (userId, courseId) => {
    try {
        console.log('🔍 Checking purchase for:', { userId, courseId });

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

// Filter valid purchases only
export const getValidUserPurchases = async (userId) => {
    try {
        console.log('📦 Getting valid purchases for user:', userId);

        const allPurchases = await getUserPurchases(userId);

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

// Handle successful purchase and send notification
export const handleSuccessfulPurchase = async (
    userId,
    userName,
    courseId,
    courseName,
    courseImage,
    amount = 0,
    userEmail = ''
) => {
    try {
        console.log('🎉 Handling successful purchase notification');
        console.log('📦 Purchase details:', {
            userId,
            userName,
            courseId,
            courseName,
            amount,
            userEmail
        });

        await notifyPurchase(
            userId,
            userName,
            courseId,
            courseName,
            courseImage,
            amount,
            userEmail
        );

        console.log('✅ Purchase notification sent successfully');
        return { success: true };
    } catch (error) {
        console.error('❌ Error sending purchase notification:', error);
        return { success: false, error: error.message };
    }
};

// ✅ NEW: Handle Premium Purchase
export const handlePremiumPurchase = async (userId, userName, planType, amount, userEmail) => {
    try {
        console.log('🎉 Handling premium purchase');

        await handleSuccessfulPurchase(
            userId,
            userName,
            planType, // 'premium_monthly' or 'premium_yearly'
            planType === 'premium_monthly' ? 'נקסון פרימיום - חודשי' : 'נקסון פרימיום - שנתי',
            '', // No image for premium
            amount,
            userEmail
        );

        return { success: true };
    } catch (error) {
        console.error('Error handling premium purchase:', error);
        return { success: false, error: error.message };
    }
};

// ✅ NEW: Check if user has active premium
export const checkUserPremiumStatus = async (userId) => {
    try {
        const purchases = await getUserPurchases(userId);

        const premiumPurchases = purchases.filter(p =>
            (p.courseId === 'premium_monthly' || p.courseId === 'premium_yearly') &&
            (p.status === 'completed' || p.paymentMethod === 'promo_code')
        );

        if (premiumPurchases.length > 0) {
            const latestPremium = premiumPurchases.sort((a, b) =>
                (b.purchaseDate || b.purchasedAt || 0) - (a.purchaseDate || a.purchasedAt || 0)
            )[0];

            // Check expiration if exists
            if (latestPremium.expiresAt) {
                const expiresAt = new Date(latestPremium.expiresAt);
                const isExpired = expiresAt < new Date();

                if (isExpired) {
                    return { isPremium: false, plan: null, expiresAt: null };
                }
            }

            return {
                isPremium: true,
                plan: latestPremium.courseId === 'premium_monthly' ? 'monthly' : 'yearly',
                expiresAt: latestPremium.expiresAt ? new Date(latestPremium.expiresAt) : null
            };
        }

        return { isPremium: false, plan: null, expiresAt: null };
    } catch (error) {
        console.error('Error checking premium status:', error);
        return { isPremium: false, plan: null, expiresAt: null };
    }
};