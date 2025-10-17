// src/services/aiAnswerVerification.js - USES BACKEND PROXY
class AIAnswerVerification {
    constructor() {
        this.backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
        console.log('✅ AI Verification initialized with backend:', this.backendUrl);
    }

    async verifyAnswer(userAnswer, correctAnswer, question, context = {}) {
        try {
            console.log('🤖 AI Verification via Backend:', { userAnswer, correctAnswer, question });

            const response = await fetch(`${this.backendUrl}/api/verify-answer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userAnswer,
                    correctAnswer,
                    question,
                    context
                })
            });

            if (!response.ok) {
                throw new Error(`Backend error: ${response.status}`);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Verification failed');
            }

            console.log('✅ AI Verification result:', {
                isCorrect: data.isCorrect,
                confidence: data.confidence
            });

            return {
                isCorrect: data.isCorrect,
                confidence: data.confidence,
                explanation: data.explanation,
                note: data.note,
                mathematicalReasoning: data.mathematicalReasoning,
                usedAI: data.usedAI
            };

        } catch (error) {
            console.error('❌ AI Verification Error:', error);
            return {
                isCorrect: false,
                confidence: 0,
                explanation: 'לא הצלחתי לבדוק את התשובה עם AI',
                note: 'משתמש במערכת בדיקה חלופית',
                usedAI: false,
                error: error.message
            };
        }
    }

    async quickVerify(userAnswer, correctAnswer, question) {
        const result = await this.verifyAnswer(userAnswer, correctAnswer, question);
        return result.isCorrect;
    }

    async verifyWithFallback(userAnswer, correctAnswer, question, fallbackVerifier, context = {}) {
        try {
            // Try AI verification via backend
            const aiResult = await this.verifyAnswer(userAnswer, correctAnswer, question, context);

            if (aiResult.usedAI) {
                return aiResult;
            }

            // AI failed, use fallback
            console.log('⚠️ AI verification unavailable, using fallback');
            const fallbackResult = fallbackVerifier.verifyAnswer(userAnswer, correctAnswer);

            return {
                ...fallbackResult,
                usedAI: false,
                fallbackUsed: true
            };

        } catch (error) {
            console.error('❌ Verification failed:', error);
            const fallbackResult = fallbackVerifier.verifyAnswer(userAnswer, correctAnswer);
            return {
                ...fallbackResult,
                usedAI: false,
                fallbackUsed: true,
                error: error.message
            };
        }
    }
}

export const aiVerification = new AIAnswerVerification();
export default aiVerification;