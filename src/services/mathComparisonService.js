// src/services/mathComparisonService.js - WITH MIXED FRACTION SUPPORT
class MathComparisonService {

    normalize(expr) {
        if (!expr) return '';

        return String(expr)
            .toLowerCase()
            .replace(/\s+/g, '')
            .replace(/\+c$/i, '')
            .replace(/\*/g, '')
            .replace(/×/g, '')
            .replace(/÷/g, '/')
            .replace(/\^/g, '**')
            .replace(/\[/g, '(')
            .replace(/\]/g, ')');
    }

    // ✅ NEW: Parse mixed fractions like "4 2/3" = 4.666...
    parseMixedFraction(expr) {
        const cleaned = expr.trim();

        // Match mixed fraction: "4 2/3" or "4  2/3"
        const mixedMatch = cleaned.match(/^(-?\d+)\s+(\d+)\/(\d+)$/);
        if (mixedMatch) {
            const whole = parseFloat(mixedMatch[1]);
            const numerator = parseFloat(mixedMatch[2]);
            const denominator = parseFloat(mixedMatch[3]);
            const fractionValue = numerator / denominator;
            const totalValue = whole >= 0 ? whole + fractionValue : whole - fractionValue;

            return {
                type: 'mixed_fraction',
                whole,
                numerator,
                denominator,
                value: totalValue
            };
        }

        // Match simple fraction: "4/7"
        const fracMatch = cleaned.match(/^(-?\d+\.?\d*)\/(-?\d+\.?\d*)$/);
        if (fracMatch) {
            const numerator = parseFloat(fracMatch[1]);
            const denominator = parseFloat(fracMatch[2]);
            return {
                type: 'fraction',
                numerator,
                denominator,
                value: numerator / denominator
            };
        }

        // Match decimal: "4.67" or "0.57"
        const decMatch = cleaned.match(/^-?\d+\.?\d*$/);
        if (decMatch) {
            return {
                type: 'number',
                value: parseFloat(cleaned)
            };
        }

        return null;
    }

    // ✅ ENHANCED: Parse equation/solution/fraction formats
    parseEquation(expr) {
        try {
            const cleaned = String(expr).trim();

            // Match equation format with variable: "7x = 4"
            const eqMatch = cleaned.match(/^(\d*\.?\d*)([a-z])\s*=\s*(.+)$/);
            if (eqMatch) {
                const coefficient = parseFloat(eqMatch[1] || '1');
                const variable = eqMatch[2];
                const rightSide = eqMatch[3].trim();

                // Parse the right side (could be fraction or number)
                const rightParsed = this.parseMixedFraction(rightSide);
                const value = rightParsed ? rightParsed.value : parseFloat(rightSide);

                return {
                    type: 'equation',
                    coefficient,
                    variable,
                    value,
                    solution: value / coefficient
                };
            }

            // Match solution format: "x = 4/7" or "x = 4 2/3" or "x = 0.57"
            const solMatch = cleaned.match(/^([a-z])\s*=\s*(.+)$/);
            if (solMatch) {
                const variable = solMatch[1];
                const valueExpr = solMatch[2].trim();

                // Try to parse as mixed fraction or fraction
                const parsed = this.parseMixedFraction(valueExpr);
                if (parsed) {
                    return {
                        type: 'solution',
                        variable,
                        value: parsed.value,
                        originalFormat: parsed.type
                    };
                }

                // Regular number
                return {
                    type: 'solution',
                    variable,
                    value: parseFloat(valueExpr)
                };
            }

            // No variable, just try to parse as fraction/number
            const parsed = this.parseMixedFraction(cleaned);
            if (parsed) {
                return parsed;
            }

            return { type: 'unknown', raw: cleaned };
        } catch (e) {
            console.error('Parse error:', e);
            return { type: 'error', raw: expr };
        }
    }

    // ✅ Compare two values with tolerance
    valuesMatch(val1, val2, tolerance = 0.01) {
        if (val1 === null || val2 === null || isNaN(val1) || isNaN(val2)) {
            return false;
        }
        return Math.abs(val1 - val2) < tolerance;
    }

    extractAllFactors(expr) {
        const norm = this.normalize(expr);
        const factors = [];

        const leadingMatch = norm.match(/^(\d+)\(/);
        if (leadingMatch) {
            factors.push(leadingMatch[1]);
        }

        const parenMatches = norm.match(/\([^)]+\)/g);
        if (parenMatches) {
            factors.push(...parenMatches);
        }

        return factors.sort();
    }

    compareFactored(answer1, answer2) {
        const norm1 = this.normalize(answer1);
        const norm2 = this.normalize(answer2);

        if (norm1 === norm2) return true;

        const factors1 = this.extractAllFactors(norm1);
        const factors2 = this.extractAllFactors(norm2);

        if (factors1.length !== factors2.length) return false;

        for (let factor of factors1) {
            if (!factors2.includes(factor)) return false;
        }

        return true;
    }

    countFactors(expr) {
        const factors = this.extractAllFactors(expr);
        return factors.filter(f => f.includes('(')).length;
    }

    fractionToDecimal(str) {
        return str.replace(/(\d+)\/(\d+)/g, (match, num, den) => {
            return (parseInt(num) / parseInt(den)).toString();
        });
    }

    extractComponents(expr) {
        const norm = this.normalize(expr);
        const patterns = [
            /(\d*\.?\d*)x\*\*(\d+)/,
            /(\d*\.?\d*)x(\d+)/,
            /(\d*\.?\d*)x/,
            /(\d+\.?\d*)/
        ];

        for (const pattern of patterns) {
            const match = norm.match(pattern);
            if (match) {
                const coef = match[1] ? parseFloat(match[1]) : 1;
                const power = match[2] ? parseInt(match[2]) : (norm.includes('x') ? 1 : 0);
                return { coefficient: coef, power };
            }
        }
        return { coefficient: 0, power: 0 };
    }

    polynomialSimilarity(answer1, answer2) {
        const norm1 = this.normalize(answer1);
        const norm2 = this.normalize(answer2);
        const dec1 = this.fractionToDecimal(norm1);
        const dec2 = this.fractionToDecimal(norm2);

        if (dec1 === dec2) return 100;

        const comp1 = this.extractComponents(dec1);
        const comp2 = this.extractComponents(dec2);

        let score = 0;

        if (comp1.power === comp2.power) {
            score += 50;
        } else if (Math.abs(comp1.power - comp2.power) === 1) {
            score += 20;
        }

        if (comp1.coefficient && comp2.coefficient) {
            const coeffDiff = Math.abs(comp1.coefficient - comp2.coefficient);
            const avgCoeff = (comp1.coefficient + comp2.coefficient) / 2;
            const coeffSimilarity = Math.max(0, 1 - (coeffDiff / avgCoeff));
            score += coeffSimilarity * 30;
        }

        let charMatches = 0;
        const minLen = Math.min(dec1.length, dec2.length);
        for (let i = 0; i < minLen; i++) {
            if (dec1[i] === dec2[i]) charMatches++;
        }
        score += (charMatches / Math.max(dec1.length, dec2.length)) * 20;

        return Math.round(Math.min(score, 100));
    }

    // ✅ ENHANCED: Compare with full fraction/mixed fraction support
    compare(answer1, answer2, operation = null) {
        if (!answer1 || !answer2) return false;

        if (operation === 'factor') {
            return this.compareFactored(answer1, answer2);
        }

        // Parse both expressions
        const parsed1 = this.parseEquation(answer1);
        const parsed2 = this.parseEquation(answer2);

        console.log('🔍 Comparing:', {
            answer1,
            answer2,
            parsed1,
            parsed2,
            val1: parsed1?.value,
            val2: parsed2?.value
        });

        // Get the numeric values
        const getValue = (parsed) => {
            if (!parsed) return null;
            if (parsed.value !== undefined) return parsed.value;
            return null;
        };

        const val1 = getValue(parsed1);
        const val2 = getValue(parsed2);

        // Both have values - compare numerically
        if (val1 !== null && val2 !== null) {
            // Check if both have variables
            if (parsed1.variable && parsed2.variable) {
                if (parsed1.variable !== parsed2.variable) return false;
            }

            const match = this.valuesMatch(val1, val2);
            console.log('  Numeric comparison:', match, val1, 'vs', val2);
            return match;
        }

        // Fallback to string comparison
        const norm1 = this.normalize(answer1);
        const norm2 = this.normalize(answer2);

        if (norm1 === norm2) return true;

        const dec1 = this.fractionToDecimal(norm1);
        const dec2 = this.fractionToDecimal(norm2);

        if (dec1 === dec2) return true;

        if (dec1.includes('x') && dec2.includes('x')) {
            return this.polynomialSimilarity(dec1, dec2) >= 95;
        }

        try {
            const num1 = parseFloat(dec1.replace(/[^0-9.-]/g, ''));
            const num2 = parseFloat(dec2.replace(/[^0-9.-]/g, ''));
            if (!isNaN(num1) && !isNaN(num2)) {
                return this.valuesMatch(num1, num2);
            }
        } catch {}

        return false;
    }

    compareIntegrals(answer1, answer2) {
        const clean1 = String(answer1).replace(/\+\s*c$/i, '').trim();
        const clean2 = String(answer2).replace(/\+\s*c$/i, '').trim();
        return this.compare(clean1, clean2);
    }

    similarity(answer1, answer2, operation = null) {
        if (!answer1 || !answer2) return 0;

        if (operation === 'factor') {
            if (this.compareFactored(answer1, answer2)) return 100;

            const factors1 = this.extractAllFactors(answer1);
            const factors2 = this.extractAllFactors(answer2);

            const parenCount1 = factors1.filter(f => f.includes('(')).length;
            const parenCount2 = factors2.filter(f => f.includes('(')).length;

            if (parenCount1 === 0) return 0;
            if (parenCount1 < parenCount2) {
                return Math.round((parenCount1 / parenCount2) * 70);
            }
            return 30;
        }

        if (this.compare(answer1, answer2, operation)) return 100;

        const norm1 = this.normalize(answer1);
        const norm2 = this.normalize(answer2);

        if (norm1.includes('x') || norm2.includes('x')) {
            return this.polynomialSimilarity(answer1, answer2);
        }

        let matches = 0;
        const maxLen = Math.max(norm1.length, norm2.length);
        const minLen = Math.min(norm1.length, norm2.length);

        for (let i = 0; i < minLen; i++) {
            if (norm1[i] === norm2[i]) matches++;
        }

        return Math.round((matches / maxLen) * 100);
    }

    // ✅ ENHANCED: Progress analysis with fraction support
    analyzeProgress(userAnswer, correctAnswer, operation = null) {
        if (!userAnswer || !userAnswer.trim()) {
            return {
                similarity: 0,
                status: 'empty',
                message: '',
                hasVariable: false,
                components: []
            };
        }

        const user = this.parseEquation(userAnswer);
        const correct = this.parseEquation(correctAnswer);

        console.log('📊 Analyzing:', {
            userAnswer,
            correctAnswer,
            user,
            correct,
            userValue: user?.value,
            correctValue: correct?.value
        });

        // ✅ CASE 1: Exact match
        if (this.compare(userAnswer, correctAnswer, operation)) {
            console.log('  ✅ CORRECT!');
            return {
                similarity: 100,
                status: 'correct',
                message: 'מושלם!',
                hasVariable: true,
                components: ['complete']
            };
        }

        // ✅ CASE 2: Intermediate step (7x = 4 → x = 4/7)
        if (user.type === 'equation' && user.solution) {
            const correctValue = correct?.value;
            if (correctValue && this.valuesMatch(user.solution, correctValue)) {
                console.log('  ✅ Valid intermediate step');
                return {
                    similarity: 85,
                    status: 'intermediate',
                    message: 'צעד נכון!',
                    hasVariable: true,
                    components: ['equation', 'variable']
                };
            }
        }

        // ✅ CASE 3: Has correct variable but check value
        if (user.variable && correct.variable && user.variable === correct.variable) {
            const userValue = user.value;
            const correctValue = correct.value;

            if (userValue !== null && correctValue !== null) {
                const percentError = Math.abs((userValue - correctValue) / correctValue * 100);

                if (percentError < 5) {
                    return {
                        similarity: 70,
                        status: 'almost',
                        message: 'קרוב מאוד!',
                        hasVariable: true,
                        components: ['variable']
                    };
                } else if (percentError < 20) {
                    return {
                        similarity: 50,
                        status: 'progress',
                        message: 'בכיוון הנכון',
                        hasVariable: true,
                        components: ['variable']
                    };
                }
            }

            return {
                similarity: 40,
                status: 'progress',
                message: 'בכיוון הנכון',
                hasVariable: true,
                components: ['variable']
            };
        }

        // ✅ CASE 4: Correct value but missing variable
        const userValue = user?.value;
        const correctValue = correct?.value;

        if (userValue !== null && correctValue !== null && this.valuesMatch(userValue, correctValue)) {
            // If correct answer needs variable
            if (correct.type === 'solution' && correct.variable) {
                return {
                    similarity: 90,
                    status: 'almost',
                    message: 'נכון! הוסף משתנה',
                    hasVariable: false,
                    components: ['value']
                };
            }
            // Otherwise it's correct
            return {
                similarity: 100,
                status: 'correct',
                message: 'מושלם!',
                hasVariable: false,
                components: ['complete']
            };
        }

        // Factoring
        if (operation === 'factor') {
            const hasParens = this.normalize(userAnswer).includes('(');
            const factors1 = this.extractAllFactors(userAnswer);
            const factors2 = this.extractAllFactors(correctAnswer);

            const factorCount1 = factors1.filter(f => f.includes('(')).length;
            const factorCount2 = factors2.filter(f => f.includes('(')).length;

            const norm1 = this.normalize(userAnswer);
            const hasLeadingCoef1 = /^\d+\(/.test(norm1);
            const hasLeadingCoef2 = /^\d+\(/.test(this.normalize(correctAnswer));

            const similarity = this.similarity(userAnswer, correctAnswer, operation);

            return {
                similarity,
                status: similarity >= 70 ? 'progress' : 'typing',
                message: similarity >= 70 ? 'בכיוון הנכון' : 'המשך לנסות',
                hasFactors: hasParens,
                factorCount: factorCount1,
                expectedFactors: factorCount2,
                hasLeadingCoefficient: hasLeadingCoef1,
                needsLeadingCoefficient: hasLeadingCoef2,
                components: []
            };
        }

        // Default
        const similarity = this.similarity(userAnswer, correctAnswer, operation);

        return {
            similarity: Math.max(similarity, 20),
            status: 'typing',
            message: 'המשך לנסות',
            hasVariable: user?.variable ? true : false,
            hasPower: false,
            components: []
        };
    }
}

export const mathComparison = new MathComparisonService();
export default MathComparisonService;