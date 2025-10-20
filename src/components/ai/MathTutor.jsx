// src/components/ai/MathTutor.jsx - COMPLETE WITH PROPS SUPPORT
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Brain, Send, BookOpen, Target, Sparkles, ChevronRight,
    Loader2, Lightbulb, CheckCircle2, XCircle, ArrowLeft,
    Trophy, Star, Zap, Flame, Clock, BarChart3, Award, Play,
    AlertCircle, RefreshCw, TrendingUp, MessageCircle, X, LineChart, Box
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { getUserGradeId, getGradeConfig, getSubtopics } from '../../config/israeliCurriculum';
import toast from 'react-hot-toast';
import { aiVerification } from '../../services/aiAnswerVerification';
import {
    LineChart as RechartsLineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Scatter,
    ScatterChart,
    ReferenceLine,
    BarChart as RechartsBarChart,
    Bar,
    Area,
    AreaChart,
    ComposedChart
} from 'recharts';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

// ==================== MATH FORMATTER UTILITY ====================
const formatMathText = (text) => {
    if (!text) return text;

    let formatted = String(text);

    const fractionMap = {
        '1/2': '½', '1/3': '⅓', '2/3': '⅔', '1/4': '¼', '3/4': '¾',
        '1/5': '⅕', '2/5': '⅖', '3/5': '⅗', '4/5': '⅘',
        '1/6': '⅙', '5/6': '⅚', '1/7': '⅐',
        '1/8': '⅛', '3/8': '⅜', '5/8': '⅝', '7/8': '⅞',
        '1/9': '⅑', '1/10': '⅒'
    };

    Object.entries(fractionMap).forEach(([plain, unicode]) => {
        const regex = new RegExp(plain.replace('/', '\\/'), 'g');
        formatted = formatted.replace(regex, unicode);
    });

    const superscriptMap = {
        '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
        '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
        '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾'
    };

    formatted = formatted.replace(/\^(\d+)/g, (match, digits) => {
        return digits.split('').map(d => superscriptMap[d] || d).join('');
    });

    formatted = formatted.replace(/([a-zA-Zא-ת])(\d)(?!\d)/g, (match, letter, digit) =>
        letter + (superscriptMap[digit] || digit)
    );

    formatted = formatted.replace(/\\int/g, '∫');
    formatted = formatted.replace(/integral/gi, '∫');

    formatted = formatted.replace(/([+\-=])/g, ' $1 ');
    formatted = formatted.replace(/\s+/g, ' ').trim();

    return formatted;
};

// ==================== MATH DISPLAY COMPONENT ====================
const MathDisplay = ({ children, className = '', inline = false }) => {
    const formatted = formatMathText(children);

    const style = {
        fontFamily: 'Georgia, "Times New Roman", serif',
        letterSpacing: '0.02em',
        lineHeight: inline ? 'inherit' : '1.6'
    };

    if (inline) {
        return (
            <span className={`math-text ${className}`} style={style}>
                {formatted}
            </span>
        );
    }

    return (
        <div className={`math-text ${className}`} style={style}>
            {formatted}
        </div>
    );
};

// ==================== SVG VISUAL COMPONENT ====================
const SVGVisual = ({ visualData }) => {
    console.log('🔺 Rendering SVG Visual:', visualData?.type);

    if (!visualData?.svg) {
        console.warn('⚠️ No SVG data in visualData');
        return null;
    }

    const getTitle = (type) => {
        switch (type) {
            case 'svg-triangle': return '🔺 תרשים משולש';
            case 'svg-rectangle': return '⬜ תרשים מלבן';
            case 'svg-circle': return '⭕ תרשים עיגול';
            case 'svg-coordinate': return '📊 מערכת צירים';
            default: return '📐 תרשים גאומטרי';
        }
    };

    const Icon = Target;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 rounded-2xl border-4 border-purple-300 p-6 mb-6 shadow-xl"
        >
            <div className="flex items-center gap-3 mb-4 bg-white/80 backdrop-blur-sm rounded-xl p-3">
                <Icon className="w-6 h-6 text-purple-600" />
                <span className="font-black text-xl text-gray-800">{getTitle(visualData.type)}</span>
            </div>

            <div
                className="flex justify-center items-center bg-white rounded-2xl p-6 shadow-inner min-h-[400px]"
                dangerouslySetInnerHTML={{ __html: visualData.svg }}
            />

            {visualData.svgData && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border-3 border-blue-300 shadow-lg"
                >
                    <div className="text-base font-black text-blue-900 mb-3 flex items-center gap-2">
                        📐 מידות התרשים:
                    </div>
                    <div className="text-base text-blue-900 space-y-2">
                        {visualData.svgData.sideA && (
                            <div className="flex items-center gap-3 bg-white/70 p-2 rounded-lg">
                                <span className="font-mono bg-purple-200 px-3 py-1 rounded-lg font-bold text-lg">A</span>
                                <span className="font-bold">צלע: {visualData.svgData.sideA} ס"מ</span>
                            </div>
                        )}
                        {visualData.svgData.sideB && (
                            <div className="flex items-center gap-3 bg-white/70 p-2 rounded-lg">
                                <span className="font-mono bg-pink-200 px-3 py-1 rounded-lg font-bold text-lg">B</span>
                                <span className="font-bold">צלע: {visualData.svgData.sideB} ס"מ</span>
                            </div>
                        )}
                        {visualData.svgData.sideC && (
                            <div className="flex items-center gap-3 bg-white/70 p-2 rounded-lg">
                                <span className="font-mono bg-orange-200 px-3 py-1 rounded-lg font-bold text-lg">C</span>
                                <span className="font-bold">צלע: {visualData.svgData.sideC} ס"מ</span>
                            </div>
                        )}
                        {visualData.svgData.width && (
                            <div className="flex items-center gap-3 bg-white/70 p-2 rounded-lg">
                                <span className="font-bold text-lg">רוחב:</span>
                                <span className="text-lg font-black text-purple-700">{visualData.svgData.width} ס"מ</span>
                            </div>
                        )}
                        {visualData.svgData.height && (
                            <div className="flex items-center gap-3 bg-white/70 p-2 rounded-lg">
                                <span className="font-bold text-lg">גובה:</span>
                                <span className="text-lg font-black text-pink-700">{visualData.svgData.height} ס"מ</span>
                            </div>
                        )}
                        {visualData.svgData.radius && (
                            <div className="flex items-center gap-3 bg-white/70 p-2 rounded-lg">
                                <span className="font-bold text-lg">רדיוס:</span>
                                <span className="text-lg font-black text-orange-700">{visualData.svgData.radius} ס"מ</span>
                            </div>
                        )}
                    </div>
                </motion.div>
            )}

            <div className="text-sm text-gray-600 text-center mt-4 font-semibold bg-yellow-50 p-2 rounded-lg">
                ✨ תרשים אינטראקטיבי - הניח עכבר על האלמנטים
            </div>
        </motion.div>
    );
};

// ==================== BOX PLOT COMPONENT ====================
const BoxPlotVisualization = ({ data, label = 'תרשים קופסה' }) => {
    if (!data || data.length === 0) return null;

    const sorted = [...data].sort((a, b) => a - b);
    const n = sorted.length;
    const q1Index = Math.floor(n * 0.25);
    const q2Index = Math.floor(n * 0.5);
    const q3Index = Math.floor(n * 0.75);

    const min = sorted[0];
    const q1 = sorted[q1Index];
    const median = sorted[q2Index];
    const q3 = sorted[q3Index];
    const max = sorted[n - 1];
    const iqr = q3 - q1;
    const range = max - min;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-4 border-purple-300 p-6 mb-6 shadow-xl"
        >
            <div className="flex items-center gap-3 mb-6 bg-white/80 backdrop-blur-sm rounded-xl p-3">
                <Box className="w-6 h-6 text-purple-600" />
                <span className="font-black text-xl text-gray-800">{label}</span>
            </div>

            <div className="relative h-48 bg-white rounded-2xl p-8 mb-6 shadow-inner">
                <div className="absolute bottom-12 left-8 right-8 h-24">
                    <div
                        className="absolute bg-purple-500 h-1"
                        style={{
                            left: `${((min - min) / range) * 100}%`,
                            width: `${((q1 - min) / range) * 100}%`,
                            top: '50%',
                            transform: 'translateY(-50%)'
                        }}
                    />

                    <div
                        className="absolute bg-purple-700 w-1 h-12"
                        style={{
                            left: `${((min - min) / range) * 100}%`,
                            top: '25%'
                        }}
                    />

                    <div
                        className="absolute bg-gradient-to-r from-purple-200 to-purple-300 border-4 border-purple-600 rounded-lg shadow-lg"
                        style={{
                            left: `${((q1 - min) / range) * 100}%`,
                            width: `${((q3 - q1) / range) * 100}%`,
                            height: '80px',
                            top: '0%'
                        }}
                    >
                        <div
                            className="absolute bg-purple-900 w-1 h-full"
                            style={{
                                left: `${((median - q1) / (q3 - q1)) * 100}%`
                            }}
                        />
                    </div>

                    <div
                        className="absolute bg-purple-500 h-1"
                        style={{
                            left: `${((q3 - min) / range) * 100}%`,
                            width: `${((max - q3) / range) * 100}%`,
                            top: '50%',
                            transform: 'translateY(-50%)'
                        }}
                    />

                    <div
                        className="absolute bg-purple-700 w-1 h-12"
                        style={{
                            left: `${((max - min) / range) * 100}%`,
                            top: '25%'
                        }}
                    />
                </div>

                <div className="absolute bottom-0 left-8 right-8 flex justify-between text-xs font-bold text-gray-700">
                    <span className="bg-white px-2 py-1 rounded shadow">Min<br/>{min}</span>
                    <span className="bg-purple-100 px-2 py-1 rounded shadow">Q1<br/>{q1}</span>
                    <span className="bg-purple-200 px-2 py-1 rounded shadow border-2 border-purple-900">Q2<br/>{median}</span>
                    <span className="bg-purple-100 px-2 py-1 rounded shadow">Q3<br/>{q3}</span>
                    <span className="bg-white px-2 py-1 rounded shadow">Max<br/>{max}</span>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                    <div className="text-xs text-gray-600 mb-1">רבעון ראשון</div>
                    <div className="text-xl font-bold text-purple-700">Q1 = {q1}</div>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg border-2 border-purple-600">
                    <div className="text-xs text-gray-600 mb-1">חציון</div>
                    <div className="text-xl font-bold text-purple-900">Q2 = {median}</div>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                    <div className="text-xs text-gray-600 mb-1">רבעון שלישי</div>
                    <div className="text-xl font-bold text-purple-700">Q3 = {q3}</div>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg border-2 border-yellow-400">
                    <div className="text-xs text-gray-700 mb-1 font-semibold">תחום בין-רבעוני</div>
                    <div className="text-xl font-bold text-yellow-700">IQR = {iqr}</div>
                </div>
            </div>
        </motion.div>
    );
};

// ==================== BAR CHART & HISTOGRAM COMPONENTS ====================
const BarChartVisualization = ({ data, xLabel = 'קטגוריה', yLabel = 'ערך', label = 'גרף עמודות', color = '#9333ea' }) => {
    if (!data || data.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-4 border-purple-300 p-6 mb-6 shadow-xl"
        >
            <div className="flex items-center gap-3 mb-4 bg-white/80 backdrop-blur-sm rounded-xl p-3">
                <BarChart3 className="w-6 h-6 text-purple-600" />
                <span className="font-black text-xl text-gray-800">{label}</span>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-inner">
                <ResponsiveContainer width="100%" height={300}>
                    <RechartsBarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="x" stroke="#6b7280" label={{ value: xLabel, position: 'insideBottom', offset: -5 }} />
                        <YAxis stroke="#6b7280" label={{ value: yLabel, angle: -90, position: 'insideLeft' }} />
                        <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '2px solid #9333ea', borderRadius: '8px' }} />
                        <Bar dataKey="y" fill={color} radius={[8, 8, 0, 0]} />
                    </RechartsBarChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};

const HistogramVisualization = ({ data, bins = 5, xLabel = 'טווח', yLabel = 'תדירות', label = 'היסטוגרמה' }) => {
    if (!data || data.length === 0) return null;

    const sorted = [...data].sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const binWidth = (max - min) / bins;

    const histogramData = [];
    for (let i = 0; i < bins; i++) {
        const binStart = min + i * binWidth;
        const binEnd = binStart + binWidth;
        const count = sorted.filter(x => x >= binStart && (i === bins - 1 ? x <= binEnd : x < binEnd)).length;

        histogramData.push({
            x: `${binStart.toFixed(1)}-${binEnd.toFixed(1)}`,
            y: count,
            label: `${binStart.toFixed(1)} - ${binEnd.toFixed(1)}: ${count} תצפיות`
        });
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-4 border-purple-300 p-6 mb-6 shadow-xl"
        >
            <div className="flex items-center gap-3 mb-4 bg-white/80 backdrop-blur-sm rounded-xl p-3">
                <BarChart3 className="w-6 h-6 text-purple-600" />
                <span className="font-black text-xl text-gray-800">{label}</span>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-inner">
                <ResponsiveContainer width="100%" height={300}>
                    <RechartsBarChart data={histogramData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="x" stroke="#6b7280" label={{ value: xLabel, position: 'insideBottom', offset: -5 }} />
                        <YAxis stroke="#6b7280" label={{ value: yLabel, angle: -90, position: 'insideLeft' }} />
                        <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '2px solid #9333ea', borderRadius: '8px' }} />
                        <Bar dataKey="y" fill="#ec4899" radius={[8, 8, 0, 0]} />
                    </RechartsBarChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};

// ==================== VISUAL GRAPH COMPONENT ====================
const VisualGraph = ({ visualData }) => {
    if (!visualData) return null;

    const { type } = visualData;

    // Priority: Handle SVG types first
    if (type?.startsWith('svg-')) {
        return <SVGVisual visualData={visualData} />;
    }

    const { points, data, equation, xRange = [-10, 10], yRange = [-10, 10], color = '#9333ea', label = 'גרף', xLabel = 'x', yLabel = 'y', bins = 5 } = visualData;

    if (type === 'boxplot' && data) {
        return <BoxPlotVisualization data={data} label={label} />;
    }

    if (type === 'histogram' && data) {
        return <HistogramVisualization data={data} bins={bins} xLabel={xLabel} yLabel={yLabel} label={label} />;
    }

    if (type === 'bar' && points && points.length > 0) {
        return <BarChartVisualization data={points} xLabel={xLabel} yLabel={yLabel} label={label} color={color} />;
    }

    if (type === 'scatter' && points && points.length > 0) {
        return (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-4 border-purple-300 p-6 mb-6 shadow-xl">
                <div className="flex items-center gap-3 mb-4 bg-white/80 backdrop-blur-sm rounded-xl p-3">
                    <LineChart className="w-6 h-6 text-purple-600" />
                    <span className="font-black text-xl text-gray-800">{label}</span>
                </div>
                <div className="bg-white rounded-2xl p-4 shadow-inner">
                    <ResponsiveContainer width="100%" height={300}>
                        <ScatterChart>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="x" type="number" stroke="#6b7280" domain={xRange} />
                            <YAxis dataKey="y" type="number" stroke="#6b7280" domain={yRange} />
                            <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '2px solid #9333ea', borderRadius: '8px' }} />
                            <ReferenceLine x={0} stroke="#9ca3af" strokeWidth={1} />
                            <ReferenceLine y={0} stroke="#9ca3af" strokeWidth={1} />
                            <Scatter data={points} fill={color} />
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>
        );
    }

    // Line/function graphs
    const generateGraphData = () => {
        if (points && points.length > 0) return points;

        const graphPoints = [];
        const [xMin, xMax] = xRange;
        const step = (xMax - xMin) / 100;

        for (let x = xMin; x <= xMax; x += step) {
            try {
                let y;
                if (type === 'line' && equation) {
                    const match = equation.match(/y\s*=\s*([+-]?\d*\.?\d*)\s*\*?\s*x\s*([+-]\s*\d+\.?\d*)?/i);
                    if (match) {
                        const slope = match[1] ? parseFloat(match[1]) : 1;
                        const intercept = match[2] ? parseFloat(match[2].replace(/\s/g, '')) : 0;
                        y = slope * x + intercept;
                    }
                } else if (type === 'parabola' && equation) {
                    const match = equation.match(/y\s*=\s*([+-]?\d*\.?\d*)\s*\*?\s*x\s*\^\s*2\s*([+-]?\d*\.?\d*)\s*\*?\s*x?\s*([+-]?\d+\.?\d*)?/i);
                    if (match) {
                        const a = match[1] ? parseFloat(match[1]) : 1;
                        const b = match[2] ? parseFloat(match[2].replace(/\s/g, '')) : 0;
                        const c = match[3] ? parseFloat(match[3].replace(/\s/g, '')) : 0;
                        y = a * x * x + b * x + c;
                    }
                }

                if (y !== undefined && !isNaN(y) && isFinite(y)) {
                    graphPoints.push({ x: parseFloat(x.toFixed(2)), y: parseFloat(y.toFixed(2)) });
                }
            } catch (error) {
                console.error('Error calculating point:', error);
            }
        }
        return graphPoints;
    };

    const graphData = generateGraphData();
    if (graphData.length === 0) return null;

    return (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-4 border-purple-300 p-6 mb-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4 bg-white/80 backdrop-blur-sm rounded-xl p-3">
                <LineChart className="w-6 h-6 text-purple-600" />
                <span className="font-black text-xl text-gray-800">{label}</span>
                {equation && <span className="text-sm text-gray-600 font-mono bg-white px-3 py-1 rounded-lg shadow"><MathDisplay inline>{equation}</MathDisplay></span>}
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-inner">
                <ResponsiveContainer width="100%" height={300}>
                    <RechartsLineChart data={graphData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="x" stroke="#6b7280" />
                        <YAxis stroke="#6b7280" domain={yRange} />
                        <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '2px solid #9333ea', borderRadius: '8px' }} />
                        <ReferenceLine x={0} stroke="#9ca3af" strokeWidth={2} />
                        <ReferenceLine y={0} stroke="#9ca3af" strokeWidth={2} />
                        <Line type="monotone" dataKey="y" stroke={color} strokeWidth={3} dot={false} />
                    </RechartsLineChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};

// ==================== AI CHAT SIDEBAR ====================
const AIChatSidebar = ({ question, studentProfile, isOpen, onToggle, currentAnswer }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        if (question && messages.length === 0) {
            const welcomeMessage = {
                role: 'assistant',
                content: `היי ${studentProfile.name}! 👋\n\nאני כאן לעזור לך עם השאלה:\n**${question.question}**\n\nאיך אני יכול לעזור?\n- 💡 רמז קטן\n- 🤔 מה הצעד הבא?\n- ✅ בדוק את הכיוון שלי\n- 📖 הסבר מלא\n\nפשוט שאל! 😊`
            };
            setMessages([welcomeMessage]);
        }
    }, [question]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const quickActions = [
        { label: '💡 רמז', prompt: 'תן לי רמז קטן' },
        { label: '🤔 צעד הבא', prompt: 'מה הצעד הבא?' },
        { label: '✅ בדוק כיוון', prompt: 'האם אני בכיוון הנכון?' },
        { label: '📖 הסבר מלא', prompt: 'הראה לי פתרון מלא' }
    ];

    const sendMessage = async (messageText = input) => {
        if (!messageText.trim() || loading) return;

        setMessages(prev => [...prev, { role: 'user', content: messageText }]);
        setInput('');
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/ai/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: messageText,
                    context: {
                        question: question.question,
                        answer: question.correctAnswer,
                        currentAnswer: currentAnswer,
                        hints: question.hints || [],
                        steps: question.steps || [],
                        studentName: studentProfile.name,
                        topic: studentProfile.topic,
                        grade: studentProfile.grade,
                        personality: studentProfile.personality || 'nexon',
                        mathFeeling: studentProfile.mathFeeling,
                        learningStyle: studentProfile.learningStyle
                    }
                })
            });

            const data = await response.json();

            if (data.success) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
            } else {
                throw new Error(data.error);
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: '😔 מצטער, נתקלתי בבעיה. נסה שוב!' }]);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <motion.button initial={{ x: -100 }} animate={{ x: 0 }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onToggle} className="fixed right-4 top-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-full shadow-2xl z-50">
                <MessageCircle className="w-6 h-6" />
            </motion.button>
        );
    }

    return (
        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 flex flex-col" dir="rtl">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Brain className="w-6 h-6" />
                    <span className="font-bold">עוזר AI - נקסון</span>
                </div>
                <button onClick={onToggle} className="hover:bg-white/20 p-2 rounded-lg">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-purple-50 to-pink-50">
                {messages.map((message, index) => (
                    <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`flex ${message.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[85%] rounded-2xl p-4 ${message.role === 'user' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'bg-white shadow-lg text-gray-900'}`}>
                            <div className="whitespace-pre-wrap text-sm">
                                <MathDisplay inline>{message.content}</MathDisplay>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {loading && (
                    <div className="flex justify-end">
                        <div className="bg-white rounded-2xl p-4 shadow-lg">
                            <div className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                                <span className="text-sm text-gray-600">נקסון חושב...</span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {messages.length <= 1 && (
                <div className="p-3 grid grid-cols-2 gap-2 bg-white border-t">
                    {quickActions.map((action, index) => (
                        <button key={index} onClick={() => sendMessage(action.prompt)} className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 transition-all border border-purple-200 text-xs font-bold text-gray-700">
                            {action.label}
                        </button>
                    ))}
                </div>
            )}

            <div className="p-4 bg-white border-t">
                <div className="flex gap-2">
                    <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendMessage()} placeholder="שאל אותי..." disabled={loading} className="flex-1 px-3 py-2 rounded-xl bg-gray-100 border border-gray-300 focus:border-purple-500 focus:outline-none text-sm" />
                    <button onClick={() => sendMessage()} disabled={!input.trim() || loading} className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl disabled:opacity-50">
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

// ==================== THINKING ANIMATION ====================
const ThinkingAnimation = ({ message = "נקסון חושב..." }) => {
    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-16">
            <motion.div animate={{ rotate: 360, scale: [1, 1.1, 1] }} transition={{ rotate: { duration: 2, repeat: Infinity, ease: "linear" }, scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" } }} className="relative mb-6">
                <motion.div animate={{ rotate: -360, scale: [1, 1.2, 1] }} transition={{ rotate: { duration: 3, repeat: Infinity, ease: "linear" }, scale: { duration: 2, repeat: Infinity, ease: "easeInOut" } }} className="absolute inset-0 w-32 h-32 border-4 border-purple-200 rounded-full" style={{ borderTopColor: 'transparent', borderRightColor: 'transparent' }} />
                <motion.div animate={{ rotate: 360, scale: [1, 1.15, 1] }} transition={{ rotate: { duration: 2.5, repeat: Infinity, ease: "linear" }, scale: { duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 0.2 } }} className="absolute inset-2 w-28 h-28 border-4 border-pink-200 rounded-full" style={{ borderBottomColor: 'transparent', borderLeftColor: 'transparent' }} />
                <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-2xl">
                    <Brain className="w-16 h-16 text-white" />
                </div>
            </motion.div>

            <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-xl font-bold text-gray-700 mb-2">
                {message}
            </motion.div>

            <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                    <motion.div key={i} animate={{ y: [0, -10, 0], scale: [1, 1.2, 1] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }} className="w-3 h-3 bg-purple-500 rounded-full" />
                ))}
            </div>
        </motion.div>
    );
};

// ==================== LIVE FEEDBACK INDICATOR ====================
const LiveFeedbackIndicator = ({ status }) => {
    if (status === 'idle') return null;

    return (
        <AnimatePresence mode="wait">
            <motion.div key={status} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {status === 'checking' && (
                    <>
                        <Loader2 className="w-4 h-4 text-purple-500 animate-spin" />
                        <span className="text-sm text-purple-600 font-medium">בודק...</span>
                    </>
                )}

                {status === 'correct' && (
                    <>
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500 }}>
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                        </motion.div>
                        <span className="text-sm text-green-600 font-bold">נכון! ✓</span>
                    </>
                )}

                {status === 'wrong' && (
                    <>
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500 }}>
                            <XCircle className="w-5 h-5 text-red-500" />
                        </motion.div>
                        <span className="text-sm text-red-600 font-medium">לא נכון</span>
                    </>
                )}

                {status === 'partial' && (
                    <>
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500 }}>
                            <AlertCircle className="w-5 h-5 text-yellow-500" />
                        </motion.div>
                        <span className="text-sm text-yellow-600 font-medium">כמעט!</span>
                    </>
                )}
            </motion.div>
        </AnimatePresence>
    );
};// ==================== MAIN MATH TUTOR COMPONENT ====================
const MathTutor = ({ topicId: propTopicId, gradeId: propGradeId, onClose }) => {
    const user = useAuthStore(state => state.user);
    const nexonProfile = useAuthStore(state => state.nexonProfile);

    // 🔥 Determine initial view based on props
    const [view, setView] = useState(() => {
        if (propTopicId) {
            return 'subtopic-select';
        }
        return 'home';
    });

    const [selectedTopic, setSelectedTopic] = useState(null);
    const [selectedSubtopic, setSelectedSubtopic] = useState(null);

    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false);
    const [hintCount, setHintCount] = useState(0);
    const [currentHints, setCurrentHints] = useState([]);

    const [feedbackStatus, setFeedbackStatus] = useState('idle');
    const [liveFeedback, setLiveFeedback] = useState(null);
    const [finalFeedback, setFinalFeedback] = useState(null);
    const [attemptCount, setAttemptCount] = useState(0);

    const [chatOpen, setChatOpen] = useState(false);

    const autoCheckTimerRef = useRef(null);
    const lastCheckedAnswerRef = useRef('');

    const [sessionStats, setSessionStats] = useState({
        correct: 0,
        total: 0,
        attempts: 0,
        streak: 0,
        maxStreak: 0,
        points: 0,
        startTime: null,
        questionTimes: []
    });

    const [timer, setTimer] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const timerRef = useRef(null);
    const inputRef = useRef(null);

    // 🔥 Grade and curriculum resolution with props support
    const currentGrade = propGradeId || nexonProfile?.grade || user?.grade || '8';
    const currentTrack = nexonProfile?.track || user?.track;
    const gradeId = getUserGradeId(currentGrade, currentTrack);
    const gradeConfig = getGradeConfig(gradeId);
    const availableTopics = gradeConfig?.topics || [];

    console.log('🎯 MathTutor initialized:', {
        propTopicId,
        propGradeId,
        gradeId,
        availableTopics: availableTopics.length,
        initialView: view
    });

    // 🔥 CRITICAL: Handle direct topic navigation from dashboard
    useEffect(() => {
        if (propTopicId && availableTopics.length > 0 && !selectedTopic) {
            console.log('🔍 Looking for topic:', propTopicId);

            const topic = availableTopics.find(t => t.id === propTopicId);

            if (topic) {
                console.log('✅ Found topic:', topic);
                setSelectedTopic(topic);

                const subtopics = getSubtopics(gradeId, topic.id);
                console.log('📚 Subtopics:', subtopics.length);

                if (subtopics.length === 0) {
                    console.log('▶️ Starting practice directly');
                    startPractice(topic, null);
                } else {
                    console.log('📋 Showing subtopic selection');
                    setView('subtopic-select');
                }
            } else {
                console.warn('⚠️ Topic not found');
                const basicTopic = {
                    id: propTopicId,
                    name: propTopicId,
                    nameEn: propTopicId,
                    icon: '📚',
                    difficulty: 'intermediate'
                };
                setSelectedTopic(basicTopic);
                startPractice(basicTopic, null);
            }
        }
    }, [propTopicId, availableTopics, selectedTopic, gradeId]);

    useEffect(() => {
        if (isTimerRunning) {
            timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isTimerRunning]);

    useEffect(() => {
        if (!userAnswer.trim() || finalFeedback?.isCorrect) {
            if (autoCheckTimerRef.current) {
                clearTimeout(autoCheckTimerRef.current);
                autoCheckTimerRef.current = null;
            }
            setFeedbackStatus('idle');
            return;
        }

        if (userAnswer === lastCheckedAnswerRef.current) {
            return;
        }

        if (autoCheckTimerRef.current) {
            clearTimeout(autoCheckTimerRef.current);
        }

        const checkTimer = setTimeout(() => {
            setFeedbackStatus('checking');
        }, 2500);

        autoCheckTimerRef.current = setTimeout(() => {
            checkAnswerLive();
        }, 3000);

        return () => {
            clearTimeout(checkTimer);
            if (autoCheckTimerRef.current) {
                clearTimeout(autoCheckTimerRef.current);
            }
        };
    }, [userAnswer, finalFeedback]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const startPractice = async (topic, subtopic) => {
        console.log('🎮 Starting practice:', { topic: topic?.name, subtopic: subtopic?.name });

        setSelectedTopic(topic);
        setSelectedSubtopic(subtopic);
        setView('practice');
        setSessionStats({
            correct: 0,
            total: 0,
            attempts: 0,
            streak: 0,
            maxStreak: 0,
            points: 0,
            startTime: Date.now(),
            questionTimes: []
        });
        await generateNewQuestion(topic, subtopic);
    };

    const generateNewQuestion = async (topic, subtopic) => {
        setIsGeneratingQuestion(true);
        setTimer(0);
        setHintCount(0);
        setCurrentHints([]);
        setUserAnswer('');
        setLiveFeedback(null);
        setFinalFeedback(null);
        setFeedbackStatus('idle');
        setCurrentQuestion(null);
        setAttemptCount(0);
        setChatOpen(false);
        lastCheckedAnswerRef.current = '';

        try {
            if (!topic || typeof topic !== 'object' || !topic.name) {
                throw new Error('Invalid topic object');
            }

            const requestBody = {
                topic: {
                    id: String(topic.id || topic.name || 'unknown'),
                    name: String(topic.name),
                    nameEn: String(topic.nameEn || '')
                },
                subtopic: subtopic ? {
                    id: String(subtopic.id || subtopic.name || 'unknown'),
                    name: String(subtopic.name || ''),
                    nameEn: String(subtopic.nameEn || '')
                } : null,
                difficulty: String(topic.difficulty || 'intermediate'),
                studentProfile: {
                    name: String(nexonProfile?.name || user?.name || 'תלמיד'),
                    grade: String(currentGrade),
                    track: String(currentTrack || ''),
                    mathFeeling: String(nexonProfile?.mathFeeling || 'okay'),
                    learningStyle: String(nexonProfile?.learningStyle || 'ask'),
                    goalFocus: String(nexonProfile?.goalFocus || 'understanding'),
                    studentId: String(nexonProfile?.id || user?.id || 'anonymous')
                }
            };

            console.log('📤 Sending question request:', requestBody);

            const response = await fetch(`${API_URL}/api/ai/generate-question`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('text/html')) {
                throw new Error('Server error - check if server is running on port 3001');
            }

            let data;
            try {
                const text = await response.text();
                console.log('📥 Raw response (first 200 chars):', text.substring(0, 200));
                data = JSON.parse(text);
            } catch (parseError) {
                console.error('❌ JSON Parse Error:', parseError);
                throw new Error(`Invalid JSON response: ${parseError.message}`);
            }

            if (!response.ok || !data.success) {
                let errorMsg = 'Failed to generate question';
                if (data.error) {
                    errorMsg = typeof data.error === 'string' ? data.error : data.error.message || JSON.stringify(data.error);
                }
                throw new Error(errorMsg);
            }

            if (!data.question) {
                throw new Error('No question data received');
            }

            console.log('✅ Question received successfully');

            await new Promise(resolve => setTimeout(resolve, 1500));
            setCurrentQuestion(data.question);
            setIsTimerRunning(true);
            setTimeout(() => inputRef.current?.focus(), 100);

        } catch (error) {
            console.error('❌ Error in generateNewQuestion:', error);

            let displayMessage = 'שגיאה ביצירת שאלה';
            if (error.message.includes('fetch')) {
                displayMessage = 'לא ניתן להתחבר לשרת. בדוק שהשרת רץ על http://localhost:3001';
            } else if (error.message.includes('JSON')) {
                displayMessage = 'שגיאת תקשורת עם השרת. נסה שוב.';
            } else if (error.message) {
                displayMessage = `שגיאה: ${error.message}`;
            }

            toast.error(displayMessage, { duration: 5000, icon: '❌' });

            if (propTopicId && onClose) {
                onClose();
            } else {
                setView('topic-select');
            }
        } finally {
            setIsGeneratingQuestion(false);
        }
    };

    const checkAnswerLive = async () => {
        if (!userAnswer.trim() || !currentQuestion) return;

        lastCheckedAnswerRef.current = userAnswer;

        try {
            const result = await aiVerification.verifyAnswer(
                userAnswer,
                currentQuestion.correctAnswer,
                currentQuestion.question,
                {
                    studentName: nexonProfile?.name || user?.name || 'תלמיד',
                    grade: currentGrade,
                    topic: selectedTopic?.name,
                    subtopic: selectedSubtopic?.name
                }
            );

            setLiveFeedback(result);

            if (result.isCorrect) {
                setFeedbackStatus('correct');
            } else if (result.isPartial) {
                setFeedbackStatus('partial');
            } else {
                setFeedbackStatus('wrong');
            }

        } catch (error) {
            console.error('Live check error:', error);
            setFeedbackStatus('idle');
        }
    };

    const submitAnswer = async () => {
        if (!userAnswer.trim() || !currentQuestion) return;
        if (finalFeedback?.isCorrect) {
            nextQuestion();
            return;
        }

        setIsTimerRunning(false);

        let result = liveFeedback;

        if (!result || lastCheckedAnswerRef.current !== userAnswer) {
            try {
                result = await aiVerification.verifyAnswer(
                    userAnswer,
                    currentQuestion.correctAnswer,
                    currentQuestion.question,
                    {
                        studentName: nexonProfile?.name || user?.name || 'תלמיד',
                        grade: currentGrade,
                        topic: selectedTopic?.name,
                        subtopic: selectedSubtopic?.name
                    }
                );
            } catch (error) {
                console.error('Submit error:', error);
                toast.error('שגיאה בבדיקת תשובה');
                return;
            }
        }

        const isCorrect = result.isCorrect;

        let pointsEarned = 0;
        if (isCorrect) {
            if (attemptCount === 0) {
                pointsEarned = 100 - (hintCount * 10);
            } else if (attemptCount === 1) {
                pointsEarned = 60;
            } else if (attemptCount === 2) {
                pointsEarned = 30;
            } else {
                pointsEarned = 10;
            }
            pointsEarned = Math.max(pointsEarned, 10);
        }

        setFinalFeedback({
            ...result,
            timeTaken: timer,
            pointsEarned,
            attemptNumber: attemptCount + 1
        });

        if (isCorrect) {
            setSessionStats(prev => {
                const newStreak = prev.streak + 1;
                return {
                    ...prev,
                    correct: prev.correct + 1,
                    total: prev.total + 1,
                    attempts: prev.attempts + attemptCount + 1,
                    streak: newStreak,
                    maxStreak: Math.max(newStreak, prev.maxStreak),
                    points: prev.points + pointsEarned,
                    questionTimes: [...prev.questionTimes, timer]
                };
            });
        } else {
            setAttemptCount(prev => prev + 1);
            setSessionStats(prev => ({
                ...prev,
                streak: 0
            }));
        }
    };

    const getHint = async () => {
        if (hintCount >= 3) return;

        try {
            const response = await fetch(`${API_URL}/api/ai/get-hint`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: currentQuestion.question,
                    hintIndex: hintCount,
                    studentProfile: {
                        name: nexonProfile?.name || user?.name || 'תלמיד',
                        learningStyle: nexonProfile?.learningStyle || 'ask'
                    }
                })
            });

            const data = await response.json();

            if (data.success) {
                setCurrentHints([...currentHints, data.hint]);
                setHintCount(hintCount + 1);
            }
        } catch (error) {
            console.error('Hint error:', error);
            toast.error('שגיאה בקבלת רמז');
        }
    };

    const nextQuestion = () => {
        if (finalFeedback?.isCorrect) {
            generateNewQuestion(selectedTopic, selectedSubtopic);
        }
    };

    const tryAgain = () => {
        setUserAnswer('');
        setLiveFeedback(null);
        setFinalFeedback(null);
        setFeedbackStatus('idle');
        lastCheckedAnswerRef.current = '';
        setIsTimerRunning(true);
        inputRef.current?.focus();
    };

    const endSession = () => {
        setView('results');
        setIsTimerRunning(false);
    };

    // 🔥 Smart back navigation
    const handleBackNavigation = () => {
        if (onClose) {
            onClose();
        } else if (view === 'practice') {
            const subtopics = getSubtopics(gradeId, selectedTopic?.id);
            if (subtopics.length > 0) {
                setView('subtopic-select');
            } else {
                setView('topic-select');
            }
        } else if (view === 'subtopic-select') {
            setView('topic-select');
            setSelectedTopic(null);
        } else {
            setView('home');
        }
    };

    // ==================== VIEW: HOME ====================
    if (view === 'home') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-4" dir="rtl">
                <div className="max-w-4xl mx-auto pt-12">
                    <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
                        <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }} className="inline-block mb-6">
                            <div className="w-28 h-28 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mx-auto shadow-2xl border-4 border-white/30">
                                <Brain className="w-16 h-16 text-white" />
                            </div>
                        </motion.div>

                        <h1 className="text-7xl font-black text-white mb-4 drop-shadow-2xl">נקסון</h1>
                        <p className="text-3xl text-white/90 mb-2 font-bold">המורה הדיגיטלי שלך 🎓</p>
                        <p className="text-xl text-white/80 font-semibold">
                            {gradeConfig?.name} • {availableTopics.length} נושאים מגניבים 🚀
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-3 gap-6 mb-8">
                        {[
                            { icon: Trophy, label: 'הרמה שלך', value: 'Level 5', color: 'yellow', emoji: '🏆' },
                            { icon: Flame, label: 'רצף תשובות', value: '12', color: 'orange', emoji: '🔥' },
                            { icon: Star, label: 'נקודות', value: '2,450', color: 'blue', emoji: '⭐' }
                        ].map((stat, i) => (
                            <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }} whileHover={{ scale: 1.05 }} className="bg-white/30 backdrop-blur-xl rounded-3xl p-6 text-center shadow-xl border-2 border-white/40">
                                <div className="text-5xl mb-2">{stat.emoji}</div>
                                <div className="text-3xl font-black text-white drop-shadow-lg">{stat.value}</div>
                                <div className="text-sm text-white/90 font-bold">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>

                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setView('topic-select')} className="w-full bg-white text-purple-600 rounded-3xl py-8 font-black text-2xl shadow-2xl hover:shadow-3xl transition-all mb-6 flex items-center justify-center gap-4">
                        <Play className="w-8 h-8" />
                        בואו נתחיל! 🎉
                        <Sparkles className="w-8 h-8" />
                    </motion.button>

                    <motion.button whileHover={{ scale: 1.02 }} onClick={() => toast.success('סטטיסטיקות בקרוב!')} className="w-full bg-white/20 backdrop-blur-xl text-white rounded-3xl py-5 font-bold text-lg hover:bg-white/30 transition-all flex items-center justify-center gap-3 border-2 border-white/30">
                        <BarChart3 className="w-6 h-6" />
                        הסטטיסטיקה שלי 📊
                    </motion.button>
                </div>
            </div>
        );
    }

    // ==================== VIEW: TOPIC SELECT ====================
    if (view === 'topic-select') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-4" dir="rtl">
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleBackNavigation} className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-bold bg-white px-6 py-3 rounded-2xl shadow-lg">
                            <ArrowLeft className="w-5 h-5" />
                            חזרה
                        </motion.button>
                        <h2 className="text-3xl font-black text-gray-800">בחר נושא לתרגול 📚</h2>
                        <div className="w-32" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {availableTopics.map((topic, index) => {
                            const subtopics = getSubtopics(gradeId, topic.id);
                            const hasSubtopics = subtopics.length > 0;

                            return (
                                <motion.div key={topic.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} whileHover={{ scale: 1.03, y: -5 }} className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all p-8 cursor-pointer border-4 border-transparent hover:border-purple-300" onClick={() => {
                                    setSelectedTopic(topic);
                                    if (hasSubtopics) {
                                        setView('subtopic-select');
                                    } else {
                                        startPractice(topic, null);
                                    }
                                }}>
                                    <div className="text-6xl mb-4">{topic.icon}</div>
                                    <h3 className="text-2xl font-black text-gray-800 mb-2">{topic.name}</h3>
                                    <p className="text-base text-gray-500 mb-4 font-semibold">{topic.nameEn}</p>

                                    {hasSubtopics && (
                                        <div className="text-sm text-gray-400 flex items-center gap-1 font-semibold">
                                            <ChevronRight className="w-4 h-4" />
                                            {subtopics.length} תתי-נושאים
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    // ==================== VIEW: SUBTOPIC SELECT ====================
    if (view === 'subtopic-select' && selectedTopic) {
        const subtopics = getSubtopics(gradeId, selectedTopic.id);

        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-4" dir="rtl">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleBackNavigation} className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-bold bg-white px-6 py-3 rounded-2xl shadow-lg">
                            <ArrowLeft className="w-5 h-5" />
                            {onClose ? 'חזרה ללוח הבקרה' : 'חזרה'}
                        </motion.button>
                    </div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-8 mb-8 shadow-2xl">
                        <div className="flex items-center gap-4 text-white">
                            <div className="text-6xl">{selectedTopic.icon}</div>
                            <div>
                                <h1 className="text-3xl md:text-4xl font-black mb-2">{selectedTopic.name}</h1>
                                <p className="text-white/90 text-lg">{selectedTopic.nameEn}</p>
                            </div>
                        </div>
                    </motion.div>

                    {subtopics.length > 0 ? (
                        <>
                            <h2 className="text-2xl font-black text-gray-800 mb-6">בחר תת-נושא:</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => startPractice(selectedTopic, null)} className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center text-3xl">🎯</div>
                                        <div className="flex-1 text-right">
                                            <h3 className="text-xl font-black mb-1">תרגל הכל</h3>
                                            <p className="text-white/90 text-sm">כל התתי-נושאים ביחד</p>
                                        </div>
                                        <ChevronRight className="w-6 h-6" />
                                    </div>
                                </motion.button>

                                {subtopics.map((subtopic, index) => (
                                    <motion.button key={subtopic.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: (index + 1) * 0.1 }} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => startPractice(selectedTopic, subtopic)} className="bg-white hover:bg-purple-50 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all border-2 border-gray-200 hover:border-purple-400">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-2xl font-black">{index + 1}</div>
                                            <div className="flex-1 text-right">
                                                <h3 className="text-lg font-black text-gray-800 mb-1">{subtopic.name}</h3>
                                                {subtopic.nameEn && <p className="text-gray-500 text-sm">{subtopic.nameEn}</p>}
                                            </div>
                                            <ChevronRight className="w-6 h-6 text-purple-600" />
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </>
                    ) : (
                        <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => startPractice(selectedTopic, null)} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-3xl py-8 font-black text-2xl shadow-2xl hover:shadow-3xl transition-all flex items-center justify-center gap-4">
                            <Play className="w-8 h-8" />
                            התחל תרגול
                            <Sparkles className="w-8 h-8" />
                        </motion.button>
                    )}
                </div>
            </div>
        );
    }

    // ==================== VIEW: PRACTICE ====================
    if (view === 'practice') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-4" dir="rtl">
                <div className="max-w-4xl mx-auto">
                    <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 rounded-3xl shadow-2xl p-5 mb-6">
                        <div className="flex items-center justify-between">
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={endSession} className="bg-white/20 backdrop-blur-md text-white px-6 py-3 rounded-2xl font-bold hover:bg-white/30 transition-all flex items-center gap-2 shadow-lg">
                                <ArrowLeft className="w-5 h-5" />
                                סיים
                            </motion.button>

                            <div className="flex items-center gap-4">
                                <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 1, repeat: Infinity }} className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-5 py-3 rounded-2xl shadow-lg">
                                    <Clock className="w-6 h-6 text-white" />
                                    <span className="font-mono text-2xl font-black text-white drop-shadow-lg">{formatTime(timer)}</span>
                                </motion.div>

                                <motion.div animate={sessionStats.streak > 0 ? { rotate: [0, 10, -10, 0] } : {}} transition={{ duration: 0.5 }} className="flex items-center gap-2 bg-gradient-to-r from-orange-400 to-red-500 px-5 py-3 rounded-2xl shadow-lg">
                                    <Flame className="w-6 h-6 text-white" />
                                    <span className="text-2xl font-black text-white drop-shadow-lg">{sessionStats.streak}</span>
                                </motion.div>

                                <motion.div animate={sessionStats.points > 0 ? { scale: [1, 1.1, 1] } : {}} className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-yellow-500 px-5 py-3 rounded-2xl shadow-lg">
                                    <Star className="w-6 h-6 text-white" />
                                    <span className="text-2xl font-black text-white drop-shadow-lg">{sessionStats.points}</span>
                                </motion.div>

                                <div className="bg-white/20 backdrop-blur-md px-5 py-3 rounded-2xl shadow-lg">
                                    <div className="text-xl font-black text-white drop-shadow-lg">{sessionStats.correct}/{sessionStats.total}</div>
                                    <div className="text-xs text-white/80 font-semibold">שאלות נכונות</div>
                                </div>
                            </div>
                        </div>

                        {sessionStats.total > 0 && (
                            <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} className="mt-4 h-4 bg-white/20 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${(sessionStats.correct / sessionStats.total) * 100}%` }} transition={{ duration: 0.5 }} className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-lg" />
                            </motion.div>
                        )}
                    </motion.div>

                    <motion.div key={currentQuestion?.question || 'loading'} initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="bg-white rounded-3xl shadow-2xl p-10 mb-4 border-4 border-purple-200" style={{ background: 'linear-gradient(135deg, #ffffff 0%, #faf5ff 50%, #fef3c7 100%)' }}>
                        <AnimatePresence mode="wait">
                            {isGeneratingQuestion ? (
                                <ThinkingAnimation message="נקסון מכין שאלה מיוחדת בשבילך... ✨" />
                            ) : currentQuestion ? (
                                <motion.div key="question-content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3 bg-purple-100 px-5 py-3 rounded-2xl shadow-md">
                                            <span className="text-4xl">{selectedTopic?.icon}</span>
                                            <div>
                                                <div className="font-black text-gray-800 text-lg">{selectedTopic?.name}</div>
                                                {selectedSubtopic && <div className="text-sm text-gray-500 font-semibold">{selectedSubtopic.name}</div>}
                                            </div>
                                        </div>

                                        {attemptCount > 0 && (
                                            <div className="flex items-center gap-2 bg-orange-100 px-4 py-2 rounded-full border-2 border-orange-300">
                                                <RefreshCw className="w-5 h-5 text-orange-600" />
                                                <span className="text-base font-bold text-orange-600">ניסיון {attemptCount + 1}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mb-8">
                                        <div className="text-3xl font-black text-gray-800 mb-4 leading-relaxed">
                                            <MathDisplay>{currentQuestion.question}</MathDisplay>
                                        </div>
                                    </div>

                                    {currentQuestion.visualData && (
                                        <div className="mb-6">
                                            <VisualGraph visualData={currentQuestion.visualData} />
                                        </div>
                                    )}

                                    {currentHints.length > 0 && (
                                        <div className="mb-6 space-y-3">
                                            {currentHints.map((hint, index) => (
                                                <motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-yellow-50 border-r-4 border-yellow-400 p-5 rounded-2xl shadow-md">
                                                    <div className="flex items-start gap-3">
                                                        <Lightbulb className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                                                        <div className="text-gray-700 text-lg font-semibold">
                                                            <MathDisplay inline>{hint}</MathDisplay>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}

                                    {liveFeedback && !finalFeedback && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`mb-6 p-5 rounded-2xl border-3 ${feedbackStatus === 'correct' ? 'bg-green-50 border-green-300' : feedbackStatus === 'partial' ? 'bg-yellow-50 border-yellow-300' : 'bg-red-50 border-red-300'}`}>
                                            <div className="flex items-center gap-3 text-base">
                                                {feedbackStatus === 'correct' && <CheckCircle2 className="w-6 h-6 text-green-600" />}
                                                {feedbackStatus === 'partial' && <AlertCircle className="w-6 h-6 text-yellow-600" />}
                                                {feedbackStatus === 'wrong' && <XCircle className="w-6 h-6 text-red-600" />}
                                                <span className="font-bold text-gray-700">
                                                    <MathDisplay inline>{liveFeedback.explanation}</MathDisplay>
                                                </span>
                                            </div>
                                        </motion.div>
                                    )}

                                    {finalFeedback && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`mb-6 p-8 rounded-3xl ${finalFeedback.isCorrect ? 'bg-green-50 border-4 border-green-300' : finalFeedback.isPartial ? 'bg-yellow-50 border-4 border-yellow-300' : 'bg-red-50 border-4 border-red-300'}`}>
                                            <div className="flex items-center gap-4 mb-4">
                                                {finalFeedback.isCorrect ? <CheckCircle2 className="w-10 h-10 text-green-600" /> : <XCircle className="w-10 h-10 text-red-600" />}
                                                <div className="flex-1">
                                                    <div className="text-2xl font-black">
                                                        <MathDisplay inline>{finalFeedback.feedback}</MathDisplay>
                                                    </div>
                                                    {finalFeedback.isCorrect && finalFeedback.pointsEarned > 0 && (
                                                        <div className="text-base text-gray-600 font-bold">+{finalFeedback.pointsEarned} נקודות • {formatTime(finalFeedback.timeTaken)}</div>
                                                    )}
                                                </div>
                                            </div>

                                            {finalFeedback.explanation && (
                                                <div className="bg-white/70 rounded-2xl p-5 mb-4">
                                                    <div className="font-black text-gray-700 mb-2 text-lg">💡 הסבר:</div>
                                                    <div className="text-gray-700 text-base">
                                                        <MathDisplay>{finalFeedback.explanation}</MathDisplay>
                                                    </div>
                                                </div>
                                            )}

                                            {!finalFeedback.isCorrect && (
                                                <div className="bg-white/70 rounded-2xl p-5">
                                                    <div className="font-black text-gray-700 mb-2 text-lg">התשובה הנכונה:</div>
                                                    <div className="text-3xl font-black text-gray-800">
                                                        <MathDisplay className="text-4xl">{currentQuestion.correctAnswer}</MathDisplay>
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}

                                    {!finalFeedback && (
                                        <div className="space-y-4">
                                            <div className="relative">
                                                <input ref={inputRef} type="text" value={userAnswer} onChange={(e) => setUserAnswer(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && submitAnswer()} placeholder="כתוב/י את התשובה... ✍️" className="w-full px-8 py-5 pr-32 text-2xl border-4 border-purple-300 rounded-3xl focus:ring-4 focus:ring-purple-200 focus:border-purple-400 transition-all font-bold" />
                                                <LiveFeedbackIndicator status={feedbackStatus} />
                                            </div>

                                            <div className="grid grid-cols-3 gap-4">
                                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setChatOpen(true)} className="flex items-center justify-center gap-2 px-4 py-5 bg-blue-500 text-white rounded-3xl font-black hover:bg-blue-600 transition-all text-lg shadow-xl">
                                                    <MessageCircle className="w-6 h-6" />
                                                    שוחח עם נקסון
                                                </motion.button>

                                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={getHint} disabled={hintCount >= 3} className="flex items-center justify-center gap-2 px-4 py-5 bg-yellow-500 text-white rounded-3xl font-black hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-lg shadow-xl">
                                                    <Lightbulb className="w-6 h-6" />
                                                    רמז ({3 - hintCount})
                                                </motion.button>

                                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={submitAnswer} disabled={!userAnswer.trim()} className="flex items-center justify-center gap-2 px-4 py-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-3xl font-black hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all text-lg shadow-xl">
                                                    <CheckCircle2 className="w-6 h-6" />
                                                    שלח תשובה
                                                </motion.button>
                                            </div>
                                        </div>
                                    )}

                                    {finalFeedback && (
                                        <div className="flex gap-4">
                                            {!finalFeedback.isCorrect && (
                                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={tryAgain} className="flex-1 flex items-center justify-center gap-2 px-6 py-5 bg-orange-500 text-white rounded-3xl font-black hover:bg-orange-600 transition-all text-lg shadow-xl">
                                                    <RefreshCw className="w-6 h-6" />
                                                    נסה שוב
                                                </motion.button>
                                            )}

                                            {finalFeedback.isCorrect && (
                                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={nextQuestion} className="w-full flex items-center justify-center gap-2 px-6 py-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-3xl font-black hover:shadow-2xl transition-all text-lg shadow-xl">
                                                    <Sparkles className="w-6 h-6" />
                                                    שאלה הבאה
                                                    <ChevronRight className="w-6 h-6" />
                                                </motion.button>
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            ) : null}
                        </AnimatePresence>
                    </motion.div>
                </div>

                <AnimatePresence>
                    {currentQuestion && (
                        <AIChatSidebar question={currentQuestion} studentProfile={{ name: nexonProfile?.name || user?.name || 'תלמיד', grade: currentGrade, topic: selectedTopic?.name, personality: nexonProfile?.personality || 'nexon', mathFeeling: nexonProfile?.mathFeeling, learningStyle: nexonProfile?.learningStyle }} currentAnswer={userAnswer} isOpen={chatOpen} onToggle={() => setChatOpen(!chatOpen)} />
                    )}
                </AnimatePresence>
            </div>
        );
    }

    // ==================== VIEW: RESULTS ====================
    if (view === 'results') {
        const avgTime = sessionStats.questionTimes.length > 0 ? Math.round(sessionStats.questionTimes.reduce((a, b) => a + b, 0) / sessionStats.questionTimes.length) : 0;
        const accuracy = sessionStats.total > 0 ? Math.round((sessionStats.correct / sessionStats.total) * 100) : 0;
        const avgAttempts = sessionStats.total > 0 ? (sessionStats.attempts / sessionStats.total).toFixed(1) : 0;

        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-4 flex items-center justify-center" dir="rtl">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
                    <div className="text-center mb-6">
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}>
                            <Award className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
                        </motion.div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">סיימת!</h2>
                        <p className="text-gray-600">תוצאות המפגש</p>
                    </div>

                    <div className="space-y-4 mb-6">
                        {[
                            { icon: Target, label: 'דיוק', value: `${accuracy}%`, color: 'purple' },
                            { icon: CheckCircle2, label: 'נכונות', value: `${sessionStats.correct}/${sessionStats.total}`, color: 'green' },
                            { icon: TrendingUp, label: 'ניסיונות ממוצעים', value: avgAttempts, color: 'blue' },
                            { icon: Flame, label: 'רצף מקסימלי', value: sessionStats.maxStreak, color: 'orange' },
                            { icon: Star, label: 'נקודות', value: sessionStats.points, color: 'yellow' },
                            { icon: Clock, label: 'זמן ממוצע', value: formatTime(avgTime), color: 'pink' }
                        ].map((stat, i) => (
                            <div key={i} className={`bg-${stat.color}-50 rounded-2xl p-4 flex items-center justify-between`}>
                                <div>
                                    <div className="text-sm text-gray-600">{stat.label}</div>
                                    <div className={`text-3xl font-bold text-${stat.color}-600`}>{stat.value}</div>
                                </div>
                                <stat.icon className={`w-10 h-10 text-${stat.color}-400`} />
                            </div>
                        ))}
                    </div>

                    <div className="space-y-3">
                        <button onClick={() => startPractice(selectedTopic, selectedSubtopic)} className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold hover:shadow-lg transition-all">
                            תרגל שוב
                        </button>

                        <button onClick={() => {
                            if (onClose) {
                                onClose();
                            } else {
                                setView('topic-select');
                                setSelectedTopic(null);
                                setSelectedSubtopic(null);
                            }
                        }} className="w-full py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all">
                            {onClose ? 'חזרה ללוח הבקרה' : 'נושא אחר'}
                        </button>

                        {!onClose && (
                            <button onClick={() => setView('home')} className="w-full py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-2xl font-bold hover:border-gray-300 transition-all">
                                חזרה לדף הבית
                            </button>
                        )}
                    </div>
                </motion.div>
            </div>
        );
    }

    return null;
};

export default MathTutor;