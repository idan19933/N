import { create } from 'zustand';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

import {
    createSession,
    validateSession,
    terminateAllSessions,
    logActivity,
    checkRateLimit
} from '../services/sessionService';

const useAuthStore = create((set, get) => ({
    user: null,
    isAuthenticated: false,
    isAdmin: false,
    loading: true,
    sessionValid: false,

    // Initialize auth state listener
    initAuth: () => {
        onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    // Check if session exists
                    const hasSession = localStorage.getItem('sessionId');

                    if (hasSession) {
                        // Validate existing session
                        const sessionValidation = await validateSession();

                        if (!sessionValidation.valid) {
                            console.log('Invalid session, logging out');
                            await get().logout();
                            return;
                        }
                    } else {
                        // Create new session for authenticated user
                        await createSession(firebaseUser.uid, firebaseUser.email);
                    }

                    // Get user data from Firestore
                    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                    const userData = userDoc.exists() ? userDoc.data() : {};

                    set({
                        user: {
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            displayName: firebaseUser.displayName,
                            ...userData
                        },
                        isAuthenticated: true,
                        isAdmin: userData?.role === 'admin',
                        sessionValid: true,
                        loading: false
                    });

                } catch (error) {
                    console.error('Error in auth state change:', error);
                    set({
                        user: {
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            displayName: firebaseUser.displayName
                        },
                        isAuthenticated: true,
                        isAdmin: false,
                        sessionValid: false,
                        loading: false
                    });
                }
            } else {
                // User not authenticated
                set({
                    user: null,
                    isAuthenticated: false,
                    isAdmin: false,
                    sessionValid: false,
                    loading: false
                });
            }
        });
    },

    // Login with rate limiting
    login: async (email, password) => {
        try {
            // Check rate limit
            const rateLimitCheck = await checkRateLimit(email);

            if (!rateLimitCheck.allowed) {
                const minutesRemaining = rateLimitCheck.retryAfter || 15;
                return {
                    success: false,
                    error: `Too many login attempts. Please try again in ${minutesRemaining} minutes.`
                };
            }

            // Authenticate with Firebase
            const userCredential = await signInWithEmailAndPassword(auth, email, password);

            // Get user data
            const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
            const userData = userDoc.exists() ? userDoc.data() : {};

            // Create session
            const sessionResult = await createSession(
                userCredential.user.uid,
                email
            );

            if (!sessionResult.success) {
                console.error('Session creation failed:', sessionResult.error);
                // Don't block login if session creation fails
            }

            // Update state
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

            // Log successful login
            await logActivity(userCredential.user.uid, 'login_success', {
                email: email,
                timestamp: new Date().toISOString()
            });

            return { success: true };
        } catch (error) {
            console.error('Login error:', error);

            // Log failed attempt
            await logActivity(email, 'login_failed', {
                error: error.code || error.message,
                timestamp: new Date().toISOString()
            });

            // User-friendly error messages
            let errorMessage = 'Login error. Please try again.';

            switch (error.code) {
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                    errorMessage = 'Invalid email or password';
                    break;
                case 'auth/user-not-found':
                    errorMessage = 'User not found';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email address';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Too many attempts. Try again later.';
                    break;
                case 'auth/user-disabled':
                    errorMessage = 'This account has been disabled';
                    break;
            }

            return { success: false, error: errorMessage };
        }
    },

    // Register with rate limiting
    register: async (email, password, displayName = '') => {
        try {
            // Check rate limit
            const rateLimitCheck = await checkRateLimit(email);

            if (!rateLimitCheck.allowed) {
                return {
                    success: false,
                    error: 'Too many attempts. Try again later.'
                };
            }

            // Create Firebase user
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            // Create user document
            await setDoc(doc(db, 'users', userCredential.user.uid), {
                email: email,
                displayName: displayName || email.split('@')[0],
                role: 'user',
                createdAt: new Date(),
                emailVerified: false
            });

            // Create session
            const sessionResult = await createSession(
                userCredential.user.uid,
                email
            );

            if (!sessionResult.success) {
                console.error('Session creation failed:', sessionResult.error);
            }

            // Update state
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

            // Log registration
            await logActivity(userCredential.user.uid, 'register', {
                email: email,
                timestamp: new Date().toISOString()
            });

            return { success: true };
        } catch (error) {
            console.error('Registration error:', error);

            // Log failed registration
            await logActivity(email, 'register_failed', {
                error: error.code || error.message
            });

            let errorMessage = 'Registration error. Please try again.';

            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'Email already in use';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'Password too weak. Use at least 6 characters';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email address';
                    break;
            }

            return { success: false, error: errorMessage };
        }
    },

    // Logout
    logout: async () => {
        try {
            const currentUser = get().user;

            if (currentUser) {
                // Log logout
                await logActivity(currentUser.uid, 'logout', {
                    timestamp: new Date().toISOString()
                });

                // Terminate all sessions
                await terminateAllSessions(currentUser.uid);
            }

            // Sign out from Firebase
            await signOut(auth);

            // Clear state
            set({
                user: null,
                isAuthenticated: false,
                isAdmin: false,
                sessionValid: false,
                loading: false
            });

            return { success: true };
        } catch (error) {
            console.error('Logout error:', error);

            // Force clear state
            set({
                user: null,
                isAuthenticated: false,
                isAdmin: false,
                sessionValid: false,
                loading: false
            });

            return { success: false, error: 'Logout error' };
        }
    },

    // Manually validate session
    checkSession: async () => {
        try {
            const validation = await validateSession();

            if (!validation.valid) {
                await get().logout();
                return { valid: false, reason: validation.reason };
            }

            set({ sessionValid: true });
            return { valid: true };
        } catch (error) {
            console.error('Session validation error:', error);
            return { valid: false, reason: 'Validation error' };
        }
    }
}));

export default useAuthStore;