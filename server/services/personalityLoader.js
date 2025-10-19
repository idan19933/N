// server/services/personalityLoader.js - COMPLETE PERSONALITY SYSTEM LOADER (ORDER-INDEPENDENT)
import xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';

class PersonalitySystem {
    constructor() {
        this.data = {
            corePersonality: {},
            languageStyle: {},
            topicGuidelines: [],
            hintSystem: [],
            stepTemplates: [],
            answerFormats: [],
            examplesBank: [],
            errorPatterns: [],
            encouragementLibrary: [],
            questionTemplates: [],
            progressionRules: [],
            culturalContext: [],
            responseTemplates: [],
            difficultyIndicators: [],
            scaffoldingStrategies: [],
            questionVariationPatterns: [],
            learningMilestones: [],
            adaptiveFeedback: [],
            errorRecoveryStrategies: [],
            motivationTriggers: []
        };
        this.loaded = false;
    }

    loadFromExcel(filePath) {
        try {
            console.log('📚 Loading personality system from Excel...');
            console.log('   File path:', filePath);

            const workbook = xlsx.readFile(filePath);
            console.log('   📑 Available sheets:', workbook.SheetNames.join(', '));

            // 🔥 FLEXIBLE SHEET MAPPING - Order doesn't matter!
            const sheetMapping = [
                {
                    names: ['CORE_PERSONALITY', 'Core_Personality', 'core_personality'],
                    handler: (sheet) => {
                        const data = xlsx.utils.sheet_to_json(sheet);
                        data.forEach(row => {
                            const field = row.field || row.Field || row.FIELD;
                            const value = row.value || row.Value || row.VALUE;
                            if (field && value !== undefined) {
                                this.data.corePersonality[field] = value;
                            }
                        });
                        console.log('   ✅ Core personality loaded:', Object.keys(this.data.corePersonality).length, 'fields');
                    }
                },
                {
                    names: ['LANGUAGE_STYLE', 'Language_Style', 'language_style'],
                    handler: (sheet) => {
                        const data = xlsx.utils.sheet_to_json(sheet);
                        data.forEach(row => {
                            const element = row.element || row.Element || row.ELEMENT || row.field || row.Field;
                            const style = row.style || row.Style || row.STYLE || row.value || row.Value;
                            if (element && style !== undefined) {
                                this.data.languageStyle[element] = style;
                            }
                        });
                        console.log('   ✅ Language style loaded:', Object.keys(this.data.languageStyle).length, 'fields');
                    }
                },
                {
                    names: ['TOPIC_GUIDELINES', 'Topic_Guidelines', 'topic_guidelines'],
                    target: 'topicGuidelines'
                },
                {
                    names: ['HINT_SYSTEM', 'Hint_System', 'hint_system'],
                    target: 'hintSystem'
                },
                {
                    names: ['STEP_TEMPLATES', 'Step_Templates', 'step_templates'],
                    target: 'stepTemplates'
                },
                {
                    names: ['ANSWER_FORMATS', 'Answer_Formats', 'answer_formats'],
                    target: 'answerFormats'
                },
                {
                    names: ['EXAMPLES_BANK', 'Examples_Bank', 'examples_bank'],
                    target: 'examplesBank'
                },
                {
                    names: ['ERROR_PATTERNS', 'Error_Patterns', 'error_patterns'],
                    target: 'errorPatterns'
                },
                {
                    names: ['ENCOURAGEMENT_LIBRARY', 'Encouragement_Library', 'encouragement_library'],
                    target: 'encouragementLibrary'
                },
                {
                    names: ['QUESTION_TEMPLATES', 'Question_Templates', 'question_templates'],
                    target: 'questionTemplates'
                },
                {
                    names: ['PROGRESSION_RULES', 'Progression_Rules', 'progression_rules'],
                    target: 'progressionRules'
                },
                {
                    names: ['CULTURAL_CONTEXT', 'Cultural_Context', 'cultural_context'],
                    target: 'culturalContext'
                },
                {
                    names: ['RESPONSE_TEMPLATES', 'Response_Templates', 'response_templates'],
                    target: 'responseTemplates'
                },
                {
                    names: ['DIFFICULTY_INDICATORS', 'Difficulty_Indicators', 'difficulty_indicators'],
                    target: 'difficultyIndicators'
                },
                {
                    names: ['SCAFFOLDING_STRATEGIES', 'Scaffolding_Strategies', 'scaffolding_strategies'],
                    target: 'scaffoldingStrategies'
                },
                {
                    names: ['QUESTION_VARIATION_PATTERNS', 'Question_Variation_Patterns', 'question_variation_patterns'],
                    target: 'questionVariationPatterns'
                },
                {
                    names: ['LEARNING_MILESTONES', 'Learning_Milestones', 'learning_milestones'],
                    target: 'learningMilestones'
                },
                {
                    names: ['ADAPTIVE_FEEDBACK', 'Adaptive_Feedback', 'adaptive_feedback'],
                    target: 'adaptiveFeedback'
                },
                {
                    names: ['ERROR_RECOVERY_STRATEGIES', 'Error_Recovery_Strategies', 'error_recovery_strategies'],
                    target: 'errorRecoveryStrategies'
                },
                {
                    names: ['MOTIVATION_TRIGGERS', 'Motivation_Triggers', 'motivation_triggers'],
                    target: 'motivationTriggers'
                }
            ];

            // 🔥 LOAD ALL SHEETS DYNAMICALLY
            sheetMapping.forEach(mapping => {
                const sheetName = mapping.names.find(name => workbook.SheetNames.includes(name));

                if (sheetName) {
                    const sheet = workbook.Sheets[sheetName];

                    if (mapping.handler) {
                        // Custom handler for special sheets
                        mapping.handler(sheet);
                    } else if (mapping.target) {
                        // Standard array loading
                        this.data[mapping.target] = xlsx.utils.sheet_to_json(sheet);
                        console.log(`   ✅ ${sheetName} loaded: ${this.data[mapping.target].length} rows`);
                    }
                }
            });

            this.loaded = true;

            console.log('\n✅ Personality system loaded successfully!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('📊 Summary:');
            console.log(`   👤 Teacher: ${this.data.corePersonality.teacher_name || 'Unknown'}`);
            console.log(`   📚 Examples: ${this.data.examplesBank.length}`);
            console.log(`   🎯 Topics: ${this.data.topicGuidelines.length}`);
            console.log(`   💡 Hints: ${this.data.hintSystem.length}`);
            console.log(`   ❌ Error patterns: ${this.data.errorPatterns.length}`);
            console.log(`   💪 Encouragements: ${this.data.encouragementLibrary.length}`);
            console.log(`   📝 Templates: ${this.data.questionTemplates.length}`);
            console.log(`   🎨 Response templates: ${this.data.responseTemplates.length}`);
            console.log(`   📈 Difficulty indicators: ${this.data.difficultyIndicators.length}`);
            console.log(`   🎓 Scaffolding strategies: ${this.data.scaffoldingStrategies.length}`);
            console.log(`   🎯 Learning milestones: ${this.data.learningMilestones.length}`);
            console.log(`   🔄 Adaptive feedback: ${this.data.adaptiveFeedback.length}`);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

            return true;
        } catch (error) {
            console.error('❌ Failed to load personality system:', error);
            console.error('   Error details:', error.message);
            console.error('   Stack:', error.stack);
            return false;
        }
    }

    // ==================== HELPER METHODS ====================

    // Get examples for a specific topic
    getExamplesForTopic(topicName, difficulty = null) {
        if (!topicName) return [];

        let examples = this.data.examplesBank.filter(ex => {
            const exTopic = ex.topic || ex.Topic || ex.TOPIC || '';
            return exTopic.includes(topicName);
        });

        if (difficulty) {
            examples = examples.filter(ex => {
                const exDiff = ex.difficulty || ex.Difficulty || ex.DIFFICULTY || '';
                return exDiff === difficulty;
            });
        }

        return examples;
    }

    // Get topic guidelines
    getTopicGuideline(topicName) {
        if (!topicName) return null;

        return this.data.topicGuidelines.find(t => {
            const tName = t.topic || t.Topic || t.TOPIC || t.topic_name || '';
            return tName.includes(topicName);
        });
    }

    // Get hint for topic and level
    getHint(topicName, level = 1) {
        const hints = this.data.hintSystem.filter(h => {
            const hTopic = h.topic || h.Topic || h.TOPIC || '';
            const hLevel = h.hint_level || h.Hint_Level || h.level || 1;
            return hTopic.includes(topicName) && hLevel == level;
        });

        return hints[0] || null;
    }

    // Get error pattern for topic
    getErrorPattern(topicName) {
        if (!topicName) return [];

        return this.data.errorPatterns.filter(e => {
            const eTopic = e.topic || e.Topic || e.TOPIC || e.error_type || '';
            return eTopic.includes(topicName);
        });
    }

    // Get encouragement for situation
    getEncouragement(situation) {
        const encouragement = this.data.encouragementLibrary.find(e => {
            const eSituation = e.situation || e.Situation || e.SITUATION || '';
            return eSituation === situation;
        });

        const phrase = encouragement?.encouragement || encouragement?.Encouragement ||
            encouragement?.encouragement_phrase || 'כל הכבוד! 🌟';

        return phrase;
    }

    // Get step template for topic
    getStepTemplate(topicName) {
        return this.data.stepTemplates.filter(t => {
            const tTopic = t.topic || t.Topic || t.TOPIC || '';
            return tTopic.includes(topicName);
        });
    }

    // Get cultural context items
    getCulturalContext(contextType = null) {
        if (!contextType) return this.data.culturalContext;

        return this.data.culturalContext.filter(c => {
            const cType = c.element || c.Element || c.context_type || '';
            return cType === contextType;
        });
    }

    // Get response template
    getResponseTemplate(situation) {
        return this.data.responseTemplates.find(r => {
            const rSituation = r.situation || r.Situation || r.SITUATION || '';
            return rSituation === situation;
        });
    }

    // Get scaffolding strategy
    getScaffoldingStrategy(strategyType) {
        return this.data.scaffoldingStrategies.find(s => {
            const sType = s.strategy || s.Strategy || s.strategy_type || '';
            return sType === strategyType;
        });
    }

    // Get learning milestone
    getLearningMilestone(milestoneType) {
        return this.data.learningMilestones.find(m => {
            const mType = m.milestone || m.Milestone || m.milestone_type || '';
            return mType === milestoneType;
        });
    }

    // Get adaptive feedback for student type
    getAdaptiveFeedback(studentType) {
        return this.data.adaptiveFeedback.find(f => {
            const fType = f.student_type || f.Student_Type || f.type || '';
            return fType === studentType;
        });
    }

    // ==================== SYSTEM PROMPT BUILDERS ====================

    // Build enhanced system prompt with personality
    buildSystemPrompt(studentProfile = {}) {
        const core = this.data.corePersonality;

        if (!core.teacher_name && !core.Teacher_Name) {
            // Fallback if personality not loaded
            return buildFallbackSystemPrompt(studentProfile);
        }

        const teacherName = core.teacher_name || core.Teacher_Name || 'נקסון';
        const teachingStyle = core.teaching_style || core.Teaching_Style || 'ידידותי וסבלני';
        const tone = core.tone || core.Tone || 'חם ומעודד';

        let prompt = `אתה ${teacherName}, מורה דיגיטלי למתמטיקה.\n\n`;

        prompt += `אישיות:\n`;
        prompt += `• סגנון הוראה: ${teachingStyle}\n`;
        prompt += `• טון: ${tone}\n`;

        if (core.personality_traits || core.Personality_Traits) {
            prompt += `• תכונות: ${core.personality_traits || core.Personality_Traits}\n`;
        }

        if (core.learning_philosophy || core.Learning_Philosophy) {
            prompt += `• פילוסופיה: ${core.learning_philosophy || core.Learning_Philosophy}\n`;
        }

        prompt += `\n`;

        if (studentProfile.grade) {
            prompt += `התלמיד לומד בכיתה ${studentProfile.grade}.\n`;
        }

        if (studentProfile.mathFeeling === 'struggle') {
            prompt += `התלמיד מתקשה במתמטיקה - היה סבלני במיוחד, תן הסברים פשוטים ומפורטים.\n`;
        } else if (studentProfile.mathFeeling === 'love') {
            prompt += `התלמיד אוהב מתמטיקה - תן אתגרים מעניינים ושאלות מתקדמות.\n`;
        }

        if (studentProfile.learningStyle === 'independent') {
            prompt += `התלמיד מעדיף ללמוד בעצמו - תן רמזים עדינים.\n`;
        } else if (studentProfile.learningStyle === 'ask') {
            prompt += `התלמיד מעדיף לקבל הסברים - תן הסברים מפורטים.\n`;
        }

        // 🔥 CRITICAL RAW DATA INSTRUCTION
        prompt += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        prompt += `🚨 CRITICAL JSON RULES:\n`;
        prompt += `• DO NOT use actual newline characters in JSON strings\n`;
        prompt += `• Use spaces or "\\n" (escaped) instead\n`;
        prompt += `• Keep JSON compact\n`;
        prompt += `\n🚨 CRITICAL GRAPH/STATISTICS RULES:\n`;
        prompt += `• ALWAYS write actual raw data points in lists\n`;
        prompt += `• NEVER write "הגרף מציג", "התוצאות מוצגות", "נתוני הסקר מראים"\n`;
        prompt += `• NEVER use "תלמיד 1: 5 שעות" format\n`;
        prompt += `• ALWAYS use: "variable (x): 2, 3, 1, 4, 5, 6..."\n`;
        prompt += `• Include AT LEAST 15-20 data points\n`;
        prompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

        return prompt;
    }

    // Build verification prompt with error patterns
    buildVerificationPrompt(question, userAnswer, correctAnswer, topic) {
        let prompt = `בדוק תשובה מתמטית:\n\n`;

        prompt += `שאלה: ${question}\n`;
        prompt += `תשובת תלמיד: ${userAnswer}\n`;
        prompt += `תשובה נכונה: ${correctAnswer}\n`;
        prompt += `נושא: ${topic}\n\n`;

        // Get error patterns for this topic
        const errors = this.getErrorPattern(topic);
        if (errors.length > 0) {
            prompt += `⚠️ שגיאות נפוצות בנושא:\n`;
            errors.slice(0, 3).forEach(err => {
                const mistake = err.common_mistake || err.Common_Mistake || err.example || '';
                const explanation = err.explanation || err.Explanation || err.why_it_happens || '';
                if (mistake && explanation) {
                    prompt += `• ${mistake}: ${explanation}\n`;
                }
            });
            prompt += `\n`;
        }

        prompt += `בדיקות:\n`;
        prompt += `1. שקילות מתמטית (5+3 = 8 = 3+5)\n`;
        prompt += `2. פורמטים שונים (0.5 = 1/2 = 50%)\n`;
        prompt += `3. דיוק מספרי (עיגול)\n`;
        prompt += `4. תשובות חלקיות\n\n`;

        prompt += `החזר JSON בלבד:\n`;
        prompt += `{\n`;
        prompt += `  "isCorrect": true/false,\n`;
        prompt += `  "isPartial": true/false,\n`;
        prompt += `  "confidence": 0-100,\n`;
        prompt += `  "feedback": "משוב מעודד",\n`;
        prompt += `  "explanation": "הסבר"\n`;
        prompt += `}\n`;

        return prompt;
    }
}

// Fallback system prompt builder
function buildFallbackSystemPrompt(studentProfile) {
    let prompt = `אתה נקסון, מורה דיגיטלי למתמטיקה מומחה.\n\n`;

    if (studentProfile.grade) {
        prompt += `התלמיד לומד בכיתה ${studentProfile.grade}.\n`;
    }

    if (studentProfile.mathFeeling === 'struggle') {
        prompt += `התלמיד מתקשה - היה סבלני.\n`;
    }

    prompt += `\n🚨 CRITICAL: החזר JSON תקין בלבד, ללא newlines בתוך strings.\n`;

    return prompt;
}

// Singleton instance
const personalitySystem = new PersonalitySystem();
export default personalitySystem;