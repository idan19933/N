// src/store/authStore.js - NEXON ENHANCED VERSION
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
    nexonProfile: null, // NEW: Specific Nexon fields

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
                        displayName: firebaseUser.displayName,
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

                    // ✅ CHECK ONBOARDING with Nexon support
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
                    needsOnboarding: false
                });
            }
        });
    },

    checkOnboarding: async () => {
        const user = get().user;
        if (!user) {
            console.log('⚠️ checkOnboarding: No user found');
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
                needsOnboarding: false
            });
            return;
        }

        try {
            console.log('📡 Calling profileService.getProfile...');
            const profile = await profileService.getProfile(user.uid);

            console.log('📦 Profile retrieved:', profile);
            console.log('   onboardingCompleted:', profile?.onboardingCompleted);
            console.log('   nexonProfile:', profile?.nexonProfile);

            if (profile && profile.onboardingCompleted === true) {
                console.log('✅ ONBOARDING COMPLETED - User has valid profile');

                // Extract Nexon-specific fields
                const nexonData = profile.nexonProfile ? {
                    name: profile.name,
                    grade: profile.grade,
                    track: profile.track,
                    mathFeeling: profile.mathFeeling,
                    learningStyle: profile.learningStyle,
                    goalFocus: profile.goalFocus,
                    topicMastery: profile.topicMastery || {},
                    strugglesText: profile.strugglesText
                } : null;

                set({
                    studentProfile: profile,
                    nexonProfile: nexonData,
                    needsOnboarding: false
                });
                console.log('📊 State updated: needsOnboarding = false');
                console.log('   Nexon profile loaded:', !!nexonData);
            } else {
                console.log('❌ NEEDS ONBOARDING - No profile or incomplete');
                set({
                    studentProfile: null,
                    nexonProfile: null,
                    needsOnboarding: true
                });
                console.log('📊 State updated: needsOnboarding = true');
            }

            // Log final state
            const finalState = get();
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('📊 FINAL STATE:');
            console.log('   needsOnboarding:', finalState.needsOnboarding);
            console.log('   hasProfile:', !!finalState.studentProfile);
            console.log('   hasNexonProfile:', !!finalState.nexonProfile);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        } catch (error) {
            console.error('❌ Error in checkOnboarding:', error);
            console.error('   Error details:', error.message);
            // Default to needs onboarding on error
            set({
                studentProfile: null,
                nexonProfile: null,
                needsOnboarding: user.role === 'user'
            });
        }
    },

    completeOnboarding: async (formData) => {
        const user = get().user;
        if (!user) {
            throw new Error('No user logged in');
        }

        console.log('💾 completeOnboarding called (Nexon Enhanced)');
        console.log('   User:', user.email);
        console.log('   FormData:', formData);

        const profileData = {
            ...formData,
            onboardingCompleted: true,
            completedAt: new Date().toISOString(),
            userId: user.uid
        };

        console.log('💾 Saving Nexon profile:', profileData);

        try {
            const savedProfile = await profileService.saveProfile(user.uid, profileData);
            console.log('✅ Profile saved:', savedProfile);

            // Extract Nexon-specific fields
            const nexonData = formData.nexonProfile ? {
                name: formData.name,
                grade: formData.grade,
                track: formData.track,
                mathFeeling: formData.mathFeeling,
                learningStyle: formData.learningStyle,
                goalFocus: formData.goalFocus,
                topicMastery: formData.topicMastery || {},
                strugglesText: formData.strugglesText
            } : null;

            set({
                studentProfile: savedProfile,
                nexonProfile: nexonData,
                needsOnboarding: false
            });

            console.log('📊 State updated after onboarding complete');
            console.log('   Nexon profile set:', !!nexonData);
            return savedProfile;
        } catch (error) {
            console.error('❌ Error saving profile:', error);
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
                    displayName: userCredential.user.displayName,
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
                createdAt: new Date(),
                emailVerified: false
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
                needsOnboarding: false
            });
            console.log('✅ Logout successful');
            return { success: true };
        } catch (error) {
            console.error('❌ Logout error:', error);
            return { success: false };
        }
    },

    // NEW: Helper methods for Nexon
    getNexonGreeting: () => {
        const nexonProfile = get().nexonProfile;
        if (!nexonProfile?.name) return 'היי! Hi there!';
        return `היי ${nexonProfile.name}! 👋`;
    },

    getNexonLevel: () => {
        const nexonProfile = get().nexonProfile;
        if (!nexonProfile?.grade || !nexonProfile?.track) return 'intermediate';

        const grade = parseInt(nexonProfile.grade);
        if (grade <= 9) return 'intermediate';

        if (nexonProfile.track.includes('5')) return 'advanced';
        if (nexonProfile.track.includes('4')) return 'intermediate';
        return 'beginner';
    }
}));

export default useAuthStore;