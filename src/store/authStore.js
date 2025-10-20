// src/store/authStore.js - COMPLETE FIXED VERSION
import { create } from 'zustand';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { profileService } from '../services/profileService';

const useAuthStore = create((set, get) => ({
    user: null,
    isAuthenticated: false,
    isAdmin: false,
    loading: false,
    sessionValid: false,

    // Nexon-enhanced profile
    studentProfile: null,
    needsOnboarding: false,
    onboardingComplete: false,
    nexonProfile: null,

    initAuth: () => {
        console.log('🔧 initAuth: Setting up auth listener with Nexon support...');

        onAuthStateChanged(auth, async (firebaseUser) => {
            console.log('👤 onAuthStateChanged triggered:', firebaseUser?.email || 'no user');

            if (firebaseUser) {
                try {
                    console.log('📄 Fetching user document from Firestore...');
                    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

                    if (!userDoc.exists()) {
                        console.error('❌ User document NOT FOUND in Firestore!');
                        return;
                    }

                    const userData = userDoc.data();
                    console.log('✅ User document loaded:', userData);

                    const userObj = {
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        displayName: firebaseUser.displayName || userData.displayName,
                        ...userData
                    };

                    set({
                        user: userObj,
                        isAuthenticated: true,
                        isAdmin: userData?.role === 'admin',
                        sessionValid: true,
                        loading: false
                    });

                    console.log('📊 User state set:', {
                        email: userObj.email,
                        role: userData?.role,
                        isAdmin: userData?.role === 'admin'
                    });

                    console.log('🔍 Calling checkOnboarding...');
                    await get().checkOnboarding();

                } catch (error) {
                    console.error('❌ Error in onAuthStateChanged:', error);
                }
            } else {
                console.log('🚪 No user - clearing state');
                set({
                    user: null,
                    isAuthenticated: false,
                    isAdmin: false,
                    sessionValid: false,
                    loading: false,
                    studentProfile: null,
                    nexonProfile: null,
                    needsOnboarding: false,
                    onboardingComplete: false
                });
            }
        });
    },

    checkOnboarding: async () => {
        const state = get();
        const user = state.user;

        if (!user) {
            console.log('⚠️ No user - skipping onboarding check');
            return;
        }

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔍 CHECKING ONBOARDING (Nexon Enhanced)');
        console.log('   User:', user.email);
        console.log('   UID:', user.uid);
        console.log('   Role:', user.role);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        // Admins skip onboarding
        if (user.role === 'admin') {
            console.log('👑 Admin user - SKIP onboarding');
            set({
                studentProfile: null,
                nexonProfile: null,
                needsOnboarding: false,
                onboardingComplete: true
            });
            return;
        }

        try {
            console.log('📡 Fetching profile from Firestore...');
            const profile = await profileService.getProfile(user.uid);

            console.log('📦 Profile retrieved:', profile);
            console.log('   onboardingCompleted:', profile?.onboardingCompleted);
            console.log('   grade:', profile?.grade);
            console.log('   weakTopics:', profile?.weakTopics?.length || 0);

            if (profile && profile.onboardingCompleted) {
                console.log('✅ ONBOARDING COMPLETED - User has valid profile');

                // 🔥 FIX: Set BOTH studentProfile AND nexonProfile to the same object
                set({
                    studentProfile: profile,
                    nexonProfile: profile,  // ← This was missing!
                    onboardingComplete: true,
                    needsOnboarding: false
                });

                console.log('📊 State updated: needsOnboarding = false');
                console.log('   ✅ Both studentProfile and nexonProfile set');
            } else {
                console.log('⚠️ ONBOARDING NEEDED - No valid profile found');
                set({
                    studentProfile: null,
                    nexonProfile: null,
                    onboardingComplete: false,
                    needsOnboarding: true
                });
            }

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('📊 FINAL STATE:');
            console.log('   needsOnboarding:', get().needsOnboarding);
            console.log('   onboardingComplete:', get().onboardingComplete);
            console.log('   hasProfile:', !!get().studentProfile);
            console.log('   hasNexonProfile:', !!get().nexonProfile);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        } catch (error) {
            console.error('❌ Error checking onboarding:', error);
            set({
                needsOnboarding: true,
                onboardingComplete: false
            });
        }
    },

    completeOnboarding: async (data) => {
        const user = get().user;
        if (!user) throw new Error('No user logged in');

        try {
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('💾 COMPLETE ONBOARDING STARTING');
            console.log('   User:', user.email);
            console.log('   Input data:', data);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            // Build complete profile object
            const profileData = {
                // User identification
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || data.name,

                // Nexon onboarding data
                name: data.name || user.displayName,
                grade: data.grade,  // Already in 'grade7' format from onboarding
                gradeLevel: data.grade,
                educationLevel: data.educationLevel || (parseInt(data.grade.replace('grade', '')) <= 9 ? 'middle' : 'high'),
                track: data.track || 'standard',
                mathFeeling: data.mathFeeling,
                learningStyle: data.learningStyle,
                goalFocus: data.goalFocus,
                weakTopics: data.weakTopics || [],
                strugglesText: data.strugglesText || '',

                // Flags
                onboardingCompleted: true,
                nexonProfile: true,
                role: 'user',

                // Timestamps
                createdAt: data.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                completedAt: new Date().toISOString()
            };

            console.log('📝 Prepared profile data:', profileData);

            // Save to Firestore - BOTH locations
            console.log('💾 Saving to Firestore...');
            const userRef = doc(db, 'users', user.uid);
            const profileRef = doc(db, 'studentProfiles', user.uid);

            await setDoc(userRef, profileData, { merge: true });
            await setDoc(profileRef, profileData, { merge: true });

            console.log('✅ Profile saved to Firebase successfully');

            // Update Zustand state - SET BOTH!
            set({
                studentProfile: profileData,
                nexonProfile: profileData,  // ← Set both to same object
                onboardingComplete: true,
                needsOnboarding: false
            });

            console.log('✅ Local state updated');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            return profileData;
        } catch (error) {
            console.error('❌ Error in completeOnboarding:', error);
            throw error;
        }
    },

    login: async (email, password) => {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔐 LOGIN STARTING');
        console.log('   Email:', email);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        try {
            set({ loading: true });

            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log('✅ Firebase auth successful');
            console.log('   UID:', userCredential.user.uid);

            const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
            const userData = userDoc.exists() ? userDoc.data() : {};
            console.log('📄 User data loaded:', userData);

            set({
                user: {
                    uid: userCredential.user.uid,
                    email: userCredential.user.email,
                    displayName: userCredential.user.displayName || userData.displayName,
                    ...userData
                },
                isAuthenticated: true,
                isAdmin: userData?.role === 'admin',
                sessionValid: true,
                loading: false
            });

            console.log('🔍 Calling checkOnboarding after login...');
            await get().checkOnboarding();

            console.log('✅ Login complete');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            return { success: true };

        } catch (error) {
            console.error('❌ Login failed:', error);
            set({ loading: false });
            return { success: false, error: error.message };
        }
    },

    register: async (email, password, displayName = '') => {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📝 REGISTRATION STARTING');
        console.log('   Email:', email);
        console.log('   Name:', displayName);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        try {
            set({ loading: true });

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            console.log('✅ Firebase user created');
            console.log('   UID:', userCredential.user.uid);

            await setDoc(doc(db, 'users', userCredential.user.uid), {
                email: email,
                displayName: displayName || email.split('@')[0],
                role: 'user',
                createdAt: new Date().toISOString(),
                emailVerified: false,
                onboardingCompleted: false
            });
            console.log('📄 User document created in Firestore');

            set({
                user: {
                    uid: userCredential.user.uid,
                    email: userCredential.user.email,
                    displayName: displayName || email.split('@')[0],
                    role: 'user'
                },
                isAuthenticated: true,
                isAdmin: false,
                sessionValid: true,
                loading: false
            });

            console.log('🔍 Calling checkOnboarding after registration...');
            await get().checkOnboarding();

            console.log('✅ Registration complete');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            return { success: true };

        } catch (error) {
            console.error('❌ Registration failed:', error);
            set({ loading: false });
            return { success: false, error: error.message };
        }
    },

    logout: async () => {
        try {
            await signOut(auth);
            set({
                user: null,
                isAuthenticated: false,
                isAdmin: false,
                sessionValid: false,
                loading: false,
                studentProfile: null,
                nexonProfile: null,
                needsOnboarding: false,
                onboardingComplete: false
            });
            console.log('✅ Logout successful');
            return { success: true };
        } catch (error) {
            console.error('❌ Logout error:', error);
            return { success: false };
        }
    },

    // Helper methods
    getStudentGrade: () => {
        const state = get();
        return state.nexonProfile?.grade || state.studentProfile?.grade || 'grade7';
    },

    getNexonGreeting: () => {
        const nexonProfile = get().nexonProfile;
        if (!nexonProfile?.name) return 'היי! Hi there!';
        return `היי ${nexonProfile.name}! 👋`;
    },

    getNexonLevel: () => {
        const nexonProfile = get().nexonProfile;
        if (!nexonProfile?.grade || !nexonProfile?.track) return 'intermediate';

        const grade = parseInt(nexonProfile.grade.replace('grade', ''));
        if (grade <= 9) return 'intermediate';

        if (nexonProfile.track.includes('5')) return 'advanced';
        if (nexonProfile.track.includes('4')) return 'intermediate';
        return 'beginner';
    }
}));

export default useAuthStore;