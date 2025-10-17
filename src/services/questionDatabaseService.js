// src/services/questionDatabaseService.js - AI INTEGRATED
import { aiQuestionService } from './aiQuestionService';

class QuestionDatabaseService {

    constructor() {
        this.questionCache = {};
        console.log('✅ Question DB Service initialized with AI');
    }

    /**
     * Main method to get a question - ALWAYS uses AI for topic relevance
     */
    async getQuestion(gradeConfig, topic, studentProfile) {
        console.log('📚 Getting AI question for:', topic.name);

        try {
            // ALWAYS generate with AI to ensure topic relevance
            const question = await aiQuestionService.getQuestionForTopic(
                topic,
                gradeConfig,
                studentProfile
            );

            console.log('✅ Question generated:', question.question);
            return question;

        } catch (error) {
            console.error('❌ Error getting question:', error);

            // Fallback to AI's fallback generator
            return aiQuestionService.generateFallbackQuestion(topic, gradeConfig);
        }
    }

    /**
     * Verify answer with AI
     */
    async verifyAnswer(userAnswer, question, studentSteps = []) {
        return await aiQuestionService.verifyWithAI(userAnswer, question, studentSteps);
    }

    /**
     * Get dynamic hint based on progress
     */
    async getHint(question, studentAnswer, attemptNumber) {
        return await aiQuestionService.generateDynamicHint(question, studentAnswer, attemptNumber);
    }

    /**
     * Get real-time feedback while typing
     */
    async getLiveFeedback(userAnswer, question) {
        return await aiQuestionService.getLiveFeedback(userAnswer, question);
    }

    /**
     * Optional: Save question to Firebase for analytics
     */
    async saveQuestionAnalytics(question, wasCorrect, timeSpent) {
        try {
            const { db } = await import('../config/firebase');
            const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');

            await addDoc(collection(db, 'question_analytics'), {
                questionText: question.question,
                topic: question.topic,
                topicId: question.topicId,
                gradeLevel: question.gradeLevel,
                wasCorrect,
                timeSpent,
                generatedByAI: question.generatedByAI || false,
                timestamp: serverTimestamp()
            });
        } catch (error) {
            // Silent fail - analytics is optional
            console.log('⚠️ Analytics not saved:', error.message);
        }
    }
}

export const questionDB = new QuestionDatabaseService();
export default questionDB;