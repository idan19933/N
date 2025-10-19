// src/config/gradeLevelsConfig.js - COMPLETE GRADE & TOPIC CONFIGURATION

export const GRADES = {
    GRADE_1: 'grade_1',
    GRADE_2: 'grade_2',
    GRADE_3: 'grade_3',
    GRADE_4: 'grade_4',
    GRADE_5: 'grade_5',
    GRADE_6: 'grade_6',
    GRADE_7: 'grade_7',
    GRADE_8: 'grade_8',
    GRADE_9: 'grade_9'
};

const gradeData = {
    [GRADES.GRADE_1]: {
        id: GRADES.GRADE_1,
        name: 'כיתה א׳',
        emoji: '🎈',
        topics: [
            { id: 'counting', name: 'ספירה עד 20', icon: '🔢' },
            { id: 'addition', name: 'חיבור בסיסי', icon: '➕' },
            { id: 'subtraction', name: 'חיסור בסיסי', icon: '➖' },
            { id: 'shapes', name: 'צורות', icon: '🔺' }
        ]
    },
    [GRADES.GRADE_2]: {
        id: GRADES.GRADE_2,
        name: 'כיתה ב׳',
        emoji: '🎨',
        topics: [
            { id: 'addition_subtraction', name: 'חיבור וחיסור עד 100', icon: '🧮' },
            { id: 'multiplication_intro', name: 'הכרת הכפל', icon: '✖️' },
            { id: 'measurement', name: 'מדידה', icon: '📏' },
            { id: 'time', name: 'שעון', icon: '🕐' }
        ]
    },
    [GRADES.GRADE_3]: {
        id: GRADES.GRADE_3,
        name: 'כיתה ג׳',
        emoji: '🚀',
        topics: [
            { id: 'multiplication', name: 'לוח הכפל', icon: '✖️' },
            { id: 'division', name: 'חילוק', icon: '➗' },
            { id: 'fractions_intro', name: 'שברים פשוטים', icon: '½' },
            { id: 'area_perimeter', name: 'היקף ושטח', icon: '📐' }
        ]
    },
    [GRADES.GRADE_4]: {
        id: GRADES.GRADE_4,
        name: 'כיתה ד׳',
        emoji: '🎯',
        topics: [
            { id: 'fractions', name: 'שברים', icon: '¾' },
            { id: 'decimals', name: 'מספרים עשרוניים', icon: '0.5' },
            { id: 'geometry', name: 'גאומטריה', icon: '📊' },
            { id: 'word_problems', name: 'בעיות מילוליות', icon: '📝' }
        ]
    },
    [GRADES.GRADE_5]: {
        id: GRADES.GRADE_5,
        name: 'כיתה ה׳',
        emoji: '🏆',
        topics: [
            { id: 'fractions_advanced', name: 'פעולות בשברים', icon: '🔢' },
            { id: 'percentages', name: 'אחוזים', icon: '%' },
            { id: 'ratios', name: 'יחסים ופרופורציות', icon: '⚖️' },
            { id: 'algebra_intro', name: 'הכרת האלגברה', icon: 'x' }
        ]
    },
    [GRADES.GRADE_6]: {
        id: GRADES.GRADE_6,
        name: 'כיתה ו׳',
        emoji: '🎓',
        topics: [
            { id: 'negative_numbers', name: 'מספרים שליליים', icon: '➖' },
            { id: 'equations', name: 'משוואות פשוטות', icon: 'x=5' },
            { id: 'statistics', name: 'סטטיסטיקה', icon: '📊' },
            { id: 'volume', name: 'נפח', icon: '🧊' }
        ]
    },
    [GRADES.GRADE_7]: {
        id: GRADES.GRADE_7,
        name: 'כיתה ז׳',
        emoji: '🔬',
        topics: [
            { id: 'linear_equations', name: 'משוואות לינאריות', icon: '📈' },
            { id: 'inequalities', name: 'אי שוויונות', icon: '≠' },
            { id: 'pythagoras', name: 'משפט פיתגורס', icon: '△' },
            { id: 'probability', name: 'הסתברות', icon: '🎲' }
        ]
    },
    [GRADES.GRADE_8]: {
        id: GRADES.GRADE_8,
        name: 'כיתה ח׳',
        emoji: '🧪',
        topics: [
            { id: 'proportions', name: 'פרופורציה ויחסים', icon: '⚖️' },
            { id: 'linear_functions', name: 'פונקציות קוויות', icon: '📊' },
            { id: 'similarity', name: 'דמיון ומשולשים', icon: '△' },
            { id: 'graphs', name: 'גרפים של פונקציות', icon: '📈' }
        ]
    },
    [GRADES.GRADE_9]: {
        id: GRADES.GRADE_9,
        name: 'כיתה ט׳',
        emoji: '🎯',
        topics: [
            { id: 'quadratic_equations', name: 'משוואות ריבועיות', icon: 'x²' },
            { id: 'quadratic_functions', name: 'פונקציות ריבועיות', icon: '📉' },
            { id: 'trigonometry', name: 'טריגונומטריה', icon: '∠' },
            { id: 'circles', name: 'מעגלים', icon: '⭕' }
        ]
    }
};

export function getAllGrades() {
    return Object.values(gradeData);
}

export function getGradeById(gradeId) {
    return gradeData[gradeId] || null;
}

export function getTopicsForGrade(gradeId) {
    const grade = gradeData[gradeId];
    return grade ? grade.topics : [];
}

export function getTopicById(gradeId, topicId) {
    const grade = gradeData[gradeId];
    if (!grade) return null;
    return grade.topics.find(t => t.id === topicId) || null;
}