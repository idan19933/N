// server/routes/learningRoutes.js - OPTIMIZED FOR SPEED
import express from 'express';
const router = express.Router();

function cleanJsonText(rawText) {
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

        // ✅ OPTIMIZED PROMPT - More concise for faster generation
        const systemPrompt = `אתה מורה למתמטיקה ישראלי מנוסה. צור חומר לימוד מובנה בפורמט JSON.

📐 **דרישות תוכן:**
- 3 עמודים (pages) של חומר לימוד
- כל עמוד: 3-4 פריטי תוכן + 2 שאלות תרגול
- הסבר פשוט וברור עם דוגמאות

⚠️ **חשוב מאוד:**
1. ONLY JSON - ללא טקסט נוסף
2. בעברית בלבד
3. דוגמאות עם פתרונות מפורטים
4. שאלות תרגול עם 4 אפשרויות`;

        const userPrompt = `נושא: ${topic}
${subtopic ? `תת-נושא: ${subtopic}` : ''}
כיתה: ${grade}

צור JSON:
{
  "title": "כותרת בעברית",
  "pages": [
    {
      "title": "כותרת עמוד",
      "content": [
        {"type": "text", "value": "הסבר"},
        {"type": "example", "value": "דוגמה", "solution": "פתרון"},
        {"type": "tip", "value": "טיפ"}
      ],
      "quiz": [
        {
          "question": "שאלה?",
          "options": ["תשובה 1", "תשובה 2", "תשובה 3", "תשובה 4"],
          "correctAnswer": 0,
          "explanation": "הסבר"
        }
      ]
    }
  ]
}`;

        console.log('⏱️ Calling Claude API...');

        // ✅ OPTIMIZED PARAMETERS FOR SPEED
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-5-20250929',
                max_tokens: 2000, // ✅ Reduced from 4096 - faster!
                temperature: 0.7,
                system: systemPrompt,
                messages: [{
                    role: 'user',
                    content: userPrompt
                }]
            })
        });

        const apiElapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`✅ Claude responded in ${apiElapsed}s`);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            console.error('❌ API Error:', errorData);
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
        console.log('🧹 Cleaning JSON response...');

        const cleanedText = cleanJsonText(rawText);

        let content;
        try {
            content = JSON.parse(cleanedText);
        } catch (parseError) {
            console.error('❌ JSON Parse Error:', parseError);
            console.error('Raw response:', rawText.substring(0, 200));
            return res.status(500).json({
                success: false,
                error: 'Invalid JSON from AI'
            });
        }

        // ✅ Validate structure
        if (!content.title || !content.pages || !Array.isArray(content.pages)) {
            console.error('❌ Invalid content structure');
            return res.status(500).json({
                success: false,
                error: 'Invalid content format'
            });
        }

        const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`✅ SUCCESS! Total time: ${totalTime}s`);
        console.log(`📊 Generated: ${content.pages.length} pages`);

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
        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
});

export default router;