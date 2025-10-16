// src/services/problemService.js - DATABASE + NEWTON HYBRID
import { newtonProblemGenerator } from './newtonProblemGenerator';

class ProblemService {
    constructor() {
        this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
        this.useNewtonForCalcAlgebra = true; // Toggle this!
    }

    async getRandomProblems(topic, level, count = 1) {
        // Use Newton for calculus/algebra if enabled
        const newtonTopics = ['calculus', 'algebra'];

        if (this.useNewtonForCalcAlgebra && newtonTopics.includes(topic)) {
            console.log('🧮 Using Newton generator for', topic);
            try {
                const problems = [];
                for (let i = 0; i < count; i++) {
                    const problem = await newtonProblemGenerator.generateProblem(topic, level);
                    if (problem) problems.push(problem);
                    await new Promise(r => setTimeout(r, 100)); // Rate limit
                }

                if (problems.length > 0) {
                    console.log('✅ Generated', problems.length, 'Newton problems');
                    return problems;
                }
            } catch (error) {
                console.error('❌ Newton failed, trying database:', error);
            }
        }

        // Use database
        return this.getFromDatabase(topic, level, count);
    }

    async getFromDatabase(topic, level, count) {
        try {
            console.log('📡 Fetching from database:', { topic, level, count });

            const url = `${this.baseURL}/problems/random?topic=${topic}&level=${level}&count=${count}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Fetched', data.length, 'problems from database');

            return data;
        } catch (error) {
            console.error('❌ Database fetch failed:', error);
            return [];
        }
    }

    async recordAttempt(userId, problemId, isCorrect, timeSpent, hintsUsed, steps = []) {
        try {
            // Handle Newton-generated IDs (they're strings starting with "newton-")
            const response = await fetch(`${this.baseURL}/attempts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: userId,
                    problem_id: String(problemId),
                    is_correct: isCorrect,
                    time_spent: timeSpent,
                    hints_used: hintsUsed,
                    steps: JSON.stringify(steps),
                    timestamp: new Date().toISOString()
                })
            });
            return await response.json();
        } catch (error) {
            console.error('Error recording attempt:', error);
            return null;
        }
    }
}

export const problemService = new ProblemService();