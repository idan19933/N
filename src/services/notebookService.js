// src/services/notebookService.js - FRONTEND NOTEBOOK API
import axios from 'axios';

const API_URL = 'http://localhost:3001';

class NotebookAPI {
    async saveExercise(userId, exerciseData) {
        try {
            console.log('?? Saving exercise to notebook:', {
                userId,
                question: exerciseData.question?.substring(0, 50) + '...',
                isCorrect: exerciseData.isCorrect
            });

            const response = await axios.post(`${API_URL}/api/notebook/save-exercise`, {
                userId,
                exerciseData: {
                    question: exerciseData.question,
                    answer: exerciseData.answer,
                    studentAnswer: exerciseData.studentAnswer,
                    isCorrect: exerciseData.isCorrect,
                    topic: exerciseData.topic || '????',
                    subtopic: exerciseData.subtopic || ''
                }
            });

            if (response.data.success) {
                console.log('? Exercise saved to notebook');
                return response.data;
            } else {
                console.error('? Failed to save exercise:', response.data.error);
                return { success: false, error: response.data.error };
            }
        } catch (error) {
            console.error('? Notebook save error:', error);
            return { success: false, error: error.message };
        }
    }

    async getEntries(userId, filters = {}) {
        try {
            const params = new URLSearchParams({ userId, ...filters });
            const response = await axios.get(`${API_URL}/api/notebook/entries?${params}`);
            return response.data;
        } catch (error) {
            console.error('? Get entries error:', error);
            return { success: false, error: error.message };
        }
    }

    async getRecentEntries(userId, limit = 5) {
        try {
            const response = await axios.get(`${API_URL}/api/notebook/recent`, {
                params: { userId, limit }
            });
            return response.data;
        } catch (error) {
            console.error('? Get recent entries error:', error);
            return { success: false, error: error.message };
        }
    }

    async getStats(userId) {
        try {
            const response = await axios.get(`${API_URL}/api/notebook/stats`, {
                params: { userId }
            });
            return response.data;
        } catch (error) {
            console.error('? Get stats error:', error);
            return { success: false, error: error.message };
        }
    }

    async deleteEntry(entryId, userId) {
        try {
            const response = await axios.delete(`${API_URL}/api/notebook/entry/${entryId}`, {
                data: { userId }
            });
            return response.data;
        } catch (error) {
            console.error('? Delete entry error:', error);
            return { success: false, error: error.message };
        }
    }

    async getEntriesByTopic(userId, topicId) {
        try {
            const response = await axios.get(`${API_URL}/api/notebook/topic/${topicId}`, {
                params: { userId }
            });
            return response.data;
        } catch (error) {
            console.error('? Get topic entries error:', error);
            return { success: false, error: error.message };
        }
    }
}

export default new NotebookAPI();

