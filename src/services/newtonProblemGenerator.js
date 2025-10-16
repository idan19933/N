// src/services/newtonProblemGenerator.js - FULL INTEGRATION
class NewtonProblemGenerator {
    constructor() {
        this.baseURL = 'https://newton.now.sh/api/v2';
        this.cache = new Map();
    }

    templates = {
        calculus_integrate: [
            // Power rules - validated
            { expr: 'x', display: '∫x dx' },
            { expr: '2*x', display: '∫2x dx' },
            { expr: '3*x', display: '∫3x dx' },
            { expr: '4*x', display: '∫4x dx' },
            { expr: 'x^2', display: '∫x² dx' },
            { expr: '2*x^2', display: '∫2x² dx' },
            { expr: '3*x^2', display: '∫3x² dx' },
            { expr: 'x^3', display: '∫x³ dx' },
            { expr: '2*x^3', display: '∫2x³ dx' },
            { expr: 'x^4', display: '∫x⁴ dx' },

            // Polynomials - WORKING
            { expr: 'x^2+x', display: '∫(x² + x)dx' },
            { expr: 'x^2+2*x', display: '∫(x² + 2x)dx' },
            { expr: '2*x^2+x', display: '∫(2x² + x)dx' },
            { expr: 'x^3+x^2', display: '∫(x³ + x²)dx' },
            { expr: '2*x^3+3*x^2', display: '∫(2x³ + 3x²)dx' },
        ],

        calculus_derive: [
            { expr: 'x^2', display: 'd/dx(x²)' },
            { expr: 'x^3', display: 'd/dx(x³)' },
            { expr: 'x^4', display: 'd/dx(x⁴)' },
            { expr: '2*x^2', display: 'd/dx(2x²)' },
            { expr: '3*x^2', display: 'd/dx(3x²)' },
            { expr: '2*x^3', display: 'd/dx(2x³)' },
            { expr: 'x^2+x', display: 'd/dx(x² + x)' },
            { expr: 'x^3+x^2', display: 'd/dx(x³ + x²)' },
            { expr: '2*x^3+3*x', display: 'd/dx(2x³ + 3x)' },
        ],

        algebra_simplify: [
            { expr: '2*x+3*x', display: 'פשט: 2x + 3x' },
            { expr: '5*x+2*x', display: 'פשט: 5x + 2x' },
            { expr: '4*x-2*x', display: 'פשט: 4x - 2x' },
            { expr: 'x^2+x^2', display: 'פשט: x² + x²' },
            { expr: '3*x^2+2*x^2', display: 'פשט: 3x² + 2x²' },
        ],

        algebra_factor: [
            { expr: 'x^2-4', display: 'פרק לגורמים: x² - 4' },
            { expr: 'x^2-9', display: 'פרק לגורמים: x² - 9' },
            { expr: 'x^2-16', display: 'פרק לגורמים: x² - 16' },
        ]
    };

    async callNewton(operation, expression) {
        try {
            const key = `${operation}:${expression}`;
            if (this.cache.has(key)) {
                console.log('📦 Cache hit');
                return this.cache.get(key);
            }

            const cleanExpr = expression.replace(/\s+/g, '');
            const url = `${this.baseURL}/${operation}/${encodeURIComponent(cleanExpr)}`;

            console.log('🔄 Newton:', url);

            const response = await fetch(url);
            if (!response.ok) throw new Error(`Newton error: ${response.status}`);

            const data = await response.json();
            console.log('✅ Newton result:', data.result);

            // Validate result
            if (!data.result || data.result === 'Error') {
                throw new Error('Invalid Newton response');
            }

            // For polynomial operations, result must contain 'x'
            if ((operation === 'integrate' || operation === 'derive') && !data.result.includes('x')) {
                console.warn('⚠️ Newton returned non-polynomial:', data.result);
                throw new Error('Non-polynomial result');
            }

            this.cache.set(key, data.result);
            return data.result;
        } catch (error) {
            console.error('❌ Newton failed:', error.message);
            return null;
        }
    }

    async generateProblem(topic, level) {
        let operation, templates;

        if (topic === 'calculus') {
            operation = level === 'beginner' ? 'integrate' :
                Math.random() > 0.5 ? 'integrate' : 'derive';
            templates = this.templates[`calculus_${operation}`];
        } else if (topic === 'algebra') {
            operation = level === 'beginner' ? 'simplify' :
                Math.random() > 0.5 ? 'simplify' : 'factor';
            templates = this.templates[`algebra_${operation}`];
        } else {
            return null;
        }

        if (!templates || templates.length === 0) return null;

        // Try up to 3 templates
        for (let i = 0; i < 3; i++) {
            const template = templates[Math.floor(Math.random() * templates.length)];
            const answer = await this.callNewton(operation, template.expr);

            if (answer) {
                const finalAnswer = operation === 'integrate' ? `${answer} + C` : answer;

                return {
                    id: `newton-${Date.now()}-${Math.random()}`,
                    topic,
                    level,
                    question: template.display,
                    answer: finalAnswer,
                    newton_operation: operation,
                    newton_expression: template.expr,
                    explanation: `Solved using Newton API`,
                    requires_steps: true,
                    source: 'newton'
                };
            }
        }

        return null;
    }
}

export const newtonProblemGenerator = new NewtonProblemGenerator();