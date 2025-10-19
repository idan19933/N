// src/pages/PersonalityAdmin.jsx - COMPLETE PERSONALITY UPLOAD PAGE
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload,
    FileSpreadsheet,
    CheckCircle,
    AlertCircle,
    Download,
    RefreshCw,
    Info,
    Sparkles,
    Brain,
    MessageSquare,
    BookOpen,
    Target,
    Lightbulb
} from 'lucide-react';

const REQUIRED_SHEETS = [
    { name: 'CORE_PERSONALITY', icon: Brain, description: 'שם המורה, טון, אישיות בסיסית' },
    { name: 'LANGUAGE_STYLE', icon: MessageSquare, description: 'סגנון שפה, אורך משפטים, מטפורות' },
    { name: 'TOPIC_GUIDELINES', icon: BookOpen, description: 'הנחיות לכל נושא מתמטי' },
    { name: 'HINT_SYSTEM', icon: Lightbulb, description: 'מערכת רמזים הדרגתית' },
    { name: 'STEP_TEMPLATES', icon: Target, description: 'תבניות לשלבי פתרון' },
    { name: 'ANSWER_FORMATS', icon: CheckCircle, description: 'פורמטים של תשובות' },
    { name: 'EXAMPLES_BANK', icon: FileSpreadsheet, description: 'בנק דוגמאות' },
    { name: 'ERROR_PATTERNS', icon: AlertCircle, description: 'דפוסי טעויות נפוצות' },
    { name: 'ENCOURAGEMENT_LIBRARY', icon: Sparkles, description: 'ספריית עידודים' },
    { name: 'QUESTION_TEMPLATES', icon: BookOpen, description: 'תבניות שאלות' },
    { name: 'PROGRESSION_RULES', icon: Target, description: 'כללי התקדמות' },
    { name: 'CULTURAL_CONTEXT', icon: Info, description: 'הקשר תרבותי ישראלי' }
];

export default function PersonalityAdmin() {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState(null);
    const [currentPersonality, setCurrentPersonality] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dragActive, setDragActive] = useState(false);

    useEffect(() => {
        loadCurrentPersonality();
    }, []);

    const loadCurrentPersonality = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/personality');
            const data = await response.json();
            setCurrentPersonality(data.personality);
        } catch (error) {
            console.error('Error loading personality:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (selectedFile) => {
        if (selectedFile && (
            selectedFile.name.endsWith('.xlsx') ||
            selectedFile.name.endsWith('.xls')
        )) {
            setFile(selectedFile);
            setUploadResult(null);
        } else {
            alert('אנא בחר קובץ Excel (.xlsx או .xls)');
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setUploadResult(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:3001/api/upload-personality', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                setUploadResult({
                    success: true,
                    message: 'הקובץ הועלה בהצלחה! 🎉',
                    data: result
                });
                await loadCurrentPersonality();
            } else {
                setUploadResult({
                    success: false,
                    message: result.error || 'שגיאה בהעלאת הקובץ'
                });
            }
        } catch (error) {
            setUploadResult({
                success: false,
                message: `שגיאת חיבור: ${error.message}`
            });
        } finally {
            setUploading(false);
        }
    };

    const downloadTemplate = () => {
        // In production, this would download an actual template file
        alert('תבנית Excel תורד בקרוב! כרגע, צור קובץ Excel עם 12 גליונות כמפורט למטה.');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mb-6">
                        <Brain className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-800 mb-3">
                        ניהול אישיות AI 🤖
                    </h1>
                    <p className="text-lg text-gray-600">
                        העלה קובץ Excel עם 12 גליונות להגדרת אישיות המורה
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Upload Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-3xl shadow-xl p-8"
                    >
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                            <Upload className="w-7 h-7 text-purple-600" />
                            העלאת קובץ
                        </h2>

                        {/* Drag & Drop Zone */}
                        <div
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            className={`border-3 border-dashed rounded-2xl p-12 text-center transition-all ${
                                dragActive
                                    ? 'border-purple-500 bg-purple-50'
                                    : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                            }`}
                        >
                            <FileSpreadsheet className={`w-16 h-16 mx-auto mb-4 ${
                                dragActive ? 'text-purple-600' : 'text-gray-400'
                            }`} />

                            {file ? (
                                <div className="mb-4">
                                    <p className="text-lg font-semibold text-gray-800 mb-2">
                                        ✅ {file.name}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        גודל: {(file.size / 1024).toFixed(2)} KB
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <p className="text-lg font-semibold text-gray-800 mb-2">
                                        גרור קובץ Excel לכאן
                                    </p>
                                    <p className="text-gray-600 mb-4">או</p>
                                </>
                            )}

                            <label className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-bold cursor-pointer hover:from-purple-700 hover:to-pink-700 transition-all">
                                {file ? 'בחר קובץ אחר' : 'בחר קובץ'}
                                <input
                                    type="file"
                                    accept=".xlsx,.xls"
                                    onChange={(e) => handleFileSelect(e.target.files[0])}
                                    className="hidden"
                                />
                            </label>
                        </div>

                        {/* Upload Button */}
                        <button
                            onClick={handleUpload}
                            disabled={!file || uploading}
                            className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl font-bold text-lg hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center gap-3"
                        >
                            {uploading ? (
                                <>
                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                    מעלה...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-5 h-5" />
                                    העלה לשרת
                                </>
                            )}
                        </button>

                        {/* Upload Result */}
                        <AnimatePresence>
                            {uploadResult && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className={`mt-6 p-6 rounded-2xl ${
                                        uploadResult.success
                                            ? 'bg-green-50 border-2 border-green-200'
                                            : 'bg-red-50 border-2 border-red-200'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        {uploadResult.success ? (
                                            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                                        ) : (
                                            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                                        )}
                                        <div className="flex-1">
                                            <p className={`font-bold ${
                                                uploadResult.success ? 'text-green-800' : 'text-red-800'
                                            }`}>
                                                {uploadResult.message}
                                            </p>
                                            {uploadResult.success && uploadResult.data && (
                                                <div className="mt-3 text-sm text-gray-700">
                                                    <p>מורה: <strong>{uploadResult.data.teacherName}</strong></p>
                                                    <p>סה"כ רשומות: <strong>{uploadResult.data.totalEntries}</strong></p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Download Template */}
                        <button
                            onClick={downloadTemplate}
                            className="w-full mt-4 px-6 py-3 bg-gray-100 text-gray-700 rounded-2xl font-semibold hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                        >
                            <Download className="w-5 h-5" />
                            הורד תבנית Excel
                        </button>
                    </motion.div>

                    {/* Current Personality Status */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-3xl shadow-xl p-8"
                    >
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                            <Info className="w-7 h-7 text-blue-600" />
                            מצב נוכחי
                        </h2>

                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <RefreshCw className="w-8 h-8 text-purple-600 animate-spin" />
                            </div>
                        ) : currentPersonality ? (
                            <div className="space-y-6">
                                {/* Teacher Info */}
                                <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl">
                                    <h3 className="font-bold text-lg text-gray-800 mb-3">
                                        👨‍🏫 מידע על המורה
                                    </h3>
                                    <div className="space-y-2 text-sm">
                                        <p><strong>שם:</strong> {currentPersonality.core?.teacher_name || 'לא מוגדר'}</p>
                                        <p><strong>טון:</strong> {currentPersonality.core?.tone || 'לא מוגדר'}</p>
                                        <p><strong>סגנון הומור:</strong> {currentPersonality.core?.humor_style || 'לא מוגדר'}</p>
                                    </div>
                                </div>

                                {/* Sheets Status */}
                                <div>
                                    <h3 className="font-bold text-lg text-gray-800 mb-4">
                                        📊 סטטוס גליונות
                                    </h3>
                                    <div className="space-y-2">
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            <div className="p-3 bg-blue-50 rounded-xl">
                                                <p className="font-semibold text-blue-900">נושאים</p>
                                                <p className="text-2xl font-bold text-blue-600">
                                                    {currentPersonality.topicsCount || 0}
                                                </p>
                                            </div>
                                            <div className="p-3 bg-green-50 rounded-xl">
                                                <p className="font-semibold text-green-900">רמזים</p>
                                                <p className="text-2xl font-bold text-green-600">
                                                    {currentPersonality.hintsCount || 0}
                                                </p>
                                            </div>
                                            <div className="p-3 bg-yellow-50 rounded-xl">
                                                <p className="font-semibold text-yellow-900">דוגמאות</p>
                                                <p className="text-2xl font-bold text-yellow-600">
                                                    {currentPersonality.examplesCount || 0}
                                                </p>
                                            </div>
                                            <div className="p-3 bg-purple-50 rounded-xl">
                                                <p className="font-semibold text-purple-900">עידודים</p>
                                                <p className="text-2xl font-bold text-purple-600">
                                                    {currentPersonality.encouragementCount || 0}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>לא נטען קובץ אישיות</p>
                                <p className="text-sm mt-2">העלה קובץ Excel כדי להתחיל</p>
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Required Sheets Info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-8 bg-white rounded-3xl shadow-xl p-8"
                >
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                        <FileSpreadsheet className="w-7 h-7 text-purple-600" />
                        12 הגליונות הנדרשים
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {REQUIRED_SHEETS.map((sheet, index) => (
                            <motion.div
                                key={sheet.name}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-2 border-purple-100 hover:border-purple-300 transition-all"
                            >
                                <div className="flex items-start gap-3">
                                    <sheet.icon className="w-5 h-5 text-purple-600 flex-shrink-0 mt-1" />
                                    <div>
                                        <h3 className="font-bold text-sm text-gray-800 mb-1">
                                            {sheet.name}
                                        </h3>
                                        <p className="text-xs text-gray-600">
                                            {sheet.description}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-6 p-6 bg-blue-50 border-2 border-blue-200 rounded-2xl">
                        <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                            <Info className="w-5 h-5" />
                            כיצד ליצור את הקובץ
                        </h3>
                        <ol className="text-sm text-blue-800 space-y-2 mr-5">
                            <li><strong>1.</strong> צור קובץ Excel חדש</li>
                            <li><strong>2.</strong> צור 12 גליונות עם השמות המדויקים למעלה</li>
                            <li><strong>3.</strong> מלא כל גליון עם המידע הרלוונטי</li>
                            <li><strong>4.</strong> שמור כ-.xlsx והעלה כאן</li>
                        </ol>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}