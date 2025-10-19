// server/services/personalityLoader.js
import XLSX from 'xlsx';
import fs from 'fs';

class PersonalitySystem {
    constructor() {
        this.loaded = false;
        this.data = {
            corePersonality: {},
            examplesBank: [],
            topicGuidelines: [],
            hintSystem: [],
            answerFormats: [],
            errorPatterns: [],
            encouragementLibrary: [],
            questionTemplates: [],
            progressionMap: [],
            culturalContext: []
        };
    }

    loadFromExcel(filePath) {
        try {
            console.log('📂 Loading personality system from:', filePath);
            if (!fs.existsSync(filePath)) {
                console.error('❌ File not found:', filePath);
                return false;
            }
            const workbook = XLSX.readFile(filePath);
            console.log('📊 Available sheets:', workbook.SheetNames.join(', '));
            
            if (workbook.SheetNames.includes('PERSONALITY_CORE')) {
                const sheet = workbook.Sheets['PERSONALITY_CORE'];
                const data = XLSX.utils.sheet_to_json(sheet);
                if (data.length > 0) {
                    this.data.corePersonality = {
                        teacher_name: data[0].teacher_name || 'נקסון',
                        teaching_style: data[0].teaching_style || 'מעודד וסבלני',
                        communication_tone: data[0].communication_tone || 'חברותי וחם',
                        humor_level: data[0].humor_level || 'medium',
                        emoji_usage: data[0].emoji_usage || 'moderate',
                        energy_level: data[0].energy_level || 'high'
                    };
                    console.log('✅ Core personality loaded');
                }
            }
            
            if (workbook.SheetNames.includes('EXAMPLES_BANK')) {
                const sheet = workbook.Sheets['EXAMPLES_BANK'];
                this.data.examplesBank = XLSX.utils.sheet_to_json(sheet);
                console.log(`✅ Loaded ${this.data.examplesBank.length} examples`);
            }
            
            if (workbook.SheetNames.includes('TOPIC_GUIDELINES')) {
                const sheet = workbook.Sheets['TOPIC_GUIDELINES'];
                this.data.topicGuidelines = XLSX.utils.sheet_to_json(sheet);
                console.log(`✅ Loaded ${this.data.topicGuidelines.length} topic guidelines`);
            }
            
            if (workbook.SheetNames.includes('HINT_STRUCTURE')) {
                const sheet = workbook.Sheets['HINT_STRUCTURE'];
                this.data.hintSystem = XLSX.utils.sheet_to_json(sheet);
                console.log(`✅ Loaded ${this.data.hintSystem.length} hint structures`);
            }
            
            if (workbook.SheetNames.includes('ANSWER_FORMAT')) {
                const sheet = workbook.Sheets['ANSWER_FORMAT'];
                this.data.answerFormats = XLSX.utils.sheet_to_json(sheet);
                console.log(`✅ Loaded ${this.data.answerFormats.length} answer formats`);
            }
            
            if (workbook.SheetNames.includes('ERROR_PATTERNS')) {
                const sheet = workbook.Sheets['ERROR_PATTERNS'];
                this.data.errorPatterns = XLSX.utils.sheet_to_json(sheet);
                console.log(`✅ Loaded ${this.data.errorPatterns.length} error patterns`);
            }
            
            if (workbook.SheetNames.includes('ENCOURAGEMENT_LIBRARY')) {
                const sheet = workbook.Sheets['ENCOURAGEMENT_LIBRARY'];
                this.data.encouragementLibrary = XLSX.utils.sheet_to_json(sheet);
                console.log(`✅ Loaded ${this.data.encouragementLibrary.length} encouragements`);
            }
            
            if (workbook.SheetNames.includes('QUESTION_TEMPLATES')) {
                const sheet = workbook.Sheets['QUESTION_TEMPLATES'];
                this.data.questionTemplates = XLSX.utils.sheet_to_json(sheet);
                console.log(`✅ Loaded ${this.data.questionTemplates.length} question templates`);
            }
            
            if (workbook.SheetNames.includes('PROGRESSION_MAP')) {
                const sheet = workbook.Sheets['PROGRESSION_MAP'];
                this.data.progressionMap = XLSX.utils.sheet_to_json(sheet);
                console.log(`✅ Loaded ${this.data.progressionMap.length} progression rules`);
            }
            
            if (workbook.SheetNames.includes('CULTURAL_CONTEXT')) {
                const sheet = workbook.Sheets['CULTURAL_CONTEXT'];
                this.data.culturalContext = XLSX.utils.sheet_to_json(sheet);
                console.log(`✅ Loaded ${this.data.culturalContext.length} cultural contexts`);
            }
            
            this.loaded = true;
            console.log('🎉 Personality system loaded successfully!\n');
            return true;
        } catch (error) {
            console.error('❌ Error loading personality system:', error);
            this.loaded = false;
            return false;
        }
    }

    buildSystemPrompt(studentProfile) {
        if (!this.loaded) {
            return this._buildDefaultSystemPrompt(studentProfile);
        }
        const core = this.data.corePersonality;
        let prompt = `אתה ${core.teacher_name}, מורה למתמטיקה דיגיטלי עם אישיות ייחודית.\n\n`;
        prompt += `🎭 PERSONALITY CORE:\n`;
        prompt += `- סגנון הוראה: ${core.teaching_style}\n`;
        prompt += `- טון תקשורת: ${core.communication_tone}\n`;
        prompt += `- רמת הומור: ${core.humor_level}\n`;
        prompt += `- שימוש באימוג'י: ${core.emoji_usage}\n`;
        prompt += `- רמת אנרגיה: ${core.energy_level}\n\n`;
        prompt += `👨‍🎓 פרופיל התלמיד:\n`;
        prompt += `- שם: ${studentProfile.name || 'תלמיד'}\n`;
        prompt += `- כיתה: ${studentProfile.grade || '8'}\n`;
        if (studentProfile.mathFeeling) {
            prompt += `- תחושה במתמטיקה: ${studentProfile.mathFeeling}\n`;
        }
        if (studentProfile.learningStyle) {
            prompt += `- סגנון למידה: ${studentProfile.learningStyle}\n`;
        }
        prompt += `\n`;
        return prompt;
    }

    buildQuestionPrompt(topic, subtopic, difficulty, studentProfile) {
        let prompt = `צור שאלה במתמטיקה עבור ${studentProfile.name}.\n\n`;
        prompt += `📚 דרישות:\n- נושא: ${topic.name}\n`;
        if (subtopic) prompt += `- תת-נושא: ${subtopic.name}\n`;
        prompt += `- רמת קושי: ${difficulty}\n- כיתה: ${studentProfile.grade}\n\n`;
        const guidelines = this.getTopicGuidelines(topic.name);
        if (guidelines) prompt += `🎯 הנחיות לנושא:\n${guidelines}\n\n`;
        const examples = this.getExamplesForTopic(topic.name, difficulty);
        if (examples.length > 0) {
            prompt += `📖 דוגמאות לסגנון:\n`;
            examples.slice(0, 2).forEach((ex, i) => {
                prompt += `${i + 1}. ${ex.example_question}\n`;
            });
            prompt += `\n`;
        }
        prompt += `פורמט תשובה (JSON בלבד!):\n{\n  "question": "השאלה המלאה",\n  "correctAnswer": "התשובה הנכונה",\n  "hints": ["רמז 1", "רמז 2", "רמז 3"],\n  "explanation": "הסבר מפורט",\n  "difficulty": "basic|intermediate|advanced"\n}\n\n⚠️ חשוב: החזר רק JSON תקין!`;
        return prompt;
    }

    buildVerificationPrompt(question, userAnswer, correctAnswer, topic) {
        let prompt = `בדוק את התשובה של התלמיד.\n\nשאלה: ${question}\nתשובת התלמיד: ${userAnswer}\nתשובה נכונה: ${correctAnswer}\nנושא: ${topic}\n\n`;
        const errorPatterns = this.getErrorPatterns(topic);
        if (errorPatterns.length > 0) {
            prompt += `⚠️ שגיאות נפוצות לבדיקה:\n`;
            errorPatterns.forEach(pattern => prompt += `- ${pattern.error_description}\n`);
            prompt += `\n`;
        }
        prompt += `פורמט תשובה (JSON בלבד!):\n{\n  "isCorrect": true/false,\n  "isPartial": true/false,\n  "confidence": 0-100,\n  "feedback": "משוב קצר",\n  "explanation": "הסבר מפורט"\n}\n\n⚠️ חשוב: החזר רק JSON תקין!`;
        return prompt;
    }

    getExamplesForTopic(topicName, difficulty) {
        if (!this.loaded) return [];
        return this.data.examplesBank.filter(ex => 
            ex.topic_name === topicName && (!difficulty || ex.difficulty_level === difficulty)
        );
    }

    getTopicGuidelines(topicName) {
        if (!this.loaded) return null;
        const guideline = this.data.topicGuidelines.find(g => g.topic_name === topicName);
        return guideline ? guideline.teaching_approach : null;
    }

    getHintStyle(difficulty, hintLevel) {
        if (!this.loaded) return null;
        return this.data.hintSystem.find(h => 
            h.difficulty_level === difficulty && h.hint_level === hintLevel
        );
    }

    getEncouragement(situation) {
        if (!this.loaded) return null;
        const encouragements = this.data.encouragementLibrary.filter(e => e.situation === situation);
        if (encouragements.length === 0) return null;
        const random = encouragements[Math.floor(Math.random() * encouragements.length)];
        return random.message;
    }

    getErrorPatterns(topic) {
        if (!this.loaded) return [];
        return this.data.errorPatterns.filter(e => e.topic === topic);
    }

    _buildDefaultSystemPrompt(studentProfile) {
        return `אתה נקסון, מורה מתמטיקה דיגיטלי מומחה. אתה מעודד, סבלני וידידותי.\n\nהתלמיד שלך: ${studentProfile.name || 'תלמיד'}, כיתה ${studentProfile.grade || '8'}.\nתקשר בעברית ברורה, תן הסברים צעד אחר צעד, והיה מעודד.`;
    }
}

const personalitySystem = new PersonalitySystem();
export default personalitySystem;