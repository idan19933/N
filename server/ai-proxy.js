// server/ai-proxy.js - SMART TOPIC-BASED QUESTION GENERATION
import { formatMathAnswer, compareMathExpressions } from './utils/mathFormatter.js';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import personalitySystem from './services/personalityLoader.js';
import questionHistoryManager from './services/questionHistory.js';
import SVGGenerator from './services/svgGenerator.js';
import { bucket } from './config/firebase-admin.js';
import ISRAELI_CURRICULUM, {
    getGradeConfig,
    getReformNotes,
    getExamInfo,
    getClusters,
    getPedagogicalNote,
    CURRICULUM_METADATA
} from '../src/config/israeliCurriculum.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// ==================== MULTER CONFIGURATION ====================
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        console.log('📁 File upload attempt:');
        console.log('   Original name:', file.originalname);
        console.log('   MIME type:', file.mimetype);

        const isExcel = file.originalname.toLowerCase().endsWith('.xlsx') ||
            file.originalname.toLowerCase().endsWith('.xls');

        const validMimeTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'application/octet-stream',
            'application/zip'
        ];

        const validMime = validMimeTypes.includes(file.mimetype);

        if (isExcel || validMime) {
            console.log('   ✅ File accepted');
            cb(null, true);
        } else {
            console.log('   ❌ File rejected');
            cb(new Error('Only Excel files allowed!'), false);
        }
    }
});

// ==================== HELPER: CLEAN JSON ====================
// ==================== HELPER: CLEAN JSON - ENHANCED ====================
function cleanJsonText(rawText) {
    let jsonText = rawText.trim();

    // Remove markdown code blocks
    if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/g, '');
    }

    // Find JSON boundaries
    const jsonStart = jsonText.indexOf('{');
    const jsonEnd = jsonText.lastIndexOf('}') + 1;

    if (jsonStart !== -1 && jsonEnd > jsonStart) {
        jsonText = jsonText.substring(jsonStart, jsonEnd);
    }

    // 🔥 FIX 1: Remove control characters EXCEPT newlines in specific contexts
    jsonText = jsonText
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '');

    // 🔥 FIX 2: Fix newlines inside string values
    // This regex finds strings and replaces \n with \\n inside them
    jsonText = jsonText.replace(
        /"([^"\\]|\\.)*"/g,
        match => match.replace(/\n/g, '\\n').replace(/\r/g, '\\r')
    );

    // 🔥 FIX 3: Fix common JSON syntax errors
    jsonText = jsonText
        // Fix trailing commas before } or ]
        .replace(/,(\s*[}\]])/g, '$1')
        // Fix missing commas between properties (common Claude error)
        .replace(/("\s*:\s*"[^"]*")\s*("\w+"\s*:)/g, '$1,$2')
        .replace(/("\s*:\s*\d+)\s*("\w+"\s*:)/g, '$1,$2')
        .replace(/("\s*:\s*true|false)\s*("\w+"\s*:)/g, '$1,$2')
        // Fix unescaped quotes in Hebrew text
        .replace(/:\\s*"([^"]*?)"([^,}\]]*?)"/g, (match, p1, p2) => {
            if (p2.includes('"')) {
                return `: "${p1}\\"${p2}"`;
            }
            return match;
        });

    // 🔥 FIX 4: Validate and repair structure
    try {
        // Try to parse - if it works, return as-is
        JSON.parse(jsonText);
        return jsonText;
    } catch (e) {
        console.log('⚠️ JSON still invalid, attempting deep repair...');
        console.log('   Error:', e.message);
        console.log('   Position:', e.message.match(/position (\d+)/)?.[1]);

        // Log the problematic area
        const errorPos = parseInt(e.message.match(/position (\d+)/)?.[1] || '0');
        if (errorPos > 0) {
            const start = Math.max(0, errorPos - 50);
            const end = Math.min(jsonText.length, errorPos + 50);
            console.log('   Context:', jsonText.substring(start, end));
        }

        // Last resort: Try to fix specific common patterns
        jsonText = jsonText
            // Fix Hebrew quotes that break JSON
            .replace(/״/g, '\\"')
            .replace(/׳/g, "'")
            // Fix double quotes in values
            .replace(/"([^"]*)"([^"]*?)"/g, (match, p1, p2) => {
                if (p2.includes(':') || p2.includes(',') || p2.includes('}')) {
                    return `"${p1}"${p2}`;
                }
                return `"${p1}${p2.replace(/"/g, '\\"')}"`;
            });

        return jsonText;
    }
}

// ==================== TOPIC CLASSIFICATION SYSTEM ====================
function classifyTopic(topicName, subtopicName) {
    const topic = String(topicName || '').toLowerCase();
    const subtopic = String(subtopicName || '').toLowerCase();

    const isPureGeometry = (
        (topic.includes('גאומטריה') || topic.includes('geometry')) &&
        (subtopic.includes('נקודות') || subtopic.includes('קווים') ||
            subtopic.includes('מישורים') || subtopic.includes('points') ||
            subtopic.includes('lines') || subtopic.includes('planes'))
    );

    const isAppliedGeometry = (
        (topic.includes('גאומטריה') || topic.includes('geometry')) &&
        (subtopic.includes('משולש') || subtopic.includes('ריבוע') ||
            subtopic.includes('מעגל') || subtopic.includes('שטח') ||
            subtopic.includes('היקף') || subtopic.includes('triangle') ||
            subtopic.includes('rectangle') || subtopic.includes('circle') ||
            subtopic.includes('area') || subtopic.includes('perimeter'))
    );

    const isStatistics = (
        topic.includes('סטטיסטיקה') || topic.includes('statistics') ||
        topic.includes('גרפים') || topic.includes('graphs') ||
        subtopic.includes('פיזור') || subtopic.includes('scatter') ||
        subtopic.includes('רבעון') || subtopic.includes('quartile')
    );

    const isAlgebra = (
        topic.includes('אלגברה') || topic.includes('algebra') ||
        subtopic.includes('משוואות') || subtopic.includes('equations')
    );

    return {
        isPureGeometry,
        isAppliedGeometry,
        isStatistics,
        isAlgebra,
        allowsRealWorld: !isPureGeometry,
        requiresAbstract: isPureGeometry,
        requiresData: isStatistics
    };
}

// ==================== CURRICULUM-AWARE CONTEXT BUILDER ====================
function buildCurriculumContext(gradeId, topic, subtopic) {
    const gradeConfig = getGradeConfig(gradeId);
    if (!gradeConfig) return '';

    let context = `\n📚 CURRICULUM CONTEXT (תשפ"ה Reform):\n`;
    context += `Grade: ${gradeConfig.name} (${gradeConfig.nameEn})\n`;

    if (gradeConfig.implementationYear) {
        context += `Reform Year: ${gradeConfig.implementationYear}\n`;
    }

    const reformNotes = getReformNotes(gradeId);
    if (reformNotes) {
        if (reformNotes.emphasis) {
            context += `\n🎯 Pedagogical Emphasis:\n`;
            reformNotes.emphasis.forEach(e => context += `  - ${e}\n`);
        }
        if (reformNotes.removed) {
            context += `\n❌ Excluded Topics:\n`;
            reformNotes.removed.forEach(r => context += `  - ${r}\n`);
        }
    }

    const clusters = getClusters(gradeId);
    if (clusters) {
        context += `\n🎨 Learning Clusters:\n`;
        clusters.forEach(c => {
            context += `  - ${c.name}: ${c.description}\n`;
        });
    }

    const topicId = topic?.id || '';
    if (topicId) {
        const pedNote = getPedagogicalNote(gradeId, topicId);
        if (pedNote) {
            context += `\n📝 Topic Note: ${pedNote}\n`;
        }
    }

    if (subtopic) {
        const subtopicName = subtopic.name || '';
        if (subtopicName) {
            context += `\n🔍 Specific Subtopic: ${subtopicName}\n`;
            if (subtopic.note) {
                context += `   Note: ${subtopic.note}\n`;
            }
        }
    }

    context += `\n`;
    return context;
}

// ==================== ENHANCED SYSTEM PROMPT ====================
function buildEnhancedSystemPrompt(studentProfile, gradeId, topic, subtopic) {
    const { grade, mathFeeling } = studentProfile || {};

    let prompt = '';

    if (personalitySystem.loaded) {
        const personality = personalitySystem.data.corePersonality;
        prompt += `אתה ${personality.teacher_name}, ${personality.description}.\n`;
        prompt += `${personality.teaching_approach}\n\n`;
    } else {
        prompt += `אתה נקסון, מורה דיגיטלי למתמטיקה.\n\n`;
    }

    prompt += buildCurriculumContext(gradeId, topic, subtopic);

    if (grade) {
        prompt += `התלמיד בכיתה ${grade}.\n`;
    }

    if (mathFeeling === 'struggle') {
        prompt += `התלמיד מתקשה - היה סבלני, תן הסברים צעד-צעד.\n`;
    } else if (mathFeeling === 'love') {
        prompt += `התלמיד אוהב מתמטיקה - תן אתגרים מעניינים.\n`;
    }

    prompt += `\n🎯 General Principles:\n`;
    prompt += `- Create questions aligned with Israeli curriculum standards\n`;
    prompt += `- Use Hebrew naturally and clearly\n`;
    prompt += `- Consider the reform changes (תשפ"ה)\n`;
    prompt += `- Return VALID JSON only\n`;
    prompt += `- Be encouraging and supportive\n`;
    prompt += `- Create VARIED and UNIQUE questions every time\n\n`;

    return prompt;
}

// ==================== VALIDATE QUESTION HAS RAW DATA ====================
function validateQuestionHasRawData(parsed, topic, subtopic) {
    const questionText = parsed?.question || '';

    if (!questionText || typeof questionText !== 'string') {
        return { valid: true };
    }

    const graphTopics = [
        'פונקציות', 'גרפים', 'Functions', 'Graphs',
        'סטטיסטיקה', 'Statistics', 'נתונים', 'Data',
        'פיזור', 'Scatter', 'רבעונים', 'Quartiles',
        'תחום בין-רבעוני', 'IQR', 'היסטוגרמה', 'Histogram'
    ];

    const topicName = String(topic?.name || '');
    const topicNameEn = String(topic?.nameEn || '');
    const subtopicName = String(subtopic?.name || '');
    const subtopicNameEn = String(subtopic?.nameEn || '');

    const needsGraph = graphTopics.some(t =>
        topicName.includes(t) ||
        topicNameEn.includes(t) ||
        subtopicName.includes(t) ||
        subtopicNameEn.includes(t)
    );

    if (!needsGraph) {
        return { valid: true };
    }

    console.log('🔍 Validating question has raw data...');

    const forbiddenPatterns = [
        /ממוצע.*הוא/,
        /ממוצע.*הכללי/,
        /נע בין.*\d+-\d+/,
        /גרף.*מראה/,
        /גרף.*מציג/,
        /הגרף.*שלו.*מציג/,
        /הגרף.*שלפניכם/,
        /בגרף.*שלפניכם/,
        /גרף.*הפיזור.*שלפניכם/,
        /תרשים.*מציג/,
        /טבלה.*מציגה/,
        /הקשר בין/,
        /מתואר.*גרף/,
        /מוצגות.*בגרף/,
        /מופיעים.*בגרף/,
        /התוצאות.*מוצגות/,
        /הנתונים.*מוצגים/,
        /נתונים.*אלה.*מוצגים/,
        /מוצגים.*בגרף.*פיזור/,
        /נתוני.*הסקר.*מראים/,
        /נתונים.*אלה/i,
        /להלן.*הנתונים/i,
        /בגרף.*הבא/,
        /בגרף.*הפיזור.*הבא/,
        /שם.*התלמיד.*\|/,
        /\d+-\d+\s*\|/,
        /\d+\+\s*\|/,
        /טבלה.*הבאה/,
        /\|.*\|.*\|/,
        /[א-ת]+\s*\d*\s*:\s*\d+\s*שעות/i,
        /תלמיד\s*\d+\s*:\s*\d+/i,
        /[א-ת]+:\s*\d+\s*שעות,\s*[א-ת]+:\s*\d+\s*שעות/
    ];

    const hasForbiddenPattern = forbiddenPatterns.some(pattern =>
        pattern.test(questionText)
    );

    if (hasForbiddenPattern) {
        console.log('❌ Question has FORBIDDEN pattern');
        return {
            valid: false,
            reason: 'Contains forbidden patterns'
        };
    }

    const hasTwoLabeledLists = /\(x\)\s*:\s*[0-9,\s]+/i.test(questionText) &&
        /\(y\)\s*:\s*[0-9,\s]+/i.test(questionText);

    if (hasTwoLabeledLists) {
        console.log('✅ Question has TWO labeled lists');
        return { valid: true };
    }

    const commaNumbers = questionText.match(/\d+(?:\.\d+)?(?:\s*,\s*\d+(?:\.\d+)?){9,}/g);

    if (commaNumbers && commaNumbers.length > 0) {
        console.log('✅ Question has comma-separated numbers');
        return { valid: true };
    }

    console.log('❌ Question does NOT have proper raw data');
    return {
        valid: false,
        reason: 'Missing proper data format'
    };
}

// ==================== FORCE REWRITE ====================
function forceRewriteGraphDescription(parsed, topic, subtopic) {
    const questionText = parsed?.question || '';

    if (!questionText || typeof questionText !== 'string') {
        return parsed;
    }

    const forbiddenPatterns = [
        /הגרף.*מציג/i,
        /התרשים.*מציג/i,
        /הגרף.*מראה/i,
        /התוצאות.*מוצגות/i,
        /הנתונים.*מוצגים/i,
        /נתונים.*אלה.*מוצגים/i,
        /נתוני.*הסקר.*מראים/i,
        /נתונים.*אלה/i,
        /להלן.*הנתונים/i,
        /הגרף.*שלו.*מציג/i,
        /מוצגים.*בגרף.*פיזור/i
    ];

    const hasGraphDescription = forbiddenPatterns.some(pattern => pattern.test(questionText));

    const anyLabelPattern = /([א-ת]+\s*\d*)\s*:\s*(\d+)\s*שעות/g;
    const anyLabelMatches = [...questionText.matchAll(anyLabelPattern)];
    const hasLabelValueFormat = anyLabelMatches.length >= 3;

    if (!hasGraphDescription && !hasLabelValueFormat) {
        return parsed;
    }

    console.log('🚨 FORCING COMPLETE REWRITE');

    const questionLower = questionText.toLowerCase();
    const isSport = questionLower.includes('ספורט') || questionLower.includes('חוג');
    const isGrades = questionLower.includes('ציון');

    const numPoints = 20 + Math.floor(Math.random() * 4);
    const xValues = [];
    const yValues = [];

    let rewrittenQuestion = '';
    let xLabel = 'X';
    let yLabel = 'Y';

    if (isSport && isGrades) {
        for (let i = 0; i < numPoints; i++) {
            xValues.push(Math.floor(1 + Math.random() * 7));
            yValues.push(Math.floor(65 + Math.random() * 30));
        }

        rewrittenQuestion = `נאספו נתונים על ${numPoints} תלמידים - מספר שעות ספורט שבועיות והציון במתמטיקה:

שעות ספורט שבועיות (x): ${xValues.join(', ')}
ציון במתמטיקה (y): ${yValues.join(', ')}

צרו גרף פיזור והסבירו מה ניתן ללמוד על הקשר בין המשתנים.`;

        xLabel = 'שעות ספורט';
        yLabel = 'ציון במתמטיקה';

    } else {
        for (let i = 0; i < numPoints; i++) {
            xValues.push(Math.floor(10 + Math.random() * 40));
            yValues.push(Math.floor(50 + Math.random() * 50));
        }

        rewrittenQuestion = `נתונות ${numPoints} נקודות עם שני משתנים:

משתנה X: ${xValues.join(', ')}
משתנה Y: ${yValues.join(', ')}

צרו גרף פיזור וקבעו את סוג המתאם בין המשתנים.`;

        xLabel = 'X';
        yLabel = 'Y';
    }

    const points = xValues.map((x, idx) => ({
        x: x,
        y: yValues[idx],
        label: `נקודה ${idx + 1}`
    }));

    const visualData = {
        type: 'scatter',
        points: points,
        xRange: [Math.min(...xValues) - 2, Math.max(...xValues) + 2],
        yRange: [Math.min(...yValues) - 2, Math.max(...yValues) + 2],
        color: '#9333ea',
        label: 'גרף פיזור',
        xLabel: xLabel,
        yLabel: yLabel
    };

    parsed.question = rewrittenQuestion;
    parsed.visualData = visualData;

    console.log('✅ Question REWRITTEN');
    return parsed;
}

// ==================== VISUAL DATA EXTRACTION ====================
function ensureVisualDataForGraphQuestions(parsed, topic, subtopic) {
    try {
        const questionText = parsed?.question || '';

        if (!questionText || typeof questionText !== 'string') {
            console.log('⚠️ Invalid question text');
            return parsed;
        }

        console.log('\n🔥🔥🔥 EXTRACTION V2 STARTING 🔥🔥🔥');
        console.log('Question (first 200):', questionText.substring(0, 200));
        console.log('AI visualData:', parsed.visualData ? 'EXISTS' : 'NULL');

        if (parsed.visualData && (parsed.visualData.data?.length > 0 || parsed.visualData.points?.length > 0)) {
            console.log('✅ visualData already complete');
            return parsed;
        }

        console.log('\n🔎 METHOD 1: X-Y labeled lists');

        const patterns = [
            { x: /([^\n:]+?)\s*\(x\)\s*:\s*([0-9,\s.]+)/i, y: /([^\n:]+?)\s*\(y\)\s*:\s*([0-9,\s.]+)/i },
            { x: /([^\n:]+?)\s*\(x\)\s*\:\s*([0-9,\s.]+)/i, y: /([^\n:]+?)\s*\(y\)\s*\:\s*([0-9,\s.]+)/i },
            { x: /([א-ת\s]+)\(x\)\s*:\s*([0-9,\s.]+)/i, y: /([א-ת\s]+)\(y\)\s*:\s*([0-9,\s.]+)/i }
        ];

        for (let i = 0; i < patterns.length; i++) {
            const xMatch = questionText.match(patterns[i].x);
            const yMatch = questionText.match(patterns[i].y);

            if (xMatch && yMatch) {
                console.log(`✓ Pattern ${i + 1} matched!`);

                const xLabel = xMatch[1].trim();
                const yLabel = yMatch[1].trim();

                const xValues = xMatch[2]
                    .split(/[,،\s]+/)
                    .map(n => parseFloat(n.trim()))
                    .filter(n => !isNaN(n) && isFinite(n));

                const yValues = yMatch[2]
                    .split(/[,،\s]+/)
                    .map(n => parseFloat(n.trim()))
                    .filter(n => !isNaN(n) && isFinite(n));

                console.log(`   X: ${xValues.length} values →`, xValues.slice(0, 5));
                console.log(`   Y: ${yValues.length} values →`, yValues.slice(0, 5));

                if (xValues.length >= 4 && yValues.length >= 4) {
                    const minLength = Math.min(xValues.length, yValues.length);
                    const points = xValues.slice(0, minLength).map((x, idx) => ({
                        x: x,
                        y: yValues[idx],
                        label: `נקודה ${idx + 1}`
                    }));

                    const visualData = {
                        type: 'scatter',
                        points: points,
                        xRange: [Math.min(...xValues.slice(0, minLength)) - 1, Math.max(...xValues.slice(0, minLength)) + 1],
                        yRange: [Math.min(...yValues.slice(0, minLength)) - 1, Math.max(...yValues.slice(0, minLength)) + 1],
                        color: '#9333ea',
                        label: 'גרף פיזור',
                        xLabel: xLabel,
                        yLabel: yLabel
                    };

                    console.log('✅✅✅ SUCCESS! Scatter plot created');
                    console.log('🔥🔥🔥 EXTRACTION COMPLETE 🔥🔥🔥\n');
                    return { ...parsed, visualData };
                }
            }
        }

        console.log('⚠️ Could not extract any valid data');
        console.log('🔥🔥🔥 EXTRACTION FAILED 🔥🔥🔥\n');

    } catch (error) {
        console.error('❌ EXTRACTION ERROR:', error.message);
    }

    return parsed;
}

// ==================== DETECT GEOMETRY QUESTIONS ====================
// ==================== DETECT GEOMETRY QUESTIONS - FIXED ====================
// ==================== DETECT GEOMETRY QUESTIONS - FIXED V2 ====================
// ==================== DETECT GEOMETRY QUESTIONS - FIXED V3 WITH HEIGHT FILTERING ====================
// ==================== DETECT GEOMETRY QUESTIONS - COMPLETE FIXED VERSION ====================
function detectGeometryVisual(parsed, topic, subtopic) {
    const questionText = (parsed?.question || '').toLowerCase();

    if (!questionText || typeof questionText !== 'string') {
        return parsed;
    }

    const geometryKeywords = [
        'משולש', 'triangle', 'ריבוע', 'square', 'מלבן', 'rectangle',
        'עיגול', 'circle', 'מעגל', 'זווית', 'angle', 'צלע', 'side',
        'ניצב', 'right', 'שווה צלעות', 'equilateral', 'היקף', 'perimeter',
        'שטח', 'area', 'רדיוס', 'radius', 'קוטר', 'diameter',
        'שווה שוקיים', 'isosceles', 'שוקיים', 'שווה-שוקיים'
    ];

    const isGeometry = geometryKeywords.some(keyword => questionText.includes(keyword));
    if (!isGeometry) return parsed;

    console.log('🔺 Geometry question detected');
    console.log('   Question:', parsed.question);

    // 🔥 STEP 1: Extract and exclude angles
    const anglePatterns = [
        /זווית.*?(\d+)°/gi,
        /זווית.*?(\d+)\s*מעלות/gi,
        /(\d+)°/g,
        /angle.*?(\d+)/gi
    ];

    const angleNumbers = new Set();
    anglePatterns.forEach(pattern => {
        let match;
        const regex = new RegExp(pattern);
        while ((match = regex.exec(parsed.question)) !== null) {
            angleNumbers.add(parseFloat(match[1]));
        }
    });
    console.log('   🚫 Angles to exclude:', Array.from(angleNumbers));

    // 🔥 STEP 2: Extract and exclude height
    const heightPatterns = [
        /גובה.*?(\d+)/gi,
        /height.*?(\d+)/gi
    ];

    const heightNumbers = new Set();
    heightPatterns.forEach(pattern => {
        let match;
        const regex = new RegExp(pattern);
        while ((match = regex.exec(parsed.question)) !== null) {
            heightNumbers.add(parseFloat(match[1]));
        }
    });
    console.log('   🚫 Heights to exclude:', Array.from(heightNumbers));

    // 🔥 STEP 3: Extract ALL numbers, then filter out angles and heights
    const allNumbers = (parsed.question || '')
        .match(/\d+(\.\d+)?/g)
        ?.map(n => parseFloat(n))
        .filter(n => !angleNumbers.has(n) && !heightNumbers.has(n) && n > 0 && n < 1000) || [];

    console.log('   ✅ Valid numbers (after filtering):', allNumbers);

    let visualData = null;

    // ==================== TRIANGLE DETECTION ====================
    if (questionText.includes('משולש') || questionText.includes('triangle')) {
        console.log('   → Triangle detected');

        // Detect triangle type
        const isRight = questionText.includes('ניצב') || questionText.includes('right') ||
            questionText.includes('ישר-זווית') || questionText.includes('ישר זווית');
        const isEquilateral = questionText.includes('שווה צלעות') || questionText.includes('equilateral');
        const isIsosceles = questionText.includes('שווה שוקיים') || questionText.includes('שווה-שוקיים') ||
            questionText.includes('isosceles') || questionText.includes('שוקיים');

        let type = 'scalene';
        if (isRight) type = 'right';
        else if (isEquilateral) type = 'equilateral';
        else if (isIsosceles) type = 'isosceles';

        console.log('   Triangle type:', type);

        let sideA, sideB, sideC;

        // 🔥 ENHANCED ISOSCELES EXTRACTION
        if (isIsosceles) {
            console.log('   → Processing ISOSCELES triangle');

            // 🔥 METHOD 1: Look for explicit "בסיס" and "שוקיים" keywords
            const basePatterns = [
                /(?:אורך\s+ה?)?בסיס(?:\s+הוא)?\s+(\d+)/i,
                /בסיס\s+(\d+)/i,
                /base\s+(\d+)/i
            ];

            const legPatterns = [
                /(?:אורך\s+ה?)?שוקיים(?:\s+הוא)?\s+(\d+)/i,
                /שוקיים\s+(\d+)/i,
                /legs?\s+(\d+)/i
            ];

            let base = null;
            let leg = null;

            // Try to find base
            for (const pattern of basePatterns) {
                const match = parsed.question.match(pattern);
                if (match) {
                    base = parseFloat(match[1]);
                    console.log('   ✅ Found BASE from keyword:', base);
                    break;
                }
            }

            // Try to find legs
            for (const pattern of legPatterns) {
                const match = parsed.question.match(pattern);
                if (match) {
                    leg = parseFloat(match[1]);
                    console.log('   ✅ Found LEGS from keyword:', leg);
                    break;
                }
            }

            // 🔥 METHOD 2: Fallback - use position in filtered numbers
            if (!base || !leg) {
                console.log('   → Using fallback method');

                if (allNumbers.length >= 2) {
                    // First number is usually base, second is legs
                    base = allNumbers[0];
                    leg = allNumbers[1];
                    console.log('   ✅ Fallback - Base:', base, 'Legs:', leg);
                } else if (allNumbers.length === 1) {
                    // Only one number - make equilateral
                    base = allNumbers[0];
                    leg = allNumbers[0];
                    console.log('   ⚠️ Only one number - using equilateral');
                } else {
                    // No numbers - use defaults
                    base = 8;
                    leg = 10;
                    console.log('   ⚠️ No numbers found - using defaults');
                }
            }

            // Ensure we have valid numbers
            if (!angleNumbers.has(base) && !heightNumbers.has(base) &&
                !angleNumbers.has(leg) && !heightNumbers.has(leg)) {
                sideA = base;    // Base (BC)
                sideB = leg;     // Left leg (AB)
                sideC = leg;     // Right leg (AC)
                console.log('   ✅ FINAL ISOSCELES - Base:', sideA, 'Legs:', sideB, sideC);
            } else {
                // Validation failed - use defaults
                sideA = 8;
                sideB = 10;
                sideC = 10;
                console.log('   ⚠️ Validation failed - using defaults');
            }
        }
        // EQUILATERAL
        else if (isEquilateral) {
            sideA = allNumbers[0] || 8;
            sideB = sideA;
            sideC = sideA;
            console.log('   ✅ Equilateral - All sides:', sideA);
        }
        // RIGHT TRIANGLE
        else if (isRight) {
            sideA = allNumbers[0] || 3;
            sideB = allNumbers[1] || 4;
            sideC = allNumbers[2] || 5;
            console.log('   ✅ Right triangle - Sides:', sideA, sideB, sideC);
        }
        // SCALENE
        else {
            sideA = allNumbers[0] || 6;
            sideB = allNumbers[1] || 8;
            sideC = allNumbers[2] || 7;
            console.log('   ✅ Scalene - Sides:', sideA, sideB, sideC);
        }

        console.log('   📏 FINAL TRIANGLE - A:', sideA, 'B:', sideB, 'C:', sideC);

        visualData = {
            type: 'svg-triangle',
            svgData: {
                type: type,
                sideA: sideA,
                sideB: sideB,
                sideC: sideC,
                showLabels: true,
                showAngles: questionText.includes('זווית') || questionText.includes('angle')
            }
        };
    }
    // ==================== RECTANGLE ====================
    else if (questionText.includes('מלבן') || questionText.includes('rectangle')) {
        const width = allNumbers[0] || 5;
        const height = allNumbers[1] || 3;
        visualData = {
            type: 'svg-rectangle',
            svgData: { width, height, showLabels: true }
        };
    }
    // ==================== CIRCLE ====================
    else if (questionText.includes('עיגול') || questionText.includes('מעגל') || questionText.includes('circle')) {
        const radius = allNumbers[0] || 5;
        visualData = {
            type: 'svg-circle',
            svgData: { radius, showLabels: true }
        };
    }

    if (visualData) {
        console.log('✅ Visual created:', visualData.type);
        console.log('   📊 Data:', JSON.stringify(visualData.svgData, null, 2));
        parsed.visualData = visualData;
    }

    return parsed;
}

// ==================== HEALTH CHECK ====================
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Nexon AI Server - Smart Topic-Based Questions',
        personalityLoaded: personalitySystem.loaded,
        curriculumLoaded: true,
        questionHistoryActive: true,
        visualGenerationActive: true,
        reformYear: CURRICULUM_METADATA.reformYear,
        firebaseStorage: bucket ? 'available' : 'unavailable'
    });
});

// ==================== 🔥 SMART TOPIC-BASED QUESTION PROMPT ====================
// ==================== 🔥 SMART TOPIC-BASED QUESTION PROMPT ====================
// ==================== 🔥 SMART TOPIC-BASED QUESTION PROMPT ====================
// ==================== 🔥 SMART TOPIC-BASED QUESTION PROMPT - COMPLETE ====================
// ==================== 🔥 COMPLETE buildDynamicQuestionPrompt WITH EXAMPLE FILTERING ====================
function buildDynamicQuestionPrompt(topic, subtopic, difficulty, studentProfile, gradeId) {
    try {
        if (!topic || typeof topic !== 'object') {
            console.error('❌ Invalid topic object:', topic);
            throw new Error('Invalid topic object');
        }

        const topicName = String(topic?.name || 'Unknown Topic');
        const topicNameEn = String(topic?.nameEn || '');
        const subtopicName = String(subtopic?.name || '');
        const subtopicNameEn = String(subtopic?.nameEn || '');
        const studentGrade = String(studentProfile?.grade || '7');

        console.log('✅ buildDynamicQuestionPrompt - Variables:');
        console.log('   topicName:', topicName);
        console.log('   subtopicName:', subtopicName);

        const classification = classifyTopic(topicName, subtopicName);
        console.log('   Classification:', classification);

        let prompt = `צור שאלה במתמטיקה בעברית.\n\n`;

        prompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        prompt += `🎯 MANDATORY TOPIC REQUIREMENTS\n`;
        prompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        prompt += `נושא ראשי: ${topicName}\n`;

        if (subtopicName) {
            prompt += `תת-נושא (MUST BE THE MAIN FOCUS): ${subtopicName}\n`;
            prompt += `⚠️⚠️⚠️ השאלה חייבת להיות ישירות על "${subtopicName}"\n`;
        }

        prompt += `רמת קושי: ${difficulty}\n`;
        prompt += `כיתה: ${studentGrade}\n`;
        prompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

        // 🔥 GEOMETRY SECTIONS
        if (classification.isPureGeometry) {
            prompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            prompt += `📐 PURE GEOMETRY MODE - נקודות, קווים ומישורים\n`;
            prompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            prompt += `🚨 CRITICAL RULES:\n`;
            prompt += `✓ השתמש בשפה גאומטרית טהורה בלבד\n`;
            prompt += `✓ השאלה חייבת להתחיל ב: "נתון/נתונה/נתונים"\n`;
            prompt += `✓ דוגמאות לפתיחה:\n`;
            prompt += `  - "נתון מישור α וקו ישר l"\n`;
            prompt += `  - "נתונות שתי נקודות A ו-B במישור"\n`;
            prompt += `  - "נתונים שני קווים מקבילים m ו-n"\n\n`;
            prompt += `❌ אסור בהחלט:\n`;
            prompt += `  ❌ הקשרים מהחיים האמיתיים (גנים, בניינים וכו')\n`;
            prompt += `  ❌ חישובי שטח, היקף\n`;
            prompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        }

        if (classification.isAppliedGeometry) {
            prompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            prompt += `📏 APPLIED GEOMETRY MODE - חישובי צורות\n`;
            prompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            prompt += `✓ פתיחה: "נתון משולש...", "נתון ריבוע...", "נתון מעגל..."\n`;
            prompt += `✓ שאל על: שטח, היקף, גובה, אורך צלע\n\n`;

            prompt += `🚨 CRITICAL GEOMETRY VALIDATION RULES:\n`;
            prompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

            // 🔥🔥🔥 ULTRA-STRICT ISOSCELES SECTION - TRIPLE EMPHASIS
            prompt += `╔════════════════════════════════════════════════════╗\n`;
            prompt += `║  ⚠️  ABSOLUTE RULE FOR ISOSCELES TRIANGLES  ⚠️   ║\n`;
            prompt += `╚════════════════════════════════════════════════════╝\n\n`;

            prompt += `1. משולש שווה-שוקיים (Isosceles Triangle):\n`;
            prompt += `   \n`;
            prompt += `   🚨 READ THIS 5 TIMES BEFORE GENERATING:\n`;
            prompt += `   • An isosceles triangle has EXACTLY 3 SIDES:\n`;
            prompt += `     - Base (בסיס)\n`;
            prompt += `     - Left Leg (שוק שמאלי)\n`;
            prompt += `     - Right Leg (שוק ימני)\n`;
            prompt += `   \n`;
            prompt += `   • גובה (HEIGHT) is NOT A SIDE!\n`;
            prompt += `   • Height is a LINE FROM apex TO base (perpendicular)\n`;
            prompt += `   • Height is CALCULATED by student, NOT GIVEN\n`;
            prompt += `   • If you give height, the visual generator BREAKS\n`;
            prompt += `   \n`;
            prompt += `   ✅ THE ONLY ALLOWED FORMAT:\n`;
            prompt += `   "נתון משולש שווה-שוקיים ABC, שבו אורך הבסיס הוא X ס"מ,\n`;
            prompt += `    ואורך השוקיים הוא Y ס"מ. מה שטח המשולש?"\n`;
            prompt += `   \n`;
            prompt += `   That's it. NOTHING ELSE. Period.\n`;
            prompt += `   Just: Triangle definition + Base + Legs + Question.\n`;
            prompt += `   NO height mentioned ANYWHERE.\n`;
            prompt += `   \n`;
            prompt += `   🚫 FORBIDDEN PHRASES (NEVER USE THESE):\n`;
            prompt += `   ❌ "אם גובה המשולש לבסיס הוא" ← BREAKS THE SYSTEM!\n`;
            prompt += `   ❌ "אם גובה המשולש הוא" ← BREAKS THE SYSTEM!\n`;
            prompt += `   ❌ "גובה המשולש הוא" ← BREAKS THE SYSTEM!\n`;
            prompt += `   ❌ "וגובה" ← BREAKS THE SYSTEM!\n`;
            prompt += `   ❌ ", גובה" ← BREAKS THE SYSTEM!\n`;
            prompt += `   ❌ ANY mention of גובה as given information ← FORBIDDEN!\n`;
            prompt += `   \n`;
            prompt += `   💡 WHY NEVER MENTION HEIGHT?\n`;
            prompt += `   Because the student must LEARN to calculate it:\n`;
            prompt += `   Step 1: Split triangle in half → creates right triangle\n`;
            prompt += `   Step 2: Use Pythagorean theorem: h² + (base/2)² = leg²\n`;
            prompt += `   Step 3: Solve for h\n`;
            prompt += `   Step 4: Calculate area = ½ × base × h\n`;
            prompt += `   \n`;
            prompt += `   This is EDUCATIONAL. Giving height makes it trivial.\n`;
            prompt += `   Also: Mentioning height confuses the visual generator (sees 3 numbers).\n`;
            prompt += `   \n`;
            prompt += `   ✅ CORRECT EXAMPLES (COPY THESE FORMATS):\n`;
            prompt += `   1. "נתון משולש שווה-שוקיים ABC, בסיס 12 ס"מ, שוקיים 15 ס"מ. מה השטח?"\n`;
            prompt += `   2. "נתון משולש שווה-שוקיים, בסיס 10 ס"מ, שוקיים 13 ס"מ. מה ההיקף?"\n`;
            prompt += `   3. "נתון משולש שווה-שוקיים, בסיס 16 ס"מ, שוקיים 17 ס"מ. חשב את השטח."\n`;
            prompt += `   4. "נתון משולש שווה-שוקיים ABC, בסיס 14 ס"מ, שוקיים 20 ס"מ. מצא את הגובה." ← Height is ANSWER!\n`;
            prompt += `   \n`;
            prompt += `   ❌ WRONG EXAMPLES (NEVER EVER USE THESE):\n`;
            prompt += `   ❌ "בסיס 12, שוקיים 15, אם גובה 8, מה השטח?" ← 3 numbers = BROKEN VISUAL!\n`;
            prompt += `   ❌ "בסיס 12, שוקיים 15, וגובה המשולש הוא 8" ← FORBIDDEN FORMAT!\n`;
            prompt += `   ❌ "משולש עם צלעות 12, 15, 8" ← 8 is NOT a side!\n`;
            prompt += `   ❌ "נתון משולש שווה-שוקיים, בסיס 12 ס"מ, שוקיים 15 ס"מ. אם גובה המשולש לבסיס הוא 8 ס"מ, מה שטח המשולש?"\n`;
            prompt += `      ↑ THIS IS THE EXACT PHRASE YOU'VE BEEN GENERATING - STOP IT!\n`;
            prompt += `   \n`;
            prompt += `   📐 HOW TO SOLVE ISOSCELES AREA (Student's work):\n`;
            prompt += `   Given: Base = 12 cm, Legs = 15 cm\n`;
            prompt += `   Step 1: Height splits base in half → 6 cm each side\n`;
            prompt += `   Step 2: Right triangle formed: h² + 6² = 15²\n`;
            prompt += `   Step 3: h² = 225 - 36 = 189\n`;
            prompt += `   Step 4: h = √189 ≈ 13.75 cm\n`;
            prompt += `   Step 5: Area = ½ × 12 × 13.75 = 82.5 cm²\n`;
            prompt += `   \n`;
            prompt += `   See? Student calculates height! Don't give it!\n`;
            prompt += `   \n`;
            prompt += `   🎯 YOUR TASK: Create question with ONLY base + legs!\n`;
            prompt += `   Format: "נתון משולש שווה-שוקיים, בסיס X, שוקיים Y. מה השטח?"\n`;
            prompt += `   Two numbers only. Never three. Never mention גובה.\n\n`;

            prompt += `2. משולש ישר-זווית (Right Triangle):\n`;
            prompt += `   📋 Format: "נתון משולש ישר-זווית עם ניצב אחד X ס"מ וניצב שני Y ס"מ"\n`;
            prompt += `   ✅ Example: "משולש ניצבים 4 ו-6. מה השטח?"\n`;
            prompt += `   ✅ SAFE QUESTIONS: היתר, שטח, היקף\n\n`;

            prompt += `3. משולש שווה-צלעות (Equilateral):\n`;
            prompt += `   📋 Format: "נתון משולש שווה-צלעות שאורך צלעו X ס"מ"\n`;
            prompt += `   ✅ SAFE QUESTIONS: היקף, שטח, גובה\n\n`;

            prompt += `4. משולש כללי (General Triangle):\n`;
            prompt += `   📋 Format: "משולש בסיס X, גובה Y. מה השטח?"\n`;
            prompt += `   ✅ For general triangles, you CAN give both base AND height\n`;
            prompt += `   ⚠️ But for ISOSCELES: base + legs only!\n\n`;

            prompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            prompt += `🎯 PRE-GENERATION VALIDATION CHECKLIST:\n`;
            prompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            prompt += `Before generating, mentally check:\n`;
            prompt += `□ Am I creating an isosceles triangle question?\n`;
            prompt += `□ If YES: Did I count the numbers in my question?\n`;
            prompt += `□ For isosceles: Are there exactly 2 numbers (base + leg)?\n`;
            prompt += `□ Did I use the word "גובה" anywhere? If YES → DELETE IT!\n`;
            prompt += `□ Is my format: "נתון משולש שווה-שוקיים, בסיס X, שוקיים Y. מה..."?\n`;
            prompt += `□ Am I asking for area, perimeter, or height calculation?\n`;
            prompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        }

        // Load personality examples with filtering
        const studentId = studentProfile?.studentId || studentProfile?.name || 'anonymous';
        const topicId = topic?.id || topicName;
        const avoidancePrompt = questionHistoryManager.buildAvoidancePrompt(studentId, topicId);
        if (avoidancePrompt) {
            prompt += avoidancePrompt;
        }

        if (!classification.isPureGeometry) {
            const strategies = [
                '1. Pure mathematical: "נתון..."',
                '2. Real-world story',
                '3. Multi-step challenge',
                '4. Pattern discovery',
                '5. Comparison'
            ];
            const randomStrategy = strategies[Math.floor(Math.random() * strategies.length)];
            prompt += `🎲 VARIATION: ${randomStrategy}\n\n`;
        }

        prompt += `🔢 Use diverse, interesting numbers\n\n`;

        if (classification.allowsRealWorld && !classification.isPureGeometry) {
            const contexts = ['⚽ ספורט', '🏫 בית ספר', '🎨 אומנות', '🏗️ בנייה', '🌳 טבע'];
            const randomContext = contexts[Math.floor(Math.random() * contexts.length)];
            prompt += `🎨 אפשרי: ${randomContext}\n\n`;
        }

        // 🔥 PERSONALITY SYSTEM WITH SMART FILTERING
        if (personalitySystem.loaded) {
            const topicGuideline = personalitySystem.getTopicGuideline(topicName);
            if (topicGuideline) {
                prompt += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
                prompt += `📚 CURRICULUM GUIDELINES\n`;
                prompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
                if (topicGuideline.curriculum_requirements) {
                    prompt += `⚠️ MANDATORY:\n${topicGuideline.curriculum_requirements}\n\n`;
                }
                prompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
            }

            try {
                const examples = personalitySystem.getExamplesForTopic(topicName, difficulty);
                if (examples && examples.length > 0) {
                    let filteredExamples = examples;

                    // 🔥 FILTER EXAMPLES FOR TRIANGLE TOPICS
                    const isTriangleTopic = topicName.includes('משולש') || topicName.includes('triangle') ||
                        topicName.includes('גאומטריה') || topicName.includes('geometry') ||
                        subtopicName.includes('משולש') || subtopicName.includes('triangle');

                    if (isTriangleTopic) {
                        console.log('   🔍 Filtering triangle examples for topic:', topicName);

                        filteredExamples = examples.filter(ex => {
                            const question = String(ex?.question || '');
                            if (!question) return false;

                            // Check if isosceles
                            const isIsosceles = question.includes('שווה-שוקיים') ||
                                question.includes('שווה שוקיים') ||
                                question.toLowerCase().includes('isosceles');

                            if (!isIsosceles) return true; // Keep non-isosceles

                            // For isosceles: reject if mentions height as given info
                            const badPatterns = [
                                /אם\s+גובה/i,
                                /וגובה\s+המשולש/i,
                                /גובה\s+המשולש\s+(?:לבסיס\s+)?(?:הוא|הינו)\s+\d+/i,
                                /,\s*גובה\s+\d+/i,
                                /\.\s*גובה/i
                            ];

                            const hasBadPattern = badPatterns.some(pattern => pattern.test(question));

                            if (hasBadPattern) {
                                console.log('   ❌ Filtered bad example:', question.substring(0, 100));
                                return false;
                            }

                            console.log('   ✅ Kept good example:', question.substring(0, 80));
                            return true;
                        });

                        console.log(`   📊 Filtering: ${examples.length} → ${filteredExamples.length} examples`);
                    }

                    if (filteredExamples.length > 0) {
                        const shuffled = filteredExamples.sort(() => 0.5 - Math.random());
                        const selected = shuffled.slice(0, Math.min(2, filteredExamples.length));

                        prompt += `\n📚 EXAMPLE STYLES (create something DIFFERENT):\n`;
                        selected.forEach((ex, i) => {
                            prompt += `${i + 1}. ${ex.question}\n`;
                        });
                        prompt += `\n⚠️ Your question must be UNIQUE!\n`;

                        if (isTriangleTopic) {
                            prompt += `\n🚨 CRITICAL OVERRIDE FOR ISOSCELES:\n`;
                            prompt += `Even if you see old examples mentioning "גובה":\n`;
                            prompt += `YOU MUST NOT COPY THAT FORMAT!\n`;
                            prompt += `Use ONLY: "נתון משולש שווה-שוקיים, בסיס X, שוקיים Y"\n`;
                            prompt += `TWO numbers ONLY. NO height!\n`;
                        }
                        prompt += `\n`;
                    }
                }
            } catch (exampleError) {
                console.error('⚠️ Error loading examples:', exampleError.message);
            }
        }

        // Statistics formatting
        if (classification.isStatistics) {
            prompt += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            prompt += `📊 DATA FORMATTING (MANDATORY)\n`;
            prompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
            prompt += `✅ REQUIRED: MINIMUM 20 data points\n`;
            prompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
        }

        // JSON formatting rules
        prompt += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        prompt += `🚨 CRITICAL JSON RULES:\n`;
        prompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        prompt += `1. Return ONLY valid JSON\n`;
        prompt += `2. Use \\n for newlines, NOT actual newlines\n`;
        prompt += `3. Escape quotes: use \\" inside strings\n`;
        prompt += `4. NO trailing commas\n`;
        prompt += `5. NO comments\n\n`;

        prompt += `REQUIRED FORMAT:\n`;
        prompt += `{\n`;
        prompt += `  "question": "השאלה (NO actual newlines)",\n`;
        prompt += `  "correctAnswer": "התשובה",\n`;
        prompt += `  "hints": ["רמז 1", "רמז 2", "רמז 3"],\n`;
        prompt += `  "explanation": "ההסבר"\n`;
        prompt += `}\n`;
        prompt += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

        prompt += `╔════════════════════════════════════════════════════╗\n`;
        prompt += `║  🔥 FINAL REMINDER FOR ISOSCELES TRIANGLES 🔥    ║\n`;
        prompt += `╚════════════════════════════════════════════════════╝\n`;
        prompt += `If creating isosceles triangle question:\n`;
        prompt += `- Give ONLY base and legs (2 numbers)\n`;
        prompt += `- Format: "נתון משולש שווה-שוקיים, בסיס X, שוקיים Y"\n`;
        prompt += `- DO NOT EVER mention גובה (height)\n`;
        prompt += `- Let student calculate height themselves\n`;
        prompt += `- This prevents visual errors AND teaches properly\n\n`;

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📝 COMPLETE PROMPT TO CLAUDE');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(prompt);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        return prompt;

    } catch (error) {
        console.error('❌ FATAL ERROR in buildDynamicQuestionPrompt:', error);
        throw new Error(`buildDynamicQuestionPrompt failed: ${error.message}`);
    }
}
// ==================== GENERATE QUESTION ENDPOINT ====================
app.post('/api/ai/generate-question', async (req, res) => {
    try {
        const { topic, subtopic, difficulty, studentProfile } = req.body;

        if (!topic || !topic.name) {
            return res.status(400).json({
                success: false,
                error: 'Invalid topic object'
            });
        }

        if (!studentProfile || !studentProfile.grade) {
            return res.status(400).json({
                success: false,
                error: 'Invalid student profile'
            });
        }

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📝 SMART QUESTION GENERATION');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('   Topic:', topic.name);
        console.log('   Subtopic:', subtopic?.name || 'General');

        const gradeId = `grade_${studentProfile.grade}`;
        const studentId = studentProfile.studentId || studentProfile.name || 'anonymous';

        let prompt = buildDynamicQuestionPrompt(topic, subtopic, difficulty, studentProfile, gradeId);
        const systemPrompt = buildEnhancedSystemPrompt(studentProfile, gradeId, topic, subtopic);

        let attempts = 0;
        let parsed;
        const maxAttempts = 3;

        while (attempts < maxAttempts) {
            attempts++;

            if (process.env.ANTHROPIC_API_KEY) {
                console.log(`   🔄 Attempt ${attempts}/${maxAttempts}`);

                const response = await fetch('https://api.anthropic.com/v1/messages', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': process.env.ANTHROPIC_API_KEY,
                        'anthropic-version': '2023-06-01'
                    },
                    body: JSON.stringify({
                        model: 'claude-3-5-haiku-20241022',
                        max_tokens: 3000,
                        temperature: 0.8 + (attempts * 0.1),
                        system: systemPrompt,
                        messages: [{ role: 'user', content: prompt }]
                    })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error?.message || 'API error');
                }

                const rawText = data.content[0].text;
                const jsonText = cleanJsonText(rawText);
                parsed = JSON.parse(jsonText);

                console.log('   ✅ Parsed successfully');

                const topicId = topic.id || topic.name;
                const recentQuestions = questionHistoryManager.getRecentQuestions(studentId, topicId, 5);
                const isSimilar = questionHistoryManager.isSimilar(parsed.question, recentQuestions);

                if (isSimilar && attempts < maxAttempts) {
                    console.log(`   ⚠️ Too similar, retrying...`);
                    prompt += `\n\n🚨 TOO SIMILAR! Create MORE DIFFERENT!\n`;
                    continue;
                } else {
                    console.log('   ✅ Question is unique');
                    break;
                }
            } else {
                throw new Error('No AI API configured');
            }
        }

        const validation = validateQuestionHasRawData(parsed, topic, subtopic);
        if (!validation.valid) {
            console.log('   ⚠️ Validation failed - rewriting');
            parsed = forceRewriteGraphDescription(parsed, topic, subtopic);
        }

        parsed = ensureVisualDataForGraphQuestions(parsed, topic, subtopic);
        parsed = detectGeometryVisual(parsed, topic, subtopic);

        if (parsed.visualData?.type?.startsWith('svg-')) {
            const svgType = parsed.visualData.type.replace('svg-', '');
            let svg = null;

            try {
                if (svgType === 'triangle') {
                    svg = SVGGenerator.generateTriangle(parsed.visualData.svgData);
                } else if (svgType === 'rectangle') {
                    svg = SVGGenerator.generateRectangle(parsed.visualData.svgData);
                } else if (svgType === 'circle') {
                    svg = SVGGenerator.generateCircle(parsed.visualData.svgData);
                }

                if (svg) {
                    parsed.visualData.svg = svg;
                    console.log('   ✅ SVG generated:', svgType);
                }
            } catch (svgError) {
                console.error('   ❌ SVG error:', svgError);
            }
        }

        const topicId = topic.id || topic.name;
        questionHistoryManager.addQuestion(studentId, topicId, {
            question: parsed.question,
            timestamp: Date.now()
        });

        console.log('   ✅ Complete');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        return res.json({
            success: true,
            question: {
                question: parsed.question,
                correctAnswer: parsed.correctAnswer,
                hints: parsed.hints || [],
                explanation: parsed.explanation || '',
                topic: topic.name,
                subtopic: subtopic?.name,
                difficulty: parsed.difficulty || difficulty,
                gradeLevel: studentProfile.grade,
                visualData: parsed.visualData || null,
                curriculumAligned: true,
                reformYear: CURRICULUM_METADATA.reformYear
            },
            model: 'claude-3.5-haiku',
            personalityActive: personalitySystem.loaded,
            attemptCount: attempts
        });

    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
// ==================== VERIFY ANSWER ====================
app.post('/api/ai/verify-answer', async (req, res) => {
    try {
        const { question, userAnswer, correctAnswer, studentName, topic } = req.body;

        console.log('🔍 VERIFYING ANSWER');

        if (compareMathExpressions(userAnswer, correctAnswer)) {
            console.log('✅ EXACT MATCH');

            return res.json({
                success: true,
                isCorrect: true,
                confidence: 100,
                feedback: 'נכון מצוין! 🎉',
                explanation: 'התשובה שלך נכונה!',
                model: 'exact-match'
            });
        }

        const prompt = `בדוק:\n\nשאלה: ${question}\nתלמיד: ${userAnswer}\nנכון: ${correctAnswer}\n\nJSON:\n{"isCorrect":true/false,"feedback":"...","explanation":"..."}`;

        if (process.env.ANTHROPIC_API_KEY) {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': process.env.ANTHROPIC_API_KEY,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-3-5-haiku-20241022',
                    max_tokens: 1500,
                    temperature: 0.3,
                    system: 'אתה נקסון. בדוק שקילות מתמטית. JSON בלבד.',
                    messages: [{ role: 'user', content: prompt }]
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error?.message || 'API error');
            }

            const rawText = data.content[0].text;
            const jsonText = cleanJsonText(rawText);
            const parsed = JSON.parse(jsonText);

            return res.json({
                success: true,
                isCorrect: parsed.isCorrect,
                confidence: 95,
                feedback: parsed.feedback,
                explanation: parsed.explanation,
                model: 'claude-3.5-haiku'
            });
        }

        throw new Error('No AI configured');

    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ==================== GET HINT ====================
app.post('/api/ai/get-hint', async (req, res) => {
    try {
        const { question, hintIndex } = req.body;

        const hintLevels = ['רמז עדין', 'רמז ישיר', 'רמז ספציפי'];
        const prompt = `תן ${hintLevels[hintIndex]} לשאלה:\n\n${question}`;

        if (process.env.ANTHROPIC_API_KEY) {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': process.env.ANTHROPIC_API_KEY,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-3-5-haiku-20241022',
                    max_tokens: 500,
                    temperature: 0.7,
                    messages: [{ role: 'user', content: prompt }]
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error?.message || 'API error');
            }

            return res.json({
                success: true,
                hint: data.content[0].text
            });
        }

        throw new Error('No AI configured');

    } catch (error) {
        console.error('❌ Error:', error);
        res.json({
            success: true,
            hint: 'נסה לפרק את השאלה 🤔'
        });
    }
});

// ==================== AI CHAT ====================
app.post('/api/ai/chat', async (req, res) => {
    try {
        const { message, context } = req.body;

        const wantsFullSolution = /פתרון|הראה|שלב/i.test(message);

        let conversationPrompt = wantsFullSolution
            ? `תן פתרון מפורט ל: ${context?.question}`
            : `עזור: "${message}"\n\nשאלה: ${context?.question}`;

        if (process.env.ANTHROPIC_API_KEY) {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': process.env.ANTHROPIC_API_KEY,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-3-5-haiku-20241022',
                    max_tokens: wantsFullSolution ? 2000 : 800,
                    temperature: 0.7,
                    messages: [{ role: 'user', content: conversationPrompt }]
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error?.message || 'API error');
            }

            return res.json({
                success: true,
                response: data.content[0].text,
                model: 'claude-3.5-haiku'
            });
        }

        throw new Error('No AI configured');

    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ==================== START SERVER ====================
async function loadPersonalityFromStorage() {
    if (!bucket) {
        console.log('⚠️ Firebase not configured - using local storage');
        const localPath = path.join(__dirname, '../uploads/personality-system.xlsx');
        if (fs.existsSync(localPath)) {
            personalitySystem.loadFromExcel(localPath);
            console.log('✅ Loaded from local file');
        }
        return;
    }

    try {
        const file = bucket.file('personality-system.xlsx');
        const [exists] = await file.exists();
        if (exists) {
            const tempPath = `/tmp/personality-system.xlsx`;
            await file.download({ destination: tempPath });
            personalitySystem.loadFromExcel(tempPath);
            console.log('✅ Loaded from Firebase');
        }
    } catch (error) {
        console.error('❌ Error loading personality:', error.message);
    }
}

app.listen(PORT, async () => {
    await loadPersonalityFromStorage();

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 NEXON AI - SMART TOPIC-BASED QUESTIONS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📡 Server: http://localhost:${PORT}`);
    console.log(`   • Personality: ${personalitySystem.loaded ? '✅' : '❌'}`);
    console.log(`   • Smart Topics: ✅`);
    console.log(`   • SVG Support: ✅`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
});