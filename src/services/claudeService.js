// src/services/claudeService.js - CLAUDE AI INTEGRATION
class ClaudeService {
    constructor() {
        this.apiKey = import.meta.env.VITE_CLAUDE_API_KEY;
        this.apiURL = 'https://api.anthropic.com/v1/messages';
        this.model = 'claude-3-5-sonnet-20241022';
    }

    // Generate intelligent hint
    async generateHint(problem, userAttempt, attemptCount) {
        try {
            const prompt = `You are a helpful math tutor. A student is working on this problem:

Problem: ${problem.question}
Topic: ${problem.topic}
Level: ${problem.level}

Their attempt so far: ${userAttempt || 'No attempt yet'}
Number of attempts: ${attemptCount}

Provide a helpful hint in Hebrew (RTL) that guides them without giving away the answer. 
${attemptCount === 1 ? 'Start with a gentle hint.' : 'Provide a more detailed hint since they\'ve tried multiple times.'}

Keep it short (2-3 sentences max) and encouraging.`;

            const response = await this.callClaude(prompt, 200);
            return response;
        } catch (error) {
            console.error('Claude hint generation failed:', error);
            return this.getFallbackHint(problem.topic);
        }
    }

    // Generate step-by-step explanation
    async generateExplanation(problem, correctAnswer) {
        try {
            const prompt = `Explain how to solve this math problem step-by-step in Hebrew (RTL):

Problem: ${problem.question}
Topic: ${problem.topic}
Correct Answer: ${correctAnswer}

Provide a clear, educational explanation with 3-5 steps. Be concise and use mathematical notation.`;

            const response = await this.callClaude(prompt, 500);
            return response;
        } catch (error) {
            console.error('Claude explanation failed:', error);
            return 'הסבר לא זמין כרגע';
        }
    }

    // Analyze student's mistake
    async analyzeError(problem, userAnswer, correctAnswer) {
        try {
            const prompt = `Analyze this student's mistake:

Problem: ${problem.question}
Student's Answer: ${userAnswer}
Correct Answer: ${correctAnswer}

In Hebrew (RTL), briefly explain:
1. What mistake was made
2. How to correct it

Keep it to 2-3 sentences and be encouraging.`;

            const response = await this.callClaude(prompt, 200);
            return response;
        } catch (error) {
            console.error('Claude error analysis failed:', error);
            return 'נסה שוב ובדוק את החישוב בקפידה';
        }
    }

    // Generate personalized practice problems
    async generateSimilarProblem(problem) {
        try {
            const prompt = `Create a similar math problem based on this one:

Original: ${problem.question}
Topic: ${problem.topic}
Level: ${problem.level}

Generate ONE similar problem with:
- Same difficulty level
- Same mathematical concept
- Different numbers
- Include the answer

Format:
Question: [your question]
Answer: [answer]`;

            const response = await this.callClaude(prompt, 300);
            return this.parseProblemResponse(response);
        } catch (error) {
            console.error('Claude problem generation failed:', error);
            return null;
        }
    }

    // Call Claude API
    async callClaude(prompt, maxTokens = 300) {
        if (!this.apiKey) {
            throw new Error('Claude API key not configured');
        }

        const response = await fetch(this.apiURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: this.model,
                max_tokens: maxTokens,
                messages: [{
                    role: 'user',
                    content: prompt
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`Claude API error: ${response.status}`);
        }

        const data = await response.json();
        return data.content[0].text;
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
}

export const claudeService = new ClaudeService();