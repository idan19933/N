// src/services/smartAnswerVerification.js - WITH ± HANDLING
class SmartAnswerVerification {
    constructor() {
        this.confidence = 0;
    }

    normalizeAnswer(str) {
        if (!str) return '';

        return str.toString()
            .trim()
            .toLowerCase()
            // Handle plus-minus variations
            .replace(/\+\/-/g, '±')
            .replace(/\+-/g, '±')
            .replace(/-\+/g, '±')
            .replace(/\+\s*-/g, '±')
            .replace(/-\s*\+/g, '±')
            .replace(/plus-minus/g, '±')
            .replace(/plus\/minus/g, '±')
            // Remove all spaces
            .replace(/\s+/g, '')
            // Normalize x variable
            .replace(/x\s*=/g, 'x=')
            // Remove extra equals
            .replace(/=+/g, '=')
            // Handle fractions
            .replace(/(\d+)\/(\d+)/g, (match, num, den) => {
                const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
                const divisor = gcd(parseInt(num), parseInt(den));
                return `${parseInt(num) / divisor}/${parseInt(den) / divisor}`;
            });
    }

    extractNumbers(str) {
        const normalized = this.normalizeAnswer(str);
        const matches = normalized.match(/-?\d+\.?\d*/g);
        return matches ? matches.map(n => parseFloat(n)).sort((a, b) => a - b) : [];
    }

    verifyAnswer(userAnswer, correctAnswer) {
        if (!userAnswer || !correctAnswer) {
            return {
                isCorrect: false,
                confidence: 0,
                method: 'empty-input',
                feedback: 'נא להזין תשובה'
            };
        }

        const user = this.normalizeAnswer(userAnswer);
        const correct = this.normalizeAnswer(correctAnswer);

        // Direct match
        if (user === correct) {
            this.confidence = 100;
            return {
                isCorrect: true,
                confidence: 100,
                method: 'exact-match',
                feedback: 'תשובה מדויקת!'
            };
        }

        // Handle ± solutions (quadratic equations)
        const plusMinusPatterns = [
            // x=±4 variations
            /x=±(\d+\.?\d*)/,
            /±(\d+\.?\d*)/,
            // x=4 or x=-4
            /x=(-?\d+\.?\d*)orx=(-?\d+\.?\d*)/,
            /x=(-?\d+\.?\d*),x=(-?\d+\.?\d*)/
        ];

        for (const pattern of plusMinusPatterns) {
            const userMatch = user.match(pattern);
            const correctMatch = correct.match(pattern);

            if (userMatch && correctMatch) {
                if (userMatch[1] === correctMatch[1]) {
                    this.confidence = 95;
                    return {
                        isCorrect: true,
                        confidence: 95,
                        method: 'plus-minus-match',
                        feedback: 'נכון! זיהיתי פתרון עם ±'
                    };
                }
            }
        }

        // Numeric comparison
        const userNums = this.extractNumbers(user);
        const correctNums = this.extractNumbers(correct);

        if (userNums.length > 0 && correctNums.length > 0) {
            const arraysEqual = userNums.length === correctNums.length &&
                userNums.every((val, idx) => Math.abs(val - correctNums[idx]) < 0.01);

            if (arraysEqual) {
                this.confidence = 85;
                return {
                    isCorrect: true,
                    confidence: 85,
                    method: 'numeric-match',
                    feedback: 'נכון מספרית!'
                };
            }

            // Partial match
            const commonNumbers = userNums.filter(n =>
                correctNums.some(cn => Math.abs(n - cn) < 0.01)
            );

            if (commonNumbers.length > 0 && commonNumbers.length < correctNums.length) {
                this.confidence = 50;
                return {
                    isCorrect: false,
                    isPartial: true,
                    confidence: 50,
                    method: 'partial-numeric',
                    feedback: `מצאת ${commonNumbers.length} מתוך ${correctNums.length} פתרונות`
                };
            }
        }

        // Not correct
        this.confidence = 20;
        return {
            isCorrect: false,
            confidence: 20,
            method: 'no-match',
            feedback: 'התשובה שונה מהתשובה הנכונה'
        };
    }
}

// Create and export instance
const smartVerification = new SmartAnswerVerification();

export { smartVerification };
export default smartVerification;