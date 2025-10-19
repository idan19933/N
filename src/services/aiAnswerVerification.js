// src/services/aiAnswerVerification.js - SMART VERIFICATION WITH CLEAN LOGS

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

// Enable/disable debug logging
const DEBUG = false; // Set to true for detailed logs

const log = (...args) => {
    if (DEBUG) console.log(...args);
};

class AIAnswerVerification {
    constructor() {
        log('✅ AI Verification initialized with backend:', API_BASE_URL);
    }

    normalize(answer) {
        if (!answer) return '';

        return String(answer)
            .toLowerCase()
            .trim()
            .replace(/\+\-/g, '±')
            .replace(/\+-/g, '±')
            .replace(/\+ \-/g, '±')
            .replace(/\+\/-/g, '±')
            .replace(/\s+/g, '')
            .replace(/[×]/g, '*')
            .replace(/[÷]/g, '/')
            .replace(/[−]/g, '-')
            .replace(/או/g, 'or');
    }

    checkQuadrantAnswer(userAnswer, correctAnswer, question) {
        const pointMatch = question.match(/\((-?\d+),?\s*(-?\d+)\)/);

        if (pointMatch) {
            const x = parseFloat(pointMatch[1]);
            const y = parseFloat(pointMatch[2]);

            let actualQuadrant;
            if (x > 0 && y > 0) actualQuadrant = 1;
            else if (x < 0 && y > 0) actualQuadrant = 2;
            else if (x < 0 && y < 0) actualQuadrant = 3;
            else if (x > 0 && y < 0) actualQuadrant = 4;
            else return null;

            const userNum = parseInt(userAnswer);

            log('🔍 Quadrant Check:', { point: `(${x}, ${y})`, actualQuadrant, userAnswer: userNum });

            const isCorrect = userNum === actualQuadrant;

            return {
                needsAI: false,
                isCorrect,
                isPartial: false,
                confidence: 100,
                method: 'quadrant_check',
                explanation: isCorrect
                    ? `נכון! הנקודה (${x}, ${y}) נמצאת ברביע ${actualQuadrant}`
                    : `לא נכון. הנקודה (${x}, ${y}) נמצאת ברביע ${actualQuadrant}, לא ברביע ${userNum}. זכור: x${x < 0 ? '<0' : '>0'} ו-y${y < 0 ? '<0' : '>0'}`
            };
        }

        return null;
    }

    checkAlgebraicExpansion(userAnswer, correctAnswer, question) {
        if (!question.match(/פתח\s+סוגריים|הוצא\s+גורם/i)) return null;

        const userNorm = this.normalize(userAnswer);
        const correctNorm = this.normalize(correctAnswer);

        const extractTerms = (expr) => {
            const xMatch = expr.match(/(-?\d*)x/);
            const constMatch = expr.match(/[+-]?\d+(?!x)/);
            return {
                xCoeff: xMatch ? (xMatch[1] === '' || xMatch[1] === '+' ? 1 : xMatch[1] === '-' ? -1 : parseInt(xMatch[1])) : 0,
                constant: constMatch ? parseInt(constMatch[0]) : 0
            };
        };

        const userTerms = extractTerms(userNorm);
        const correctTerms = extractTerms(correctNorm);

        log('🔍 Algebraic Check:', { userTerms, correctTerms });

        const xCorrect = userTerms.xCoeff === correctTerms.xCoeff;
        const constCorrect = userTerms.constant === correctTerms.constant;

        if (xCorrect && constCorrect) {
            return {
                needsAI: false,
                isCorrect: true,
                isPartial: false,
                confidence: 100,
                method: 'algebraic_expansion',
                explanation: 'נכון! פתחת את הסוגריים בצורה מושלמת! 🎉'
            };
        } else if (xCorrect && !constCorrect) {
            return {
                needsAI: false,
                isCorrect: false,
                isPartial: true,
                confidence: 90,
                method: 'algebraic_expansion_partial',
                whatCorrect: `הכפלת את המשתנה נכון (${correctTerms.xCoeff}x)`,
                whatMissing: `אבל לא הכפלת את המספר הקבוע! צריך גם ${correctTerms.constant}`,
                explanation: `כמעט! תשים לב - צריך להכפיל את כל האיברים. התשובה הנכונה: ${correctAnswer}`
            };
        } else if (!xCorrect && constCorrect) {
            return {
                needsAI: false,
                isCorrect: false,
                isPartial: true,
                confidence: 90,
                method: 'algebraic_expansion_partial',
                whatCorrect: `הכפלת את הקבוע נכון (${correctTerms.constant})`,
                whatMissing: `אבל לא הכפלת את המשתנה נכון! צריך ${correctTerms.xCoeff}x`,
                explanation: `כמעט! תשים לב לפתיחת הסוגריים. התשובה הנכונה: ${correctAnswer}`
            };
        } else {
            return {
                needsAI: false,
                isCorrect: false,
                isPartial: false,
                confidence: 95,
                method: 'algebraic_expansion_wrong',
                explanation: `לא נכון. כשפותחים סוגריים, צריך להכפיל את המקדם בכל איבר. התשובה הנכונה: ${correctAnswer}`
            };
        }
    }

    preCheckAnswer(userAnswer, correctAnswer, subtopic, question) {
        const userNorm = this.normalize(userAnswer);
        const correctNorm = this.normalize(correctAnswer);

        log('🔍 Pre-check:', { userNorm, correctNorm, subtopic });

        // Quadrant questions
        if (subtopic === 'coordinate-system' || question?.includes('רביע')) {
            const quadrantCheck = this.checkQuadrantAnswer(userAnswer, correctAnswer, question);
            if (quadrantCheck) return quadrantCheck;
        }

        // Algebraic expansion
        if (question?.match(/פתח\s+סוגריים|הוצא\s+גורם/i)) {
            const algebraicCheck = this.checkAlgebraicExpansion(userAnswer, correctAnswer, question);
            if (algebraicCheck) return algebraicCheck;
        }

        // Exact match
        if (userNorm === correctNorm) {
            return {
                needsAI: false,
                isCorrect: true,
                isPartial: false,
                confidence: 100,
                method: 'exact_match'
            };
        }

        // Multiple answers (x = 2 או x = -3)
        if (correctNorm.includes('or') || correctNorm.includes('±')) {
            const correctParts = correctNorm.split(/or|,|;/).map(p => p.trim()).filter(p => p);
            const userParts = userNorm.split(/or|,|;/).map(p => p.trim()).filter(p => p);

            if (correctParts.length > 1) {
                if (userParts.length > 1) {
                    const allCorrect = userParts.every(up => correctParts.some(cp => up === cp || cp.includes(up)));
                    const hasAll = correctParts.every(cp => userParts.some(up => up === cp || up.includes(cp)));

                    if (allCorrect && hasAll) {
                        return {
                            needsAI: false,
                            isCorrect: true,
                            isPartial: false,
                            confidence: 100,
                            method: 'multiple_answers_complete'
                        };
                    } else if (allCorrect) {
                        return {
                            needsAI: false,
                            isCorrect: false,
                            isPartial: true,
                            confidence: 85,
                            method: 'multiple_answers_partial',
                            whatMissing: `חסר חלק מהפתרונות. התשובה המלאה: ${correctAnswer}`
                        };
                    }
                } else {
                    const hasOne = correctParts.some(cp => userNorm === cp || cp.includes(userNorm));

                    if (hasOne) {
                        return {
                            needsAI: false,
                            isCorrect: false,
                            isPartial: true,
                            confidence: 85,
                            method: 'single_answer_of_multiple',
                            whatCorrect: `מצאת פתרון אחד נכון`,
                            whatMissing: `במשוואה זו יש יותר מפתרון אחד! התשובה המלאה: ${correctAnswer}`
                        };
                    }
                }
            }
        }

        // Complex expressions - need AI
        if (userNorm.includes('x') || userNorm.includes('(')) {
            return {
                needsAI: true,
                isCorrect: false,
                confidence: 0,
                method: 'needs_ai_algebraic'
            };
        }

        return {
            needsAI: true,
            isCorrect: false,
            confidence: 0,
            method: 'needs_ai'
        };
    }

    async verifyAnswer(userAnswer, correctAnswer, question, context = {}) {
        try {
            log('━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            log('🔍 VERIFICATION');
            log('   User:', userAnswer, '| Expected:', correctAnswer);

            // 1. Pre-check
            const preCheck = this.preCheckAnswer(userAnswer, correctAnswer, context.subtopic, question);

            if (!preCheck.needsAI) {
                log('✅ Pre-check:', preCheck.method);

                return {
                    isCorrect: preCheck.isCorrect,
                    isPartial: preCheck.isPartial || false,
                    confidence: preCheck.confidence,
                    method: preCheck.method,
                    feedback: this.generateFeedback(preCheck.isCorrect, preCheck.isPartial, context.studentName),
                    explanation: preCheck.explanation || (preCheck.isCorrect
                        ? 'התשובה נכונה! 🎉'
                        : preCheck.isPartial
                            ? preCheck.whatMissing || 'התשובה חלקית'
                            : 'התשובה לא נכונה'),
                    whatCorrect: preCheck.whatCorrect,
                    whatMissing: preCheck.whatMissing,
                    usedAI: false
                };
            }

            // 2. AI verification
            log('🤖 Using AI...');

            try {
                const response = await fetch(`${API_BASE_URL}/api/ai/verify-answer`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        question,
                        userAnswer,
                        correctAnswer,
                        studentName: context.studentName || 'תלמיד',
                        grade: context.grade,
                        topic: context.topic,
                        subtopic: context.subtopic
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const data = await response.json();

                if (!data.success) {
                    throw new Error(data.error || 'Verification failed');
                }

                log('✅ AI verified:', data.isCorrect);

                return {
                    isCorrect: data.isCorrect,
                    isPartial: data.isPartial || false,
                    confidence: data.confidence || 95,
                    feedback: data.feedback,
                    explanation: data.explanation,
                    whatCorrect: data.whatCorrect,
                    whatMissing: data.whatMissing,
                    usedAI: true,
                    method: 'ai_verification'
                };

            } catch (aiError) {
                console.warn('⚠️ AI failed:', aiError.message);
                throw aiError;
            }

        } catch (error) {
            console.error('❌ Verification error:', error.message);

            // 3. Fallback
            log('🔄 Using fallback...');
            const fallback = this.smartFallback(userAnswer, correctAnswer, question, context.subtopic);

            return {
                ...fallback,
                method: 'smart_fallback',
                usedAI: false
            };
        }
    }

    generateFeedback(isCorrect, isPartial, studentName = 'תלמיד') {
        const name = studentName || 'תלמיד';

        if (isCorrect) {
            const msgs = [
                `יפה מאוד ${name}! 🎉`,
                `מצוין ${name}! ⭐`,
                `כל הכבוד ${name}! 💯`,
                `מעולה ${name}! 🌟`
            ];
            return msgs[Math.floor(Math.random() * msgs.length)];
        }

        if (isPartial) {
            return `כמעט ${name}! 👍`;
        }

        return `נסה שוב ${name}! 💪`;
    }

    smartFallback(userAnswer, correctAnswer, question, subtopic) {
        const userNorm = this.normalize(userAnswer);
        const correctNorm = this.normalize(correctAnswer);

        // Check quadrants
        if (subtopic === 'coordinate-system' || question?.includes('רביע')) {
            const quadrantCheck = this.checkQuadrantAnswer(userAnswer, correctAnswer, question);
            if (quadrantCheck) {
                return {
                    isCorrect: quadrantCheck.isCorrect,
                    isPartial: false,
                    confidence: 100,
                    feedback: quadrantCheck.isCorrect ? 'נכון! 🎉' : 'לא נכון',
                    explanation: quadrantCheck.explanation
                };
            }
        }

        // Check algebraic
        if (question?.match(/פתח\s+סוגריים|הוצא\s+גורם/i)) {
            const algebraicCheck = this.checkAlgebraicExpansion(userAnswer, correctAnswer, question);
            if (algebraicCheck) {
                return {
                    isCorrect: algebraicCheck.isCorrect,
                    isPartial: algebraicCheck.isPartial,
                    confidence: algebraicCheck.confidence,
                    feedback: algebraicCheck.isCorrect ? 'נכון! 🎉' : 'לא נכון',
                    explanation: algebraicCheck.explanation,
                    whatCorrect: algebraicCheck.whatCorrect,
                    whatMissing: algebraicCheck.whatMissing
                };
            }
        }

        // Exact match
        if (userNorm === correctNorm) {
            return {
                isCorrect: true,
                isPartial: false,
                confidence: 95,
                feedback: 'נכון! 🎉',
                explanation: 'התשובה זהה!'
            };
        }

        // Numeric check
        const userNum = parseFloat(userAnswer);
        const correctNum = parseFloat(correctAnswer);

        if (!isNaN(userNum) && !isNaN(correctNum)) {
            if (Math.abs(userNum - correctNum) < 0.01) {
                return {
                    isCorrect: true,
                    isPartial: false,
                    confidence: 95,
                    feedback: 'נכון! ✓',
                    explanation: `${userAnswer} ≈ ${correctAnswer}`
                };
            }
        }

        // Quadratic partial
        if (question.includes('x²') || subtopic === 'quadratic-basic') {
            if (correctNorm.includes('±') || correctNorm.includes('or')) {
                const parts = correctNorm.split(/±|or/).map(p => p.trim()).filter(p => p);
                const hasOne = parts.some(p => userNorm.includes(p) || p.includes(userNorm));

                if (hasOne) {
                    return {
                        isCorrect: false,
                        isPartial: true,
                        confidence: 80,
                        feedback: 'כמעט!',
                        explanation: 'במשוואה ריבועית יש שני פתרונות!',
                        whatCorrect: 'מצאת פתרון אחד',
                        whatMissing: `התשובה המלאה: ${correctAnswer}`
                    };
                }
            }
        }

        // Fractions
        if (userAnswer.includes('/') && correctAnswer.includes('/')) {
            try {
                const [un, ud] = userAnswer.split('/').map(n => parseFloat(n.trim()));
                const [cn, cd] = correctAnswer.split('/').map(n => parseFloat(n.trim()));

                if (!isNaN(un) && !isNaN(ud) && !isNaN(cn) && !isNaN(cd)) {
                    if (Math.abs((un / ud) - (cn / cd)) < 0.001) {
                        return {
                            isCorrect: true,
                            isPartial: false,
                            confidence: 90,
                            feedback: 'נכון! ✓',
                            explanation: `${userAnswer} שקול ל-${correctAnswer}`
                        };
                    }
                }
            } catch (e) {
                // Continue
            }
        }

        // Wrong
        return {
            isCorrect: false,
            isPartial: false,
            confidence: 80,
            feedback: 'נסה שוב 💪',
            explanation: `התשובה הנכונה: ${correctAnswer}`
        };
    }

    async verifyWithFallback(userAnswer, correctAnswer, question, smartVerificationService, context = {}) {
        return this.verifyAnswer(userAnswer, correctAnswer, question, context);
    }
}

export const aiVerification = new AIAnswerVerification();
export default aiVerification;