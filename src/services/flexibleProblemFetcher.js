// src/services/flexibleProblemFetcher.js - Universal Problem Fetcher
import axios from 'axios';
import Anthropic from '@anthropic-ai/sdk';

class FlexibleProblemFetcher {
    constructor() {
        this.client = new Anthropic({
            apiKey: import.meta.env.VITE_CLAUDE_API_KEY,
            dangerouslyAllowBrowser: true
        });
    }

    /**
     * Universal fetch - handles ANY format
     */
    async fetch(source) {
        console.log('🌐 Fetching from source:', source);

        try {
            // Get raw content
            const rawContent = await this.fetchRawContent(source);

            // Use AI to parse if format is unclear
            if (this.needsAIParsing(rawContent)) {
                console.log('🤖 Using AI to parse unknown format...');
                return await this.aiParse(rawContent);
            }

            // Try standard parsing
            return await this.standardParse(rawContent, source);

        } catch (error) {
            console.error('❌ Fetch error:', error);
            throw error;
        }
    }

    /**
     * Fetch raw content from various sources
     */
    async fetchRawContent(source) {
        // GitHub
        if (source.type === 'github' || (source.owner && source.repo)) {
            const url = `https://raw.githubusercontent.com/${source.owner}/${source.repo}/main/${source.path}`;
            const response = await axios.get(url);
            return { data: response.data, format: this.detectFormat(source.path) };
        }

        // Direct URL
        if (source.url) {
            const response = await axios.get(source.url);
            return { data: response.data, format: this.detectFormat(source.url) };
        }

        // Text input
        if (source.text) {
            return { data: source.text, format: 'text' };
        }

        throw new Error('Invalid source configuration');
    }

    /**
     * Detect format from URL/filename
     */
    detectFormat(urlOrPath) {
        const lower = urlOrPath.toLowerCase();

        if (lower.endsWith('.json')) return 'json';
        if (lower.endsWith('.csv')) return 'csv';
        if (lower.endsWith('.xml')) return 'xml';
        if (lower.endsWith('.txt')) return 'text';
        if (lower.endsWith('.md')) return 'markdown';
        if (lower.endsWith('.html')) return 'html';

        return 'unknown';
    }

    /**
     * Check if AI parsing is needed
     */
    needsAIParsing(rawContent) {
        const { data, format } = rawContent;

        // Unknown format always needs AI
        if (format === 'unknown' || format === 'text') {
            return true;
        }

        // HTML/Markdown might need AI
        if (format === 'html' || format === 'markdown') {
            return true;
        }

        // Malformed JSON/CSV might need AI
        if (typeof data === 'string' && !this.isValidStructuredData(data, format)) {
            return true;
        }

        return false;
    }

    /**
     * Check if data is valid structured format
     */
    isValidStructuredData(data, format) {
        try {
            if (format === 'json') {
                JSON.parse(data);
                return true;
            }
            if (format === 'csv') {
                return data.includes(',') && data.split('\n').length > 1;
            }
            return false;
        } catch {
            return false;
        }
    }

    /**
     * AI-powered parsing for any format
     */
    async aiParse(rawContent) {
        const { data } = rawContent;

        console.log('🤖 AI parsing content...');

        const prompt = `You are a data extraction expert. Extract math problems from the following content. The content may be in ANY format (HTML, Markdown, plain text, table, etc.).

**Content:**
${typeof data === 'string' ? data.substring(0, 10000) : JSON.stringify(data).substring(0, 10000)}

**Your Task:**
Extract ALL math problems you can find and convert them to a structured JSON array. For each problem, extract:
- question: The problem text
- answer: The solution (if provided)
- hints: Any hints given (if available)
- topic: Math topic if you can determine it
- Any other relevant metadata

**Output Format:**
Respond ONLY with a JSON array:

\`\`\`json
[
  {
    "question": "Problem text here",
    "answer": "Answer here",
    "hints": ["hint 1", "hint 2"],
    "topic": "algebra",
    "metadata": {}
  }
]
\`\`\`

If no problems found, return empty array [].`;

        try {
            const response = await this.client.messages.create({
                model: 'claude-sonnet-4-5-20250929',
                max_tokens: 4000,
                messages: [{
                    role: 'user',
                    content: prompt
                }]
            });

            const aiResponse = response.content[0].text;

            // Extract JSON
            const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/) ||
                aiResponse.match(/\[[\s\S]*\]/);

            if (jsonMatch) {
                const problems = JSON.parse(jsonMatch[0].replace(/```json|```/g, ''));
                console.log(`✅ AI extracted ${problems.length} problems`);
                return problems;
            }

            console.warn('⚠️ AI could not extract problems');
            return [];

        } catch (error) {
            console.error('❌ AI parsing error:', error);
            throw error;
        }
    }

    /**
     * Standard parsing for known formats
     */
    async standardParse(rawContent, source) {
        const { data, format } = rawContent;

        console.log(`📄 Standard parsing: ${format}`);

        switch (format) {
            case 'json':
                return this.parseJSON(data);

            case 'csv':
                return this.parseCSV(data);

            case 'xml':
                return this.parseXML(data);

            default:
                // Fall back to AI parsing
                return await this.aiParse(rawContent);
        }
    }

    /**
     * Parse JSON format
     */
    parseJSON(data) {
        try {
            const parsed = typeof data === 'string' ? JSON.parse(data) : data;

            // Handle various JSON structures
            if (Array.isArray(parsed)) {
                return parsed;
            }

            if (parsed.problems) {
                return parsed.problems;
            }

            if (parsed.exercises) {
                return parsed.exercises;
            }

            if (parsed.questions) {
                return parsed.questions;
            }

            // Single problem
            if (parsed.question || parsed.problem) {
                return [parsed];
            }

            console.warn('⚠️ Unexpected JSON structure');
            return [];

        } catch (error) {
            console.error('❌ JSON parse error:', error);
            throw error;
        }
    }

    /**
     * Parse CSV format
     */
    parseCSV(data) {
        try {
            const text = typeof data === 'string' ? data : JSON.stringify(data);
            const lines = text.split('\n').filter(line => line.trim());

            if (lines.length < 2) {
                console.warn('⚠️ CSV has no data rows');
                return [];
            }

            // Parse header
            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

            // Parse rows
            const problems = [];
            for (let i = 1; i < lines.length; i++) {
                const values = this.parseCSVLine(lines[i]);

                if (values.length !== headers.length) {
                    console.warn(`⚠️ Row ${i} has ${values.length} columns, expected ${headers.length}`);
                    continue;
                }

                const problem = {};
                headers.forEach((header, index) => {
                    problem[header] = values[index];
                });

                problems.push(problem);
            }

            console.log(`✅ Parsed ${problems.length} problems from CSV`);
            return problems;

        } catch (error) {
            console.error('❌ CSV parse error:', error);
            throw error;
        }
    }

    /**
     * Parse CSV line handling quotes and commas
     */
    parseCSVLine(line) {
        const values = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }

        values.push(current.trim());
        return values.map(v => v.replace(/^"|"$/g, ''));
    }

    /**
     * Parse XML format (basic)
     */
    parseXML(data) {
        try {
            const text = typeof data === 'string' ? data : JSON.stringify(data);

            // Extract problems from XML
            const problemPattern = /<problem>([\s\S]*?)<\/problem>/gi;
            const matches = [...text.matchAll(problemPattern)];

            const problems = matches.map(match => {
                const problemXML = match[1];

                return {
                    question: this.extractXMLTag(problemXML, 'question'),
                    answer: this.extractXMLTag(problemXML, 'answer'),
                    hints: this.extractXMLTag(problemXML, 'hints')?.split(';') || [],
                    topic: this.extractXMLTag(problemXML, 'topic'),
                    difficulty: this.extractXMLTag(problemXML, 'difficulty')
                };
            });

            console.log(`✅ Parsed ${problems.length} problems from XML`);
            return problems;

        } catch (error) {
            console.error('❌ XML parse error:', error);
            throw error;
        }
    }

    /**
     * Extract XML tag content
     */
    extractXMLTag(xml, tagName) {
        const regex = new RegExp(`<${tagName}>(.*?)<\/${tagName}>`, 's');
        const match = xml.match(regex);
        return match ? match[1].trim() : null;
    }

    /**
     * Fetch from free public APIs
     */
    async fetchFromPublicAPI(apiName) {
        const apis = {
            // Add any free math problem APIs here
            'sample': 'https://example.com/api/problems',
            'openstax': 'https://openstax.org/api/problems'
        };

        if (!apis[apiName]) {
            throw new Error(`Unknown API: ${apiName}`);
        }

        return await this.fetch({ url: apis[apiName] });
    }

    /**
     * Fetch from text input (paste problems)
     */
    async fetchFromText(text) {
        console.log('📝 Parsing text input...');

        // Use AI to extract problems from any text format
        return await this.aiParse({ data: text, format: 'text' });
    }

    /**
     * Fetch from image (OCR) - for future implementation
     */
    async fetchFromImage(imageUrl) {
        // Future: Use Claude's vision API or OCR service
        throw new Error('Image OCR not yet implemented');
    }
}

export const flexibleProblemFetcher = new FlexibleProblemFetcher();
export default FlexibleProblemFetcher;