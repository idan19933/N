// database/populate_database.js - POPULATE DB WITH THOUSANDS OF PROBLEMS

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Import the bulk generator logic
class BulkProblemGenerator {
    constructor() {
        this.problemTemplates = {
            algebra: {
                linear: [
                    { pattern: 'ax + b = c', range: { a: [2, 10], b: [-20, 20], c: [-50, 50] } },
                    { pattern: 'ax - b = c', range: { a: [2, 10], b: [1, 20], c: [-50, 50] } },
                ],
                quadratic: [
                    { pattern: 'x² + bx + c = 0', range: { b: [-10, 10], c: [-25, 25] } },
                ],
            },
            calculus: {
                derivatives: [
                    { pattern: 'x^n', range: { n: [2, 8] } },
                    { pattern: 'ax^n', range: { a: [1, 10], n: [2, 6] } },
                ],
                integrals: [
                    { pattern: 'x^n dx', range: { n: [1, 6] } },
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
            powers: {
                basic: [
                    { pattern: 'a^b', range: { a: [2, 10], b: [2, 5] } },
                    { pattern: 'a^b × a^c', range: { a: [2, 8], b: [2, 4], c: [2, 4] } },
                ],
                roots: [
                    { pattern: '√a', range: { a: [4, 144] } },
                ],
            },
            trigonometry: {
                basic: [
                    { pattern: 'sin(a°)', range: { a: [0, 360] } },
                ],
            },
        };
    }

    randomInRange(min, max) {
        return min + Math.floor(Math.random() * (max - min + 1));
    }

    generateProblem(category, subcategory, template, params) {
        // Same logic as bulkProblemGenerator
        if (category === 'geometry' && subcategory === 'triangles') {
            if (template.pattern === 'Area with base=a, height=b') {
                const solution = (params.a * params.b) / 2;
                return {
                    question: `מצא את שטח המשולש עם בסיס ${params.a} ס"מ וגובה ${params.b} ס"מ`,
                    answer: solution.toString(),
                    steps: JSON.stringify([
                        `S = (1/2) × בסיס × גובה`,
                        `S = (1/2) × ${params.a} × ${params.b}`,
                        `S = ${solution} ס"מ²`
                    ]),
                    hints: JSON.stringify(['זכור: שטח = (בסיס × גובה) ÷ 2']),
                    difficulty: 1,
                    topic: 'geometry',
                    category: subcategory,
                    grade: '9-12',
                    tier: 1
                };
            }

            if (template.pattern === 'Pythagorean: a² + b² = c²') {
                const c = Math.sqrt(params.a * params.a + params.b * params.b);
                return {
                    question: `במשולש ישר-זווית, הניצב הראשון ${params.a} ס"מ והניצב השני ${params.b} ס"מ. מצא את אורך היתר.`,
                    answer: c.toFixed(2),
                    steps: JSON.stringify([
                        `a² + b² = c²`,
                        `${params.a}² + ${params.b}² = c²`,
                        `c = ${c.toFixed(2)} ס"מ`
                    ]),
                    hints: JSON.stringify(['השתמש במשפט פיתגורס']),
                    difficulty: 2,
                    topic: 'geometry',
                    category: subcategory,
                    grade: '9-12',
                    tier: 2
                };
            }
        }

        if (category === 'algebra' && subcategory === 'linear') {
            if (template.pattern === 'ax + b = c') {
                const solution = (params.c - params.b) / params.a;
                return {
                    question: `פתור: ${params.a}x + ${params.b} = ${params.c}`,
                    answer: solution.toString(),
                    steps: JSON.stringify([
                        `${params.a}x = ${params.c - params.b}`,
                        `x = ${solution}`
                    ]),
                    hints: JSON.stringify(['העבר את המספר לצד שני', 'חלק במקדם']),
                    difficulty: 1,
                    topic: 'algebra',
                    category: subcategory,
                    grade: '7-9',
                    tier: 1
                };
            }
        }

        if (category === 'powers' && subcategory === 'basic') {
            if (template.pattern === 'a^b') {
                const solution = Math.pow(params.a, params.b);
                return {
                    question: `חשב: ${params.a}^${params.b}`,
                    answer: solution.toString(),
                    steps: JSON.stringify([
                        `${params.a}^${params.b} = ${params.a} כפול עצמו ${params.b} פעמים`,
                        `= ${solution}`
                    ]),
                    hints: JSON.stringify(['הכפל את הבסיס בעצמו']),
                    difficulty: 1,
                    topic: 'powers',
                    category: subcategory,
                    grade: '7-9',
                    tier: 1
                };
            }

            if (template.pattern === 'a^b × a^c') {
                return {
                    question: `פשט: ${params.a}^${params.b} × ${params.a}^${params.c}`,
                    answer: `${params.a}^${params.b + params.c}`,
                    steps: JSON.stringify([
                        `a^b × a^c = a^(b+c)`,
                        `${params.a}^${params.b + params.c}`
                    ]),
                    hints: JSON.stringify(['חבר את המעריכים']),
                    difficulty: 2,
                    topic: 'powers',
                    category: subcategory,
                    grade: '7-9',
                    tier: 2
                };
            }
        }

        if (category === 'powers' && subcategory === 'roots') {
            if (template.pattern === '√a') {
                const sqrt = Math.sqrt(params.a);
                const isExact = sqrt === Math.floor(sqrt);
                return {
                    question: `חשב: √${params.a}`,
                    answer: isExact ? sqrt.toString() : sqrt.toFixed(2),
                    steps: JSON.stringify([
                        isExact ? `${sqrt}² = ${params.a}` : `√${params.a} ≈ ${sqrt.toFixed(2)}`
                    ]),
                    hints: JSON.stringify(['מצא מספר שהריבוע שלו שווה למספר']),
                    difficulty: 1,
                    topic: 'powers',
                    category: subcategory,
                    grade: '7-9',
                    tier: 1
                };
            }
        }

        if (category === 'calculus' && subcategory === 'derivatives') {
            if (template.pattern === 'x^n') {
                return {
                    question: `מצא נגזרת: f(x) = x^${params.n}`,
                    answer: `${params.n}x^${params.n - 1}`,
                    steps: JSON.stringify([
                        `d/dx(x^n) = nx^(n-1)`,
                        `f'(x) = ${params.n}x^${params.n - 1}`
                    ]),
                    hints: JSON.stringify(['השתמש בכלל החזקה']),
                    difficulty: 2,
                    topic: 'calculus',
                    category: subcategory,
                    grade: '11-12',
                    tier: 2
                };
            }
        }

        return null;
    }

    generateBulk(count = 1000) {
        const problems = [];

        for (const [category, subcategories] of Object.entries(this.problemTemplates)) {
            for (const [subcategory, templates] of Object.entries(subcategories)) {
                const problemsPerTemplate = Math.ceil(count / Object.keys(this.problemTemplates).length / Object.keys(subcategories).length);

                for (let i = 0; i < problemsPerTemplate; i++) {
                    const template = templates[i % templates.length];
                    const params = {};

                    for (const [key, range] of Object.entries(template.range)) {
                        params[key] = this.randomInRange(range[0], range[1]);
                    }

                    const problem = this.generateProblem(category, subcategory, template, params);
                    if (problem) {
                        problems.push(problem);
                    }
                }
            }
        }

        return problems;
    }
}

// Database population
async function populateDatabase() {
    const dbPath = path.join(__dirname, 'mathtutor.db');
    const db = new sqlite3.Database(dbPath);

    console.log('🗄️  Connected to database:', dbPath);

    // Create table if not exists
    await new Promise((resolve, reject) => {
        db.run(`
      CREATE TABLE IF NOT EXISTS problems (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        steps TEXT,
        hints TEXT,
        difficulty INTEGER,
        topic TEXT,
        category TEXT,
        grade TEXT,
        tier INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });

    console.log('✅ Table ready');

    // Clear existing data (optional)
    await new Promise((resolve, reject) => {
        db.run('DELETE FROM problems', (err) => {
            if (err) reject(err);
            else resolve();
        });
    });

    console.log('🗑️  Cleared old data');

    // Generate problems
    const generator = new BulkProblemGenerator();
    const problems = generator.generateBulk(2000); // Generate 2000 problems!

    console.log(`📝 Generated ${problems.length} problems`);

    // Insert problems
    const insertStmt = db.prepare(`
    INSERT INTO problems (question, answer, steps, hints, difficulty, topic, category, grade, tier)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

    let inserted = 0;
    for (const problem of problems) {
        await new Promise((resolve, reject) => {
            insertStmt.run(
                problem.question,
                problem.answer,
                problem.steps,
                problem.hints,
                problem.difficulty,
                problem.topic,
                problem.category,
                problem.grade,
                problem.tier,
                (err) => {
                    if (err) {
                        console.error('❌ Insert error:', err);
                        reject(err);
                    } else {
                        inserted++;
                        if (inserted % 100 === 0) {
                            console.log(`   Inserted ${inserted}/${problems.length}...`);
                        }
                        resolve();
                    }
                }
            );
        });
    }

    insertStmt.finalize();

    console.log(`✅ Successfully inserted ${inserted} problems!`);

    // Show statistics
    db.get('SELECT COUNT(*) as total FROM problems', (err, row) => {
        if (!err) {
            console.log(`📊 Total problems in database: ${row.total}`);
        }
    });

    db.each(`
    SELECT topic, COUNT(*) as count 
    FROM problems 
    GROUP BY topic
  `, (err, row) => {
        if (!err) {
            console.log(`   ${row.topic}: ${row.count} problems`);
        }
    });

    db.close();
    console.log('🎉 Done!');
}

// Run it
populateDatabase().catch(console.error);