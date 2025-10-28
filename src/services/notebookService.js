// src/services/notebookService.js - FIXED TO SAVE ALL EXERCISES
import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'https://nexons-production-1915.up.railway.app';

export const notebookService = {
    /**
     * Save exercise to notebook (works for BOTH correct and incorrect answers)
     * @param {string} userId - User ID
     * @param {Object} exerciseData - Exercise data
     * @returns {Promise<Object>} Response data
     */
    async saveExercise(userId, exerciseData) {
        try {
            console.log('💾 Saving exercise:', { userId, exerciseData });

            const response = await axios.post(`${API_URL}/api/notebook/save-exercise`, {
                userId,
                exerciseData: {
                    question: exerciseData.question,
                    userAnswer: exerciseData.userAnswer,
                    correctAnswer: exerciseData.correctAnswer,
                    isCorrect: exerciseData.isCorrect, // CRITICAL: This tracks if answer is correct or not
                    topic: exerciseData.topic,
                    subtopic: exerciseData.subtopic || null,
                    difficulty: exerciseData.difficulty || 'medium',
                    timeSpent: exerciseData.timeSpent || 0
                }
            });

            console.log('✅ Exercise saved successfully:', response.data);

            return {
                success: true,
                data: response.data
            };

        } catch (error) {
            console.error('❌ Error saving exercise:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    /**
     * Get all exercises for a user
     * @param {string} userId - User ID
     * @returns {Promise<Array>} Array of exercises
     */
    async getUserExercises(userId) {
        try {
            const response = await axios.get(`${API_URL}/api/notebook/exercises/${userId}`);
            return response.data.exercises || [];
        } catch (error) {
            console.error('❌ Error fetching exercises:', error);
            return [];
        }
    },

    /**
     * Get exercises by topic
     * @param {string} userId - User ID
     * @param {string} topic - Topic name
     * @returns {Promise<Array>} Array of exercises
     */
    async getExercisesByTopic(userId, topic) {
        try {
            const response = await axios.get(`${API_URL}/api/notebook/exercises/${userId}/${topic}`);
            return response.data.exercises || [];
        } catch (error) {
            console.error('❌ Error fetching exercises by topic:', error);
            return [];
        }
    },

    /**
     * Delete an exercise
     * @param {string} exerciseId - Exercise ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteExercise(exerciseId) {
        try {
            await axios.delete(`${API_URL}/api/notebook/exercise/${exerciseId}`);
            return true;
        } catch (error) {
            console.error('❌ Error deleting exercise:', error);
            return false;
        }
    },

    /**
     * Get user stats (from curriculum endpoint)
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Stats object
     */
    async getUserStats(userId) {
        try {
            const response = await axios.get(`${API_URL}/api/curriculum/stats/overall/${userId}`);
            return {
                questionsAnswered: response.data.totalExercises || 0,
                correctAnswers: response.data.correctAnswers || 0,
                streak: response.data.currentStreak || 0,
                practiceTime: response.data.totalPracticeTime || 0
            };
        } catch (error) {
            console.error('❌ Error fetching stats:', error);
            return {
                questionsAnswered: 0,
                correctAnswers: 0,
                streak: 0,
                practiceTime: 0
            };
        }
    }
};

export default notebookService;
