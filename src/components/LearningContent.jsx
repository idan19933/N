// components/LearningContent.jsx - FIXED VERSION FOR YOUR PROJECT
import React, { useState, useEffect, useCallback, useRef, memo } from 'react';
import useAuthStore from '../store/authStore';

const LearningContent = memo(({ topic, subtopic, grade, personality }) => {
    const [content, setContent] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [quizAnswers, setQuizAnswers] = useState({});
    const [showSolution, setShowSolution] = useState({});
    
    // Refs to prevent duplicate calls
    const contentLoadedRef = useRef(false);
    const loadingRef = useRef(false);

    // Get user from your auth store
    const user = useAuthStore(state => state.user);

    // Memoized getUserId function
    const getUserId = useCallback(() => {
        return user?.uid || 'anonymous';
    }, [user]);

    // Memoized function to generate content
    const generateContent = useCallback(async () => {
        // Prevent duplicate calls
        if (loadingRef.current || contentLoadedRef.current) {
            console.log('⏭️ Skipping duplicate content generation');
            return;
        }

        console.log('🎓 Starting content generation...');
        loadingRef.current = true;
        setLoading(true);
        setError(null);

        try {
            const userId = getUserId();
            const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

            const response = await fetch(`${API_BASE_URL}/api/learning/generate-content`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    topic,
                    subtopic,
                    grade,
                    personality,
                    userId
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate content');
            }

            if (data.success && data.content) {
                console.log('✅ Content generated successfully:', data.content.title);
                setContent(data.content);
                contentLoadedRef.current = true;
                setCurrentPage(0);
                setQuizAnswers({});
                setShowSolution({});
            } else {
                throw new Error('Invalid response format');
            }

        } catch (err) {
            console.error('❌ Error generating content:', err);
            setError(err.message);
        } finally {
            setLoading(false);
            loadingRef.current = false;
        }
    }, [topic, subtopic, grade, personality, getUserId]);

    // Load content when component mounts or parameters change
    useEffect(() => {
        // Reset refs when parameters change
        contentLoadedRef.current = false;
        setContent(null);
        
        generateContent();
    }, [topic, subtopic, grade, personality]); // Only depend on actual props, not the function

    // Memoized handlers
    const handleNextPage = useCallback(() => {
        if (content && currentPage < content.pages.length - 1) {
            setCurrentPage(prev => prev + 1);
            setQuizAnswers({});
            setShowSolution({});
        }
    }, [content, currentPage]);

    const handlePrevPage = useCallback(() => {
        if (currentPage > 0) {
            setCurrentPage(prev => prev - 1);
            setQuizAnswers({});
            setShowSolution({});
        }
    }, [currentPage]);

    const handleAnswerSelect = useCallback((questionIndex, answerIndex) => {
        setQuizAnswers(prev => ({
            ...prev,
            [questionIndex]: answerIndex
        }));
    }, []);

    const handleCheckAnswer = useCallback((questionIndex, correctAnswer) => {
        setShowSolution(prev => ({
            ...prev,
            [questionIndex]: true
        }));
    }, []);

    const handleRetry = useCallback(() => {
        contentLoadedRef.current = false;
        loadingRef.current = false;
        setError(null);
        generateContent();
    }, [generateContent]);

    if (loading) {
        return (
            <div className="learning-content loading">
                <div className="spinner"></div>
                <p>טוען תוכן לימוד...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="learning-content error">
                <h3>⚠️ שגיאה</h3>
                <p>{error}</p>
                <button onClick={handleRetry} className="retry-btn">
                    נסה שוב
                </button>
            </div>
        );
    }

    if (!content) {
        return (
            <div className="learning-content empty">
                <p>אין תוכן זמין</p>
            </div>
        );
    }

    const currentPageData = content.pages[currentPage];

    return (
        <div className="learning-content" dir="rtl">
            <div className="learning-header">
                <h2>{content.title}</h2>
                <p className="introduction">{content.introduction}</p>
                <div className="page-indicator">
                    עמוד {currentPage + 1} מתוך {content.pages.length}
                </div>
            </div>

            <div className="learning-page">
                <h3 className="page-title">{currentPageData.title}</h3>

                <div className="page-content">
                    {currentPageData.content.map((item, index) => (
                        <div key={index} className={`content-item ${item.type}`}>
                            {item.type === 'text' && (
                                <p className="content-text">{item.value}</p>
                            )}

                            {item.type === 'example' && (
                                <div className="content-example">
                                    <div className="example-label">דוגמה:</div>
                                    <div className="example-value">{item.value}</div>
                                    {item.solution && (
                                        <div className="example-solution">
                                            <strong>פתרון:</strong> {item.solution}
                                        </div>
                                    )}
                                </div>
                            )}

                            {item.type === 'tip' && (
                                <div className="content-tip">
                                    <span className="tip-icon">💡</span>
                                    <span className="tip-text">{item.value}</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {currentPageData.quiz && currentPageData.quiz.length > 0 && (
                    <div className="page-quiz">
                        <h4>שאלות לתרגול</h4>
                        {currentPageData.quiz.map((question, qIndex) => (
                            <div key={qIndex} className="quiz-question">
                                <p className="question-text">{question.question}</p>
                                <div className="question-options">
                                    {question.options.map((option, oIndex) => {
                                        const isSelected = quizAnswers[qIndex] === oIndex;
                                        const isCorrect = question.correctAnswer === oIndex;
                                        const showAnswer = showSolution[qIndex];

                                        return (
                                            <button
                                                key={oIndex}
                                                onClick={() => handleAnswerSelect(qIndex, oIndex)}
                                                className={`option-btn ${isSelected ? 'selected' : ''} ${
                                                    showAnswer ? (isCorrect ? 'correct' : isSelected ? 'incorrect' : '') : ''
                                                }`}
                                                disabled={showAnswer}
                                            >
                                                {option}
                                            </button>
                                        );
                                    })}
                                </div>

                                {quizAnswers[qIndex] !== undefined && !showSolution[qIndex] && (
                                    <button
                                        onClick={() => handleCheckAnswer(qIndex, question.correctAnswer)}
                                        className="check-answer-btn"
                                    >
                                        בדוק תשובה
                                    </button>
                                )}

                                {showSolution[qIndex] && (
                                    <div className={`answer-feedback ${
                                        quizAnswers[qIndex] === question.correctAnswer ? 'correct' : 'incorrect'
                                    }`}>
                                        <p>
                                            {quizAnswers[qIndex] === question.correctAnswer ? '✅ נכון!' : '❌ לא נכון'}
                                        </p>
                                        <p className="explanation">{question.explanation}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="learning-navigation">
                <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 0}
                    className="nav-btn prev-btn"
                >
                    ← עמוד קודם
                </button>

                <button
                    onClick={handleNextPage}
                    disabled={currentPage === content.pages.length - 1}
                    className="nav-btn next-btn"
                >
                    עמוד הבא →
                </button>
            </div>
        </div>
    );
}, (prevProps, nextProps) => {
    // Deep comparison to prevent unnecessary re-renders
    return (
        prevProps.topic === nextProps.topic &&
        prevProps.subtopic === nextProps.subtopic &&
        prevProps.grade === nextProps.grade &&
        prevProps.personality === nextProps.personality
    );
});

LearningContent.displayName = 'LearningContent';

export default LearningContent;
