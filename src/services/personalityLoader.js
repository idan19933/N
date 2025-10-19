// server/services/personalityLoader.js - FIXED EXCEL PERSONALITY SYSTEM LOADER
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
            culturalContext: []
        };
        this.loaded = false;
    }

    loadFromExcel(filePath) {
        try {
            console.log('📚 Loading personality system from Excel...');
            console.log('   File path:', filePath);

            const workbook = xlsx.readFile(filePath);
            console.log('   📑 Available sheets:', workbook.SheetNames.join(', '));

            // Sheet 1: CORE_PERSONALITY
            if (workbook.SheetNames.includes('CORE_PERSONALITY')) {
                const coreSheet = workbook.Sheets['CORE_PERSONALITY'];
                const coreData = xlsx.utils.sheet_to_json(coreSheet);
                console.log('   📋 CORE_PERSONALITY rows:', coreData.length);

                coreData.forEach(row => {
                    if (row.Field && row.Value !== undefined) {
                        this.data.corePersonality[row.Field] = row.Value;
                    }
                });

                console.log('   ✅ Core personality loaded:', Object.keys(this.data.corePersonality).length, 'fields');
                console.log('   👤 Teacher name:', this.data.corePersonality.teacher_name);
            } else {
                console.log('   ⚠️ CORE_PERSONALITY sheet not found');
            }

            // Sheet 2: LANGUAGE_STYLE
            if (workbook.SheetNames.includes('LANGUAGE_STYLE')) {
                const langSheet = workbook.Sheets['LANGUAGE_STYLE'];
                const langData = xlsx.utils.sheet_to_json(langSheet);
                console.log('   📋 LANGUAGE_STYLE rows:', langData.length);

                langData.forEach(row => {
                    if (row.Field && row.Value !== undefined) {
                        this.data.languageStyle[row.Field] = row.Value;
                    }
                });

                console.log('   ✅ Language style loaded:', Object.keys(this.data.languageStyle).length, 'fields');
            } else {
                console.log('   ⚠️ LANGUAGE_STYLE sheet not found');
            }

            // Sheet 3: TOPIC_GUIDELINES
            if (workbook.SheetNames.includes('TOPIC_GUIDELINES')) {
                const topicSheet = workbook.Sheets['TOPIC_GUIDELINES'];
                this.data.topicGuidelines = xlsx.utils.sheet_to_json(topicSheet);
                console.log('   ✅ Topic guidelines loaded:', this.data.topicGuidelines.length);
            }

            // Sheet 4: HINT_SYSTEM
            if (workbook.SheetNames.includes('HINT_SYSTEM')) {
                const hintSheet = workbook.Sheets['HINT_SYSTEM'];
                this.data.hintSystem = xlsx.utils.sheet_to_json(hintSheet);
                console.log('   ✅ Hint system loaded:', this.data.hintSystem.length);
            }

            // Sheet 5: STEP_TEMPLATES
            if (workbook.SheetNames.includes('STEP_TEMPLATES')) {
                const stepSheet = workbook.Sheets['STEP_TEMPLATES'];
                this.data.stepTemplates = xlsx.utils.sheet_to_json(stepSheet);
                console.log('   ✅ Step templates loaded:', this.data.stepTemplates.length);
            }

            // Sheet 6: ANSWER_FORMATS
            if (workbook.SheetNames.includes('ANSWER_FORMATS')) {
                const answerSheet = workbook.Sheets['ANSWER_FORMATS'];
                this.data.answerFormats = xlsx.utils.sheet_to_json(answerSheet);
                console.log('   ✅ Answer formats loaded:', this.data.answerFormats.length);
            }

            // Sheet 7: EXAMPLES_BANK
            if (workbook.SheetNames.includes('EXAMPLES_BANK')) {
                const examplesSheet = workbook.Sheets['EXAMPLES_BANK'];
                this.data.examplesBank = xlsx.utils.sheet_to_json(examplesSheet);
                console.log('   ✅ Examples bank loaded:', this.data.examplesBank.length);
            }

            // Sheet 8: ERROR_PATTERNS
            if (workbook.SheetNames.includes('ERROR_PATTERNS')) {
                const errorSheet = workbook.Sheets['ERROR_PATTERNS'];
                this.data.errorPatterns = xlsx.utils.sheet_to_json(errorSheet);
                console.log('   ✅ Error patterns loaded:', this.data.errorPatterns.length);
            }

            // Sheet 9: ENCOURAGEMENT_LIBRARY
            if (workbook.SheetNames.includes('ENCOURAGEMENT_LIBRARY')) {
                const encourageSheet = workbook.Sheets['ENCOURAGEMENT_LIBRARY'];
                this.data.encouragementLibrary = xlsx.utils.sheet_to_json(encourageSheet);
                console.log('   ✅ Encouragement library loaded:', this.data.encouragementLibrary.length);
            }

            // Sheet 10: QUESTION_TEMPLATES
            if (workbook.SheetNames.includes('QUESTION_TEMPLATES')) {
                const templateSheet = workbook.Sheets['QUESTION_TEMPLATES'];
                this.data.questionTemplates = xlsx.utils.sheet_to_json(templateSheet);
                console.log('   ✅ Question templates loaded:', this.data.questionTemplates.length);
            }

            // Sheet 11: PROGRESSION_RULES
            if (workbook.SheetNames.includes('PROGRESSION_RULES')) {
                const progressSheet = workbook.Sheets['PROGRESSION_RULES'];
                this.data.progressionRules = xlsx.utils.sheet_to_json(progressSheet);
                console.log('   ✅ Progression rules loaded:', this.data.progressionRules.length);
            }

            // Sheet 12: CULTURAL_CONTEXT
            if (workbook.SheetNames.includes('CULTURAL_CONTEXT')) {
                const culturalSheet = workbook.Sheets['CULTURAL_CONTEXT'];
                this.data.culturalContext = xlsx.utils.sheet_to_json(culturalSheet);
                console.log('   ✅ Cultural context loaded:', this.data.culturalContext.length);
            }

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
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

            return true;
        } catch (error) {
            console.error('❌ Failed to load personality system:', error);
            console.error('   Error details:', error.message);
            return false;
        }
    }

    // Get examples for a specific topic
    getExamplesForTopic(topicName, difficulty = null) {
        let examples = this.data.examplesBank.filter(ex =>
            ex.topic && ex.topic.includes(topicName)
        );

        if (difficulty) {
            examples = examples.filter(ex => ex.difficulty === difficulty);
        }

        return examples;
    }

    // Get topic guidelines
    getTopicGuideline(topicName) {
        return this.data.topicGuidelines.find(t =>
            t.topic_name && t.topic_name.includes(topicName)
        );
    }

    // Get hint for difficulty level
    getHintStyle(difficulty, index) {
        const hints = this.data.hintSystem.filter(h => h.difficulty === difficulty);
        return hints[index] || hints[0];
    }

    // Get error pattern for topic
    getErrorPattern(topicName) {
        return this.data.errorPatterns.filter(e =>
            e.topic && e.topic.includes(topicName)
        );
    }

    // Get encouragement for situation
    getEncouragement(situation) {
        const encouragement = this.data.encouragementLibrary.find(e =>
            e.situation === situation
        );
        return encouragement?.encouragement_phrase || 'כל הכבוד! 🌟';
    }

    // Get step template for exercise type
    getStepTemplate(exerciseType) {
        return this.data.stepTemplates.find(t =>
            t.exercise_type === exerciseType
        );
    }

    // Get cultural context items
    getCulturalContext(contextType, field = null) {
        let items = this.data.culturalContext.filter(c =>
            c.context_type === contextType
        );

        if (field) {
            items = items.filter(c => c.field === field);
        }

        return items;
    }

    // Build enhanced system prompt with personality
    buildSystemPrompt(studentProfile = {}) {
        const core = this.data.corePersonality;
        const lang = this.data.languageStyle;

        if (!core.teacher_name) {
            // Fallback if personality not loaded
            return buildFallbackSystemPrompt(studentProfile);
        }

        let prompt = `אתה ${core.teacher_name}, ${core.teacher_title}.\n\n`;

        prompt += `אישיות:\n`;
        prompt += `• סגנון: ${core.personality_type}\n`;
        prompt += `• טון: ${core.tone}\n`;
        prompt += `• פילוסופיה: ${core.teaching_philosophy}\n`;
        prompt += `• גישה לטעויות: ${core.approach_to_mistakes}\n\n`;

        if (lang && Object.keys(lang).length > 0) {
            prompt += `סגנון תקשורת:\n`;
            if (lang.sentence_length) prompt += `• משפטים: ${lang.sentence_length}\n`;
            if (lang.question_to_student) prompt += `• שאלות לתלמיד: ${lang.question_to_student}\n`;
            if (lang.explanation_style) prompt += `• הסברים: ${lang.explanation_style}\n`;
            if (lang.uses_examples) prompt += `• דוגמאות: ${lang.uses_examples}\n`;
            if (lang.real_world_connections) prompt += `• קשר לחיים: ${lang.real_world_connections}\n`;
            prompt += `\n`;
        }

        if (studentProfile.grade) {
            prompt += `התלמיד לומד בכיתה ${studentProfile.grade}.\n`;
        }

        if (studentProfile.mathFeeling === 'struggle') {
            prompt += `התלמיד מתקשה - היה סבלני במיוחד.\n`;
        } else if (studentProfile.mathFeeling === 'love') {
            prompt += `התלמיד אוהב מתמטיקה - תן אתגרים!\n`;
        }

        // 🔥 ADD CRITICAL RAW DATA INSTRUCTION
        prompt += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        prompt += `🚨 CRITICAL: When creating graph/statistics questions:\n`;
        prompt += `- ALWAYS write actual individual data points\n`;
        prompt += `- NEVER write "the graph shows" or "average is"\n`;
        prompt += `- NEVER use ranges like "0-2" or "3-5"\n`;
        prompt += `- NEVER say "התוצאות מוצגות בגרף"\n`;
        prompt += `- NEVER say "הנתונים מוצגים בגרף"\n`;
        prompt += `- NEVER say "בגרף הפיזור הבא"\n`;
        prompt += `- Write: "variable (x): 2, 3, 1, 4..."\n`;
        prompt += `- Include visualData with raw data array\n`;
        prompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

        return prompt;
    }

    // Build question prompt - NOT USED, ai-proxy.js uses buildDynamicQuestionPrompt instead
    buildQuestionPrompt(topic, subtopic, difficulty, studentProfile) {
        // This method exists but is bypassed in favor of the strict prompt in ai-proxy.js
        // Keeping it for compatibility but it won't be called
        return '';
    }

    // Build verification prompt with error patterns
    buildVerificationPrompt(question, userAnswer, correctAnswer, topic) {
        let prompt = `בדוק תשובה מתמטית:\n\n`;

        prompt += `שאלה: ${question}\n`;
        prompt += `תשובת תלמיד: ${userAnswer}\n`;
        prompt += `תשובה נכונה: ${correctAnswer}\n\n`;

        // Get error patterns for this topic
        const errors = this.getErrorPattern(topic);
        if (errors.length > 0) {
            prompt += `⚠️ שגיאות נפוצות בנושא זה:\n`;
            errors.forEach(err => {
                prompt += `• ${err.common_mistake}: ${err.explanation}\n`;
            });
            prompt += `\n`;
        }

        prompt += `בדיקות:\n`;
        prompt += `1. שקילות מתמטית\n`;
        prompt += `2. פורמטים שונים\n`;
        prompt += `3. דיוק מספרי\n`;
        prompt += `4. תשובות חלקיות\n\n`;

        prompt += `פורמט JSON:\n`;
        prompt += `{\n`;
        prompt += `  "isCorrect": true/false,\n`;
        prompt += `  "isPartial": true/false,\n`;
        prompt += `  "confidence": 0-100,\n`;
        prompt += `  "feedback": "משוב מעודד",\n`;
        prompt += `  "explanation": "הסבר מפורט",\n`;
        prompt += `  "whatCorrect": "מה נכון",\n`;
        prompt += `  "whatMissing": "מה חסר"\n`;
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

    return prompt;
}

// Singleton instance
const personalitySystem = new PersonalitySystem();
export default personalitySystem;