// src/services/mathSolverService.js - NEWTON API INTEGRATION
class MathSolverService {
    constructor() {
        this.baseURL = import.meta.env.VITE_NEWTON_API_URL || 'https://newton.now.sh/api/v2';
        this.cache = new Map();
    }

    // Newton API operations
    operations = {
        simplify: 'simplify',
        factor: 'factor',
        derive: 'derive',
        integrate: 'integrate',
        zeroes: 'zeroes',
        tangent: 'tangent',
        area: 'area',
        cos: 'cos',
        sin: 'sin',
        tan: 'tan',
        arccos: 'arccos',
        arcsin: 'arcsin',
        arctan: 'arctan',
        abs: 'abs',
        log: 'log'
    };

    // Call Newton API
    async solve(operation, expression) {
        try {
            // Check cache first
            const cacheKey = `${operation}:${expression}`;
            if (this.cache.has(cacheKey)) {
                console.log('📦 Cache hit:', cacheKey);
                return this.cache.get(cacheKey);
            }

            // Clean expression for Newton API
            const cleanExpression = this.prepareExpression(expression);
            const url = `${this.baseURL}/${operation}/${encodeURIComponent(cleanExpression)}`;

            console.log('🔄 Newton API Request:', { operation, expression: cleanExpression, url });

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Newton API error: ${response.status}`);
            }

            const data = await response.json();

            console.log('✅ Newton API Response:', data);

            // Cache the result
            this.cache.set(cacheKey, data);

            return data;
        } catch (error) {
            console.error('❌ Newton API Error:', error);
            return { error: error.message, operation, expression };
        }
    }

    // Prepare expression for Newton API
    prepareExpression(expr) {
        return String(expr)
            .replace(/\s+/g, '')
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/²/g, '^2')
            .replace(/³/g, '^3')
            .replace(/√/g, 'sqrt')
            .replace(/∫/g, '')
            .replace(/\+\s*C$/i, '') // Remove +C for integration
            .replace(/dx$/i, ''); // Remove dx
    }

    // Verify integral
    async verifyIntegral(expression, userAnswer) {
        try {
            const result = await this.solve('integrate', expression);
            if (result.error) return { verified: false, error: result.error };

            const newtonAnswer = this.prepareExpression(result.result);
            const userAnswerClean = this.prepareExpression(userAnswer);

            console.log('🔍 Integral Verification:', {
                original: expression,
                newtonAnswer,
                userAnswerClean,
                match: this.compareExpressions(newtonAnswer, userAnswerClean)
            });

            return {
                verified: this.compareExpressions(newtonAnswer, userAnswerClean),
                newtonAnswer: result.result,
                userAnswer
            };
        } catch (error) {
            return { verified: false, error: error.message };
        }
    }

    // Verify derivative
    async verifyDerivative(expression, userAnswer) {
        try {
            const result = await this.solve('derive', expression);
            if (result.error) return { verified: false, error: result.error };

            const newtonAnswer = this.prepareExpression(result.result);
            const userAnswerClean = this.prepareExpression(userAnswer);

            return {
                verified: this.compareExpressions(newtonAnswer, userAnswerClean),
                newtonAnswer: result.result,
                userAnswer
            };
        } catch (error) {
            return { verified: false, error: error.message };
        }
    }

    // Simplify expression
    async simplify(expression) {
        return await this.solve('simplify', expression);
    }

    // Factor expression
    async factor(expression) {
        return await this.solve('factor', expression);
    }

    // Find zeroes
    async findZeroes(expression) {
        return await this.solve('zeroes', expression);
    }

    // Compare two mathematical expressions
    compareExpressions(expr1, expr2) {
        const normalize = (expr) => {
            return String(expr)
                .toLowerCase()
                .replace(/\s+/g, '')
                .replace(/\*+/g, '*')
                .replace(/\++/g, '+')
                // Handle fractions
                .replace(/(\d+)x\^2\/2/g, (match, coef) => `${parseFloat(coef) / 2}x^2`)
                .replace(/2x\^2\/2/g, 'x^2')
                .replace(/4x\^2\/2/g, '2x^2')
                .replace(/6x\^2\/2/g, '3x^2');
        };

        const norm1 = normalize(expr1);
        const norm2 = normalize(expr2);

        console.log('🔄 Expression Comparison:', { norm1, norm2, match: norm1 === norm2 });

        return norm1 === norm2;
    }

    // Get hints for a problem
    async getHint(problemType, expression) {
        try {
            let hint = '';

            switch (problemType) {
                case 'calculus':
                    if (expression.includes('∫')) {
                        const simplified = await this.simplify(expression);
                        hint = `רמז: פשט תחילה את ${simplified.result || expression}`;
                    }
                    break;
                case 'algebra':
                    const factored = await this.factor(expression);
                    if (factored.result) {
                        hint = `רמז: נסה לפרק לגורמים: ${factored.result}`;
                    }
                    break;
            }

            return hint;
        } catch (error) {
            return null;
        }
    }

    // Clear cache
    clearCache() {
        this.cache.clear();
    }
}

export const mathSolver = new MathSolverService();