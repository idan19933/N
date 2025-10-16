// src/services/dynamicProblemGenerator.js - ENHANCED WITH PROGRESSIVE DIFFICULTY

class DynamicProblemGenerator {
    constructor() {
        this.newtonAPI = 'https://newton.now.sh/api/v2';
    }

    // Generate problem based on tier (1-7, progressively harder)
    async generateProblem(operation, tier = 1, topic = null) {
        try {
            let expression;

            switch(operation) {
                case 'simplify':
                    expression = this.generateAlgebraExpression(tier);
                    break;
                case 'factor':
                    expression = this.generateFactoringExpression(tier);
                    break;
                case 'derive':
                    expression = this.generateDerivativeExpression(tier);
                    break;
                case 'integrate':
                    expression = this.generateIntegralExpression(tier);
                    break;
                case 'solve':
                    expression = this.generateEquation(tier);
                    break;
                default:
                    expression = this.generateAlgebraExpression(tier);
            }

            console.log(`📝 Generated ${operation} (Tier ${tier}):`, expression);

            const response = await fetch(`${this.newtonAPI}/${operation}/${encodeURIComponent(expression)}`);

            if (!response.ok) {
                console.error('Newton API error:', response.status);
                return null;
            }

            const data = await response.json();

            return {
                expression: expression,
                answer: data.result || data.solution,
                display: this.formatDisplay(expression, operation),
                operation: data.operation
            };

        } catch (error) {
            console.error('❌ Problem generation failed:', error);
            return null;
        }
    }

    // ALGEBRA - Progressive difficulty (Tier 1-7)
    generateAlgebraExpression(tier) {
        const x = () => Math.floor(Math.random() * 10) + 1;

        switch(tier) {
            case 1: // Simple: 2x + 3
                return `${x()}*x+${x()}`;

            case 2: // Two terms with subtraction: 3x - 5
                return `${x()}*x-${x()}`;

            case 3: // Quadratic simple: x^2 + 2x + 1
                return `x^2+${x()}*x+${x()}`;

            case 4: // Negative coefficients: -2x^2 + 3x - 1
                return `-${x()}*x^2+${x()}*x-${x()}`;

            case 5: // Fractions: (2x + 3)/(x + 1)
                return `(${x()}*x+${x()})/(x+${x()})`;

            case 6: // Higher powers: 2x^3 - 3x^2 + x - 5
                return `${x()}*x^3-${x()}*x^2+${x()}*x-${x()}`;

            case 7: // Complex: (x^2 + 2x)/(x - 1) + 3x
                return `(x^2+${x()}*x)/(x-${x()})+${x()}*x`;

            default:
                return `${x()}*x+${x()}`;
        }
    }

    // FACTORING - Progressive difficulty
    generateFactoringExpression(tier) {
        const a = Math.floor(Math.random() * 5) + 1;
        const b = Math.floor(Math.random() * 10) + 1;
        const c = Math.floor(Math.random() * 10) + 1;

        switch(tier) {
            case 1: // x^2 + 5x + 6 (easy perfect factors)
                const r1 = Math.floor(Math.random() * 4) + 1;
                const r2 = Math.floor(Math.random() * 4) + 1;
                return `x^2+${r1 + r2}*x+${r1 * r2}`;

            case 2: // x^2 - 5x + 6 (with negative)
                const r3 = Math.floor(Math.random() * 4) + 2;
                const r4 = Math.floor(Math.random() * 4) + 2;
                return `x^2-${r3 + r4}*x+${r3 * r4}`;

            case 3: // 2x^2 + 7x + 3 (leading coefficient > 1)
                return `${a}*x^2+${a*3 + b}*x+${b*3}`;

            case 4: // x^2 - 9 (difference of squares)
                const n = Math.floor(Math.random() * 5) + 2;
                return `x^2-${n*n}`;

            case 5: // 3x^2 - 11x + 6 (harder coefficients)
                return `${a}*x^2-${a*5 + b}*x+${b*3}`;

            case 6: // x^3 + 6x^2 + 11x + 6 (cubic)
                return `x^3+${b}*x^2+${b+c}*x+${c}`;

            case 7: // 4x^4 - 9 (higher degree)
                return `${a}*x^4-${b*b}`;

            default:
                return `x^2+${b}*x+${c}`;
        }
    }

    // DERIVATIVES - Progressive difficulty
    generateDerivativeExpression(tier) {
        const a = Math.floor(Math.random() * 8) + 2;
        const b = Math.floor(Math.random() * 8) + 2;

        switch(tier) {
            case 1: // Power rule: x^3
                return `x^${Math.floor(Math.random() * 4) + 2}`;

            case 2: // Coefficient: 3x^4
                return `${a}*x^${Math.floor(Math.random() * 5) + 2}`;

            case 3: // Multiple terms: 2x^3 + 3x^2
                return `${a}*x^3+${b}*x^2`;

            case 4: // With constant: 4x^3 - 2x + 5
                return `${a}*x^3-${b}*x+${Math.floor(Math.random() * 10) + 1}`;

            case 5: // Negative powers: x^-2
                return `x^-${Math.floor(Math.random() * 3) + 1}`;

            case 6: // Fractional: (x^2 + 1)/(x - 1)
                return `(x^2+${b})/(x-${a})`;

            case 7: // Product/chain rule: (x^2 + 2x)(x - 1)
                return `(x^2+${a}*x)*(x-${b})`;

            default:
                return `${a}*x^${Math.floor(Math.random() * 4) + 2}`;
        }
    }

    // INTEGRALS - Progressive difficulty
    generateIntegralExpression(tier) {
        const a = Math.floor(Math.random() * 8) + 2;
        const b = Math.floor(Math.random() * 8) + 1;

        switch(tier) {
            case 1: // Simple power: x^2
                return `x^${Math.floor(Math.random() * 4) + 1}`;

            case 2: // With coefficient: 3x^2
                return `${a}*x^${Math.floor(Math.random() * 4) + 1}`;

            case 3: // Two terms: 2x^3 + 3x
                return `${a}*x^3+${b}*x`;

            case 4: // With constant: x^2 + 2x + 1
                return `x^2+${a}*x+${b}`;

            case 5: // Negative power: x^-1
                return `x^-1`;

            case 6: // Complex: 3x^4 - 2x^2 + x - 5
                return `${a}*x^4-${b}*x^2+x-${Math.floor(Math.random() * 5) + 1}`;

            case 7: // Fraction: (x^2 + 1)/x
                return `(x^2+${b})/x`;

            default:
                return `${a}*x^${Math.floor(Math.random() * 4) + 1}`;
        }
    }

    // EQUATIONS - Progressive difficulty
    generateEquation(tier) {
        const a = Math.floor(Math.random() * 8) + 2;
        const b = Math.floor(Math.random() * 10) + 1;
        const c = Math.floor(Math.random() * 10) + 1;

        switch(tier) {
            case 1: // Linear: 2x + 3 = 7
                return `${a}*x+${b}=${b + a * 2}`;

            case 2: // Linear with negatives: 3x - 5 = 4
                return `${a}*x-${b}=${c}`;

            case 3: // Two-sided: 2x + 3 = x + 5
                return `${a}*x+${b}=x+${b + c}`;

            case 4: // Quadratic: x^2 + 3x + 2 = 0
                const r1 = Math.floor(Math.random() * 4) + 1;
                const r2 = Math.floor(Math.random() * 4) + 1;
                return `x^2+${r1 + r2}*x+${r1 * r2}=0`;

            case 5: // Quadratic with coefficient: 2x^2 + 5x + 2 = 0
                return `${a}*x^2+${a*2 + b}*x+${b}=0`;

            case 6: // Rational: (x + 2)/(x - 1) = 3
                return `(x+${b})/(x-${a})=${c}`;

            case 7: // System-like: x^2 = 2x + 3
                return `x^2=${a}*x+${b}`;

            default:
                return `${a}*x+${b}=${c}`;
        }
    }

    // Format display based on operation
    formatDisplay(expression, operation) {
        const displayExpression = expression
            .replace(/\*/g, '')
            .replace(/\^/g, '');

        switch(operation) {
            case 'simplify':
                return `Simplify: ${displayExpression}`;
            case 'factor':
                return `Factor: ${displayExpression}`;
            case 'derive':
                return `d/dx(${displayExpression})`;
            case 'integrate':
                return `∫(${displayExpression})dx`;
            case 'solve':
                return `Solve: ${displayExpression}`;
            default:
                return displayExpression;
        }
    }

    // Generate financial problems (tier-based)
    generateFinancialProblem(tier) {
        const principal = [1000, 5000, 10000, 25000, 50000, 100000, 250000][tier - 1] || 10000;
        const rate = (Math.random() * 8 + 2).toFixed(2); // 2-10%
        const years = Math.floor(Math.random() * 10) + 1;

        const amount = principal * Math.pow(1 + parseFloat(rate) / 100, years);

        return {
            question: `חשב ריבית דריבית:\nInvest ₪${principal.toLocaleString()} at ${rate}% annual interest for ${years} years.\nCalculate the final amount with compound interest.`,
            answer: amount.toFixed(2),
            display: `Compound Interest Problem (Tier ${tier})`,
            expression: `${principal}*(1+${rate}/100)^${years}`
        };
    }
}

export const dynamicProblemGenerator = new DynamicProblemGenerator();
export default DynamicProblemGenerator;