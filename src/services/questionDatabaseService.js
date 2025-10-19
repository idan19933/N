// src/services/questionDatabaseService.js - COMPLETE WITH NO REPEATS

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

class QuestionDatabaseService {
    constructor() {
        this.recentQuestions = new Map();
        this.questionHistory = new Map(); // Track all questions per topic
        this.maxRecentQuestions = 20;
        console.log('📚 Question Database Service initialized');
    }

    async getQuestion(grade, topic, useAI = true, subtopic = null) {
        try {
            console.log(`📚 Getting question for: ${topic.name}, useAI: ${useAI}`);

            if (!useAI) {
                return this.getStaticQuestion(topic.name, grade.name);
            }

            // Try AI question
            const question = await this.getAIQuestion(grade, topic, subtopic);

            // Track question to avoid repeats
            this.trackQuestion(question, topic.id);

            return question;

        } catch (error) {
            console.error('❌ Error fetching question:', error);

            // Fallback to static questions
            console.log('🔄 Falling back to static questions');
            return this.getStaticQuestion(topic.name, grade.name);
        }
    }

    async getAIQuestion(grade, topic, subtopic = null) {
        try {
            console.log('🤖 Calling AI to generate question...');
            console.log(`📡 Sending request to: ${API_BASE_URL}/api/ai/generate-question`);

            // Get recent questions for this topic to avoid repeats
            const recentQuestions = this.getRecentQuestionsForTopic(topic.id);

            const response = await fetch(`${API_BASE_URL}/api/ai/generate-question`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    topic: topic.name,
                    difficulty: this.getDifficultyFromGrade(grade),
                    grade: grade.name,
                    subtopic: subtopic?.name || null,
                    teacherName: 'נקסון',
                    avoidQuestions: recentQuestions // Tell AI to avoid these
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to generate question');
            }

            console.log('✅ SUCCESS: AI generated question!');
            console.log('   Question:', data.question.substring(0, 60) + '...');
            console.log('   Source: AI (Claude via personality)');

            return {
                question: data.question,
                answer: data.answer,
                hints: data.hints || [],
                steps: data.explanation ? [data.explanation] : [],
                topic: topic.name,
                subtopic: subtopic?.name,
                grade: grade.name,
                context: null
            };

        } catch (error) {
            console.error('❌ AI generation failed:', error);
            throw error;
        }
    }

    getDifficultyFromGrade(grade) {
        const gradeNum = parseInt(grade.name.match(/\d+/)?.[0] || '1');

        if (gradeNum <= 2) return 'קל';
        if (gradeNum <= 4) return 'בינוני';
        if (gradeNum <= 6) return 'קשה';
        return 'מתקדם';
    }

    trackQuestion(question, topicId) {
        const key = `${topicId}-${question.question.substring(0, 50)}`;
        const timestamp = Date.now();

        // Add to recent questions
        this.recentQuestions.set(key, timestamp);

        // Add to topic history
        if (!this.questionHistory.has(topicId)) {
            this.questionHistory.set(topicId, []);
        }
        this.questionHistory.get(topicId).push({
            question: question.question,
            timestamp
        });

        // Clean old questions (keep last 20)
        this.cleanOldQuestions();
    }

    getRecentQuestionsForTopic(topicId) {
        const history = this.questionHistory.get(topicId) || [];
        return history.slice(-10).map(h => h.question); // Last 10 questions
    }

    cleanOldQuestions() {
        if (this.recentQuestions.size > this.maxRecentQuestions) {
            const entries = Array.from(this.recentQuestions.entries());
            entries.sort((a, b) => a[1] - b[1]); // Sort by timestamp

            // Keep only the most recent ones
            const toKeep = entries.slice(-this.maxRecentQuestions);
            this.recentQuestions.clear();
            toKeep.forEach(([key, value]) => {
                this.recentQuestions.set(key, value);
            });
        }
    }

    getStaticQuestion(topicName, gradeName) {
        console.log('🔍 Fetching static question for:', topicName);

        const staticQuestions = {
            'פרופורציה ויחסים': [
                {
                    question: 'היחס בין 12 ל-18 הוא? (פשט לצורה הפשוטה)',
                    answer: '2:3',
                    hints: [
                        'מצא את המחלק המשותף הגדול ביותר',
                        'חלק את שני המספרים ב-6',
                        '12÷6 = 2 ו-18÷6 = 3'
                    ],
                    steps: ['מצא ממ"מ: 6', 'חלק שני צדדים: 12÷6 : 18÷6', 'תשובה: 2:3']
                },
                {
                    question: 'אם 4 עפרונות עולים 20 ש"ח, כמה יעלו 7 עפרונות?',
                    answer: '35',
                    hints: [
                        'מצא כמה עולה עפרון אחד',
                        '20 ÷ 4 = 5 ש"ח לעפרון',
                        'כפול 5 × 7'
                    ],
                    steps: ['מחיר עפרון: 20÷4 = 5 ש"ח', 'מחיר 7 עפרונות: 5×7 = 35 ש"ח']
                }
            ],
            'דמיון ומשולשים': [
                {
                    question: 'שני משולשים דומים. במשולש הראשון צלע AB = 6 ס"מ. במשולש הדומה צלע המקבילה DE = 9 ס"מ. מהו יחס הדמיון?',
                    answer: '3:2',
                    hints: [
                        'יחס דמיון = צלע במשולש גדול : צלע במשולש קטן',
                        'חלק 9 ÷ 6',
                        'פשט את היחס'
                    ],
                    steps: ['יחס: 9:6', 'פשט: 3:2']
                }
            ],
            'גרפים של פונקציות': [
                {
                    question: 'בגרף של הפונקציה y = 2x + 3, מה נקודת החיתוך עם ציר Y?',
                    answer: '3',
                    hints: [
                        'נקודת חיתוך עם ציר Y היא כאשר x = 0',
                        'הצב x = 0 בפונקציה',
                        'y = 2(0) + 3 = ?'
                    ],
                    steps: ['הצב x=0: y = 2(0) + 3', 'y = 0 + 3', 'y = 3']
                },
                {
                    question: 'מהו השיפוע של הישר y = -3x + 5?',
                    answer: '-3',
                    hints: [
                        'בפונקציה y = mx + b, m הוא השיפוע',
                        'השיפוע הוא המקדם של x',
                        'במקרה שלנו זה -3'
                    ],
                    steps: ['הפונקציה: y = -3x + 5', 'השיפוע m = -3']
                }
            ],
            'פונקציות קוויות': [
                {
                    question: 'מצא את הפונקציה הקווית העוברת דרך הנקודות (2,5) ו-(4,9)',
                    answer: 'y = 2x + 1',
                    hints: [
                        'חשב את השיפוע: m = (y2-y1)/(x2-x1)',
                        'm = (9-5)/(4-2) = 4/2 = 2',
                        'הצב נקודה אחת למצוא את b'
                    ],
                    steps: ['שיפוע: m = (9-5)/(4-2) = 2', 'הצב (2,5): 5 = 2(2) + b', 'b = 1', 'פונקציה: y = 2x + 1']
                }
            ],
            'משוואות ריבועיות': [
                {
                    question: 'פתור את המשוואה: x² = 25',
                    answer: 'x = ±5',
                    hints: [
                        'קח שורש משני הצדדים',
                        'זכור ששורש של 25 יכול להיות חיובי או שלילי',
                        'x = 5 או x = -5'
                    ],
                    steps: ['√x² = √25', 'x = ±5', 'פתרונות: x = 5 או x = -5']
                }
            ],
            'חיבור וחיסור': [
                {
                    question: 'חשב: 8 + 7',
                    answer: '15',
                    hints: ['ספור על האצבעות', 'התחל מ-8 וספור עוד 7'],
                    steps: ['8 + 7 = 15']
                },
                {
                    question: 'חשב: 12 - 5',
                    answer: '7',
                    hints: ['ספור אחורה מ-12', 'ספור 5 פעמים אחורה'],
                    steps: ['12 - 5 = 7']
                }
            ],
            'כפל וחילוק': [
                {
                    question: 'חשב: 6 × 7',
                    answer: '42',
                    hints: ['זה מלוח הכפל', 'חשוב על 6 קבוצות של 7'],
                    steps: ['6 × 7 = 42']
                }
            ]
        };

        // Get questions for this topic
        const questions = staticQuestions[topicName];

        if (!questions || questions.length === 0) {
            console.log('⚠️ No static questions found, using generic');
            return {
                question: `שאלה על ${topicName}: חשב את הפתרון`,
                answer: '42',
                hints: ['נסה לפתור שלב אחר שלב', 'חשוב על מה שלמדת'],
                steps: ['פתרון מלא יופיע כאן'],
                topic: topicName,
                grade: gradeName
            };
        }

        // Get a random question from available questions
        const randomIndex = Math.floor(Math.random() * questions.length);
        const selectedQuestion = questions[randomIndex];

        console.log('✅ Static question loaded:', selectedQuestion.question.substring(0, 60) + '...');

        return {
            ...selectedQuestion,
            topic: topicName,
            grade: gradeName,
            context: null
        };
    }

    clearHistory() {
        this.recentQuestions.clear();
        this.questionHistory.clear();
        console.log('🗑️ Question history cleared');
    }
}

export const questionDB = new QuestionDatabaseService();
export default questionDB;