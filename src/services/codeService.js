import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc, increment } from 'firebase/firestore';
import { db } from '../config/firebase';

export const CODE_TYPES = {
    DISCOUNT: 'discount',
    UNLOCK: 'unlock'
};

// יצירת קוד חדש
export const createCode = async (codeData) => {
    try {
        const codeRef = await addDoc(collection(db, 'codes'), {
            ...codeData,
            usedCount: 0,
            active: true,
            createdAt: new Date()
        });
        return { success: true, id: codeRef.id };
    } catch (error) {
        console.error('Error creating code:', error);
        return { success: false, error: error.message };
    }
};

// בדיקת קוד
export const validateCode = async (code, courseId) => {
    try {
        const codesQuery = query(
            collection(db, 'codes'),
            where('code', '==', code.toUpperCase()),
            where('active', '==', true)
        );

        const snapshot = await getDocs(codesQuery);

        if (snapshot.empty) {
            return { valid: false, message: 'קוד לא תקין' };
        }

        const codeDoc = snapshot.docs[0];
        const codeData = { id: codeDoc.id, ...codeDoc.data() };

        // בדיקת קורס ספציפי
        if (codeData.courseId && codeData.courseId !== courseId) {
            return { valid: false, message: 'קוד זה לא תקף לקורס זה' };
        }

        // בדיקת תאריך תפוגה
        if (codeData.expiresAt && codeData.expiresAt.toDate() < new Date()) {
            return { valid: false, message: 'הקוד פג תוקף' };
        }

        // בדיקת מגבלת שימוש
        if (codeData.usageLimit && codeData.usedCount >= codeData.usageLimit) {
            return { valid: false, message: 'הקוד הגיע למגבלת השימוש' };
        }

        return {
            valid: true,
            codeData,
            message: 'קוד תקין!'
        };
    } catch (error) {
        console.error('Error validating code:', error);
        return { valid: false, message: 'שגיאה בבדיקת הקוד' };
    }
};

// שימוש בקוד
export const useCode = async (codeId) => {
    try {
        const codeRef = doc(db, 'codes', codeId);
        await updateDoc(codeRef, {
            usedCount: increment(1),
            lastUsedAt: new Date()
        });
        return { success: true };
    } catch (error) {
        console.error('Error using code:', error);
        return { success: false };
    }
};

// קבלת כל הקודים
export const getAllCodes = async () => {
    try {
        const snapshot = await getDocs(collection(db, 'codes'));
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting codes:', error);
        return [];
    }
};

// מחיקת קוד
export const deleteCode = async (codeId) => {
    try {
        await deleteDoc(doc(db, 'codes', codeId));
        return { success: true };
    } catch (error) {
        console.error('Error deleting code:', error);
        return { success: false, error: error.message };
    }
};

// השבתת/הפעלת קוד
export const toggleCodeStatus = async (codeId, active) => {
    try {
        const codeRef = doc(db, 'codes', codeId);
        await updateDoc(codeRef, { active });
        return { success: true };
    } catch (error) {
        console.error('Error toggling code:', error);
        return { success: false };
    }
};