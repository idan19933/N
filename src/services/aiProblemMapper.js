// src/services/aiProblemMapper.js - COMPLETE AI-POWERED MAPPER
import Anthropic from '@anthropic-ai/sdk';

class AIProblemMapper {
    constructor() {
        this.apiKey = import.meta.env.VITE_CLAUDE_API_KEY;
        if (!this.apiKey) {
            console.warn('⚠️ No Claude API key found');
        }
        this.client = this.apiKey ? new Anthropic({ apiKey: this.apiKey, dangerouslyAllowBrowser: true }) : null;
    }

    /**
     * Main mapping function - Converts ANY format to Nexon format
     */
    async mapProblemsWithAI(rawProblems, progressCallback = null) {
        if (!this.client) {
            throw new Error('Claude API key not configured');
        }

        console.log('🤖 Starting AI mapping for', rawProblems.length, 'problems');

        const systemPrompt = `You are an expert mathematics problem converter. Your job is to convert math problems from ANY format into a structured JSON format for an educational platform.

CRITICAL INSTRUCTIONS:
1. EXTRACT problems from the provided text/data - don't make them up
2. SOLVE each problem correctly - verify your math
3. Map topics to these EXACT categories ONLY: algebra, geometry, powers, calculus, functions, trigonometry, statistics
4. Classify difficulty 1-7 (1=easiest, 7=hardest) based on complexity
5. Generate 2-4 solution steps in Hebrew
6. Create 1-2 helpful hints in Hebrew
7. Translate questions to Hebrew if needed (keep English as secondary)

REQUIRED OUTPUT FORMAT (JSON array):
[
  {
    "question": "Hebrew question text (or English if Hebrew not possible)",
    "answer": "Correct numerical or algebraic answer",
    "steps": ["Step 1 in Hebrew", "Step 2 in Hebrew", ...],
    "hints": ["Hint 1 in Hebrew", "Hint 2 in Hebrew"],
    "topic": "one of: algebra|geometry|powers|calculus|functions|trigonometry|statistics",
    "difficulty": 1-7,
    "grade": "7-8" or "9-10" or "11-12",
    "category": "specific category like 'linear equations', 'circles', etc",
    "subcategory": "more specific like 'one variable', 'area', etc"
  }
]

IMPORTANT:
- Verify all answers are mathematically correct
- Steps should be clear and logical
- Difficulty should match the actual complexity
- Use Hebrew for Israeli students
- Return ONLY the JSON array, no extra text`;

        try {
            // Convert problems to text for AI
            const problemsText = typeof rawProblems === 'string'
                ? rawProblems
                : JSON.stringify(rawProblems, null, 2);

            console.log('📤 Sending to Claude API...');

            const message = await this.client.messages.create({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 8000,
                temperature: 0.3,
                system: systemPrompt,
                messages: [{
                    role: 'user',
                    content: `Convert these problems to the required format. Extract and solve each problem correctly:\n\n${problemsText.substring(0, 50000)}`
                }]
            });

            const responseText = message.content[0].text;
            console.log('📥 Received AI response');

            // Extract JSON from response
            const jsonMatch = responseText.match(/\[[\s\S]*\]/);
            if (!jsonMatch) {
                throw new Error('AI did not return valid JSON array');
            }

            const mappedProblems = JSON.parse(jsonMatch[0]);
            console.log('✅ AI mapped', mappedProblems.length, 'problems');

            // Validate and enhance each problem
            const validatedProblems = mappedProblems.map((problem, index) => {
                return {
                    question: problem.question || `Problem ${index + 1}`,
                    answer: problem.answer || 'Unknown',
                    steps: Array.isArray(problem.steps) ? problem.steps : [],
                    hints: Array.isArray(problem.hints) ? problem.hints : [],
                    difficulty: Math.min(Math.max(parseInt(problem.difficulty) || 3, 1), 7),
                    topic: this.validateTopic(problem.topic),
                    category: problem.category || problem.topic || 'general',
                    subcategory: problem.subcategory || 'basic',
                    grade: problem.grade || '7-12',
                    tier: parseInt(problem.difficulty) || 3,
                    source: 'ai_imported',
                    hasAISteps: true
                };
            });

            return {
                mapped: validatedProblems,
                errors: [],
                stats: {
                    total: validatedProblems.length,
                    successRate: 100
                }
            };

        } catch (error) {
            console.error('❌ AI mapping error:', error);
            throw error;
        }
    }

    /**
     * Batch mapping with progress tracking
     */
    async mapBatchSmart(problems, chunkSize = 20, progressCallback = null) {
        const chunks = [];
        for (let i = 0; i < problems.length; i += chunkSize) {
            chunks.push(problems.slice(i, i + chunkSize));
        }

        const allMapped = [];
        const allErrors = [];

        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];

            if (progressCallback) {
                progressCallback({
                    current: i * chunkSize + chunk.length,
                    total: problems.length,
                    percent: Math.round(((i + 1) / chunks.length) * 100)
                });
            }

            try {
                const result = await this.mapProblemsWithAI(chunk);
                allMapped.push(...result.mapped);
            } catch (error) {
                console.error(`Error mapping chunk ${i}:`, error);
                allErrors.push({
                    chunk: i,
                    error: error.message
                });
            }

            // Rate limiting - wait between chunks
            if (i < chunks.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        return {
            mapped: allMapped,
            errors: allErrors,
            stats: {
                total: problems.length,
                successful: allMapped.length,
                failed: allErrors.length,
                successRate: Math.round((allMapped.length / problems.length) * 100)
            }
        };
    }

    validateTopic(topic) {
        const validTopics = ['algebra', 'geometry', 'powers', 'calculus', 'functions', 'trigonometry', 'statistics'];
        const normalized = (topic || '').toLowerCase().trim();

        // Direct match
        if (validTopics.includes(normalized)) return normalized;

        // Fuzzy matching
        if (normalized.includes('alg')) return 'algebra';
        if (normalized.includes('geo')) return 'geometry';
        if (normalized.includes('pow') || normalized.includes('exp')) return 'powers';
        if (normalized.includes('calc') || normalized.includes('deriv')) return 'calculus';
        if (normalized.includes('func')) return 'functions';
        if (normalized.includes('trig') || normalized.includes('sin') || normalized.includes('cos')) return 'trigonometry';
        if (normalized.includes('stat') || normalized.includes('prob')) return 'statistics';

        return 'algebra'; // Default fallback
    }

    getDifficultyDistribution(problems) {
        const dist = {};
        problems.forEach(p => {
            dist[p.difficulty] = (dist[p.difficulty] || 0) + 1;
        });
        return dist;
    }

    getTopicDistribution(problems) {
        const dist = {};
        problems.forEach(p => {
            dist[p.topic] = (dist[p.topic] || 0) + 1;
        });
        return dist;
    }
}

export const aiProblemMapper = new AIProblemMapper();