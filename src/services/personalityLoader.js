// server/services/personalityLoader.js - EXCEL PERSONALITY SYSTEM LOADER
import xlsx from 'xlsx';

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

            const workbook = xlsx.readFile(filePath);

            // Sheet 1: CORE_PERSONALITY
            const coreSheet = workbook.Sheets['CORE_PERSONALITY'];
            if (coreSheet) {
                const coreData = xlsx.utils.sheet_to_json(coreSheet);
                coreData.forEach(row => {
                    this.data.corePersonality[row.Field] = row.Value;
                });
            }

            // Sheet 2: LANGUAGE_STYLE
            const langSheet = workbook.Sheets['LANGUAGE_STYLE'];
            if (langSheet) {
                const langData = xlsx.utils.sheet_to_json(langSheet);
                langData.forEach(row => {
                    this.data.languageStyle[row.Field] = row.Value;
                });
            }

            // Sheet 3: TOPIC_GUIDELINES
            const topicSheet = workbook.Sheets['TOPIC_GUIDELINES'];
            if (topicSheet) {
                this.data.topicGuidelines = xlsx.utils.sheet_to_json(topicSheet);
            }

            // Sheet 4: HINT_SYSTEM
            const hintSheet = workbook.Sheets['HINT_SYSTEM'];
            if (hintSheet) {
                this.data.hintSystem = xlsx.utils.sheet_to_json(hintSheet);
            }

            // Sheet 5: STEP_TEMPLATES
            const stepSheet = workbook.Sheets['STEP_TEMPLATES'];
            if (stepSheet) {
                this.data.stepTemplates = xlsx.utils.sheet_to_json(stepSheet);
            }

            // Sheet 6: ANSWER_FORMATS
            const answerSheet = workbook.Sheets['ANSWER_FORMATS'];
            if (answerSheet) {
                this.data.answerFormats = xlsx.utils.sheet_to_json(answerSheet);
            }

            // Sheet 7: EXAMPLES_BANK
            const examplesSheet = workbook.Sheets['EXAMPLES_BANK'];
            if (examplesSheet) {
                this.data.examplesBank = xlsx.utils.sheet_to_json(examplesSheet);
            }

            // Sheet 8: ERROR_PATTERNS
            const errorSheet = workbook.Sheets['ERROR_PATTERNS'];
            if (errorSheet) {
                this.data.errorPatterns = xlsx.utils.sheet_to_json(errorSheet);
            }

            // Sheet 9: ENCOURAGEMENT_LIBRARY
            const encourageSheet = workbook.Sheets['ENCOURAGEMENT_LIBRARY'];
            if (encourageSheet) {
                this.data.encouragementLibrary = xlsx.utils.sheet_to_json(encourageSheet);
            }

            // Sheet 10: QUESTION_TEMPLATES
            const templateSheet = workbook.Sheets['QUESTION_TEMPLATES'];
            if (templateSheet) {
                this.data.questionTemplates = xlsx.utils.sheet_to_json(templateSheet);
            }

            // Sheet 11: PROGRESSION_RULES
            const progressSheet = workbook.Sheets['PROGRESSION_RULES'];
            if (progressSheet) {
                this.data.progressionRules = xlsx.utils.sheet_to_json(progressSheet);
            }

            // Sheet 12: CULTURAL_CONTEXT
            const culturalSheet = workbook.Sheets['CULTURAL_CONTEXT'];
            if (culturalSheet) {
                this.data.culturalContext = xlsx.utils.sheet_to_json(culturalSheet);
            }

            this.loaded = true;
            console.log('✅ Personality system loaded successfully!');
            console.log(`   📊 Examples: ${this.data.examplesBank.length}`);
            console.log(`   🎯 Topics: ${this.data.topicGuidelines.length}`);
            console.log(`   💡 Hints: ${this.data.hintSystem.length}`);
            console.log(`   ❌ Error patterns: ${this.data.errorPatterns.length}`);

            return true;
        } catch (error) {
            console.error('❌ Failed to load personality system:', error);
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

        let prompt = `אתה ${core.teacher_name || 'נקסון'}, ${core.teacher_title || 'מורה למתמטיקה'}.\n\n`;

        if (core.personality_type) {
            prompt += `אישיות:\n`;
            prompt += `• סגנון: ${core.personality_type}\n`;
            prompt += `• טון: ${core.tone}\n`;
            if (core.teaching_philosophy) {
                prompt += `• פילוסופיה: ${core.teaching_philosophy}\n`;
            }
            if (core.approach_to_mistakes) {
                prompt += `• גישה לטעויות: ${core.approach_to_mistakes}\n`;
            }
            prompt += `\n`;
        }

        if (lang.sentence_length) {
            prompt += `סגנון תקשורת:\n`;
            prompt += `• משפטים: ${lang.sentence_length}\n`;
            if (lang.question_to_student) {
                prompt += `• שאלות לתלמיד: ${lang.question_to_student}\n`;
            }
            if (lang.explanation_style) {
                prompt += `• הסברים: ${lang.explanation_style}\n`;
            }
            if (lang.uses_examples) {
                prompt += `• דוגמאות: ${lang.uses_examples}\n`;
            }
            if (lang.real_world_connections) {
                prompt += `• קשר לחיים: ${lang.real_world_connections}\n`;
            }
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

        return prompt;
    }

    // Build question prompt with examples
    buildQuestionPrompt(topic, subtopic, difficulty, studentProfile) {
        let prompt = `צור שאלה במתמטיקה:\n\n`;

        // Get topic guidelines
        const guideline = this.getTopicGuideline(topic.name);
        if (guideline) {
            prompt += `🎯 הנחיות נושא:\n`;
            if (guideline.exercise_types) {
                prompt += `• סוגי תרגילים: ${guideline.exercise_types}\n`;
            }
            if (guideline.difficulty_progression) {
                prompt += `• התקדמות קושי: ${guideline.difficulty_progression}\n`;
            }
            if (guideline.focus_areas) {
                prompt += `• דגש על: ${guideline.focus_areas}\n`;
            }
            if (guideline.real_world_examples) {
                prompt += `• דוגמאות מהחיים: ${guideline.real_world_examples}\n`;
            }
            if (guideline.common_mistakes) {
                prompt += `• שגיאות נפוצות להימנע: ${guideline.common_mistakes}\n`;
            }
            prompt += `\n`;
        }

        // Get examples from bank
        const examples = this.getExamplesForTopic(topic.name, difficulty);
        if (examples.length > 0) {
            prompt += `📚 דוגמאות לשאלות מהסוג הזה:\n\n`;
            examples.slice(0, 3).forEach((ex, i) => {
                prompt += `דוגמה ${i + 1}:\n`;
                prompt += `שאלה: ${ex.question}\n`;
                prompt += `תשובה: ${ex.answer}\n`;
                if (ex.hint) prompt += `רמז: ${ex.hint}\n`;
                if (ex.steps) prompt += `שלבים: ${ex.steps}\n`;
                prompt += `\n`;
            });
        }

        // Add cultural context
        const names = this.getCulturalContext('names');
        const currency = this.getCulturalContext('currency');
        if (names.length > 0 || currency.length > 0) {
            prompt += `🇮🇱 הקשר ישראלי:\n`;
            if (currency.length > 0 && currency[0].value) {
                prompt += `• מטבע: ${currency[0].value}\n`;
            }
            if (names.length > 0) {
                const boyNames = names.filter(n => n.field === 'boys');
                const girlNames = names.filter(n => n.field === 'girls');
                if (boyNames.length > 0 && boyNames[0].value) {
                    prompt += `• שמות (בנים): ${boyNames[0].value}\n`;
                }
                if (girlNames.length > 0 && girlNames[0].value) {
                    prompt += `• שמות (בנות): ${girlNames[0].value}\n`;
                }
            }
            prompt += `\n`;
        }

        prompt += `דרישות:\n`;
        prompt += `• נושא: ${topic.name}\n`;
        if (subtopic) prompt += `• תת-נושא: ${subtopic.name}\n`;
        prompt += `• רמת קושי: ${difficulty}\n`;
        prompt += `• כיתה: ${studentProfile.grade}\n\n`;

        prompt += `חשוב:\n`;
        prompt += `1. צור שאלה חדשה ושונה מהדוגמאות\n`;
        prompt += `2. התאם לרמת כיתה ${studentProfile.grade}\n`;
        prompt += `3. השתמש בהקשר ישראלי\n`;
        prompt += `4. בדוק שהתשובה מתמטית נכונה!\n`;
        prompt += `5. כלול 3 רמזים מדורגים\n\n`;

        prompt += `פורמט JSON:\n`;
        prompt += `{\n`;
        prompt += `  "question": "השאלה המלאה",\n`;
        prompt += `  "correctAnswer": "התשובה המדויקת",\n`;
        prompt += `  "hints": ["רמז 1", "רמז 2", "רמז 3"],\n`;
        prompt += `  "explanation": "הסבר מפורט",\n`;
        prompt += `  "difficulty": "${difficulty}"\n`;
        prompt += `}\n`;

        return prompt;
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

// Singleton instance
export const personalitySystem = new PersonalitySystem();
export default personalitySystem;