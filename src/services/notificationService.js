import { db } from '../config/firebase';
import { collection, addDoc, query, where, getDocs, doc, updateDoc, deleteDoc, serverTimestamp, orderBy, limit, onSnapshot } from 'firebase/firestore';

// ✅ שלח התראת רכישה למנהל
export const notifyPurchase = async (userId, userName, courseId, courseName, courseImage, amount = 0, userEmail = '') => {
    try {
        console.log('📬 Creating purchase notification:', {
            userId,
            userName,
            courseId,
            courseName,
            amount
        });

        await addDoc(collection(db, 'notifications'), {
            type: 'purchase',
            title: 'רכישת קורס חדשה! 🎉',
            message: `${userName} רכש את הקורס "${courseName}"${amount > 0 ? ` בסכום של ₪${amount}` : ''}`,
            userId,
            userName,
            userEmail: userEmail || '',
            courseId,
            courseName,
            courseImage: courseImage || '',
            amount: amount || 0,
            paymentMethod: amount > 0 ? 'credit_card' : 'promo_code',
            read: false,
            createdAt: serverTimestamp()
        });

        console.log('✅ Purchase notification created successfully');
        return { success: true };
    } catch (error) {
        console.error('❌ Error creating purchase notification:', error);
        throw error;
    }
};

// ✅ שלח התראה כללית
export const createNotification = async (notificationData) => {
    try {
        await addDoc(collection(db, 'notifications'), {
            ...notificationData,
            read: false,
            createdAt: serverTimestamp()
        });

        console.log('✅ Notification created:', notificationData.title);
        return { success: true };
    } catch (error) {
        console.error('❌ Error creating notification:', error);
        throw error;
    }
};

// ✅ קבל את כל ההתראות (למנהל)
export const getAllNotifications = async (limitCount = 50) => {
    try {
        const notificationsQuery = query(
            collection(db, 'notifications'),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );

        const snapshot = await getDocs(notificationsQuery);
        const notifications = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return notifications;
    } catch (error) {
        console.error('❌ Error fetching notifications:', error);
        return [];
    }
};

// ✅ קבל התראות לפי משתמש
export const getUserNotifications = async (userId, limitCount = 20) => {
    try {
        const notificationsQuery = query(
            collection(db, 'notifications'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );

        const snapshot = await getDocs(notificationsQuery);
        const notifications = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return notifications;
    } catch (error) {
        console.error('❌ Error fetching user notifications:', error);
        return [];
    }
};

// ✅ קבל התראות שלא נקראו
export const getUnreadNotifications = async (userId = null) => {
    try {
        let notificationsQuery;

        if (userId) {
            notificationsQuery = query(
                collection(db, 'notifications'),
                where('userId', '==', userId),
                where('read', '==', false),
                orderBy('createdAt', 'desc')
            );
        } else {
            notificationsQuery = query(
                collection(db, 'notifications'),
                where('read', '==', false),
                orderBy('createdAt', 'desc')
            );
        }

        const snapshot = await getDocs(notificationsQuery);
        const notifications = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return notifications;
    } catch (error) {
        console.error('❌ Error fetching unread notifications:', error);
        return [];
    }
};

// ✅ סמן התראה כנקראה
export const markAsRead = async (notificationId) => {
    try {
        const notificationRef = doc(db, 'notifications', notificationId);
        await updateDoc(notificationRef, {
            read: true,
            readAt: serverTimestamp()
        });

        console.log('✅ Notification marked as read:', notificationId);
        return { success: true };
    } catch (error) {
        console.error('❌ Error marking notification as read:', error);
        throw error;
    }
};

// ✅ סמן את כל ההתראות כנקראו
export const markAllAsRead = async (userId = null) => {
    try {
        let notificationsQuery;

        if (userId) {
            notificationsQuery = query(
                collection(db, 'notifications'),
                where('userId', '==', userId),
                where('read', '==', false)
            );
        } else {
            notificationsQuery = query(
                collection(db, 'notifications'),
                where('read', '==', false)
            );
        }

        const snapshot = await getDocs(notificationsQuery);

        const updatePromises = snapshot.docs.map(docSnapshot =>
            updateDoc(doc(db, 'notifications', docSnapshot.id), {
                read: true,
                readAt: serverTimestamp()
            })
        );

        await Promise.all(updatePromises);

        console.log(`✅ Marked ${snapshot.docs.length} notifications as read`);
        return { success: true, count: snapshot.docs.length };
    } catch (error) {
        console.error('❌ Error marking all as read:', error);
        throw error;
    }
};

// ✅ מחק התראה
export const deleteNotification = async (notificationId) => {
    try {
        await deleteDoc(doc(db, 'notifications', notificationId));
        console.log('✅ Notification deleted:', notificationId);
        return { success: true };
    } catch (error) {
        console.error('❌ Error deleting notification:', error);
        throw error;
    }
};

// ✅ מחק את כל ההתראות של משתמש
export const deleteAllNotifications = async (userId = null) => {
    try {
        let notificationsQuery;

        if (userId) {
            // מחק רק את ההתראות של המשתמש הספציפי
            notificationsQuery = query(
                collection(db, 'notifications'),
                where('userId', '==', userId)
            );
        } else {
            // מחק את כל ההתראות (למנהל)
            notificationsQuery = query(
                collection(db, 'notifications')
            );
        }

        const snapshot = await getDocs(notificationsQuery);

        const deletePromises = snapshot.docs.map(docSnapshot =>
            deleteDoc(doc(db, 'notifications', docSnapshot.id))
        );

        await Promise.all(deletePromises);

        console.log(`✅ Deleted ${snapshot.docs.length} notifications`);
        return { success: true, count: snapshot.docs.length };
    } catch (error) {
        console.error('❌ Error deleting all notifications:', error);
        throw error;
    }
};

// ✅ מחק את כל ההתראות הישנות (מעל 30 יום)
export const deleteOldNotifications = async (daysOld = 30) => {
    try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);

        const notificationsQuery = query(
            collection(db, 'notifications'),
            where('createdAt', '<', cutoffDate)
        );

        const snapshot = await getDocs(notificationsQuery);

        const deletePromises = snapshot.docs.map(docSnapshot =>
            deleteDoc(doc(db, 'notifications', docSnapshot.id))
        );

        await Promise.all(deletePromises);

        console.log(`✅ Deleted ${snapshot.docs.length} old notifications`);
        return { success: true, count: snapshot.docs.length };
    } catch (error) {
        console.error('❌ Error deleting old notifications:', error);
        throw error;
    }
};

// ✅ קבל מספר התראות שלא נקראו
export const getUnreadCount = async (userId = null) => {
    try {
        const unread = await getUnreadNotifications(userId);
        return unread.length;
    } catch (error) {
        console.error('❌ Error getting unread count:', error);
        return 0;
    }
};

// ✅ התראה על הרשמה של משתמש חדש
export const notifyNewUserRegistration = async (userId, userName, userEmail) => {
    try {
        await createNotification({
            type: 'registration',
            title: 'משתמש חדש נרשם! 👋',
            message: `${userName} (${userEmail}) הצטרף לפלטפורמה`,
            userId,
            userName,
            userEmail
        });

        return { success: true };
    } catch (error) {
        console.error('❌ Error notifying new registration:', error);
        throw error;
    }
};

// ✅ התראה על פתיחת קורס בקוד פרומו
export const notifyPromoCodeUsed = async (userId, userName, courseId, courseName, promoCode) => {
    try {
        await createNotification({
            type: 'promo_code',
            title: 'קוד פרומו שומש! 🎟️',
            message: `${userName} פתח את הקורס "${courseName}" באמצעות קוד: ${promoCode}`,
            userId,
            userName,
            courseId,
            courseName,
            promoCode
        });

        return { success: true };
    } catch (error) {
        console.error('❌ Error notifying promo code use:', error);
        throw error;
    }
};

// ✅ התראה על השלמת קורס
export const notifyCourseCompleted = async (userId, userName, courseId, courseName, courseImage = '') => {
    try {
        await createNotification({
            type: 'course_completed',
            title: 'קורס הושלם! 🎓',
            message: `${userName} השלים את הקורס "${courseName}"`,
            userId,
            userName,
            courseId,
            courseName,
            courseImage
        });

        return { success: true };
    } catch (error) {
        console.error('❌ Error notifying course completion:', error);
        throw error;
    }
};

// ✅ האזן להתראות בזמן אמת (Real-time subscription)
export const subscribeToNotifications = (callback, userId = null, limitCount = 20) => {
    try {
        let notificationsQuery;

        if (userId) {
            // התראות של משתמש ספציפי
            notificationsQuery = query(
                collection(db, 'notifications'),
                where('userId', '==', userId),
                orderBy('createdAt', 'desc'),
                limit(limitCount)
            );
        } else {
            // כל ההתראות (למנהל)
            notificationsQuery = query(
                collection(db, 'notifications'),
                orderBy('createdAt', 'desc'),
                limit(limitCount)
            );
        }

        // onSnapshot מחזיר פונקציה לביטול המנוי
        const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
            const notifications = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            callback(notifications);
        }, (error) => {
            console.error('❌ Error in notifications subscription:', error);
        });

        // החזר את פונקציית הביטול
        return unsubscribe;
    } catch (error) {
        console.error('❌ Error setting up notifications subscription:', error);
        return () => {}; // החזר פונקציה ריקה במקרה של שגיאה
    }
};

// ✅ האזן להתראות שלא נקראו בזמן אמת
export const subscribeToUnreadNotifications = (callback, userId = null) => {
    try {
        let notificationsQuery;

        if (userId) {
            notificationsQuery = query(
                collection(db, 'notifications'),
                where('userId', '==', userId),
                where('read', '==', false),
                orderBy('createdAt', 'desc')
            );
        } else {
            notificationsQuery = query(
                collection(db, 'notifications'),
                where('read', '==', false),
                orderBy('createdAt', 'desc')
            );
        }

        const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
            const notifications = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            callback(notifications);
        }, (error) => {
            console.error('❌ Error in unread notifications subscription:', error);
        });

        return unsubscribe;
    } catch (error) {
        console.error('❌ Error setting up unread notifications subscription:', error);
        return () => {};
    }
};

// ✅ Alias export for backward compatibility
export const notifyCoursePurchase = notifyPurchase;