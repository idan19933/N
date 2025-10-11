import { create } from 'zustand';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const useAuthStore = create((set) => ({
    user: null,
    isAuthenticated: false,
    isAdmin: false,
    loading: true,

    // Initialize auth state listener
    initAuth: () => {
        onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    // Get user data from Firestore
                    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                    const userData = userDoc.data();

                    set({
                        user: {
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            ...userData
                        },
                        isAuthenticated: true,
                        isAdmin: userData?.role === 'admin',
                        loading: false
                    });
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    set({
                        user: {
                            uid: firebaseUser.uid,
                            email: firebaseUser.email
                        },
                        isAuthenticated: true,
                        isAdmin: false,
                        loading: false
                    });
                }
            } else {
                set({
                    user: null,
                    isAuthenticated: false,
                    isAdmin: false,
                    loading: false
                });
            }
        });
    },

    login: async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
            const userData = userDoc.data();

            set({
                user: {
                    uid: userCredential.user.uid,
                    email: userCredential.user.email,
                    ...userData
                },
                isAuthenticated: true,
                isAdmin: userData?.role === 'admin',
                loading: false
            });

            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        }
    },

    register: async (email, password) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            // Create user document in Firestore
            await setDoc(doc(db, 'users', userCredential.user.uid), {
                email: email,
                role: 'user',
                createdAt: new Date()
            });

            set({
                user: {
                    uid: userCredential.user.uid,
                    email: userCredential.user.email,
                    role: 'user'
                },
                isAuthenticated: true,
                isAdmin: false,
                loading: false
            });

            return { success: true };
        } catch (error) {
            console.error('Registration error:', error);
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
                loading: false
            });
        } catch (error) {
            console.error('Logout error:', error);
        }
    }
}));

export default useAuthStore;