// src/components/chat/NexonAsk.jsx - INTELLIGENT VERSION WITH REAL DATA & LINKS
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageCircle, X, Send, Sparkles, BookOpen, Target, Lightbulb,
    TrendingUp, Award, Play, BarChart3
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

const NexonAsk = ({ onNavigateToTopic }) => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: 'שלום! 👋 אני נקסון, העוזר החכם שלך במתמטיקה.\n\nאני יכול:\n- לענות על שאלות במתמטיקה 📚\n- לנתח את ההתקדמות שלך 📊\n- להמליץ על נושאים לתרגול 🎯\n- לספק קישורים ישירים לתרגול 🔗\n\nמה תרצה לדעת?'
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [studentInsights, setStudentInsights] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Load student insights when opening
    useEffect(() => {
        if (isOpen && user?.uid && !studentInsights) {
            loadStudentInsights();
        }
    }, [isOpen, user]);

    const loadStudentInsights = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/chat/student-insights`, {
                params: { userId: user.uid }
            });

            if (response.data.success) {
                setStudentInsights(response.data.insights);
                console.log('✅ Student insights loaded:', response.data.insights);
            }
        } catch (error) {
            console.error('❌ Error loading insights:', error);
        }
    };

    const quickQuestions = [
        {
            icon: Lightbulb,
            text: 'איך אני יכול להשתפר?',
            action: 'על סמך ההתקדמות שלי, במה אני צריך להתמקד כדי להשתפר?'
        },
        {
            icon: Target,
            text: 'מה הנושאים החלשים שלי?',
            action: 'מה הנושאים שאני הכי חלש בהם? תן לי קישורים לתרגול'
        },
        {
            icon: BookOpen,
            text: 'תן לי אסטרטגיית תרגול',
            action: 'תן לי המלצה לאסטרטגיית תרגול מותאמת אישית עם קישורים לנושאים'
        },
        {
            icon: TrendingUp,
            text: 'איך ההתקדמות שלי?',
            action: 'נתח את ההתקדמות שלי במתמטיקה. באילו נושאים אני טוב ובאילו צריך לשפר?'
        }
    ];

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await axios.post(`${API_URL}/api/chat/nexon-ask`, {
                userId: user?.uid,
                message: input,
                conversationHistory: messages.slice(-6) // Last 3 exchanges
            });

            if (response.data.success) {
                const assistantMessage = {
                    role: 'assistant',
                    content: response.data.response,
                    recommendations: response.data.recommendations,
                    insights: response.data.studentInsights
                };

                setMessages(prev => [...prev, assistantMessage]);

                // Update insights if provided
                if (response.data.studentInsights) {
                    setStudentInsights(response.data.studentInsights);
                }
            } else {
                throw new Error(response.data.error || 'Unknown error');
            }

        } catch (error) {
            console.error('❌ Chat error:', error);

            let errorMessage = 'סליחה, נתקלתי בבעיה. ';

            if (error.response?.status === 500) {
                errorMessage += 'אנא ודא שהשרת פועל ושה-API key של Anthropic מוגדר.';
            } else if (error.response?.status === 400) {
                errorMessage += 'בקשה לא תקינה.';
            } else {
                errorMessage += 'אפשר לנסות שוב?';
            }

            toast.error(errorMessage);

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: errorMessage
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickQuestion = (question) => {
        setInput(question);
        setTimeout(() => handleSend(), 100);
    };

    const handleRecommendationClick = (recommendation) => {
        console.log('🎯 Recommendation clicked:', recommendation);

        if (recommendation.type === 'practice') {
            // Close chat
            setIsOpen(false);

            // Navigate to topic practice
            if (onNavigateToTopic) {
                onNavigateToTopic({
                    id: recommendation.topicId || recommendation.topic,
                    name: recommendation.topic,
                    subtopic: {
                        id: recommendation.subtopicId || recommendation.subtopic,
                        name: recommendation.subtopic
                    }
                });
            } else {
                // Fallback: Show message to practice
                toast.success(`כדי לתרגל ${recommendation.title}, לך למסך התרגול הראשי`);
            }
        }
    };

    // Custom renderer for markdown with links
    const renderers = {
        a: ({ href, children }) => {
            // Check if it's a topic link
            const topicMatch = href?.match(/^topic:([^:]+):([^:]+)$/);

            if (topicMatch) {
                const [, topicId, subtopicId] = topicMatch;
                return (
                    <button
                        onClick={() => handleRecommendationClick({
                            type: 'practice',
                            title: children[0],
                            topicId,
                            subtopicId
                        })}
                        className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-700 font-bold underline"
                    >
                        <Play className="w-3 h-3" />
                        {children}
                    </button>
                );
            }

            // Regular link
            return (
                <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 underline"
                >
                    {children}
                </a>
            );
        }
    };

    return (
        <>
            {/* Floating Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-6 left-6 z-50 p-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all"
                    >
                        <MessageCircle className="w-6 h-6" />
                        <motion.div
                            className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                        />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-6 left-6 z-50 w-[450px] h-[650px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden"
                        dir="rtl"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-full">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg">נקסון - העוזר החכם</h3>
                                    <p className="text-white/80 text-xs">מבוסס על הנתונים שלך 📊</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>

                        {/* Student Insights Banner */}
                        {studentInsights && (
                            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 border-b flex items-center justify-around text-center">
                                <div>
                                    <div className="text-2xl font-black text-purple-600">
                                        {studentInsights.overallAccuracy}%
                                    </div>
                                    <div className="text-xs text-gray-600">דיוק כללי</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-black text-red-600">
                                        {studentInsights.weakTopics?.length || 0}
                                    </div>
                                    <div className="text-xs text-gray-600">נושאים לשיפור</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-black text-green-600">
                                        {studentInsights.strongTopics?.length || 0}
                                    </div>
                                    <div className="text-xs text-gray-600">נושאים חזקים</div>
                                </div>
                            </div>
                        )}

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] p-4 rounded-2xl ${
                                            msg.role === 'user'
                                                ? 'bg-purple-600 text-white'
                                                : 'bg-white text-gray-900 shadow-md'
                                        }`}
                                    >
                                        <div className="text-sm leading-relaxed markdown-content">
                                            <ReactMarkdown components={renderers}>
                                                {msg.content}
                                            </ReactMarkdown>
                                        </div>

                                        {/* Recommendations */}
                                        {msg.recommendations && msg.recommendations.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                                                <div className="text-xs font-bold text-gray-600 mb-2">
                                                    💡 המלצות לתרגול:
                                                </div>
                                                {msg.recommendations.map((rec, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => handleRecommendationClick(rec)}
                                                        className="w-full text-right p-3 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-xl text-sm transition-all flex items-center justify-between group border-2 border-transparent hover:border-purple-300"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <Play className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
                                                            <span className="font-medium text-gray-800">
                                                                {rec.title}
                                                            </span>
                                                        </div>
                                                        {rec.accuracy !== undefined && (
                                                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                                                                rec.accuracy < 60
                                                                    ? 'bg-red-100 text-red-700'
                                                                    : 'bg-yellow-100 text-yellow-700'
                                                            }`}>
                                                                {rec.accuracy}%
                                                            </span>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white p-4 rounded-2xl shadow-md">
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" />
                                            <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                                            <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Questions */}
                        {messages.length === 1 && (
                            <div className="p-4 space-y-2 bg-white border-t">
                                <p className="text-xs text-gray-600 font-medium mb-2">🚀 שאלות מהירות:</p>
                                {quickQuestions.map((q, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleQuickQuestion(q.action)}
                                        className="w-full flex items-center gap-2 p-2 bg-purple-50 hover:bg-purple-100 rounded-lg text-sm transition-colors text-right group"
                                    >
                                        <q.icon className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
                                        <span>{q.text}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Input */}
                        <div className="p-4 bg-white border-t">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="שאל את נקסון..."
                                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none text-sm"
                                    disabled={isLoading}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim() || isLoading}
                                    className="px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Custom CSS for markdown */}
            <style jsx>{`
                .markdown-content p {
                    margin-bottom: 0.5rem;
                }
                .markdown-content strong {
                    font-weight: 600;
                }
                .markdown-content ul, .markdown-content ol {
                    padding-right: 1.5rem;
                    margin-top: 0.5rem;
                    margin-bottom: 0.5rem;
                }
                .markdown-content li {
                    margin-bottom: 0.25rem;
                }
                .markdown-content h3 {
                    font-size: 1.1em;
                    font-weight: bold;
                    margin-top: 0.75rem;
                    margin-bottom: 0.5rem;
                }
            `}</style>
        </>
    );
};

export default NexonAsk;