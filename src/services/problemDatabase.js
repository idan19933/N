// src/services/problemDatabase.js - COMPLETELY FIXED WITH TOPIC MAPPING
import axios from 'axios';

class ProblemDatabase {
    constructor() {
        this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
        this.apiUrl = `${this.baseUrl}/problems`;
    }

    _normalizeTopicName(topic) {
        if (!topic) return null;

        const baseTopic = topic.split('_')[0].toLowerCase();

        // ✅ COMPREHENSIVE TOPIC MAPPING
        const topicMap = {
            // Algebra variations
            'arithmetic': 'algebra',
            'numbers': 'algebra',
            'basic': 'algebra',
            'algebra': 'algebra',
            'equations': 'algebra',
            'linear': 'algebra',
            'quadratic': 'algebra',

            // Geometry variations
            'geometry': 'geometry',
            'triangles': 'geometry',
            'circles': 'geometry',
            'shapes': 'geometry',

            // Powers variations
            'powers': 'powers',
            'exponents': 'powers',
            'roots': 'powers',
            'חזקות': 'powers',

            // Calculus variations
            'calculus': 'calculus',
            'derivatives': 'calculus',
            'integrals': 'calculus',
            'חדו"א': 'calculus',

            // Functions variations
            'functions': 'functions',
            'פונקציות': 'functions',

            // Trigonometry variations
            'trigonometry': 'trigonometry',
            'trig': 'trigonometry',
            'טריגונומטריה': 'trigonometry',

            // Statistics variations
            'statistics': 'statistics',
            'stats': 'statistics',
            'probability': 'statistics',
            'סטטיסטיקה': 'statistics'
        };

        const normalized = topicMap[baseTopic] || topicMap[topic.toLowerCase()] || 'algebra';
        console.log(`🔄 Topic normalized: "${topic}" → "${normalized}"`);
        return normalized;
    }

    async getProblems(filters = {}) {
        try {
            const { topic, difficulty, category, grade, limitCount = 10 } = filters;
            const params = new URLSearchParams();

            if (topic) {
                const normalizedTopic = this._normalizeTopicName(topic);
                params.append('topic', normalizedTopic);
            }

            if (difficulty) params.append('difficulty', difficulty);
            if (category) params.append('category', category);
            if (grade) params.append('grade', grade);
            params.append('limit', limitCount);

            console.log(`📡 Calling: ${this.apiUrl}?${params}`);
            const response = await axios.get(`${this.apiUrl}?${params}`);
            console.log(`✅ Found ${response.data.length} problems from database`);
            return response.data.map(p => this._normalizeProblem(p));
        } catch (error) {
            console.error('❌ Database error:', error.message);
            console.error('❌ URL was:', `${this.apiUrl}`);
            return [];
        }
    }

    async getRandomProblems({ topic, difficulty, count = 1 }) {
        try {
            const params = new URLSearchParams();

            if (topic) {
                const normalizedTopic = this._normalizeTopicName(topic);
                params.append('topic', normalizedTopic);
            }

            if (difficulty) params.append('difficulty', difficulty);
            params.append('count', count);

            console.log(`📡 Calling: ${this.apiUrl}/random?${params}`);
            const response = await axios.get(`${this.apiUrl}/random?${params}`);
            console.log(`✅ Got ${response.data.length} random problems`);
            return response.data.map(p => this._normalizeProblem(p));
        } catch (error) {
            console.error('❌ Database error:', error.message);
            return [];
        }
    }

    async getProgressiveProblems(topic, minLevel = 1, count = 1, maxLevel = null) {
        try {
            const normalizedTopic = this._normalizeTopicName(topic);

            // ✅ Handle difficulty range
            const max = maxLevel || minLevel;
            const difficulties = [];

            for (let i = minLevel; i <= max; i++) {
                difficulties.push(i);
            }

            const params = new URLSearchParams();
            if (normalizedTopic) params.append('topic', normalizedTopic);
            params.append('difficulties', difficulties.join(','));
            params.append('count', count);

            console.log(`📡 Calling: ${this.apiUrl}/progressive?${params}`);
            const response = await axios.get(`${this.apiUrl}/progressive?${params}`);
            console.log(`✅ Got ${response.data.length} progressive problems (Difficulty ${minLevel}-${max})`);
            return response.data.map(p => this._normalizeProblem(p));
        } catch (error) {
            console.error('❌ Database error:', error.message);
            return [];
        }
    }

    async getProblemsForStudent(nexonProfile, count = 5) {
        const { topicMastery } = nexonProfile;
        const strugglingTopics = Object.entries(topicMastery || {})
            .filter(([_, level]) => level === 'struggle' || level === 'needs-work')
            .map(([topic]) => this._mapHebrewToEnglish(topic));

        let problems = [];
        for (const topic of strugglingTopics.slice(0, 3)) {
            if (problems.length >= count) break;
            try {
                const topicProblems = await this.getRandomProblems({
                    topic,
                    count: Math.ceil(count / Math.min(strugglingTopics.length, 3))
                });
                problems.push(...topicProblems);
            } catch (error) {
                console.error(`Error fetching ${topic}:`, error);
            }
        }

        if (problems.length < count) {
            const remaining = count - problems.length;
            const generalProblems = await this.getRandomProblems({ count: remaining });
            problems.push(...generalProblems);
        }

        return problems.slice(0, count);
    }

    async getStatistics() {
        try {
            const response = await axios.get(`${this.apiUrl}/stats`);
            console.log('📊 Database stats:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Stats error:', error.message);
            return { total: 0, byTopic: {}, byDifficulty: {} };
        }
    }

    async healthCheck() {
        try {
            const response = await axios.get(`${this.apiUrl}/health`);
            return response.data;
        } catch (error) {
            console.error('❌ Health check failed:', error.message);
            return { status: 'error', database: 'disconnected' };
        }
    }

    async bulkAddProblems(problems) {
        try {
            const response = await axios.post(`${this.apiUrl}/bulk`, { problems });
            console.log(`✅ Bulk inserted ${response.data.count} problems`);
            return response.data;
        } catch (error) {
            console.error('❌ Bulk insert error:', error.message);
            throw error;
        }
    }

    _normalizeProblem(dbProblem) {
        return {
            id: dbProblem.id,
            question: dbProblem.question,
            answer: dbProblem.answer,
            steps: typeof dbProblem.steps === 'string' ? JSON.parse(dbProblem.steps) : dbProblem.steps || [],
            hints: typeof dbProblem.hints === 'string' ? JSON.parse(dbProblem.hints) : dbProblem.hints || [],
            difficulty: dbProblem.difficulty,
            topic: dbProblem.topic,
            category: dbProblem.category,
            subcategory: dbProblem.subcategory,
            grade: dbProblem.grade,
            tier: dbProblem.tier,
            source: 'database',
            requiresSteps: true,
            hasAISteps: true
        };
    }

    _mapHebrewToEnglish(hebrewTopic) {
        const mapping = {
            'גאומטריה': 'geometry',
            'משולשים': 'geometry',
            'מעגל': 'geometry',
            'אלגברה': 'algebra',
            'משוואות': 'algebra',
            'ביטויים': 'algebra',
            'חזקות': 'powers',
            'שורשים': 'powers',
            'חזקות ושורשים': 'powers',
            'חשבון אינפיניטסימלי': 'calculus',
            'נגזרות': 'calculus',
            'אינטגרלים': 'calculus',
            'טריגונומטריה': 'trigonometry',
            'פונקציות': 'functions',
            'הסתברות': 'statistics',
            'סטטיסטיקה': 'statistics'
        };

        for (const [hebrew, english] of Object.entries(mapping)) {
            if (hebrewTopic.includes(hebrew)) return english;
        }
        return 'algebra';
    }
}

export const problemDatabase = new ProblemDatabase();
export default ProblemDatabase;