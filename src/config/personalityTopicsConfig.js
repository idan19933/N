// src/config/personalityTopicsConfig.js - PERSONALITY-BASED TOPIC CONFIGURATION

export const PERSONALITY_TOPICS = {
    'נקסון': {
        name: 'נקסון',
        emoji: '👨‍🏫',
        description: 'מתמחה בכל התחומים',
        specialties: ['כללי'],
        grades: ['grade_1', 'grade_2', 'grade_3', 'grade_4', 'grade_5', 'grade_6', 'grade_7', 'grade_8', 'grade_9'],
        topicsByGrade: {
            'grade_8': ['proportions', 'linear_functions', 'similarity', 'graphs'],
            'grade_9': ['quadratic_equations', 'quadratic_functions', 'trigonometry', 'circles']
        }
    },
    'מיכל': {
        name: 'מיכל',
        emoji: '👩‍🏫',
        description: 'מומחית לגאומטריה ואלגברה',
        specialties: ['גאומטריה', 'אלגברה'],
        grades: ['grade_7', 'grade_8', 'grade_9'],
        topicsByGrade: {
            'grade_7': ['linear_equations', 'inequalities', 'pythagoras'],
            'grade_8': ['similarity', 'graphs', 'linear_functions'],
            'grade_9': ['quadratic_equations', 'quadratic_functions', 'trigonometry', 'circles']
        }
    },
    'דני': {
        name: 'דני',
        emoji: '🦊',
        description: 'מתמחה בחשבון ויחסים',
        specialties: ['חשבון', 'יחסים', 'אחוזים'],
        grades: ['grade_5', 'grade_6', 'grade_7', 'grade_8'],
        topicsByGrade: {
            'grade_5': ['fractions_advanced', 'percentages', 'ratios'],
            'grade_6': ['negative_numbers', 'equations', 'statistics'],
            'grade_7': ['linear_equations', 'probability'],
            'grade_8': ['proportions', 'linear_functions']
        }
    },
    'שרה': {
        name: 'שרה',
        emoji: '🧙‍♀️',
        description: 'מורה לכיתות הצעירות',
        specialties: ['חיבור', 'חיסור', 'כפל', 'חילוק'],
        grades: ['grade_1', 'grade_2', 'grade_3', 'grade_4'],
        topicsByGrade: {
            'grade_1': ['counting', 'addition', 'subtraction', 'shapes'],
            'grade_2': ['addition_subtraction', 'multiplication_intro', 'measurement', 'time'],
            'grade_3': ['multiplication', 'division', 'fractions_intro', 'area_perimeter'],
            'grade_4': ['fractions', 'decimals', 'geometry', 'word_problems']
        }
    }
};

// Get personality by name
export function getPersonalityConfig(name) {
    return PERSONALITY_TOPICS[name] || PERSONALITY_TOPICS['נקסון'];
}

// Get available grades for a personality
export function getGradesForPersonality(personalityName) {
    const config = getPersonalityConfig(personalityName);
    return config.grades;
}

// Get topics for a personality and grade
export function getTopicsForPersonalityAndGrade(personalityName, gradeId) {
    const config = getPersonalityConfig(personalityName);
    return config.topicsByGrade[gradeId] || [];
}

// Check if personality supports a grade
export function personalitySupportsGrade(personalityName, gradeId) {
    const config = getPersonalityConfig(personalityName);
    return config.grades.includes(gradeId);
}

// Get all available personalities
export function getAllPersonalities() {
    return Object.values(PERSONALITY_TOPICS);
}