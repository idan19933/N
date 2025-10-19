// server/ai-proxy.js - COMPLETE AI PROXY WITH SMART FULL SOLUTION CHAT
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import personalitySystem from './services/personalityLoader.js';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// ==================== MULTER CONFIGURATION ====================
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, 'personality-system.xlsx');
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            file.mimetype === 'application/vnd.ms-excel') {
            cb(null, true);
        } else {
            cb(new Error('Only Excel files allowed!'), false);
        }
    }
});

// ==================== HEALTH CHECK ====================
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Nexon AI Server Running',
        personalityLoaded: personalitySystem.loaded
    });
});

// ==================== ADMIN: UPLOAD PERSONALITY EXCEL ====================
app.post('/api/admin/upload-personality', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        console.log('📁 Uploaded file:', req.file.filename);

        const loaded = personalitySystem.loadFromExcel(req.file.path);

        if (loaded) {
            res.json({
                success: true,
                message: 'Personality system uploaded and loaded successfully!',
                stats: {
                    examples: personalitySystem.data.examplesBank.length,
                    topics: personalitySystem.data.topicGuidelines.length,
                    hints: personalitySystem.data.hintSystem.length,
                    errors: personalitySystem.data.errorPatterns.length,
                    encouragements: personalitySystem.data.encouragementLibrary.length,
                    templates: personalitySystem.data.questionTemplates.length
                }
            });
        } else {
            res.status(500).json({ success: false, error: 'Failed to load personality system' });
        }
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== ADMIN: GET PERSONALITY STATUS ====================
app.get('/api/admin/personality-status', (req, res) => {
    res.json({
        loaded: personalitySystem.loaded,
        stats: personalitySystem.loaded ? {
            examples: personalitySystem.data.examplesBank.length,
            topics: personalitySystem.data.topicGuidelines.length,
            hints: personalitySystem.data.hintSystem.length,
            errors: personalitySystem.data.errorPatterns.length,
            encouragements: personalitySystem.data.encouragementLibrary.length,
            templates: personalitySystem.data.questionTemplates.length,
            corePersonality: personalitySystem.data.corePersonality
        } : null
    });
});

// ==================== DYNAMIC QUESTION GENERATION ====================
app.post('/api/ai/generate-question', async (req, res) => {
    try {
        const { topic, subtopic, difficulty, studentProfile } = req.body;

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📝 PERSONALITY-BASED QUESTION GENERATION');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('   Student:', studentProfile.name);
        console.log('   Grade:', studentProfile.grade);
        console.log('   Topic:', topic.name);
        console.log('   Subtopic:', subtopic?.name || 'General');
        console.log('   Difficulty:', difficulty);
        console.log('   Personality System:', personalitySystem.loaded ? '✅ Active' : '❌ Not Loaded');

        const systemPrompt = personalitySystem.loaded
            ? personalitySystem.buildSystemPrompt(studentProfile)
            : buildSystemPrompt(studentProfile);

        const prompt = personalitySystem.loaded
            ? personalitySystem.buildQuestionPrompt(topic, subtopic, difficulty, studentProfile)
            : buildDynamicQuestionPrompt(topic, subtopic, difficulty, studentProfile);

        if (personalitySystem.loaded) {
            const examples = personalitySystem.getExamplesForTopic(topic.name, difficulty);
            console.log(`   📚 Using ${examples.length} example(s) from personality system`);
        }

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        if (process.env.ANTHROPIC_API_KEY) {
            console.log('🤖 Using Claude 3.5 Haiku for question generation...');

            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': process.env.ANTHROPIC_API_KEY,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-3-5-haiku-20241022',
                    max_tokens: 3000,
                    temperature: 0.8,
                    system: systemPrompt,
                    messages: [{ role: 'user', content: prompt }]
                })
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('❌ Claude API error:', data.error);
                throw new Error(data.error?.message || 'Claude API error');
            }

            try {
                const rawText = data.content[0].text;
                console.log('📥 Claude raw response (first 200 chars):', rawText.substring(0, 200));

                let jsonText = rawText.trim();

                if (jsonText.startsWith('```json')) {
                    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
                } else if (jsonText.startsWith('```')) {
                    jsonText = jsonText.replace(/```\n?/g, '');
                }

                const jsonStart = jsonText.indexOf('{');
                const jsonEnd = jsonText.lastIndexOf('}') + 1;

                if (jsonStart !== -1 && jsonEnd > jsonStart) {
                    jsonText = jsonText.substring(jsonStart, jsonEnd);
                }

                const parsed = JSON.parse(jsonText);

                console.log('✅ Question generated with personality system!');
                console.log('   Question:', parsed.question.substring(0, 60) + '...');
                console.log('   Answer:', parsed.correctAnswer);
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

                return res.json({
                    success: true,
                    question: {
                        question: parsed.question,
                        correctAnswer: parsed.correctAnswer,
                        hints: parsed.hints || [],
                        explanation: parsed.explanation || '',
                        topic: topic.name,
                        subtopic: subtopic?.name,
                        difficulty: parsed.difficulty || difficulty,
                        gradeLevel: studentProfile.grade
                    },
                    model: 'claude-3.5-haiku',
                    generatedDynamically: true,
                    personalityActive: personalitySystem.loaded
                });
            } catch (parseError) {
                console.error('❌ Parse error:', parseError);
                console.error('Raw response:', data.content[0].text);
                throw parseError;
            }
        }

        if (process.env.OPENAI_API_KEY) {
            console.log('🤖 Using GPT-4 for question generation...');

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'gpt-4',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.8,
                    max_tokens: 2000
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error?.message || 'OpenAI error');
            }

            try {
                const parsed = JSON.parse(data.choices[0].message.content);

                return res.json({
                    success: true,
                    question: {
                        question: parsed.question,
                        correctAnswer: parsed.correctAnswer,
                        hints: parsed.hints || [],
                        explanation: parsed.explanation || '',
                        topic: topic.name,
                        subtopic: subtopic?.name
                    },
                    model: 'gpt-4',
                    generatedDynamically: true,
                    personalityActive: personalitySystem.loaded
                });
            } catch (parseError) {
                console.error('❌ Parse error:', parseError);
                throw parseError;
            }
        }

        throw new Error('No AI API configured');

    } catch (error) {
        console.error('❌ Question generation error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ==================== DYNAMIC ANSWER VERIFICATION ====================
app.post('/api/ai/verify-answer', async (req, res) => {
    try {
        const { question, userAnswer, correctAnswer, studentName, grade, topic, subtopic } = req.body;

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔍 SMART ANSWER VERIFICATION');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('   Student:', studentName);
        console.log('   Question:', question.substring(0, 60) + '...');
        console.log('   User Answer:', userAnswer);
        console.log('   Expected:', correctAnswer);
        console.log('   Topic:', topic);
        console.log('   Subtopic:', subtopic);
        console.log('   Personality System:', personalitySystem.loaded ? '✅ Active' : '❌ Not Loaded');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        const prompt = personalitySystem.loaded
            ? personalitySystem.buildVerificationPrompt(question, userAnswer, correctAnswer, topic)
            : buildVerificationPrompt(question, userAnswer, correctAnswer, topic, subtopic, grade);

        if (process.env.ANTHROPIC_API_KEY) {
            console.log('🤖 Using Claude 3.5 Haiku for smart verification...');

            const systemPromptText = personalitySystem.loaded
                ? `אתה ${personalitySystem.data.corePersonality.teacher_name}, מורה מתמטיקה מומחה. אתה בודק תשובות בצורה מדויקת, מזהה שקילות מתמטית, ומספק משוב מעודד ומדויק. החזר תמיד JSON תקין בלבד, ללא טקסט נוסף לפני או אחרי ה-JSON.`
                : `אתה נקסון, מורה מתמטיקה מומחה. אתה בודק תשובות בצורה מדויקת, מזהה שקילות מתמטית, ומספק משוב מעודד ומדויק. החזר תמיד JSON תקין בלבד, ללא טקסט נוסף לפני או אחרי ה-JSON.`;

            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': process.env.ANTHROPIC_API_KEY,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-3-5-haiku-20241022',
                    max_tokens: 1500,
                    temperature: 0.3,
                    system: systemPromptText,
                    messages: [{ role: 'user', content: prompt }]
                })
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('❌ Claude API error:', data.error);
                throw new Error(data.error?.message || 'Claude API error');
            }

            try {
                const rawText = data.content[0].text;
                console.log('📥 Claude raw response (first 200 chars):', rawText.substring(0, 200));

                let jsonText = rawText.trim();

                if (jsonText.startsWith('```json')) {
                    jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
                } else if (jsonText.startsWith('```')) {
                    jsonText = jsonText.replace(/```\n?/g, '');
                }

                const jsonStart = jsonText.indexOf('{');
                const jsonEnd = jsonText.lastIndexOf('}') + 1;

                if (jsonStart !== -1 && jsonEnd > jsonStart) {
                    jsonText = jsonText.substring(jsonStart, jsonEnd);
                }

                const parsed = JSON.parse(jsonText);

                if (typeof parsed.isCorrect !== 'boolean') {
                    throw new Error('Missing or invalid isCorrect field');
                }

                console.log('✅ Verification complete:', parsed.isCorrect ? 'CORRECT' : 'INCORRECT');
                if (parsed.isPartial) console.log('   Partial credit detected');
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

                let feedback = parsed.feedback;
                if (personalitySystem.loaded) {
                    let situation = 'correct_first_try';
                    if (!parsed.isCorrect) {
                        situation = 'wrong_answer_first';
                    } else if (parsed.isPartial) {
                        situation = 'partially_correct';
                    }

                    const personalizedFeedback = personalitySystem.getEncouragement(situation);
                    if (personalizedFeedback) {
                        feedback = personalizedFeedback.replace('תלמיד', studentName);
                    }
                }

                return res.json({
                    success: true,
                    isCorrect: parsed.isCorrect,
                    isPartial: parsed.isPartial || false,
                    confidence: parsed.confidence || 95,
                    feedback: feedback || (parsed.isCorrect ? 'נכון!' : 'לא נכון'),
                    explanation: parsed.explanation || '',
                    whatCorrect: parsed.whatCorrect || null,
                    whatMissing: parsed.whatMissing || null,
                    model: 'claude-3.5-haiku-20241022',
                    personalityActive: personalitySystem.loaded
                });
            } catch (parseError) {
                console.error('❌ JSON Parse error:', parseError.message);
                console.error('Raw response:', data.content[0].text);

                const rawText = data.content[0].text;
                const lowerText = rawText.toLowerCase();
                const seemsCorrect = lowerText.includes('נכון') || lowerText.includes('correct');

                console.log('⚠️ Using fallback interpretation:', seemsCorrect ? 'CORRECT' : 'INCORRECT');

                return res.json({
                    success: true,
                    isCorrect: seemsCorrect,
                    isPartial: false,
                    confidence: 60,
                    feedback: seemsCorrect ? 'נכון!' : 'נסה שוב',
                    explanation: rawText.substring(0, 200),
                    model: 'claude-3.5-haiku-20241022',
                    fallback: true,
                    personalityActive: personalitySystem.loaded
                });
            }
        }

        if (process.env.OPENAI_API_KEY) {
            console.log('🤖 Using GPT-4 for verification...');

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'gpt-4',
                    messages: [
                        { role: 'system', content: 'אתה מורה מתמטיקה מומחה. בדוק תשובות בדיוק. החזר JSON תקין בלבד.' },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.3,
                    max_tokens: 1000
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error?.message || 'OpenAI error');
            }

            const parsed = JSON.parse(data.choices[0].message.content);
            return res.json({
                success: true,
                ...parsed,
                model: 'gpt-4',
                personalityActive: personalitySystem.loaded
            });
        }

        throw new Error('No AI API configured');

    } catch (error) {
        console.error('❌ Verification error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ==================== GET HINT ====================
app.post('/api/ai/get-hint', async (req, res) => {
    try {
        const { question, hintIndex, studentProfile } = req.body;

        console.log(`💡 Generating hint ${hintIndex + 1} for:`, studentProfile?.name);

        let hintStyle = null;
        if (personalitySystem.loaded) {
            const difficulty = hintIndex === 0 ? 'easy' : hintIndex === 1 ? 'medium' : 'hard';
            hintStyle = personalitySystem.getHintStyle(difficulty, 0);
        }

        const prompt = buildHintPrompt(question, hintIndex, studentProfile, hintStyle);
        const systemPrompt = personalitySystem.loaded
            ? personalitySystem.buildSystemPrompt(studentProfile)
            : buildSystemPrompt(studentProfile || {});

        if (process.env.ANTHROPIC_API_KEY) {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': process.env.ANTHROPIC_API_KEY,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-3-5-haiku-20241022',
                    max_tokens: 500,
                    temperature: 0.7,
                    system: systemPrompt,
                    messages: [{ role: 'user', content: prompt }]
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error?.message || 'Claude API error');
            }

            console.log('✅ Hint generated');

            return res.json({
                success: true,
                hint: data.content[0].text,
                personalityActive: personalitySystem.loaded
            });
        }

        if (process.env.OPENAI_API_KEY) {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.7,
                    max_tokens: 500
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error?.message || 'OpenAI error');
            }

            return res.json({
                success: true,
                hint: data.choices[0].message.content,
                personalityActive: personalitySystem.loaded
            });
        }

        throw new Error('No AI API configured');

    } catch (error) {
        console.error('❌ Hint error:', error);
        res.json({
            success: true,
            hint: 'נסה לפרק את השאלה לשלבים קטנים יותר 🤔'
        });
    }
});

// ==================== AI CHAT ASSISTANT (FIXED - GIVES FULL SOLUTIONS) ====================
app.post('/api/ai/chat', async (req, res) => {
    try {
        const { message, context } = req.body;

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('💬 AI CHAT WITH PERSONALITY');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('   Student:', context?.studentName || 'Unknown');
        console.log('   Message:', message);
        console.log('   Question:', context?.question?.substring(0, 60) + '...' || 'N/A');
        console.log('   Correct Answer:', context?.answer || 'N/A');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Build personality-aware system prompt
        let systemPrompt = '';

        if (personalitySystem.loaded && personalitySystem.data?.corePersonality) {
            try {
                const personality = personalitySystem.data.corePersonality;
                systemPrompt = `אתה ${personality.teacher_name || 'נקסון'}, מורה מתמטיקה מומחה שעוזר לתלמידים.

כשתלמיד מבקש פתרון מלא או שלבים - תן לו את זה מיד!
אל תשאל שאלות מיותרות!
אל תציע עזרה - תן את הפתרון!

דבר בעברית טבעית וחמה.`;
            } catch (err) {
                systemPrompt = `אתה נקסון, מורה מתמטיקה שעוזר לתלמידים. כשמבקשים פתרון מלא - תן אותו מיד!`;
            }
        } else {
            systemPrompt = `אתה נקסון, מורה מתמטיקה שעוזר לתלמידים. כשמבקשים פתרון מלא - תן אותו מיד!`;
        }

        // Build the conversation prompt
        const lowerMessage = message.toLowerCase();

        // Aggressive detection for full solution
        const wantsFullSolution =
            lowerMessage.includes('פתרון') ||
            lowerMessage.includes('הראה') ||
            lowerMessage.includes('תן') ||
            lowerMessage.includes('שלב') ||
            lowerMessage.includes('צעד') ||
            lowerMessage.includes('איך') ||
            lowerMessage.includes('כן') ||
            lowerMessage.includes('בטח') ||
            lowerMessage.includes('מלא');

        let conversationPrompt = '';

        if (wantsFullSolution) {
            // Force full detailed solution
            conversationPrompt = `השאלה: ${context?.question || 'לא זמין'}

התשובה הנכונה: ${context?.answer || 'לא זמין'}

התלמיד ${context?.studentName || 'תלמיד'} ביקש פתרון מלא!

תן עכשיו פתרון מפורט עם כל השלבים:

דוגמה לפורמט:

📝 **פתרון מלא:**

**שלב 1:** [הסבר מה אנחנו עושים]
חישוב: [החישוב המדויק כאן]
תוצאה: [תוצאת ביניים]

**שלב 2:** [הסבר]
חישוב: [חישוב]
תוצאה: [תוצאה]

**שלב 3:** [המשך...]

✅ **התשובה הסופית:** ${context?.answer || '[תשובה]'}

---

חשוב:
- כתוב לפחות 8-12 משפטים
- תן את כל החישובים
- הסבר כל שלב
- סיים עם התשובה הסופית
- אל תשאל שאלות!
- אל תציע עזרה נוספת!
- פשוט תן את הפתרון!`;

            console.log('🔴 FORCING FULL SOLUTION MODE');

        } else {
            // Regular helpful guidance
            conversationPrompt = `התלמיד ${context?.studentName || 'תלמיד'} שואל: "${message}"

השאלה: ${context?.question || 'לא זמין'}
התשובה הנכונה: ${context?.answer || 'לא זמין'}

תן עזרה קצרה ומועילה (2-3 משפטים).`;
        }

        // Call Claude API
        if (process.env.ANTHROPIC_API_KEY) {
            console.log('🤖 Using Claude for chat...');

            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': process.env.ANTHROPIC_API_KEY,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-3-5-haiku-20241022',
                    max_tokens: wantsFullSolution ? 2000 : 800,
                    temperature: 0.7,
                    system: systemPrompt,
                    messages: [{ role: 'user', content: conversationPrompt }]
                })
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('❌ Claude API error:', data.error);
                throw new Error(data.error?.message || 'Claude API error');
            }

            const assistantResponse = data.content[0].text;

            console.log('✅ Chat response generated');
            console.log('   Type:', wantsFullSolution ? '🔴 FULL SOLUTION' : 'GUIDANCE');
            console.log('   Length:', assistantResponse.length, 'chars');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

            return res.json({
                success: true,
                response: assistantResponse,
                model: 'claude-3.5-haiku',
                personalityActive: personalitySystem.loaded,
                responseType: wantsFullSolution ? 'full_solution' : 'guidance'
            });
        }

        // OpenAI fallback
        if (process.env.OPENAI_API_KEY) {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'gpt-4',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: conversationPrompt }
                    ],
                    temperature: 0.7,
                    max_tokens: wantsFullSolution ? 2000 : 800
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error?.message || 'OpenAI error');
            }

            return res.json({
                success: true,
                response: data.choices[0].message.content,
                model: 'gpt-4',
                personalityActive: personalitySystem.loaded
            });
        }

        throw new Error('No AI API configured');

    } catch (error) {
        console.error('❌ Chat error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ==================== HELPER FUNCTIONS ====================

function buildSystemPrompt(studentProfile) {
    const { grade, mathFeeling, learningStyle, goalFocus, weakTopics } = studentProfile;

    let prompt = `אתה נקסון, מורה דיגיטלי למתמטיקה מומחה בתכנית הלימודים הישראלית.\n\n`;

    if (grade) {
        prompt += `התלמיד לומד בכיתה ${grade}.\n`;
    }

    if (weakTopics && weakTopics.length > 0) {
        prompt += `נושאים שהתלמיד מתקשה בהם: ${weakTopics.join(', ')}.\n`;
        prompt += `שים דגש מיוחד על נושאים אלה והסבר בצורה מפורטת יותר.\n\n`;
    }

    if (mathFeeling === 'struggle') {
        prompt += `התלמיד מתקשה במתמטיקה - היה סבלני, מעודד ותן הסברים פשוטים צעד אחר צעד.\n`;
    } else if (mathFeeling === 'love') {
        prompt += `התלמיד אוהב מתמטיקה - תן אתגרים מעניינים ושאלות מתקדמות.\n`;
    } else {
        prompt += `התלמיד בסדר עם מתמטיקה - עזור לו להשתפר בהדרגה.\n`;
    }

    if (learningStyle === 'independent') {
        prompt += `התלמיד אוהב לפתור בעצמו - תן רמזים עדינים.\n`;
    } else if (learningStyle === 'ask') {
        prompt += `התלמיד מוכן לבקש עזרה - תן הסברים מפורטים כשצריך.\n`;
    } else {
        prompt += `התלמיד מתייאש מהר - היה מאוד מעודד וחיובי.\n`;
    }

    if (goalFocus === 'understanding') {
        prompt += `התמקד בהבנה מעמיקה של המושגים.\n`;
    } else if (goalFocus === 'speed') {
        prompt += `עזור לפתח מהירות בפתרון תרגילים.\n`;
    } else if (goalFocus === 'accuracy') {
        prompt += `שים דגש על דיוק ובדיקת תשובות.\n`;
    } else {
        prompt += `בנה ביטחון עצמי והראה שמתמטיקה זה כיף!\n`;
    }

    prompt += `\nסגנון התקשורת שלך: ידידותי, מעודד, עם הסברים ברורים ודוגמאות מהחיים.`;

    return prompt;
}

function buildDynamicQuestionPrompt(topic, subtopic, difficulty, studentProfile) {
    let prompt = `צור שאלה דינמית במתמטיקה בעברית עבור תכנית הלימודים הישראלית.\n\n`;

    prompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    prompt += `פרטי התלמיד:\n`;
    prompt += `• כיתה: ${studentProfile.grade}\n`;
    prompt += `• רמת הבנה: ${studentProfile.mathFeeling || 'בינוני'}\n`;
    prompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    prompt += `דרישות השאלה:\n`;
    prompt += `• נושא ראשי: ${topic.name} (${topic.nameEn})\n`;

    if (subtopic) {
        prompt += `• תת-נושא: ${subtopic.name} (${subtopic.nameEn})\n`;
        prompt += `• ⚠️ חשוב! השאלה חייבת להתאים בדיוק לתת-הנושא הזה!\n`;
    }

    prompt += `• רמת קושי: ${difficulty}\n`;
    prompt += `• התאם לתכנית הלימודים של כיתה ${studentProfile.grade}\n\n`;

    prompt += `חוקים קריטיים:\n`;
    prompt += `1. השאלה חייבת להיות ספציפית ומלאה עם כל הנתונים הדרושים\n`;
    prompt += `2. התחל בפועל ברור: "חשב:", "פתור:", "מצא:", "הוכח:"\n`;
    prompt += `3. התשובה חייבת להיות מספרית או אלגברית מדויקת\n`;
    prompt += `4. כלול 3 רמזים מדורגים (קל → בינוני → חזק)\n`;
    prompt += `5. ודא שהשאלה מתאימה לרמת כיתה ${studentProfile.grade}\n`;
    prompt += `6. בדוק את התשובה מתמטית לפני שמחזיר אותה!\n\n`;

    prompt += `פורמט תשובה (JSON בלבד!):\n`;
    prompt += `{\n`;
    prompt += `  "question": "השאלה המלאה בעברית עם כל הנתונים",\n`;
    prompt += `  "correctAnswer": "התשובה המדויקת - בדוק אותה!",\n`;
    prompt += `  "hints": [\n`;
    prompt += `    "רמז קל שמכוון לכיוון",\n`;
    prompt += `    "רמז בינוני עם הצעד הראשון",\n`;
    prompt += `    "רמז חזק עם דוגמה דומה"\n`;
    prompt += `  ],\n`;
    prompt += `  "explanation": "הסבר מפורט של הפתרון עם כל הצעדים",\n`;
    prompt += `  "difficulty": "basic|intermediate|advanced"\n`;
    prompt += `}\n\n`;

    prompt += `⚠️ חשוב מאוד: החזר רק JSON תקין, ללא טקסט נוסף לפני או אחרי!`;

    return prompt;
}

function buildVerificationPrompt(question, userAnswer, correctAnswer, topic, subtopic, grade) {
    let prompt = `בדוק תשובה מתמטית בצורה חכמה ומדויקת.\n\n`;

    prompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    prompt += `שאלה: ${question}\n`;
    prompt += `תשובת תלמיד: ${userAnswer}\n`;
    prompt += `תשובה נכונה: ${correctAnswer}\n`;
    prompt += `נושא: ${topic}\n`;
    if (subtopic) prompt += `תת-נושא: ${subtopic}\n`;
    prompt += `כיתה: ${grade}\n`;
    prompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    prompt += `בדיקות שעליך לבצע:\n`;
    prompt += `1. שקילות מתמטית (למשל: 0.5 = 1/2, 3x+6 = 3(x+2))\n`;
    prompt += `2. פורמטים שונים של אותה תשובה\n`;
    prompt += `3. דיוק מספרי (עיגולים, שברים)\n`;
    prompt += `4. תשובות חלקיות (למשל: מצא רק פתרון אחד במשוואה ריבועית)\n`;
    prompt += `5. סימנים מתמטיים (±, √, ², וכו')\n\n`;

    prompt += `דוגמאות לשקילות:\n`;
    prompt += `• "2" = "2.0" = "2/1"\n`;
    prompt += `• "±3" = "3 או -3" = "x=3 או x=-3"\n`;
    prompt += `• "6x+12" = "6(x+2)"\n`;
    prompt += `• "√16" = "4" = "±4" (תלוי בהקשר)\n\n`;

    prompt += `פורמט תשובה (JSON בלבד!):\n`;
    prompt += `{\n`;
    prompt += `  "isCorrect": true/false,\n`;
    prompt += `  "isPartial": true/false,\n`;
    prompt += `  "confidence": 0-100,\n`;
    prompt += `  "feedback": "משוב קצר ומעודד בעברית",\n`;
    prompt += `  "explanation": "הסבר מפורט למה התשובה נכונה/לא נכונה",\n`;
    prompt += `  "whatCorrect": "מה התלמיד עשה נכון (אם יש)",\n`;
    prompt += `  "whatMissing": "מה חסר או שגוי (אם יש)"\n`;
    prompt += `}\n\n`;

    prompt += `⚠️ חשוב מאוד: החזר רק JSON תקין, ללא טקסט נוסף לפני או אחרי!`;

    return prompt;
}

function buildHintPrompt(question, hintIndex, studentProfile, hintStyle) {
    const hintLevels = [
        'רמז עדין מאוד שמכוון לכיוון הנכון',
        'רמז ישיר יותר עם הצעד הראשון בפתרון',
        'רמז ספציפי עם דוגמה דומה או הנוסחה הרלוונטית',
        'כמעט הפתרון המלא, רק בלי לתת את התשובה הסופית'
    ];

    let prompt = `תן ${hintLevels[hintIndex] || hintLevels[3]} לשאלה הבאה:\n\n`;
    prompt += `${question}\n\n`;
    prompt += `התלמיד לומד בכיתה ${studentProfile.grade || '8'}.\n`;

    if (hintStyle) {
        prompt += `\nסגנון הרמז: ${hintStyle.hint_style}\n`;
        prompt += `דוגמה: ${hintStyle.example_hint}\n\n`;
    }

    if (studentProfile.learningStyle === 'independent') {
        prompt += `התלמיד אוהב לפתור בעצמו, אז הרמז צריך להיות עדין.\n`;
    } else if (studentProfile.learningStyle === 'give-up') {
        prompt += `התלמיד מתייאש מהר, אז הרמז צריך להיות מעודד ומפורט.\n`;
    }

    prompt += `\nהחזר רק את הרמז כטקסט ברור בעברית, ללא JSON.`;

    return prompt;
}

// ==================== START SERVER ====================

const personalityPath = path.join(__dirname, '../uploads/personality-system.xlsx');
if (fs.existsSync(personalityPath)) {
    console.log('🔄 Loading personality system from existing file...');
    personalitySystem.loadFromExcel(personalityPath);
}

app.listen(PORT, () => {
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 NEXON AI SERVER - FULL SOLUTION MODE');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📡 Server: http://localhost:${PORT}`);
    console.log('');
    console.log('🤖 AI Models:');
    console.log('   Primary: Claude 3.5 Haiku (Fast & Smart)');
    console.log('   Fallback: GPT-4');
    console.log('');
    console.log('🎭 Personality System:', personalitySystem.loaded ? '✅ LOADED' : '❌ Not Loaded');
    if (personalitySystem.loaded) {
        console.log('   📚 Examples:', personalitySystem.data.examplesBank.length);
        console.log('   🎯 Topics:', personalitySystem.data.topicGuidelines.length);
        console.log('   💡 Hints:', personalitySystem.data.hintSystem.length);
    }
    console.log('');
    console.log('🔑 API Keys:');
    console.log('   Anthropic:', process.env.ANTHROPIC_API_KEY ? '✅ Active' : '❌ Missing');
    console.log('   OpenAI:', process.env.OPENAI_API_KEY ? '✅ Active' : '❌ Missing');
    console.log('');
    console.log('✨ Features:');
    console.log('   • 🔴 FULL SOLUTION MODE - Gives complete solutions when asked!');
    console.log('   • Dynamic question generation');
    console.log('   • Smart answer verification');
    console.log('   • AI Chat with aggressive solution detection');
    console.log('   • Personality-based responses');
    console.log('   • Israeli curriculum alignment');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
});