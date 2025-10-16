// src/components/ai/AIChatAssistant.jsx - FIXED FOR NEW PROBLEM STRUCTURE
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Bot, User, Sparkles } from 'lucide-react';

const AIChatAssistant = ({ currentProblem }) => {
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: currentProblem
                ? `🎓 אני רואה שאתה עובד על: **${currentProblem.question}**\n\nאשמח לעזור לך לפתור את זה! מה תרצה?\n• רמז קל 💡\n• הסבר מפורט 📚\n• פתרון צעד אחר צעד ✍️`
                : '👋 היי! אני העוזר AI שלך. שאל אותי כל שאלה על מתמטיקה!'
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (currentProblem && messages.length === 1) {
            setMessages([{
                role: 'assistant',
                content: `🎓 אני רואה שאתה עובד על: **${currentProblem.question}**\n\nאשמח לעזור לך לפתור את זה! מה תרצה?\n• רמז קל 💡\n• הסבר מפורט 📚\n• פתרון צעד אחר צעד ✍️\n• פשוט תשאל שאלה!`
            }]);
        }
    }, [currentProblem]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const generateAIResponse = (userMessage) => {
        const msg = userMessage.toLowerCase();

        if (currentProblem) {
            const { question, answer, hints, steps, explanation, topic } = currentProblem;

            // Check for hint requests
            if (msg.includes('רמז') || msg.includes('hint') || msg.includes('עזרה')) {
                if (hints && hints.length > 0) {
                    if (msg.includes('קל') || msg.includes('gentle') || msg.includes('ראשון')) {
                        return `💡 **רמז קל:**\n\n${hints[0]}\n\nצריך עוד עזרה? פשוט שאל!`;
                    }
                    if (hints.length > 1) {
                        return `🎯 **רמז מנחה:**\n\n${hints[1]}\n\nרוצה רמז מפורט יותר? שאל אותי!`;
                    }
                    return `💡 **רמז:**\n\n${hints[0]}\n\nרוצה לראות את הפתרון המלא?`;
                }
                return `💡 **רמז:**\n\nנסה לפרק את הבעיה לשלבים קטנים. מה הצעד הראשון?`;
            }

            // Check for explanation requests
            if (msg.includes('הסבר') || msg.includes('explain') || msg.includes('למה') || msg.includes('איך')) {
                let response = `📚 **הסבר מפורט:**\n\nהשאלה היא: **${question}**\n\n`;

                if (explanation) {
                    response += `${explanation}\n\n`;
                }

                if (hints && hints.length > 2) {
                    response += `${hints[2]}\n\n`;
                }

                response += `רוצה לראות את הפתרון המלא?`;
                return response;
            }

            // Check for solution requests
            if (msg.includes('פתרון') || msg.includes('solution') || msg.includes('תשובה') || msg.includes('answer')) {
                if (steps && steps.length > 0) {
                    let solutionText = `✅ **פתרון מלא ל-${question}:**\n\n`;
                    steps.forEach((step, idx) => {
                        solutionText += `**צעד ${idx + 1}:** ${step.step}\n`;
                        if (step.explanation) {
                            solutionText += `_${step.explanation}_\n\n`;
                        }
                    });
                    solutionText += `\n🎯 **התשובה הסופית:** ${answer}`;
                    return solutionText;
                }
                return `🎯 **התשובה:** ${answer}\n\nרוצה שאסביר איך הגעתי לזה?`;
            }

            // Check for step-by-step requests
            if (msg.includes('צעד') || msg.includes('step') || msg.includes('שלב')) {
                if (steps && steps.length > 0) {
                    let stepText = `✍️ **בוא נפתור צעד אחר צעד:**\n\n`;
                    steps.forEach((step, idx) => {
                        stepText += `**צעד ${idx + 1}:** ${step.step}\n`;
                        if (step.explanation) {
                            stepText += `${step.explanation}\n\n`;
                        }
                    });
                    return stepText;
                }
                if (hints && hints.length > 3) {
                    return `✍️ **בוא נפתור צעד אחר צעד:**\n\n${hints[3]}\n\nאם משהו לא ברור, שאל אותי!`;
                }
                return `✍️ **בוא נפתור צעד אחר צעד:**\n\nתחילה, תזהה מה סוג הבעיה. אז תחליט איזו שיטה להשתמש. אם צריך עזרה ספציפית, שאל!`;
            }

            // Check for help requests
            if (msg.includes('עזור') || msg.includes('help') || msg.includes('תעזור')) {
                return `🤔 אני כאן לעזור עם **${question}**!\n\nמה תרצה לדעת?\n• "תן לי רמז קל"\n• "הסבר לי את זה"\n• "הראה לי את הפתרון"\n• או פשוט שאל שאלה ספציפית!`;
            }

            // Check for formula-related questions
            if (msg.includes('נוסחה') || msg.includes('formula') || topic === 'algebra') {
                if (topic === 'algebra' && (msg.includes('ריבועית') || msg.includes('quadratic'))) {
                    return `📐 **נוסחת השורשים:**\n\nלמשוואה ריבועית ax² + bx + c = 0:\n\n**x = (-b ± √(b²-4ac)) / 2a**\n\nבמקרה שלך:\n${question}\n\nנסה להציב את המקדמים בנוסחה. צריך עזרה?`;
                }
            }

            // General question about the current problem
            return `על **${question}**?\n\n${hints && hints.length > 0 ? hints[0] : 'נסה לפרק את הבעיה לשלבים קטנים.'}\n\nמה עוד תרצה לדעת?`;
        }

        // No current problem - general help
        if (msg.includes('מתמטיקה') || msg.includes('math') || msg.includes('חישוב')) {
            return '🔢 אשמח לעזור במתמטיקה! תשאל אותי שאלה ספציפית או לך למסך "תרגול מתמטיקה" לתרגילים אינטראקטיביים!';
        }

        if (msg.includes('שיעורי בית') || msg.includes('homework')) {
            return '📚 אשמח לעזור בשיעורי בית! על איזה נושא אתה עובד? אני יכול:\n• להסביר מושגים\n• לתת דוגמאות\n• לעזור לפתור בעיות\n• לתת טיפים ללמידה';
        }

        if (msg.includes('היי') || msg.includes('שלום') || msg.includes('hello') || msg.includes('hi')) {
            return '👋 שלום! אני כאן לעזור לך בלימודים. מה תרצה ללמוד היום?';
        }

        if (msg.includes('תודה') || msg.includes('thanks')) {
            return '😊 תמיד שמח לעזור! יש לך שאלות נוספות?';
        }

        // Default response
        return `🤔 שאלה מעניינת! ${currentProblem ? `אנחנו עובדים על **${currentProblem.question}** - ` : ''}אני כאן לעזור!\n\nתוכל לשאול אותי:\n• רמזים לשאלה הנוכחית\n• הסברים על מושגים\n• עזרה בפתרון בעיות\n• שאלות כלליות על מתמטיקה\n\nמה תרצה לדעת?`;
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = {
            role: 'user',
            content: input
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        setTimeout(() => {
            const aiResponse = {
                role: 'assistant',
                content: generateAIResponse(input)
            };
            setMessages(prev => [...prev, aiResponse]);
            setIsTyping(false);
        }, 800);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const quickActions = currentProblem ? [
        { label: '💡 רמז קל', message: 'תן לי רמז קל' },
        { label: '📚 הסבר', message: 'הסבר לי את זה' },
        { label: '✍️ פתרון', message: 'הראה לי את הפתרון המלא' }
    ] : [
        { label: '🔢 עזרה במתמטיקה', message: 'אני צריך עזרה במתמטיקה' },
        { label: '📚 שיעורי בית', message: 'תעזור לי בשיעורי בית' },
        { label: '💡 טיפים ללמידה', message: 'תן לי טיפים ללמידה' }
    ];

    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col h-[600px]">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mr-4">
                            <Bot className="w-7 h-7 text-purple-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">עוזר AI אישי</h2>
                            <p className="text-purple-100 text-sm flex items-center">
                                <Sparkles className="w-4 h-4 mr-1" />
                                {currentProblem ? `עובד על: ${currentProblem.question}` : 'מוכן לעזור!'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-gray-800">
                <AnimatePresence>
                    {messages.map((message, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex items-start max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                    message.role === 'user'
                                        ? 'bg-indigo-600 ml-3'
                                        : 'bg-purple-600 mr-3'
                                }`}>
                                    {message.role === 'user' ? (
                                        <User className="w-5 h-5 text-white" />
                                    ) : (
                                        <Bot className="w-5 h-5 text-white" />
                                    )}
                                </div>
                                <div className={`rounded-2xl px-4 py-3 ${
                                    message.role === 'user'
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600'
                                }`}>
                                    <p className="whitespace-pre-line text-sm leading-relaxed">{message.content}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {isTyping && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center space-x-2"
                    >
                        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center mr-3">
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                        <div className="bg-white dark:bg-gray-700 rounded-2xl px-4 py-3 border border-gray-200 dark:border-gray-600">
                            <div className="flex space-x-2">
                                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                        </div>
                    </motion.div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {messages.length <= 2 && (
                <div className="px-6 py-3 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">פעולות מהירות:</p>
                    <div className="flex flex-wrap gap-2">
                        {quickActions.map((action, idx) => (
                            <button
                                key={idx}
                                onClick={() => setInput(action.message)}
                                className="px-3 py-1 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition border border-gray-200 dark:border-gray-600"
                            >
                                {action.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input */}
            <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="שאל אותי כל דבר..."
                        className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-white"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim()}
                        className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AIChatAssistant;