import { create } from 'zustand';
import { auth, db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

const useAuthStore = create((set) => ({
    user: null,
    isAdmin: false,
    isAuthenticated: false,
    loading: false,
    error: null,

    setUser: async (userData) => {
        if (userData) {
            try {
                // Check if user is admin
                const userDoc = await getDoc(doc(db, 'users', userData.uid));
                const isAdmin = userDoc.exists() && userDoc.data().role === 'admin';

                set({
                    user: userData,
                    isAdmin,
                    isAuthenticated: true,
                    loading: false,
                    error: null
                });
            } catch (error) {
                console.error('Error checking admin status:', error);
                set({
                    user: userData,
                    isAdmin: false,
                    isAuthenticated: true,
                    loading: false
                });
            }
        } else {
            set({
                user: null,
                isAdmin: false,
                isAuthenticated: false,
                loading: false
            });
        }
    },

    setLoading: (loading) => set({ loading }),

    setError: (error) => set({ error }),

    logout: () => {
        auth.signOut();
        set({
            user: null,
            isAdmin: false,
            isAuthenticated: false,
            loading: false,
            error: null
        });
    }
}));

export default useAuthStore;