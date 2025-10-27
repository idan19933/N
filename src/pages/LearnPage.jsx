// pages/LearnPage.jsx - EXAMPLE USAGE WITH PROPER INTEGRATION
import React, { useState, useCallback, memo } from 'react';
import LearningContent from '../components/LearningContent';
import '../styles/LearningContent.css';

const LearnPage = memo(() => {
    // State for topic selection
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [selectedSubtopic, setSelectedSubtopic] = useState(null);
    const [selectedGrade, setSelectedGrade] = useState('7');
    const [selectedPersonality, setSelectedPersonality] = useState('nexon');
    const [showContent, setShowContent] = useState(false);

    // Topics from your curriculum
    const topics = [
        { id: 1, name: 'חיבור וחיסור', subtopics: ['חיבור מספרים', 'חיסור מספרים', 'תרגילים משולבים'] },
        { id: 2, name: 'כפל וחילוק', subtopics: ['כפל מספרים', 'חילוק מספרים', 'סדר פעולות'] },
        { id: 3, name: 'שברים', subtopics: ['הכרת שברים', 'חיבור וחיסור שברים', 'כפל וחילוק שברים'] },
        { id: 4, name: 'גיאומטריה', subtopics: ['צורות גיאומטריות', 'שטח והיקף', 'זוויות'] },
        { id: 5, name: 'אלגברה', subtopics: ['משתנים', 'משוואות פשוטות', 'פתרון בעיות'] }
    ];

    const grades = ['6', '7', '8', '9'];
    const personalities = [
        { id: 'nexon', name: 'נקסון', emoji: '🤖' },
        { id: 'dina', name: 'דינה', emoji: '👩‍🏫' },
        { id: 'ron', name: 'רון', emoji: '🏃‍♂️' }
    ];

    // Memoized handlers to prevent re-renders
    const handleTopicSelect = useCallback((topic) => {
        setSelectedTopic(topic);
        setSelectedSubtopic(null);
        setShowContent(false);
    }, []);

    const handleSubtopicSelect = useCallback((subtopic) => {
        setSelectedSubtopic(subtopic);
    }, []);

    const handleStartLearning = useCallback(() => {
        if (selectedTopic) {
            setShowContent(true);
        }
    }, [selectedTopic]);

    const handleBackToMenu = useCallback(() => {
        setShowContent(false);
        setSelectedTopic(null);
        setSelectedSubtopic(null);
    }, []);

    // If showing content, render only the LearningContent component
    if (showContent && selectedTopic) {
        return (
            <div className="learn-page" dir="rtl">
                <button onClick={handleBackToMenu} className="back-btn">
                    ← חזרה לתפריט
                </button>
                <LearningContent
                    topic={selectedTopic.name}
                    subtopic={selectedSubtopic}
                    grade={selectedGrade}
                    personality={selectedPersonality}
                />
            </div>
        );
    }

    // Topic selection menu
    return (
        <div className="learn-page menu" dir="rtl">
            <div className="learn-container">
                <h1>📚 מרכז הלימוד</h1>
                <p className="subtitle">בחר נושא להתחיל ללמוד</p>

                {/* Grade Selection */}
                <div className="selection-section">
                    <h3>בחר כיתה:</h3>
                    <div className="grade-selector">
                        {grades.map(grade => (
                            <button
                                key={grade}
                                onClick={() => setSelectedGrade(grade)}
                                className={`grade-btn ${selectedGrade === grade ? 'active' : ''}`}
                            >
                                כיתה {grade}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Personality Selection */}
                <div className="selection-section">
                    <h3>בחר מורה:</h3>
                    <div className="personality-selector">
                        {personalities.map(p => (
                            <button
                                key={p.id}
                                onClick={() => setSelectedPersonality(p.id)}
                                className={`personality-btn ${selectedPersonality === p.id ? 'active' : ''}`}
                            >
                                <span className="emoji">{p.emoji}</span>
                                <span className="name">{p.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Topic Selection */}
                <div className="selection-section">
                    <h3>בחר נושא:</h3>
                    <div className="topics-grid">
                        {topics.map(topic => (
                            <div
                                key={topic.id}
                                className={`topic-card ${selectedTopic?.id === topic.id ? 'selected' : ''}`}
                                onClick={() => handleTopicSelect(topic)}
                            >
                                <h4>{topic.name}</h4>
                                <p className="subtopic-count">
                                    {topic.subtopics.length} תתי-נושאים
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Subtopic Selection */}
                {selectedTopic && (
                    <div className="selection-section subtopics">
                        <h3>בחר תת-נושא (אופציונלי):</h3>
                        <div className="subtopics-list">
                            <button
                                onClick={() => handleSubtopicSelect(null)}
                                className={`subtopic-btn ${selectedSubtopic === null ? 'active' : ''}`}
                            >
                                כל הנושא
                            </button>
                            {selectedTopic.subtopics.map((subtopic, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSubtopicSelect(subtopic)}
                                    className={`subtopic-btn ${selectedSubtopic === subtopic ? 'active' : ''}`}
                                >
                                    {subtopic}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Start Button */}
                {selectedTopic && (
                    <button
                        onClick={handleStartLearning}
                        className="start-learning-btn"
                    >
                        🚀 התחל ללמוד!
                    </button>
                )}
            </div>
        </div>
    );
}, () => true); // Prevent unnecessary re-renders

LearnPage.displayName = 'LearnPage';

export default LearnPage;
