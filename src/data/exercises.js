// src/data/exercises.js - COMPLETE
export const exercises = {
    fractions: {
        beginner: [
            {
                id: "frac-1",
                question: "Solve: 1/2 + 1/4",
                correctAnswer: "3/4",
                expectedSteps: [
                    "Find common denominator",
                    "Convert fractions",
                    "Add numerators",
                    "Simplify if needed"
                ],
                commonMistakes: [
                    { pattern: /1\/2\s*\+\s*1\/4\s*=\s*2\/6/, hint: "❌ Don't add numerators and denominators directly! You need a common denominator first." },
                    { pattern: /denominator.*8/, hint: "⚠️ 8 works, but 4 is simpler! Always use the smallest common denominator." },
                ]
            },
            {
                id: "frac-2",
                question: "Solve: 2/3 + 1/6",
                correctAnswer: "5/6",
                expectedSteps: [
                    "Common denominator is 6",
                    "Convert 2/3 to 4/6",
                    "Add: 4/6 + 1/6 = 5/6"
                ],
                hint: "The denominator 6 is already a common denominator. What is 2/3 in sixths?"
            },
            {
                id: "frac-3",
                question: "Solve: 3/4 × 2/5",
                correctAnswer: "6/20 or 3/10",
                expectedSteps: [
                    "Multiply numerators",
                    "Multiply denominators",
                    "Simplify the result"
                ],
                commonMistakes: [
                    { pattern: /3\/4\s*\+\s*2\/5/, hint: "❌ This is multiplication, not addition! Multiply straight across." },
                    { pattern: /6\/20/, hint: "✓ Correct! But can you simplify? Both 6 and 20 are divisible by 2." },
                ]
            }
        ]
    },
    algebra: {
        beginner: [
            {
                id: "alg-1",
                question: "Solve for x: 2x + 5 = 13",
                correctAnswer: "x = 4",
                expectedSteps: [
                    "Subtract 5 from both sides",
                    "Get 2x = 8",
                    "Divide both sides by 2",
                    "x = 4"
                ],
                commonMistakes: [
                    { pattern: /2x\s*=\s*18/, hint: "❌ When you move +5 to the right side, it becomes -5, not +5!" },
                    { pattern: /x\s*=\s*8/, hint: "❌ Don't forget to divide by the coefficient 2!" },
                    { pattern: /2x\s*=\s*8/, hint: "✓ Good! Now divide both sides by 2 to isolate x." },
                ]
            },
            {
                id: "alg-2",
                question: "Solve for x: x - 7 = 3",
                correctAnswer: "x = 10",
                expectedSteps: [
                    "Add 7 to both sides",
                    "x = 10"
                ],
                commonMistakes: [
                    { pattern: /x\s*=\s*-4/, hint: "❌ When moving -7, it becomes +7, not -7!" },
                ],
                hint: "When you move -7 to the other side, what does it become?"
            },
            {
                id: "alg-3",
                question: "Solve for x: 3x - 4 = 11",
                correctAnswer: "x = 5",
                expectedSteps: [
                    "Add 4 to both sides: 3x = 15",
                    "Divide both sides by 3: x = 5"
                ],
                hint: "First isolate the term with x by moving the constant."
            }
        ]
    }
};

export const getRandomExercise = (topic, level = 'beginner') => {
    const topicExercises = exercises[topic]?.[level] || [];
    if (topicExercises.length === 0) {
        return {
            id: "default-1",
            question: "2 + 2 = ?",
            correctAnswer: "4",
            expectedSteps: ["Add the numbers"],
            hint: "Simple addition"
        };
    }

    const randomIndex = Math.floor(Math.random() * topicExercises.length);
    return topicExercises[randomIndex];
};