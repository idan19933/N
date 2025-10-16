// src/services/intelligentValidator.js - SMART VALIDATION WITH NEWTON + CUSTOM

class IntelligentValidator {
    constructor() {
        this.newtonApiUrl = 'https://newton.now.sh/api/v2';
        this.tolerances = {
            exact: 0,
            low: 0.01,
            medium: 0.1,
            high: 1.0
        };
    }

    // Main validation function
    async validateAnswer(problem, userAnswer, currentStep = null) {
        try {
            // Determine validation strategy
            const strategy = this.getValidationStrategy(problem);

            let result;
            switch (strategy) {
                case 'newton':
                    result = await this.validateWithNewton(problem, userAnswer);
                    break;
                case 'custom':
                    result = this.validateCustom(problem, userAnswer);
                    break;
                case 'hybrid':
                    result = await this.validateHybrid(problem, userAnswer);
                    break;
                default:
                    result = this.validateBasic(problem, userAnswer);
            }

            // Add step detection if provided
            if (currentStep !== null && problem.steps) {
                result.stepAnalysis = this.analyzeStep(problem, userAnswer, currentStep);
            }

            return result;
        } catch (error) {
            console.error('Validation error:', error);
            return {
                isCorrect: false,
                error: 'שגיאה בבדיקת התשובה',
                strategy: 'error'
            };
        }
    }

    // Determine which validation strategy to use
    getValidationStrategy(problem) {
        // Newton API can handle: simplify, factor, derive, integrate, zeroes, tangent, area, cos, sin, tan, arccos, arcsin, arctan, abs, log
        if (problem.newtonCompatible && problem.newtonExpression) {
            return 'newton';
        }

        if (problem.category === 'calculus' && problem.operation) {
            return 'newton';
        }

        if (problem.category === 'algebra' && problem.subcategory === 'linear') {
            return 'newton';
        }

        if (['geometry', 'statistics', 'combinatorics', 'trigonometry'].includes(problem.category)) {
            return 'custom';
        }

        return 'basic';
    }

    // Validate using Newton API
    async validateWithNewton(problem, userAnswer) {
        try {
            const operation = this.getNewtonOperation(problem);
            const expression = problem.newtonExpression || problem.newton_expression;

            const response = await fetch(`${this.newtonApiUrl}/${operation}/${encodeURIComponent(expression)}`);

            if (!response.ok) {
                // Fallback to custom validation
                return this.validateCustom(problem, userAnswer);
            }

            const data = await response.json();
            const correctAnswer = data.result;

            // Parse and compare
            const isCorrect = this.compareAnswers(userAnswer, correctAnswer, 'medium');

            return {
                isCorrect,
                correctAnswer,
                userAnswer,
                strategy: 'newton',
                explanation: isCorrect
                    ? 'נכון! התשובה מדויקת.'
                    : `לא מדויק. התשובה הנכונה היא: ${correctAnswer}`,
                newtonData: data
            };
        } catch (error) {
            console.error('Newton API error:', error);
            // Fallback to custom
            return this.validateCustom(problem, userAnswer);
        }
    }

    // Get Newton operation type
    getNewtonOperation(problem) {
        if (problem.operation) {
            return problem.operation; // 'derive', 'integrate', etc.
        }

        if (problem.newton_operation) {
            return problem.newton_operation;
        }

        if (problem.category === 'algebra') {
            if (problem.subcategory === 'quadratic') return 'zeroes';
            if (problem.subcategory === 'rational') return 'simplify';
            return 'simplify';
        }

        return 'simplify';
    }

    // Custom validation logic
    validateCustom(problem, userAnswer) {
        const cleanAnswer = this.cleanAnswer(userAnswer);
        const solutionStr = problem.solution || problem.answer;
        const cleanCorrect = this.cleanAnswer(String(solutionStr));

        // Try exact match first
        if (cleanAnswer === cleanCorrect) {
            return {
                isCorrect: true,
                correctAnswer: solutionStr,
                userAnswer,
                strategy: 'custom',
                explanation: 'מצוין! התשובה נכונה!'
            };
        }

        // Try numerical comparison
        const userNum = this.parseNumber(cleanAnswer);
        const correctNum = this.parseNumber(cleanCorrect);

        if (userNum !== null && correctNum !== null) {
            const isClose = Math.abs(userNum - correctNum) < this.tolerances.medium;

            return {
                isCorrect: isClose,
                correctAnswer: solutionStr,
                userAnswer,
                strategy: 'custom_numeric',
                explanation: isClose
                    ? 'נכון! התשובה קרובה מספיק.'
                    : `לא נכון. התשובה הנכונה היא: ${solutionStr}`,
                diff: Math.abs(userNum - correctNum)
            };
        }

        // Try array/multiple solutions
        if (Array.isArray(solutionStr)) {
            const userNums = this.parseMultipleAnswers(cleanAnswer);
            const correctNums = solutionStr.map(s => parseFloat(s));

            const matches = this.compareArrays(userNums, correctNums);

            return {
                isCorrect: matches,
                correctAnswer: solutionStr,
                userAnswer,
                strategy: 'custom_array',
                explanation: matches
                    ? 'נכון! כל השורשים נכונים!'
                    : `לא נכון. השורשים הנכונים: ${solutionStr.join(', ')}`
            };
        }

        // Fallback
        return {
            isCorrect: false,
            correctAnswer: solutionStr,
            userAnswer,
            strategy: 'custom_fallback',
            explanation: `התשובה הנכונה היא: ${solutionStr}`
        };
    }

    // Hybrid validation (try Newton, fallback to custom)
    async validateHybrid(problem, userAnswer) {
        const newtonResult = await this.validateWithNewton(problem, userAnswer);

        if (newtonResult.strategy === 'newton' && !newtonResult.error) {
            return newtonResult;
        }

        return this.validateCustom(problem, userAnswer);
    }

    // Basic validation (direct comparison)
    validateBasic(problem, userAnswer) {
        const solutionStr = problem.solution || problem.answer;
        const cleanAnswer = this.cleanAnswer(userAnswer);
        const cleanCorrect = this.cleanAnswer(String(solutionStr));

        const isCorrect = cleanAnswer === cleanCorrect;

        return {
            isCorrect,
            correctAnswer: solutionStr,
            userAnswer,
            strategy: 'basic',
            explanation: isCorrect
                ? 'נכון!'
                : `התשובה הנכונה היא: ${solutionStr}`
        };
    }

    // Analyze which step the student is on
    analyzeStep(problem, userAnswer, currentStep) {
        if (!problem.steps || currentStep >= problem.steps.length) {
            return {
                step: currentStep,
                isComplete: true,
                message: 'השלמת את כל השלבים!'
            };
        }

        const stepContent = problem.steps[currentStep];

        // Check if user's answer matches the current step
        const userClean = this.cleanAnswer(userAnswer);
        const stepClean = this.cleanAnswer(String(stepContent));

        // Extract numbers from step
        const stepNumbers = this.extractNumbers(String(stepContent));
        const userNumbers = this.extractNumbers(userAnswer);

        const hasMatchingNumbers = stepNumbers.some(sn =>
            userNumbers.some(un => Math.abs(parseFloat(sn) - parseFloat(un)) < 0.1)
        );

        return {
            step: currentStep,
            stepDescription: stepContent,
            isOnTrack: hasMatchingNumbers || userClean.includes(stepClean),
            progress: ((currentStep + 1) / problem.steps.length * 100).toFixed(0),
            nextStep: currentStep < problem.steps.length - 1 ? problem.steps[currentStep + 1] : null,
            message: this.getStepMessage(currentStep, problem.steps.length, hasMatchingNumbers)
        };
    }

    // Generate step-based message
    getStepMessage(currentStep, totalSteps, isOnTrack) {
        const progress = ((currentStep + 1) / totalSteps * 100).toFixed(0);

        if (currentStep === 0) {
            return isOnTrack
                ? '🎯 התחלה מעולה! אתה בכיוון הנכון!'
                : '💭 נסה לחשוב על השלב הראשון של הפתרון';
        }

        if (currentStep < totalSteps / 2) {
            return isOnTrack
                ? `✨ יפה! ${progress}% מהדרך - המשך כך!`
                : '🤔 חשוב שוב על השלב הזה';
        }

        if (currentStep < totalSteps - 1) {
            return isOnTrack
                ? `🔥 כמעט שם! ${progress}% - עוד קצת!`
                : '💪 אתה קרוב! נסה שוב';
        }

        return isOnTrack
            ? '🌟 מעולה! השלב האחרון!'
            : '🎓 כמעט סיימת! עוד מעט!';
    }

    // Helper: Clean answer for comparison
    cleanAnswer(answer) {
        if (typeof answer !== 'string') {
            answer = String(answer);
        }
        return answer
            .toLowerCase()
            .replace(/\s+/g, '')
            .replace(/[^\w\d\.\-\+\=\^\*\/\(\)]/g, '');
    }

    // Helper: Parse number from string
    parseNumber(str) {
        const match = String(str).match(/-?\d+\.?\d*/);
        if (match) {
            const num = parseFloat(match[0]);
            return isNaN(num) ? null : num;
        }
        return null;
    }

    // Helper: Parse multiple answers (e.g., "x=2, x=3")
    parseMultipleAnswers(str) {
        const numbers = String(str).match(/-?\d+\.?\d*/g);
        return numbers ? numbers.map(n => parseFloat(n)).filter(n => !isNaN(n)) : [];
    }

    // Helper: Extract all numbers from string
    extractNumbers(str) {
        const numbers = String(str).match(/-?\d+\.?\d*/g);
        return numbers || [];
    }

    // Helper: Compare two arrays
    compareArrays(arr1, arr2, tolerance = 0.1) {
        if (arr1.length !== arr2.length) return false;

        const sorted1 = [...arr1].sort((a, b) => a - b);
        const sorted2 = [...arr2].sort((a, b) => a - b);

        return sorted1.every((val, idx) =>
            Math.abs(val - sorted2[idx]) < tolerance
        );
    }

    // Helper: Compare two answers with tolerance
    compareAnswers(answer1, answer2, toleranceLevel = 'medium') {
        const clean1 = this.cleanAnswer(answer1);
        const clean2 = this.cleanAnswer(answer2);

        // Exact match
        if (clean1 === clean2) return true;

        // Numerical comparison
        const num1 = this.parseNumber(clean1);
        const num2 = this.parseNumber(clean2);

        if (num1 !== null && num2 !== null) {
            return Math.abs(num1 - num2) < this.tolerances[toleranceLevel];
        }

        return false;
    }

    // Get hint based on user's progress
    getContextualHint(problem, userAnswer, attemptCount) {
        if (!problem.hints || attemptCount === 0) {
            return null;
        }

        // Progressive hints based on attempts
        const hintIndex = Math.min(attemptCount - 1, problem.hints.length - 1);

        if (attemptCount === 1) {
            return {
                level: 'gentle',
                hint: problem.hints[0],
                message: '💡 רמז קטן:'
            };
        }

        if (attemptCount === 2) {
            return {
                level: 'medium',
                hint: problem.hints[Math.min(1, problem.hints.length - 1)],
                message: '🔍 רמז נוסף:'
            };
        }

        if (attemptCount >= 3) {
            return {
                level: 'strong',
                hint: problem.hints[hintIndex],
                message: '🎯 רמז מפורט:',
                showStep: problem.steps ? problem.steps[0] : null
            };
        }

        return null;
    }

    // Get detailed feedback
    getDetailedFeedback(problem, userAnswer, isCorrect) {
        const feedback = {
            isCorrect,
            message: '',
            encouragement: '',
            nextSteps: ''
        };

        if (isCorrect) {
            const messages = [
                'מצוין! התשובה נכונה לחלוטין! 🎉',
                'נהדר! פתרת את השאלה בצורה מושלמת! ⭐',
                'כל הכבוד! התשובה מדויקת! 🌟',
                'יפה מאוד! זה בדיוק נכון! 🎯'
            ];
            feedback.message = messages[Math.floor(Math.random() * messages.length)];
            feedback.nextSteps = 'מוכן לשאלה הבאה?';
        } else {
            const userNum = this.parseNumber(this.cleanAnswer(userAnswer));
            const correctNum = this.parseNumber(String(problem.solution || problem.answer));

            if (userNum !== null && correctNum !== null) {
                const diff = Math.abs(userNum - correctNum);

                if (diff < 1) {
                    feedback.message = '🔸 קרוב מאוד! יש טעות קטנה בחישוב.';
                    feedback.encouragement = 'בדוק שוב את השלבים האחרונים';
                } else if (diff < 5) {
                    feedback.message = '🔹 בכיוון הנכון, אבל יש שגיאה.';
                    feedback.encouragement = 'עבור על הפתרון צעד אחר צעד';
                } else {
                    feedback.message = '💭 נסה גישה אחרת.';
                    feedback.encouragement = 'חשוב על השיטה הבסיסית לפתרון';
                }
            } else {
                feedback.message = '❌ התשובה לא נכונה.';
                feedback.encouragement = 'נסה שוב או בקש רמז';
            }

            feedback.nextSteps = `התשובה הנכונה: ${problem.solution || problem.answer}`;
        }

        return feedback;
    }
}

export const intelligentValidator = new IntelligentValidator();