// src/services/aiMathVerification.js
/**
 * AI-Powered Math Verification Service
 * Uses Claude API to verify mathematical answers with high accuracy
 */

const CLAUDE_API_KEY = import.meta.env.VITE_CLAUDE_API_KEY;
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

class AIMathVerification {
    constructor() {
        this.cache = new Map(); // Cache results to avoid duplicate API calls
        this.timeout = 10000; // 10 second timeout
    }

    /**
     * Verify if student's answer is mathematically equivalent to correct answer
     */
    async verifyAnswer(studentAnswer, correctAnswer, problem = null) {
        try {
            // Generate cache key
            const cacheKey = `${studentAnswer}||${correctAnswer}`;
            if (this.cache.has(cacheKey)) {
                return this.cache.get(cacheKey);
            }

            // Prepare the verification prompt
            const prompt = this.buildVerificationPrompt(studentAnswer, correctAnswer, problem);

            // Call Claude API
            const result = await this.callClaudeAPI(prompt);

            // Cache the result
            this.cache.set(cacheKey, result);

            return result;
        } catch (error) {
            console.error('❌ AI Verification Error:', error);
            // Fallback to basic comparison
            return this.fallbackVerification(studentAnswer, correctAnswer);
        }
    }

    /**
     * Build verification prompt for Claude
     */
    buildVerificationPrompt(studentAnswer, correctAnswer, problem) {
        let prompt = `You are a mathematics verification expert. Your job is to determine if a student's answer is mathematically correct.

**Problem:** ${problem?.question || 'Not provided'}

**Student's Answer:** ${studentAnswer}

**Expected Answer:** ${correctAnswer}

**Your Task:**
1. Evaluate if the student's answer is mathematically equivalent to the expected answer
2. Consider different forms: fractions, decimals, simplified forms, etc.
3. Check if 15/7 = 2.14285... = 2.14 (rounded) are all equivalent
4. Ignore minor formatting differences

**Important:**
- 15/7 and 2.14 are the SAME answer (fraction vs decimal)
- x = 5 and 5 are the SAME answer (with or without variable)
- 1/2 and 0.5 are the SAME answer
- 2x and x*2 are the SAME answer

**Response Format (JSON only):**
{
    "isCorrect": true/false,
    "confidence": 0-100,
    "explanation": "brief explanation",
    "studentForm": "how student wrote it",
    "equivalentTo": "what it equals",
    "recommendation": "feedback for student"
}

Respond ONLY with valid JSON, no other text.`;

        return prompt;
    }

    /**
     * Call Claude API
     */
    async callClaudeAPI(prompt) {
        if (!CLAUDE_API_KEY) {
            console.warn('⚠️ Claude API key not found, using fallback');
            return null;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(CLAUDE_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': CLAUDE_API_KEY,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-3-5-sonnet-20241022',
                    max_tokens: 1024,
                    messages: [{
                        role: 'user',
                        content: prompt
                    }]
                }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            const content = data.content[0].text;

            // Parse JSON response
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const result = JSON.parse(jsonMatch[0]);
                return {
                    isCorrect: result.isCorrect,
                    confidence: result.confidence,
                    explanation: result.explanation,
                    studentForm: result.studentForm,
                    equivalentTo: result.equivalentTo,
                    recommendation: result.recommendation,
                    source: 'ai'
                };
            }

            throw new Error('Invalid JSON response from AI');

        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                console.warn('⚠️ AI verification timeout');
            }
            throw error;
        }
    }

    /**
     * Fallback verification using math.js and string comparison
     */
    fallbackVerification(studentAnswer, correctAnswer) {
        try {
            // Clean answers
            const cleanStudent = this.cleanMathExpression(studentAnswer);
            const cleanCorrect = this.cleanMathExpression(correctAnswer);

            // Direct string match
            if (cleanStudent === cleanCorrect) {
                return {
                    isCorrect: true,
                    confidence: 100,
                    explanation: 'Exact match',
                    source: 'fallback'
                };
            }

            // Try to evaluate both as numbers
            const studentValue = this.evaluateExpression(cleanStudent);
            const correctValue = this.evaluateExpression(cleanCorrect);

            if (studentValue !== null && correctValue !== null) {
                const diff = Math.abs(studentValue - correctValue);
                const relativeDiff = Math.abs(diff / correctValue);

                // Allow 0.1% difference for floating point errors
                if (relativeDiff < 0.001) {
                    return {
                        isCorrect: true,
                        confidence: 95,
                        explanation: 'Numerically equivalent',
                        studentForm: studentAnswer,
                        equivalentTo: correctAnswer,
                        source: 'fallback'
                    };
                }

                // Close but not exact
                if (relativeDiff < 0.05) {
                    return {
                        isCorrect: false,
                        confidence: 70,
                        explanation: 'Close but not exact',
                        recommendation: 'Check your calculation',
                        source: 'fallback'
                    };
                }
            }

            // Not equivalent
            return {
                isCorrect: false,
                confidence: 80,
                explanation: 'Answers are different',
                recommendation: 'Try again',
                source: 'fallback'
            };

        } catch (error) {
            console.error('Fallback verification error:', error);
            return {
                isCorrect: false,
                confidence: 50,
                explanation: 'Unable to verify',
                source: 'fallback'
            };
        }
    }

    /**
     * Clean mathematical expression
     */
    cleanMathExpression(expr) {
        if (!expr) return '';

        return String(expr)
            .trim()
            .replace(/\s+/g, '')
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/^x\s*=\s*/i, '')
            .replace(/^y\s*=\s*/i, '')
            .toLowerCase();
    }

    /**
     * Try to evaluate mathematical expression to a number
     */
    evaluateExpression(expr) {
        try {
            // Handle fractions
            if (expr.includes('/')) {
                const parts = expr.split('/');
                if (parts.length === 2) {
                    const num = parseFloat(parts[0]);
                    const den = parseFloat(parts[1]);
                    if (!isNaN(num) && !isNaN(den) && den !== 0) {
                        return num / den;
                    }
                }
            }

            // Handle simple numbers
            const num = parseFloat(expr);
            if (!isNaN(num)) {
                return num;
            }

            // Try eval for simple expressions (be careful!)
            if (/^[\d\+\-\*\/\.\(\)]+$/.test(expr)) {
                return eval(expr);
            }

            return null;
        } catch (error) {
            return null;
        }
    }

    /**
     * Verify step in problem solving
     */
    async verifyStep(stepAnswer, expectedStep, stepNumber, problem) {
        try {
            const prompt = `You are verifying step ${stepNumber} of a math problem.

**Problem:** ${problem?.question || 'Not provided'}

**Student's Step ${stepNumber}:** ${stepAnswer}

**Expected at this step:** ${expectedStep || 'Progressive solution'}

**Task:** Determine if this step is correct or on the right track.

**Response Format (JSON only):**
{
    "isCorrect": true/false,
    "isProgressing": true/false,
    "confidence": 0-100,
    "feedback": "brief feedback",
    "suggestion": "what to do next"
}

Respond ONLY with valid JSON.`;

            const response = await this.callClaudeAPI(prompt);
            return response || this.fallbackStepVerification(stepAnswer, expectedStep);

        } catch (error) {
            return this.fallbackStepVerification(stepAnswer, expectedStep);
        }
    }

    /**
     * Fallback step verification
     */
    fallbackStepVerification(stepAnswer, expectedStep) {
        const cleanStep = this.cleanMathExpression(stepAnswer);
        const cleanExpected = this.cleanMathExpression(expectedStep);

        if (cleanStep === cleanExpected) {
            return {
                isCorrect: true,
                isProgressing: true,
                confidence: 100,
                feedback: 'Correct step!',
                source: 'fallback'
            };
        }

        // Check if it contains expected elements
        const hasExpectedElements = expectedStep &&
            cleanStep.includes(cleanExpected.slice(0, 3));

        return {
            isCorrect: false,
            isProgressing: hasExpectedElements,
            confidence: hasExpectedElements ? 60 : 30,
            feedback: hasExpectedElements ? 'On the right track' : 'Check your work',
            source: 'fallback'
        };
    }

    /**
     * Batch verify multiple answers (useful for optimization)
     */
    async batchVerify(pairs) {
        const results = await Promise.all(
            pairs.map(({ studentAnswer, correctAnswer, problem }) =>
                this.verifyAnswer(studentAnswer, correctAnswer, problem)
            )
        );
        return results;
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
    }
}

// Export singleton instance
export const aiMathVerification = new AIMathVerification();
export default aiMathVerification;