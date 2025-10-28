// server/services/nexonAskService.js - INTELLIGENT NEXON ASK WITH REAL DATA
import { db } from '../db.js';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
});

class NexonAskService {
    /**
     * Get comprehensive student data for AI context
     */
    async getStudentContext(userId) {
        try {
            console.log('📊 Fetching student context for:', userId);

            // Get student profile
            const profileQuery = `
                SELECT name, grade, track, weak_topics, learning_style, math_feeling
                FROM students 
                WHERE firebase_uid = $1
            `;
            const profileResult = await db.query(profileQuery, [userId]);
            const profile = profileResult.rows[0] || {};

            // Get exercise statistics
            const statsQuery = `
                SELECT 
                    COUNT(*) as total_exercises,
                    SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as correct_exercises,
                    AVG(CASE WHEN is_correct THEN 1 ELSE 0 END) * 100 as accuracy,
                    topic,
                    subtopic
                FROM notebook_entries
                WHERE student_id = $1
                GROUP BY topic, subtopic
                ORDER BY COUNT(*) DESC
            `;
            const statsResult = await db.query(statsQuery, [userId]);
            const topicStats = statsResult.rows;

            // Get recent activity
            const recentQuery = `
                SELECT topic, subtopic, is_correct, created_at, difficulty
                FROM notebook_entries
                WHERE student_id = $1
                ORDER BY created_at DESC
                LIMIT 10
            `;
            const recentResult = await db.query(recentQuery, [userId]);
            const recentActivity = recentResult.rows;

            // Calculate weak topics (accuracy < 60%)
            const weakTopics = topicStats
                .filter(stat => stat.accuracy < 60)
                .map(stat => ({
                    topic: stat.topic,
                    subtopic: stat.subtopic,
                    accuracy: Math.round(stat.accuracy),
                    attempts: parseInt(stat.total_exercises)
                }));

            // Calculate strong topics (accuracy >= 80%)
            const strongTopics = topicStats
                .filter(stat => stat.accuracy >= 80)
                .map(stat => ({
                    topic: stat.topic,
                    subtopic: stat.subtopic,
                    accuracy: Math.round(stat.accuracy),
                    attempts: parseInt(stat.total_exercises)
                }));

            // Get curriculum progress
            const curriculumQuery = `
                SELECT 
                    topic_id,
                    subtopic_id,
                    topic_name,
                    subtopic_name,
                    mastery_level,
                    total_attempts,
                    correct_attempts,
                    last_practiced_at
                FROM curriculum_progress
                WHERE user_id = $1
                ORDER BY last_practiced_at DESC
                LIMIT 20
            `;
            const curriculumResult = await db.query(curriculumQuery, [userId]);
            const curriculumProgress = curriculumResult.rows;

            const context = {
                profile,
                topicStats,
                recentActivity,
                weakTopics,
                strongTopics,
                curriculumProgress,
                summary: {
                    totalExercises: topicStats.reduce((sum, s) => sum + parseInt(s.total_exercises), 0),
                    overallAccuracy: topicStats.length > 0 
                        ? Math.round(topicStats.reduce((sum, s) => sum + parseFloat(s.accuracy), 0) / topicStats.length)
                        : 0,
                    weakTopicsCount: weakTopics.length,
                    strongTopicsCount: strongTopics.length,
                    recentActivityCount: recentActivity.length
                }
            };

            console.log('✅ Student context loaded:', context.summary);
            return context;

        } catch (error) {
            console.error('❌ Error getting student context:', error);
            return null;
        }
    }

    /**
     * Generate intelligent response with Claude AI
     */
    async generateResponse(userId, userMessage, conversationHistory = []) {
        try {
            console.log('🤖 Generating intelligent response for:', userId);

            // Get student context
            const studentContext = await this.getStudentContext(userId);

            if (!studentContext) {
                return {
                    success: false,
                    error: 'Could not load student data'
                };
            }

            // Build system prompt with real data
            const systemPrompt = this.buildSystemPrompt(studentContext);

            // Prepare messages for Claude
            const messages = [
                ...conversationHistory.map(msg => ({
                    role: msg.role,
                    content: msg.content
                })),
                {
                    role: 'user',
                    content: userMessage
                }
            ];

            // Call Claude API
            const response = await anthropic.messages.create({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 2000,
                system: systemPrompt,
                messages: messages
            });

            const aiResponse = response.content[0].text;

            // Extract recommendations and links
            const recommendations = this.extractRecommendations(aiResponse, studentContext);

            console.log('✅ Response generated with', recommendations.length, 'recommendations');

            return {
                success: true,
                response: aiResponse,
                recommendations,
                studentInsights: {
                    weakTopics: studentContext.weakTopics.slice(0, 3),
                    strongTopics: studentContext.strongTopics.slice(0, 3),
                    overallAccuracy: studentContext.summary.overallAccuracy
                }
            };

        } catch (error) {
            console.error('❌ Error generating response:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Build comprehensive system prompt with student data
     */
    buildSystemPrompt(context) {
        const { profile, summary, weakTopics, strongTopics, recentActivity } = context;

        return `אתה נקסון, עוזר AI חכם ואמפתי לתלמידים במתמטיקה. אתה יכול לגשת לנתונים אמיתיים על התלמיד ולספק המלצות מותאמות אישית.

## 📊 נתוני התלמיד

**פרופיל:**
- שם: ${profile.name || 'תלמיד'}
- כיתה: ${profile.grade || 'לא ידוע'}
- מסלול: ${profile.track || 'לא ידוע'}
- סגנון למידה: ${profile.learning_style || 'לא ידוע'}
- תחושה כלפי מתמטיקה: ${profile.math_feeling || 'לא ידוע'}

**סטטיסטיקות כלליות:**
- סה"כ תרגילים: ${summary.totalExercises}
- דיוק כללי: ${summary.overallAccuracy}%
- נושאים חלשים: ${summary.weakTopicsCount}
- נושאים חזקים: ${summary.strongTopicsCount}

**נושאים שצריכים שיפור (דיוק < 60%):**
${weakTopics.length > 0 ? weakTopics.map(t => 
    `- ${t.topic} / ${t.subtopic}: ${t.accuracy}% (${t.attempts} ניסיונות)`
).join('\n') : '- אין נושאים חלשים! מעולה!'}

**נושאים שהתלמיד שולט בהם (דיוק >= 80%):**
${strongTopics.length > 0 ? strongTopics.map(t => 
    `- ${t.topic} / ${t.subtopic}: ${t.accuracy}% (${t.attempts} ניסיונות)`
).join('\n') : '- עדיין לא נמצאו נושאים חזקים. המשך לתרגל!'}

**פעילות אחרונה:**
${recentActivity.slice(0, 5).map(a => 
    `- ${a.topic} / ${a.subtopic}: ${a.is_correct ? '✅ נכון' : '❌ שגוי'} (${a.difficulty})`
).join('\n')}

## 🎯 תפקידך

1. **ענה על שאלות מתמטיות** בצורה ברורה ומפורטת
2. **נתח את ההתקדמות** על סמך הנתונים האמיתיים
3. **המלץ על נושאים לתרגול** בהתאם לנושאים החלשים
4. **ספק קישורים ישירים** לנושאים לתרגול (פורמט: [תרגל נושא](topic:TOPIC_ID:SUBTOPIC_ID))
5. **עודד והמריץ** את התלמיד
6. **זהה דפוסים** בטעויות והצלחות

## 💡 הנחיות

- השתמש בשפה פשוטה וידידותית בעברית
- תן דוגמאות קונקרטיות מהנתונים
- המלץ על אסטרטגיות תרגול ספציפיות
- כשאתה ממליץ על נושא, תמיד כלול קישור בפורמט: [שם הנושא](topic:TOPIC_ID:SUBTOPIC_ID)
- אם התלמיד שואל "איך להשתפר" - הצע נושאים חלשים ספציפיים עם קישורים
- אם התלמיד שואל "במה להתמקד" - הצב את הנושאים החלשים בסדר עדיפות
- חגוג הצלחות ועודד בכישלונות

## 🔗 פורמט קישורים

כשאתה ממליץ על נושא, השתמש בפורמט הזה:
[שם הנושא לתרגול](topic:TOPIC_ID:SUBTOPIC_ID)

דוגמה:
"אני ממליץ לתרגל [משפט פיתגורס](topic:geometry:pythagoras) ו[שטח משולש](topic:geometry:triangle-area)"

## ⚠️ חשוב

- תמיד התבסס על נתונים אמיתיים, לא על השערות
- אם אין מספיק נתונים, המלץ לתרגל עוד
- תן המלצות ספציפיות ומעשיות, לא כלליות`;
    }

    /**
     * Extract actionable recommendations from AI response
     */
    extractRecommendations(response, context) {
        const recommendations = [];

        // Extract topic links from response
        const topicLinkRegex = /\[([^\]]+)\]\(topic:([^:]+):([^)]+)\)/g;
        let match;

        while ((match = topicLinkRegex.exec(response)) !== null) {
            recommendations.push({
                type: 'practice',
                title: match[1],
                topicId: match[2],
                subtopicId: match[3],
                action: 'practice'
            });
        }

        // Add weak topics if not enough recommendations
        if (recommendations.length < 3 && context.weakTopics.length > 0) {
            context.weakTopics.slice(0, 3).forEach(weakTopic => {
                recommendations.push({
                    type: 'practice',
                    title: `תרגל ${weakTopic.topic} - ${weakTopic.subtopic}`,
                    topic: weakTopic.topic,
                    subtopic: weakTopic.subtopic,
                    accuracy: weakTopic.accuracy,
                    action: 'practice'
                });
            });
        }

        return recommendations;
    }

    /**
     * Get topic-specific help
     */
    async getTopicHelp(userId, topicId, subtopicId) {
        try {
            // Get student's history with this topic
            const query = `
                SELECT 
                    COUNT(*) as attempts,
                    SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as correct,
                    AVG(CASE WHEN is_correct THEN 1 ELSE 0 END) * 100 as accuracy
                FROM notebook_entries
                WHERE student_id = $1 
                AND topic = $2 
                AND subtopic = $3
            `;
            
            const result = await db.query(query, [userId, topicId, subtopicId]);
            const stats = result.rows[0];

            return {
                success: true,
                stats: {
                    attempts: parseInt(stats.attempts) || 0,
                    correct: parseInt(stats.correct) || 0,
                    accuracy: Math.round(parseFloat(stats.accuracy) || 0)
                },
                recommendation: this.getTopicRecommendation(stats)
            };

        } catch (error) {
            console.error('❌ Error getting topic help:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get recommendation based on topic performance
     */
    getTopicRecommendation(stats) {
        const accuracy = parseFloat(stats.accuracy) || 0;
        const attempts = parseInt(stats.attempts) || 0;

        if (attempts === 0) {
            return 'נושא חדש! בוא נתחיל ביסודות ונעלה בהדרגה. 🚀';
        } else if (accuracy >= 80) {
            return 'אתה שולט בנושא הזה! אולי תרצה לנסות רמת קושי גבוהה יותר? 🌟';
        } else if (accuracy >= 60) {
            return 'אתה בדרך הנכונה! עוד קצת תרגול ותשלוט בזה לגמרי. 💪';
        } else {
            return 'נושא זה זקוק לתשומת לב. בוא נתרגל אותו יותר ונחזק את היסודות. 📚';
        }
    }
}

export default new NexonAskService();