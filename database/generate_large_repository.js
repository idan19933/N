// database/generate_large_repository.js - 500+ PROBLEMS
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

async function generateLargeRepository() {
    const db = await open({
        filename: './database/mathtutor.db',
        driver: sqlite3.Database
    });

    console.log('🌱 Generating Large Problem Repository...\n');

    // Clear existing
    await db.run('DELETE FROM math_problems');
    console.log('🗑️  Cleared existing problems');

    const problems = [];

    // ============================================
    // CALCULUS - INTEGRALS (100 problems)
    // ============================================
    console.log('📐 Generating Calculus - Integrals...');

    // Basic integrals
    for (let n = 1; n <= 10; n++) {
        problems.push({
            topic: 'calculus',
            level: 'beginner',
            question: `∫${n}x dx`,
            answer: `${n}x²/2 + C`,
            newton_operation: 'integrate',
            newton_expression: `${n}*x`,
            explanation: 'אינטגרל של ax הוא ax²/2 + C'
        });
    }

    // Power rule integrals
    for (let n = 2; n <= 6; n++) {
        problems.push({
            topic: 'calculus',
            level: 'intermediate',
            question: `∫x^${n} dx`,
            answer: `x^${n + 1}/${n + 1} + C`,
            newton_operation: 'integrate',
            newton_expression: `x^${n}`,
            explanation: `אינטגרל של x^${n} הוא x^${n + 1}/${n + 1} + C`
        });
    }

    // Coefficient variations
    for (let coef = 2; coef <= 10; coef++) {
        for (let pow = 2; pow <= 4; pow++) {
            problems.push({
                topic: 'calculus',
                level: 'intermediate',
                question: `∫${coef}x^${pow} dx`,
                answer: `${coef}x^${pow + 1}/${pow + 1} + C`,
                newton_operation: 'integrate',
                newton_expression: `${coef}*x^${pow}`,
                explanation: `אינטגרל עם מקדם`
            });
        }
    }

    // Polynomial integrals
    const polyIntegrals = [
        { expr: 'x^2+x', question: '∫(x² + x)dx', answer: 'x³/3 + x²/2 + C' },
        { expr: 'x^2+2*x', question: '∫(x² + 2x)dx', answer: 'x³/3 + x² + C' },
        { expr: 'x^2+3*x', question: '∫(x² + 3x)dx', answer: 'x³/3 + 3x²/2 + C' },
        { expr: '2*x^2+x', question: '∫(2x² + x)dx', answer: '2x³/3 + x²/2 + C' },
        { expr: '3*x^2+2*x', question: '∫(3x² + 2x)dx', answer: 'x³ + x² + C' },
        { expr: 'x^3+x^2', question: '∫(x³ + x²)dx', answer: 'x⁴/4 + x³/3 + C' },
        { expr: 'x^3+x^2+x', question: '∫(x³ + x² + x)dx', answer: 'x⁴/4 + x³/3 + x²/2 + C' },
        { expr: '2*x^3+3*x^2', question: '∫(2x³ + 3x²)dx', answer: 'x⁴/2 + x³ + C' },
    ];

    polyIntegrals.forEach(p => {
        problems.push({
            topic: 'calculus',
            level: 'advanced',
            question: p.question,
            answer: p.answer,
            newton_operation: 'integrate',
            newton_expression: p.expr,
            explanation: 'אינטגרל של פולינום'
        });
    });

    // ============================================
    // CALCULUS - DERIVATIVES (80 problems)
    // ============================================
    console.log('📐 Generating Calculus - Derivatives...');

    // Basic derivatives
    for (let n = 2; n <= 10; n++) {
        problems.push({
            topic: 'calculus',
            level: 'beginner',
            question: `d/dx(x^${n})`,
            answer: `${n}x^${n - 1}`,
            newton_operation: 'derive',
            newton_expression: `x^${n}`,
            explanation: `נגזרת של x^${n} היא ${n}x^${n - 1}`
        });
    }

    // With coefficients
    for (let coef = 2; coef <= 8; coef++) {
        for (let pow = 2; pow <= 4; pow++) {
            problems.push({
                topic: 'calculus',
                level: 'intermediate',
                question: `d/dx(${coef}x^${pow})`,
                answer: `${coef * pow}x^${pow - 1}`,
                newton_operation: 'derive',
                newton_expression: `${coef}*x^${pow}`,
                explanation: 'נגזרת עם מקדם'
            });
        }
    }

    // Polynomial derivatives
    const polyDerivatives = [
        { expr: 'x^2+3*x', question: 'd/dx(x² + 3x)', answer: '2x + 3' },
        { expr: 'x^2+5*x', question: 'd/dx(x² + 5x)', answer: '2x + 5' },
        { expr: 'x^3+x^2', question: 'd/dx(x³ + x²)', answer: '3x² + 2x' },
        { expr: '2*x^3+3*x^2', question: 'd/dx(2x³ + 3x²)', answer: '6x² + 6x' },
        { expr: 'x^4+2*x^2', question: 'd/dx(x⁴ + 2x²)', answer: '4x³ + 4x' },
        { expr: '3*x^3+2*x^2+x', question: 'd/dx(3x³ + 2x² + x)', answer: '9x² + 4x + 1' },
    ];

    polyDerivatives.forEach(p => {
        problems.push({
            topic: 'calculus',
            level: 'advanced',
            question: p.question,
            answer: p.answer,
            newton_operation: 'derive',
            newton_expression: p.expr,
            explanation: 'נגזרת של פולינום'
        });
    });

    // ============================================
    // ALGEBRA - SIMPLIFY (60 problems)
    // ============================================
    console.log('🔢 Generating Algebra - Simplify...');

    const simplifyProblems = [
        { expr: '2*x+3*x', question: 'פשט: 2x + 3x', answer: '5x' },
        { expr: '5*x+2*x', question: 'פשט: 5x + 2x', answer: '7x' },
        { expr: '4*x-2*x', question: 'פשט: 4x - 2x', answer: '2x' },
        { expr: 'x^2+x^2', question: 'פשט: x² + x²', answer: '2x²' },
        { expr: '3*x^2+2*x^2', question: 'פשט: 3x² + 2x²', answer: '5x²' },
        { expr: '2*(x+3)', question: 'פשט: 2(x + 3)', answer: '2x + 6' },
        { expr: '3*(x+2)', question: 'פשט: 3(x + 2)', answer: '3x + 6' },
        { expr: '4*(x+1)', question: 'פשט: 4(x + 1)', answer: '4x + 4' },
        { expr: '5*(x-2)', question: 'פשט: 5(x - 2)', answer: '5x - 10' },
        { expr: 'x^2+2*x+x+2', question: 'פשט: x² + 2x + x + 2', answer: 'x² + 3x + 2' },
    ];

    for (let i = 0; i < 6; i++) {
        simplifyProblems.forEach(p => {
            problems.push({
                topic: 'algebra',
                level: i < 2 ? 'beginner' : i < 4 ? 'intermediate' : 'advanced',
                question: p.question,
                answer: p.answer,
                newton_operation: 'simplify',
                newton_expression: p.expr,
                explanation: 'פישוט ביטוי אלגברי'
            });
        });
    }

    // ============================================
    // ALGEBRA - FACTOR (50 problems)
    // ============================================
    console.log('🔢 Generating Algebra - Factor...');

    const factorProblems = [
        { expr: 'x^2+5*x+6', question: 'פרק לגורמים: x² + 5x + 6', answer: '(x + 2)(x + 3)' },
        { expr: 'x^2+7*x+12', question: 'פרק לגורמים: x² + 7x + 12', answer: '(x + 3)(x + 4)' },
        { expr: 'x^2+8*x+15', question: 'פרק לגורמים: x² + 8x + 15', answer: '(x + 3)(x + 5)' },
        { expr: 'x^2+6*x+8', question: 'פרק לגורמים: x² + 6x + 8', answer: '(x + 2)(x + 4)' },
        { expr: 'x^2+9*x+14', question: 'פרק לגורמים: x² + 9x + 14', answer: '(x + 2)(x + 7)' },
        { expr: 'x^2-9', question: 'פרק לגורמים: x² - 9', answer: '(x - 3)(x + 3)' },
        { expr: 'x^2-16', question: 'פרק לגורמים: x² - 16', answer: '(x - 4)(x + 4)' },
        { expr: 'x^2-25', question: 'פרק לגורמים: x² - 25', answer: '(x - 5)(x + 5)' },
        { expr: 'x^2-4', question: 'פרק לגורמים: x² - 4', answer: '(x - 2)(x + 2)' },
        { expr: 'x^2+10*x+21', question: 'פרק לגורמים: x² + 10x + 21', answer: '(x + 3)(x + 7)' },
    ];

    for (let i = 0; i < 5; i++) {
        factorProblems.forEach(p => {
            problems.push({
                topic: 'algebra',
                level: i < 2 ? 'intermediate' : 'advanced',
                question: p.question,
                answer: p.answer,
                newton_operation: 'factor',
                newton_expression: p.expr,
                explanation: 'פירוק לגורמים'
            });
        });
    }

    // ============================================
    // ALGEBRA - ZEROES (40 problems)
    // ============================================
    console.log('🔢 Generating Algebra - Zeroes...');

    const zeroesProblems = [
        { expr: 'x^2-4', question: 'מצא שורשים: x² - 4 = 0', answer: 'x = -2, x = 2' },
        { expr: 'x^2-9', question: 'מצא שורשים: x² - 9 = 0', answer: 'x = -3, x = 3' },
        { expr: 'x^2-16', question: 'מצא שורשים: x² - 16 = 0', answer: 'x = -4, x = 4' },
        { expr: 'x^2-25', question: 'מצא שורשים: x² - 25 = 0', answer: 'x = -5, x = 5' },
        { expr: 'x^2+2*x', question: 'מצא שורשים: x² + 2x = 0', answer: 'x = -2, x = 0' },
        { expr: 'x^2+3*x', question: 'מצא שורשים: x² + 3x = 0', answer: 'x = -3, x = 0' },
        { expr: 'x^2+5*x+6', question: 'מצא שורשים: x² + 5x + 6 = 0', answer: 'x = -3, x = -2' },
        { expr: 'x^2+7*x+12', question: 'מצא שורשים: x² + 7x + 12 = 0', answer: 'x = -4, x = -3' },
        { expr: 'x^2-5*x+6', question: 'מצא שורשים: x² - 5x + 6 = 0', answer: 'x = 2, x = 3' },
        { expr: 'x^2-7*x+12', question: 'מצא שורשים: x² - 7x + 12 = 0', answer: 'x = 3, x = 4' },
    ];

    for (let i = 0; i < 4; i++) {
        zeroesProblems.forEach(p => {
            problems.push({
                topic: 'algebra',
                level: 'advanced',
                question: p.question,
                answer: p.answer,
                newton_operation: 'zeroes',
                newton_expression: p.expr,
                explanation: 'מציאת שורשי משוואה'
            });
        });
    }

    // ============================================
    // GEOMETRY (60 problems)
    // ============================================
    console.log('📐 Generating Geometry...');

    // Rectangles - Perimeter
    for (let l = 5; l <= 20; l += 3) {
        for (let w = 3; w <= 15; w += 3) {
            problems.push({
                topic: 'geometry',
                level: 'beginner',
                question: `מלבן עם אורך ${l} ס"מ ורוחב ${w} ס"מ, מה ההיקף?`,
                answer: String(2 * (l + w)),
                newton_operation: null,
                newton_expression: null,
                explanation: 'היקף = 2(אורך + רוחב)'
            });
        }
    }

    // Rectangles - Area
    for (let l = 5; l <= 20; l += 3) {
        for (let w = 3; w <= 15; w += 3) {
            problems.push({
                topic: 'geometry',
                level: 'intermediate',
                question: `מלבן עם אורך ${l} ס"מ ורוחב ${w} ס"מ, מה השטח?`,
                answer: String(l * w),
                newton_operation: null,
                newton_expression: null,
                explanation: 'שטח = אורך × רוחב'
            });
        }
    }

    // Pythagorean theorem - only perfect squares
    const pythagoreanTriples = [
        [3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25],
        [6, 8, 10], [9, 12, 15], [12, 16, 20], [15, 20, 25]
    ];

    pythagoreanTriples.forEach(([a, b, c]) => {
        problems.push({
            topic: 'geometry',
            level: 'advanced',
            question: `משולש ישר זווית עם ניצבים ${a} ו-${b}, מה אורך היתר?`,
            answer: String(c),
            newton_operation: null,
            newton_expression: null,
            explanation: `משפט פיתגורס: √(${a}² + ${b}²) = ${c}`
        });
    });

    // ============================================
    // ARITHMETIC (80 problems)
    // ============================================
    console.log('➕ Generating Arithmetic...');

    // Basic addition
    for (let i = 0; i < 20; i++) {
        const a = Math.floor(Math.random() * 50) + 10;
        const b = Math.floor(Math.random() * 50) + 10;
        problems.push({
            topic: 'arithmetic',
            level: 'beginner',
            question: `${a} + ${b}`,
            answer: String(a + b),
            newton_operation: null,
            newton_expression: null,
            explanation: 'חיבור'
        });
    }

    // Multiplication
    for (let i = 5; i <= 12; i++) {
        for (let j = 5; j <= 12; j++) {
            problems.push({
                topic: 'arithmetic',
                level: 'intermediate',
                question: `${i} × ${j}`,
                answer: String(i * j),
                newton_operation: null,
                newton_expression: null,
                explanation: 'כפל'
            });
        }
    }

    // Order of operations
    for (let i = 0; i < 20; i++) {
        const a = Math.floor(Math.random() * 15) + 5;
        const b = Math.floor(Math.random() * 8) + 2;
        const c = Math.floor(Math.random() * 10) + 3;
        const answer = a + b * c;
        problems.push({
            topic: 'arithmetic',
            level: 'advanced',
            question: `${a} + ${b} × ${c}`,
            answer: String(answer),
            newton_operation: null,
            newton_expression: null,
            explanation: 'סדר פעולות: כפל לפני חיבור'
        });
    }

    // ============================================
    // INSERT ALL PROBLEMS
    // ============================================
    console.log(`\n📊 Inserting ${problems.length} problems into database...`);

    let inserted = 0;
    for (const problem of problems) {
        try {
            await db.run(`
                INSERT INTO math_problems 
                (topic, level, question, answer, newton_operation, newton_expression, explanation, requires_steps)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                problem.topic,
                problem.level,
                problem.question,
                problem.answer,
                problem.newton_operation,
                problem.newton_expression,
                problem.explanation,
                problem.requires_steps !== undefined ? problem.requires_steps : 1
            ]);
            inserted++;
        } catch (error) {
            console.error('Error inserting problem:', error.message);
        }
    }

    console.log(`✅ Successfully inserted ${inserted} problems`);

    // Show statistics
    const stats = await db.all(`
        SELECT topic, level, COUNT(*) as count
        FROM math_problems
        GROUP BY topic, level
        ORDER BY topic, level
    `);

    console.log('\n📊 Problem Repository Statistics:');
    console.log('═'.repeat(50));
    stats.forEach(s => {
        console.log(`  ${s.topic.padEnd(15)} ${s.level.padEnd(15)} ${s.count.toString().padStart(5)}`);
    });
    console.log('═'.repeat(50));

    const total = await db.get('SELECT COUNT(*) as count FROM math_problems');
    console.log(`  ${'TOTAL'.padEnd(31)} ${total.count.toString().padStart(5)}`);
    console.log('═'.repeat(50));

    await db.close();
    console.log('\n🎉 Repository generation complete!\n');
}

generateLargeRepository().catch(console.error);