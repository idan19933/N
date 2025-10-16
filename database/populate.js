// database/populate.js - Complete Database Populator with Functions
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const generators = {
    algebra: {
        linear: (difficulty) => {
            const a = Math.floor(Math.random() * 10) + 1;
            const b = Math.floor(Math.random() * 20) - 10;
            const c = Math.floor(Math.random() * 30) + 10;
            const solution = Math.round(((c - b) / a) * 100) / 100;

            return {
                problemText: `פתור: ${a}x ${b >= 0 ? '+' : ''} ${b} = ${c}`,
                solution: solution,
                steps: [
                    `העבר את ${b} לצד ימין: ${a}x = ${c - b}`,
                    `חלק ב-${a}: x = ${solution}`
                ],
                hints: [`העבר את המספר הקבוע לצד השני`, `חלק בשני הצדדים במקדם`],
                difficulty: difficulty
            };
        },
        quadratic: (difficulty) => {
            const a = Math.floor(Math.random() * 3) + 1;
            const b = Math.floor(Math.random() * 10) - 5;
            const c = Math.floor(Math.random() * 20) - 10;
            const discriminant = b * b - 4 * a * c;

            if (discriminant >= 0) {
                const x1 = Math.round(((-b + Math.sqrt(discriminant)) / (2 * a)) * 100) / 100;
                const x2 = Math.round(((-b - Math.sqrt(discriminant)) / (2 * a)) * 100) / 100;

                return {
                    problemText: `פתור: ${a}x² ${b >= 0 ? '+' : ''} ${b}x ${c >= 0 ? '+' : ''} ${c} = 0`,
                    solution: x1,
                    steps: [
                        `השתמש בנוסחת השורשים`,
                        `x = (-b ± √(b²-4ac)) / 2a`,
                        `x₁ = ${x1}, x₂ = ${x2}`
                    ],
                    hints: [`השתמש בנוסחת השורשים`, `חשב את הדיסקרימיננטה`],
                    difficulty: difficulty + 2
                };
            }
            return generators.algebra.linear(difficulty);
        }
    },

    geometry: {
        triangles: (difficulty) => {
            const base = Math.floor(Math.random() * 30) + 10;
            const height = Math.floor(Math.random() * 20) + 5;
            const area = (base * height) / 2;

            return {
                problemText: `מצא את שטח המשולש עם בסיס ${base} ס"מ וגובה ${height} ס"מ`,
                solution: area,
                steps: [
                    `נוסחה: שטח = (בסיס × גובה) ÷ 2`,
                    `שטח = (${base} × ${height}) ÷ 2`,
                    `שטח = ${area} ס"מ²`
                ],
                hints: [`השתמש בנוסחה: שטח = (בסיס × גובה) ÷ 2`],
                difficulty: difficulty
            };
        },
        circles: (difficulty) => {
            const radius = Math.floor(Math.random() * 15) + 5;
            const area = Math.round(Math.PI * radius * radius * 100) / 100;

            return {
                problemText: `מצא את שטח המעגל עם רדיוס ${radius} ס"מ`,
                solution: area,
                steps: [
                    `נוסחה: שטח = π × r²`,
                    `שטח = π × ${radius}²`,
                    `שטח = ${area} ס"מ²`
                ],
                hints: [`השתמש בנוסחה: שטח = πr²`, `π ≈ 3.14`],
                difficulty: difficulty
            };
        }
    },

    powers: {
        basic: (difficulty) => {
            const base = Math.floor(Math.random() * 5) + 2;
            const exponent = Math.floor(Math.random() * 4) + 2;
            const result = Math.pow(base, exponent);

            return {
                problemText: `חשב: ${base}^${exponent}`,
                solution: result,
                steps: [
                    `${base}^${exponent} = ${base} × `.repeat(exponent).slice(0, -3),
                    `התשובה: ${result}`
                ],
                hints: [`הכפל את ${base} בעצמו ${exponent} פעמים`],
                difficulty: difficulty
            };
        },
        roots: (difficulty) => {
            const number = Math.pow(Math.floor(Math.random() * 10) + 2, 2);
            const root = Math.sqrt(number);

            return {
                problemText: `חשב: √${number}`,
                solution: root,
                steps: [
                    `מצא איזה מספר בריבוע נותן ${number}`,
                    `התשובה: ${root}`
                ],
                hints: [`חפש מספר שאם מכפילים אותו בעצמו מקבלים ${number}`],
                difficulty: difficulty
            };
        }
    },

    calculus: {
        derivatives: (difficulty) => {
            const a = Math.floor(Math.random() * 5) + 1;
            const n = Math.floor(Math.random() * 4) + 2;
            const derivative = `${a * n}x^${n - 1}`;

            return {
                problemText: `מצא את הנגזרת של f(x) = ${a}x^${n}`,
                solution: derivative,
                steps: [
                    `נוסחה: d/dx(ax^n) = n·a·x^(n-1)`,
                    `f'(x) = ${a * n}x^${n - 1}`
                ],
                hints: [`השתמש בכלל החזקה`, `הורד את החזקה והכפל במקדם`],
                difficulty: difficulty + 3
            };
        },
        integrals: (difficulty) => {
            const a = Math.floor(Math.random() * 5) + 1;
            const n = Math.floor(Math.random() * 4) + 1;
            const result = `(${a}x^${n + 1})/${n + 1} + C`;

            return {
                problemText: `מצא את האינטגרל של f(x) = ${a}x^${n}`,
                solution: result,
                steps: [
                    `נוסחה: ∫ax^n dx = (ax^(n+1))/(n+1) + C`,
                    `∫${a}x^${n} dx = ${result}`
                ],
                hints: [`הגדל את החזקה ב-1 וחלק במספר החדש`],
                difficulty: difficulty + 3
            };
        }
    },

    // ✅ NEW: FUNCTIONS TOPIC
    functions: {
        linear: (difficulty) => {
            const m = Math.floor(Math.random() * 10) + 1;
            const b = Math.floor(Math.random() * 20) - 10;
            const x = Math.floor(Math.random() * 10) + 1;
            const result = m * x + b;

            return {
                problemText: `בהינתן f(x) = ${m}x ${b >= 0 ? '+' : ''} ${b}, חשב f(${x})`,
                solution: result,
                steps: [
                    `החלף x ב-${x}`,
                    `f(${x}) = ${m}(${x}) ${b >= 0 ? '+' : ''} ${b}`,
                    `f(${x}) = ${m * x} ${b >= 0 ? '+' : ''} ${b}`,
                    `f(${x}) = ${result}`
                ],
                hints: [`החלף את x בערך הנתון`, `חשב לפי סדר פעולות`],
                difficulty: difficulty
            };
        },
        quadratic: (difficulty) => {
            const a = Math.floor(Math.random() * 3) + 1;
            const b = Math.floor(Math.random() * 10) - 5;
            const c = Math.floor(Math.random() * 20) - 10;
            const x = Math.floor(Math.random() * 5) + 1;
            const result = a * x * x + b * x + c;

            return {
                problemText: `בהינתן f(x) = ${a}x² ${b >= 0 ? '+' : ''} ${b}x ${c >= 0 ? '+' : ''} ${c}, חשב f(${x})`,
                solution: result,
                steps: [
                    `החלף x ב-${x}`,
                    `f(${x}) = ${a}(${x})² ${b >= 0 ? '+' : ''} ${b}(${x}) ${c >= 0 ? '+' : ''} ${c}`,
                    `f(${x}) = ${a * x * x} ${b >= 0 ? '+' : ''} ${b * x} ${c >= 0 ? '+' : ''} ${c}`,
                    `f(${x}) = ${result}`
                ],
                hints: [`החלף את x בערך הנתון`, `חשב את החזקה תחילה`],
                difficulty: difficulty + 1
            };
        }
    },

    // ✅ NEW: TRIGONOMETRY TOPIC
    trigonometry: {
        basic: (difficulty) => {
            const angles = [0, 30, 45, 60, 90];
            const angle = angles[Math.floor(Math.random() * angles.length)];
            const values = {
                0: { sin: 0, cos: 1, tan: 0 },
                30: { sin: 0.5, cos: 0.866, tan: 0.577 },
                45: { sin: 0.707, cos: 0.707, tan: 1 },
                60: { sin: 0.866, cos: 0.5, tan: 1.732 },
                90: { sin: 1, cos: 0, tan: 'undefined' }
            };

            const func = ['sin', 'cos'][Math.floor(Math.random() * 2)];
            const result = values[angle][func];

            return {
                problemText: `חשב: ${func}(${angle}°)`,
                solution: result,
                steps: [
                    `זווית מיוחדת: ${angle}°`,
                    `${func}(${angle}°) = ${result}`
                ],
                hints: [`השתמש בערכים של זוויות מיוחדות`],
                difficulty: difficulty + 1
            };
        }
    },

    // ✅ NEW: STATISTICS TOPIC
    statistics: {
        mean: (difficulty) => {
            const count = 5;
            const numbers = Array.from({ length: count }, () => Math.floor(Math.random() * 20) + 1);
            const sum = numbers.reduce((a, b) => a + b, 0);
            const mean = Math.round((sum / count) * 100) / 100;

            return {
                problemText: `מצא את הממוצע של: ${numbers.join(', ')}`,
                solution: mean,
                steps: [
                    `חבר את כל המספרים: ${numbers.join(' + ')} = ${sum}`,
                    `חלק במספר האיברים: ${sum} ÷ ${count} = ${mean}`
                ],
                hints: [`ממוצע = סכום כל המספרים חלקי כמות המספרים`],
                difficulty: difficulty
            };
        }
    }
};

class DatabasePopulator {
    constructor() {
        this.db = null;
    }

    async connect() {
        this.db = await open({
            filename: path.join(__dirname, 'nexon.db'),
            driver: sqlite3.Database
        });
        console.log('✅ Connected to database');
    }

    async createTables() {
        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS problems (
                                                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                                                    question TEXT NOT NULL,
                                                    answer TEXT NOT NULL,
                                                    steps TEXT,
                                                    hints TEXT,
                                                    difficulty INTEGER,
                                                    topic TEXT,
                                                    category TEXT,
                                                    subcategory TEXT,
                                                    grade TEXT,
                                                    tier INTEGER,
                                                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_topic ON problems(topic);
            CREATE INDEX IF NOT EXISTS idx_difficulty ON problems(difficulty);
            CREATE INDEX IF NOT EXISTS idx_category ON problems(category);
        `);
        console.log('✅ Tables created');
    }

    async clearProblems() {
        await this.db.run('DELETE FROM problems');
        console.log('🗑️  Cleared existing problems');
    }

    async generateAndInsert(problemsPerType = 100) {
        console.log(`\n🚀 Generating ${problemsPerType} problems per type...\n`);

        const insertStmt = await this.db.prepare(`
            INSERT INTO problems (
                question, answer, steps, hints, difficulty,
                topic, category, subcategory, grade, tier
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        let totalInserted = 0;

        for (const [category, subcategories] of Object.entries(generators)) {
            for (const [subcategory, generator] of Object.entries(subcategories)) {
                console.log(`  Generating ${category}/${subcategory}...`);

                for (let i = 0; i < problemsPerType; i++) {
                    const difficulty = (i % 7) + 1;
                    const problem = generator(difficulty);

                    try {
                        await insertStmt.run(
                            problem.problemText,
                            String(problem.solution),
                            JSON.stringify(problem.steps),
                            JSON.stringify(problem.hints),
                            problem.difficulty,
                            category,
                            category,
                            subcategory,
                            '7-12',
                            problem.difficulty
                        );
                        totalInserted++;
                    } catch (error) {
                        console.error(`    ❌ Error: ${error.message}`);
                    }
                }

                console.log(`    ✓ Added ${problemsPerType} ${category}/${subcategory} problems`);
            }
        }

        await insertStmt.finalize();
        console.log(`\n✅ Total inserted: ${totalInserted} problems`);
    }

    async showStats() {
        const total = await this.db.get('SELECT COUNT(*) as count FROM problems');
        const byTopic = await this.db.all(`
            SELECT topic, COUNT(*) as count
            FROM problems
            GROUP BY topic
            ORDER BY topic
        `);

        console.log('\n📊 Database Statistics:');
        console.log(`  Total: ${total.count} problems\n`);
        console.log('  By Topic:');
        byTopic.forEach(row => {
            console.log(`    ${row.topic}: ${row.count}`);
        });
    }

    async close() {
        await this.db.close();
        console.log('\n✅ Done!\n');
    }
}

async function main() {
    const populator = new DatabasePopulator();

    try {
        await populator.connect();
        await populator.createTables();

        console.log('\n⚠️  This will clear all existing problems!');
        await populator.clearProblems();

        await populator.generateAndInsert(100);

        await populator.showStats();

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await populator.close();
    }
}

main();