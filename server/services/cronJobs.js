// backend/services/cronJobs.js - AUTOMATED TASKS SCHEDULER

const cron = require('node-cron');
const webScraper = require('./webScrapingService');
const aiGenerator = require('./aiQuestionGenerator');
const difficultyEngine = require('./difficultyEngine');
const { pool } = require('../config/database');

class CronJobsManager {
    constructor() {
        this.jobs = new Map();
        this.isInitialized = false;
    }

    /**
     * Initialize all cron jobs
     */
    initialize() {
        if (this.isInitialized) {
            console.log('⚠️ [Cron] Jobs already initialized');
            return;
        }

        console.log('🕐 [Cron] Initializing scheduled tasks...');

        // 1. Web Scraping - Once a week (Sunday at 2 AM)
        this.addJob('webScraping', '0 2 * * 0', async () => {
            console.log('🕷️ [Cron] Running weekly web scraping...');
            try {
                const results = await webScraper.runScheduledScraping();
                console.log('✅ [Cron] Web scraping completed:', results);
            } catch (error) {
                console.error('❌ [Cron] Web scraping failed:', error);
            }
        });

        // 2. AI Question Generation - Daily at 3 AM
        this.addJob('aiGeneration', '0 3 * * *', async () => {
            console.log('🤖 [Cron] Running daily AI question generation...');
            try {
                await this.generateDailyQuestions();
                console.log('✅ [Cron] AI generation completed');
            } catch (error) {
                console.error('❌ [Cron] AI generation failed:', error);
            }
        });

        // 3. Difficulty Update - Every 6 hours
        this.addJob('difficultyUpdate', '0 */6 * * *', async () => {
            console.log('📊 [Cron] Running difficulty updates...');
            try {
                await this.updateAllDifficulties();
                console.log('✅ [Cron] Difficulty updates completed');
            } catch (error) {
                console.error('❌ [Cron] Difficulty update failed:', error);
            }
        });

        // 4. Clean Old Data - Weekly (Monday at 4 AM)
        this.addJob('dataCleanup', '0 4 * * 1', async () => {
            console.log('🧹 [Cron] Running data cleanup...');
            try {
                await this.cleanOldData();
                console.log('✅ [Cron] Data cleanup completed');
            } catch (error) {
                console.error('❌ [Cron] Data cleanup failed:', error);
            }
        });

        // 5. Update Question Quality Scores - Daily at 5 AM
        this.addJob('qualityUpdate', '0 5 * * *', async () => {
            console.log('⭐ [Cron] Updating question quality scores...');
            try {
                await this.updateQuestionQuality();
                console.log('✅ [Cron] Quality update completed');
            } catch (error) {
                console.error('❌ [Cron] Quality update failed:', error);
            }
        });

        // 6. Generate Performance Reports - Weekly (Sunday at 6 AM)
        this.addJob('performanceReports', '0 6 * * 0', async () => {
            console.log('📊 [Cron] Generating performance reports...');
            try {
                await this.generatePerformanceReports();
                console.log('✅ [Cron] Performance reports completed');
            } catch (error) {
                console.error('❌ [Cron] Performance reports failed:', error);
            }
        });

        // 7. Cache Cleanup - Every hour
        this.addJob('cacheCleanup', '0 * * * *', async () => {
            console.log('🧹 [Cron] Cleaning cache...');
            try {
                const questionService = require('./enhancedQuestionService');
                questionService.clearCache();
                console.log('✅ [Cron] Cache cleaned');
            } catch (error) {
                console.error('❌ [Cron] Cache cleanup failed:', error);
            }
        });

        this.isInitialized = true;
        console.log(`✅ [Cron] ${this.jobs.size} jobs initialized successfully`);
    }

    /**
     * Add a cron job
     */
    addJob(name, schedule, task) {
        if (this.jobs.has(name)) {
            console.warn(`⚠️ [Cron] Job ${name} already exists`);
            return;
        }

        const job = cron.schedule(schedule, task, {
            scheduled: true,
            timezone: "Asia/Jerusalem"
        });

        this.jobs.set(name, {
            job,
            schedule,
            task,
            lastRun: null,
            runCount: 0
        });

        console.log(`✅ [Cron] Job '${name}' scheduled: ${schedule}`);
    }

    /**
     * Generate questions for popular topics daily
     */
    async generateDailyQuestions() {
        try {
            // Get most practiced topics
            const query = `
                SELECT 
                    qb.topic,
                    qb.grade_level,
                    COUNT(*) as practice_count
                FROM student_question_history sqh
                JOIN question_bank qb ON sqh.question_id = qb.id
                WHERE sqh.created_at >= NOW() - INTERVAL '7 days'
                GROUP BY qb.topic, qb.grade_level
                ORDER BY practice_count DESC
                LIMIT 10
            `;

            const result = await pool.query(query);
            const topics = result.rows;

            let totalGenerated = 0;

            for (const topicData of topics) {
                try {
                    // Generate 5 questions per difficulty level
                    for (const difficulty of ['easy', 'medium', 'hard']) {
                        const questions = await aiGenerator.generateQuestions({
                            topic: topicData.topic,
                            difficulty,
                            gradeLevel: topicData.grade_level,
                            count: 5,
                            personality: 'nexon'
                        });

                        totalGenerated += questions.length;
                    }
                } catch (error) {
                    console.error(`Error generating for topic ${topicData.topic}:`, error.message);
                }
            }

            console.log(`✅ [AI Generation] Generated ${totalGenerated} questions for ${topics.length} topics`);
            return totalGenerated;
        } catch (error) {
            console.error('❌ [AI Generation] Failed:', error);
            return 0;
        }
    }

    /**
     * Update difficulties for active users
     */
    async updateAllDifficulties() {
        try {
            // Get users active in last 24 hours
            const query = `
                SELECT DISTINCT user_id
                FROM student_question_history
                WHERE created_at >= NOW() - INTERVAL '24 hours'
            `;

            const result = await pool.query(query);
            const users = result.rows;

            let updatedCount = 0;

            for (const user of users) {
                try {
                    await difficultyEngine.updateAllDifficulties(user.user_id);
                    updatedCount++;
                } catch (error) {
                    console.error(`Error updating difficulty for user ${user.user_id}:`, error.message);
                }
            }

            console.log(`✅ [Difficulty Update] Updated ${updatedCount} users`);
            return updatedCount;
        } catch (error) {
            console.error('❌ [Difficulty Update] Failed:', error);
            return 0;
        }
    }

    /**
     * Clean old data
     */
    async cleanOldData() {
        try {
            // Delete old scraping logs (keep last 3 months)
            const deleteLogsQuery = `
                DELETE FROM scraping_logs
                WHERE created_at < NOW() - INTERVAL '3 months'
            `;

            const logsResult = await pool.query(deleteLogsQuery);
            console.log(`🗑️ [Cleanup] Deleted ${logsResult.rowCount} old scraping logs`);

            // Clean old recommendation cache (older than 7 days)
            const deleteCacheQuery = `
                DELETE FROM recommendation_cache
                WHERE generated_at < NOW() - INTERVAL '7 days'
            `;

            const cacheResult = await pool.query(deleteCacheQuery);
            console.log(`🗑️ [Cleanup] Deleted ${cacheResult.rowCount} old cache entries`);

            // Archive old question history (older than 1 year)
            // In production, you might want to move to archive table instead of delete
            const archiveQuery = `
                DELETE FROM student_question_history
                WHERE created_at < NOW() - INTERVAL '1 year'
                AND user_id IN (
                    SELECT user_id 
                    FROM student_question_history 
                    WHERE created_at >= NOW() - INTERVAL '6 months'
                )
            `;

            const archiveResult = await pool.query(archiveQuery);
            console.log(`📦 [Cleanup] Archived ${archiveResult.rowCount} old history entries`);

            return {
                logsDeleted: logsResult.rowCount,
                cacheDeleted: cacheResult.rowCount,
                historyArchived: archiveResult.rowCount
            };
        } catch (error) {
            console.error('❌ [Cleanup] Failed:', error);
            return null;
        }
    }

    /**
     * Update question quality scores
     */
    async updateQuestionQuality() {
        try {
            const query = `
                UPDATE question_bank qb
                SET quality_score = LEAST(100, GREATEST(0,
                    50 + -- Base score
                    (CASE 
                        WHEN usage_count > 0 THEN 
                            (success_rate - 50) / 2 -- Adjust based on success rate
                        ELSE 0 
                    END) +
                    (CASE 
                        WHEN usage_count >= 10 THEN 10 -- Bonus for well-tested questions
                        WHEN usage_count >= 5 THEN 5
                        ELSE 0 
                    END) +
                    (CASE 
                        WHEN source = 'ai_generated' AND is_verified THEN 15 -- Bonus for verified AI
                        WHEN source = 'web_scrape' THEN 10 -- Bonus for scraped
                        WHEN source = 'curriculum' THEN 20 -- Highest bonus for curriculum
                        ELSE 0 
                    END) -
                    (CASE 
                        WHEN EXISTS (
                            SELECT 1 FROM question_feedback qf 
                            WHERE qf.question_id = qb.id 
                            AND qf.feedback_type IN ('error', 'confusing')
                        ) THEN 20 -- Penalty for negative feedback
                        ELSE 0 
                    END)
                ))
                WHERE usage_count > 0
            `;

            const result = await pool.query(query);
            console.log(`✅ [Quality Update] Updated ${result.rowCount} questions`);

            return result.rowCount;
        } catch (error) {
            console.error('❌ [Quality Update] Failed:', error);
            return 0;
        }
    }

    /**
     * Generate weekly performance reports
     */
    async generatePerformanceReports() {
        try {
            // System-wide statistics
            const statsQuery = `
                SELECT 
                    COUNT(DISTINCT user_id) as active_users,
                    COUNT(*) as total_questions_answered,
                    AVG(CASE WHEN is_correct THEN 100.0 ELSE 0.0 END) as avg_accuracy,
                    AVG(time_spent_seconds) as avg_time
                FROM student_question_history
                WHERE created_at >= NOW() - INTERVAL '7 days'
            `;

            const statsResult = await pool.query(statsQuery);
            const stats = statsResult.rows[0];

            // Question bank statistics
            const bankQuery = `
                SELECT 
                    source,
                    COUNT(*) as count,
                    AVG(quality_score) as avg_quality
                FROM question_bank
                WHERE is_active = true
                GROUP BY source
            `;

            const bankResult = await pool.query(bankQuery);
            const bankStats = bankResult.rows;

            console.log('📊 [Performance Report] Weekly Statistics:', {
                activeUsers: stats.active_users,
                totalQuestions: stats.total_questions_answered,
                avgAccuracy: parseFloat(stats.avg_accuracy).toFixed(2) + '%',
                avgTime: parseFloat(stats.avg_time).toFixed(0) + 's',
                questionBank: bankStats
            });

            // Save report to database (optional)
            // You could create a reports table and save this data

            return stats;
        } catch (error) {
            console.error('❌ [Performance Report] Failed:', error);
            return null;
        }
    }

    /**
     * Stop a specific job
     */
    stopJob(name) {
        const jobData = this.jobs.get(name);
        if (jobData) {
            jobData.job.stop();
            console.log(`⏸️ [Cron] Job '${name}' stopped`);
            return true;
        }
        return false;
    }

    /**
     * Start a specific job
     */
    startJob(name) {
        const jobData = this.jobs.get(name);
        if (jobData) {
            jobData.job.start();
            console.log(`▶️ [Cron] Job '${name}' started`);
            return true;
        }
        return false;
    }

    /**
     * Stop all jobs
     */
    stopAll() {
        this.jobs.forEach((jobData, name) => {
            jobData.job.stop();
        });
        console.log('⏸️ [Cron] All jobs stopped');
    }

    /**
     * Start all jobs
     */
    startAll() {
        this.jobs.forEach((jobData, name) => {
            jobData.job.start();
        });
        console.log('▶️ [Cron] All jobs started');
    }

    /**
     * Get job status
     */
    getJobStatus(name) {
        const jobData = this.jobs.get(name);
        if (!jobData) {
            return null;
        }

        return {
            name,
            schedule: jobData.schedule,
            lastRun: jobData.lastRun,
            runCount: jobData.runCount,
            isRunning: jobData.job.getStatus() === 'running'
        };
    }

    /**
     * Get all jobs status
     */
    getAllStatus() {
        const status = [];
        this.jobs.forEach((jobData, name) => {
            status.push(this.getJobStatus(name));
        });
        return status;
    }

    /**
     * Manually run a job
     */
    async runJobNow(name) {
        const jobData = this.jobs.get(name);
        if (!jobData) {
            throw new Error(`Job '${name}' not found`);
        }

        console.log(`🚀 [Cron] Manually running job '${name}'...`);

        try {
            await jobData.task();
            jobData.lastRun = new Date();
            jobData.runCount++;
            console.log(`✅ [Cron] Job '${name}' completed successfully`);
            return true;
        } catch (error) {
            console.error(`❌ [Cron] Job '${name}' failed:`, error);
            throw error;
        }
    }
}

// Export singleton instance
const cronManager = new CronJobsManager();

// Initialize on import
if (process.env.NODE_ENV !== 'test') {
    cronManager.initialize();
}

module.exports = cronManager;