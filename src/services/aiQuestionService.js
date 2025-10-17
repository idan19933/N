// src/services/aiQuestionService.js - Frontend Client for AI Proxy
/**
 * ✅ Dynamic AI Question Service - Calls backend proxy
 */

class AIQuestionService {
    constructor() {
        // Backend API URL (change this to your backend URL in production)
        this.backendURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
        console.log('✅ AI Service initialized - Backend:', this.backendURL);
    }

    /**
     * Generate a question for any topic dynamically
     */
    async getQuestionForTopic(topic, gradeConfig, studentProfile) {
        console.log('🎯 Requesting AI question for:', topic.name);

        try {
            const response = await fetch(`${this.backendURL}/api/generate-question`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    topic,
                    gradeConfig,
                    studentProfile
                })
            });

            if (!response.ok) {
                throw new Error(`Backend error: ${response.status}`);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to generate question');
            }

            console.log('✅ AI Question received:', data.question.question);
            return data.question;

        } catch (error) {
            console.error('❌ AI Generation failed:', error);
            console.log('🔄 Using fallback generator...');
            return this.generateFallbackQuestion(topic, gradeConfig);
        }
    }

    /**
     * Verify answer with AI reasoning
     */
    async verifyWithAI(userAnswer, question, studentSteps = []) {
        console.log('🔍 AI Verifying answer...');

        try {
            const response = await fetch(`${this.backendURL}/api/verify-answer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userAnswer,
                    question,
                    studentSteps
                })
            });

            if (!response.ok) {
                throw new Error(`Backend error: ${response.status}`);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Verification failed');
            }

            console.log('✅ AI Verification:', data.verification);
            return data.verification;

        } catch (error) {
            console.error('❌ AI Verification failed:', error);

            // Fallback to local verification
            const { smartVerification } = await import('./smartAnswerVerification');
            return smartVerification.verifyAnswer(userAnswer, question.answer);
        }
    }

    /**
     * Generate dynamic hint based on student progress
     */
    async generateDynamicHint(question, studentAnswer, attemptNumber) {
        console.log('💡 Requesting dynamic hint...');

        try {
            const response = await fetch(`${this.backendURL}/api/generate-hint`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    question,
                    studentAnswer,
                    attemptNumber
                })
            });

            if (!response.ok) {
                throw new Error(`Backend error: ${response.status}`);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Hint generation failed');
            }

            console.log('✅ AI Hint:', data.hint);
            return data.hint;

        } catch (error) {
            console.error('❌ Hint generation failed:', error);

            // Fallback to static hints
            if (question.hints && question.hints[attemptNumber]) {
                return question.hints[attemptNumber];
            }

            return 'נסה לפרק את הבעיה לשלבים קטנים יותר 💪';
        }
    }

    /**
     * Get real-time feedback while typing
     */
    async getLiveFeedback(userAnswer, question) {
        if (!userAnswer || userAnswer.length < 2) return null;

        try {
            const response = await fetch(`${this.backendURL}/api/live-feedback`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userAnswer,
                    question
                })
            });

            if (!response.ok) {
                return null;
            }

            const data = await response.json();

            if (data.success && data.feedback) {
                return data.feedback;
            }

            return null;

        } catch (error) {
            // Silent fail for live feedback - not critical
            return null;
        }
    }

    /**
     * Fallback question generator (when AI fails)
     */
    generateFallbackQuestion(topic, gradeConfig) {
        console.log('🔄 Generating fallback question for:', topic.name);

        const topicName = topic.name.toLowerCase();

        // Smart fallback based on topic
        if (topicName.includes('גרף') || topicName.includes('פונקצי')) {
            return this.generateGraphFallback();
        } else if (topicName.includes('משוואה ריבועי')) {
            return this.generateQuadraticFallback();
        } else if (topicName.includes('נגזר')) {
            return this.generateDerivativeFallback();
        } else if (topicName.includes('משולש') || topicName.includes('דמיון')) {
            return this.generateTriangleFallback();
        } else if (topicName.includes('אחוז')) {
            return this.generatePercentageFallback();
        } else {
            return this.generateEquationFallback();
        }
    }

    generateGraphFallback() {
        const slope = Math.floor(Math.random() * 10) - 5;
        const intercept = Math.floor(Math.random() * 20) - 10;

        return {
            question: `בגרף של y = ${slope}x + ${intercept}, מה נקודת החיתוך עם ציר Y?`,
            answer: intercept.toString(),
            hints: [
                'נקודת החיתוך עם ציר Y היא כאשר x = 0',
                'הצב x = 0 בפונקציה',
                'התשובה היא המקדם החופשי'
            ],
            steps: [
                `y = ${slope}x + ${intercept}`,
                'כאשר x = 0:',
                `y = ${slope}(0) + ${intercept} = ${intercept}`
            ],
            explanation: 'נקודת החיתוך עם ציר Y נמצאת בהצבת x = 0'
        };
    }

    generateQuadraticFallback() {
        const a = 1;
        const b = -(Math.floor(Math.random() * 5) + Math.floor(Math.random() * 5) + 2);
        const c = Math.floor(Math.random() * 10) + 1;
        const x1 = Math.floor(Math.random() * 5) + 1;
        const x2 = Math.floor(Math.random() * 5) + 1;

        return {
            question: `פתור: x² - ${x1 + x2}x + ${x1 * x2} = 0`,
            answer: `x = ${x1} או x = ${x2}`,
            hints: [
                'נסה לפרק לגורמים',
                `מצא מספרים שמכפלתם ${x1 * x2} וסכומם ${x1 + x2}`,
                `(x - ${x1})(x - ${x2}) = 0`
            ],
            steps: [
                `x² - ${x1 + x2}x + ${x1 * x2} = 0`,
                `(x - ${x1})(x - ${x2}) = 0`,
                `x = ${x1} או x = ${x2}`
            ],
            explanation: 'פירוק לגורמים ופתרון משוואה ריבועית'
        };
    }

    generateDerivativeFallback() {
        const n = Math.floor(Math.random() * 4) + 2;
        const a = Math.floor(Math.random() * 5) + 1;

        return {
            question: `מה הנגזרת של f(x) = ${a}x^${n}?`,
            answer: `${a * n}x^${n - 1}`,
            hints: [
                'השתמש בכלל: (x^n)′ = n·x^(n-1)',
                `הורד את החזקה ${n} וכפול ב-${a}`,
                'הפחת 1 מהחזקה'
            ],
            steps: [
                `f(x) = ${a}x^${n}`,
                `f'(x) = ${a} · ${n} · x^${n - 1}`,
                `f'(x) = ${a * n}x^${n - 1}`
            ],
            explanation: 'כלל הגזירה הבסיסי'
        };
    }

    generateTriangleFallback() {
        const ratios = [[1, 2], [2, 3], [3, 4], [1, 3]];
        const [a, b] = ratios[Math.floor(Math.random() * ratios.length)];

        return {
            question: `שני משולשים דומים ביחס ${a}:${b}. מה יחס השטחים?`,
            answer: `${a * a}:${b * b}`,
            hints: [
                'יחס השטחים = (יחס הצלעות)²',
                `(${a}:${b})² = ?`
            ],
            steps: [
                `יחס הצלעות: ${a}:${b}`,
                `יחס שטחים = (${a}:${b})²`,
                `= ${a * a}:${b * b}`
            ],
            explanation: 'יחס שטחים במשולשים דומים'
        };
    }

    generatePercentageFallback() {
        const percent = [10, 20, 25, 50, 75][Math.floor(Math.random() * 5)];
        const base = Math.floor(Math.random() * 100) + 50;
        const answer = (percent / 100) * base;

        return {
            question: `מה זה ${percent}% מ-${base}?`,
            answer: answer.toString(),
            hints: [
                `${percent}% = ${percent / 100}`,
                `כפול ${base} ב-${percent / 100}`
            ],
            steps: [
                `${percent}% מ-${base}`,
                `= ${percent / 100} × ${base}`,
                `= ${answer}`
            ],
            explanation: 'חישוב אחוזים'
        };
    }

    generateEquationFallback() {
        const x = Math.floor(Math.random() * 10) + 1;
        const a = Math.floor(Math.random() * 10) + 2;
        const b = Math.floor(Math.random() * 20) + 1;
        const c = a * x + b;

        return {
            question: `פתור: ${a}x + ${b} = ${c}`,
            answer: x.toString(),
            hints: [
                `העבר ${b} לצד שני`,
                `חלק ב-${a}`
            ],
            steps: [
                `${a}x + ${b} = ${c}`,
                `${a}x = ${c - b}`,
                `x = ${x}`
            ],
            explanation: 'פתרון משוואה לינארית'
        };
    }
}

export const aiQuestionService = new AIQuestionService();
export default aiQuestionService;