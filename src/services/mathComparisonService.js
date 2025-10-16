// src/services/mathComparisonService.js
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

    extractAllFactors(expr) {
        const norm = this.normalize(expr);
        const factors = [];

        // Leading coefficient: 2(x+3)
        const leadingMatch = norm.match(/^(\d+)\(/);
        if (leadingMatch) {
            factors.push(leadingMatch[1]);
        }

        // All parentheses
        const parenMatches = norm.match(/\([^)]+\)/g);
        if (parenMatches) {
            factors.push(...parenMatches);
        }

        return factors.sort();
    }

    compareFactored(answer1, answer2) {
        const norm1 = this.normalize(answer1);
        const norm2 = this.normalize(answer2);

        console.log('🔍 Factoring comparison:', { norm1, norm2 });

        if (norm1 === norm2) {
            console.log('✅ Exact match!');
            return true;
        }

        const factors1 = this.extractAllFactors(norm1);
        const factors2 = this.extractAllFactors(norm2);

        console.log('📊 Factors:', { factors1, factors2 });

        if (factors1.length !== factors2.length) {
            console.log('❌ Different factor count');
            return false;
        }

        for (let factor of factors1) {
            if (!factors2.includes(factor)) {
                console.log('❌ Missing factor:', factor);
                return false;
            }
        }

        console.log('✅ All factors match!');
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

    compare(answer1, answer2, operation = null) {
        if (!answer1 || !answer2) return false;

        if (operation === 'factor') {
            return this.compareFactored(answer1, answer2);
        }

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
                return Math.abs(num1 - num2) < 0.01;
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

    analyzeProgress(userAnswer, correctAnswer, operation = null) {
        const similarity = this.similarity(userAnswer, correctAnswer, operation);
        const norm1 = this.normalize(userAnswer);
        const norm2 = this.normalize(correctAnswer);

        const hasX = norm1.includes('x');
        const hasCorrectX = norm2.includes('x') && hasX;
        const hasPower = /\*\*\d+/.test(norm1);
        const hasCorrectPower = /\*\*\d+/.test(norm2) && hasPower;

        let feedback = {
            similarity,
            hasVariable: hasX,
            hasPower: hasPower,
            components: []
        };

        if (hasCorrectX) feedback.components.push('variable');
        if (hasCorrectPower) {
            const userComp = this.extractComponents(norm1);
            const correctComp = this.extractComponents(norm2);
            if (userComp.power === correctComp.power) {
                feedback.components.push('power');
            }
        }

        if (operation === 'factor') {
            const hasParens = norm1.includes('(');
            const factors1 = this.extractAllFactors(norm1);
            const factors2 = this.extractAllFactors(norm2);

            const factorCount1 = factors1.filter(f => f.includes('(')).length;
            const factorCount2 = factors2.filter(f => f.includes('(')).length;

            feedback.hasFactors = hasParens;
            feedback.factorCount = factorCount1;
            feedback.expectedFactors = factorCount2;

            const hasLeadingCoef1 = /^\d+\(/.test(norm1);
            const hasLeadingCoef2 = /^\d+\(/.test(norm2);
            feedback.hasLeadingCoefficient = hasLeadingCoef1;
            feedback.needsLeadingCoefficient = hasLeadingCoef2;
        }

        return feedback;
    }
}

export const mathComparison = new MathComparisonService();
export default MathComparisonService;