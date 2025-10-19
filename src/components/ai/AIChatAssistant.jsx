// src/components/ai/AIChatAssistant.jsx - COMPLETE WORKING VERSION
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader, Lightbulb, BookOpen, Calculator, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

const AIChatAssistant = ({ context }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (context && messages.length === 0) {
            const welcomeMessage = {
                role: 'assistant',
                content: `היי ${context.studentName}! 👋

אני כאן לעזור לך עם השאלה: **${context.question}**

איך אני יכול לעזור?
- 💡 **רמזים קטנים** - אתחיל עדין ואכוון אותך
- 🤔 **מה הצעד הבא?** - אסביר איך להמשיך
- ✅ **בדיקת כיוון** - אבדוק אם אתה בכיוון הנכון
- 📖 **פתרון מלא** - אראה לך את כל השלבים בפירוט

פשוט שאל מה שאתה צריך! 😊`
            };
            setMessages([welcomeMessage]);
        }
    }, [context]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const quickActions = [
        {
            label: '💡 תן לי רמז',
            prompt: 'תן לי רמז קטן שיעזור לי להתחיל',
            icon: Lightbulb,
            color: 'yellow'
        },
        {
            label: '🤔 מה הצעד הבא?',
            prompt: 'אני לא יודע איך להמשיך, מה הצעד הבא?',
            icon: AlertCircle,
            color: 'orange'
        },
        {
            label: '✅ בדוק כיוון',
            prompt: `האם אני בכיוון הנכון?`,
            icon: Calculator,
            color: 'blue'
        },
        {
            label: '📖 הראה פתרון',
            prompt: 'הראה לי את הפתרון המלא בבקשה',
            icon: BookOpen,
            color: 'purple'
        }
    ];

    const sendMessage = async (messageText = input) => {
        if (!messageText.trim() || loading) return;

        const userMessage = {
            role: 'user',
            content: messageText
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: messageText,
                    context: {
                        question: context.question,
                        answer: context.answer,
                        hints: context.hints,
                        steps: context.steps,
                        currentSteps: context.currentSteps || [],
                        studentName: context.studentName,
                        topic: context.topic,
                        grade: context.grade
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Unknown error');
            }

            const assistantMessage = {
                role: 'assistant',
                content: data.response
            };

            setMessages(prev => [...prev, assistantMessage]);

        } catch (error) {
            console.error('💥 Chat error:', error);
            toast.error('שגיאה בתקשורת עם העוזר');

            const errorMessage = {
                role: 'assistant',
                content: '😔 סליחה, נתקלתי בבעיה. נסה שוב!'
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    const handleQuickAction = (action) => {
        sendMessage(action.prompt);
    };

    return (
        <div className="h-full flex flex-col bg-gradient-to-b from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900" dir="rtl">

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence>
                    {messages.map((message, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[85%] rounded-2xl p-4 ${
                                message.role === 'user'
                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-lg'
                            }`}>
                                <div className="whitespace-pre-wrap">{message.content}</div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex justify-start"
                    >
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg">
                            <div className="flex items-center gap-2">
                                <Loader className="w-5 h-5 animate-spin text-purple-600" />
                                <span className="text-gray-600 dark:text-gray-400">חושב...</span>
                            </div>
                        </div>
                    </motion.div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {messages.length <= 1 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="px-4 pb-4"
                >
                    <div className="grid grid-cols-2 gap-2">
                        {quickActions.map((action, index) => (
                            <motion.button
                                key={index}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleQuickAction(action)}
                                className="p-3 rounded-xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all border-2 border-purple-200 dark:border-purple-700"
                            >
                                <div className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
                                    <action.icon className="w-4 h-4 text-purple-600" />
                                    <span>{action.label}</span>
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>
            )}

            <div className="p-4 bg-white dark:bg-gray-900 border-t-2 border-gray-200 dark:border-gray-700">
                <div className="flex gap-2">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="שאל אותי משהו..."
                        disabled={loading}
                        className="flex-1 px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 focus:border-purple-500 focus:outline-none text-gray-900 dark:text-white"
                    />
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => sendMessage()}
                        disabled={!input.trim() || loading}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all"
                    >
                        <Send className="w-5 h-5" />
                    </motion.button>
                </div>
            </div>
        </div>
    );
};

export default AIChatAssistant;