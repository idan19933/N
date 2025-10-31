// src/components/ai/AIChatAssistant.jsx - WITH PROPER MATH RENDERING
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader, Lightbulb, BookOpen, Calculator, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import katex from 'katex';
import 'katex/dist/katex.min.css';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

// Component to render math content properly
const MathMessage = ({ content }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Process the content
        let processedContent = content;

        // Clean up LaTeX delimiters that shouldn't be visible
        processedContent = processedContent
            .replace(/\$\$/g, '')
            .replace(/\\\[/g, '')
            .replace(/\\\]/g, '');

        // Split content into math and text parts
        const parts = [];
        let lastIndex = 0;

        // Pattern to match LaTeX expressions
        const mathPatterns = [
            // Display math
            /\\begin\{equation\}([\s\S]*?)\\end\{equation\}/g,
            /\\\[([\s\S]*?)\\\]/g,
            // Inline math
            /\$([^$]+)\$/g,
            /\\frac\{([^}]*)\}\{([^}]*)\}/g,
            /\\sqrt\{([^}]*)\}/g,
            /\^([^{\s])/g,
            /\^{([^}]*)}/g,
            /_([^{\s])/g,
            /_{([^}]*)}/g,
            /\\partial/g,
            /\\sum/g,
            /\\int/g,
            /\\prod/g
        ];

        // Convert math expressions to proper format
        processedContent = processedContent
            // Fix fractions
            .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, (match, num, den) => {
                return `<span class="math-inline">\\frac{${num}}{${den}}</span>`;
            })
            // Fix square roots
            .replace(/\\sqrt\{([^}]*)\}/g, (match, content) => {
                return `<span class="math-inline">\\sqrt{${content}}</span>`;
            })
            // Fix powers
            .replace(/\^{([^}]*)}/g, (match, exp) => {
                return `<span class="math-inline">^{${exp}}</span>`;
            })
            .replace(/\^([^{\s])/g, (match, exp) => {
                return `<span class="math-inline">^{${exp}}</span>`;
            })
            // Fix subscripts
            .replace(/_{([^}]*)}/g, (match, sub) => {
                return `<span class="math-inline">_{${sub}}</span>`;
            })
            .replace(/_([^{\s])/g, (match, sub) => {
                return `<span class="math-inline">_{${sub}}</span>`;
            })
            // Fix partial derivatives
            .replace(/\\partial/g, '<span class="math-inline">\\partial</span>')
            // Fix common symbols
            .replace(/\\cdot/g, '<span class="math-inline">\\cdot</span>')
            .replace(/\\times/g, '<span class="math-inline">\\times</span>')
            .replace(/\\pm/g, '<span class="math-inline">\\pm</span>')
            .replace(/\\geq/g, '<span class="math-inline">\\geq</span>')
            .replace(/\\leq/g, '<span class="math-inline">\\leq</span>')
            .replace(/\\neq/g, '<span class="math-inline">\\neq</span>')
            .replace(/\\approx/g, '<span class="math-inline">\\approx</span>')
            // Fix Hebrew mixed with math
            .replace(/([א-ת]+)\s*:\s*\$([^$]+)\$/g, (match, hebrew, math) => {
                return `${hebrew}: <span class="math-inline">${math}</span>`;
            });

        // Set the HTML
        containerRef.current.innerHTML = processedContent;

        // Render all math elements with KaTeX
        const mathElements = containerRef.current.querySelectorAll('.math-inline, .math-block');
        mathElements.forEach(elem => {
            try {
                const mathContent = elem.textContent;
                katex.render(mathContent, elem, {
                    displayMode: elem.classList.contains('math-block'),
                    throwOnError: false,
                    output: 'html',
                    strict: false,
                    trust: true,
                    macros: {
                        "\\RR": "\\mathbb{R}",
                        "\\NN": "\\mathbb{N}",
                        "\\ZZ": "\\mathbb{Z}",
                        "\\QQ": "\\mathbb{Q}",
                    }
                });
            } catch (e) {
                console.warn('KaTeX render error:', e);
                // Keep original text if rendering fails
            }
        });

        // Handle plain equations without explicit math markup
        const textNodes = [];
        const walker = document.createTreeWalker(
            containerRef.current,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );

        let node;
        while (node = walker.nextNode()) {
            textNodes.push(node);
        }

        textNodes.forEach(node => {
            const text = node.textContent;
            // Pattern for equations like "3t² + 6tT - 5"
            const equationPattern = /([0-9a-zA-Z\s\+\-\*\/\^\(\)]+\s*=\s*[0-9a-zA-Z\s\+\-\*\/\^\(\)]+)/g;

            if (equationPattern.test(text)) {
                const span = document.createElement('span');
                span.innerHTML = text.replace(equationPattern, '<span class="math-equation">$1</span>');
                node.parentNode.replaceChild(span, node);
            }
        });

    }, [content]);

    return (
        <div
            ref={containerRef}
            className="math-message-content"
            dir="rtl"
        />
    );
};

const AIChatAssistant = ({ context }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [hintLevel, setHintLevel] = useState(0);
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

פשוט שאל מה שאתה צריך! 😊`,
                hintLevel: 0
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
            action: 'hint',
            icon: Lightbulb,
            color: 'yellow'
        },
        {
            label: '🤔 מה הצעד הבא?',
            prompt: 'אני לא יודע איך להמשיך, מה הצעד הבא?',
            action: 'nextStep',
            icon: AlertCircle,
            color: 'orange'
        },
        {
            label: '✅ בדוק כיוון',
            prompt: `האם אני בכיוון הנכון?`,
            action: 'checkDirection',
            icon: Calculator,
            color: 'blue'
        },
        {
            label: '📖 הראה פתרון',
            prompt: 'הראה לי את הפתרון המלא בבקשה',
            action: 'fullSolution',
            icon: BookOpen,
            color: 'purple'
        }
    ];

    const sendMessage = async (messageText = input, actionType = 'general') => {
        if (!messageText.trim() || loading) return;

        const userMessage = {
            role: 'user',
            content: messageText,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            let currentHintLevel = hintLevel;
            if (actionType === 'hint' || actionType === 'nextStep') {
                currentHintLevel = Math.min(hintLevel + 1, 3);
                setHintLevel(currentHintLevel);
            }

            const response = await fetch(`${API_BASE_URL}/api/ai/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: messageText,
                    actionType: actionType,
                    hintLevel: currentHintLevel,
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
                content: data.response,
                actionType: actionType,
                hintLevel: currentHintLevel,
                timestamp: new Date().toISOString()
            };

            setMessages(prev => [...prev, assistantMessage]);

        } catch (error) {
            console.error('💥 Chat error:', error);
            toast.error('שגיאה בתקשורת עם העוזר');

            const errorMessage = {
                role: 'assistant',
                content: '😔 סליחה, נתקלתי בבעיה. נסה שוב!',
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    const handleQuickAction = (action) => {
        sendMessage(action.prompt, action.action);
    };

    return (
        <>
            <style jsx global>{`
                /* Math message styling */
                .math-message-content {
                    line-height: 1.8;
                    overflow-wrap: break-word;
                    word-break: break-word;
                }

                .math-inline {
                    display: inline-block;
                    margin: 0 4px;
                    white-space: nowrap;
                    direction: ltr;
                    unicode-bidi: embed;
                }

                .math-block {
                    display: block;
                    margin: 12px 0;
                    text-align: center;
                    overflow-x: auto;
                    direction: ltr;
                }

                .math-equation {
                    display: inline-block;
                    padding: 2px 6px;
                    background: rgba(139, 92, 246, 0.1);
                    border-radius: 4px;
                    font-family: 'KaTeX_Main', 'Times New Roman', serif;
                    white-space: nowrap;
                    direction: ltr;
                }

                /* KaTeX specific overrides */
                .katex {
                    font-size: 1.1em;
                    line-height: 1.4;
                    margin: 0 2px;
                }

                .katex-display {
                    margin: 0.5em 0;
                    overflow-x: auto;
                    overflow-y: hidden;
                    padding: 0.5em 0;
                    -webkit-overflow-scrolling: touch;
                }

                /* Ensure proper RTL/LTR mixing */
                [dir="rtl"] .math-inline,
                [dir="rtl"] .math-block,
                [dir="rtl"] .math-equation,
                [dir="rtl"] .katex {
                    direction: ltr;
                    unicode-bidi: embed;
                }

                /* Mobile specific */
                @media (max-width: 640px) {
                    .math-message-content {
                        font-size: 14px;
                        line-height: 2;
                    }

                    .katex {
                        font-size: 1em;
                    }

                    .math-equation {
                        font-size: 0.9em;
                        padding: 1px 4px;
                    }

                    /* Horizontal scroll for long equations */
                    .katex-display {
                        max-width: 100%;
                        overflow-x: auto;
                        -webkit-overflow-scrolling: touch;
                    }
                }

                /* Dark mode adjustments */
                .dark .math-equation {
                    background: rgba(139, 92, 246, 0.2);
                }

                .dark .katex {
                    color: #e5e7eb;
                }
            `}</style>

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
                                <div className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-4 ${
                                    message.role === 'user'
                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-lg'
                                }`}>
                                    {message.actionType && message.role === 'assistant' && (
                                        <div className="mb-2 text-xs opacity-70">
                                            {message.actionType === 'hint' && `💡 רמז ${message.hintLevel || 1}`}
                                            {message.actionType === 'nextStep' && '🤔 הצעד הבא'}
                                            {message.actionType === 'checkDirection' && '✅ בדיקת כיוון'}
                                            {message.actionType === 'fullSolution' && '📖 פתרון מלא'}
                                        </div>
                                    )}
                                    {message.role === 'assistant' ? (
                                        <MathMessage content={message.content} />
                                    ) : (
                                        <div className="whitespace-pre-wrap">{message.content}</div>
                                    )}
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
        </>
    );
};

export default AIChatAssistant;