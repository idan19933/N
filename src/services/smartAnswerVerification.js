// src/services/smartAnswerVerification.js - FALLBACK SYSTEM
class SmartAnswerVerification {

    verifyAnswer(userAnswer, correctAnswer, options = {}) {
        try {
            console.log('🔍 Verifying:', { userAnswer, correctAnswer });

            const normalizedUser = this.normalize(userAnswer);
            const normalizedCorrect = this.normalize(correctAnswer);

            if (normalizedUser === normalizedCorrect) {
                return {
                    isCorrect: true,
                    confidence: 100,
                    explanation: 'התשובה נכונה!',
                    note: null
                };
            }

            const numericResult = this.verifyNumeric(normalizedUser, normalizedCorrect);
            if (numericResult) return numericResult;

            const pointResult = this.verifyPoint(userAnswer, correctAnswer);
            if (pointResult) return pointResult;

            const equationResult = this.verifyEquation(normalizedUser, normalizedCorrect);
            if (equationResult) return equationResult;

            const fractionResult = this.verifyFraction(normalizedUser, normalizedCorrect);
            if (fractionResult) return fractionResult;

            const algebraResult = this.verifyAlgebra(normalizedUser, normalizedCorrect);
            if (algebraResult) return algebraResult;

            if (normalizedCorrect.includes(normalizedUser)) {
                return {
                    isCorrect: true,
                    confidence: 95,
                    explanation: 'התשובה נכונה!',
                    note: 'התשובה שלך נכונה, אפשר גם לכתוב אותה בפירוט יותר'
                };
            }

            if (normalizedUser.includes(normalizedCorrect)) {
                return {
                    isCorrect: true,
                    confidence: 90,
                    explanation: 'התשובה נכונה!',
                    note: 'ניתן לכתוב בצורה קצרה יותר: ' + correctAnswer
                };
            }

            const similarity = this.calculateSimilarity(normalizedUser, normalizedCorrect);
            if (similarity > 0.85) {
                return {
                    isCorrect: true,
                    confidence: Math.round(similarity * 100),
                    explanation: 'התשובה נכונה (עם הבדל קטן בניסוח)',
                    note: 'ניסוח מדויק: ' + correctAnswer
                };
            }

            return {
                isCorrect: false,
                confidence: Math.round(similarity * 100),
                explanation: 'התשובה לא נכונה',
                note: similarity > 0.5 ? 'קרוב, אבל לא מדויק' : null
            };

        } catch (error) {
            console.error('❌ Verification error:', error);
            return {
                isCorrect: false,
                confidence: 0,
                explanation: 'לא הצלחתי לבדוק את התשובה',
                note: null
            };
        }
    }

    normalize(text) {
        if (!text) return '';

        return String(text)
            .trim()
            .toLowerCase()
            .replace(/\s+/g, '')
            .replace(/[,;:.!?]/g, '')
            .replace(/[״"'`]/g, '')
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/−/g, '-')
            .replace(/\u200f/g, '');
    }

    verifyNumeric(user, correct) {
        const userNum = this.extractNumber(user);
        const correctNum = this.extractNumber(correct);

        if (userNum === null || correctNum === null) return null;

        const diff = Math.abs(userNum - correctNum);
        const tolerance = Math.abs(correctNum * 0.001);

        if (diff <= tolerance) {
            return {
                isCorrect: true,
                confidence: 100,
                explanation: 'התשובה נכונה!',
                note: null
            };
        }

        if (diff <= Math.abs(correctNum * 0.05)) {
            return {
                isCorrect: false,
                confidence: 80,
                explanation: 'קרוב מאוד, אבל לא מדויק',
                note: `התשובה הנכונה: ${correctNum}`
            };
        }

        return null;
    }

    extractNumber(text) {
        const match = text.match(/-?\d+\.?\d*/);
        if (match) {
            return parseFloat(match[0]);
        }

        try {
            const cleaned = text.replace(/[^0-9+\-*/.()√]/g, '');
            const withSqrt = cleaned.replace(/√(\d+)/g, 'Math.sqrt($1)');
            const result = Function('"use strict"; return (' + withSqrt + ')')();

            if (!isNaN(result) && isFinite(result)) {
                return result;
            }
        } catch (e) {
            // Silently fail
        }

        return null;
    }

    verifyPoint(user, correct) {
        const userPoint = this.extractPoint(user);
        const correctPoint = this.extractPoint(correct);

        if (!userPoint || !correctPoint) return null;

        if (userPoint.x === correctPoint.x && userPoint.y === correctPoint.y) {
            return {
                isCorrect: true,
                confidence: 100,
                explanation: 'התשובה נכונה!',
                note: null
            };
        }

        return null;
    }

    extractPoint(text) {
        const patterns = [
            /\(?\s*(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)\s*\)?/,
            /x\s*=\s*(-?\d+\.?\d*).*?y\s*=\s*(-?\d+\.?\d*)/i,
            /\(\s*(-?\d+\.?\d*)\s*;\s*(-?\d+\.?\d*)\s*\)/
        ];

        for (const pattern of patterns) {
            const match = text.match(pattern);
            if (match) {
                return {
                    x: parseFloat(match[1]),
                    y: parseFloat(match[2])
                };
            }
        }

        return null;
    }

    verifyEquation(user, correct) {
        const cleanUser = user.replace(/\s/g, '');
        const cleanCorrect = correct.replace(/\s/g, '');

        const userMatch = cleanUser.match(/x=(-?\d+\.?\d*)/);
        const correctMatch = cleanCorrect.match(/x=(-?\d+\.?\d*)/);

        if (userMatch && correctMatch) {
            const userVal = parseFloat(userMatch[1]);
            const correctVal = parseFloat(correctMatch[1]);

            if (Math.abs(userVal - correctVal) < 0.001) {
                return {
                    isCorrect: true,
                    confidence: 100,
                    explanation: 'התשובה נכונה!',
                    note: null
                };
            }
        }

        return null;
    }

    verifyFraction(user, correct) {
        const userFrac = this.parseFraction(user);
        const correctFrac = this.parseFraction(correct);

        if (!userFrac || !correctFrac) return null;

        const userVal = userFrac.num / userFrac.den;
        const correctVal = correctFrac.num / correctFrac.den;

        if (Math.abs(userVal - correctVal) < 0.001) {
            return {
                isCorrect: true,
                confidence: 100,
                explanation: 'התשובה נכונה!',
                note: userFrac.num !== correctFrac.num ?
                    `אפשר גם לפשט ל-${correctFrac.num}/${correctFrac.den}` : null
            };
        }

        return null;
    }

    parseFraction(text) {
        const match = text.match(/(-?\d+)\/(-?\d+)/);
        if (match) {
            return {
                num: parseInt(match[1]),
                den: parseInt(match[2])
            };
        }
        return null;
    }

    verifyAlgebra(user, correct) {
        const cleanUser = user.replace(/\s/g, '');
        const cleanCorrect = correct.replace(/\s/g, '');

        if (cleanUser === cleanCorrect) {
            return {
                isCorrect: true,
                confidence: 100,
                explanation: 'התשובה נכונה!',
                note: null
            };
        }

        const userTerms = this.extractTerms(cleanUser);
        const correctTerms = this.extractTerms(cleanCorrect);

        if (this.areEquivalentTerms(userTerms, correctTerms)) {
            return {
                isCorrect: true,
                confidence: 95,
                explanation: 'התשובה נכונה!',
                note: 'ניתן לכתוב גם: ' + correct
            };
        }

        return null;
    }

    extractTerms(expr) {
        return expr.split(/([+-])/).filter(t => t.trim());
    }

    areEquivalentTerms(terms1, terms2) {
        if (terms1.length !== terms2.length) return false;

        const sorted1 = [...terms1].sort().join('');
        const sorted2 = [...terms2].sort().join('');

        return sorted1 === sorted2;
    }

    calculateSimilarity(str1, str2) {
        const len1 = str1.length;
        const len2 = str2.length;

        if (len1 === 0) return len2 === 0 ? 1 : 0;
        if (len2 === 0) return 0;

        const matrix = [];

        for (let i = 0; i <= len2; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= len1; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= len2; i++) {
            for (let j = 1; j <= len1; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        const distance = matrix[len2][len1];
        const maxLen = Math.max(len1, len2);

        return 1 - (distance / maxLen);
    }
}

export const smartVerification = new SmartAnswerVerification();
export default smartVerification;