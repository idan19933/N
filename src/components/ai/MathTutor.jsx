// src/components/ai/MathTutor.jsx - FIXED WITH BETTER GRAPH RENDERING
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

// ==================== BOX PLOT COMPONENT ====================
const BoxPlotVisualization = ({ data, label = 'תרשים קופסה' }) => {
    console.log('📦 Rendering BoxPlot with data:', data);

    if (!data || data.length === 0) {
        console.warn('⚠️ BoxPlot: No data provided');
        return null;
    }

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
        <div className="bg-white rounded-xl border-2 border-purple-200 p-6 mb-6">
            <div className="flex items-center gap-2 mb-6">
                <Box className="w-5 h-5 text-purple-600" />
                <span className="font-bold text-gray-800">{label}</span>
            </div>

            <div className="relative h-48 bg-gradient-to-b from-purple-50 to-white rounded-lg p-8 mb-6">
                <div className="absolute bottom-12 left-8 right-8 h-24">
                    {/* Min whisker */}
                    <div
                        className="absolute bg-purple-500 h-1"
                        style={{
                            left: `${((min - min) / range) * 100}%`,
                            width: `${((q1 - min) / range) * 100}%`,
                            top: '50%',
                            transform: 'translateY(-50%)'
                        }}
                    />

                    {/* Min line */}
                    <div
                        className="absolute bg-purple-700 w-1 h-12"
                        style={{
                            left: `${((min - min) / range) * 100}%`,
                            top: '25%'
                        }}
                    />

                    {/* Box */}
                    <div
                        className="absolute bg-gradient-to-r from-purple-200 to-purple-300 border-4 border-purple-600 rounded-lg shadow-lg"
                        style={{
                            left: `${((q1 - min) / range) * 100}%`,
                            width: `${((q3 - q1) / range) * 100}%`,
                            height: '80px',
                            top: '0%'
                        }}
                    >
                        {/* Median line */}
                        <div
                            className="absolute bg-purple-900 w-1 h-full"
                            style={{
                                left: `${((median - q1) / (q3 - q1)) * 100}%`
                            }}
                        />
                    </div>

                    {/* Max whisker */}
                    <div
                        className="absolute bg-purple-500 h-1"
                        style={{
                            left: `${((q3 - min) / range) * 100}%`,
                            width: `${((max - q3) / range) * 100}%`,
                            top: '50%',
                            transform: 'translateY(-50%)'
                        }}
                    />

                    {/* Max line */}
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

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="text-sm font-semibold text-blue-900 mb-2">🧮 חישוב IQR:</div>
                <div className="font-mono text-lg text-blue-800">
                    IQR = Q3 - Q1 = {q3} - {q1} = <span className="font-bold text-blue-900">{iqr}</span>
                </div>
            </div>

            <div className="text-xs text-gray-500 text-center mt-4">
                נתונים ממוינים: [{sorted.join(', ')}]
            </div>
        </div>
    );
};

// ==================== BAR CHART COMPONENT ====================
const BarChartVisualization = ({ data, xLabel = 'קטגוריה', yLabel = 'ערך', label = 'גרף עמודות', color = '#9333ea' }) => {
    console.log('📊 Rendering BarChart with data:', data);

    if (!data || data.length === 0) {
        console.warn('⚠️ BarChart: No data provided');
        return null;
    }

    return (
        <div className="bg-white rounded-xl border-2 border-purple-200 p-4 mb-6">
            <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                <span className="font-bold text-gray-800">{label}</span>
            </div>

            <ResponsiveContainer width="100%" height={300}>
                <RechartsBarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                        dataKey="x"
                        stroke="#6b7280"
                        label={{ value: xLabel, position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis
                        stroke="#6b7280"
                        label={{ value: yLabel, angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#ffffff',
                            border: '2px solid #9333ea',
                            borderRadius: '8px'
                        }}
                        formatter={(value, name, props) => [value, props.payload.label || xLabel]}
                    />
                    <Bar dataKey="y" fill={color} radius={[8, 8, 0, 0]} />
                </RechartsBarChart>
            </ResponsiveContainer>

            <div className="text-xs text-gray-500 text-center mt-2">
                גרף עמודות אינטראקטיבי - עבור עם העכבר לראות ערכים
            </div>
        </div>
    );
};

// ==================== HISTOGRAM COMPONENT ====================
const HistogramVisualization = ({ data, bins = 5, xLabel = 'טווח', yLabel = 'תדירות', label = 'היסטוגרמה' }) => {
    console.log('📈 Rendering Histogram with data:', data, 'bins:', bins);

    if (!data || data.length === 0) {
        console.warn('⚠️ Histogram: No data provided');
        return null;
    }

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
        <div className="bg-white rounded-xl border-2 border-purple-200 p-4 mb-6">
            <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                <span className="font-bold text-gray-800">{label}</span>
            </div>

            <ResponsiveContainer width="100%" height={300}>
                <RechartsBarChart data={histogramData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                        dataKey="x"
                        stroke="#6b7280"
                        label={{ value: xLabel, position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis
                        stroke="#6b7280"
                        label={{ value: yLabel, angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#ffffff',
                            border: '2px solid #9333ea',
                            borderRadius: '8px'
                        }}
                    />
                    <Bar dataKey="y" fill="#ec4899" radius={[8, 8, 0, 0]} />
                </RechartsBarChart>
            </ResponsiveContainer>

            <div className="text-xs text-gray-500 text-center mt-2">
                היסטוגרמה - התפלגות תדירות
            </div>
        </div>
    );
};

// ==================== MAIN VISUAL GRAPH COMPONENT ====================
const VisualGraph = ({ visualData }) => {
    console.log('🎨 VisualGraph received:', visualData);

    if (!visualData) {
        console.warn('⚠️ No visualData provided to VisualGraph');
        return null;
    }

    const {
        type,
        points,
        data,
        equation,
        xRange = [-10, 10],
        yRange = [-10, 10],
        color = '#9333ea',
        label = 'גרף',
        xLabel = 'x',
        yLabel = 'y',
        bins = 5
    } = visualData;

    console.log('📊 Graph type:', type);
    console.log('📍 Points:', points);
    console.log('📦 Data:', data);

    // Box Plot
    if (type === 'boxplot' && data) {
        console.log('✅ Rendering BoxPlot');
        return <BoxPlotVisualization data={data} label={label} />;
    }

    // Histogram
    if (type === 'histogram' && data) {
        console.log('✅ Rendering Histogram');
        return <HistogramVisualization data={data} bins={bins} xLabel={xLabel} yLabel={yLabel} label={label} />;
    }

    // Bar Chart
    if (type === 'bar' && points && points.length > 0) {
        console.log('✅ Rendering BarChart');
        return <BarChartVisualization data={points} xLabel={xLabel} yLabel={yLabel} label={label} color={color} />;
    }

    // Scatter Plot
    if (type === 'scatter' && points && points.length > 0) {
        console.log('✅ Rendering Scatter Plot');
        return (
            <div className="bg-white rounded-xl border-2 border-purple-200 p-4 mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <LineChart className="w-5 h-5 text-purple-600" />
                    <span className="font-bold text-gray-800">{label}</span>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                    <ScatterChart>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            dataKey="x"
                            type="number"
                            stroke="#6b7280"
                            label={{ value: xLabel, position: 'insideBottom', offset: -5 }}
                            domain={xRange}
                        />
                        <YAxis
                            dataKey="y"
                            type="number"
                            stroke="#6b7280"
                            domain={yRange}
                            label={{ value: yLabel, angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#ffffff',
                                border: '2px solid #9333ea',
                                borderRadius: '8px'
                            }}
                            formatter={(value, name, props) => {
                                const point = props.payload;
                                return [
                                    `${yLabel}: ${point.y}`,
                                    point.label || `נקודה ${point.x}`
                                ];
                            }}
                        />
                        <ReferenceLine x={0} stroke="#9ca3af" strokeWidth={1} />
                        <ReferenceLine y={0} stroke="#9ca3af" strokeWidth={1} />
                        <Scatter
                            data={points}
                            fill={color}
                            isAnimationActive={true}
                        />
                    </ScatterChart>
                </ResponsiveContainer>

                <div className="text-xs text-gray-500 text-center mt-2">
                    גרף פיזור אינטראקטיבי - עבור עם העכבר לראות פרטים
                </div>
            </div>
        );
    }

    // Line/Parabola/Function graphs
    const generateGraphData = () => {
        if (points && points.length > 0) {
            return points;
        }

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

    if (graphData.length === 0) {
        console.warn('⚠️ No graph data generated');
        return (
            <div className="bg-gray-100 rounded-xl p-8 text-center">
                <LineChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">לא ניתן להציג גרף</p>
            </div>
        );
    }

    console.log('✅ Rendering Line/Function Graph');

    return (
        <div className="bg-white rounded-xl border-2 border-purple-200 p-4 mb-6">
            <div className="flex items-center gap-2 mb-4">
                <LineChart className="w-5 h-5 text-purple-600" />
                <span className="font-bold text-gray-800">{label}</span>
                {equation && (
                    <span className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
                        {equation}
                    </span>
                )}
            </div>

            <ResponsiveContainer width="100%" height={300}>
                <RechartsLineChart data={graphData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                        dataKey="x"
                        stroke="#6b7280"
                        label={{ value: xLabel, position: 'insideBottomRight', offset: -5 }}
                    />
                    <YAxis
                        stroke="#6b7280"
                        domain={yRange}
                        label={{ value: yLabel, angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#ffffff',
                            border: '2px solid #9333ea',
                            borderRadius: '8px'
                        }}
                        labelFormatter={(value) => `${xLabel} = ${value}`}
                        formatter={(value) => [`${yLabel} = ${value}`, '']}
                    />
                    <ReferenceLine x={0} stroke="#9ca3af" strokeWidth={2} />
                    <ReferenceLine y={0} stroke="#9ca3af" strokeWidth={2} />
                    <Line
                        type="monotone"
                        dataKey="y"
                        stroke={color}
                        strokeWidth={3}
                        dot={false}
                        isAnimationActive={true}
                    />
                </RechartsLineChart>
            </ResponsiveContainer>

            <div className="text-xs text-gray-500 text-center mt-2">
                גרף אינטראקטיבי - עבור עם העכבר לראות ערכים
            </div>
        </div>
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
                content: `היי ${studentProfile.name}! 👋

אני כאן לעזור לך עם השאלה:
**${question.question}**

איך אני יכול לעזור?
- 💡 רמז קטן
- 🤔 מה הצעד הבא?
- ✅ בדוק את הכיוון שלי
- 📖 הסבר מלא

פשוט שאל! 😊`
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
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '😔 מצטער, נתקלתי בבעיה. נסה שוב!'
            }]);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <motion.button
                initial={{ x: -100 }}
                animate={{ x: 0 }}
                onClick={onToggle}
                className="fixed right-4 top-1/2 -translate-y-1/2 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all z-50"
            >
                <MessageCircle className="w-6 h-6" />
            </motion.button>
        );
    }

    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 flex flex-col"
            dir="rtl"
        >
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
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.role === 'user' ? 'justify-start' : 'justify-end'}`}
                    >
                        <div className={`max-w-[85%] rounded-2xl p-4 ${
                            message.role === 'user'
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                                : 'bg-white shadow-lg text-gray-900'
                        }`}>
                            <div className="whitespace-pre-wrap text-sm">{message.content}</div>
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
                        <button
                            key={index}
                            onClick={() => sendMessage(action.prompt)}
                            className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 transition-all border border-purple-200 text-xs font-bold text-gray-700"
                        >
                            {action.label}
                        </button>
                    ))}
                </div>
            )}

            <div className="p-4 bg-white border-t">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="שאל אותי..."
                        disabled={loading}
                        className="flex-1 px-3 py-2 rounded-xl bg-gray-100 border border-gray-300 focus:border-purple-500 focus:outline-none text-sm"
                    />
                    <button
                        onClick={() => sendMessage()}
                        disabled={!input.trim() || loading}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl disabled:opacity-50"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

// ==================== LOADING ANIMATION ====================
const ThinkingAnimation = ({ message = "נקסון חושב..." }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-16"
        >
            <motion.div
                animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                transition={{
                    rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                    scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
                }}
                className="relative mb-6"
            >
                <motion.div
                    animate={{ rotate: -360, scale: [1, 1.2, 1] }}
                    transition={{
                        rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                        scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                    }}
                    className="absolute inset-0 w-32 h-32 border-4 border-purple-200 rounded-full"
                    style={{ borderTopColor: 'transparent', borderRightColor: 'transparent' }}
                />
                <motion.div
                    animate={{ rotate: 360, scale: [1, 1.15, 1] }}
                    transition={{
                        rotate: { duration: 2.5, repeat: Infinity, ease: "linear" },
                        scale: { duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 0.2 }
                    }}
                    className="absolute inset-2 w-28 h-28 border-4 border-pink-200 rounded-full"
                    style={{ borderBottomColor: 'transparent', borderLeftColor: 'transparent' }}
                />
                <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-2xl">
                    <Brain className="w-16 h-16 text-white" />
                </div>
            </motion.div>

            <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-xl font-bold text-gray-700 mb-2"
            >
                {message}
            </motion.div>

            <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        animate={{ y: [0, -10, 0], scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                        className="w-3 h-3 bg-purple-500 rounded-full"
                    />
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
            <motion.div
                key={status}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2"
            >
                {status === 'checking' && (
                    <>
                        <Loader2 className="w-4 h-4 text-purple-500 animate-spin" />
                        <span className="text-sm text-purple-600 font-medium">בודק...</span>
                    </>
                )}

                {status === 'correct' && (
                    <>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500 }}
                        >
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                        </motion.div>
                        <span className="text-sm text-green-600 font-bold">נכון! ✓</span>
                    </>
                )}

                {status === 'wrong' && (
                    <>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500 }}
                        >
                            <XCircle className="w-5 h-5 text-red-500" />
                        </motion.div>
                        <span className="text-sm text-red-600 font-medium">לא נכון</span>
                    </>
                )}

                {status === 'partial' && (
                    <>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500 }}
                        >
                            <AlertCircle className="w-5 h-5 text-yellow-500" />
                        </motion.div>
                        <span className="text-sm text-yellow-600 font-medium">כמעט!</span>
                    </>
                )}
            </motion.div>
        </AnimatePresence>
    );
};

// ==================== MAIN MATH TUTOR COMPONENT ====================
const MathTutor = () => {
    const user = useAuthStore(state => state.user);
    const nexonProfile = useAuthStore(state => state.nexonProfile);

    // View states
    const [view, setView] = useState('home');
    const [selectedTopic, setSelectedTopic] = useState(null);
    const [selectedSubtopic, setSelectedSubtopic] = useState(null);

    // Question states
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false);
    const [hintCount, setHintCount] = useState(0);
    const [currentHints, setCurrentHints] = useState([]);

    // Live feedback states
    const [feedbackStatus, setFeedbackStatus] = useState('idle');
    const [liveFeedback, setLiveFeedback] = useState(null);
    const [finalFeedback, setFinalFeedback] = useState(null);
    const [attemptCount, setAttemptCount] = useState(0);

    // Chat state
    const [chatOpen, setChatOpen] = useState(false);

    const autoCheckTimerRef = useRef(null);
    const lastCheckedAnswerRef = useRef('');

    // Session stats
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

    // Timer
    const [timer, setTimer] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const timerRef = useRef(null);
    const inputRef = useRef(null);

    // Get curriculum
    const currentGrade = nexonProfile?.grade || user?.grade || '8';
    const currentTrack = nexonProfile?.track || user?.track;
    const gradeId = getUserGradeId(currentGrade, currentTrack);
    const gradeConfig = getGradeConfig(gradeId);
    const availableTopics = gradeConfig?.topics || [];

    useEffect(() => {
        console.log('📚 Curriculum loaded:', { currentGrade, currentTrack, gradeId, topicsCount: availableTopics.length });
    }, [currentGrade, currentTrack, gradeId]);

    // Timer effect
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

    // Live feedback effect
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
            const requestBody = {
                topic: {
                    id: topic.id,
                    name: topic.name,
                    nameEn: topic.nameEn
                },
                subtopic: subtopic ? {
                    id: subtopic.id,
                    name: subtopic.name,
                    nameEn: subtopic.nameEn
                } : null,
                difficulty: topic.difficulty || 'intermediate',
                studentProfile: {
                    name: nexonProfile?.name || user?.name || 'תלמיד',
                    grade: nexonProfile?.grade || user?.grade || '8',
                    track: nexonProfile?.track || user?.track,
                    mathFeeling: nexonProfile?.mathFeeling || 'okay',
                    learningStyle: nexonProfile?.learningStyle || 'ask',
                    goalFocus: nexonProfile?.goalFocus || 'understanding'
                }
            };

            console.log('🚀 Sending question request:', requestBody);

            const response = await fetch(`${API_URL}/api/ai/generate-question`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();

            console.log('📥 Backend response:', data);

            if (!response.ok) {
                throw new Error(data.error || data.message || `Backend error: ${response.status}`);
            }

            if (data.success && data.question) {
                console.log('✅ Question received!');
                console.log('   Question:', data.question.question);
                console.log('   visualData:', data.question.visualData);

                await new Promise(resolve => setTimeout(resolve, 1500));
                setCurrentQuestion(data.question);
                setIsTimerRunning(true);
                setTimeout(() => inputRef.current?.focus(), 100);
            } else {
                throw new Error(data.error || 'Failed to generate question');
            }
        } catch (error) {
            console.error('❌ Question generation error:', error);
            toast.error(`שגיאה ביצירת שאלה: ${error.message}`);
            setView('topic-select');
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
                    grade: nexonProfile?.grade || user?.grade || '8',
                    topic: selectedTopic?.name,
                    subtopic: selectedSubtopic?.id
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
                        grade: nexonProfile?.grade || user?.grade || '8',
                        topic: selectedTopic?.name,
                        subtopic: selectedSubtopic?.id
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

    // HOME VIEW
    if (view === 'home') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-4" dir="rtl">
                <div className="max-w-4xl mx-auto pt-12">
                    <motion.div
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                            className="inline-block mb-6"
                        >
                            <div className="w-24 h-24 bg-white/20 backdrop-blur-xl rounded-3xl flex items-center justify-center mx-auto">
                                <Brain className="w-14 h-14 text-white" />
                            </div>
                        </motion.div>

                        <h1 className="text-6xl font-black text-white mb-4 drop-shadow-lg">נקסון</h1>
                        <p className="text-2xl text-white/90 mb-2">המורה הדיגיטלי שלך</p>
                        <p className="text-lg text-white/80">
                            {gradeConfig?.name} • {availableTopics.length} נושאים
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-3 gap-4 mb-8">
                        {[
                            { icon: Trophy, label: 'הרמה שלך', value: 'Level 5', color: 'yellow' },
                            { icon: Flame, label: 'רצף תשובות', value: '12', color: 'orange' },
                            { icon: Star, label: 'נקודות', value: '2,450', color: 'blue' }
                        ].map((stat, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-white/20 backdrop-blur-xl rounded-2xl p-4 text-center"
                            >
                                <stat.icon className={`w-8 h-8 text-${stat.color}-300 mx-auto mb-2`} />
                                <div className="text-2xl font-bold text-white">{stat.value}</div>
                                <div className="text-sm text-white/80">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setView('topic-select')}
                        className="w-full bg-white text-purple-600 rounded-2xl py-6 font-bold text-xl shadow-2xl hover:shadow-3xl transition-all mb-6 flex items-center justify-center gap-3"
                    >
                        <Play className="w-6 h-6" />
                        התחל תרגול
                        <Sparkles className="w-6 h-6" />
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        onClick={() => toast.success('סטטיסטיקות בקרוב!')}
                        className="w-full bg-white/10 backdrop-blur-xl text-white rounded-2xl py-4 font-semibold hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                    >
                        <BarChart3 className="w-5 h-5" />
                        הסטטיסטיקה שלי
                    </motion.button>
                </div>
            </div>
        );
    }

    // TOPIC SELECT VIEW
    if (view === 'topic-select') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-4" dir="rtl">
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <button
                            onClick={() => setView('home')}
                            className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            חזרה
                        </button>
                        <h2 className="text-2xl font-bold text-gray-800">בחר נושא לתרגול</h2>
                        <div className="w-20" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {availableTopics.map((topic, index) => (
                            <motion.div
                                key={topic.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 cursor-pointer border-2 border-transparent hover:border-purple-300"
                                onClick={() => {
                                    setSelectedTopic(topic);
                                    const subtopics = getSubtopics(gradeId, topic.id);
                                    if (subtopics.length === 0) {
                                        startPractice(topic, null);
                                    }
                                }}
                            >
                                <div className="text-5xl mb-3">{topic.icon}</div>
                                <h3 className="text-xl font-bold text-gray-800 mb-2">{topic.name}</h3>
                                <p className="text-sm text-gray-500 mb-4">{topic.nameEn}</p>

                                {selectedTopic?.id === topic.id && getSubtopics(gradeId, topic.id).length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="space-y-2 mt-4 pt-4 border-t"
                                    >
                                        {getSubtopics(gradeId, topic.id).map(subtopic => (
                                            <button
                                                key={subtopic.id}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    startPractice(topic, subtopic);
                                                }}
                                                className="w-full text-right px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-xl transition-all text-sm font-medium text-gray-700 hover:text-purple-700"
                                            >
                                                {subtopic.name}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}

                                {getSubtopics(gradeId, topic.id).length > 0 && selectedTopic?.id !== topic.id && (
                                    <div className="text-xs text-gray-400 flex items-center gap-1">
                                        <ChevronRight className="w-3 h-3" />
                                        {getSubtopics(gradeId, topic.id).length} תתי-נושאים
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // PRACTICE VIEW
    if (view === 'practice') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4" dir="rtl">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="bg-white rounded-2xl shadow-lg p-4 mb-4 flex items-center justify-between">
                        <button
                            onClick={endSession}
                            className="text-gray-600 hover:text-gray-800 font-medium"
                        >
                            סיים
                        </button>

                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-purple-600" />
                                <span className="font-mono text-lg font-bold">{formatTime(timer)}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <Flame className="w-5 h-5 text-orange-500" />
                                <span className="font-bold text-orange-600">{sessionStats.streak}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <Star className="w-5 h-5 text-yellow-500" />
                                <span className="font-bold text-yellow-600">{sessionStats.points}</span>
                            </div>

                            <div className="text-sm font-medium text-gray-600">
                                {sessionStats.correct}/{sessionStats.total}
                            </div>
                        </div>
                    </div>

                    {/* Question Card */}
                    <motion.div
                        key={currentQuestion?.question || 'loading'}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-3xl shadow-2xl p-8 mb-4"
                    >
                        <AnimatePresence mode="wait">
                            {isGeneratingQuestion ? (
                                <ThinkingAnimation message="נקסון מכין שאלה מיוחדת בשבילך..." />
                            ) : currentQuestion ? (
                                <motion.div
                                    key="question-content"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-2">
                                            <span className="text-3xl">{selectedTopic?.icon}</span>
                                            <div>
                                                <div className="font-semibold text-gray-800">{selectedTopic?.name}</div>
                                                {selectedSubtopic && (
                                                    <div className="text-sm text-gray-500">{selectedSubtopic.name}</div>
                                                )}
                                            </div>
                                        </div>

                                        {attemptCount > 0 && (
                                            <div className="flex items-center gap-2 bg-orange-50 px-3 py-1 rounded-full">
                                                <RefreshCw className="w-4 h-4 text-orange-600" />
                                                <span className="text-sm font-medium text-orange-600">
                                                    ניסיון {attemptCount + 1}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mb-8">
                                        <h3 className="text-2xl font-bold text-gray-800 mb-4 leading-relaxed">
                                            {currentQuestion.question}
                                        </h3>
                                    </div>

                                    {/* 🔥 VISUAL GRAPH DISPLAY - THIS IS THE KEY PART! */}
                                    {currentQuestion.visualData && (
                                        <div className="mb-6">
                                            <VisualGraph visualData={currentQuestion.visualData} />
                                        </div>
                                    )}

                                    {currentHints.length > 0 && (
                                        <div className="mb-6 space-y-2">
                                            {currentHints.map((hint, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    className="bg-yellow-50 border-r-4 border-yellow-400 p-4 rounded-lg"
                                                >
                                                    <div className="flex items-start gap-2">
                                                        <Lightbulb className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-1" />
                                                        <div className="text-gray-700">{hint}</div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}

                                    {liveFeedback && !finalFeedback && (<motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`mb-6 p-4 rounded-xl border-2 ${
                                                feedbackStatus === 'correct'
                                                    ? 'bg-green-50 border-green-300'
                                                    : feedbackStatus === 'partial'
                                                        ? 'bg-yellow-50 border-yellow-300'
                                                        : 'bg-red-50 border-red-300'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2 text-sm">
                                                {feedbackStatus === 'correct' && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                                                {feedbackStatus === 'partial' && <AlertCircle className="w-4 h-4 text-yellow-600" />}
                                                {feedbackStatus === 'wrong' && <XCircle className="w-4 h-4 text-red-600" />}
                                                <span className="font-medium text-gray-700">{liveFeedback.explanation}</span>
                                            </div>
                                        </motion.div>
                                    )}

                                    {finalFeedback && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`mb-6 p-6 rounded-2xl ${
                                                finalFeedback.isCorrect
                                                    ? 'bg-green-50 border-2 border-green-200'
                                                    : finalFeedback.isPartial
                                                        ? 'bg-yellow-50 border-2 border-yellow-200'
                                                        : 'bg-red-50 border-2 border-red-200'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 mb-3">
                                                {finalFeedback.isCorrect ? (
                                                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                                                ) : (
                                                    <XCircle className="w-8 h-8 text-red-600" />
                                                )}
                                                <div className="flex-1">
                                                    <div className="text-xl font-bold">{finalFeedback.feedback}</div>
                                                    {finalFeedback.isCorrect && finalFeedback.pointsEarned > 0 && (
                                                        <div className="text-sm text-gray-600">
                                                            +{finalFeedback.pointsEarned} נקודות • {formatTime(finalFeedback.timeTaken)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {finalFeedback.explanation && (
                                                <div className="bg-white/50 rounded-lg p-4 mb-3">
                                                    <div className="font-semibold text-gray-700 mb-2">💡 הסבר:</div>
                                                    <div className="text-gray-700">{finalFeedback.explanation}</div>
                                                </div>
                                            )}

                                            {!finalFeedback.isCorrect && (
                                                <div className="bg-white/50 rounded-lg p-4">
                                                    <div className="font-semibold text-gray-700 mb-1">התשובה הנכונה:</div>
                                                    <div className="text-xl font-bold text-gray-800">{currentQuestion.correctAnswer}</div>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}

                                    {!finalFeedback && (
                                        <div className="space-y-4">
                                            <div className="relative">
                                                <input
                                                    ref={inputRef}
                                                    type="text"
                                                    value={userAnswer}
                                                    onChange={(e) => setUserAnswer(e.target.value)}
                                                    onKeyPress={(e) => e.key === 'Enter' && submitAnswer()}
                                                    placeholder="כתוב/י את התשובה..."
                                                    className="w-full px-6 py-4 pr-32 text-xl border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-200 focus:border-purple-400 transition-all"
                                                />
                                                <LiveFeedbackIndicator status={feedbackStatus} />
                                            </div>

                                            <div className="grid grid-cols-3 gap-3">
                                                <button
                                                    onClick={() => setChatOpen(true)}
                                                    className="flex items-center justify-center gap-2 px-4 py-4 bg-blue-500 text-white rounded-2xl font-bold hover:bg-blue-600 transition-all"
                                                >
                                                    <MessageCircle className="w-5 h-5" />
                                                    שוחח עם נקסון
                                                </button>

                                                <button
                                                    onClick={getHint}
                                                    disabled={hintCount >= 3}
                                                    className="flex items-center justify-center gap-2 px-4 py-4 bg-yellow-500 text-white rounded-2xl font-bold hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                                >
                                                    <Lightbulb className="w-5 h-5" />
                                                    רמז ({3 - hintCount})
                                                </button>

                                                <button
                                                    onClick={submitAnswer}
                                                    disabled={!userAnswer.trim()}
                                                    className="flex items-center justify-center gap-2 px-4 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                                >
                                                    <CheckCircle2 className="w-5 h-5" />
                                                    שלח תשובה
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {finalFeedback && (
                                        <div className="flex gap-3">
                                            {!finalFeedback.isCorrect && (
                                                <button
                                                    onClick={tryAgain}
                                                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-orange-500 text-white rounded-2xl font-bold hover:bg-orange-600 transition-all"
                                                >
                                                    <RefreshCw className="w-5 h-5" />
                                                    נסה שוב
                                                </button>
                                            )}

                                            {finalFeedback.isCorrect && (
                                                <button
                                                    onClick={nextQuestion}
                                                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-bold hover:shadow-lg transition-all"
                                                >
                                                    <Sparkles className="w-5 h-5" />
                                                    שאלה הבאה
                                                    <ChevronRight className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </motion.div>
                            ) : null}
                        </AnimatePresence>
                    </motion.div>
                </div>

                {/* AI Chat Sidebar */}
                <AnimatePresence>
                    {currentQuestion && (
                        <AIChatSidebar
                            question={currentQuestion}
                            studentProfile={{
                                name: nexonProfile?.name || user?.name || 'תלמיד',
                                grade: nexonProfile?.grade || user?.grade || '8',
                                topic: selectedTopic?.name,
                                personality: nexonProfile?.personality || 'nexon',
                                mathFeeling: nexonProfile?.mathFeeling,
                                learningStyle: nexonProfile?.learningStyle
                            }}
                            currentAnswer={userAnswer}
                            isOpen={chatOpen}
                            onToggle={() => setChatOpen(!chatOpen)}
                        />
                    )}
                </AnimatePresence>
            </div>
        );
    }

    // RESULTS VIEW
    if (view === 'results') {
        const avgTime = sessionStats.questionTimes.length > 0
            ? Math.round(sessionStats.questionTimes.reduce((a, b) => a + b, 0) / sessionStats.questionTimes.length)
            : 0;
        const accuracy = sessionStats.total > 0 ? Math.round((sessionStats.correct / sessionStats.total) * 100) : 0;
        const avgAttempts = sessionStats.total > 0 ? (sessionStats.attempts / sessionStats.total).toFixed(1) : 0;

        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-4 flex items-center justify-center" dir="rtl">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full"
                >
                    <div className="text-center mb-6">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", delay: 0.2 }}
                        >
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
                        <button
                            onClick={() => startPractice(selectedTopic, selectedSubtopic)}
                            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold hover:shadow-lg transition-all"
                        >
                            תרגל שוב
                        </button>

                        <button
                            onClick={() => {
                                setView('topic-select');
                                setSelectedTopic(null);
                                setSelectedSubtopic(null);
                            }}
                            className="w-full py-4 bg-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                        >
                            נושא אחר
                        </button>

                        <button
                            onClick={() => setView('home')}
                            className="w-full py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-2xl font-bold hover:border-gray-300 transition-all"
                        >
                            חזרה לדף הבית
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return null;
};

export default MathTutor;