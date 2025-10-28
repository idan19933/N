// src/services/profileService.js - FIXED FOR EXACT BACKEND FORMAT
const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export const profileService = {
    async getUserStats(userId) {
        try {
            if (!userId) {
                console.warn('⚠️ [ProfileService] No userId provided');
                return { questionsAnswered: 0, correctAnswers: 0, streak: 0, practiceTime: 0 };
            }

            const url = `${API_URL}/api/curriculum/stats/overall/${userId}`;
            console.log('🔗 [ProfileService] Fetching from:', url);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('📡 [ProfileService] Response status:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('📦 [ProfileService] Raw data from API:', data);

            // 🔥 EXACT FIX: Backend returns stats with these EXACT field names
            const rawStats = data.stats || {};
            
            console.log('📦 [ProfileService] Raw stats object:', rawStats);
            
            // 🔥 CRITICAL: Backend returns:
            // - total_exercises: "18" (STRING!)
            // - total_correct: "2" (STRING!)
            // - total_topics: "10" (STRING!)
            // - success_rate: 11 (NUMBER)
            // Missing: streak, practiceTime
            
            const totalExercises = rawStats.total_exercises || rawStats.totalExercises || 0;
            const correctAnswers = rawStats.total_correct || rawStats.correctAnswers || 0;
            
            // These fields don't exist in backend, default to 0
            const currentStreak = 0;
            const totalPracticeTime = 0;

            console.log('🔍 [ProfileService] Extracted raw values:', {
                totalExercises,
                correctAnswers,
                currentStreak,
                totalPracticeTime
            });

            // 🔥 PARSE STRINGS TO NUMBERS (backend returns strings!)
            const formattedStats = {
                questionsAnswered: parseInt(totalExercises) || 0,
                correctAnswers: parseInt(correctAnswers) || 0,
                streak: parseInt(currentStreak) || 0,
                practiceTime: parseInt(totalPracticeTime) || 0
            };

            console.log('✅ [ProfileService] Formatted stats:', formattedStats);
            console.log('✅ [ProfileService] Stats types:', {
                questionsAnswered: typeof formattedStats.questionsAnswered,
                correctAnswers: typeof formattedStats.correctAnswers,
                streak: typeof formattedStats.streak,
                practiceTime: typeof formattedStats.practiceTime
            });

            return formattedStats;

        } catch (error) {
            console.error('❌ [ProfileService] Error fetching stats:', error);
            return {
                questionsAnswered: 0,
                correctAnswers: 0,
                streak: 0,
                practiceTime: 0
            };
        }
    },

    async getProfile(userId) {
        try {
            const response = await fetch(`${API_URL}/api/users/profile/${userId}`);
            if (!response.ok) return null;
            const data = await response.json();
            return data.profile || null;
        } catch (error) {
            console.error('❌ [ProfileService] Error fetching profile:', error);
            return null;
        }
    },

    async updateProfile(userId, updates) {
        try {
            const response = await fetch(`${API_URL}/api/users/profile/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            
            if (!response.ok) return false;
            return true;
        } catch (error) {
            console.error('❌ [ProfileService] Error updating profile:', error);
            return false;
        }
    }
};

export default profileService;
