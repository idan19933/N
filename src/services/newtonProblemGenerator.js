// src/services/newtonProblemGenerator.js - DYNAMIC NEWTON PROBLEMS
class NewtonProblemGenerator {
    constructor() {
        this.baseURL = 'https://newton.now.sh/api/v2';
        this.cache = new Map();
    }

    // Problem templates
    templates = {
        calculus_integrate: [
            { expr: 'x', display: '∫x dx' },
            { expr: '2*x', display: '∫2x dx' },
            { expr: '3*x', display: '∫3x dx' },
            { expr: 'x^2', display: '∫x² dx' },
            { expr: 'x^3', display: '∫x³ dx' },
            { expr: 'x^2+x', display: '∫(x² + x)dx' },
            { expr: '2*x^2+x', display: '∫(2x² + x)dx' },
            { expr: 'x^2+2*x', display: '∫(x² + 2x)dx' },
            { expr: 'x^3+x^2', display: '∫(x³ + x²)dx' }
        ],
        calculus_derive: [
            { expr: 'x^2', display: 'd/dx(x²)' },
            { expr: 'x^3', display: 'd/dx(x³)' },
            { expr: '2*x^2', display: 'd/dx(2x²)' },
            { expr: 'x^2+x', display: 'd/dx(x² + x)' },
            { expr: 'x^3+x^2', display: 'd/dx(x³ + x²)' }
        ],
        algebra_simplify: [
            { expr: '2*x+3*x', display: 'פשט: 2x + 3x' },
            { expr: '5*x+2*x', display: 'פשט: 5x + 2x' },
            { expr: '4*x-2*x', display: 'פשט: 4x - 2x' },
            { expr: 'x^2+x^2', display: 'פשט: x² + x²' },
            { expr: '3*x^2+2*x^2', display: 'פשט: 3x² + 2x²' }
        ],
        algebra_factor: [
            { expr: 'x^2-9', display: 'פרק לגורמים: x² - 9' },
            { expr: 'x^2-16', display: 'פרק לגורמים: x² - 16' },
            { expr: 'x^2-25', display: 'פרק לגורמים: x² - 25' },
            { expr: 'x^2+5*x+6', display: 'פרק לגורמים: x² + 5x + 6' },
            { expr: 'x^2+7*x+12', display: 'פרק לגורמים: x² + 7x + 12' }
        ],
        algebra_zeroes: [
            { expr: 'x^2-4', display: 'מצא שורשים: x² - 4 = 0' },
            { expr: 'x^2-9', display: 'מצא שורשים: x² - 9 = 0' },
            { expr: 'x^2-16', display: 'מצא שורשים: x² - 16 = 0' }
        ]
    };

    async callNewton(operation, expression) {
        try {
            const key = `${operation}:${expression}`;
            if (this.cache.has(key)) {
                return this.cache.get(key);
            }

            const url = `${this.baseURL}/${operation}/${encodeURIComponent(expression)}`;
            console.log('🔄 Newton:', url);

            const response = await fetch(url);
            if (!response.ok) throw new Error(`Newton error: ${response.status}`);

            const data = await response.json();
            this.cache.set(key, data.result);
            return data.result;
        } catch (error) {
            console.error('❌ Newton error:', error);
            return null;
        }
    }

    async generateProblem(topic, level) {
        try {
            let templateKey, operation;

            // Select template based on topic/level
            if (topic === 'calculus') {
                if (level === 'beginner' || level === 'intermediate') {
                    operation = Math.random() > 0.5 ? 'integrate' : 'derive';
                } else {
                    operation = 'integrate';
                }
                templateKey = `calculus_${operation}`;
            } else if (topic === 'algebra') {
                if (level === 'beginner') {
                    templateKey = 'algebra_simplify';
                    operation = 'simplify';
                } else if (level === 'intermediate') {
                    const ops = ['simplify', 'factor'];
                    operation = ops[Math.floor(Math.random() * ops.length)];
                    templateKey = `algebra_${operation}`;
                } else {
                    const ops = ['factor', 'zeroes'];
                    operation = ops[Math.floor(Math.random() * ops.length)];
                    templateKey = `algebra_${operation}`;
                }
            } else {
                return null; // Other topics use database
            }

            const templates = this.templates[templateKey];
            if (!templates || templates.length === 0) return null;

            const template = templates[Math.floor(Math.random() * templates.length)];

            // Get answer from Newton
            const answer = await this.callNewton(operation, template.expr);
            if (!answer) throw new Error('Newton API failed');

            return {
                id: `newton-${Date.now()}-${Math.random()}`,
                topic: topic,
                level: level,
                question: template.display,
                answer: operation === 'integrate' ? `${answer} + C` : answer,
                newton_operation: operation,
                newton_expression: template.expr,
                explanation: `Newton API: ${operation}(${template.expr}) = ${answer}`,
                requires_steps: true,
                source: 'newton'
            };
        } catch (error) {
            console.error('❌ Problem generation failed:', error);
            return null;
        }
    }
}

export const newtonProblemGenerator = new NewtonProblemGenerator();