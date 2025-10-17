// server/ai-proxy.js - UPGRADED WITH BETTER VERIFICATION
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_MODEL = 'claude-3-haiku-20240307';

function buildQuestionPrompt(topic, gradeConfig) {
    return `You are a math teacher for Israeli students.

Topic: ${topic.name}
Grade: ${gradeConfig?.name || 'Unknown'}

Generate ONE question DIRECTLY about "${topic.name}".

Examples:
- "גרפים של פונקציות" → "בגרף y = 2x + 3, מה נקודת החיתוך עם ציר Y?"
- "משוואות ריבועיות" → "פתור: x² - 5x + 6 = 0"
- "נגזרות" → "מה הנגזרת של f(x) = 3x²?"

Return ONLY JSON (no markdown):
{
    "question": "השאלה בעברית",
    "answer": "התשובה",
    "hints": ["רמז 1", "רמז 2"],
    "steps": ["שלב 1", "שלב 2"],
    "explanation": "הסבר"
}`;
}

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        apiKey: CLAUDE_API_KEY ? '✅ Ready' : '❌ Missing',
        model: CLAUDE_MODEL
    });
});

app.post('/api/generate-question', async (req, res) => {
    try {
        const { topic, gradeConfig } = req.body;

        console.log('📝 Request:', topic?.name);

        if (!topic?.name) {
            return res.status(400).json({ success: false, error: 'Topic required' });
        }

        if (!CLAUDE_API_KEY) {
            console.error('❌ No API key');
            return res.status(503).json({ success: false, error: 'AI not configured' });
        }

        const prompt = buildQuestionPrompt(topic, gradeConfig);

        console.log('🤖 Calling Claude with model:', CLAUDE_MODEL);

        const response = await fetch(CLAUDE_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': CLAUDE_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: CLAUDE_MODEL,
                max_tokens: 1024,
                messages: [{ role: 'user', content: prompt }]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Claude Error:', response.status, errorText);

            return res.json({
                success: true,
                question: {
                    question: `שאלה לדוגמה על ${topic.name}: 5 + 3 = ?`,
                    answer: '8',
                    hints: ['חבר את המספרים'],
                    steps: ['5 + 3', '= 8'],
                    explanation: 'חיבור פשוט',
                    topic: topic.name,
                    generatedByAI: false,
                    fallback: true
                }
            });
        }

        const data = await response.json();
        const text = data.content[0].text;

        console.log('📥 Claude Response:', text.substring(0, 100));

        const jsonMatch = text.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {
            console.error('❌ No JSON in response');
            throw new Error('Invalid response format');
        }

        const questionData = JSON.parse(jsonMatch[0]);

        console.log('✅ Generated:', questionData.question.substring(0, 50) + '...');

        res.json({
            success: true,
            question: {
                ...questionData,
                topic: topic.name,
                topicId: topic.id,
                generatedByAI: true,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('❌ Full Error:', error);

        const { topic } = req.body;
        res.json({
            success: true,
            question: {
                question: `שאלה לדוגמה: 10 + 5 = ?`,
                answer: '15',
                hints: ['חבר את המספרים'],
                steps: ['10 + 5', '= 15'],
                explanation: 'חיבור פשוט',
                topic: topic?.name || 'מתמטיקה',
                generatedByAI: false,
                fallback: true
            }
        });
    }
});

// ✅ IMPROVED VERIFICATION ENDPOINT
app.post('/api/verify-answer', async (req, res) => {
    try {
        const { userAnswer, correctAnswer, question, context } = req.body;

        console.log('🔍 Verify Request:', { userAnswer, correctAnswer, question });

        if (!CLAUDE_API_KEY) {
            return res.status(503).json({ success: false, error: 'AI not configured' });
        }

        const prompt = `You are an expert math teacher. Verify if the student's answer is mathematically correct.

<question>
${question}
</question>

<student_answer>
${userAnswer}
</student_answer>

<expected_answer>
${correctAnswer}
(WARNING: This might be WRONG! Don't trust it - solve the problem yourself!)
</expected_answer>

CRITICAL INSTRUCTIONS:
1. DO NOT trust the expected_answer - it might be wrong!
2. SOLVE the problem yourself step by step
3. COMPARE your solution to the student's answer
4. For equations: SUBSTITUTE the student's answer into the original equation and verify both sides are equal
5. For quadratic equations: Check if all solutions are provided
6. For calculations: Calculate the result yourself and compare

EXAMPLES:

Example 1 - Simple calculation:
Question: Calculate 5 × 3 + 2
Student: 15
Your solution: 5 × 3 = 15, then 15 + 2 = 17
Comparison: 15 ≠ 17
Conclusion: Student forgot the +2
Return: {"isCorrect": false, "confidence": 100, "explanation": "חישבת 5×3 נכון אבל שכחת להוסיף 2", "alternativeAnswer": "17"}

Example 2 - Equation:
Question: Solve 3x + 5 = 2x - 7
Student: x = -12
Your solution: 3x - 2x = -7 - 5 → x = -12
Verification: Substitute x = -12 into original equation
  Left: 3(-12) + 5 = -36 + 5 = -31
  Right: 2(-12) - 7 = -24 - 7 = -31
  Check: -31 = -31 ✅ Equal!
Conclusion: Student is correct!
Return: {"isCorrect": true, "confidence": 100, "explanation": "מעולה! פתרת נכון"}

Example 3 - Substitution:
Question: Calculate 2x + 3 when x = 5
Student: 13
Your solution: 2(5) + 3 = 10 + 3 = 13
Comparison: 13 = 13 ✅
Conclusion: Correct!
Return: {"isCorrect": true, "confidence": 100, "explanation": "פתרת נכון"}

Example 4 - Square root addition (IMPORTANT):
Question: Calculate √8 + √5
Student: 3
Your solution: √8 = 2√2 ≈ 2.83, √5 ≈ 2.24
  √8 + √5 ≈ 5.07
  Cannot simplify further! √a + √b ≠ √(a+b)
Comparison: 3 ≠ 5.07
Conclusion: Student is wrong
Return: {"isCorrect": false, "confidence": 100, "explanation": "לא ניתן לחבר שורשים ככה! √8 + √5 = 2√2 + √5 (לא ניתן לפשט יותר)", "alternativeAnswer": "2√2 + √5 או בערך 5.07"}

RETURN ONLY VALID JSON:
{"isCorrect": true/false, "confidence": 95-100, "explanation": "הסבר קצר בעברית", "mathematicalReasoning": "כל החישוב המלא", "hint": "רמז או null", "alternativeAnswer": "תשובה נכונה או null"}

Now verify the student's answer:`;

        const response = await fetch(CLAUDE_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': CLAUDE_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: CLAUDE_MODEL,
                max_tokens: 2000,
                temperature: 0, // Zero for maximum accuracy
                messages: [{ role: 'user', content: prompt }]
            })
        });

        if (!response.ok) {
            throw new Error(`Claude API error: ${response.status}`);
        }

        const data = await response.json();
        const text = data.content[0].text;

        console.log('📥 AI Response:', text.substring(0, 200));

        const jsonMatch = text.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {
            console.error('❌ No JSON found');
            throw new Error('No JSON in response');
        }

        const verification = JSON.parse(jsonMatch[0]);

        console.log('✅ Verification:', verification.isCorrect, '-', verification.confidence);

        res.json({
            success: true,
            isCorrect: verification.isCorrect,
            confidence: verification.confidence || (verification.isCorrect ? 100 : 0),
            explanation: verification.explanation || 'בדיקת AI',
            mathematicalReasoning: verification.mathematicalReasoning || null,
            note: verification.hint || verification.alternativeAnswer || null,
            usedAI: true
        });

    } catch (error) {
        console.error('❌ Verification Error:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            usedAI: false
        });
    }
});

app.post('/api/generate-hint', async (req, res) => {
    try {
        const { question, studentAnswer } = req.body;

        if (!CLAUDE_API_KEY) {
            return res.status(503).json({ success: false, error: 'AI not configured' });
        }

        const prompt = `Question: ${question.question}
Answer: ${question.answer}
Student tried: ${studentAnswer || 'nothing'}

Give 1-2 sentence hint in Hebrew.`;

        const response = await fetch(CLAUDE_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': CLAUDE_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: CLAUDE_MODEL,
                max_tokens: 256,
                messages: [{ role: 'user', content: prompt }]
            })
        });

        const data = await response.json();
        const hint = data.content[0].text.trim();

        res.json({ success: true, hint });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.post('/api/live-feedback', async (req, res) => {
    res.json({ success: true, feedback: null });
});

// ✅ AI HELP
app.post('/api/ai-help', async (req, res) => {
    try {
        const { question, studentSteps, userMessage } = req.body;

        console.log('💬 AI Help Request:', userMessage);

        if (!CLAUDE_API_KEY) {
            return res.json({
                success: true,
                response: 'אני כאן לעזור! מה אתה רוצה לדעת על השאלה?'
            });
        }

        const wantsFullSolution =
            userMessage.includes('הראה') ||
            userMessage.includes('פתרון') ||
            userMessage.includes('דרך') ||
            userMessage.includes('מלא') ||
            userMessage.includes('שלבים');

        let prompt;

        if (wantsFullSolution) {
            prompt = `You are a helpful math tutor. The student asked for the COMPLETE SOLUTION.

Question: ${question.question || question}
Correct Answer: ${question.answer || 'unknown'}
Student's work so far: ${studentSteps?.join(', ') || 'none'}

Give the FULL solution in Hebrew with numbered steps.`;

        } else {
            prompt = `You are a helpful math tutor.

Question: ${question.question || question}
Student asks: ${userMessage}

Give a helpful hint in Hebrew (2-4 sentences). Don't give the full answer yet.`;
        }

        const response = await fetch(CLAUDE_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': CLAUDE_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: CLAUDE_MODEL,
                max_tokens: wantsFullSolution ? 800 : 300,
                messages: [{ role: 'user', content: prompt }]
            })
        });

        if (!response.ok) {
            throw new Error('Claude API error');
        }

        const data = await response.json();
        const aiResponse = data.content[0].text.trim();

        console.log('✅ AI Response sent');

        res.json({
            success: true,
            response: aiResponse
        });

    } catch (error) {
        console.error('❌ AI Help Error:', error);
        res.json({
            success: true,
            response: 'אני כאן לעזור! נסה לשאול שאלה יותר ספציפית.'
        });
    }
});

app.listen(PORT, () => {
    console.log('\n' + '='.repeat(50));
    console.log('🚀 AI Proxy Server');
    console.log('='.repeat(50));
    console.log(`📍 Running: http://localhost:${PORT}`);
    console.log(`🔑 API Key: ${CLAUDE_API_KEY ? '✅ Ready' : '❌ Missing'}`);
    console.log(`🤖 Model: ${CLAUDE_MODEL}`);
    console.log(`🌐 Health: http://localhost:${PORT}/health`);
    console.log('='.repeat(50) + '\n');

    if (!CLAUDE_API_KEY) {
        console.warn('⚠️  Create server/.env with:\n');
        console.warn('CLAUDE_API_KEY=sk-ant-api03-YOUR-KEY\n');
    }
});