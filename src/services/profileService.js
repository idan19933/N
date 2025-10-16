// src/services/profileService.js
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export const profileService = {
    async getProfile(userId) {
        try {
            const profileDoc = await getDoc(doc(db, 'studentProfiles', userId));
            return profileDoc.exists() ? profileDoc.data() : null;
        } catch (error) {
            console.error('Error getting profile:', error);
            return null;
        }
    },

    async saveProfile(userId, profileData) {
        try {
            const profile = {
                ...profileData,
                userId,
                updatedAt: new Date().toISOString()
            };

            await setDoc(doc(db, 'studentProfiles', userId), profile, { merge: true });
            return profile;
        } catch (error) {
            console.error('Error saving profile:', error);
            throw error;
        }
    }
};