// src/services/profileService.js - WITH CLEAN LOGS
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    collection,
    query,
    getDocs
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Enable/disable debug logging
const DEBUG = false; // Set to true for detailed logs

const log = (...args) => {
    if (DEBUG) console.log(...args);
};

class ProfileService {
    constructor() {
        log('✅ Profile Service initialized');
    }

    async getProfile(uid) {
        try {
            log('📡 Getting profile for:', uid);

            const profileRef = doc(db, 'users', uid);
            const profileSnap = await getDoc(profileRef);

            if (profileSnap.exists()) {
                const data = profileSnap.data();
                log('✅ Profile loaded');
                return {
                    ...data,
                    uid,
                    onboardingCompleted: data.onboardingCompleted || false
                };
            }

            log('⚠️ No profile found');
            return null;

        } catch (error) {
            console.error('❌ Error getting profile:', error);
            throw error;
        }
    }

    async completeOnboarding(uid, profileData) {
        try {
            log('📝 Completing onboarding for:', uid);

            const profileRef = doc(db, 'users', uid);

            const newProfile = {
                ...profileData,
                uid,
                onboardingCompleted: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            await setDoc(profileRef, newProfile, { merge: true });

            log('✅ Onboarding completed successfully');
            return newProfile;

        } catch (error) {
            console.error('❌ Error completing onboarding:', error);
            throw error;
        }
    }

    async saveProfile(uid, profileData) {
        return this.completeOnboarding(uid, profileData);
    }

    async updateProfile(uid, updates) {
        try {
            log('📝 Updating profile for:', uid);

            const profileRef = doc(db, 'users', uid);

            await updateDoc(profileRef, {
                ...updates,
                updatedAt: new Date().toISOString()
            });

            log('✅ Profile updated successfully');
            return true;

        } catch (error) {
            console.error('❌ Error updating profile:', error);
            throw error;
        }
    }

    async getUserStats(uid) {
        try {
            log('📊 Getting stats for:', uid);

            const statsRef = doc(db, 'users', uid, 'stats', 'current');
            const statsSnap = await getDoc(statsRef);

            if (statsSnap.exists()) {
                const stats = statsSnap.data();
                log('✅ Stats loaded');
                return stats;
            }

            const defaultStats = {
                questionsAnswered: 0,
                correctAnswers: 0,
                streak: 0,
                practiceTime: 0,
                lastPracticeDate: null
            };

            log('📊 No stats found, returning defaults');
            return defaultStats;

        } catch (error) {
            console.error('❌ Error getting stats:', error);
            return {
                questionsAnswered: 0,
                correctAnswers: 0,
                streak: 0,
                practiceTime: 0
            };
        }
    }

    async updateStats(uid, statUpdates) {
        try {
            log('📊 Updating stats for:', uid);

            const statsRef = doc(db, 'users', uid, 'stats', 'current');
            const statsSnap = await getDoc(statsRef);

            let currentStats = {
                questionsAnswered: 0,
                correctAnswers: 0,
                streak: 0,
                practiceTime: 0,
                lastPracticeDate: null
            };

            if (statsSnap.exists()) {
                currentStats = statsSnap.data();
            }

            const newStats = {
                questionsAnswered: (currentStats.questionsAnswered || 0) + (statUpdates.questionsAnswered || 0),
                correctAnswers: (currentStats.correctAnswers || 0) + (statUpdates.correctAnswers || 0),
                practiceTime: (currentStats.practiceTime || 0) + (statUpdates.practiceTime || 0),
                lastPracticeDate: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            // Calculate streak
            const today = new Date().toDateString();
            const lastDate = currentStats.lastPracticeDate
                ? new Date(currentStats.lastPracticeDate).toDateString()
                : null;

            if (lastDate === today) {
                newStats.streak = currentStats.streak || 1;
            } else if (lastDate === new Date(Date.now() - 86400000).toDateString()) {
                newStats.streak = (currentStats.streak || 0) + 1;
            } else {
                newStats.streak = 1;
            }

            await setDoc(statsRef, newStats, { merge: true });

            log('✅ Stats updated');
            return newStats;

        } catch (error) {
            console.error('❌ Error updating stats:', error);
            throw error;
        }
    }

    async addPracticeSession(uid, sessionData) {
        try {
            log('📝 Adding practice session');

            const sessionsRef = collection(db, 'users', uid, 'sessions');
            const sessionDoc = doc(sessionsRef);

            const session = {
                ...sessionData,
                timestamp: new Date().toISOString(),
                id: sessionDoc.id
            };

            await setDoc(sessionDoc, session);

            await this.updateStats(uid, {
                questionsAnswered: sessionData.questionsAnswered || 1,
                correctAnswers: sessionData.isCorrect ? 1 : 0,
                practiceTime: sessionData.timeSpent || 0
            });

            log('✅ Practice session added');
            return session;

        } catch (error) {
            console.error('❌ Error adding practice session:', error);
            throw error;
        }
    }

    async getRecentSessions(uid, limit = 10) {
        try {
            log('📜 Getting recent sessions');

            const sessionsRef = collection(db, 'users', uid, 'sessions');
            const q = query(sessionsRef);
            const querySnapshot = await getDocs(q);

            const sessions = [];
            querySnapshot.forEach((doc) => {
                sessions.push({ id: doc.id, ...doc.data() });
            });

            sessions.sort((a, b) =>
                new Date(b.timestamp) - new Date(a.timestamp)
            );

            const recent = sessions.slice(0, limit);
            log(`✅ Loaded ${recent.length} sessions`);

            return recent;

        } catch (error) {
            console.error('❌ Error getting sessions:', error);
            return [];
        }
    }

    async needsOnboarding(uid) {
        try {
            const profile = await this.getProfile(uid);

            if (!profile) {
                log('🔍 No profile = needs onboarding');
                return true;
            }

            const needs = !profile.onboardingCompleted ||
                !profile.grade ||
                !profile.weakTopics ||
                profile.weakTopics.length === 0;

            log('🔍 Needs onboarding:', needs);
            return needs;

        } catch (error) {
            console.error('❌ Error checking onboarding:', error);
            return true;
        }
    }
}

export const profileService = new ProfileService();
export default profileService;