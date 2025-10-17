// src/services/questionGeneratorService.js
/**
 * ✅ מחולל שאלות אוטומטי - עם תיקון למשוואות
 */

class QuestionGeneratorService {

    getRandomRoundNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    generateAddition(template, range) {
        const a = this.getRandomRoundNumber(1, template.maxNumber || range[1]);
        const b = this.getRandomRoundNumber(1, template.maxNumber || range[1]);
        const answer = a + b;

        return {
            question: `${a} + ${b} = ?`,
            answer: answer.toString(),
            steps: [`${a} + ${b}`, `= ${answer}`],
            type: 'addition',
            hints: [`חבר את ${a} ו-${b}`]
        };
    }

    generateSubtraction(template, range) {
        const a = this.getRandomRoundNumber(5, template.maxNumber || range[1]);
        const b = this.getRandomRoundNumber(1, a);
        const answer = a - b;

        return {
            question: `${a} - ${b} = ?`,
            answer: answer.toString(),
            steps: [`${a} - ${b}`, `= ${answer}`],
            type: 'subtraction',
            hints: [`חסר ${b} מ-${a}`]
        };
    }

    generateMultiplication(template, range) {
        const a = this.getRandomRoundNumber(1, template.maxNumber || 10);
        const b = this.getRandomRoundNumber(1, template.maxNumber || 10);
        const answer = a * b;

        return {
            question: `${a} × ${b} = ?`,
            answer: answer.toString(),
            steps: [`${a} × ${b}`, `= ${answer}`],
            type: 'multiplication',
            hints: [`${a} פעמים ${b}`, `או: ${b} + ${b} + ... (${a} פעמים)`]
        };
    }

    generateDivision(template, range) {
        const b = this.getRandomRoundNumber(2, template.maxDivisor || 10);
        const quotient = this.getRandomRoundNumber(1, 10);
        const a = b * quotient;

        return {
            question: `${a} ÷ ${b} = ?`,
            answer: quotient.toString(),
            steps: [`${a} ÷ ${b}`, `= ${quotient}`],
            type: 'division',
            hints: [`כמה פעמים ${b} נכנס ב-${a}?`]
        };
    }

    /**
     * ✅ משוואה פשוטה - תיקון לוודא תשובות שלמות
     */
    generateSimpleEquation(template, range) {
        // בחר x שלם ראשון
        const x = this.getRandomRoundNumber(1, 10);

        // בחר מקדם שמתחלק יפה
        const a = this.getRandomRoundNumber(2, template.maxCoef || 10);

        // בחר b שלם
        const b = this.getRandomRoundNumber(1, 20);

        // חשב c כך שהתשובה תהיה x בדיוק
        const c = a * x + b;

        return {
            question: `${a}x + ${b} = ${c}`,
            answer: x.toString(),
            steps: [
                `${a}x + ${b} = ${c}`,
                `${a}x = ${c} - ${b}`,
                `${a}x = ${c - b}`,
                `x = ${x}`
            ],
            type: 'equation',
            hints: [
                `העבר את ${b} לצד שני (חיסור ${b} משני הצדדים)`,
                `חלק את שני הצדדים ב-${a}`
            ]
        };
    }

    generatePercentage(template, range) {
        const percent = this.getRandomRoundNumber(10, 50) * 2;
        const base = this.getRandomRoundNumber(10, 100);
        const answer = Math.round((percent / 100) * base);

        return {
            question: `${percent}% מ-${base} = ?`,
            answer: answer.toString(),
            steps: [
                `${percent}% מ-${base}`,
                `= (${percent} ÷ 100) × ${base}`,
                `= ${answer}`
            ],
            type: 'percentage',
            hints: [`חלק את ${percent} ב-100 וכפול ב-${base}`]
        };
    }

    generateSimpleFraction(template, range) {
        const denominators = template.denominators || [2, 4, 5, 10];
        const denominator = denominators[Math.floor(Math.random() * denominators.length)];
        const numerator = this.getRandomRoundNumber(1, denominator - 1);
        const adjustedWhole = denominator * this.getRandomRoundNumber(2, 10);
        const answer = (adjustedWhole / denominator) * numerator;

        return {
            question: `${numerator}/${denominator} מ-${adjustedWhole} = ?`,
            answer: answer.toString(),
            steps: [
                `${numerator}/${denominator} מ-${adjustedWhole}`,
                `= ${adjustedWhole} ÷ ${denominator} = ${adjustedWhole / denominator}`,
                `= ${adjustedWhole / denominator} × ${numerator}`,
                `= ${answer}`
            ],
            type: 'fraction',
            hints: [`חלק ${adjustedWhole} ב-${denominator}`, `אחר כך כפול ב-${numerator}`]
        };
    }

    generateRectangleArea(template, range) {
        const a = this.getRandomRoundNumber(2, template.maxNumber || 20);
        const b = this.getRandomRoundNumber(2, template.maxNumber || 20);
        const answer = a * b;

        return {
            question: `מלבן באורך ${a} ס"מ ורוחב ${b} ס"מ. מה השטח?`,
            answer: answer.toString(),
            steps: [`שטח = אורך × רוחב`, `= ${a} × ${b}`, `= ${answer} ס"מ²`],
            type: 'geometry_area',
            hints: [`שטח = אורך × רוחב`],
            unit: 'ס"מ רבועים'
        };
    }

    generateQuestion(topic, template, gradeRange) {
        const generators = {
            addition: () => this.generateAddition(template, gradeRange),
            subtraction: () => this.generateSubtraction(template, gradeRange),
            multiplication: () => this.generateMultiplication(template, gradeRange),
            multiplication_intro: () => this.generateMultiplication(template, gradeRange),
            division: () => this.generateDivision(template, gradeRange),
            equations: () => this.generateSimpleEquation(template, gradeRange),
            percentages: () => this.generatePercentage(template, gradeRange),
            fractions: () => this.generateSimpleFraction(template, gradeRange),
            fractions_advanced: () => this.generateSimpleFraction(template, gradeRange),
            large_numbers: () => this.generateAddition(template, gradeRange),
            geometry: () => this.generateRectangleArea(template, gradeRange)
        };

        const generator = generators[topic.id] || generators.addition;
        const question = generator();

        return {
            ...question,
            topic: topic.name,
            topicId: topic.id,
            gradeLevel: gradeRange,
            timestamp: new Date().toISOString()
        };
    }
}

export const questionGenerator = new QuestionGeneratorService();
export default questionGenerator;