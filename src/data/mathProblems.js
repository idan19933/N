// src/data/mathProblems.js - UPDATED TO MATCH DATABASE

export const mathTopics = {
    algebra: {
        name: 'אלגברה',
        icon: '📐',
        description: 'משוואות ליניאריות וריבועיות',
        color: 'from-blue-500 to-indigo-500'
    },
    geometry: {
        name: 'גאומטריה',
        icon: '📏',
        description: 'משולשים, מעגלים ושטחים',
        color: 'from-green-500 to-emerald-500'
    },
    powers: {
        name: 'חזקות ושורשים',
        icon: '🔢',
        description: 'חזקות, שורשים וחישובים',
        color: 'from-purple-500 to-pink-500'
    },
    calculus: {
        name: 'חדו"א',
        icon: '∫',
        description: 'נגזרות ואינטגרלים',
        color: 'from-red-500 to-orange-500'
    },
    functions: {
        name: 'פונקציות',
        icon: '📊',
        description: 'פונקציות ליניאריות וריבועיות',
        color: 'from-yellow-500 to-amber-500'
    },
    trigonometry: {
        name: 'טריגונומטריה',
        icon: '📐',
        description: 'sin, cos, tan וזוויות',
        color: 'from-cyan-500 to-blue-500'
    },
    statistics: {
        name: 'סטטיסטיקה',
        icon: '📈',
        description: 'ממוצע, חציון והסתברות',
        color: 'from-teal-500 to-green-500'
    }
};

// ✅ Helper function to get prioritized topics for student
export function getPrioritizedTopicsForStudent(nexonProfile) {
    if (!nexonProfile?.topicMastery) return [];

    const struggling = Object.entries(nexonProfile.topicMastery)
        .filter(([_, level]) => level === 'struggle' || level === 'needs-work')
        .map(([topic]) => mapHebrewTopicToKey(topic))
        .filter(topic => mathTopics[topic]);

    return struggling;
}

// ✅ Helper function to get recommended topics
export function getRecommendedTopics(nexonProfile) {
    if (!nexonProfile) return ['algebra', 'geometry', 'functions'];

    const prioritized = getPrioritizedTopicsForStudent(nexonProfile);
    if (prioritized.length > 0) return prioritized;

    // Default recommendations based on grade
    const grade = parseInt(nexonProfile.grade);
    if (grade <= 8) return ['algebra', 'geometry', 'functions'];
    if (grade <= 10) return ['algebra', 'functions', 'geometry', 'powers'];
    return ['calculus', 'trigonometry', 'algebra', 'functions'];
}

// ✅ Map Hebrew topic names to English keys
function mapHebrewTopicToKey(hebrewTopic) {
    const mapping = {
        'גאומטריה': 'geometry',
        'משולשים': 'geometry',
        'אלגברה': 'algebra',
        'משוואות': 'algebra',
        'חזקות': 'powers',
        'שורשים': 'powers',
        'חזקות ושורשים': 'powers',
        'חשבון אינפיניטסימלי': 'calculus',
        'חדו"א': 'calculus',
        'נגזרות': 'calculus',
        'טריגונומטריה': 'trigonometry',
        'פונקציות': 'functions',
        'סטטיסטיקה': 'statistics',
        'הסתברות': 'statistics'
    };

    for (const [hebrew, english] of Object.entries(mapping)) {
        if (hebrewTopic.includes(hebrew)) return english;
    }
    return 'algebra';
}

// ✅ Get topics suitable for student's grade level
export function getTopicsForStudent(nexonProfile) {
    if (!nexonProfile?.grade) return Object.keys(mathTopics);

    const grade = parseInt(nexonProfile.grade);

    // Grade 7-8: Basic topics
    if (grade <= 8) {
        return ['algebra', 'geometry', 'functions', 'powers'].map(key => ({
            id: key,
            name: mathTopics[key].name,
            ...mathTopics[key]
        }));
    }

    // Grade 9-10: Intermediate topics
    if (grade <= 10) {
        return ['algebra', 'geometry', 'functions', 'powers', 'trigonometry'].map(key => ({
            id: key,
            name: mathTopics[key].name,
            ...mathTopics[key]
        }));
    }

    // Grade 11-12: Advanced topics (all)
    return Object.keys(mathTopics).map(key => ({
        id: key,
        name: mathTopics[key].name,
        ...mathTopics[key]
    }));
}

// ✅ Get student level display text
export function getStudentLevelDisplay(nexonProfile) {
    if (!nexonProfile) return 'מתחיל • Beginner';

    const grade = parseInt(nexonProfile.grade);
    const track = nexonProfile.track;

    if (grade <= 8) return `כיתה ${grade} • Grade ${grade}`;

    if (track) {
        if (track.includes('5')) return `${grade} (5 יח"ל) • Advanced`;
        if (track.includes('4')) return `${grade} (4 יח"ל) • Intermediate`;
        if (track.includes('3')) return `${grade} (3 יח"ל) • Basic`;
    }

    return `כיתה ${grade} • Grade ${grade}`;
}

export default mathTopics;