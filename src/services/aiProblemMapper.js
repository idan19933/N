// src/services/aiProblemMapper.js - AI-Powered Intelligent Problem Mapper
import Anthropic from '@anthropic-ai/sdk';

class AIProblemMapper {
    constructor() {
        // Initialize Claude client
        this.client = new Anthropic({
            apiKey: import.meta.env.VITE_CLAUDE_API_KEY,
            dangerouslyAllowBrowser: true // For client-side usage
        });

        // Nexon system topics
        this.nexonTopics = [
            'algebra',
            'geometry',
            'functions',
            'powers',
            'calculus',
            'trigonometry',
            'statistics'
        ];

        // Model to use
        this.model = 'claude-sonnet-4-5-20250929';
    }

    /**
     * Main AI mapping function - intelligently converts any problem
     */
    async mapToNexonFormat(externalProblem) {
        try {
            console.log('🤖 AI analyzing problem...');

            // Build the AI prompt
            const prompt = this.buildMappingPrompt(externalProblem);

            // Call Claude AI
            const response = await this.client.messages.create({
                model: this.model,
                max_tokens: 2000,
                messages: [{
                    role: 'user',
                    content: prompt
                }]
            });

            // Parse AI response
            const aiResponse = response.content[0].text;
            console.log('✅ AI response received');

            // Extract JSON from response
            const mappedProblem = this.parseAIResponse(aiResponse, externalProblem);

            return mappedProblem;
        } catch (error) {
            console.error('❌ AI mapping error:', error);
            throw error;
        }
    }

    /**
     * Build intelligent prompt for Claude
     */
    buildMappingPrompt(problem) {
        return `You are an expert mathematics educator helping to organize a problem database. Analyze this math problem and convert it to a structured format.

**Input Problem:**
${JSON.stringify(problem, null, 2)}

**Your Task:**
Analyze this problem and provide a JSON response with the following fields. Use your mathematical understanding to:

1. **question**: Clean, well-formatted question text (keep original language, remove HTML/formatting)
2. **answer**: The correct answer (simplified form, with units if applicable)
3. **topic**: Choose EXACTLY ONE from: ${this.nexonTopics.join(', ')}
   - Analyze the mathematical content to determine the best fit
   - Consider what skills/knowledge are being tested
4. **difficulty**: Rate 1-7 based on:
   - Level 1-2: Basic arithmetic, simple concepts
   - Level 3-4: Single-variable algebra, basic geometry
   - Level 5: Multiple steps, systems, quadratics
   - Level 6: Advanced algebra, trigonometry, introductory calculus
   - Level 7: Complex calculus, proofs, multi-concept integration
5. **steps**: Array of solution steps (3-6 steps, clear and pedagogical)
6. **hints**: Array of 2-4 helpful hints (not giving away the answer)
7. **subcategory**: Specific sub-topic (e.g., "linear equations", "area", "derivatives")
8. **grade**: Appropriate grade level (e.g., "7-8", "9-10", "11-12")
9. **category**: Same as topic (for compatibility)

**Important Guidelines:**
- Choose topic based on PRIMARY skill being tested, not peripherals
- If problem involves f(x) notation, it's "functions" not "algebra"
- Calculus keywords: derivative, integral, limit → "calculus"
- sin/cos/tan problems → "trigonometry"
- Area/perimeter/volume → "geometry"
- Powers/exponents/roots → "powers"
- Probability/statistics → "statistics"
- Everything else → "algebra"
- Steps should be clear enough for a student to follow
- Hints should guide thinking, not solve the problem
- Be precise with difficulty - consider multiple factors

**Output Format:**
Respond ONLY with valid JSON, no other text:

\`\`\`json
{
  "question": "...",
  "answer": "...",
  "topic": "algebra",
  "difficulty": 3,
  "steps": ["step 1", "step 2", "step 3"],
  "hints": ["hint 1", "hint 2"],
  "subcategory": "...",
  "grade": "8-10",
  "category": "algebra"
}
\`\`\``;
    }

    /**
     * Parse AI response and extract JSON
     */
    parseAIResponse(aiResponse, originalProblem) {
        try {
            // Extract JSON from markdown code blocks if present
            let jsonText = aiResponse;

            // Remove markdown code blocks
            const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/);
            if (jsonMatch) {
                jsonText = jsonMatch[1];
            }

            // Parse JSON
            const parsed = JSON.parse(jsonText);

            // Validate and add metadata
            const validated = {
                question: parsed.question || originalProblem.question || 'Mathematical problem',
                answer: String(parsed.answer || originalProblem.answer || '0'),
                topic: this.validateTopic(parsed.topic),
                difficulty: this.validateDifficulty(parsed.difficulty),
                steps: Array.isArray(parsed.steps) ? parsed.steps : [],
                hints: Array.isArray(parsed.hints) ? parsed.hints : [],
                subcategory: parsed.subcategory || 'general',
                grade: parsed.grade || '7-12',
                category: parsed.category || parsed.topic,
                tier: parsed.difficulty,
                source: 'ai-mapped',
                original: originalProblem
            };

            return validated;
        } catch (error) {
            console.error('❌ Error parsing AI response:', error);
            console.log('Raw response:', aiResponse);
            throw new Error('Failed to parse AI response as JSON');
        }
    }

    /**
     * Validate topic is one of allowed topics
     */
    validateTopic(topic) {
        const normalized = String(topic).toLowerCase().trim();

        if (this.nexonTopics.includes(normalized)) {
            return normalized;
        }

        // Try fuzzy matching
        for (const validTopic of this.nexonTopics) {
            if (normalized.includes(validTopic) || validTopic.includes(normalized)) {
                return validTopic;
            }
        }

        // Default fallback
        console.warn(`⚠️ Unknown topic "${topic}", defaulting to algebra`);
        return 'algebra';
    }

    /**
     * Validate difficulty is 1-7
     */
    validateDifficulty(difficulty) {
        const num = parseInt(difficulty);

        if (isNaN(num) || num < 1 || num > 7) {
            console.warn(`⚠️ Invalid difficulty "${difficulty}", defaulting to 3`);
            return 3;
        }

        return num;
    }

    /**
     * Batch map multiple problems with AI
     */
    async mapBatch(problems, onProgress = null) {
        console.log(`🤖 AI mapping ${problems.length} problems...`);

        const mapped = [];
        const errors = [];

        for (let i = 0; i < problems.length; i++) {
            try {
                // Progress callback
                if (onProgress) {
                    onProgress({
                        current: i + 1,
                        total: problems.length,
                        percent: Math.round(((i + 1) / problems.length) * 100)
                    });
                }

                // Map with AI
                const result = await this.mapToNexonFormat(problems[i]);
                mapped.push(result);

                console.log(`✅ Mapped ${i + 1}/${problems.length}: ${result.question.substring(0, 50)}...`);

                // Small delay to avoid rate limits
                await this.delay(500);

            } catch (error) {
                console.error(`❌ Failed to map problem ${i + 1}:`, error);
                errors.push({
                    index: i,
                    problem: problems[i],
                    error: error.message
                });
            }
        }

        console.log(`✅ AI Mapping complete: ${mapped.length} success, ${errors.length} errors`);

        return {
            mapped,
            errors,
            stats: {
                total: problems.length,
                success: mapped.length,
                failed: errors.length,
                successRate: Math.round((mapped.length / problems.length) * 100)
            }
        };
    }

    /**
     * Batch map with smart chunking for large datasets
     */
    async mapBatchSmart(problems, chunkSize = 10, onProgress = null) {
        console.log(`🤖 Smart batch mapping: ${problems.length} problems in chunks of ${chunkSize}`);

        const allMapped = [];
        const allErrors = [];
        const chunks = this.chunkArray(problems, chunkSize);

        for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            console.log(`\n📦 Processing chunk ${i + 1}/${chunks.length} (${chunk.length} problems)`);

            // Map chunk
            const result = await this.mapBatch(chunk, (chunkProgress) => {
                if (onProgress) {
                    const overallProgress = {
                        chunk: i + 1,
                        totalChunks: chunks.length,
                        current: (i * chunkSize) + chunkProgress.current,
                        total: problems.length,
                        percent: Math.round((((i * chunkSize) + chunkProgress.current) / problems.length) * 100)
                    };
                    onProgress(overallProgress);
                }
            });

            allMapped.push(...result.mapped);
            allErrors.push(...result.errors);

            // Longer delay between chunks
            if (i < chunks.length - 1) {
                console.log('⏳ Waiting before next chunk...');
                await this.delay(2000);
            }
        }

        return {
            mapped: allMapped,
            errors: allErrors,
            stats: {
                total: problems.length,
                success: allMapped.length,
                failed: allErrors.length,
                successRate: Math.round((allMapped.length / problems.length) * 100)
            }
        };
    }

    /**
     * Analyze and improve existing problem
     */
    async improveProblem(problem) {
        try {
            console.log('🔍 AI analyzing problem for improvements...');

            const prompt = `You are a mathematics educator reviewing a problem for quality. Analyze this problem and suggest improvements.

**Current Problem:**
${JSON.stringify(problem, null, 2)}

**Your Task:**
Review and improve:
1. Question clarity - Is it clear and unambiguous?
2. Answer format - Is it in the simplest form?
3. Steps - Are they pedagogically sound and complete?
4. Hints - Are they helpful without giving away the answer?
5. Difficulty - Is it accurately rated?
6. Topic - Is it correctly categorized?

Provide an improved version in JSON format.`;

            const response = await this.client.messages.create({
                model: this.model,
                max_tokens: 2000,
                messages: [{
                    role: 'user',
                    content: prompt
                }]
            });

            const improved = this.parseAIResponse(response.content[0].text, problem);
            console.log('✅ Problem improved by AI');

            return improved;
        } catch (error) {
            console.error('❌ Error improving problem:', error);
            return problem; // Return original if improvement fails
        }
    }

    /**
     * Generate similar problems based on a template
     */
    async generateSimilarProblems(templateProblem, count = 5) {
        try {
            console.log(`🎲 AI generating ${count} similar problems...`);

            const prompt = `You are a mathematics educator creating practice problems. Generate ${count} similar problems based on this template, varying the numbers and context but keeping the same difficulty and concept.

**Template Problem:**
${JSON.stringify(templateProblem, null, 2)}

**Your Task:**
Generate ${count} unique variations that:
- Test the same mathematical concept
- Have the same difficulty level
- Use different numbers/values
- Have different contexts where applicable
- Include complete solutions (steps and hints)

Respond with a JSON array of problems.`;

            const response = await this.client.messages.create({
                model: this.model,
                max_tokens: 4000,
                messages: [{
                    role: 'user',
                    content: prompt
                }]
            });

            const aiResponse = response.content[0].text;
            const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/) ||
                aiResponse.match(/\[[\s\S]*\]/);

            if (jsonMatch) {
                const problems = JSON.parse(jsonMatch[0].replace(/```json|```/g, ''));
                console.log(`✅ Generated ${problems.length} similar problems`);
                return problems;
            }

            throw new Error('Failed to parse generated problems');
        } catch (error) {
            console.error('❌ Error generating problems:', error);
            return [];
        }
    }

    /**
     * Utility: Delay function
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Utility: Chunk array
     */
    chunkArray(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }

    /**
     * Get difficulty distribution
     */
    getDifficultyDistribution(problems) {
        const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };

        problems.forEach(p => {
            const diff = p.difficulty || 3;
            dist[diff]++;
        });

        return dist;
    }

    /**
     * Get topic distribution
     */
    getTopicDistribution(problems) {
        const dist = {};

        problems.forEach(p => {
            const topic = p.topic || 'unknown';
            dist[topic] = (dist[topic] || 0) + 1;
        });

        return dist;
    }
}

export const aiProblemMapper = new AIProblemMapper();
export default AIProblemMapper;