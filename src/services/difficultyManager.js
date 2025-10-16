// src/services/difficultyManager.js - ENHANCED 7-TIER PROGRESSION SYSTEM

class DifficultyManager {
    constructor() {
        // 7-tier system for progressive difficulty
        this.tiers = {
            1: { name: 'התחלה • Beginner', color: 'green', requiredCorrect: 3 },
            2: { name: 'מתקדם קל • Easy Advanced', color: 'emerald', requiredCorrect: 4 },
            3: { name: 'בינוני • Intermediate', color: 'blue', requiredCorrect: 4 },
            4: { name: 'בינוני-גבוה • Upper Intermediate', color: 'indigo', requiredCorrect: 5 },
            5: { name: 'מתקדם • Advanced', color: 'purple', requiredCorrect: 5 },
            6: { name: 'מומחה • Expert', color: 'pink', requiredCorrect: 6 },
            7: { name: 'מאסטר • Master', color: 'red', requiredCorrect: 7 }
        };

        // Track progress per operation type
        this.progress = this.loadProgress();
    }

    // Load progress from localStorage
    loadProgress() {
        try {
            const saved = localStorage.getItem('nexon_difficulty_progress');
            return saved ? JSON.parse(saved) : {};
        } catch (error) {
            console.error('Failed to load progress:', error);
            return {};
        }
    }

    // Save progress to localStorage
    saveProgress() {
        try {
            localStorage.setItem('nexon_difficulty_progress', JSON.stringify(this.progress));
        } catch (error) {
            console.error('Failed to save progress:', error);
        }
    }

    // Initialize tracking for a new operation
    initializeOperation(operationKey) {
        if (!this.progress[operationKey]) {
            this.progress[operationKey] = {
                currentTier: 1,
                correctInTier: 0,
                totalAttempts: 0,
                totalCorrect: 0,
                streak: 0,
                lastAttempt: Date.now(),
                history: []
            };
            this.saveProgress();
        }
    }

    // Record an attempt
    recordAttempt(operationKey, isCorrect) {
        this.initializeOperation(operationKey);

        const data = this.progress[operationKey];
        data.totalAttempts++;
        data.lastAttempt = Date.now();

        if (isCorrect) {
            data.totalCorrect++;
            data.correctInTier++;
            data.streak++;

            // Check for tier promotion
            const currentTier = this.tiers[data.currentTier];
            if (data.correctInTier >= currentTier.requiredCorrect) {
                if (data.currentTier < 7) {
                    data.currentTier++;
                    data.correctInTier = 0;
                    console.log(`🎉 TIER UP! Now at Tier ${data.currentTier}: ${this.tiers[data.currentTier].name}`);
                }
            }
        } else {
            data.streak = 0;
            // Optionally reduce correctInTier on mistake (but don't drop tier)
            if (data.correctInTier > 0) {
                data.correctInTier = Math.max(0, data.correctInTier - 1);
            }
        }

        // Keep last 20 attempts
        data.history.push({ isCorrect, timestamp: Date.now(), tier: data.currentTier });
        if (data.history.length > 20) {
            data.history.shift();
        }

        this.saveProgress();

        console.log(`📊 Progress for ${operationKey}:`, {
            tier: data.currentTier,
            correctInTier: data.correctInTier,
            streak: data.streak,
            accuracy: ((data.totalCorrect / data.totalAttempts) * 100).toFixed(1) + '%'
        });
    }

    // Get current tier for operation
    getCurrentTier(operationKey) {
        this.initializeOperation(operationKey);
        return this.progress[operationKey].currentTier;
    }

    // Get progress info
    getProgressInfo(operationKey) {
        this.initializeOperation(operationKey);
        const data = this.progress[operationKey];
        const tierInfo = this.tiers[data.currentTier];

        return {
            currentTier: data.currentTier,
            tierName: tierInfo.name,
            tierColor: tierInfo.color,
            correctInTier: data.correctInTier,
            requiredForNext: tierInfo.requiredCorrect,
            nextTierIn: tierInfo.requiredCorrect - data.correctInTier,
            totalCorrect: data.totalCorrect,
            totalAttempts: data.totalAttempts,
            accuracy: data.totalAttempts > 0 ? ((data.totalCorrect / data.totalAttempts) * 100).toFixed(1) : 0,
            streak: data.streak,
            isMaxTier: data.currentTier === 7
        };
    }

    // Get all progress (for dashboard)
    getAllProgress() {
        return Object.entries(this.progress).map(([key, data]) => ({
            operation: key,
            ...this.getProgressInfo(key)
        }));
    }

    // Reset progress for an operation
    resetOperation(operationKey) {
        delete this.progress[operationKey];
        this.saveProgress();
    }

    // Reset all progress
    resetAll() {
        this.progress = {};
        this.saveProgress();
        localStorage.removeItem('nexon_difficulty_progress');
    }

    // Get tier recommendation based on mastery level
    getTierFromMastery(mastery) {
        switch(mastery) {
            case 'struggle': return 1;
            case 'needs-work': return 2;
            case 'good': return 4;
            default: return 2;
        }
    }

    // Initialize from student profile
    initializeFromProfile(nexonProfile) {
        if (!nexonProfile?.topicMastery) return;

        const { topicMastery } = nexonProfile;

        // For each topic, set initial tier
        Object.entries(topicMastery).forEach(([topic, mastery]) => {
            const tier = this.getTierFromMastery(mastery);

            // Map to operation keys (you might need to customize this)
            const operations = this.getOperationsForTopic(topic);
            operations.forEach(op => {
                if (!this.progress[op]) {
                    this.progress[op] = {
                        currentTier: tier,
                        correctInTier: 0,
                        totalAttempts: 0,
                        totalCorrect: 0,
                        streak: 0,
                        lastAttempt: Date.now(),
                        history: []
                    };
                }
            });
        });

        this.saveProgress();
    }

    // Map topic to operations (customize based on your needs)
    getOperationsForTopic(topic) {
        if (topic.includes('נגזרות') || topic.includes('דיפרנציאלי')) {
            return ['calculus_derive'];
        }
        if (topic.includes('אינטגרל')) {
            return ['calculus_integrate'];
        }
        if (topic.includes('משוואות')) {
            return ['algebra_solve', 'algebra_simplify'];
        }
        if (topic.includes('ביטויים')) {
            return ['algebra_simplify', 'algebra_factor'];
        }
        return ['algebra_simplify'];
    }

    // Get recommended tier based on recent performance
    getAdaptiveTier(operationKey) {
        this.initializeOperation(operationKey);
        const data = this.progress[operationKey];

        // If struggling (low accuracy), stay at current tier or drop
        if (data.totalAttempts >= 5) {
            const accuracy = (data.totalCorrect / data.totalAttempts) * 100;

            if (accuracy < 40 && data.currentTier > 1) {
                console.log(`📉 Low accuracy (${accuracy.toFixed(1)}%) - staying at Tier ${data.currentTier}`);
                return data.currentTier;
            }

            if (accuracy > 80 && data.correctInTier >= 2 && data.currentTier < 7) {
                console.log(`📈 High accuracy (${accuracy.toFixed(1)}%) - consider Tier ${data.currentTier + 1}`);
                return Math.min(7, data.currentTier + 1);
            }
        }

        return data.currentTier;
    }
}

export const difficultyManager = new DifficultyManager();
export default DifficultyManager;