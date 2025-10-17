// src/services/claudeService.js - Using Backend Proxy
class ClaudeService {
    constructor() {
        // ✅ השתמש ב-Backend Proxy במקום קריאה ישירה
        this.proxyURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
        console.log('🤖 Claude Service initialized (via proxy):', this.proxyURL);
    }

    // ✨ Chat method for conversation (via backend proxy)
    async chat(messages, options = {}) {
        try {
            console.log('📤 Sending chat to backend proxy...');

            // שליחה ל-/api/ai-help endpoint
            const lastUserMessage = messages.findLast(m => m.role === 'user');
            const systemMessage = messages.find(m => m.role === 'system');

            if (!lastUserMessage) {
                throw new Error('No user message found');
            }

            // בניית הפרמטרים ל-backend
            const requestBody = {
                userMessage: lastUserMessage.content,
                question: options.question || {},
                studentSteps: options.studentSteps || [],
                context: systemMessage?.content || ''
            };

            const response = await fetch(`${this.proxyURL}/api/ai-help`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error ${response.status}`);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Backend error');
            }

            console.log('📥 Received response from backend');
            return data.response;

        } catch (error) {
            console.error('❌ Chat error:', error);

            // טיפול בשגיאות
            if (error.message.includes('fetch') || error.message.includes('network')) {
                throw new Error('לא ניתן להתחבר לשרת. וודא שהשרת רץ על http://localhost:3001');
            }

            throw error;
        }
    }

    // Generate intelligent hint (via backend)
    async generateHint(problem, userAttempt, attemptCount) {
        try {
            const response = await fetch(`${this.proxyURL}/api/generate-hint`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question: problem,
                    studentAnswer: userAttempt
                })
            });

            const data = await response.json();

            if (data.success && data.hint) {
                return data.hint;
            }

            return this.getFallbackHint(problem.topic);
        } catch (error) {
            console.error('Generate hint error:', error);
            return this.getFallbackHint(problem.topic);
        }
    }

    // Generate step-by-step explanation (via backend)
    async generateExplanation(problem, correctAnswer) {
        try {
            const response = await this.chat([
                {
                    role: 'user',
                    content: `Explain how to solve this problem step-by-step in Hebrew:\n\nQuestion: ${problem.question}\nAnswer: ${correctAnswer}\n\nProvide 3-5 clear steps.`
                }
            ]);

            return response;
        } catch (error) {
            console.error('Generate explanation error:', error);
            return 'הסבר לא זמין כרגע';
        }
    }

    // Analyze student's mistake (via backend)
    async analyzeError(problem, userAnswer, correctAnswer) {
        try {
            const response = await fetch(`${this.proxyURL}/api/verify-answer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question: problem,
                    userAnswer: userAnswer
                })
            });

            const data = await response.json();

            if (data.success && data.verification) {
                return data.verification.message || 'נסה שוב';
            }

            return 'נסה שוב ובדוק את החישוב בקפידה';
        } catch (error) {
            console.error('Analyze error:', error);
            return 'נסה שוב ובדוק את החישוב בקפידה';
        }
    }

    // Generate personalized practice problems (via backend)
    async generateSimilarProblem(problem) {
        try {
            const response = await fetch(`${this.proxyURL}/api/generate-question`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    topic: { name: problem.topic },
                    gradeConfig: { name: problem.level }
                })
            });

            const data = await response.json();

            if (data.success && data.question) {
                return {
                    question: data.question.question,
                    answer: data.question.answer
                };
            }

            return null;
        } catch (error) {
            console.error('Generate similar problem error:', error);
            return null;
        }
    }

    // Fallback hints by topic
    getFallbackHint(topic) {
        const fallbacks = {
            calculus: 'זכור את חוקי האינטגרל והנגזרת הבסיסיים',
            algebra: 'נסה לפרק את המשוואה או להעביר איברים בין האגפים',
            geometry: 'שרטט את הבעיה ובדוק אילו נוסחאות רלוונטיות',
            arithmetic: 'עבוד צעד אחר צעד לפי סדר הפעולות',
            fractions: 'מצא מכנה משותף או פשט את השברים',
            percentages: 'זכור: אחוז פירושו חלק מ-100'
        };
        return fallbacks[topic] || 'חשוב על הבעיה צעד אחר צעד';
    }

    // Parse problem response
    parseProblemResponse(response) {
        try {
            const questionMatch = response.match(/Question:\s*(.+?)(?=Answer:|$)/s);
            const answerMatch = response.match(/Answer:\s*(.+)/s);

            if (questionMatch && answerMatch) {
                return {
                    question: questionMatch[1].trim(),
                    answer: answerMatch[1].trim()
                };
            }
            return null;
        } catch (error) {
            return null;
        }
    }
}

// ייצוא instance יחיד
const claudeServiceInstance = new ClaudeService();

export const claudeService = claudeServiceInstance;
export default claudeServiceInstance;