import { db } from '../config/firebase';
import { collection, addDoc, query, where, getDocs, doc, updateDoc, deleteDoc, serverTimestamp, orderBy, limit, onSnapshot } from 'firebase/firestore';

// ✅ מערך זמני לעקוב אחר התראות שכבר נשלחו (במהלך הסשן)
const processedNotifications = new Set();

// ✅ שלח התראת רכישה למנהל (עם מניעת כפילויות)
export const notifyPurchase = async (userId, userName, courseId, courseName, courseImage, amount = 0, userEmail = '') => {
    try {
        // ✅ צור מזהה ייחודי לרכישה זו
        const notificationKey = `${userId}-${courseId}-${Date.now().toString().slice(0, -4)}`;

        // ✅ בדוק אם כבר עיבדנו את ההתראה הזו
        if (processedNotifications.has(notificationKey)) {
            console.log('⚠️ Duplicate notification prevented:', notificationKey);
            return { success: true, skipped: true, reason: 'duplicate' };
        }

        // ✅ סמן שמעבדים את ההתראה
        processedNotifications.add(notificationKey);

        console.log('📬 Creating purchase notification:', {
            userId,
            userName,
            courseId,
            courseName,
            amount
        });

        await addDoc(collection(db, 'notifications'), {
            type: 'course_purchase',
            userId: 'admin',
            title: 'רכישת קורס חדשה! 🎉',
            message: `${userName} רכש את הקורס "${courseName}"${amount > 0 ? ` בסכום של ₪${amount}` : ''}`,
            purchaseDetails: {
                buyerId: userId,
                buyerName: userName,
                buyerEmail: userEmail || '',
                courseId,
                courseName,
                courseImage: courseImage || '',
                amount: amount || 0,
                paymentMethod: amount > 0 ? 'credit_card' : 'promo_code',
                codeUsed: null
            },
            read: false,
            timestamp: serverTimestamp(),
            createdAt: serverTimestamp()
        });

        console.log('✅ Purchase notification created successfully');

        // ✅ נקה את המזהה אחרי 10 שניות (למקרה של ניסיון חוזר לגיטימי)
        setTimeout(() => {
            processedNotifications.delete(notificationKey);
        }, 10000);

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
            timestamp: notificationData.timestamp || serverTimestamp(),
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
            notificationsQuery = query(
                collection(db, 'notifications'),
                where('userId', '==', userId)
            );
        } else {
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
            userId: 'admin',
            title: 'משתמש חדש נרשם! 👋',
            message: `${userName} (${userEmail}) הצטרף לפלטפורמה`,
            userDetails: {
                newUserId: userId,
                newUserName: userName,
                newUserEmail: userEmail
            },
            userName,
            userEmail,
            timestamp: serverTimestamp()
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
            userId: 'admin',
            title: 'קוד פרומו שומש! 🎟️',
            message: `${userName} פתח את הקורס "${courseName}" באמצעות קוד: ${promoCode}`,
            purchaseDetails: {
                buyerId: userId,
                buyerName: userName,
                courseId,
                courseName,
                amount: 0,
                paymentMethod: 'promo_code',
                codeUsed: promoCode
            },
            userName,
            courseId,
            courseName,
            promoCode,
            timestamp: serverTimestamp()
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
            userId: 'admin',
            title: 'קורס הושלם! 🎓',
            message: `${userName} השלים את הקורס "${courseName}"`,
            courseDetails: {
                completedById: userId,
                completedByName: userName,
                courseId,
                courseName,
                courseImage: courseImage || ''
            },
            userName,
            courseName,
            timestamp: serverTimestamp()
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
            notificationsQuery = query(
                collection(db, 'notifications'),
                where('userId', '==', userId),
                orderBy('createdAt', 'desc'),
                limit(limitCount)
            );
        } else {
            notificationsQuery = query(
                collection(db, 'notifications'),
                orderBy('createdAt', 'desc'),
                limit(limitCount)
            );
        }

        const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
            const notifications = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            callback(notifications);
        }, (error) => {
            console.error('❌ Error in notifications subscription:', error);
        });

        return unsubscribe;
    } catch (error) {
        console.error('❌ Error setting up notifications subscription:', error);
        return () => {};
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