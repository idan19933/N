// server/ai-proxy.js - ULTIMATE FIXED VERSION WITH PERSONALITY + GRAPH EXTRACTION

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import personalitySystem from './services/personalityLoader.js';
import { bucket } from './config/firebase-admin.js';

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
        console.log('   Field name:', file.fieldname);

        // Check file extension
        const isExcel = file.originalname.toLowerCase().endsWith('.xlsx') ||
            file.originalname.toLowerCase().endsWith('.xls');

        // Check MIME type (more permissive)
        const validMimeTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'application/octet-stream', // Sometimes Windows sends this
            'application/zip' // .xlsx files are actually zip archives
        ];

        const validMime = validMimeTypes.includes(file.mimetype);

        if (isExcel || validMime) {
            console.log('   ✅ File accepted');
            cb(null, true);
        } else {
            console.log('   ❌ File rejected - not an Excel file');
            console.log('   Accepted extensions: .xlsx, .xls');
            console.log('   Accepted MIME types:', validMimeTypes.join(', '));
            cb(new Error('Only Excel files (.xlsx or .xls) allowed!'), false);
        }
    }
});

// ==================== HELPER FUNCTION: CLEAN JSON ====================
// ==================== HELPER FUNCTION: CLEAN JSON - ENHANCED ====================
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

    // 🔥 FIX: Remove control characters (including unescaped newlines)
    jsonText = jsonText
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '') // Remove control chars
        .replace(/\\n/g, '\\n')  // Ensure newlines are properly escaped
        .replace(/\\r/g, '\\r')  // Ensure carriage returns are escaped
        .replace(/\\t/g, '\\t'); // Ensure tabs are escaped

    // 🔥 FIX: Handle unescaped quotes in strings
    // This regex finds unescaped quotes within JSON string values
    try {
        // Try parsing first
        return jsonText;
    } catch (e) {
        console.log('⚠️ Initial parse failed, attempting deep clean...');

        // More aggressive cleaning: escape all unescaped newlines
        jsonText = jsonText.split('\n').map(line => {
            // If line is inside a string value, escape it
            if (line.trim() && !line.trim().startsWith('{') && !line.trim().startsWith('}') && !line.trim().startsWith('"')) {
                return line.replace(/\n/g, ' ');
            }
            return line;
        }).join('\n');

        return jsonText;
    }
}

// ==================== VALIDATE QUESTION HAS RAW DATA - NUCLEAR VERSION ====================
function validateQuestionHasRawData(parsed, topic, subtopic) {
    const questionText = parsed.question;

    const graphTopics = [
        'פונקציות', 'גרפים', 'Functions', 'Graphs',
        'סטטיסטיקה', 'Statistics', 'נתונים', 'Data',
        'פיזור', 'Scatter', 'רבעונים', 'Quartiles',
        'תחום בין-רבעוני', 'IQR', 'היסטוגרמה', 'Histogram'
    ];

    const needsGraph = graphTopics.some(t =>
        topic.name.includes(t) || topic.nameEn?.includes(t) ||
        (subtopic && (subtopic.name.includes(t) || subtopic.nameEn?.includes(t)))
    );

    if (!needsGraph) {
        return { valid: true };
    }

    console.log('🔍 Validating question has raw data...');

    // 🔥🔥🔥 ULTIMATE FORBIDDEN PATTERNS
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
        /נתונים.*אלה/i,  // 🔥 NEW: "נתונים אלה"
        /להלן.*הנתונים/i,  // 🔥 NEW: "להלן הנתונים"
        /בגרף.*הבא/,
        /בגרף.*הפיזור.*הבא/,
        /שם.*התלמיד.*\|/,
        /\d+-\d+\s*\|/,
        /\d+\+\s*\|/,
        /טבלה.*הבאה/,
        /\|.*\|.*\|/,  // Table format
        /[א-ת]+\s*\d*\s*:\s*\d+\s*שעות/i,  // 🔥 NEW: catches "תלמיד 1: 5 שעות"
        /תלמיד\s*\d+\s*:\s*\d+/i,  // 🔥 NEW: catches any "תלמיד X: Y"
        /[א-ת]+:\s*\d+\s*שעות,\s*[א-ת]+:\s*\d+\s*שעות/  // catches "דני: 4 שעות, יוסי: 6 שעות"
    ];

    const hasForbiddenPattern = forbiddenPatterns.some(pattern =>
        pattern.test(questionText)
    );

    if (hasForbiddenPattern) {
        console.log('❌ Question has FORBIDDEN pattern');

        // Debug: show which pattern matched
        forbiddenPatterns.forEach((pattern, idx) => {
            if (pattern.test(questionText)) {
                console.log(`   ⚠️ Matched forbidden pattern #${idx}`);
            }
        });

        return {
            valid: false,
            reason: 'Contains forbidden name:value or description patterns'
        };
    }

    // 🔥 Check for TWO labeled lists format (REQUIRED for scatter plots)
    const hasTwoLabeledLists = /\(x\)\s*:\s*[0-9,\s]+/i.test(questionText) &&
        /\(y\)\s*:\s*[0-9,\s]+/i.test(questionText);

    if (hasTwoLabeledLists) {
        console.log('✅ Question has TWO labeled lists with (x) and (y)');
        return { valid: true };
    }

    // Check for comma-separated numbers (at least 10)
    const commaNumbers = questionText.match(/\d+(?:\.\d+)?(?:\s*,\s*\d+(?:\.\d+)?){9,}/g);

    if (commaNumbers && commaNumbers.length > 0) {
        console.log('✅ Question has comma-separated numbers (10+)');
        return { valid: true };
    }

    console.log('❌ Question does NOT have proper raw data format');
    console.log('   Missing: TWO labeled lists with (x): ... and (y): ...');
    return {
        valid: false,
        reason: 'Missing proper labeled lists format'
    };
}

// ==================== FORCE REWRITE - ULTIMATE VERSION ====================
function forceRewriteGraphDescription(parsed, topic, subtopic) {
    const questionText = parsed.question;

    // 🔥🔥🔥 ULTIMATE forbidden patterns detection
    const forbiddenPatterns = [
        /הגרף.*מציג/i,
        /התרשים.*מציג/i,
        /הגרף.*מראה/i,
        /התוצאות.*מוצגות/i,
        /הנתונים.*מוצגים/i,
        /נתונים.*אלה.*מוצגים/i,
        /נתוני.*הסקר.*מראים/i,
        /נתונים.*אלה/i,  // 🔥 NEW
        /להלן.*הנתונים/i,  // 🔥 NEW: catches "להלן הנתונים"
        /הגרף.*שלו.*מציג/i,
        /מוצגים.*בגרף.*פיזור/i
    ];

    const hasGraphDescription = forbiddenPatterns.some(pattern => pattern.test(questionText));

    // 🔥 Detect ANY label:number format (including "תלמיד 1: 5 שעות")
    const anyLabelPattern = /([א-ת]+\s*\d*)\s*:\s*(\d+)\s*שעות/g;
    const anyLabelMatches = [...questionText.matchAll(anyLabelPattern)];
    const hasLabelValueFormat = anyLabelMatches.length >= 3;  // At least 3 label:value pairs

    if (!hasGraphDescription && !hasLabelValueFormat) {
        return parsed; // Question is fine
    }

    console.log('🚨🚨🚨 DETECTED BAD QUESTION FORMAT - FORCING COMPLETE REWRITE');
    if (hasGraphDescription) {
        console.log('   ❌ Has graph description phrase');
    }
    if (hasLabelValueFormat) {
        console.log('   ❌ Uses label:value format (found', anyLabelMatches.length, 'pairs)');
        console.log('   Labels:', anyLabelMatches.slice(0, 5).map(m => m[1]).join(', '));
    }

    // Determine context from original question
    const isWeight = questionText.includes('משקל');
    const isHeight = questionText.includes('גובה');
    const isSport = questionText.includes('ספורט') || questionText.includes('חוג');
    const isGrades = questionText.includes('ציון');
    const isCorrelation = questionText.includes('מתאם') || questionText.includes('קשר');

    // Generate realistic data
    const numPoints = 20 + Math.floor(Math.random() * 4); // 20-23 points
    const xValues = [];
    const yValues = [];

    let rewrittenQuestion = '';
    let xLabel = 'X';
    let yLabel = 'Y';

    if (isSport && isGrades) {
        // Sport hours vs Math grades
        for (let i = 0; i < numPoints; i++) {
            xValues.push(Math.floor(1 + Math.random() * 7));  // 1-7 hours
            yValues.push(Math.floor(65 + Math.random() * 30)); // 65-95 grades
        }

        rewrittenQuestion = `בית ספר 'רמת אביב' ערך סקר על מספר השעות השבועיות שתלמידי כיתה ח' משקיעים בספורט, והציונים שלהם במתמטיקה.

נאספו נתונים מ-${numPoints} תלמידים:

שעות ספורט שבועיות (x): ${xValues.join(', ')}
ציון במתמטיקה (y): ${yValues.join(', ')}

צרו גרף פיזור והסבירו מה ניתן ללמוד על הקשר בין שעות ספורט לציונים.`;

        xLabel = 'שעות ספורט';
        yLabel = 'ציון במתמטיקה';

    } else if (isSport && !isGrades) {
        // Just sport/activity hours - create two variables
        for (let i = 0; i < numPoints; i++) {
            xValues.push(Math.floor(1 + Math.random() * 7));  // 1-7 hours outdoor
            yValues.push(Math.floor(1 + Math.random() * 7));  // 1-7 hours indoor
        }

        rewrittenQuestion = `בקייטנת קיץ של בית הספר 'נווה שלום', נרשמו ${numPoints} תלמידים. המדריכים רשמו את מספר השעות השבועיות שכל תלמיד מבלה בחוגים שונים:

שעות חוגי ספורט (x): ${xValues.join(', ')}
שעות חוגי אומנות (y): ${yValues.join(', ')}

צרו גרף פיזור והסבירו מה ניתן ללמוד מהנתונים על הקשר בין סוגי החוגים.`;

        xLabel = 'חוגי ספורט (שעות)';
        yLabel = 'חוגי אומנות (שעות)';

    } else if (isWeight && isSport) {
        // Weight vs Sport hours
        for (let i = 0; i < numPoints; i++) {
            xValues.push(Math.floor(40 + Math.random() * 40)); // 40-80 kg
            yValues.push(Math.floor(1 + Math.random() * 8));   // 1-8 hours
        }

        rewrittenQuestion = `בקייטנת קיץ של בית ספר 'נווה אילן', נרשמו ${numPoints} תלמידים. נמדדו נתונים על מספר שעות ספורט שבועיות ומשקל:

משקל בק"ג (x): ${xValues.join(', ')}
שעות ספורט (y): ${yValues.join(', ')}

צרו גרף פיזור והסבירו מה המתאם בין משקל למספר שעות ספורט.`;

        xLabel = 'משקל (ק"ג)';
        yLabel = 'שעות ספורט';

    } else if (isHeight && isGrades) {
        // Height vs Grades
        for (let i = 0; i < numPoints; i++) {
            xValues.push(Math.floor(145 + Math.random() * 40)); // 145-185 cm
            yValues.push(Math.floor(65 + Math.random() * 30));  // 65-95 grades
        }

        rewrittenQuestion = `בכיתה ח' נמדדו ${numPoints} תלמידים. הנתונים כוללים גובה וציון במתמטיקה:

גובה בס"מ (x): ${xValues.join(', ')}
ציונים (y): ${yValues.join(', ')}

צרו גרף פיזור והסבירו מה המתאם בין גובה התלמיד לציון במתמטיקה.`;

        xLabel = 'גובה (ס"מ)';
        yLabel = 'ציון במתמטיקה';

    } else if (isSport || isCorrelation) {
        // Generic sport/study hours correlation
        for (let i = 0; i < numPoints; i++) {
            xValues.push(Math.floor(1 + Math.random() * 8));   // 1-8 hours study
            yValues.push(Math.floor(65 + Math.random() * 30)); // 65-95 grades
        }

        rewrittenQuestion = `במחקר על הקשר בין שעות לימוד לציונים, נאספו נתונים מ-${numPoints} תלמידים:

שעות לימוד שבועיות (x): ${xValues.join(', ')}
ציון מתמטיקה (y): ${yValues.join(', ')}

צרו גרף פיזור והסבירו מה המתאם בין שעות הלימוד לציון.`;

        xLabel = 'שעות לימוד';
        yLabel = 'ציון';

    } else {
        // Generic scatter data
        for (let i = 0; i < numPoints; i++) {
            xValues.push(Math.floor(10 + Math.random() * 40));  // 10-50
            yValues.push(Math.floor(50 + Math.random() * 50));  // 50-100
        }

        rewrittenQuestion = `נאספו ${numPoints} נתונים על שני משתנים:

משתנה X: ${xValues.join(', ')}
משתנה Y: ${yValues.join(', ')}

צרו גרף פיזור והסבירו מה המתאם בין שני המשתנים.`;

        xLabel = 'X';
        yLabel = 'Y';
    }

    // Create visualData
    const points = xValues.map((x, idx) => ({
        x: x,
        y: yValues[idx],
        label: `תלמיד ${idx + 1}`
    }));

    const visualData = {
        type: 'scatter',
        points: points,
        xRange: [Math.min(...xValues) - 2, Math.max(...xValues) + 2],
        yRange: [Math.min(...yValues) - 2, Math.max(...yValues) + 2],
        color: '#9333ea',
        label: 'גרף פיזור - קשר בין משתנים',
        xLabel: xLabel,
        yLabel: yLabel
    };

    // Update parsed object
    parsed.question = rewrittenQuestion;
    parsed.visualData = visualData;

    console.log('✅✅✅ Question COMPLETELY rewritten with proper format');
    console.log('   X values:', xValues.length, 'points');
    console.log('   Y values:', yValues.length, 'points');
    console.log('   visualData type:', visualData.type);
    console.log('   Format: TWO labeled comma-separated lists');
    console.log('🔥🔥🔥 REWRITE COMPLETE 🔥🔥🔥\n');

    return parsed;
}
// ==================== ULTIMATE VISUAL DATA EXTRACTION ====================
function ensureVisualDataForGraphQuestions(parsed, topic, subtopic) {
    try {
        const questionText = parsed.question;

        console.log('\n🔥🔥🔥 ULTIMATE EXTRACTION STARTING 🔥🔥🔥');
        console.log('Question:', questionText.substring(0, 200));
        console.log('Parsed visualData from AI:', parsed.visualData);

        // Check if visualData exists AND has actual data
        if (parsed.visualData && (parsed.visualData.data?.length > 0 || parsed.visualData.points?.length > 0)) {
            console.log('✅ visualData already exists with data');
            return parsed;
        }

        // ═══════════════════════════════════════════════════════════════
        // METHOD 0D: TWO SEPARATE COMMA-SEPARATED LISTS WITH LABELS
        // This is THE PRIMARY method for scatter plots
        // Example: "שעות צפייה (x): 2, 3, 1, 4... שעות גלישה (y): 3, 2, 4, 1..."
        // ═══════════════════════════════════════════════════════════════
        console.log('🔎 METHOD 0D: Searching for labeled X-Y lists...');

        // More flexible pattern matching
        // Match: "any text (x): numbers" and "any text (y): numbers"
        const xListPattern = /([^\n:]+?)\s*\(x\)\s*:\s*([0-9,\s]+)/i;
        const yListPattern = /([^\n:]+?)\s*\(y\)\s*:\s*([0-9,\s]+)/i;

        const xMatch = questionText.match(xListPattern);
        const yMatch = questionText.match(yListPattern);

        console.log('   X pattern match:', xMatch ? 'FOUND' : 'NOT FOUND');
        console.log('   Y pattern match:', yMatch ? 'FOUND' : 'NOT FOUND');

        if (xMatch && yMatch) {
            console.log('📦 FOUND X-Y labeled lists!');

            const xLabel = xMatch[1].trim();
            const yLabel = yMatch[1].trim();

            console.log('   X label:', xLabel);
            console.log('   Y label:', yLabel);
            console.log('   X raw data:', xMatch[2].substring(0, 50));
            console.log('   Y raw data:', yMatch[2].substring(0, 50));

            const xValues = xMatch[2]
                .split(',')
                .map(n => parseFloat(n.trim()))
                .filter(n => !isNaN(n));

            const yValues = yMatch[2]
                .split(',')
                .map(n => parseFloat(n.trim()))
                .filter(n => !isNaN(n));

            console.log('📊 Extracted values:');
            console.log('   X count:', xValues.length, '→', xValues);
            console.log('   Y count:', yValues.length, '→', yValues);

            if (xValues.length >= 4 && yValues.length >= 4) {
                // For scatter plots, we need matching lengths
                const minLength = Math.min(xValues.length, yValues.length);
                const xData = xValues.slice(0, minLength);
                const yData = yValues.slice(0, minLength);

                console.log('✅ Creating scatter plot with', minLength, 'points');

                const points = xData.map((x, idx) => ({
                    x: x,
                    y: yData[idx],
                    label: `נקודה ${idx + 1}`
                }));

                const visualData = {
                    type: 'scatter',
                    points: points,
                    xRange: [Math.min(...xData) - 1, Math.max(...xData) + 1],
                    yRange: [Math.min(...yData) - 1, Math.max(...yData) + 1],
                    color: '#9333ea',
                    label: 'גרף פיזור - קשר בין משתנים',
                    xLabel: xLabel,
                    yLabel: yLabel
                };

                console.log('✅✅✅ SUCCESS! Created scatter plot from labeled lists');
                console.log('   Points:', points.length);
                console.log('   X range:', visualData.xRange);
                console.log('   Y range:', visualData.yRange);
                console.log('🔥🔥🔥 EXTRACTION COMPLETE 🔥🔥🔥\n');

                return { ...parsed, visualData };
            } else {
                console.log('❌ Not enough valid numbers extracted');
                console.log('   X:', xValues.length, 'Y:', yValues.length);
            }
        } else {
            console.log('❌ Could not find both X and Y labeled lists');
            if (!xMatch) console.log('   Missing X pattern');
            if (!yMatch) console.log('   Missing Y pattern');
        }

        // ═══════════════════════════════════════════════════════════════
        // METHOD 0A: COORDINATE PAIRS (x,y) format
        // ═══════════════════════════════════════════════════════════════
        console.log('🔎 METHOD 0A: Searching for coordinate pairs...');
        const coordPairPattern = /\((\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?)\)/g;
        const coordMatches = [...questionText.matchAll(coordPairPattern)];

        if (coordMatches && coordMatches.length >= 4) {
            console.log('📦 Found coordinate pairs:', coordMatches.length, 'pairs');

            const xValues = coordMatches.map(m => parseFloat(m[1]));
            const yValues = coordMatches.map(m => parseFloat(m[2]));

            let xLabel = 'X';
            let yLabel = 'Y';

            if (questionText.includes('שעות') || questionText.includes('ספורט')) {
                xLabel = 'שעות';
            }
            if (questionText.includes('ציון') || questionText.includes('מתמטיקה')) {
                yLabel = 'ציונים';
            }

            const points = xValues.map((x, idx) => ({
                x: x,
                y: yValues[idx],
                label: `נקודה ${idx + 1}`
            }));

            const visualData = {
                type: 'scatter',
                points: points,
                xRange: [Math.min(...xValues) - 1, Math.max(...xValues) + 1],
                yRange: [Math.min(...yValues) - 5, Math.max(...yValues) + 5],
                color: '#9333ea',
                label: 'גרף פיזור - קשר בין משתנים',
                xLabel: xLabel,
                yLabel: yLabel
            };

            console.log('✅✅✅ SUCCESS! Created coordinate pairs scatter plot');
            console.log('🔥🔥🔥 EXTRACTION COMPLETE 🔥🔥🔥\n');

            return { ...parsed, visualData };
        }

        // ═══════════════════════════════════════════════════════════════
        // METHOD 2: Single comma-separated list (for boxplot/histogram)
        // ═══════════════════════════════════════════════════════════════
        console.log('🔎 METHOD 2: Searching for comma-separated numbers...');
        const commaPattern = /(\d+(?:\.\d+)?(?:\s*,\s*\d+(?:\.\d+)?){4,})/g;
        const commaMatches = questionText.match(commaPattern);

        if (commaMatches && commaMatches.length > 0) {
            console.log('📦 Found comma-separated numbers');

            const numbers = commaMatches[0]
                .split(',')
                .map(n => parseFloat(n.trim()))
                .filter(n => !isNaN(n) && n >= 0);

            console.log('📊 Extracted:', numbers.length, 'numbers');

            if (numbers.length >= 5) {
                const result = createVisualData(numbers, questionText);
                if (result.visualData) {
                    console.log('✅✅✅ SUCCESS from comma-separated list');
                    console.log('🔥🔥🔥 EXTRACTION COMPLETE 🔥🔥🔥\n');
                    return { ...parsed, visualData: result.visualData };
                }
            }
        }

        console.log('⚠️ Could not extract data from question');
        console.log('🔥🔥🔥 EXTRACTION FAILED 🔥🔥🔥\n');

    } catch (error) {
        console.error('❌ EXTRACTION ERROR:', error.message);
        console.error('Stack:', error.stack);
    }

    return parsed;
}

// Helper function for creating visualData from single array
function createVisualData(numbers, questionText) {
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    const min = Math.min(...numbers);
    const max = Math.max(...numbers);
    const range = max - min;

    console.log(`📈 Stats: mean=${mean.toFixed(1)}, range=${range}`);

    if (range < 1) {
        console.log('❌ Range too small');
        return { visualData: null };
    }

    let xLabel = 'ערכים';
    if (questionText.includes('גובה') || questionText.includes('גבה')) {
        xLabel = 'גובה (ס״מ)';
    } else if (questionText.includes('ציון')) {
        xLabel = 'ציונים';
    } else if (questionText.includes('שעות')) {
        xLabel = 'שעות';
    } else if (questionText.includes('טמפרטורה')) {
        xLabel = 'טמפרטורה';
    } else if (questionText.includes('משקל')) {
        xLabel = 'משקל (ק״ג)';
    }

    const isHistogram = questionText.includes('היסטוגרמה');
    const isScatter = questionText.includes('פיזור') || questionText.includes('scatter') || questionText.includes('מתאם');

    let graphType = 'boxplot';
    if (isHistogram) graphType = 'histogram';
    if (isScatter) graphType = 'scatter';

    let visualData;

    if (graphType === 'scatter') {
        const points = numbers.map((val, idx) => ({
            x: idx + 1,
            y: val,
            label: `נקודה ${idx + 1}`
        }));

        visualData = {
            type: 'scatter',
            points: points,
            xRange: [0, numbers.length + 1],
            yRange: [Math.max(0, min - 2), max + 2],
            color: '#9333ea',
            label: 'גרף פיזור',
            xLabel: 'תלמיד',
            yLabel: xLabel
        };
    } else {
        visualData = {
            type: graphType,
            data: numbers,
            label: graphType === 'boxplot' ? 'תרשים קופסה' : 'היסטוגרמה',
            xLabel: xLabel,
            yLabel: graphType === 'histogram' ? 'תדירות' : '',
            bins: 5
        };
    }

    console.log('✅ Created visualData:', graphType, 'with', numbers.length, 'points');

    return { visualData };
}

// ==================== HEALTH CHECK ====================
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Nexon AI Server Running',
        personalityLoaded: personalitySystem.loaded,
        firebaseStorage: bucket ? 'available' : 'unavailable'
    });
});

// ==================== ADMIN: UPLOAD PERSONALITY EXCEL ====================
app.post('/api/admin/upload-personality', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        console.log('📁 Uploading personality file...');

        if (bucket) {
            console.log('☁️ Saving to Firebase Storage...');

            const blob = bucket.file('personality-system.xlsx');
            const blobStream = blob.createWriteStream({
                metadata: {
                    contentType: req.file.mimetype,
                    metadata: {
                        uploadedAt: new Date().toISOString()
                    }
                }
            });

            blobStream.on('error', (err) => {
                console.error('❌ Firebase upload error:', err);
                return res.status(500).json({ success: false, error: 'Failed to upload to storage' });
            });

            blobStream.on('finish', async () => {
                console.log('✅ File saved to Firebase Storage');

                const tempPath = `/tmp/personality-system-${Date.now()}.xlsx`;
                fs.writeFileSync(tempPath, req.file.buffer);

                const loaded = personalitySystem.loadFromExcel(tempPath);

                fs.unlinkSync(tempPath);

                if (loaded) {
                    res.json({
                        success: true,
                        message: 'Personality system uploaded and loaded successfully!',
                        persistentStorage: true,
                        stats: {
                            examples: personalitySystem.data.examplesBank.length,
                            topics: personalitySystem.data.topicGuidelines.length,
                            hints: personalitySystem.data.hintSystem.length,
                            errors: personalitySystem.data.errorPatterns.length,
                            encouragements: personalitySystem.data.encouragementLibrary.length,
                            templates: personalitySystem.data.questionTemplates.length
                        }
                    });
                } else {
                    res.status(500).json({ success: false, error: 'Failed to load personality system' });
                }
            });

            blobStream.end(req.file.buffer);
        } else {
            console.log('⚠️ No Firebase Storage - saving locally (temporary)');

            const uploadDir = path.join(__dirname, '../uploads');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            const localPath = path.join(uploadDir, 'personality-system.xlsx');
            fs.writeFileSync(localPath, req.file.buffer);

            const loaded = personalitySystem.loadFromExcel(localPath);

            if (loaded) {
                res.json({
                    success: true,
                    message: 'Personality system uploaded (temporary - will be lost on restart)',
                    persistentStorage: false,
                    stats: {
                        examples: personalitySystem.data.examplesBank.length,
                        topics: personalitySystem.data.topicGuidelines.length,
                        hints: personalitySystem.data.hintSystem.length,
                        errors: personalitySystem.data.errorPatterns.length,
                        encouragements: personalitySystem.data.encouragementLibrary.length,
                        templates: personalitySystem.data.questionTemplates.length
                    }
                });
            } else {
                res.status(500).json({ success: false, error: 'Failed to load personality system' });
            }
        }
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== ADMIN: GET PERSONALITY STATUS ====================
app.get('/api/admin/personality-status', (req, res) => {
    res.json({
        loaded: personalitySystem.loaded,
        firebaseStorage: bucket ? 'available' : 'unavailable',
        stats: personalitySystem.loaded ? {
            examples: personalitySystem.data.examplesBank.length,
            topics: personalitySystem.data.topicGuidelines.length,
            hints: personalitySystem.data.hintSystem.length,
            errors: personalitySystem.data.errorPatterns.length,
            encouragements: personalitySystem.data.encouragementLibrary.length,
            templates: personalitySystem.data.questionTemplates.length,
            corePersonality: personalitySystem.data.corePersonality
        } : null
    });
});

// ==================== DYNAMIC QUESTION GENERATION ====================
app.post('/api/ai/generate-question', async (req, res) => {
    try {
        const { topic, subtopic, difficulty, studentProfile } = req.body;

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📝 PERSONALITY-BASED QUESTION GENERATION');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('   Student:', studentProfile.name);
        console.log('   Grade:', studentProfile.grade);
        console.log('   Topic:', topic.name);
        console.log('   Subtopic:', subtopic?.name || 'General');
        console.log('   Difficulty:', difficulty);
        console.log('   Personality System:', personalitySystem.loaded ? '✅ Active' : '❌ Not Loaded');

        const systemPrompt = personalitySystem.loaded
            ? personalitySystem.buildSystemPrompt(studentProfile)
            : buildSystemPrompt(studentProfile);

        // 🔥 ALWAYS use strict prompt, then add personality examples after
        let prompt = buildDynamicQuestionPrompt(topic, subtopic, difficulty, studentProfile);

        // Add personality examples if loaded
        if (personalitySystem.loaded) {
            const examples = personalitySystem.getExamplesForTopic(topic.name, difficulty);
            if (examples.length > 0) {
                console.log(`   📚 Adding ${examples.length} example(s) from personality system`);
                prompt += `\n📚 דוגמאות נוספות:\n`;
                examples.slice(0, 2).forEach((ex, i) => {
                    prompt += `דוגמה ${i + 1}: ${ex.question} → ${ex.answer}\n`;
                });
            }
        }

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        if (process.env.ANTHROPIC_API_KEY) {
            console.log('🤖 Using Claude 3.5 Haiku for question generation...');

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
                    temperature: 0.8,
                    system: systemPrompt,
                    messages: [{ role: 'user', content: prompt }]
                })
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('❌ Claude API error:', data.error);
                throw new Error(data.error?.message || 'Claude API error');
            }

            try {
                const rawText = data.content[0].text;
                console.log('📥 Claude raw response (first 300 chars):', rawText.substring(0, 300));

                const jsonText = cleanJsonText(rawText);
                let parsed = JSON.parse(jsonText);

                console.log('✅ JSON parsed successfully');
                console.log('   Question:', parsed.question.substring(0, 80) + '...');
                console.log('   Answer:', parsed.correctAnswer);
                console.log('   visualData BEFORE validation:', parsed.visualData ? 'EXISTS' : 'NULL');

                // 🔥 VALIDATE QUESTION HAS RAW DATA
                const validation = validateQuestionHasRawData(parsed, topic, subtopic);

                if (!validation.valid) {
                    console.log('⚠️ Question validation failed:', validation.reason);
                    console.log('🔥 FORCING QUESTION REWRITE ON SERVER SIDE');

                    // Don't retry with AI - just rewrite it ourselves
                    parsed = forceRewriteGraphDescription(parsed, topic, subtopic);
                    console.log('✅ Question forcibly rewritten with real data');
                }

                // 🔥🔥🔥 CALL EXTRACTION FUNCTION
                console.log('\n🔥🔥🔥 CALLING EXTRACTION FUNCTION');
                console.log('   Question has commas?', /\d+\s*,\s*\d+/.test(parsed.question));
                console.log('   Question has "פיזור"?', parsed.question.includes('פיזור'));

                try {
                    parsed = ensureVisualDataForGraphQuestions(parsed, topic, subtopic);
                    console.log('✅ EXTRACTION FUNCTION COMPLETED');
                } catch (extractError) {
                    console.error('❌❌❌ EXTRACTION CRASHED:', extractError.message);
                    console.error('Stack:', extractError.stack);
                }

                console.log('\n🔍 AFTER EXTRACTION:');
                console.log('   visualData exists?', !!parsed.visualData);
                console.log('   visualData type:', parsed.visualData?.type);
                console.log('   visualData data:', parsed.visualData?.data?.length || parsed.visualData?.points?.length || 0, 'items');

                const responsePayload = {
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
                        visualData: parsed.visualData || null
                    },
                    model: 'claude-3.5-haiku',
                    generatedDynamically: true,
                    personalityActive: personalitySystem.loaded
                };

                console.log('\n🚀 SENDING RESPONSE TO FRONTEND:');
                console.log('   visualData in response:', responsePayload.question.visualData ? '✅ YES' : '❌ NO');
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

                return res.json(responsePayload);
            } catch (parseError) {
                console.error('❌ Parse error:', parseError);
                console.error('Raw response:', data.content[0].text);
                throw parseError;
            }
        }

        throw new Error('No AI API configured');

    } catch (error) {
        console.error('❌ Question generation error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ==================== VERIFY ANSWER ====================
app.post('/api/ai/verify-answer', async (req, res) => {
    try {
        const { question, userAnswer, correctAnswer, studentName, grade, topic, subtopic } = req.body;

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔍 SMART ANSWER VERIFICATION');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('   Student:', studentName);
        console.log('   User Answer:', userAnswer);
        console.log('   Expected:', correctAnswer);

        const prompt = personalitySystem.loaded
            ? personalitySystem.buildVerificationPrompt(question, userAnswer, correctAnswer, topic)
            : buildVerificationPrompt(question, userAnswer, correctAnswer, topic, subtopic, grade);

        if (process.env.ANTHROPIC_API_KEY) {
            const systemPromptText = personalitySystem.loaded
                ? `אתה ${personalitySystem.data.corePersonality.teacher_name}, מורה מתמטיקה מומחה. החזר JSON תקין בלבד.`
                : `אתה נקסון, מורה מתמטיקה מומחה. החזר JSON תקין בלבד.`;

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
                    system: systemPromptText,
                    messages: [{ role: 'user', content: prompt }]
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error?.message || 'Claude API error');
            }

            try {
                const rawText = data.content[0].text;
                const jsonText = cleanJsonText(rawText);
                const parsed = JSON.parse(jsonText);

                let feedback = parsed.feedback;
                if (personalitySystem.loaded) {
                    let situation = parsed.isCorrect ? 'correct_first_try' : 'wrong_answer_first';
                    const personalizedFeedback = personalitySystem.getEncouragement(situation);
                    if (personalizedFeedback) {
                        feedback = personalizedFeedback.replace('תלמיד', studentName);
                    }
                }

                return res.json({
                    success: true,
                    isCorrect: parsed.isCorrect,
                    isPartial: parsed.isPartial || false,
                    confidence: parsed.confidence || 95,
                    feedback: feedback || (parsed.isCorrect ? 'נכון!' : 'לא נכון'),
                    explanation: parsed.explanation || '',
                    model: 'claude-3.5-haiku',
                    personalityActive: personalitySystem.loaded
                });
            } catch (parseError) {
                const rawText = data.content[0].text;
                const seemsCorrect = rawText.includes('נכון') || rawText.includes('correct');

                return res.json({
                    success: true,
                    isCorrect: seemsCorrect,
                    confidence: 60,
                    feedback: seemsCorrect ? 'נכון!' : 'נסה שוב',
                    model: 'claude-3.5-haiku',
                    fallback: true
                });
            }
        }

        throw new Error('No AI API configured');

    } catch (error) {
        console.error('❌ Verification error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ==================== GET HINT ====================
app.post('/api/ai/get-hint', async (req, res) => {
    try {
        const { question, hintIndex, studentProfile } = req.body;

        const hintLevels = ['רמז עדין', 'רמז ישיר', 'רמז ספציפי', 'כמעט הפתרון'];
        const prompt = `תן ${hintLevels[hintIndex]} לשאלה:\n\n${question}\n\nהחזר רק את הרמז בעברית.`;

        const systemPrompt = personalitySystem.loaded
            ? personalitySystem.buildSystemPrompt(studentProfile)
            : buildSystemPrompt(studentProfile || {});

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
                    system: systemPrompt,
                    messages: [{ role: 'user', content: prompt }]
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error?.message || 'Claude API error');
            }

            return res.json({
                success: true,
                hint: data.content[0].text,
                personalityActive: personalitySystem.loaded
            });
        }

        throw new Error('No AI API configured');

    } catch (error) {
        console.error('❌ Hint error:', error);
        res.json({
            success: true,
            hint: 'נסה לפרק את השאלה לשלבים קטנים יותר 🤔'
        });
    }
});

// ==================== AI CHAT ====================
app.post('/api/ai/chat', async (req, res) => {
    try {
        const { message, context } = req.body;

        const systemPrompt = personalitySystem.loaded
            ? `אתה ${personalitySystem.data.corePersonality.teacher_name}, מורה מתמטיקה מומחה.`
            : `אתה נקסון, מורה מתמטיקה מומחה.`;

        const wantsFullSolution = /פתרון|הראה|תן|שלב|צעד|איך|כן|בטח|מלא/i.test(message);

        let conversationPrompt = wantsFullSolution
            ? `התלמיד ${context?.studentName} ביקש פתרון מלא!\n\nהשאלה: ${context?.question}\n\nתן פתרון מפורט עם כל השלבים.`
            : `התלמיד ${context?.studentName} שואל: "${message}"\n\nתן עזרה קצרה (2-3 משפטים).`;

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
                    system: systemPrompt,
                    messages: [{ role: 'user', content: conversationPrompt }]
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error?.message || 'Claude API error');
            }

            return res.json({
                success: true,
                response: data.content[0].text,
                model: 'claude-3.5-haiku',
                personalityActive: personalitySystem.loaded
            });
        }

        throw new Error('No AI API configured');

    } catch (error) {
        console.error('❌ Chat error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ==================== HELPER FUNCTIONS ====================

function buildSystemPrompt(studentProfile) {
    const { grade, mathFeeling } = studentProfile;

    let prompt = `אתה נקסון, מורה דיגיטלי למתמטיקה.\n\n`;

    if (grade) {
        prompt += `התלמיד בכיתה ${grade}.\n`;
    }

    if (mathFeeling === 'struggle') {
        prompt += `התלמיד מתקשה - היה סבלני.\n`;
    } else if (mathFeeling === 'love') {
        prompt += `התלמיד אוהב מתמטיקה - תן אתגרים.\n`;
    }

    return prompt;
}

function buildDynamicQuestionPrompt(topic, subtopic, difficulty, studentProfile) {
    let prompt = `צור שאלה במתמטיקה בעברית.\n\n`;

    prompt += `נושא: ${topic.name}\n`;
    if (subtopic) prompt += `תת-נושא: ${subtopic.name}\n`;
    prompt += `רמת קושי: ${difficulty}\n`;
    prompt += `כיתה: ${studentProfile.grade}\n\n`;

    const graphTopics = ['פונקציות', 'גרפים', 'סטטיסטיקה', 'נתונים', 'פיזור', 'היסטוגרמה'];
    const needsGraph = graphTopics.some(t => topic.name.includes(t) || topic.nameEn?.includes(t));

    if (needsGraph) {
        prompt += `🚨 CRITICAL RULES:\n`;
        prompt += `❌ FORBIDDEN: "גרף מציג", "הנתונים מוצגים", "נתוני הסקר מראים", "דני: 4 שעות"\n`;
        prompt += `✅ REQUIRED FORMAT:\n`;
        prompt += `"שעות ספורט (x): 1, 2, 3, 4, 5, 6, 7, 2, 3, 4, 5, 6, 7, 8, 3, 4, 5, 6, 7, 8\n`;
        prompt += `ציונים (y): 65, 70, 75, 80, 85, 90, 95, 68, 72, 78, 82, 88, 92, 96, 70, 76, 80, 86, 90, 94\n\n`;
        prompt += `מה המתאם?"\n\n`;
        prompt += `Write AT LEAST 20 numbers in EACH list!\n\n`;
    }

    // 🔥 ADD THIS: Tell Claude to avoid newlines in JSON
    prompt += `⚠️ CRITICAL JSON FORMAT RULES:\n`;
    prompt += `- DO NOT use actual newline characters inside JSON string values\n`;
    prompt += `- Use spaces or "\\n" (escaped) instead of actual newlines\n`;
    prompt += `- Keep the entire JSON on as few lines as possible\n`;
    prompt += `- All text inside "question" field should be ONE LINE with spaces\n\n`;

    prompt += `פורמט JSON (בשורה אחת או עם \\n escaped):\n`;
    prompt += `{"question": "השאלה עם נתונים", "correctAnswer": "תשובה", "hints": ["רמז1", "רמז2", "רמז3"], "explanation": "הסבר"}\n`;

    return prompt;
}

function buildVerificationPrompt(question, userAnswer, correctAnswer, topic, subtopic, grade) {
    return `בדוק תשובה:\n\nשאלה: ${question}\nתשובת תלמיד: ${userAnswer}\nתשובה נכונה: ${correctAnswer}\n\nהחזר JSON:\n{\n  "isCorrect": true/false,\n  "confidence": 0-100,\n  "feedback": "משוב",\n  "explanation": "הסבר"\n}`;
}

// ==================== START SERVER ====================

async function loadPersonalityFromStorage() {
    if (!bucket) {
        console.log('⚠️ Firebase Storage not available');
        const localPath = path.join(__dirname, '../uploads/personality-system.xlsx');
        if (fs.existsSync(localPath)) {
            personalitySystem.loadFromExcel(localPath);
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
            console.log('✅ Personality loaded');
        }
    } catch (error) {
        console.error('❌ Error loading:', error.message);
    }
}

app.listen(PORT, async () => {
    await loadPersonalityFromStorage();

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 NEXON AI SERVER - COMPLETE VERSION');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📡 Server: http://localhost:${PORT}`);
    console.log('');
    console.log('✨ Features:');
    console.log('   • 🎭 Personality integration');
    console.log('   • 🔥 Auto graph rewriting');
    console.log('   • 📊 Visual data extraction');
    console.log('   • ✅ Strict validation');
    console.log('   • 🤖 Dynamic questions');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
});