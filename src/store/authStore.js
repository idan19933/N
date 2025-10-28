// src/store/authStore.js - WITH PERSISTENCE + FIRESTORE PROFILE LOADING
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { getUserPurchases } from '../services/paymentService';

// 🔥 HELPER: Fetch database ID from Firebase UID
const fetchDatabaseUserId = async (firebaseUid) => {
    try {
        const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
        console.log(`🔍 Fetching database ID for Firebase UID: ${firebaseUid}`);

        const response = await fetch(`${API_URL}/api/users/db-id/${firebaseUid}`);
        const data = await response.json();

        if (data.success) {
            console.log(`✅ Database ID: ${data.userId} for Firebase UID: ${firebaseUid}`);
            return data.userId;
        }

        console.warn('⚠️ No database user found for Firebase UID:', firebaseUid);
        return null;
    } catch (error) {
        console.error('❌ Error fetching DB user ID:', error);
        return null;
    }
};

// 🔥 CRITICAL FIX: Add debounce helper
let checkOnboardingTimeout = null;

const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            isAdmin: false,
            loading: false,
            sessionValid: false,

            studentProfile: null,
            needsOnboarding: false,
            onboardingComplete: false,
            nexonProfile: null,

            // ✅ NEW: Premium state
            isPremium: false,
            premiumExpiresAt: null,
            premiumPlan: null, // 'monthly' or 'yearly'

            // 🔥 FIX: Prevent concurrent execution
            _checkingOnboarding: false,

            // ✅ NEW: Check Premium Status
            checkPremiumStatus: async () => {
                const { user } = get();
                if (!user) {
                    set({ isPremium: false, premiumExpiresAt: null, premiumPlan: null });
                    return false;
                }

                try {
                    console.log('🔍 Checking premium status for:', user.uid);

                    const purchases = await getUserPurchases(user.uid);

                    const premiumPurchases = purchases.filter(p =>
                        (p.courseId === 'premium_monthly' || p.courseId === 'premium_yearly') &&
                        (p.status === 'completed' || p.paymentMethod === 'promo_code')
                    );

                    if (premiumPurchases.length > 0) {
                        const latestPremium = premiumPurchases.sort((a, b) =>
                            (b.purchaseDate || b.purchasedAt || 0) - (a.purchaseDate || a.purchasedAt || 0)
                        )[0];

                        let expiresAt = null;
                        let plan = latestPremium.courseId === 'premium_monthly' ? 'monthly' : 'yearly';

                        if (latestPremium.expiresAt) {
                            expiresAt = new Date(latestPremium.expiresAt);
                            const isExpired = expiresAt < new Date();

                            if (isExpired) {
                                console.log('❌ Premium subscription expired');
                                set({ isPremium: false, premiumExpiresAt: null, premiumPlan: null });
                                return false;
                            }
                        }

                        console.log('✅ User has active premium:', plan);
                        set({ isPremium: true, premiumExpiresAt: expiresAt, premiumPlan: plan });
                        return true;
                    }

                    console.log('❌ No premium subscription found');
                    set({ isPremium: false, premiumExpiresAt: null, premiumPlan: null });
                    return false;
                } catch (error) {
                    console.error('Error checking premium status:', error);
                    set({ isPremium: false, premiumExpiresAt: null, premiumPlan: null });
                    return false;
                }
            },

            initAuth: () => {
                console.log('🔧 initAuth: Setting up auth listener...');

                onAuthStateChanged(auth, async (firebaseUser) => {
                    console.log('👤 Auth state changed:', firebaseUser?.email || 'logged out');

                    if (firebaseUser) {
                        try {
                            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

                            if (!userDoc.exists()) {
                                console.error('❌ User document not found');
                                return;
                            }

                            const userData = userDoc.data();

                            // 🔥 FETCH DATABASE ID
                            const dbId = await fetchDatabaseUserId(firebaseUser.uid);

                            const userObj = {
                                uid: firebaseUser.uid,
                                id: dbId,  // ← Database ID (integer)
                                email: firebaseUser.email,
                                displayName: firebaseUser.displayName || userData.displayName,
                                ...userData
                            };

                            // 🔥 FIX: Single set() call with all updates
                            set({
                                user: userObj,
                                isAuthenticated: true,
                                isAdmin: userData?.role === 'admin',
                                sessionValid: true,
                                loading: false
                            });

                            console.log('✅ User state set with DB ID:', dbId);

                            // ✅ NEW: Check premium status
                            await get().checkPremiumStatus();

                            // 🔥 FIX: Debounce the onboarding check
                            if (checkOnboardingTimeout) {
                                clearTimeout(checkOnboardingTimeout);
                            }

                            checkOnboardingTimeout = setTimeout(() => {
                                console.log('🔍 Running checkOnboarding (debounced)');
                                get().checkOnboarding();
                            }, 300);

                        } catch (error) {
                            console.error('❌ Error in auth listener:', error);
                            set({ loading: false });
                        }
                    } else {
                        // 🔥 FIX: Single set() call for logout
                        set({
                            user: null,
                            isAuthenticated: false,
                            isAdmin: false,
                            sessionValid: false,
                            loading: false,
                            studentProfile: null,
                            nexonProfile: null,
                            needsOnboarding: false,
                            onboardingComplete: false,
                            _checkingOnboarding: false,
                            isPremium: false,
                            premiumExpiresAt: null,
                            premiumPlan: null
                        });
                    }
                });
            },

            checkOnboarding: async () => {
                const state = get();

                // 🔥 FIX: Prevent concurrent calls
                if (state._checkingOnboarding) {
                    console.log('⏭️ checkOnboarding already running, skipping');
                    return;
                }

                const user = state.user;
                if (!user) {
                    console.log('⚠️ No user, skipping onboarding check');
                    return;
                }

                console.log('━━━ CHECKING ONBOARDING ━━━');

                // 🔥 FIX: Set flag immediately
                set({ _checkingOnboarding: true });

                // Admin skip
                if (user.role === 'admin') {
                    console.log('👑 Admin - skip onboarding');
                    set({
                        studentProfile: null,
                        nexonProfile: null,
                        needsOnboarding: false,
                        onboardingComplete: true,
                        _checkingOnboarding: false
                    });
                    return;
                }

                try {
                    // 🔥 CRITICAL FIX: Read from FIRESTORE, not backend API
                    console.log('📖 Reading profile from Firestore:', user.uid);
                    
                    const profileDoc = await getDoc(doc(db, 'studentProfiles', user.uid));
                    
                    if (!profileDoc.exists()) {
                        console.log('⚠️ No profile found in Firestore - onboarding needed');
                        set({
                            studentProfile: null,
                            nexonProfile: null,
                            onboardingComplete: false,
                            needsOnboarding: true,
                            _checkingOnboarding: false
                        });
                        return;
                    }

                    const profile = profileDoc.data();
                    console.log('📦 Profile loaded from Firestore:', {
                        hasProfile: true,
                        onboardingCompleted: profile.onboardingCompleted
                    });

                    if (profile && profile.onboardingCompleted) {
                        // 🔥 FIX: Single set() call
                        set({
                            studentProfile: profile,
                            nexonProfile: profile,
                            onboardingComplete: true,
                            needsOnboarding: false,
                            _checkingOnboarding: false
                        });
                        console.log('✅ Onboarding complete');
                    } else {
                        // 🔥 FIX: Single set() call
                        set({
                            studentProfile: null,
                            nexonProfile: null,
                            onboardingComplete: false,
                            needsOnboarding: true,
                            _checkingOnboarding: false
                        });
                        console.log('⚠️ Onboarding needed');
                    }

                } catch (error) {
                    console.error('❌ Onboarding check error:', error);
                    set({
                        needsOnboarding: true,
                        onboardingComplete: false,
                        _checkingOnboarding: false
                    });
                }
            },

            completeOnboarding: async (data) => {
                const user = get().user;
                if (!user) throw new Error('No user');

                try {
                    const profileData = {
                        uid: user.uid,
                        email: user.email,
                        displayName: user.displayName || data.name,
                        name: data.name || user.displayName,
                        grade: data.grade,
                        gradeLevel: data.grade,
                        educationLevel: data.educationLevel || (parseInt(data.grade.replace('grade', '')) <= 9 ? 'middle' : 'high'),
                        track: data.track || 'standard',
                        mathFeeling: data.mathFeeling,
                        learningStyle: data.learningStyle,
                        goalFocus: data.goalFocus,
                        weakTopics: data.weakTopics || [],
                        strugglesText: data.strugglesText || '',
                        onboardingCompleted: true,
                        nexonProfile: true,
                        role: 'user',
                        createdAt: data.createdAt || new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        completedAt: new Date().toISOString()
                    };

                    // Save to Firestore
                    const userRef = doc(db, 'users', user.uid);
                    const profileRef = doc(db, 'studentProfiles', user.uid);

                    await setDoc(userRef, profileData, { merge: true });
                    await setDoc(profileRef, profileData, { merge: true });

                    // 🔥 FIX: Single set() call
                    set({
                        studentProfile: profileData,
                        nexonProfile: profileData,
                        onboardingComplete: true,
                        needsOnboarding: false
                    });

                    console.log('✅ Onboarding completed and saved to Firestore');
                    return profileData;
                } catch (error) {
                    console.error('❌ completeOnboarding error:', error);
                    throw error;
                }
            },

            login: async (email, password) => {
                console.log('🔐 LOGIN:', email);

                try {
                    const userCredential = await signInWithEmailAndPassword(auth, email, password);
                    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
                    const userData = userDoc.exists() ? userDoc.data() : {};

                    // 🔥 FETCH DATABASE ID
                    const dbId = await fetchDatabaseUserId(userCredential.user.uid);

                    // 🔥 FIX: Single set() call with database ID
                    set({
                        user: {
                            uid: userCredential.user.uid,
                            id: dbId,  // ← Database ID (integer)
                            email: userCredential.user.email,
                            displayName: userCredential.user.displayName || userData.displayName,
                            ...userData
                        },
                        isAuthenticated: true,
                        isAdmin: userData?.role === 'admin',
                        sessionValid: true
                    });

                    console.log('✅ Login successful with DB ID:', dbId);

                    // ✅ NEW: Check premium status after login
                    await get().checkPremiumStatus();

                    return { success: true };

                } catch (error) {
                    console.error('❌ Login error:', error);
                    return { success: false, error: error.message };
                }
            },

            register: async (email, password, displayName = '') => {
                console.log('📝 REGISTER:', email);

                try {
                    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

                    await setDoc(doc(db, 'users', userCredential.user.uid), {
                        email: email,
                        displayName: displayName || email.split('@')[0],
                        role: 'user',
                        createdAt: new Date().toISOString(),
                        emailVerified: false,
                        onboardingCompleted: false
                    });

                    // 🔥 FETCH DATABASE ID (or create if not exists)
                    const dbId = await fetchDatabaseUserId(userCredential.user.uid);

                    // 🔥 FIX: Single set() call with database ID
                    set({
                        user: {
                            uid: userCredential.user.uid,
                            id: dbId,  // ← Database ID (integer)
                            email: userCredential.user.email,
                            displayName: displayName || email.split('@')[0],
                            role: 'user'
                        },
                        isAuthenticated: true,
                        isAdmin: false,
                        sessionValid: true
                    });

                    console.log('✅ Registration successful with DB ID:', dbId);
                    return { success: true };

                } catch (error) {
                    console.error('❌ Registration error:', error);
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
                        onboardingComplete: false,
                        isPremium: false,
                        premiumExpiresAt: null,
                        premiumPlan: null
                    });
                    return { success: true };
                } catch (error) {
                    console.error('❌ Logout error:', error);
                    return { success: false };
                }
            },

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
        }),
        {
            name: 'nexon-auth-storage', // localStorage key
            storage: createJSONStorage(() => localStorage),
            
            // 🔥 CRITICAL: Only persist these specific fields
            partialize: (state) => ({
                user: state.user,
                isAuthenticated: state.isAuthenticated,
                isAdmin: state.isAdmin,
                studentProfile: state.studentProfile,
                nexonProfile: state.nexonProfile,
                onboardingComplete: state.onboardingComplete,
                isPremium: state.isPremium,
                premiumExpiresAt: state.premiumExpiresAt,
                premiumPlan: state.premiumPlan
            }),

            // Merge persisted state with current state
            merge: (persistedState, currentState) => {
                console.log('🔄 [AuthStore] Hydrating from localStorage');
                return {
                    ...currentState,
                    ...persistedState,
                    loading: false,
                    _checkingOnboarding: false
                };
            },

            // Version for migrations
            version: 1
        }
    )
);

// 🔥 Debug logging for state changes
if (typeof window !== 'undefined') {
    useAuthStore.subscribe((state) => {
        console.log('📊 [AuthStore] State updated:', {
            hasUser: !!state.user,
            hasProfile: !!(state.nexonProfile || state.studentProfile),
            onboardingComplete: state.onboardingComplete,
            isPremium: state.isPremium
        });
    });
}

export default useAuthStore;
