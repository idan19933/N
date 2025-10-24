import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Sparkles, BookOpen, Target, Lightbulb } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

const NexonAsk = () => {
    const { user } = useAuthStore();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: 'שלום! 👋 אני נקסון, העוזר שלך במתמטיקה. אפשר לשאול אותי כל שאלה במתמטיקה, ואני אעזור לך להבין את החומר ואמליץ על אסטרטגיות תרגול!'
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const quickQuestions = [
        { icon: Lightbulb, text: 'איך משפרים בגיאומטריה?', action: 'איך אני יכול להשתפר בגיאומטריה?' },
        { icon: Target, text: 'במה כדאי להתמקד?', action: 'על סמך ההתקדמות שלי, במה כדאי לי להתמקד?' },
        { icon: BookOpen, text: 'תן לי אסטרטגיית תרגול', action: 'תן לי המלצה לאסטרטגיית תרגול מותאמת אישית' }
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
                conversationHistory: messages.slice(-6)
            });

            const assistantMessage = {
                role: 'assistant',
                content: response.data.response,
                recommendations: response.data.recommendations
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Chat error:', error);
            toast.error('שגיאה בשיחה עם נקסון');
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'סליחה, נתקלתי בבעיה. אפשר לנסות שוב?'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickQuestion = (question) => {
        setInput(question);
        setTimeout(() => handleSend(), 100);
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
                        className="fixed bottom-6 left-6 z-50 w-96 h-[600px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden"
                        dir="rtl"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-full">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg">נקסון שואלים</h3>
                                    <p className="text-white/80 text-xs">העוזר שלך במתמטיקה</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                            {messages.map((msg, idx) => (
                                <div
                                    key={idx}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] p-3 rounded-2xl ${
                                            msg.role === 'user'
                                                ? 'bg-purple-600 text-white'
                                                : 'bg-white text-gray-900 shadow-md'
                                        }`}
                                    >
                                        {/* ✅ FIXED: Removed className from ReactMarkdown */}
                                        <div className="text-sm prose prose-sm max-w-none markdown-content">
                                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                                        </div>

                                        {msg.recommendations && (
                                            <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                                                {msg.recommendations.map((rec, i) => (
                                                    <button
                                                        key={i}
                                                        className="w-full text-right p-2 bg-purple-50 hover:bg-purple-100 rounded-lg text-sm transition-colors"
                                                    >
                                                        {rec}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white p-3 rounded-2xl shadow-md">
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
                                <p className="text-xs text-gray-600 font-medium mb-2">שאלות מהירות:</p>
                                {quickQuestions.map((q, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleQuickQuestion(q.action)}
                                        className="w-full flex items-center gap-2 p-2 bg-purple-50 hover:bg-purple-100 rounded-lg text-sm transition-colors text-right"
                                    >
                                        <q.icon className="w-4 h-4 text-purple-600" />
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
                                    className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                                    disabled={isLoading}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim() || isLoading}
                                    className="p-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ✅ Add custom CSS for markdown styling */}
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
                }
                .markdown-content li {
                    margin-bottom: 0.25rem;
                }
            `}</style>
        </>
    );
};

export default NexonAsk;