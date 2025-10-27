// server/routes/learningRoutes.js - SUPER EXPLICIT PROMPT
import express from 'express';
const router = express.Router();

function cleanJsonText(rawText) {
    console.log('🧹 Starting JSON cleaning...');
    console.log('📝 Raw length:', rawText.length);

    let cleaned = rawText.trim();

    // Remove markdown code blocks
    if (cleaned.startsWith('```json')) {
        console.log('🔧 Removing ```json prefix');
        cleaned = cleaned.substring(7);
    } else if (cleaned.startsWith('```')) {
        console.log('🔧 Removing ``` prefix');
        cleaned = cleaned.substring(3);
    }

    if (cleaned.endsWith('```')) {
        console.log('🔧 Removing ``` suffix');
        cleaned = cleaned.substring(0, cleaned.length - 3);
    }

    cleaned = cleaned.trim();

    // Find JSON boundaries
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');

    if (firstBrace === -1 || lastBrace === -1) {
        console.error('❌ No JSON braces found!');
        throw new Error('No valid JSON structure found');
    }

    cleaned = cleaned.substring(firstBrace, lastBrace + 1);

    console.log('✂️ Cleaned length:', cleaned.length);
    console.log('✅ JSON cleaning complete');

    return cleaned;
}

router.post('/generate-content', async (req, res) => {
    try {
        const { topic, subtopic, grade = '7', personality = 'nexon', userId } = req.body;

        if (!topic) {
            return res.status(400).json({
                success: false,
                error: 'Missing required field: topic'
            });
        }

        console.log(`🎓 [${userId}] Generating learning content:`, {
            topic,
            subtopic: subtopic || 'general',
            grade,
            personality
        });

        const startTime = Date.now();

        // ✅ SUPER EXPLICIT PROMPT WITH COMPLETE EXAMPLE
        const systemPrompt = `You are an expert Israeli math teacher. Create structured learning content in Hebrew.

CRITICAL: Respond with ONLY valid JSON. No markdown, no explanations, just the JSON object.

YOU MUST USE THIS EXACT STRUCTURE - DO NOT DEVIATE:

{
  "title": "string in Hebrew",
  "pages": [
    {
      "title": "string in Hebrew",
      "content": [
        {
          "type": "text",
          "value": "explanation text in Hebrew"
        },
        {
          "type": "example",
          "value": "example problem in Hebrew",
          "solution": "step by step solution in Hebrew"
        },
        {
          "type": "tip",
          "value": "helpful tip in Hebrew"
        }
      ],
      "quiz": [
        {
          "question": "question text in Hebrew?",
          "options": ["option 1", "option 2", "option 3", "option 4"],
          "correctAnswer": 0,
          "explanation": "why this answer is correct in Hebrew"
        }
      ]
    }
  ]
}

COMPLETE WORKING EXAMPLE:
{
  "title": "חיבור וחיסור - מתמטיקה לכיתה ז'",
  "pages": [
    {
      "title": "חיבור מספרים שלמים",
      "content": [
        {
          "type": "text",
          "value": "חיבור הוא פעולה מתמטית בסיסית שבה אנו מצרפים שני מספרים או יותר. התוצאה נקראת סכום."
        },
        {
          "type": "example",
          "value": "חשב: 25 + 17",
          "solution": "25 + 17 = 42. אפשר לפרק: 25 + 10 + 7 = 35 + 7 = 42"
        },
        {
          "type": "tip",
          "value": "כשמחברים מספרים גדולים, נוח לפרק אותם לעשרות ויחידות."
        }
      ],
      "quiz": [
        {
          "question": "מה התוצאה של 34 + 28?",
          "options": ["52", "62", "56", "60"],
          "correctAnswer": 1,
          "explanation": "34 + 28 = 62. פירוק: 30 + 20 = 50, ו-4 + 8 = 12, סה״כ 62"
        },
        {
          "question": "איזו פעולה הפוכה לחיבור?",
          "options": ["כפל", "חיסור", "חילוק", "שורש"],
          "correctAnswer": 1,
          "explanation": "חיסור הוא הפעולה ההפוכה לחיבור. למשל: 5 + 3 = 8, ולכן 8 - 3 = 5"
        }
      ]
    },
    {
      "title": "חיסור מספרים שלמים",
      "content": [
        {
          "type": "text",
          "value": "חיסור הוא פעולה שבה אנו מורידים מספר ממספר אחר. התוצאה נקראת הפרש."
        },
        {
          "type": "example",
          "value": "חשב: 50 - 23",
          "solution": "50 - 23 = 27. אפשר לחשוב: 50 - 20 = 30, ואז 30 - 3 = 27"
        },
        {
          "type": "tip",
          "value": "בחיסור עם השאלה, תמיד נשאל מהספרה השמאלית."
        }
      ],
      "quiz": [
        {
          "question": "מה התוצאה של 81 - 37?",
          "options": ["44", "54", "46", "48"],
          "correctAnswer": 0,
          "explanation": "81 - 37 = 44. נשאל: 70 - 30 = 40, ו-11 - 7 = 4, סה״כ 44"
        },
        {
          "question": "מה הפרש בין 100 ל-68?",
          "options": ["32", "42", "38", "28"],
          "correctAnswer": 0,
          "explanation": "100 - 68 = 32"
        }
      ]
    },
    {
      "title": "תרגול משולב",
      "content": [
        {
          "type": "text",
          "value": "בבעיות חיבור וחיסור משולבות, חשוב לבצע את הפעולות לפי הסדר מימין לשמאל."
        },
        {
          "type": "example",
          "value": "חשב: 45 + 20 - 15",
          "solution": "קודם: 45 + 20 = 65. אחר כך: 65 - 15 = 50"
        },
        {
          "type": "tip",
          "value": "תמיד בדקו את התשובה: אם חיברתם והפחתתם, וודאו שהתוצאה הגיונית."
        }
      ],
      "quiz": [
        {
          "question": "מה התוצאה של 30 + 15 - 12?",
          "options": ["33", "27", "35", "23"],
          "correctAnswer": 0,
          "explanation": "30 + 15 = 45, ואז 45 - 12 = 33"
        },
        {
          "question": "לדני היו 50 שקלים. הוא קנה משחק ב-35 שקלים וקיבל מתנה של 20 שקלים. כמה כסף יש לו עכשיו?",
          "options": ["35 שקלים", "30 שקלים", "40 שקלים", "25 שקלים"],
          "correctAnswer": 0,
          "explanation": "50 - 35 + 20 = 15 + 20 = 35 שקלים"
        }
      ]
    }
  ]
}

RULES:
1. Respond ONLY with the JSON - no other text
2. Start with { and end with }
3. Follow the EXACT structure shown in the example
4. Create exactly 3 pages
5. Each page must have "title" at page level (NOT inside content array)
6. Each page must have "content" array with 3-4 items
7. Each page must have "quiz" array with 2 questions
8. All text in Hebrew`;

        const userPrompt = `Create learning content following the EXACT structure from the example above.

Topic: ${topic}
${subtopic && subtopic !== 'general' ? `Subtopic: ${subtopic}` : ''}
Grade: ${grade}

Return ONLY the JSON object.`;

        console.log('⏱️ Calling Claude API...');

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-5-20250929',
                max_tokens: 3000,
                temperature: 0.7,
                system: systemPrompt,
                messages: [{
                    role: 'user',
                    content: userPrompt
                }]
            })
        });

        const apiElapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`✅ Claude responded in ${apiElapsed}s (status: ${response.status})`);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            console.error('❌ API Error:', JSON.stringify(errorData, null, 2));
            return res.status(500).json({
                success: false,
                error: errorData.error?.message || 'Failed to generate content'
            });
        }

        const data = await response.json();

        if (!data.content || !data.content[0] || !data.content[0].text) {
            console.error('❌ Invalid API response structure');
            return res.status(500).json({
                success: false,
                error: 'Invalid response from AI'
            });
        }

        const rawText = data.content[0].text;
        console.log('📥 Received response from Claude');
        console.log('📏 Total length:', rawText.length, 'characters');

        let cleanedText;
        try {
            cleanedText = cleanJsonText(rawText);
        } catch (cleanError) {
            console.error('❌ Cleaning failed:', cleanError.message);
            return res.status(500).json({
                success: false,
                error: 'Failed to clean JSON response'
            });
        }

        let content;
        try {
            console.log('🔍 Attempting to parse JSON...');
            content = JSON.parse(cleanedText);
            console.log('✅ JSON parsed successfully!');
        } catch (parseError) {
            console.error('❌ JSON Parse Error:', parseError.message);
            console.error('📝 First 300 chars:', cleanedText.substring(0, 300));
            console.error('📝 Last 300 chars:', cleanedText.substring(cleanedText.length - 300));

            return res.status(500).json({
                success: false,
                error: 'Invalid JSON structure from AI',
                debug: {
                    parseError: parseError.message,
                    sample: cleanedText.substring(0, 300)
                }
            });
        }

        // ✅ Validate structure
        console.log('🔍 Validating content structure...');

        if (!content.title || !content.pages || !Array.isArray(content.pages)) {
            console.error('❌ Invalid root structure');
            return res.status(500).json({
                success: false,
                error: 'Content missing title or pages array'
            });
        }

        if (content.pages.length === 0) {
            console.error('❌ Empty pages array');
            return res.status(500).json({
                success: false,
                error: 'No learning pages generated'
            });
        }

        // Validate each page
        for (let i = 0; i < content.pages.length; i++) {
            const page = content.pages[i];

            if (!page.title || typeof page.title !== 'string') {
                console.error(`❌ Page ${i} missing or invalid title`);
                return res.status(500).json({
                    success: false,
                    error: `Page ${i + 1} has invalid title`
                });
            }

            if (!page.content || !Array.isArray(page.content)) {
                console.error(`❌ Page ${i} missing content array`);
                return res.status(500).json({
                    success: false,
                    error: `Page ${i + 1} missing content array`
                });
            }

            if (page.content.length === 0) {
                console.error(`❌ Page ${i} has empty content`);
                return res.status(500).json({
                    success: false,
                    error: `Page ${i + 1} has no content items`
                });
            }

            // Validate each content item
            for (let j = 0; j < page.content.length; j++) {
                const item = page.content[j];
                if (!item.type || !item.value) {
                    console.error(`❌ Page ${i}, content item ${j} invalid`);
                    return res.status(500).json({
                        success: false,
                        error: `Page ${i + 1}, item ${j + 1} missing type or value`
                    });
                }
            }
        }

        const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ SUCCESS!');
        console.log(`⏱️  Total time: ${totalTime}s`);
        console.log(`📊 Pages: ${content.pages.length}`);
        console.log(`📝 Title: ${content.title}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        res.json({
            success: true,
            content,
            metadata: {
                generationTime: totalTime,
                pages: content.pages.length,
                model: 'claude-sonnet-4-5'
            }
        });

    } catch (error) {
        console.error('❌ Server Error:', error.message);
        console.error('Stack trace:', error.stack);
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
});

export default router;