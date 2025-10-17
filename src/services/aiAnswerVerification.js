// src/services/aiAnswerVerification.js - WITH BUILT-IN PRE-CHECK
class AIAnswerVerification {
    constructor() {
        this.backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
        console.log('✅ AI Verification initialized with backend:', this.backendUrl);
    }

    /**
     * Quick pre-check before calling AI
     */
    quickExactMatch(userAnswer, correctAnswer) {
        // Clean both answers
        const cleanUser = String(userAnswer).trim().replace(/\s+/g, '').toLowerCase();
        const cleanCorrect = String(correctAnswer).trim().replace(/\s+/g, '').toLowerCase();

        // Exact string match
        if (cleanUser === cleanCorrect) {
            return { isMatch: true, confidence: 100 };
        }

        // Try numeric comparison
        const userNum = parseFloat(cleanUser);
        const correctNum = parseFloat(cleanCorrect);

        if (!isNaN(userNum) && !isNaN(correctNum)) {
            const diff = Math.abs(userNum - correctNum);
            if (diff < 0.01) { // Allow tiny floating point errors
                return { isMatch: true, confidence: 100 };
            }
        }

        return { isMatch: false, confidence: 0 };
    }

    async verifyAnswer(userAnswer, correctAnswer, question, context = {}) {
        try {
            console.log('🤖 AI Verification:', { userAnswer, correctAnswer, question });

            // ✅ STEP 1: Quick pre-check
            console.log('🔍 Running pre-check...');
            const preCheck = this.quickExactMatch(userAnswer, correctAnswer);

            if (preCheck.isMatch) {
                console.log('✅ Pre-check: Exact match found! Skipping AI call.');
                return {
                    isCorrect: true,
                    confidence: 100,
                    explanation: 'תשובה נכונה מושלמת! 🎉',
                    note: null,
                    mathematicalReasoning: `התשובה שלך (${userAnswer}) זהה לתשובה הנכונה (${correctAnswer})`,
                    usedAI: false,
                    method: 'pre_check'
                };
            }

            console.log('⚠️ Pre-check: No exact match, calling AI...');

            // ✅ STEP 2: Call backend AI verification
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
            // Try AI verification (with pre-check)
            const aiResult = await this.verifyAnswer(userAnswer, correctAnswer, question, context);

            if (aiResult.usedAI || aiResult.method === 'pre_check') {
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