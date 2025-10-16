// src/services/problemService.js - WITH DIFFICULTY RANGE SUPPORT
import { problemDatabase } from './problemDatabase';
import { intelligentValidator } from './intelligentValidator';

class ProblemService {
    constructor() {
        this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
        this.progressTracker = this._loadProgressTracker();
    }

    _loadProgressTracker() {
        try {
            const stored = localStorage.getItem('nexon_progress_tracker');
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            console.error('Error loading progress:', error);
            return {};
        }
    }

    _saveProgressTracker() {
        try {
            localStorage.setItem('nexon_progress_tracker', JSON.stringify(this.progressTracker));
        } catch (error) {
            console.error('❌ Error saving progress:', error);
        }
    }

    getCurrentDifficultyLevel(topic) {
        if (!this.progressTracker[topic]) {
            this.progressTracker[topic] = {
                currentLevel: 1,
                correctCount: 0,
                totalCount: 0,
                streak: 0
            };
        }
        return this.progressTracker[topic].currentLevel;
    }

    updateProgress(topic, isCorrect) {
        if (!this.progressTracker[topic]) {
            this.progressTracker[topic] = {
                currentLevel: 1,
                correctCount: 0,
                totalCount: 0,
                streak: 0
            };
        }

        const progress = this.progressTracker[topic];
        progress.totalCount++;

        if (isCorrect) {
            progress.correctCount++;
            progress.streak++;

            if (progress.streak >= 3 && progress.currentLevel < 7) {
                progress.currentLevel++;
                progress.streak = 0;
                console.log(`🎉 LEVEL UP! Now at level ${progress.currentLevel} for ${topic}`);
            }
        } else {
            if (progress.streak > 0) {
                progress.streak = 0;
            } else {
                progress.streak--;
            }

            if (progress.streak <= -3 && progress.currentLevel > 1) {
                progress.currentLevel--;
                progress.streak = 0;
                console.log(`📉 Level down: ${topic} now at level ${progress.currentLevel}`);
            }
        }

        this._saveProgressTracker();
        return progress;
    }

    getProgressInfo(topic) {
        const progress = this.progressTracker[topic] || {
            currentLevel: 1,
            correctCount: 0,
            totalCount: 0,
            streak: 0
        };

        const accuracy = progress.totalCount > 0
            ? Math.round((progress.correctCount / progress.totalCount) * 100)
            : 0;

        return {
            level: progress.currentLevel,
            streak: progress.streak,
            accuracy,
            total: progress.totalCount,
            correct: progress.correctCount,
            nextLevelIn: progress.streak > 0 ? (3 - progress.streak) : null,
            levelName: this._getLevelName(progress.currentLevel)
        };
    }

    _getLevelName(level) {
        const names = {
            1: 'Beginner 🌱',
            2: 'Learning 📚',
            3: 'Intermediate 💡',
            4: 'Advanced 🎯',
            5: 'Expert 🌟',
            6: 'Master 👑',
            7: 'Genius 🔥'
        };
        return names[level] || 'Unknown';
    }

    async getRandomProblems(topic, levelOrRange, count = 1) {
        console.log(`🔍 Fetching ${count} problems for ${topic} from DATABASE`);

        try {
            let difficulties;

            // ✅ Handle both single level and difficulty range
            if (Array.isArray(levelOrRange)) {
                // It's a range [min, max]
                difficulties = levelOrRange;
                console.log(`🎯 Using difficulty range: ${difficulties[0]}-${difficulties[1]}`);
            } else if (typeof levelOrRange === 'string') {
                // It's a level name, convert to range
                const levelMap = {
                    'beginner': [1, 2],
                    'easy': [2, 3],
                    'intermediate': [3, 5],
                    'hard': [5, 6],
                    'expert': [6, 7]
                };
                difficulties = levelMap[levelOrRange] || [3, 5];
                console.log(`📊 Converted "${levelOrRange}" to range: ${difficulties[0]}-${difficulties[1]}`);
            } else {
                // It's a single number level
                const userLevel = levelOrRange || this.getCurrentDifficultyLevel(topic);
                difficulties = [
                    Math.max(1, userLevel - 1),
                    userLevel,
                    Math.min(7, userLevel + 1)
                ];
                console.log(`👤 Using user level ${userLevel}, range: ${difficulties[0]}-${difficulties[2]}`);
            }

            // Get problems from database with difficulty range
            const problems = await problemDatabase.getProgressiveProblems(
                topic,
                difficulties[0], // min difficulty
                count,
                difficulties[1] || difficulties[0]  // max difficulty
            );

            if (problems.length > 0) {
                console.log(`✅ Got ${problems.length} problems from DATABASE`);
                return problems.map(p => ({
                    ...p,
                    source: 'database',
                    hasAISteps: p.steps && p.steps.length > 0
                }));
            }

            console.log('⚠️ No problems at specified difficulty, trying fallback...');
            const fallbackProblems = await problemDatabase.getRandomProblems({
                topic: topic,
                count: count
            });

            console.log(`📦 Got ${fallbackProblems.length} from DATABASE (fallback)`);
            return fallbackProblems.map(p => ({
                ...p,
                source: 'database',
                hasAISteps: p.steps && p.steps.length > 0
            }));

        } catch (error) {
            console.error('❌ Error fetching from database:', error);
            return [];
        }
    }

    async getProblemsForStudent(nexonProfile, count = 5) {
        if (!nexonProfile) {
            console.log('No profile, getting general problems');
            return this.getRandomProblems('geometry', 'intermediate', count);
        }

        console.log('Getting problems for student profile:', nexonProfile.name);
        const problems = await problemDatabase.getProblemsForStudent(nexonProfile, count);

        return problems.map(p => ({
            ...p,
            source: 'database',
            hasAISteps: p.steps && p.steps.length > 0
        }));
    }

    async validateAnswer(problem, userAnswer, currentStep = null) {
        return await intelligentValidator.validateAnswer(problem, userAnswer, currentStep);
    }

    getContextualHint(problem, userAnswer, attemptCount) {
        return intelligentValidator.getContextualHint(problem, userAnswer, attemptCount);
    }

    getDetailedFeedback(problem, userAnswer, isCorrect) {
        return intelligentValidator.getDetailedFeedback(problem, userAnswer, isCorrect);
    }

    async recordAttempt(userId, problemId, isCorrect, timeSpent, hintsUsed, steps = []) {
        try {
            let topic = 'unknown';

            if (problemId && typeof problemId === 'string') {
                const parts = String(problemId).split('_');
                if (parts.length > 0) {
                    topic = parts[0];
                }
            }

            if (topic !== 'unknown') {
                this.updateProgress(topic, isCorrect);
            }

            console.log('📊 Attempt recorded:', {
                userId,
                problemId,
                isCorrect,
                timeSpent,
                topic,
                newLevel: this.getCurrentDifficultyLevel(topic)
            });

            if (this.baseURL) {
                try {
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

                    if (response.ok) {
                        console.log('✅ Attempt recorded to backend');
                        return await response.json();
                    }
                } catch (backendError) {
                    console.log('⚠️ Backend recording failed, continuing with local only');
                }
            }

            return { success: true, source: 'local' };

        } catch (error) {
            console.error('❌ Error recording attempt:', error);
            return { success: false, error: error.message };
        }
    }

    async getStatistics() {
        return await problemDatabase.getStatistics();
    }

    async checkHealth() {
        return await problemDatabase.healthCheck();
    }

    getProgressStats() {
        return {
            tracker: this.progressTracker,
            topics: Object.keys(this.progressTracker),
            summary: Object.entries(this.progressTracker).map(([topic, data]) => ({
                topic,
                level: data.currentLevel,
                levelName: this._getLevelName(data.currentLevel),
                accuracy: data.totalCount > 0
                    ? Math.round((data.correctCount / data.totalCount) * 100)
                    : 0,
                total: data.totalCount,
                correct: data.correctCount,
                streak: data.streak
            }))
        };
    }

    getAllProgress() {
        return Object.keys(this.progressTracker).map(topic => ({
            topic,
            ...this.getProgressInfo(topic)
        }));
    }

    resetProgress(topic) {
        if (this.progressTracker[topic]) {
            delete this.progressTracker[topic];
            this._saveProgressTracker();
            console.log(`🔄 Progress reset for ${topic}`);
        }
    }

    resetAllProgress() {
        this.progressTracker = {};
        localStorage.removeItem('nexon_progress_tracker');
        console.log('🔄 All progress reset');
    }
}

export const problemService = new ProblemService();
export default ProblemService;