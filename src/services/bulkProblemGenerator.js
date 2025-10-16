// src/services/bulkProblemGenerator.js - COMPLETE WITH POWERS

class BulkProblemGenerator {
    constructor() {
        this.problemTemplates = {
            algebra: {
                linear: [
                    { pattern: 'ax + b = c', range: { a: [2, 10], b: [-20, 20], c: [-50, 50] } },
                    { pattern: 'ax - b = c', range: { a: [2, 10], b: [1, 20], c: [-50, 50] } },
                    { pattern: 'ax + b = cx + d', range: { a: [2, 10], b: [-20, 20], c: [2, 10], d: [-20, 20] } },
                ],
                quadratic: [
                    { pattern: 'x² + bx + c = 0', range: { b: [-10, 10], c: [-25, 25] } },
                    { pattern: 'ax² + bx + c = 0', range: { a: [1, 5], b: [-15, 15], c: [-30, 30] } },
                ],
            },

            calculus: {
                derivatives: [
                    { pattern: 'x^n', range: { n: [2, 8] } },
                    { pattern: 'ax^n', range: { a: [1, 10], n: [2, 6] } },
                    { pattern: 'ax^n + bx^m', range: { a: [1, 10], n: [2, 5], b: [1, 10], m: [1, 4] } },
                ],
                integrals: [
                    { pattern: 'x^n dx', range: { n: [1, 6] } },
                    { pattern: 'ax^n dx', range: { a: [1, 10], n: [1, 5] } },
                ],
            },

            geometry: {
                triangles: [
                    { pattern: 'Area with base=a, height=b', range: { a: [5, 30], b: [5, 25] } },
                    { pattern: 'Pythagorean: a² + b² = c²', range: { a: [3, 12], b: [4, 16] } },
                ],
                circles: [
                    { pattern: 'Area with radius=a', range: { a: [3, 20] } },
                    { pattern: 'Circumference with radius=a', range: { a: [3, 20] } },
                ],
            },

            trigonometry: {
                basic: [
                    { pattern: 'sin(a°)', range: { a: [0, 360] } },
                    { pattern: 'cos(a°)', range: { a: [0, 360] } },
                    { pattern: 'tan(a°)', range: { a: [0, 360] } },
                ],
            },

            statistics: {
                mean: [
                    { pattern: 'Mean of n numbers', range: { count: [5, 12], values: [1, 100] } },
                ],
                median: [
                    { pattern: 'Median of n numbers', range: { count: [5, 15], values: [1, 100] } },
                ],
            },

            combinatorics: {
                permutations: [
                    { pattern: 'n! arrangements', range: { n: [3, 8] } },
                ],
                combinations: [
                    { pattern: 'C(n, r)', range: { n: [5, 15], r: [2, 8] } },
                ],
            },

            powers: {
                basic: [
                    { pattern: 'a^b', range: { a: [2, 10], b: [2, 5] } },
                    { pattern: 'a^b × a^c', range: { a: [2, 8], b: [2, 4], c: [2, 4] } },
                    { pattern: 'a^b ÷ a^c', range: { a: [2, 8], b: [3, 7], c: [2, 5] } },
                    { pattern: '(a^b)^c', range: { a: [2, 5], b: [2, 3], c: [2, 3] } },
                ],
                roots: [
                    { pattern: '√a', range: { a: [4, 144] } },
                    { pattern: '∛a', range: { a: [8, 125] } },
                    { pattern: '√(a²)', range: { a: [2, 15] } },
                ],
                simplify: [
                    { pattern: 'ax + bx', range: { a: [2, 10], b: [2, 10] } },
                    { pattern: 'ax^b + cx^b', range: { a: [2, 8], b: [2, 4], c: [2, 8] } },
                    { pattern: 'a(x + b)', range: { a: [2, 10], b: [-10, 10] } },
                ],
            },
        };
    }

    randomInRange(min, max, step = 1) {
        const range = (max - min) / step;
        return min + Math.floor(Math.random() * (range + 1)) * step;
    }

    generateFromTemplate(category, subcategory, template) {
        const params = {};

        for (const [key, range] of Object.entries(template.range)) {
            if (Array.isArray(range) && range.length === 2) {
                params[key] = this.randomInRange(range[0], range[1]);
            }
        }

        const problem = this.buildProblem(category, subcategory, template.pattern, params);
        return problem;
    }

    buildProblem(category, subcategory, pattern, params) {
        switch (category) {
            case 'algebra':
                return this.buildAlgebraProblem(subcategory, pattern, params);
            case 'calculus':
                return this.buildCalculusProblem(subcategory, pattern, params);
            case 'geometry':
                return this.buildGeometryProblem(subcategory, pattern, params);
            case 'trigonometry':
                return this.buildTrigProblem(subcategory, pattern, params);
            case 'statistics':
                return this.buildStatsProblem(subcategory, pattern, params);
            case 'combinatorics':
                return this.buildCombinatoricsProblem(subcategory, pattern, params);
            case 'powers':
                return this.buildPowersProblem(subcategory, pattern, params);
            default:
                return null;
        }
    }

    buildAlgebraProblem(subcategory, pattern, params) {
        let problemText, solution, steps, hints, newtonExpression;

        if (pattern === 'ax + b = c') {
            problemText = `פתור: ${params.a}x + ${params.b} = ${params.c}`;
            solution = (params.c - params.b) / params.a;
            newtonExpression = `${params.a}*x+${params.b}=${params.c}`;
            steps = [
                `הפרד את x לצד אחד: ${params.a}x = ${params.c - params.b}`,
                `חלק בשני האגפים ב-${params.a}: x = ${solution}`
            ];
            hints = ['העבר את המספר הקבוע לצד שני', 'חלק בשני האגפים במקדם של x'];
            return { problemText, solution, steps, hints, newtonCompatible: true, newtonExpression, category: 'algebra', subcategory, difficulty: 1, question: problemText, answer: solution };
        }

        if (pattern === 'x² + bx + c = 0') {
            const discriminant = params.b * params.b - 4 * params.c;
            if (discriminant >= 0) {
                const sol1 = (-params.b + Math.sqrt(discriminant)) / 2;
                const sol2 = (-params.b - Math.sqrt(discriminant)) / 2;
                problemText = `פתור: x² ${params.b >= 0 ? '+' : ''}${params.b}x ${params.c >= 0 ? '+' : ''}${params.c} = 0`;
                solution = [sol1.toFixed(2), sol2.toFixed(2)];
                newtonExpression = `x^2+${params.b}*x+${params.c}=0`;
                steps = [
                    `נשתמש בנוסחת השורשים`,
                    `Δ = b² - 4ac = ${discriminant}`,
                    `x₁ = ${sol1.toFixed(2)}, x₂ = ${sol2.toFixed(2)}`
                ];
                hints = ['חשב את המבחין (Δ)', 'השתמש בנוסחת השורשים'];
                return { problemText, solution, steps, hints, newtonCompatible: true, newtonExpression, category: 'algebra', subcategory, difficulty: 3, question: problemText, answer: solution.join(', ') };
            }
        }

        return null;
    }

    buildCalculusProblem(subcategory, pattern, params) {
        let problemText, solution, steps, hints, newtonExpression;

        if (subcategory === 'derivatives') {
            if (pattern === 'x^n') {
                problemText = `מצא את הנגזרת: f(x) = x^${params.n}`;
                solution = `${params.n}x^${params.n - 1}`;
                newtonExpression = `x^${params.n}`;
                steps = [
                    `נשתמש בנוסחה: d/dx(x^n) = nx^(n-1)`,
                    `f'(x) = ${params.n}x^${params.n - 1}`
                ];
                hints = ['זכור את הכלל: d/dx(x^n) = nx^(n-1)'];
                return { problemText, solution, steps, hints, newtonCompatible: true, newtonExpression, category: 'calculus', subcategory, difficulty: 2, operation: 'derive', question: problemText, answer: solution };
            }

            if (pattern === 'ax^n') {
                problemText = `מצא את הנגזרת: f(x) = ${params.a}x^${params.n}`;
                solution = `${params.a * params.n}x^${params.n - 1}`;
                newtonExpression = `${params.a}*x^${params.n}`;
                steps = [
                    `נשתמש בכלל: d/dx(ax^n) = anx^(n-1)`,
                    `f'(x) = ${params.a * params.n}x^${params.n - 1}`
                ];
                hints = ['הוצא את המקדם החוצה', 'גזור את החזקה'];
                return { problemText, solution, steps, hints, newtonCompatible: true, newtonExpression, category: 'calculus', subcategory, difficulty: 2, operation: 'derive', question: problemText, answer: solution };
            }
        }

        if (subcategory === 'integrals') {
            if (pattern === 'x^n dx') {
                problemText = `חשב את האינטגרל: ∫x^${params.n} dx`;
                solution = `(1/${params.n + 1})x^${params.n + 1} + C`;
                newtonExpression = `x^${params.n}`;
                steps = [
                    `נשתמש בכלל: ∫x^n dx = (1/(n+1))x^(n+1) + C`,
                    `∫x^${params.n} dx = (1/${params.n + 1})x^${params.n + 1} + C`
                ];
                hints = ['זכור: הוסף 1 לחזקה וחלק בחזקה החדשה'];
                return { problemText, solution, steps, hints, newtonCompatible: true, newtonExpression, category: 'calculus', subcategory, difficulty: 2, operation: 'integrate', question: problemText, answer: solution };
            }
        }

        return null;
    }

    buildGeometryProblem(subcategory, pattern, params) {
        let problemText, solution, steps, hints;

        if (subcategory === 'triangles') {
            if (pattern === 'Area with base=a, height=b') {
                problemText = `מצא את שטח המשולש עם בסיס ${params.a} ס"מ וגובה ${params.b} ס"מ`;
                solution = (params.a * params.b) / 2;
                steps = [
                    `נוסחת שטח משולש: S = (1/2) × בסיס × גובה`,
                    `S = (1/2) × ${params.a} × ${params.b}`,
                    `S = ${solution} ס"מ²`
                ];
                hints = ['זכור את הנוסחה: שטח = (בסיס × גובה) ÷ 2'];
                return { problemText, solution, steps, hints, newtonCompatible: false, category: 'geometry', subcategory, difficulty: 1, question: problemText, answer: solution };
            }

            if (pattern === 'Pythagorean: a² + b² = c²') {
                const c = Math.sqrt(params.a * params.a + params.b * params.b);
                problemText = `במשולש ישר-זווית, אורך הניצב הראשון ${params.a} ס"מ והניצב השני ${params.b} ס"מ. מצא את אורך היתר.`;
                solution = c.toFixed(2);
                steps = [
                    `משפט פיתגורס: a² + b² = c²`,
                    `${params.a}² + ${params.b}² = c²`,
                    `c = √${params.a * params.a + params.b * params.b} = ${solution} ס"מ`
                ];
                hints = ['השתמש במשפט פיתגורס'];
                return { problemText, solution, steps, hints, newtonCompatible: false, category: 'geometry', subcategory, difficulty: 2, question: problemText, answer: solution };
            }
        }

        if (subcategory === 'circles') {
            if (pattern === 'Area with radius=a') {
                problemText = `מצא את שטח המעגל עם רדיוס ${params.a} ס"מ`;
                solution = (Math.PI * params.a * params.a).toFixed(2);
                steps = [
                    `נוסחת שטח מעגל: S = πr²`,
                    `S = π × ${params.a}²`,
                    `S ≈ ${solution} ס"מ²`
                ];
                hints = ['זכור: שטח מעגל = π × רדיוס²'];
                return { problemText, solution, steps, hints, newtonCompatible: false, category: 'geometry', subcategory, difficulty: 1, question: problemText, answer: solution };
            }
        }

        return null;
    }

    buildTrigProblem(subcategory, pattern, params) {
        const angles = [0, 30, 45, 60, 90, 120, 180, 270, 360];
        const angle = angles[Math.floor(Math.random() * angles.length)];

        if (pattern.includes('sin')) {
            const problemText = `חשב: sin(${angle}°)`;
            const solution = Math.sin(angle * Math.PI / 180).toFixed(4);
            const steps = [`המיר זווית לרדיאנים`, `sin(${angle}°) = ${solution}`];
            const hints = ['זכור ערכי סינוס של זוויות מיוחדות'];
            return { problemText, solution, steps, hints, newtonCompatible: false, category: 'trigonometry', subcategory, difficulty: 2, question: problemText, answer: solution };
        }

        return null;
    }

    buildStatsProblem(subcategory, pattern, params) {
        if (subcategory === 'mean') {
            const count = params.count || 6;
            const numbers = Array.from({ length: count }, () => this.randomInRange(params.values[0], params.values[1]));
            const sum = numbers.reduce((a, b) => a + b, 0);
            const mean = sum / count;

            const problemText = `חשב את הממוצע של: ${numbers.join(', ')}`;
            const solution = mean.toFixed(2);
            const steps = [
                `סכום: ${sum}`,
                `כמות: ${count}`,
                `ממוצע = ${sum} ÷ ${count} = ${solution}`
            ];
            const hints = ['חבר את כל המספרים וחלק בכמות'];
            return { problemText, solution, steps, hints, newtonCompatible: false, category: 'statistics', subcategory, difficulty: 1, question: problemText, answer: solution };
        }

        return null;
    }

    buildCombinatoricsProblem(subcategory, pattern, params) {
        const factorial = (n) => n <= 1 ? 1 : n * factorial(n - 1);

        if (pattern === 'n! arrangements') {
            const problemText = `בכמה דרכים אפשר לסדר ${params.n} פריטים?`;
            const solution = factorial(params.n);
            const steps = [`${params.n}! = ${solution}`];
            const hints = ['זה n פקטוריאל'];
            return { problemText, solution, steps, hints, newtonCompatible: false, category: 'combinatorics', subcategory, difficulty: 2, question: problemText, answer: solution };
        }

        return null;
    }

    buildPowersProblem(subcategory, pattern, params) {
        let problemText, solution, steps, hints;

        if (subcategory === 'basic') {
            switch (pattern) {
                case 'a^b':
                    problemText = `חשב: ${params.a}^${params.b}`;
                    solution = Math.pow(params.a, params.b);
                    steps = [
                        `${params.a}^${params.b} = ${params.a} כפול עצמו ${params.b} פעמים`,
                        `= ${solution}`
                    ];
                    hints = ['הכפל את הבסיס בעצמו מספר הפעמים של החזקה'];
                    return { problemText, solution, steps, hints, newtonCompatible: false, category: 'powers', subcategory, difficulty: 1, question: problemText, answer: solution };

                case 'a^b × a^c':
                    problemText = `פשט: ${params.a}^${params.b} × ${params.a}^${params.c}`;
                    solution = `${params.a}^${params.b + params.c}`;
                    steps = [
                        `כלל מכפלת חזקות: a^b × a^c = a^(b+c)`,
                        `${params.a}^${params.b} × ${params.a}^${params.c} = ${params.a}^${params.b + params.c}`
                    ];
                    hints = ['כשמכפילים חזקות עם אותו בסיס, חבר את המעריכים'];
                    return { problemText, solution, steps, hints, newtonCompatible: false, category: 'powers', subcategory, difficulty: 2, question: problemText, answer: solution };

                case 'a^b ÷ a^c':
                    problemText = `פשט: ${params.a}^${params.b} ÷ ${params.a}^${params.c}`;
                    solution = `${params.a}^${params.b - params.c}`;
                    steps = [
                        `כלל חילוק חזקות: a^b ÷ a^c = a^(b-c)`,
                        `${params.a}^${params.b} ÷ ${params.a}^${params.c} = ${params.a}^${params.b - params.c}`
                    ];
                    hints = ['כשמחלקים חזקות עם אותו בסיס, חסר את המעריכים'];
                    return { problemText, solution, steps, hints, newtonCompatible: false, category: 'powers', subcategory, difficulty: 2, question: problemText, answer: solution };

                case '(a^b)^c':
                    problemText = `פשט: (${params.a}^${params.b})^${params.c}`;
                    solution = `${params.a}^${params.b * params.c}`;
                    steps = [
                        `כלל חזקת חזקה: (a^b)^c = a^(b×c)`,
                        `(${params.a}^${params.b})^${params.c} = ${params.a}^${params.b * params.c}`
                    ];
                    hints = ['כשמעלים חזקה בחזקה, הכפל את המעריכים'];
                    return { problemText, solution, steps, hints, newtonCompatible: false, category: 'powers', subcategory, difficulty: 3, question: problemText, answer: solution };
            }
        }

        if (subcategory === 'roots') {
            switch (pattern) {
                case '√a':
                    const sqrt = Math.sqrt(params.a);
                    const isExact = sqrt === Math.floor(sqrt);
                    problemText = `חשב: √${params.a}`;
                    solution = isExact ? sqrt : sqrt.toFixed(2);
                    steps = [isExact ? `${sqrt}² = ${params.a}` : `√${params.a} ≈ ${solution}`];
                    hints = ['מצא מספר שהריבוע שלו שווה למספר'];
                    return { problemText, solution, steps, hints, newtonCompatible: false, category: 'powers', subcategory, difficulty: 1, question: problemText, answer: solution };

                case '∛a':
                    const cbrt = Math.cbrt(params.a);
                    const isCbrtExact = cbrt === Math.floor(cbrt);
                    problemText = `חשב: ∛${params.a}`;
                    solution = isCbrtExact ? cbrt : cbrt.toFixed(2);
                    steps = [isCbrtExact ? `${cbrt}³ = ${params.a}` : `∛${params.a} ≈ ${solution}`];
                    hints = ['מצא מספר שהקוביה שלו שווה למספר'];
                    return { problemText, solution, steps, hints, newtonCompatible: false, category: 'powers', subcategory, difficulty: 2, question: problemText, answer: solution };

                case '√(a²)':
                    problemText = `פשט: √(${params.a}²)`;
                    solution = Math.abs(params.a);
                    steps = [`√(${params.a}²) = |${params.a}| = ${solution}`];
                    hints = ['שורש של ריבוע שווה לערך המוחלט'];
                    return { problemText, solution, steps, hints, newtonCompatible: false, category: 'powers', subcategory, difficulty: 2, question: problemText, answer: solution };
            }
        }

        if (subcategory === 'simplify') {
            switch (pattern) {
                case 'ax + bx':
                    problemText = `פשט: ${params.a}x + ${params.b}x`;
                    solution = `${params.a + params.b}x`;
                    steps = [`${params.a}x + ${params.b}x = ${params.a + params.b}x`];
                    hints = ['אסוף איברים דומים'];
                    return { problemText, solution, steps, hints, newtonCompatible: false, category: 'powers', subcategory, difficulty: 1, question: problemText, answer: solution };

                case 'ax^b + cx^b':
                    problemText = `פשט: ${params.a}x^${params.b} + ${params.c}x^${params.b}`;
                    solution = `${params.a + params.c}x^${params.b}`;
                    steps = [`${params.a}x^${params.b} + ${params.c}x^${params.b} = ${params.a + params.c}x^${params.b}`];
                    hints = ['אסוף איברים עם אותה חזקה'];
                    return { problemText, solution, steps, hints, newtonCompatible: false, category: 'powers', subcategory, difficulty: 2, question: problemText, answer: solution };

                case 'a(x + b)':
                    problemText = `פתח סוגריים: ${params.a}(x + ${params.b})`;
                    solution = `${params.a}x + ${params.a * params.b}`;
                    steps = [`${params.a}(x + ${params.b}) = ${params.a}x + ${params.a * params.b}`];
                    hints = ['הכפל כל איבר בסוגריים'];
                    return { problemText, solution, steps, hints, newtonCompatible: false, category: 'powers', subcategory, difficulty: 2, question: problemText, answer: solution };
            }
        }

        return null;
    }

    generateBulkProblems(category, subcategory, count = 100) {
        const problems = [];
        const templates = this.problemTemplates[category]?.[subcategory] || [];

        if (templates.length === 0) {
            console.warn(`No templates for ${category}/${subcategory}`);
            return problems;
        }

        for (let i = 0; i < count; i++) {
            const template = templates[i % templates.length];
            const problem = this.generateFromTemplate(category, subcategory, template);

            if (problem) {
                problems.push({
                    id: `${category}_${subcategory}_${Date.now()}_${i}`,
                    ...problem,
                    createdAt: new Date().toISOString(),
                    topic: `${category}_${subcategory}`,
                    isGenerated: true,
                });
            }
        }

        return problems;
    }

    generateAllProblems(problemsPerTopic = 50) {
        const allProblems = [];

        for (const [category, subcategories] of Object.entries(this.problemTemplates)) {
            for (const subcategory of Object.keys(subcategories)) {
                console.log(`Generating ${problemsPerTopic} for ${category}/${subcategory}...`);
                const problems = this.generateBulkProblems(category, subcategory, problemsPerTopic);
                allProblems.push(...problems);
            }
        }

        console.log(`✅ Generated ${allProblems.length} total problems!`);
        return allProblems;
    }

    getAvailableTopics() {
        const topics = [];
        for (const [category, subcategories] of Object.entries(this.problemTemplates)) {
            for (const subcategory of Object.keys(subcategories)) {
                topics.push({
                    category,
                    subcategory,
                    displayName: `${category} - ${subcategory}`,
                    id: `${category}_${subcategory}`
                });
            }
        }
        return topics;
    }
}

export const bulkProblemGenerator = new BulkProblemGenerator();