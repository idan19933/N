import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            loading: false,
            error: null,

            setUser: (userData) => set({
                user: userData,
                isAuthenticated: !!userData,
                error: null
            }),

            setLoading: (loading) => set({ loading }),

            setError: (error) => set({ error }),

            logout: () => set({
                user: null,
                isAuthenticated: false,
                error: null
            }),

            clearError: () => set({ error: null }),
        }),
        {
            name: 'auth-storage',
        }
    )
);