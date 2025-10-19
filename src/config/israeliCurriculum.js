// src/config/israeliCurriculum.js - COMPREHENSIVE ISRAELI MATH CURRICULUM

export const ISRAELI_CURRICULUM = {
    // ========================================
    // כיתה ז׳ - Grade 7
    // ========================================
    grade_7: {
        id: 'grade_7',
        name: 'כיתה ז׳',
        nameEn: 'Grade 7',
        emoji: '🎯',
        topics: [
            {
                id: 'integers',
                name: 'מספרים שלמים',
                nameEn: 'Integers',
                icon: '➕',
                difficulty: 'beginner',
                subtopics: [
                    { id: 'positive-negative', name: 'מספרים חיוביים ושליליים', nameEn: 'Positive and Negative Numbers' },
                    { id: 'number-line', name: 'ציר המספרים', nameEn: 'Number Line' },
                    { id: 'comparing-integers', name: 'השוואת מספרים שלמים', nameEn: 'Comparing Integers' },
                    { id: 'absolute-value', name: 'ערך מוחלט', nameEn: 'Absolute Value' },
                    { id: 'addition-subtraction', name: 'חיבור וחיסור', nameEn: 'Addition and Subtraction' },
                    { id: 'multiplication-division', name: 'כפל וחילוק', nameEn: 'Multiplication and Division' },
                    { id: 'order-of-operations', name: 'סדר פעולות חשבון', nameEn: 'Order of Operations' },
                    { id: 'integer-word-problems', name: 'בעיות מילוליות במספרים שלמים', nameEn: 'Integer Word Problems' }
                ]
            },
            {
                id: 'fractions',
                name: 'שברים',
                nameEn: 'Fractions',
                icon: '¾',
                difficulty: 'beginner',
                subtopics: [
                    { id: 'fraction-basics', name: 'יסודות השברים', nameEn: 'Fraction Basics' },
                    { id: 'proper-improper', name: 'שברים פשוטים ולא פשוטים', nameEn: 'Proper and Improper Fractions' },
                    { id: 'equivalent-fractions', name: 'שברים שקולים', nameEn: 'Equivalent Fractions' },
                    { id: 'simplifying-fractions', name: 'צמצום שברים', nameEn: 'Simplifying Fractions' },
                    { id: 'comparing-fractions', name: 'השוואת שברים', nameEn: 'Comparing Fractions' },
                    { id: 'adding-fractions', name: 'חיבור שברים', nameEn: 'Adding Fractions' },
                    { id: 'subtracting-fractions', name: 'חיסור שברים', nameEn: 'Subtracting Fractions' },
                    { id: 'multiplying-fractions', name: 'כפל שברים', nameEn: 'Multiplying Fractions' },
                    { id: 'dividing-fractions', name: 'חילוק שברים', nameEn: 'Dividing Fractions' },
                    { id: 'mixed-numbers', name: 'מספרים מעורבים', nameEn: 'Mixed Numbers' },
                    { id: 'fraction-word-problems', name: 'בעיות מילוליות בשברים', nameEn: 'Fraction Word Problems' }
                ]
            },
            {
                id: 'decimals',
                name: 'מספרים עשרוניים',
                nameEn: 'Decimals',
                icon: '0.5',
                difficulty: 'beginner',
                subtopics: [
                    { id: 'decimal-basics', name: 'יסודות העשרוניים', nameEn: 'Decimal Basics' },
                    { id: 'place-value', name: 'ערך מקומי', nameEn: 'Place Value' },
                    { id: 'comparing-decimals', name: 'השוואת עשרוניים', nameEn: 'Comparing Decimals' },
                    { id: 'rounding-decimals', name: 'עיגול עשרוניים', nameEn: 'Rounding Decimals' },
                    { id: 'adding-decimals', name: 'חיבור עשרוניים', nameEn: 'Adding Decimals' },
                    { id: 'subtracting-decimals', name: 'חיסור עשרוניים', nameEn: 'Subtracting Decimals' },
                    { id: 'multiplying-decimals', name: 'כפל עשרוניים', nameEn: 'Multiplying Decimals' },
                    { id: 'dividing-decimals', name: 'חילוק עשרוניים', nameEn: 'Dividing Decimals' },
                    { id: 'fraction-decimal-conversion', name: 'המרה בין שברים לעשרוניים', nameEn: 'Fraction-Decimal Conversion' }
                ]
            },
            {
                id: 'percentages',
                name: 'אחוזים',
                nameEn: 'Percentages',
                icon: '%',
                difficulty: 'beginner',
                subtopics: [
                    { id: 'percent-basics', name: 'מושג האחוז', nameEn: 'Percentage Concept' },
                    { id: 'percent-decimal-fraction', name: 'אחוזים, עשרוניים ושברים', nameEn: 'Percent, Decimal, Fraction' },
                    { id: 'finding-percentage', name: 'חישוב אחוזים ממספר', nameEn: 'Finding Percentage of a Number' },
                    { id: 'finding-whole', name: 'מציאת השלם מאחוז', nameEn: 'Finding the Whole from Percent' },
                    { id: 'percent-increase', name: 'עלייה באחוזים', nameEn: 'Percentage Increase' },
                    { id: 'percent-decrease', name: 'ירידה באחוזים', nameEn: 'Percentage Decrease' },
                    { id: 'percent-word-problems', name: 'בעיות מילוליות באחוזים', nameEn: 'Percent Word Problems' },
                    { id: 'discount-tax', name: 'הנחה ומע״מ', nameEn: 'Discount and Tax' }
                ]
            },
            {
                id: 'algebra-intro',
                name: 'יסודות האלגברה',
                nameEn: 'Algebra Basics',
                icon: 'x',
                difficulty: 'intermediate',
                subtopics: [
                    { id: 'variables', name: 'משתנים', nameEn: 'Variables' },
                    { id: 'algebraic-expressions', name: 'ביטויים אלגבריים', nameEn: 'Algebraic Expressions' },
                    { id: 'evaluating-expressions', name: 'הצבה בביטויים', nameEn: 'Evaluating Expressions' },
                    { id: 'combining-like-terms', name: 'איחוד איברים דומים', nameEn: 'Combining Like Terms' },
                    { id: 'simplifying-expressions', name: 'צמצום ביטויים', nameEn: 'Simplifying Expressions' },
                    { id: 'distributive-property', name: 'חוק הפילוג', nameEn: 'Distributive Property' },
                    { id: 'one-step-equations', name: 'משוואות בשלב אחד', nameEn: 'One-Step Equations' },
                    { id: 'two-step-equations', name: 'משוואות בשני שלבים', nameEn: 'Two-Step Equations' },
                    { id: 'equation-word-problems', name: 'בעיות מילוליות במשוואות', nameEn: 'Equation Word Problems' }
                ]
            },
            {
                id: 'geometry-basic',
                name: 'גאומטריה בסיסית',
                nameEn: 'Basic Geometry',
                icon: '📐',
                difficulty: 'beginner',
                subtopics: [
                    { id: 'points-lines-planes', name: 'נקודות, קווים ומישורים', nameEn: 'Points, Lines, Planes' },
                    { id: 'angles-basics', name: 'יסודות הזוויות', nameEn: 'Angle Basics' },
                    { id: 'measuring-angles', name: 'מדידת זוויות', nameEn: 'Measuring Angles' },
                    { id: 'angle-types', name: 'סוגי זוויות', nameEn: 'Types of Angles' },
                    { id: 'complementary-supplementary', name: 'זוויות משלימות ונגדיות', nameEn: 'Complementary and Supplementary' },
                    { id: 'triangles-intro', name: 'מבוא למשולשים', nameEn: 'Introduction to Triangles' },
                    { id: 'triangle-types', name: 'סוגי משולשים', nameEn: 'Types of Triangles' },
                    { id: 'triangle-angles', name: 'זוויות במשולש', nameEn: 'Triangle Angles' },
                    { id: 'quadrilaterals', name: 'מרובעים', nameEn: 'Quadrilaterals' },
                    { id: 'perimeter', name: 'היקף', nameEn: 'Perimeter' },
                    { id: 'area-rectangles', name: 'שטח מלבנים', nameEn: 'Area of Rectangles' },
                    { id: 'area-triangles', name: 'שטח משולשים', nameEn: 'Area of Triangles' }
                ]
            },
            {
                id: 'ratios',
                name: 'יחסים',
                nameEn: 'Ratios',
                icon: ':',
                difficulty: 'intermediate',
                subtopics: [
                    { id: 'ratio-basics', name: 'מושג היחס', nameEn: 'Ratio Concept' },
                    { id: 'equivalent-ratios', name: 'יחסים שקולים', nameEn: 'Equivalent Ratios' },
                    { id: 'simplifying-ratios', name: 'צמצום יחסים', nameEn: 'Simplifying Ratios' },
                    { id: 'ratio-word-problems', name: 'בעיות מילוליות ביחסים', nameEn: 'Ratio Word Problems' },
                    { id: 'unit-rates', name: 'שיעורים', nameEn: 'Unit Rates' },
                    { id: 'scale-drawings', name: 'רישומים בקנה מידה', nameEn: 'Scale Drawings' }
                ]
            },
            {
                id: 'statistics-intro',
                name: 'סטטיסטיקה בסיסית',
                nameEn: 'Basic Statistics',
                icon: '📊',
                difficulty: 'beginner',
                subtopics: [
                    { id: 'data-collection', name: 'איסוף נתונים', nameEn: 'Data Collection' },
                    { id: 'frequency-tables', name: 'טבלאות שכיחות', nameEn: 'Frequency Tables' },
                    { id: 'bar-graphs', name: 'גרפים עמודיים', nameEn: 'Bar Graphs' },
                    { id: 'line-graphs', name: 'גרפי קו', nameEn: 'Line Graphs' },
                    { id: 'pie-charts', name: 'גרפים עוגה', nameEn: 'Pie Charts' },
                    { id: 'mean-average', name: 'ממוצע', nameEn: 'Mean (Average)' },
                    { id: 'median', name: 'חציון', nameEn: 'Median' },
                    { id: 'mode', name: 'שכיח', nameEn: 'Mode' },
                    { id: 'range', name: 'טווח', nameEn: 'Range' }
                ]
            }
        ]
    },

    // ========================================
    // כיתה ח׳ - Grade 8
    // ========================================
    grade_8: {
        id: 'grade_8',
        name: 'כיתה ח׳',
        nameEn: 'Grade 8',
        emoji: '🚀',
        topics: [
            {
                id: 'linear-equations',
                name: 'משוואות לינאריות',
                nameEn: 'Linear Equations',
                icon: '📈',
                difficulty: 'intermediate',
                subtopics: [
                    { id: 'multi-step-equations', name: 'משוואות מרובות שלבים', nameEn: 'Multi-Step Equations' },
                    { id: 'equations-fractions', name: 'משוואות עם שברים', nameEn: 'Equations with Fractions' },
                    { id: 'equations-decimals', name: 'משוואות עם עשרוניים', nameEn: 'Equations with Decimals' },
                    { id: 'equations-brackets', name: 'משוואות עם סוגריים', nameEn: 'Equations with Brackets' },
                    { id: 'variables-both-sides', name: 'משתנים בשני אגפים', nameEn: 'Variables on Both Sides' },
                    { id: 'solving-for-variable', name: 'פתרון למשתנה', nameEn: 'Solving for a Variable' },
                    { id: 'literal-equations', name: 'משוואות מילוליות', nameEn: 'Literal Equations' },
                    { id: 'word-problems-equations', name: 'בעיות מילוליות', nameEn: 'Word Problems' }
                ]
            },
            {
                id: 'inequalities',
                name: 'אי-שוויונות',
                nameEn: 'Inequalities',
                icon: '<',
                difficulty: 'intermediate',
                subtopics: [
                    { id: 'inequality-basics', name: 'יסודות אי-שוויונות', nameEn: 'Inequality Basics' },
                    { id: 'solving-inequalities', name: 'פתרון אי-שוויונות', nameEn: 'Solving Inequalities' },
                    { id: 'graphing-inequalities', name: 'ייצוג גרפי של אי-שוויונות', nameEn: 'Graphing Inequalities' },
                    { id: 'compound-inequalities', name: 'אי-שוויונות מורכבות', nameEn: 'Compound Inequalities' },
                    { id: 'inequality-word-problems', name: 'בעיות מילוליות באי-שוויונות', nameEn: 'Inequality Word Problems' }
                ]
            },
            {
                id: 'systems-of-equations',
                name: 'מערכות משוואות',
                nameEn: 'Systems of Equations',
                icon: '⚖️',
                difficulty: 'intermediate',
                subtopics: [
                    { id: 'systems-basics', name: 'מבוא למערכות', nameEn: 'Introduction to Systems' },
                    { id: 'solving-graphing', name: 'פתרון גרפי', nameEn: 'Solving by Graphing' },
                    { id: 'solving-substitution', name: 'פתרון בהצבה', nameEn: 'Solving by Substitution' },
                    { id: 'solving-elimination', name: 'פתרון בחיסור/חיבור', nameEn: 'Solving by Elimination' },
                    { id: 'systems-word-problems', name: 'בעיות מילוליות במערכות', nameEn: 'Systems Word Problems' }
                ]
            },
            {
                id: 'proportions',
                name: 'פרופורציה ויחסים',
                nameEn: 'Proportions and Ratios',
                icon: '=',
                difficulty: 'intermediate',
                subtopics: [
                    { id: 'proportions-basics', name: 'מושג הפרופורציה', nameEn: 'Proportion Concept' },
                    { id: 'solving-proportions', name: 'פתרון פרופורציות', nameEn: 'Solving Proportions' },
                    { id: 'direct-proportion', name: 'פרופורציה ישרה', nameEn: 'Direct Proportion' },
                    { id: 'inverse-proportion', name: 'פרופורציה הפוכה', nameEn: 'Inverse Proportion' },
                    { id: 'proportion-word-problems', name: 'בעיות מילוליות בפרופורציה', nameEn: 'Proportion Word Problems' },
                    { id: 'percent-proportion', name: 'אחוזים ופרופורציה', nameEn: 'Percent and Proportion' }
                ]
            },
            {
                id: 'exponents',
                name: 'חזקות',
                nameEn: 'Exponents',
                icon: 'x²',
                difficulty: 'intermediate',
                subtopics: [
                    { id: 'exponent-basics', name: 'יסודות חזקות', nameEn: 'Exponent Basics' },
                    { id: 'product-rule', name: 'כפל חזקות', nameEn: 'Product Rule' },
                    { id: 'quotient-rule', name: 'חילוק חזקות', nameEn: 'Quotient Rule' },
                    { id: 'power-of-power', name: 'חזקה של חזקה', nameEn: 'Power of a Power' },
                    { id: 'zero-exponent', name: 'חזקה אפס', nameEn: 'Zero Exponent' },
                    { id: 'negative-exponents', name: 'חזקות שליליות', nameEn: 'Negative Exponents' },
                    { id: 'scientific-notation', name: 'סימון מדעי', nameEn: 'Scientific Notation' }
                ]
            },
            {
                id: 'polynomials',
                name: 'פולינומים',
                nameEn: 'Polynomials',
                icon: 'x²+x',
                difficulty: 'advanced',
                subtopics: [
                    { id: 'polynomial-basics', name: 'מושג הפולינום', nameEn: 'Polynomial Concept' },
                    { id: 'adding-polynomials', name: 'חיבור פולינומים', nameEn: 'Adding Polynomials' },
                    { id: 'subtracting-polynomials', name: 'חיסור פולינומים', nameEn: 'Subtracting Polynomials' },
                    { id: 'multiplying-monomials', name: 'כפל מונומים', nameEn: 'Multiplying Monomials' },
                    { id: 'expand-brackets', name: 'פתיחת סוגריים', nameEn: 'Expanding Brackets' },
                    { id: 'distributive-advanced', name: 'חוק הפילוג מתקדם', nameEn: 'Advanced Distributive Property' },
                    { id: 'common-factor', name: 'הוצאת גורם משותף', nameEn: 'Common Factor' },
                    { id: 'factoring-basics', name: 'פירוק לגורמים בסיסי', nameEn: 'Basic Factoring' }
                ]
            },
            {
                id: 'functions-intro',
                name: 'מבוא לפונקציות',
                nameEn: 'Introduction to Functions',
                icon: 'f(x)',
                difficulty: 'intermediate',
                subtopics: [
                    { id: 'function-concept', name: 'מושג הפונקציה', nameEn: 'Function Concept' },
                    { id: 'function-notation', name: 'סימון פונקציות', nameEn: 'Function Notation' },
                    { id: 'evaluating-functions', name: 'הצבה בפונקציות', nameEn: 'Evaluating Functions' },
                    { id: 'domain-range', name: 'תחום ותמונה', nameEn: 'Domain and Range' },
                    { id: 'function-tables', name: 'טבלאות פונקציות', nameEn: 'Function Tables' }
                ]
            },
            {
                id: 'linear-functions',
                name: 'פונקציות לינאריות',
                nameEn: 'Linear Functions',
                icon: '📈',
                difficulty: 'intermediate',
                subtopics: [
                    { id: 'coordinate-plane', name: 'מערכת צירים', nameEn: 'Coordinate Plane' },
                    { id: 'plotting-points', name: 'סימון נקודות', nameEn: 'Plotting Points' },
                    { id: 'linear-graphs', name: 'גרפים לינאריים', nameEn: 'Linear Graphs' },
                    { id: 'slope', name: 'שיפוע', nameEn: 'Slope' },
                    { id: 'slope-formula', name: 'נוסחת השיפוע', nameEn: 'Slope Formula' },
                    { id: 'y-intercept', name: 'נקודת חיתוך עם ציר Y', nameEn: 'Y-Intercept' },
                    { id: 'slope-intercept-form', name: 'צורת שיפוע-חיתוך', nameEn: 'Slope-Intercept Form' },
                    { id: 'graphing-linear-equations', name: 'שרטוט משוואות לינאריות', nameEn: 'Graphing Linear Equations' },
                    { id: 'writing-linear-equations', name: 'כתיבת משוואות לינאריות', nameEn: 'Writing Linear Equations' }
                ]
            },
            {
                id: 'similarity-congruence',
                name: 'דמיון וחפיפה',
                nameEn: 'Similarity and Congruence',
                icon: '△',
                difficulty: 'intermediate',
                subtopics: [
                    { id: 'congruence-concept', name: 'מושג החפיפה', nameEn: 'Congruence Concept' },
                    { id: 'congruent-triangles', name: 'משולשים חופפים', nameEn: 'Congruent Triangles' },
                    { id: 'similarity-concept', name: 'מושג הדמיון', nameEn: 'Similarity Concept' },
                    { id: 'similar-triangles', name: 'משולשים דומים', nameEn: 'Similar Triangles' },
                    { id: 'similarity-ratio', name: 'יחס דמיון', nameEn: 'Similarity Ratio' },
                    { id: 'thales-theorem', name: 'משפט תאלס', nameEn: 'Thales Theorem' },
                    { id: 'similarity-applications', name: 'יישומי דמיון', nameEn: 'Similarity Applications' }
                ]
            },
            {
                id: 'pythagorean-theorem',
                name: 'משפט פיתגורס',
                nameEn: 'Pythagorean Theorem',
                icon: 'a²+b²',
                difficulty: 'intermediate',
                subtopics: [
                    { id: 'pythagorean-basics', name: 'מושג משפט פיתגורס', nameEn: 'Pythagorean Concept' },
                    { id: 'finding-hypotenuse', name: 'מציאת היתר', nameEn: 'Finding Hypotenuse' },
                    { id: 'finding-leg', name: 'מציאת ניצב', nameEn: 'Finding a Leg' },
                    { id: 'pythagorean-word-problems', name: 'בעיות מילוליות בפיתגורס', nameEn: 'Pythagorean Word Problems' },
                    { id: 'distance-formula', name: 'נוסחת המרחק', nameEn: 'Distance Formula' }
                ]
            },
            {
                id: 'volume-surface-area',
                name: 'נפח ושטח פנים',
                nameEn: 'Volume and Surface Area',
                icon: '📦',
                difficulty: 'intermediate',
                subtopics: [
                    { id: 'volume-prisms', name: 'נפח מנסרות', nameEn: 'Volume of Prisms' },
                    { id: 'volume-cylinders', name: 'נפח גלילים', nameEn: 'Volume of Cylinders' },
                    { id: 'surface-area-prisms', name: 'שטח פנים מנסרות', nameEn: 'Surface Area of Prisms' },
                    { id: 'surface-area-cylinders', name: 'שטח פנים גלילים', nameEn: 'Surface Area of Cylinders' }
                ]
            },
            {
                id: 'data-analysis',
                name: 'ניתוח נתונים',
                nameEn: 'Data Analysis',
                icon: '📊',
                difficulty: 'intermediate',
                subtopics: [
                    { id: 'scatter-plots', name: 'גרפי פיזור', nameEn: 'Scatter Plots' },
                    { id: 'line-of-best-fit', name: 'קו המגמה', nameEn: 'Line of Best Fit' },
                    { id: 'correlation', name: 'מתאם', nameEn: 'Correlation' },
                    { id: 'box-plots', name: 'תרשימי קופסה', nameEn: 'Box Plots' },
                    { id: 'quartiles', name: 'רבעונים', nameEn: 'Quartiles' }
                ]
            }
        ]
    },

    // ========================================
    // כיתה ט׳ - Grade 9
    // ========================================
    grade_9: {
        id: 'grade_9',
        name: 'כיתה ט׳',
        nameEn: 'Grade 9',
        emoji: '🎓',
        topics: [
            {
                id: 'quadratic-equations',
                name: 'משוואות ריבועיות',
                nameEn: 'Quadratic Equations',
                icon: 'x²',
                difficulty: 'advanced',
                subtopics: [
                    { id: 'quadratic-basics', name: 'מושג המשוואה הריבועית', nameEn: 'Quadratic Equation Concept' },
                    { id: 'quadratic-standard-form', name: 'צורה סטנדרטית', nameEn: 'Standard Form' },
                    { id: 'solving-by-square-root', name: 'פתרון בשורש', nameEn: 'Solving by Square Root' },
                    { id: 'quadratic-factoring', name: 'פתרון בפירוק לגורמים', nameEn: 'Solving by Factoring' },
                    { id: 'completing-the-square', name: 'השלמה לריבוע', nameEn: 'Completing the Square' },
                    { id: 'quadratic-formula', name: 'נוסחת השורשים', nameEn: 'Quadratic Formula' },
                    { id: 'discriminant', name: 'דיסקרימיננטה', nameEn: 'Discriminant' },
                    { id: 'quadratic-word-problems', name: 'בעיות מילוליות', nameEn: 'Word Problems' }
                ]
            },
            {
                id: 'quadratic-functions',
                name: 'פונקציות ריבועיות',
                nameEn: 'Quadratic Functions',
                icon: 'y=x²',
                difficulty: 'advanced',
                subtopics: [
                    { id: 'parabola-basics', name: 'מושג הפרבולה', nameEn: 'Parabola Concept' },
                    { id: 'graphing-parabolas', name: 'שרטוט פרבולות', nameEn: 'Graphing Parabolas' },
                    { id: 'vertex', name: 'קודקוד', nameEn: 'Vertex' },
                    { id: 'axis-of-symmetry', name: 'ציר סימטריה', nameEn: 'Axis of Symmetry' },
                    { id: 'vertex-form', name: 'צורת קודקוד', nameEn: 'Vertex Form' },
                    { id: 'transformations', name: 'טרנספורמציות', nameEn: 'Transformations' },
                    { id: 'intercepts', name: 'נקודות חיתוך', nameEn: 'Intercepts' }
                ]
            },
            {
                id: 'powers-roots',
                name: 'חזקות ושורשים',
                nameEn: 'Powers and Roots',
                icon: '√',
                difficulty: 'intermediate',
                subtopics: [
                    { id: 'square-roots', name: 'שורש ריבועי', nameEn: 'Square Root' },
                    { id: 'cube-roots', name: 'שורש שלישי', nameEn: 'Cube Root' },
                    { id: 'nth-roots', name: 'שורש n-י', nameEn: 'nth Root' },
                    { id: 'power-rules-review', name: 'חזרה חוקי חזקות', nameEn: 'Power Rules Review' },
                    { id: 'rational-exponents', name: 'חזקות רציונליות', nameEn: 'Rational Exponents' },
                    { id: 'simplifying-roots', name: 'פישוט שורשים', nameEn: 'Simplifying Roots' },
                    { id: 'operations-with-roots', name: 'פעולות בשורשים', nameEn: 'Operations with Roots' },
                    { id: 'rationalizing-denominator', name: 'רציונליזציה של מכנה', nameEn: 'Rationalizing Denominator' }
                ]
            },
            {
                id: 'polynomials-advanced',
                name: 'פולינומים מתקדם',
                nameEn: 'Advanced Polynomials',
                icon: 'P(x)',
                difficulty: 'advanced',
                subtopics: [
                    { id: 'polynomial-operations', name: 'פעולות בפולינומים', nameEn: 'Polynomial Operations' },
                    { id: 'multiplying-binomials', name: 'כפל בינומים', nameEn: 'Multiplying Binomials' },
                    { id: 'special-products', name: 'נוסחאות כפל מקוצר', nameEn: 'Special Products' },
                    { id: 'difference-of-squares', name: 'הפרש ריבועים', nameEn: 'Difference of Squares' },
                    { id: 'perfect-square-trinomial', name: 'ריבוע בינום', nameEn: 'Perfect Square Trinomial' },
                    { id: 'factoring-trinomials', name: 'פירוק טרינומים', nameEn: 'Factoring Trinomials' },
                    { id: 'factoring-by-grouping', name: 'פירוק בקיבוץ', nameEn: 'Factoring by Grouping' },
                    { id: 'polynomial-division', name: 'חילוק פולינומים', nameEn: 'Polynomial Division' }
                ]
            },
            {
                id: 'rational-expressions',
                name: 'ביטויים רציונליים',
                nameEn: 'Rational Expressions',
                icon: 'x/y',
                difficulty: 'advanced',
                subtopics: [
                    { id: 'rational-basics', name: 'יסודות ביטויים רציונליים', nameEn: 'Rational Expression Basics' },
                    { id: 'simplifying-rational', name: 'צמצום ביטויים רציונליים', nameEn: 'Simplifying Rational Expressions' },
                    { id: 'multiplying-rational', name: 'כפל ביטויים רציונליים', nameEn: 'Multiplying Rational Expressions' },
                    { id: 'dividing-rational', name: 'חילוק ביטויים רציונליים', nameEn: 'Dividing Rational Expressions' },
                    { id: 'adding-rational', name: 'חיבור ביטויים רציונליים', nameEn: 'Adding Rational Expressions' },
                    { id: 'subtracting-rational', name: 'חיסור ביטויים רציונליים', nameEn: 'Subtracting Rational Expressions' },
                    { id: 'complex-fractions', name: 'שברים מורכבים', nameEn: 'Complex Fractions' },
                    { id: 'rational-equations', name: 'משוואות רציונליות', nameEn: 'Rational Equations' }
                ]
            },
            {
                id: 'circles',
                name: 'מעגלים',
                nameEn: 'Circles',
                icon: '⭕',
                difficulty: 'intermediate',
                subtopics: [
                    { id: 'circle-basics', name: 'יסודות המעגל', nameEn: 'Circle Basics' },
                    { id: 'circle-parts', name: 'חלקי המעגל', nameEn: 'Parts of a Circle' },
                    { id: 'circumference', name: 'היקף מעגל', nameEn: 'Circumference' },
                    { id: 'circle-area', name: 'שטח מעגל', nameEn: 'Circle Area' },
                    { id: 'arcs', name: 'קשתות', nameEn: 'Arcs' },
                    { id: 'sectors', name: 'גזרות', nameEn: 'Sectors' },
                    { id: 'central-angles', name: 'זוויות מרכזיות', nameEn: 'Central Angles' },
                    { id: 'inscribed-angles', name: 'זוויות היקפיות', nameEn: 'Inscribed Angles' }
                ]
            },
            {
                id: 'solid-geometry',
                name: 'גאומטריה במרחב',
                nameEn: 'Solid Geometry',
                icon: '📦',
                difficulty: 'intermediate',
                subtopics: [
                    { id: 'prisms', name: 'מנסרות', nameEn: 'Prisms' },
                    { id: 'cylinders', name: 'גלילים', nameEn: 'Cylinders' },
                    { id: 'pyramids', name: 'פירמידות', nameEn: 'Pyramids' },
                    { id: 'cones', name: 'חרוטים', nameEn: 'Cones' },
                    { id: 'spheres', name: 'כדורים', nameEn: 'Spheres' },
                    { id: 'volume-advanced', name: 'נפח מתקדם', nameEn: 'Advanced Volume' },
                    { id: 'surface-area-advanced', name: 'שטח פנים מתקדם', nameEn: 'Advanced Surface Area' }
                ]
            },
            {
                id: 'trigonometry-intro',
                name: 'טריגונומטריה בסיסית',
                nameEn: 'Basic Trigonometry',
                icon: '∠',
                difficulty: 'advanced',
                subtopics: [
                    { id: 'right-triangles', name: 'משולשים ישרי זווית', nameEn: 'Right Triangles' },
                    { id: 'trig-ratios', name: 'יחסים טריגונומטריים', nameEn: 'Trigonometric Ratios' },
                    { id: 'sine', name: 'סינוס', nameEn: 'Sine' },
                    { id: 'cosine', name: 'קוסינוס', nameEn: 'Cosine' },
                    { id: 'tangent', name: 'טנגנס', nameEn: 'Tangent' },
                    { id: 'finding-sides', name: 'מציאת צלעות', nameEn: 'Finding Sides' },
                    { id: 'finding-angles', name: 'מציאת זוויות', nameEn: 'Finding Angles' },
                    { id: 'trig-word-problems', name: 'בעיות מילוליות', nameEn: 'Trig Word Problems' }
                ]
            },
            {
                id: 'probability',
                name: 'הסתברות',
                nameEn: 'Probability',
                icon: '🎲',
                difficulty: 'intermediate',
                subtopics: [
                    { id: 'probability-basics', name: 'יסודות הסתברות', nameEn: 'Probability Basics' },
                    { id: 'theoretical-probability', name: 'הסתברות תיאורטית', nameEn: 'Theoretical Probability' },
                    { id: 'experimental-probability', name: 'הסתברות ניסיונית', nameEn: 'Experimental Probability' },
                    { id: 'sample-space', name: 'מרחב המדגם', nameEn: 'Sample Space' },
                    { id: 'independent-events', name: 'אירועים בלתי תלויים', nameEn: 'Independent Events' },
                    { id: 'dependent-events', name: 'אירועים תלויים', nameEn: 'Dependent Events' },
                    { id: 'compound-events', name: 'אירועים מורכבים', nameEn: 'Compound Events' },
                    { id: 'permutations', name: 'תמורות', nameEn: 'Permutations' },
                    { id: 'combinations', name: 'צירופים', nameEn: 'Combinations' }
                ]
            },
            {
                id: 'sequences-intro',
                name: 'מבוא לסדרות',
                nameEn: 'Introduction to Sequences',
                icon: '1,2,3...',
                difficulty: 'intermediate',
                subtopics: [
                    { id: 'sequence-basics', name: 'מושג הסדרה', nameEn: 'Sequence Concept' },
                    { id: 'arithmetic-sequences', name: 'סדרות חשבוניות', nameEn: 'Arithmetic Sequences' },
                    { id: 'arithmetic-formula', name: 'נוסחת האיבר הכללי', nameEn: 'General Term Formula' },
                    { id: 'geometric-sequences', name: 'סדרות הנדסיות', nameEn: 'Geometric Sequences' },
                    { id: 'geometric-formula', name: 'נוסחת סדרה הנדסית', nameEn: 'Geometric Formula' }
                ]
            }
        ]
    },

    // ========================================
    // כיתה י׳ - 3 יחידות
    // ========================================
    grade_10_3: {
        id: 'grade_10_3',
        name: 'כיתה י׳ - 3 יחידות',
        nameEn: 'Grade 10 - 3 Units',
        emoji: '📚',
        topics: [
            {
                id: 'algebra-review',
                name: 'חזרה אלגברה',
                nameEn: 'Algebra Review',
                icon: 'x',
                difficulty: 'intermediate',
                subtopics: [
                    { id: 'equations-review', name: 'חזרה משוואות', nameEn: 'Equations Review' },
                    { id: 'inequalities-review', name: 'חזרה אי-שוויונות', nameEn: 'Inequalities Review' },
                    { id: 'polynomials-review', name: 'חזרה פולינומים', nameEn: 'Polynomials Review' },
                    { id: 'factoring-review', name: 'חזרה פירוק לגורמים', nameEn: 'Factoring Review' }
                ]
            },
            {
                id: 'quadratic-review',
                name: 'משוואות ריבועיות - חזרה',
                nameEn: 'Quadratic Equations Review',
                icon: 'x²',
                difficulty: 'intermediate',
                subtopics: [
                    { id: 'solving-quadratics-review', name: 'פתרון משוואות ריבועיות', nameEn: 'Solving Quadratics' },
                    { id: 'quadratic-functions-review', name: 'פונקציות ריבועיות', nameEn: 'Quadratic Functions' },
                    { id: 'applications-quadratics', name: 'יישומי משוואות ריבועיות', nameEn: 'Quadratic Applications' }
                ]
            },
            {
                id: 'functions-advanced',
                name: 'פונקציות מתקדמות',
                nameEn: 'Advanced Functions',
                icon: 'f(x)',
                difficulty: 'intermediate',
                subtopics: [
                    { id: 'function-operations', name: 'פעולות בפונקציות', nameEn: 'Function Operations' },
                    { id: 'composite-functions', name: 'הרכבת פונקציות', nameEn: 'Composite Functions' },
                    { id: 'inverse-functions-intro', name: 'מבוא לפונקציה הפוכה', nameEn: 'Intro to Inverse Functions' },
                    { id: 'piecewise-functions', name: 'פונקציות מוגדרות בקטעים', nameEn: 'Piecewise Functions' }
                ]
            },
            {
                id: 'exponential-intro',
                name: 'פונקציות מעריכיות - מבוא',
                nameEn: 'Exponential Functions Intro',
                icon: '2ˣ',
                difficulty: 'intermediate',
                subtopics: [
                    { id: 'exponential-basics', name: 'יסודות פונקציות מעריכיות', nameEn: 'Exponential Basics' },
                    { id: 'exponential-growth', name: 'גידול מעריכי', nameEn: 'Exponential Growth' },
                    { id: 'exponential-decay', name: 'דעיכה מעריכית', nameEn: 'Exponential Decay' },
                    { id: 'exponential-applications', name: 'יישומים', nameEn: 'Applications' }
                ]
            },
            {
                id: 'geometry-review',
                name: 'גאומטריה - חזרה',
                nameEn: 'Geometry Review',
                icon: '📐',
                difficulty: 'intermediate',
                subtopics: [
                    { id: 'triangles-review', name: 'משולשים', nameEn: 'Triangles' },
                    { id: 'circles-review', name: 'מעגלים', nameEn: 'Circles' },
                    { id: 'pythagorean-review', name: 'משפט פיתגורס', nameEn: 'Pythagorean Theorem' },
                    { id: 'area-perimeter-review', name: 'שטח והיקף', nameEn: 'Area and Perimeter' }
                ]
            },
            {
                id: 'trigonometry-review',
                name: 'טריגונומטריה - חזרה',
                nameEn: 'Trigonometry Review',
                icon: '∠',
                difficulty: 'intermediate',
                subtopics: [
                    { id: 'trig-ratios-review', name: 'יחסים טריגונומטריים', nameEn: 'Trig Ratios' },
                    { id: 'solving-triangles', name: 'פתרון משולשים', nameEn: 'Solving Triangles' },
                    { id: 'trig-applications', name: 'יישומי טריגונומטריה', nameEn: 'Trig Applications' }
                ]
            },
            {
                id: 'statistics-3',
                name: 'סטטיסטיקה',
                nameEn: 'Statistics',
                icon: '📊',
                difficulty: 'intermediate',
                subtopics: [
                    { id: 'data-representation', name: 'ייצוג נתונים', nameEn: 'Data Representation' },
                    { id: 'measures-center', name: 'מדדי מרכז', nameEn: 'Measures of Center' },
                    { id: 'measures-spread', name: 'מדדי פיזור', nameEn: 'Measures of Spread' },
                    { id: 'standard-deviation', name: 'סטיית תקן', nameEn: 'Standard Deviation' }
                ]
            },
            {
                id: 'probability-3',
                name: 'הסתברות',
                nameEn: 'Probability',
                icon: '🎲',
                difficulty: 'intermediate',
                subtopics: [
                    { id: 'probability-review', name: 'חזרה הסתברות', nameEn: 'Probability Review' },
                    { id: 'conditional-probability-intro', name: 'הסתברות מותנית - מבוא', nameEn: 'Conditional Probability Intro' },
                    { id: 'probability-distributions-intro', name: 'התפלגויות - מבוא', nameEn: 'Distributions Intro' }
                ]
            }
        ]
    },

    // ========================================
    // כיתה י׳ - 4 יחידות
    // ========================================
    grade_10_4: {
        id: 'grade_10_4',
        name: 'כיתה י׳ - 4 יחידות',
        nameEn: 'Grade 10 - 4 Units',
        emoji: '🎯',
        topics: [
            {
                id: 'exponential-functions',
                name: 'פונקציות מעריכיות',
                nameEn: 'Exponential Functions',
                icon: '2ˣ',
                difficulty: 'advanced',
                subtopics: [
                    { id: 'exponential-concept', name: 'מושג הפונקציה המעריכית', nameEn: 'Exponential Concept' },
                    { id: 'exponential-properties', name: 'תכונות פונקציות מעריכיות', nameEn: 'Exponential Properties' },
                    { id: 'exponential-graphs', name: 'גרפים של פונקציות מעריכיות', nameEn: 'Exponential Graphs' },
                    { id: 'exponential-growth-decay', name: 'גידול ודעיכה', nameEn: 'Growth and Decay' },
                    { id: 'exponential-equations', name: 'משוואות מעריכיות', nameEn: 'Exponential Equations' },
                    { id: 'compound-interest', name: 'ריבית דריבית', nameEn: 'Compound Interest' },
                    { id: 'number-e', name: 'המספר e', nameEn: 'The Number e' }
                ]
            },
            {
                id: 'logarithms',
                name: 'לוגריתמים',
                nameEn: 'Logarithms',
                icon: 'log',
                difficulty: 'advanced',
                subtopics: [
                    { id: 'log-basics', name: 'מושג הלוגריתם', nameEn: 'Logarithm Concept' },
                    { id: 'log-definition', name: 'הגדרת לוגריתם', nameEn: 'Logarithm Definition' },
                    { id: 'log-properties', name: 'תכונות לוגריתמים', nameEn: 'Logarithm Properties' },
                    { id: 'log-rules', name: 'חוקי לוגריתמים', nameEn: 'Logarithm Rules' },
                    { id: 'log-equations', name: 'משוואות לוגריתמיות', nameEn: 'Logarithmic Equations' },
                    { id: 'natural-log', name: 'לוגריתם טבעי', nameEn: 'Natural Logarithm' },
                    { id: 'log-graphs', name: 'גרפים לוגריתמיים', nameEn: 'Logarithmic Graphs' },
                    { id: 'log-applications', name: 'יישומי לוגריתמים', nameEn: 'Logarithm Applications' }
                ]
            },
            {
                id: 'sequences-series',
                name: 'סדרות וטורים',
                nameEn: 'Sequences and Series',
                icon: 'Σ',
                difficulty: 'advanced',
                subtopics: [
                    { id: 'sequences-review', name: 'חזרה סדרות', nameEn: 'Sequences Review' },
                    { id: 'arithmetic-series', name: 'טורים חשבוניים', nameEn: 'Arithmetic Series' },
                    { id: 'geometric-series', name: 'טורים הנדסיים', nameEn: 'Geometric Series' },
                    { id: 'infinite-series', name: 'טורים אינסופיים', nameEn: 'Infinite Series' },
                    { id: 'convergence', name: 'התכנסות', nameEn: 'Convergence' },
                    { id: 'sigma-notation', name: 'סימון סיגמא', nameEn: 'Sigma Notation' }
                ]
            },
            {
                id: 'trigonometry-advanced',
                name: 'טריגונומטריה מתקדמת',
                nameEn: 'Advanced Trigonometry',
                icon: '∠',
                difficulty: 'advanced',
                subtopics: [
                    { id: 'unit-circle', name: 'מעגל היחידה', nameEn: 'Unit Circle' },
                    { id: 'trig-functions-any-angle', name: 'פונקציות טריגונומטריות לכל זווית', nameEn: 'Trig Functions for Any Angle' },
                    { id: 'trig-graphs', name: 'גרפים טריגונומטריים', nameEn: 'Trig Graphs' },
                    { id: 'trig-identities-basic', name: 'זהויות טריגונומטריות בסיסיות', nameEn: 'Basic Trig Identities' },
                    { id: 'sine-cosine-rules', name: 'חוקי הסינוסים והקוסינוסים', nameEn: 'Sine and Cosine Rules' },
                    { id: 'solving-triangles-advanced', name: 'פתרון משולשים מתקדם', nameEn: 'Advanced Triangle Solving' }
                ]
            },
            {
                id: 'analytic-geometry',
                name: 'גאומטריה אנליטית',
                nameEn: 'Analytic Geometry',
                icon: '📐',
                difficulty: 'advanced',
                subtopics: [
                    { id: 'distance-midpoint', name: 'מרחק ונקודת אמצע', nameEn: 'Distance and Midpoint' },
                    { id: 'linear-equations-advanced', name: 'משוואות לינאריות מתקדם', nameEn: 'Advanced Linear Equations' },
                    { id: 'parallel-perpendicular', name: 'ישרים מקבילים ומאונכים', nameEn: 'Parallel and Perpendicular Lines' },
                    { id: 'circle-equations', name: 'משוואת מעגל', nameEn: 'Circle Equations' },
                    { id: 'parabola-equations', name: 'משוואת פרבולה', nameEn: 'Parabola Equations' }
                ]
            },
            {
                id: 'vectors-intro',
                name: 'וקטורים - מבוא',
                nameEn: 'Vectors Introduction',
                icon: '→',
                difficulty: 'advanced',
                subtopics: [
                    { id: 'vector-basics', name: 'מושג הוקטור', nameEn: 'Vector Concept' },
                    { id: 'vector-operations', name: 'פעולות בוקטורים', nameEn: 'Vector Operations' },
                    { id: 'vector-components', name: 'רכיבי וקטור', nameEn: 'Vector Components' },
                    { id: 'vector-magnitude', name: 'אורך וקטור', nameEn: 'Vector Magnitude' },
                    { id: 'dot-product-intro', name: 'מכפלה סקלרית - מבוא', nameEn: 'Dot Product Intro' }
                ]
            },
            {
                id: 'probability-statistics-4',
                name: 'הסתברות וסטטיסטיקה',
                nameEn: 'Probability and Statistics',
                icon: '📊',
                difficulty: 'advanced',
                subtopics: [
                    { id: 'conditional-probability', name: 'הסתברות מותנית', nameEn: 'Conditional Probability' },
                    { id: 'independence', name: 'אירועים בלתי תלויים', nameEn: 'Independence' },
                    { id: 'bayes-theorem-intro', name: 'משפט בייס - מבוא', nameEn: 'Bayes Theorem Intro' },
                    { id: 'random-variables-intro', name: 'משתנים מקריים - מבוא', nameEn: 'Random Variables Intro' },
                    { id: 'expected-value', name: 'תוחלת', nameEn: 'Expected Value' },
                    { id: 'variance-intro', name: 'שונות - מבוא', nameEn: 'Variance Intro' }
                ]
            }
        ]
    },

    // ========================================
    // כיתה י׳ - 5 יחידות
    // ========================================
    grade_10_5: {
        id: 'grade_10_5',
        name: 'כיתה י׳ - 5 יחידות',
        nameEn: 'Grade 10 - 5 Units',
        emoji: '🏆',
        topics: [
            {
                id: 'functions-composition',
                name: 'הרכבת פונקציות',
                nameEn: 'Function Composition',
                icon: 'f∘g',
                difficulty: 'expert',
                subtopics: [
                    { id: 'composition-basics', name: 'יסודות הרכבה', nameEn: 'Composition Basics' },
                    { id: 'composition-properties', name: 'תכונות הרכבה', nameEn: 'Composition Properties' },
                    { id: 'composition-graphs', name: 'גרפים של הרכבות', nameEn: 'Composition Graphs' },
                    { id: 'decomposition', name: 'פירוק פונקציות', nameEn: 'Function Decomposition' }
                ]
            },
            {
                id: 'inverse-functions',
                name: 'פונקציות הפוכות',
                nameEn: 'Inverse Functions',
                icon: 'f⁻¹',
                difficulty: 'expert',
                subtopics: [
                    { id: 'inverse-concept', name: 'מושג הפונקציה ההפוכה', nameEn: 'Inverse Concept' },
                    { id: 'finding-inverses', name: 'מציאת פונקציה הפוכה', nameEn: 'Finding Inverses' },
                    { id: 'inverse-properties', name: 'תכונות פונקציה הפוכה', nameEn: 'Inverse Properties' },
                    { id: 'inverse-graphs', name: 'גרפים של פונקציות הפוכות', nameEn: 'Inverse Graphs' },
                    { id: 'one-to-one', name: 'פונקציות חד-חד ערכיות', nameEn: 'One-to-One Functions' }
                ]
            },
            {
                id: 'complex-numbers-intro',
                name: 'מספרים מרוכבים',
                nameEn: 'Complex Numbers',
                icon: 'i',
                difficulty: 'expert',
                subtopics: [
                    { id: 'imaginary-unit', name: 'היחידה המדומה', nameEn: 'Imaginary Unit' },
                    { id: 'complex-basics', name: 'יסודות מספרים מרוכבים', nameEn: 'Complex Basics' },
                    { id: 'complex-operations', name: 'פעולות במספרים מרוכבים', nameEn: 'Complex Operations' },
                    { id: 'complex-conjugate', name: 'מספר צמוד', nameEn: 'Complex Conjugate' },
                    { id: 'complex-plane', name: 'המישור המרוכב', nameEn: 'Complex Plane' },
                    { id: 'absolute-value-complex', name: 'ערך מוחלט מרוכב', nameEn: 'Complex Absolute Value' }
                ]
            },
            {
                id: 'polynomial-theory',
                name: 'תורת הפולינומים',
                nameEn: 'Polynomial Theory',
                icon: 'P(x)',
                difficulty: 'expert',
                subtopics: [
                    { id: 'polynomial-division-advanced', name: 'חילוק פולינומים מתקדם', nameEn: 'Advanced Polynomial Division' },
                    { id: 'remainder-theorem', name: 'משפט השארית', nameEn: 'Remainder Theorem' },
                    { id: 'factor-theorem', name: 'משפט הגורם', nameEn: 'Factor Theorem' },
                    { id: 'rational-root-theorem', name: 'משפט השורש הרציונלי', nameEn: 'Rational Root Theorem' },
                    { id: 'fundamental-theorem', name: 'המשפט היסודי של האלגברה', nameEn: 'Fundamental Theorem of Algebra' }
                ]
            },
            {
                id: 'sequences-limits',
                name: 'סדרות וגבולות',
                nameEn: 'Sequences and Limits',
                icon: 'lim',
                difficulty: 'expert',
                subtopics: [
                    { id: 'limit-concept', name: 'מושג הגבול', nameEn: 'Limit Concept' },
                    { id: 'sequence-limits', name: 'גבול סדרה', nameEn: 'Sequence Limits' },
                    { id: 'limit-laws', name: 'חוקי גבולות', nameEn: 'Limit Laws' },
                    { id: 'infinite-limits', name: 'גבולות אינסופיים', nameEn: 'Infinite Limits' },
                    { id: 'squeeze-theorem', name: 'משפט הסנדוויץ׳', nameEn: 'Squeeze Theorem' }
                ]
            },
            {
                id: 'derivatives-intro',
                name: 'נגזרות - מבוא',
                nameEn: 'Introduction to Derivatives',
                icon: "f'(x)",
                difficulty: 'expert',
                subtopics: [
                    { id: 'derivative-concept', name: 'מושג הנגזרת', nameEn: 'Derivative Concept' },
                    { id: 'derivative-definition', name: 'הגדרת הנגזרת', nameEn: 'Derivative Definition' },
                    { id: 'derivative-interpretation', name: 'פרשנות גיאומטרית', nameEn: 'Geometric Interpretation' },
                    { id: 'tangent-line', name: 'משוואת משיק', nameEn: 'Tangent Line' },
                    { id: 'derivative-basic-functions', name: 'נגזרות פונקציות בסיסיות', nameEn: 'Derivatives of Basic Functions' },
                    { id: 'derivative-rules-basic', name: 'כללי גזירה בסיסיים', nameEn: 'Basic Derivative Rules' }
                ]
            },
            {
                id: 'trigonometry-identities',
                name: 'זהויות טריגונומטריות',
                nameEn: 'Trigonometric Identities',
                icon: '∠',
                difficulty: 'expert',
                subtopics: [
                    { id: 'pythagorean-identity', name: 'זהות פיתגורס', nameEn: 'Pythagorean Identity' },
                    { id: 'sum-difference-formulas', name: 'נוסחאות סכום והפרש', nameEn: 'Sum and Difference Formulas' },
                    { id: 'double-angle-formulas', name: 'נוסחאות זווית כפולה', nameEn: 'Double Angle Formulas' },
                    { id: 'half-angle-formulas', name: 'נוסחאות חצי זווית', nameEn: 'Half Angle Formulas' },
                    { id: 'product-to-sum', name: 'מכפלה לסכום', nameEn: 'Product to Sum' }
                ]
            },
            {
                id: 'vectors-2d',
                name: 'וקטורים במישור',
                nameEn: '2D Vectors',
                icon: '→',
                difficulty: 'expert',
                subtopics: [
                    { id: 'vector-algebra', name: 'אלגברת וקטורים', nameEn: 'Vector Algebra' },
                    { id: 'dot-product', name: 'מכפלה סקלרית', nameEn: 'Dot Product' },
                    { id: 'vector-projections', name: 'הטלות וקטוריות', nameEn: 'Vector Projections' },
                    { id: 'vector-equations', name: 'משוואות וקטוריות', nameEn: 'Vector Equations' },
                    { id: 'parametric-equations', name: 'משוואות פרמטריות', nameEn: 'Parametric Equations' }
                ]
            }
        ]
    },

    // ========================================
    // כיתה יא׳ - 3 יחידות
    // ========================================
    grade_11_3: {
        id: 'grade_11_3',
        name: 'כיתה יא׳ - 3 יחידות',
        nameEn: 'Grade 11 - 3 Units',
        emoji: '📖',
        topics: [
            {
                id: 'functions-comprehensive',
                name: 'פונקציות - חזרה מקיפה',
                nameEn: 'Functions - Comprehensive Review',
                icon: 'f(x)',
                difficulty: 'intermediate',
                subtopics: [
                    { id: 'all-functions-review', name: 'כל סוגי הפונקציות', nameEn: 'All Function Types' },
                    { id: 'transformations-review', name: 'טרנספורמציות', nameEn: 'Transformations' },
                    { id: 'graphing-review', name: 'שרטוט פונקציות', nameEn: 'Graphing Functions' }
                ]
            },
            {
                id: 'trigonometry-applications',
                name: 'יישומי טריגונומטריה',
                nameEn: 'Trigonometry Applications',
                icon: '∠',
                difficulty: 'intermediate',
                subtopics: [
                    { id: 'real-world-trig', name: 'בעיות מהחיים', nameEn: 'Real-World Problems' },
                    { id: 'navigation', name: 'ניווט וכיוונים', nameEn: 'Navigation' },
                    { id: 'surveying', name: 'מדידות שטח', nameEn: 'Surveying' }
                ]
            },
            {
                id: 'probability-comprehensive',
                name: 'הסתברות מקיפה',
                nameEn: 'Comprehensive Probability',
                icon: '🎲',
                difficulty: 'intermediate',
                subtopics: [
                    { id: 'probability-all-topics', name: 'כל נושאי ההסתברות', nameEn: 'All Probability Topics' },
                    { id: 'probability-problems', name: 'בעיות הסתברות', nameEn: 'Probability Problems' }
                ]
            },
            {
                id: 'statistics-comprehensive',
                name: 'סטטיסטיקה מקיפה',
                nameEn: 'Comprehensive Statistics',
                icon: '📊',
                difficulty: 'intermediate',
                subtopics: [
                    { id: 'data-analysis-complete', name: 'ניתוח נתונים מלא', nameEn: 'Complete Data Analysis' },
                    { id: 'statistical-inference-intro', name: 'מבוא להסקה סטטיסטית', nameEn: 'Intro to Statistical Inference' }
                ]
            }
        ]
    },

    // ========================================
    // כיתה יא׳ - 4 יחידות
    // ========================================
    grade_11_4: {
        id: 'grade_11_4',
        name: 'כיתה יא׳ - 4 יחידות',
        nameEn: 'Grade 11 - 4 Units',
        emoji: '🔬',
        topics: [
            {
                id: 'differential-calculus',
                name: 'חשבון דיפרנציאלי',
                nameEn: 'Differential Calculus',
                icon: "f'(x)",
                difficulty: 'advanced',
                subtopics: [
                    { id: 'derivative-review', name: 'חזרה נגזרות', nameEn: 'Derivative Review' },
                    { id: 'power-rule', name: 'כלל החזקה', nameEn: 'Power Rule' },
                    { id: 'product-rule', name: 'כלל המכפלה', nameEn: 'Product Rule' },
                    { id: 'quotient-rule', name: 'כלל המנה', nameEn: 'Quotient Rule' },
                    { id: 'chain-rule', name: 'כלל השרשרת', nameEn: 'Chain Rule' },
                    { id: 'implicit-differentiation', name: 'גזירה סתומה', nameEn: 'Implicit Differentiation' },
                    { id: 'higher-derivatives', name: 'נגזרות מסדר גבוה', nameEn: 'Higher Order Derivatives' },
                    { id: 'logarithmic-differentiation', name: 'גזירה לוגריתמית', nameEn: 'Logarithmic Differentiation' }
                ]
            },
            {
                id: 'derivative-applications',
                name: 'יישומי נגזרת',
                nameEn: 'Derivative Applications',
                icon: '📈',
                difficulty: 'advanced',
                subtopics: [
                    { id: 'tangent-normal', name: 'משיק ונורמל', nameEn: 'Tangent and Normal' },
                    { id: 'increasing-decreasing', name: 'עלייה וירידה', nameEn: 'Increasing and Decreasing' },
                    { id: 'critical-points', name: 'נקודות קיצון', nameEn: 'Critical Points' },
                    { id: 'max-min-problems', name: 'בעיות מקסימום ומינימום', nameEn: 'Max-Min Problems' },
                    { id: 'concavity', name: 'קעירות וקמירות', nameEn: 'Concavity' },
                    { id: 'inflection-points', name: 'נקודות פיתול', nameEn: 'Inflection Points' },
                    { id: 'curve-sketching', name: 'שרטוט עקומות', nameEn: 'Curve Sketching' },
                    { id: 'optimization', name: 'אופטימיזציה', nameEn: 'Optimization' },
                    { id: 'related-rates', name: 'קצבי שינוי', nameEn: 'Related Rates' }
                ]
            },
            {
                id: 'limits-continuity',
                name: 'גבולות ורציפות',
                nameEn: 'Limits and Continuity',
                icon: 'lim',
                difficulty: 'advanced',
                subtopics: [
                    { id: 'function-limits', name: 'גבול פונקציה', nameEn: 'Function Limits' },
                    { id: 'limit-techniques', name: 'טכניקות חישוב גבולות', nameEn: 'Limit Techniques' },
                    { id: 'continuity', name: 'רציפות', nameEn: 'Continuity' },
                    { id: 'discontinuities', name: 'אי-רציפויות', nameEn: 'Discontinuities' },
                    { id: 'intermediate-value', name: 'משפט ערך הביניים', nameEn: 'Intermediate Value Theorem' }
                ]
            },
            {
                id: 'integral-intro',
                name: 'מבוא לאינטגרלים',
                nameEn: 'Introduction to Integrals',
                icon: '∫',
                difficulty: 'advanced',
                subtopics: [
                    { id: 'antiderivative-concept', name: 'מושג האנטי-נגזרת', nameEn: 'Antiderivative Concept' },
                    { id: 'indefinite-integral', name: 'אינטגרל לא מסוים', nameEn: 'Indefinite Integral' },
                    { id: 'basic-integrals', name: 'אינטגרלים בסיסיים', nameEn: 'Basic Integrals' },
                    { id: 'integration-techniques-basic', name: 'שיטות אינטגרציה בסיסיות', nameEn: 'Basic Integration Techniques' }
                ]
            },
            {
                id: 'conic-sections',
                name: 'חתכי חרוט',
                nameEn: 'Conic Sections',
                icon: '⭕',
                difficulty: 'advanced',
                subtopics: [
                    { id: 'circles-analytic', name: 'מעגלים - גאומטריה אנליטית', nameEn: 'Circles - Analytic Geometry' },
                    { id: 'parabolas', name: 'פרבולות', nameEn: 'Parabolas' },
                    { id: 'ellipses', name: 'אליפסות', nameEn: 'Ellipses' },
                    { id: 'hyperbolas', name: 'היפרבולות', nameEn: 'Hyperbolas' }
                ]
            },
            {
                id: 'probability-statistics-11',
                name: 'הסתברות וסטטיסטיקה',
                nameEn: 'Probability and Statistics',
                icon: '📊',
                difficulty: 'advanced',
                subtopics: [
                    { id: 'discrete-distributions', name: 'התפלגויות בדידות', nameEn: 'Discrete Distributions' },
                    { id: 'binomial-distribution', name: 'התפלגות בינומית', nameEn: 'Binomial Distribution' },
                    { id: 'expected-value-variance', name: 'תוחלת ושונות', nameEn: 'Expected Value and Variance' },
                    { id: 'normal-distribution-intro', name: 'התפלגות נורמלית - מבוא', nameEn: 'Normal Distribution Intro' }
                ]
            }
        ]
    },

    // ========================================
    // כיתה יא׳ - 5 יחידות
    // ========================================
    grade_11_5: {
        id: 'grade_11_5',
        name: 'כיתה יא׳ - 5 יחידות',
        nameEn: 'Grade 11 - 5 Units',
        emoji: '🏆',
        topics: [
            {
                id: 'advanced-derivatives',
                name: 'נגזרות מתקדמות',
                nameEn: 'Advanced Derivatives',
                icon: "f'(x)",
                difficulty: 'expert',
                subtopics: [
                    { id: 'all-derivative-rules', name: 'כל כללי הגזירה', nameEn: 'All Derivative Rules' },
                    { id: 'trig-derivatives', name: 'נגזרות פונקציות טריגונומטריות', nameEn: 'Trig Derivatives' },
                    { id: 'exponential-derivatives', name: 'נגזרות פונקציות מעריכיות', nameEn: 'Exponential Derivatives' },
                    { id: 'log-derivatives', name: 'נגזרות פונקציות לוגריתמיות', nameEn: 'Logarithmic Derivatives' },
                    { id: 'inverse-trig-derivatives', name: 'נגזרות פונקציות טריג. הפוכות', nameEn: 'Inverse Trig Derivatives' },
                    { id: 'parametric-derivatives', name: 'נגזרות פרמטריות', nameEn: 'Parametric Derivatives' }
                ]
            },
            {
                id: 'complex-numbers-advanced',
                name: 'מספרים מרוכבים מתקדם',
                nameEn: 'Advanced Complex Numbers',
                icon: 'z',
                difficulty: 'expert',
                subtopics: [
                    { id: 'polar-form', name: 'צורה קוטבית', nameEn: 'Polar Form' },
                    { id: 'de-moivre', name: 'נוסחת דה-מואבר', nameEn: "De Moivre's Formula" },
                    { id: 'complex-roots', name: 'שורשים מרוכבים', nameEn: 'Complex Roots' },
                    { id: 'complex-equations', name: 'משוואות במרוכבים', nameEn: 'Complex Equations' },
                    { id: 'complex-functions', name: 'פונקציות מרוכבות', nameEn: 'Complex Functions' }
                ]
            },
            {
                id: 'sequences-series-advanced',
                name: 'סדרות וטורים מתקדם',
                nameEn: 'Advanced Sequences and Series',
                icon: 'Σ',
                difficulty: 'expert',
                subtopics: [
                    { id: 'recursive-sequences', name: 'סדרות רקורסיביות', nameEn: 'Recursive Sequences' },
                    { id: 'series-tests', name: 'מבחני התכנסות', nameEn: 'Convergence Tests' },
                    { id: 'power-series', name: 'טורי חזקות', nameEn: 'Power Series' },
                    { id: 'taylor-series-intro', name: 'טור טיילור - מבוא', nameEn: 'Taylor Series Intro' }
                ]
            },
            {
                id: 'vectors-3d',
                name: 'וקטורים במרחב',
                nameEn: '3D Vectors',
                icon: '→',
                difficulty: 'expert',
                subtopics: [
                    { id: '3d-coordinates', name: 'מערכת צירים תלת-ממדית', nameEn: '3D Coordinate System' },
                    { id: 'vectors-3d-operations', name: 'פעולות בוקטורים במרחב', nameEn: '3D Vector Operations' },
                    { id: 'cross-product', name: 'מכפלה וקטורית', nameEn: 'Cross Product' },
                    { id: 'scalar-triple-product', name: 'מכפלה משולשת', nameEn: 'Scalar Triple Product' },
                    { id: 'lines-in-space', name: 'ישרים במרחב', nameEn: 'Lines in Space' },
                    { id: 'planes', name: 'מישורים', nameEn: 'Planes' },
                    { id: 'distance-3d', name: 'מרחקים במרחב', nameEn: '3D Distances' }
                ]
            },
            {
                id: 'matrices-intro',
                name: 'מטריצות - מבוא',
                nameEn: 'Introduction to Matrices',
                icon: '[ ]',
                difficulty: 'expert',
                subtopics: [
                    { id: 'matrix-basics', name: 'יסודות מטריצות', nameEn: 'Matrix Basics' },
                    { id: 'matrix-operations', name: 'פעולות במטריצות', nameEn: 'Matrix Operations' },
                    { id: 'matrix-multiplication', name: 'כפל מטריצות', nameEn: 'Matrix Multiplication' },
                    { id: 'determinants', name: 'דטרמיננטות', nameEn: 'Determinants' },
                    { id: 'inverse-matrices', name: 'מטריצות הפוכות', nameEn: 'Inverse Matrices' },
                    { id: 'systems-matrices', name: 'פתרון מערכות במטריצות', nameEn: 'Solving Systems with Matrices' }
                ]
            },
            {
                id: 'probability-advanced',
                name: 'הסתברות מתקדמת',
                nameEn: 'Advanced Probability',
                icon: '🎲',
                difficulty: 'expert',
                subtopics: [
                    { id: 'bayes-theorem', name: 'משפט בייס', nameEn: 'Bayes Theorem' },
                    { id: 'random-variables', name: 'משתנים מקריים', nameEn: 'Random Variables' },
                    { id: 'continuous-distributions', name: 'התפלגויות רציפות', nameEn: 'Continuous Distributions' },
                    { id: 'normal-distribution', name: 'התפלגות נורמלית', nameEn: 'Normal Distribution' },
                    { id: 'central-limit-theorem', name: 'משפט הגבול המרכזי', nameEn: 'Central Limit Theorem' }
                ]
            }
        ]
    },

    // ========================================
    // כיתה יב׳ - 3 יחידות
    // ========================================
    grade_12_3: {
        id: 'grade_12_3',
        name: 'כיתה יב׳ - 3 יחידות',
        nameEn: 'Grade 12 - 3 Units',
        emoji: '🎓',
        topics: [
            {
                id: 'bagrut-review-algebra',
                name: 'חזרה לבגרות - אלגברה',
                nameEn: 'Bagrut Review - Algebra',
                icon: 'x',
                difficulty: 'intermediate',
                subtopics: [
                    { id: 'equations-comprehensive', name: 'משוואות - חזרה מקיפה', nameEn: 'Equations Comprehensive' },
                    { id: 'functions-comprehensive', name: 'פונקציות - חזרה מקיפה', nameEn: 'Functions Comprehensive' },
                    { id: 'word-problems-comprehensive', name: 'בעיות מילוליות', nameEn: 'Word Problems' }
                ]
            },
            {
                id: 'bagrut-review-geometry',
                name: 'חזרה לבגרות - גאומטריה',
                nameEn: 'Bagrut Review - Geometry',
                icon: '📐',
                difficulty: 'intermediate',
                subtopics: [
                    { id: 'triangles-comprehensive', name: 'משולשים', nameEn: 'Triangles' },
                    { id: 'circles-comprehensive', name: 'מעגלים', nameEn: 'Circles' },
                    { id: 'area-volume-comprehensive', name: 'שטחים ונפחים', nameEn: 'Areas and Volumes' }
                ]
            },
            {
                id: 'bagrut-review-probability',
                name: 'חזרה לבגרות - הסתברות',
                nameEn: 'Bagrut Review - Probability',
                icon: '🎲',
                difficulty: 'intermediate',
                subtopics: [
                    { id: 'probability-all', name: 'כל נושאי ההסתברות', nameEn: 'All Probability Topics' },
                    { id: 'statistics-all', name: 'כל נושאי הסטטיסטיקה', nameEn: 'All Statistics Topics' }
                ]
            },
            {
                id: 'bagrut-practice',
                name: 'תרגול מבחני בגרות',
                nameEn: 'Bagrut Exam Practice',
                icon: '📝',
                difficulty: 'intermediate',
                subtopics: [
                    { id: 'past-exams', name: 'מבחנים קודמים', nameEn: 'Past Exams' },
                    { id: 'exam-strategies', name: 'אסטרטגיות למבחן', nameEn: 'Exam Strategies' },
                    { id: 'time-management', name: 'ניהול זמן', nameEn: 'Time Management' }
                ]
            }
        ]
    },

    // ========================================
    // כיתה יב׳ - 4 יחידות
    // ========================================
    grade_12_4: {
        id: 'grade_12_4',
        name: 'כיתה יב׳ - 4 יחידות',
        nameEn: 'Grade 12 - 4 Units',
        emoji: '🎓',
        topics: [
            {
                id: 'integrals',
                name: 'אינטגרלים',
                nameEn: 'Integrals',
                icon: '∫',
                difficulty: 'advanced',
                subtopics: [
                    { id: 'antiderivatives-review', name: 'אנטי-נגזרות - חזרה', nameEn: 'Antiderivatives Review' },
                    { id: 'integration-rules', name: 'כללי אינטגרציה', nameEn: 'Integration Rules' },
                    { id: 'substitution-method', name: 'שיטת ההצבה', nameEn: 'Substitution Method' },
                    { id: 'integration-by-parts', name: 'אינטגרציה בחלקים', nameEn: 'Integration by Parts' },
                    { id: 'definite-integrals', name: 'אינטגרלים מסוימים', nameEn: 'Definite Integrals' },
                    { id: 'fundamental-theorem', name: 'המשפט היסודי של החשבון האינטגרלי', nameEn: 'Fundamental Theorem of Calculus' },
                    { id: 'area-under-curve', name: 'שטח מתחת לעקומה', nameEn: 'Area Under Curve' },
                    { id: 'area-between-curves', name: 'שטח בין עקומות', nameEn: 'Area Between Curves' }
                ]
            },
            {
                id: 'integral-applications',
                name: 'יישומי אינטגרלים',
                nameEn: 'Integral Applications',
                icon: '📊',
                difficulty: 'advanced',
                subtopics: [
                    { id: 'volume-revolution', name: 'נפח גוף סיבוב', nameEn: 'Volume of Revolution' },
                    { id: 'arc-length', name: 'אורך קשת', nameEn: 'Arc Length' },
                    { id: 'average-value', name: 'ערך ממוצע', nameEn: 'Average Value' },
                    { id: 'work-problems', name: 'בעיות עבודה', nameEn: 'Work Problems' }
                ]
            },
            {
                id: 'differential-equations-intro',
                name: 'משוואות דיפרנציאליות - מבוא',
                nameEn: 'Differential Equations Intro',
                icon: 'dy/dx',
                difficulty: 'advanced',
                subtopics: [
                    { id: 'de-basics', name: 'יסודות משוואות דיפרנציאליות', nameEn: 'DE Basics' },
                    { id: 'separable-de', name: 'משוואות פרידות', nameEn: 'Separable Equations' },
                    { id: 'first-order-de', name: 'משוואות מסדר ראשון', nameEn: 'First Order DE' },
                    { id: 'de-applications', name: 'יישומי משוואות דיפרנציאליות', nameEn: 'DE Applications' }
                ]
            },
            {
                id: 'sequences-comprehensive',
                name: 'סדרות וטורים - חזרה מקיפה',
                nameEn: 'Sequences and Series Comprehensive',
                icon: 'Σ',
                difficulty: 'advanced',
                subtopics: [
                    { id: 'all-sequences', name: 'כל סוגי הסדרות', nameEn: 'All Sequence Types' },
                    { id: 'series-convergence', name: 'התכנסות טורים', nameEn: 'Series Convergence' }
                ]
            },
            {
                id: 'bagrut-review-4',
                name: 'חזרה לבגרות 4 יחידות',
                nameEn: 'Bagrut Review 4 Units',
                icon: '📝',
                difficulty: 'advanced',
                subtopics: [
                    { id: 'calculus-review', name: 'חזרה חשבון דיפרנציאלי ואינטגרלי', nameEn: 'Calculus Review' },
                    { id: 'functions-advanced-review', name: 'פונקציות מתקדמות', nameEn: 'Advanced Functions' },
                    { id: 'bagrut-4-practice', name: 'תרגול מבחני בגרות', nameEn: 'Bagrut Practice' }
                ]
            }
        ]
    },

    // ========================================
    // כיתה יב׳ - 5 יחידות
    // ========================================
    grade_12_5: {
        id: 'grade_12_5',
        name: 'כיתה יב׳ - 5 יחידות',
        nameEn: 'Grade 12 - 5 Units',
        emoji: '🏆',
        topics: [
            {
                id: 'integrals-advanced',
                name: 'אינטגרלים מתקדמים',
                nameEn: 'Advanced Integrals',
                icon: '∫',
                difficulty: 'expert',
                subtopics: [
                    { id: 'integration-techniques', name: 'שיטות אינטגרציה', nameEn: 'Integration Techniques' },
                    { id: 'trig-substitution', name: 'הצבות טריגונומטריות', nameEn: 'Trigonometric Substitution' },
                    { id: 'partial-fractions', name: 'פירוק לשברים חלקיים', nameEn: 'Partial Fractions' },
                    { id: 'improper-integrals', name: 'אינטגרלים לא אמיתיים', nameEn: 'Improper Integrals' },
                    { id: 'numerical-integration', name: 'אינטגרציה נומרית', nameEn: 'Numerical Integration' }
                ]
            },
            {
                id: 'differential-equations',
                name: 'משוואות דיפרנציאליות',
                nameEn: 'Differential Equations',
                icon: "dy/dx",
                difficulty: 'expert',
                subtopics: [
                    { id: 'separable-equations', name: 'משוואות פרידות', nameEn: 'Separable Equations' },
                    { id: 'exact-equations', name: 'משוואות מדויקות', nameEn: 'Exact Equations' },
                    { id: 'linear-first-order', name: 'משוואות לינאריות מסדר ראשון', nameEn: 'First Order Linear' },
                    { id: 'homogeneous-equations', name: 'משוואות הומוגניות', nameEn: 'Homogeneous Equations' },
                    { id: 'second-order-de', name: 'משוואות מסדר שני', nameEn: 'Second Order DE' },
                    { id: 'de-systems', name: 'מערכות משוואות דיפרנציאליות', nameEn: 'Systems of DE' },
                    { id: 'applications-de-advanced', name: 'יישומים מתקדמים', nameEn: 'Advanced Applications' }
                ]
            },
            {
                id: 'vectors-advanced',
                name: 'וקטורים במרחב - מתקדם',
                nameEn: 'Advanced 3D Vectors',
                icon: '→',
                difficulty: 'expert',
                subtopics: [
                    { id: 'vector-calculus-intro', name: 'חשבון וקטורי - מבוא', nameEn: 'Vector Calculus Intro' },
                    { id: 'parametric-curves', name: 'עקומות פרמטריות במרחב', nameEn: 'Parametric Curves in Space' },
                    { id: 'vector-functions', name: 'פונקציות וקטוריות', nameEn: 'Vector Functions' },
                    { id: 'arc-length-3d', name: 'אורך קשת במרחב', nameEn: 'Arc Length in 3D' },
                    { id: 'curvature', name: 'עקמומיות', nameEn: 'Curvature' }
                ]
            },
            {
                id: 'series-advanced',
                name: 'טורים מתקדמים',
                nameEn: 'Advanced Series',
                icon: 'Σ',
                difficulty: 'expert',
                subtopics: [
                    { id: 'convergence-tests-advanced', name: 'מבחני התכנסות מתקדמים', nameEn: 'Advanced Convergence Tests' },
                    { id: 'power-series-advanced', name: 'טורי חזקות', nameEn: 'Power Series' },
                    { id: 'taylor-maclaurin', name: 'טורי טיילור ומקלורן', nameEn: 'Taylor and Maclaurin Series' },
                    { id: 'fourier-series-intro', name: 'טורי פורייה - מבוא', nameEn: 'Fourier Series Intro' }
                ]
            },
            {
                id: 'multivariable-intro',
                name: 'פונקציות של מספר משתנים - מבוא',
                nameEn: 'Multivariable Functions Intro',
                icon: 'f(x,y)',
                difficulty: 'expert',
                subtopics: [
                    { id: 'functions-two-variables', name: 'פונקציות של שני משתנים', nameEn: 'Functions of Two Variables' },
                    { id: 'partial-derivatives', name: 'נגזרות חלקיות', nameEn: 'Partial Derivatives' },
                    { id: 'gradient', name: 'גרדיאנט', nameEn: 'Gradient' },
                    { id: 'double-integrals-intro', name: 'אינטגרלים כפולים - מבוא', nameEn: 'Double Integrals Intro' }
                ]
            },
            {
                id: 'probability-statistics-5',
                name: 'הסתברות וסטטיסטיקה מתקדמת',
                nameEn: 'Advanced Probability and Statistics',
                icon: '📊',
                difficulty: 'expert',
                subtopics: [
                    { id: 'continuous-distributions-advanced', name: 'התפלגויות רציפות מתקדמות', nameEn: 'Advanced Continuous Distributions' },
                    { id: 'joint-distributions', name: 'התפלגויות משותפות', nameEn: 'Joint Distributions' },
                    { id: 'moment-generating-functions', name: 'פונקציות יוצרות מומנטים', nameEn: 'Moment Generating Functions' },
                    { id: 'hypothesis-testing', name: 'בדיקת השערות', nameEn: 'Hypothesis Testing' },
                    { id: 'confidence-intervals', name: 'רווחי סמך', nameEn: 'Confidence Intervals' }
                ]
            },
            {
                id: 'bagrut-review-5',
                name: 'חזרה לבגרות 5 יחידות',
                nameEn: 'Bagrut Review 5 Units',
                icon: '📝',
                difficulty: 'expert',
                subtopics: [
                    { id: 'comprehensive-calculus', name: 'חשבון אינפיניטסימלי מקיף', nameEn: 'Comprehensive Calculus' },
                    { id: 'comprehensive-algebra', name: 'אלגברה מקיפה', nameEn: 'Comprehensive Algebra' },
                    { id: 'comprehensive-geometry', name: 'גאומטריה אנליטית מקיפה', nameEn: 'Comprehensive Analytic Geometry' },
                    { id: 'bagrut-5-practice', name: 'תרגול מבחני בגרות מתקדמים', nameEn: 'Advanced Bagrut Practice' }
                ]
            }
        ]
    }
};

// ===== HELPER FUNCTIONS =====

export function getGradeConfig(gradeId) {
    return ISRAELI_CURRICULUM[gradeId] || null;
}

export function getTopicsByGrade(gradeId) {
    const grade = ISRAELI_CURRICULUM[gradeId];
    return grade ? grade.topics : [];
}

export function getSubtopics(gradeId, topicId) {
    const grade = ISRAELI_CURRICULUM[gradeId];
    if (!grade) return [];

    const topic = grade.topics.find(t => t.id === topicId);
    return topic ? topic.subtopics : [];
}

export function findTopicByName(gradeId, topicName) {
    const grade = ISRAELI_CURRICULUM[gradeId];
    if (!grade) return null;

    return grade.topics.find(t =>
        t.name === topicName || t.nameEn === topicName
    );
}

export function getAllGrades() {
    return Object.values(ISRAELI_CURRICULUM);
}

export function getUserGradeId(userGrade, userTrack) {
    let gradeId = `grade_${userGrade}`;

    // For high school (10-12), add track suffix
    if (parseInt(userGrade) >= 10 && userTrack) {
        if (userTrack.includes('3')) gradeId += '_3';
        else if (userTrack.includes('4')) gradeId += '_4';
        else if (userTrack.includes('5')) gradeId += '_5';
    }

    return gradeId;
}

// Count total subtopics for a grade
export function countSubtopics(gradeId) {
    const grade = ISRAELI_CURRICULUM[gradeId];
    if (!grade) return 0;

    return grade.topics.reduce((total, topic) => {
        return total + (topic.subtopics ? topic.subtopics.length : 0);
    }, 0);
}

// Get all topics across all grades
export function getAllTopics() {
    const allTopics = [];
    Object.values(ISRAELI_CURRICULUM).forEach(grade => {
        grade.topics.forEach(topic => {
            allTopics.push({
                ...topic,
                grade: grade.name,
                gradeId: grade.id
            });
        });
    });
    return allTopics;
}

// Search topics by keyword
export function searchTopics(keyword) {
    const results = [];
    const lowerKeyword = keyword.toLowerCase();

    Object.values(ISRAELI_CURRICULUM).forEach(grade => {
        grade.topics.forEach(topic => {
            if (topic.name.toLowerCase().includes(lowerKeyword) ||
                topic.nameEn.toLowerCase().includes(lowerKeyword)) {
                results.push({
                    ...topic,
                    grade: grade.name,
                    gradeId: grade.id
                });
            }

            // Also search in subtopics
            topic.subtopics?.forEach(subtopic => {
                if (subtopic.name.toLowerCase().includes(lowerKeyword) ||
                    subtopic.nameEn.toLowerCase().includes(lowerKeyword)) {
                    results.push({
                        ...subtopic,
                        parentTopic: topic.name,
                        grade: grade.name,
                        gradeId: grade.id
                    });
                }
            });
        });
    });

    return results;
}

// Default export
export default ISRAELI_CURRICULUM;