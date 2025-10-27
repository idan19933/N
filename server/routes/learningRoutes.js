// server/routes/learningRoutes.js - IMPROVED JSON HANDLING
import express from 'express';
const router = express.Router();

function cleanJsonText(rawText) {
    console.log('🧹 Cleaning JSON response...');
    console.log('📝 Raw response length:', rawText.length);
    console.log('📝 First 100 chars:', rawText.substring(0, 100));

    let jsonText = rawText.trim();

    // Remove markdown code blocks
    if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/g, '');
    }

    // Find JSON object boundaries
    const jsonStart = jsonText.indexOf('{');
    const jsonEnd = jsonText.lastIndexOf('}') + 1;

    if (jsonStart !== -1 && jsonEnd > jsonStart) {
        jsonText = jsonText.substring(jsonStart, jsonEnd);
    }

    console.log('✂️ Cleaned JSON length:', jsonText.length);
    console.log('✂️ First 150 chars of cleaned:', jsonText.substring(0, 150));

    return jsonText;
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

        // ✅ SUPER EXPLICIT PROMPT - Forces clean JSON
        const systemPrompt = `אתה מורה למתמטיקה ישראלי מנוסה. 

CRITICAL: You MUST respond with ONLY valid JSON. No explanations, no markdown, no text before or after.

Return this EXACT structure in Hebrew:
{
  "title": "כותרת בעברית",
  "pages": [
    {
      "title": "כותרת עמוד",
      "content": [
        {"type": "text", "value": "הסבר טקסט"},
        {"type": "example", "value": "דוגמה מספרית", "solution": "פתרון מפורט"},
        {"type": "tip", "value": "טיפ שימושי"}
      ],
      "quiz": [
        {
          "question": "שאלה?",
          "options": ["תשובה 1", "תשובה 2", "תשובה 3", "תשובה 4"],
          "correctAnswer": 0,
          "explanation": "הסבר מדוע התשובה נכונה"
        }
      ]
    }
  ]
}

Requirements:
- 3 pages exactly
- Each page: 3-4 content items + 2 quiz questions
- All text in Hebrew
- Valid JSON only`;

        const userPrompt = `Create learning content for:
נושא: ${topic}
${subtopic && subtopic !== 'general' ? `תת-נושא: ${subtopic}` : ''}
כיתה: ${grade}

RESPOND WITH ONLY THE JSON OBJECT. START WITH { AND END WITH }`;

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
                max_tokens: 2500,
                temperature: 0.7,
                system: systemPrompt,
                messages: [{
                    role: 'user',
                    content: userPrompt
                }]
            })
        });

        const apiElapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`✅ Claude API responded in ${apiElapsed}s with status: ${response.status}`);

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
        console.log('📏 Response length:', rawText.length);

        const cleanedText = cleanJsonText(rawText);

        let content;
        try {
            content = JSON.parse(cleanedText);
            console.log('✅ JSON parsed successfully');
        } catch (parseError) {
            console.error('❌ JSON Parse Error:', parseError.message);
            console.error('📝 Failed to parse this text:');
            console.error(cleanedText.substring(0, 500)); // First 500 chars
            console.error('...');
            console.error(cleanedText.substring(cleanedText.length - 200)); // Last 200 chars

            return res.status(500).json({
                success: false,
                error: 'Invalid JSON from AI',
                debug: {
                    parseError: parseError.message,
                    sample: cleanedText.substring(0, 200)
                }
            });
        }

        // ✅ Validate structure
        if (!content.title || !content.pages || !Array.isArray(content.pages)) {
            console.error('❌ Invalid content structure');
            console.error('Content keys:', Object.keys(content));
            return res.status(500).json({
                success: false,
                error: 'Invalid content format - missing required fields'
            });
        }

        if (content.pages.length === 0) {
            console.error('❌ No pages in content');
            return res.status(500).json({
                success: false,
                error: 'No learning pages generated'
            });
        }

        // Validate each page has required structure
        for (let i = 0; i < content.pages.length; i++) {
            const page = content.pages[i];
            if (!page.title || !page.content || !Array.isArray(page.content)) {
                console.error(`❌ Invalid page ${i} structure`);
                return res.status(500).json({
                    success: false,
                    error: `Page ${i + 1} has invalid structure`
                });
            }
        }

        const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`✅ SUCCESS! Total time: ${totalTime}s`);
        console.log(`📊 Generated: ${content.pages.length} pages`);
        console.log(`📝 Title: ${content.title}`);

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
        console.error('❌ Server Error:', error);
        console.error('Stack:', error.stack);
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
});

export default router;