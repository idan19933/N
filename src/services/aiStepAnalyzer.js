// src/services/aiStepAnalyzer.js - FIXED: Works without Claude API

class AIStepAnalyzer {
    constructor() {
        this.cache = new Map();
        this.useClaudeAPI = false; // Set to true if you have Claude API key
    }

    async analyzeStep(studentInput, problem, previousSteps = []) {
        if (!studentInput || !studentInput.trim()) {
            return {
                stepNumber: 0,
                isCorrect: false,
                confidence: 0,
                feedback: 'נא להזין תשובה • Please enter an answer',
                encouragement: 'בוא נתחיל! • Let\'s start!',
                hint: null,
                nextStepSuggestion: problem.steps?.[0]?.description || problem.steps?.[0] || null
            };
        }

        // Check cache
        const cacheKey = `${problem.id}-${studentInput}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }

        try {
            // Use fallback analysis (no Claude API needed)
            const analysis = this._fallbackAnalysis(studentInput, problem, previousSteps);

            // Cache result
            this.cache.set(cacheKey, analysis);

            // Clear old cache entries (keep last 50)
            if (this.cache.size > 50) {
                const firstKey = this.cache.keys().next().value;
                this.cache.delete(firstKey);
            }

            return analysis;
        } catch (error) {
            console.error('❌ AI Analysis error:', error);
            return this._fallbackAnalysis(studentInput, problem, previousSteps);
        }
    }

    _fallbackAnalysis(studentInput, problem, previousSteps = []) {
        // 🔧 FIX: Convert answer to string safely
        const problemAnswer = String(problem.answer || problem.solution || '');
        const inputLower = String(studentInput).toLowerCase().replace(/\s/g, '');
        const answerLower = problemAnswer.toLowerCase().replace(/\s/g, '');

        // Check if matches final answer
        if (inputLower === answerLower || inputLower.includes(answerLower)) {
            return {
                stepNumber: problem.steps?.length || 0,
                isCorrect: true,
                confidence: 95,
                feedback: '✅ נכון! • Correct!',
                encouragement: 'מעולה! הגעת לתשובה הנכונה! • Excellent! You got the right answer!',
                hint: null,
                nextStepSuggestion: null,
                mistakes: []
            };
        }

        // Try to extract numbers for comparison
        const inputNum = this._extractNumber(studentInput);
        const answerNum = this._extractNumber(problemAnswer);

        if (inputNum !== null && answerNum !== null) {
            const diff = Math.abs(inputNum - answerNum);
            const percentDiff = (diff / Math.abs(answerNum)) * 100;

            // Very close (within 1%)
            if (percentDiff < 1) {
                return {
                    stepNumber: problem.steps?.length || 0,
                    isCorrect: true,
                    confidence: 90,
                    feedback: '✅ כמעט מדויק! • Almost exact!',
                    encouragement: 'מצוין! התשובה נכונה! • Great! The answer is correct!',
                    hint: null,
                    nextStepSuggestion: null,
                    mistakes: []
                };
            }

            // Close (within 10%)
            if (percentDiff < 10) {
                return {
                    stepNumber: 0,
                    isCorrect: false,
                    confidence: 70,
                    feedback: '⚠️ קרוב! יש טעות קטנה • Close! Small mistake',
                    encouragement: 'אתה בכיוון הנכון! בדוק את החישוב שוב • You\'re on the right track! Check your calculation again',
                    hint: problem.hints?.[0] || 'בדוק את החישובים שלך צעד אחר צעד • Check your calculations step by step',
                    nextStepSuggestion: problem.steps?.[0] || null,
                    mistakes: ['הערך קרוב אבל לא מדויק • Value is close but not exact']
                };
            }
        }

        // Check against each step
        if (problem.steps && Array.isArray(problem.steps)) {
            for (let i = 0; i < problem.steps.length; i++) {
                const step = problem.steps[i];
                const stepContent = String(step.content || step.description || step);
                const stepLower = stepContent.toLowerCase().replace(/\s/g, '');

                if (inputLower.includes(stepLower) || stepLower.includes(inputLower)) {
                    return {
                        stepNumber: i + 1,
                        isCorrect: true,
                        confidence: 75,
                        feedback: `✅ שלב ${i + 1} נכון! • Step ${i + 1} correct!`,
                        encouragement: 'כיוון טוב! המשך ככה! • Good direction! Keep going!',
                        hint: step.hint || problem.hints?.[i] || null,
                        nextStepSuggestion: problem.steps[i + 1] || 'סיים את הפתרון • Finish the solution',
                        mistakes: []
                    };
                }
            }
        }

        // Check if input contains any step keywords
        const stepKeywords = this._extractStepKeywords(problem);
        const matchedKeywords = stepKeywords.filter(kw =>
            inputLower.includes(kw.toLowerCase())
        );

        if (matchedKeywords.length > 0) {
            return {
                stepNumber: 0,
                isCorrect: false,
                confidence: 50,
                feedback: '📝 בכיוון הנכון • On the right track',
                encouragement: 'המשך! אתה מתקדם • Keep going! You\'re making progress',
                hint: problem.hints?.[0] || 'המשך לפתור צעד אחר צעד • Continue solving step by step',
                nextStepSuggestion: problem.steps?.[0] || null,
                mistakes: []
            };
        }

        // Generic feedback if no match
        return {
            stepNumber: 0,
            isCorrect: false,
            confidence: 20,
            feedback: '❌ לא נכון • Not correct',
            encouragement: 'נסה שוב! תחשוב על השלבים הבסיסיים • Try again! Think about the basic steps',
            hint: problem.hints?.[0] || problem.steps?.[0] || 'התחל מההתחלה • Start from the beginning',
            nextStepSuggestion: problem.steps?.[0] || null,
            mistakes: ['לא תואם את אף שלב • Doesn\'t match any step']
        };
    }

    _extractNumber(str) {
        // Extract first number from string
        const cleaned = String(str).replace(/[^\d.-]/g, ' ');
        const match = cleaned.match(/-?\d+\.?\d*/);
        if (match) {
            const num = parseFloat(match[0]);
            return isNaN(num) ? null : num;
        }
        return null;
    }

    _extractStepKeywords(problem) {
        // Extract keywords from steps for matching
        const keywords = [];

        if (problem.steps && Array.isArray(problem.steps)) {
            problem.steps.forEach(step => {
                const stepText = String(step.content || step.description || step);
                // Extract mathematical terms
                const terms = stepText.match(/[a-zA-Z0-9+\-*/=()^√]+/g);
                if (terms) {
                    keywords.push(...terms);
                }
            });
        }

        return [...new Set(keywords)]; // Remove duplicates
    }

    getSmartEncouragement(stepNumber, totalSteps, isCorrect, streak = 0) {
        const progress = totalSteps > 0 ? (stepNumber / totalSteps) * 100 : 0;

        if (isCorrect) {
            if (streak >= 3) {
                return [
                    '🔥 וואו! רצף של 3! אתה בוער! • Wow! 3 in a row! You\'re on fire!',
                    '💪 אלוף! המשך ככה! • Champion! Keep it up!',
                    '⭐ מדהים! אתה מומחה! • Amazing! You\'re an expert!'
                ][Math.floor(Math.random() * 3)];
            }

            if (progress < 30) {
                return 'התחלה מצוינת! • Great start!';
            } else if (progress < 70) {
                return 'כיוון מעולה! אתה באמצע הדרך! • Excellent direction! You\'re halfway there!';
            } else {
                return 'כמעט סיימת! עוד קצת! • Almost done! Just a bit more!';
            }
        } else {
            if (progress < 30) {
                return 'זה בסדר, כולם מתחילים פה. בוא ננסה ביחד! • It\'s okay, everyone starts here. Let\'s try together!';
            } else if (progress < 70) {
                return 'אתה כבר הגעת רחוק! לא לוותר עכשיו! • You\'ve come far! Don\'t give up now!';
            } else {
                return 'אתה כל כך קרוב! רק עוד צעד קטן! • You\'re so close! Just one more step!';
            }
        }
    }

    getContextualHint(stepNumber, problem) {
        if (!problem.steps || stepNumber === 0) {
            return problem.hints?.[0] || 'התחל בפירוק הבעיה • Start by breaking down the problem';
        }

        const currentStep = problem.steps[stepNumber - 1];
        if (currentStep?.hint) {
            return currentStep.hint;
        }

        const nextStep = problem.steps[stepNumber];
        if (nextStep) {
            const stepText = nextStep.description || nextStep.content || nextStep;
            return `רמז: ${stepText} • Hint: ${stepText}`;
        }

        return 'כמעט סיימת! בדוק את החישובים • Almost done! Check your calculations';
    }

    async analyzeCompleteSolution(steps, problem) {
        // Simple analysis without Claude API
        const userSteps = steps.filter(s => s.value && s.value.trim());
        const totalSteps = problem.steps?.length || 3;

        const correctSteps = userSteps.filter(s => s.status === 'correct').length;
        const score = Math.round((correctSteps / Math.max(userSteps.length, 1)) * 100);

        return {
            isCorrect: score >= 80,
            score: score,
            strengths: [
                correctSteps > 0 ? 'פתרת מספר שלבים נכון • Solved several steps correctly' : null,
                userSteps.length >= totalSteps ? 'הראית את כל השלבים • Showed all steps' : null
            ].filter(Boolean),
            improvements: [
                score < 80 ? 'בדוק את החישובים שוב • Check calculations again' : null,
                userSteps.length < totalSteps ? 'הוסף שלבים נוספים • Add more steps' : null
            ].filter(Boolean),
            feedback: score >= 80
                ? 'עבודה מצוינת! • Excellent work!'
                : 'עבודה טובה, אבל יש מקום לשיפור • Good work, but room for improvement'
        };
    }

    clearCache() {
        this.cache.clear();
        console.log('✅ AI analysis cache cleared');
    }
}

export const aiStepAnalyzer = new AIStepAnalyzer();
export default AIStepAnalyzer;