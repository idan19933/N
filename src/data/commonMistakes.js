// src/data/commonMistakes.js - COMPLETE
export const detectMistake = (topic, studentWork, correctAnswer) => {
    if (topic === 'fractions') {
        // Check for adding numerators and denominators directly
        if (studentWork.match(/(\d+\/\d+)\s*\+\s*(\d+\/\d+)\s*=\s*(\d+\/\d+)/)) {
            const parts = studentWork.match(/(\d+)\/(\d+)\s*\+\s*(\d+)\/(\d+)\s*=\s*(\d+)\/(\d+)/);
            if (parts) {
                const [_, n1, d1, n2, d2, nr, dr] = parts;
                if (parseInt(nr) === parseInt(n1) + parseInt(n2) &&
                    parseInt(dr) === parseInt(d1) + parseInt(d2)) {
                    return {
                        mistake: "Adding numerators and denominators directly",
                        hint: "Remember: You need a common denominator first! You can't just add straight across.",
                        correction: "Find the common denominator, then add the numerators."
                    };
                }
            }
        }
    }

    if (topic === 'algebra') {
        // Check for sign errors
        if (studentWork.includes('-') && !correctAnswer.includes('-')) {
            return {
                mistake: "Sign error when moving terms",
                hint: "When moving a number to the other side, flip its sign!",
                correction: "If subtracting becomes adding, if adding becomes subtracting."
            };
        }
    }

    return null;
};