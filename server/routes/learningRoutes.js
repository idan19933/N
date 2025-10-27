// server/routes/learningRoutes.js - BULLETPROOF JSON CLEANING
import express from 'express';
const router = express.Router();

function cleanJsonText(rawText) {
    console.log('🧹 Starting JSON cleaning...');
    console.log('📝 Raw length:', rawText.length);
    console.log('📝 First 200 chars:', rawText.substring(0, 200));
    console.log('📝 Last 200 chars:', rawText.substring(rawText.length - 200));

    let cleaned = rawText.trim();

    // Step 1: Remove ALL markdown code blocks (both variants)
    if (cleaned.startsWith('```json')) {
        console.log('🔧 Removing ```json prefix');
        cleaned = cleaned.substring(7); // Remove ```json and newline
    } else if (cleaned.startsWith('```')) {
        console.log('🔧 Removing ``` prefix');
        cleaned = cleaned.substring(3); // Remove ```
    }

    // Step 2: Remove trailing markdown
    if (cleaned.endsWith('```')) {
        console.log('🔧 Removing ``` suffix');
        cleaned = cleaned.substring(0, cleaned.length - 3);
    }

    // Step 3: Trim again after removing markdown
    cleaned = cleaned.trim();

    // Step 4: Find the actual JSON boundaries
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');

    if (firstBrace === -1 || lastBrace === -1) {
        console.error('❌ No JSON braces found!');
        console.error('Cleaned text:', cleaned.substring(0, 500));
        throw new Error('No valid JSON structure found');
    }

    // Extract only the JSON content
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);

    console.log('✂️ Cleaned length:', cleaned.length);
    console.log('✂️ First 200 chars:', cleaned.substring(0, 200));
    console.log('✂️ Last 200 chars:', cleaned.substring(cleaned.length - 200));
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

        // ✅ EXPLICIT PROMPT - Demands pure JSON only
        const systemPrompt = `You are an expert Israeli math teacher. Create structured learning content in Hebrew.

**CRITICAL REQUIREMENTS:**
1. Respond with ONLY a JSON object
2. NO markdown code blocks (no \`\`\`json)
3. NO explanatory text before or after
4. Start with { and end with }
5. All content in Hebrew

JSON Structure:
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
          "options": ["1", "2", "3", "4"],
          "correctAnswer": 0,
          "explanation": "הסבר"
        }
      ]
    }
  ]
}

Requirements:
- Exactly 3 pages
- Each page: 3-4 content items + 2 quiz questions
- Simple, clear explanations
- Practical examples with solutions`;

        const userPrompt = `Create learning content for:

Topic: ${topic}
${subtopic && subtopic !== 'general' ? `Subtopic: ${subtopic}` : ''}
Grade: ${grade}

Remember: ONLY JSON, no markdown, start with {`;

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
                error: 'Failed to clean JSON response',
                debug: {
                    cleanError: cleanError.message,
                    rawSample: rawText.substring(0, 300)
                }
            });
        }

        let content;
        try {
            console.log('🔍 Attempting to parse JSON...');
            content = JSON.parse(cleanedText);
            console.log('✅ JSON parsed successfully!');
        } catch (parseError) {
            console.error('❌ JSON Parse Error:', parseError.message);
            console.error('📝 Attempted to parse:');
            console.error('   First 300:', cleanedText.substring(0, 300));
            console.error('   Last 300:', cleanedText.substring(cleanedText.length - 300));

            return res.status(500).json({
                success: false,
                error: 'Invalid JSON structure from AI',
                debug: {
                    parseError: parseError.message,
                    sampleStart: cleanedText.substring(0, 200),
                    sampleEnd: cleanedText.substring(cleanedText.length - 200)
                }
            });
        }

        // ✅ Validate structure
        console.log('🔍 Validating content structure...');

        if (!content.title) {
            console.error('❌ Missing title');
            return res.status(500).json({
                success: false,
                error: 'Content missing title field'
            });
        }

        if (!content.pages || !Array.isArray(content.pages)) {
            console.error('❌ Missing or invalid pages array');
            return res.status(500).json({
                success: false,
                error: 'Content missing valid pages array'
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

            if (!page.title) {
                console.error(`❌ Page ${i} missing title`);
                return res.status(500).json({
                    success: false,
                    error: `Page ${i + 1} missing title`
                });
            }

            if (!page.content || !Array.isArray(page.content)) {
                console.error(`❌ Page ${i} missing content array`);
                return res.status(500).json({
                    success: false,
                    error: `Page ${i + 1} missing content`
                });
            }

            if (page.content.length === 0) {
                console.error(`❌ Page ${i} has empty content`);
                return res.status(500).json({
                    success: false,
                    error: `Page ${i + 1} has no content items`
                });
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