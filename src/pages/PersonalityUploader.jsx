// src/pages/PersonalityUploader.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, CheckCircle, XCircle, Brain, FileSpreadsheet, ArrowLeft, AlertCircle, Download } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

const PersonalityUploader = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            const response = await fetch(`${API_URL}/api/admin/personality-status`);
            const data = await response.json();
            setStatus(data);
        } catch (error) {
            console.error('Status error:', error);
            toast.error('שגיאה בטעינת סטטוס');
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                setSelectedFile(file);
            } else {
                toast.error('יש להעלות קובץ Excel (.xlsx או .xls)');
                e.target.value = '';
            }
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            toast.error('אנא בחר קובץ להעלאה');
            return;
        }

        setUploading(true);
        const loadingToast = toast.loading('מעלה קובץ...');

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            const response = await fetch(`${API_URL}/api/admin/upload-personality`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                toast.success('🎉 מערכת האישיות הועלתה בהצלחה!', { id: loadingToast });
                setSelectedFile(null);
                fetchStatus();

                // Clear file input
                const fileInput = document.getElementById('file-input');
                if (fileInput) fileInput.value = '';
            } else {
                toast.error(data.error || 'שגיאה בהעלאה', { id: loadingToast });
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('שגיאה בהעלאת הקובץ', { id: loadingToast });
        } finally {
            setUploading(false);
        }
    };

    const downloadTemplate = () => {
        toast.success('תבנית Excel תהיה זמינה בקרוב!');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-900 dark:to-pink-900 p-4" dir="rtl">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/admin')}
                        className="flex items-center gap-2 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold mb-4"
                    >
                        <ArrowLeft size={20} />
                        חזרה לניהול
                    </button>

                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <Brain className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-gray-800 dark:text-white">העלאת מערכת AI</h1>
                            <p className="text-gray-600 dark:text-gray-400">ניהול אישיות נקסון והתאמה אישית</p>
                        </div>
                    </div>
                </div>

                {/* Status Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <AlertCircle className="w-6 h-6 text-blue-600" />
                        סטטוס מערכת
                    </h2>

                    {status?.loaded ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl">
                                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                                <div className="flex-1">
                                    <div className="font-bold text-green-800 dark:text-green-300">מערכת פעילה ורצה</div>
                                    <div className="text-sm text-green-600 dark:text-green-400">
                                        המורה הדיגיטלי {status.stats.corePersonality?.teacher_name || 'נקסון'} מוכן לעבודה
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{status.stats.examples}</div>
                                    <div className="text-sm text-purple-700 dark:text-purple-300">דוגמאות שאלות</div>
                                </div>

                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{status.stats.topics}</div>
                                    <div className="text-sm text-blue-700 dark:text-blue-300">נושאים</div>
                                </div>

                                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 border border-yellow-200 dark:border-yellow-800">
                                    <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{status.stats.hints}</div>
                                    <div className="text-sm text-yellow-700 dark:text-yellow-300">רמזים</div>
                                </div>

                                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
                                    <div className="text-3xl font-bold text-red-600 dark:text-red-400">{status.stats.errors}</div>
                                    <div className="text-sm text-red-700 dark:text-red-300">דפוסי שגיאות</div>
                                </div>

                                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">{status.stats.encouragements}</div>
                                    <div className="text-sm text-green-700 dark:text-green-300">עידודים</div>
                                </div>

                                <div className="bg-pink-50 dark:bg-pink-900/20 rounded-xl p-4 border border-pink-200 dark:border-pink-800">
                                    <div className="text-3xl font-bold text-pink-600 dark:text-pink-400">{status.stats.templates}</div>
                                    <div className="text-sm text-pink-700 dark:text-pink-300">תבניות</div>
                                </div>
                            </div>

                            {/* Personality Details */}
                            {status.stats.corePersonality && (
                                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-5 border border-purple-200 dark:border-purple-800">
                                    <h3 className="font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                                        <Brain className="w-5 h-5 text-purple-600" />
                                        אישיות המורה
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">שם:</span>
                                            <span className="font-semibold text-gray-800 dark:text-white mr-2">
                                                {status.stats.corePersonality.teacher_name}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">סגנון:</span>
                                            <span className="font-semibold text-gray-800 dark:text-white mr-2">
                                                {status.stats.corePersonality.teaching_style}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">טון:</span>
                                            <span className="font-semibold text-gray-800 dark:text-white mr-2">
                                                {status.stats.corePersonality.communication_tone}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-600 dark:text-gray-400">אנרגיה:</span>
                                            <span className="font-semibold text-gray-800 dark:text-white mr-2">
                                                {status.stats.corePersonality.energy_level}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-xl">
                            <XCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                            <div>
                                <div className="font-bold text-yellow-800 dark:text-yellow-300">מערכת לא טעונה</div>
                                <div className="text-sm text-yellow-600 dark:text-yellow-400">
                                    המערכת עובדת בברירת מחדל. העלה קובץ Excel להתאמה אישית מלאה
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Upload Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <Upload className="w-6 h-6 text-purple-600" />
                        העלאת קובץ Excel
                    </h2>

                    <div className="space-y-4">
                        {/* File Input Area */}
                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-purple-400 dark:hover:border-purple-500 transition-colors">
                            <FileSpreadsheet className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />

                            <label htmlFor="file-input" className="cursor-pointer">
                                <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg">
                                    <Upload className="w-5 h-5" />
                                    בחר קובץ Excel
                                </div>
                                <input
                                    id="file-input"
                                    type="file"
                                    accept=".xlsx,.xls"
                                    onChange={handleFileSelect}
                                    disabled={uploading}
                                    className="hidden"
                                />
                            </label>

                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                                קובץ Excel (.xlsx או .xls) עם גיליונות מערכת האישיות
                            </p>

                            {selectedFile && (
                                <div className="mt-4 inline-flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 px-4 py-2 rounded-lg font-medium">
                                    <CheckCircle className="w-5 h-5" />
                                    {selectedFile.name}
                                </div>
                            )}
                        </div>

                        {/* Upload Button */}
                        {selectedFile && (
                            <button
                                onClick={handleUpload}
                                disabled={uploading}
                                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg flex items-center justify-center gap-2"
                            >
                                {uploading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                        מעלה...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-5 h-5" />
                                        העלה לשרת
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Instructions Card */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl shadow-lg p-6 border border-blue-200 dark:border-blue-800">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-blue-600" />
                        הוראות שימוש
                    </h3>

                    <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">1</div>
                            <div>
                                <strong>הכן קובץ Excel</strong> עם הגיליונות הבאים:
                                <ul className="mt-1 mr-4 text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                    <li>• PERSONALITY_CORE - אישיות המורה</li>
                                    <li>• EXAMPLES_BANK - דוגמאות שאלות</li>
                                    <li>• TOPIC_GUIDELINES - הנחיות לפי נושא</li>
                                    <li>• HINT_STRUCTURE - מבנה רמזים</li>
                                    <li>• ERROR_PATTERNS - טעויות נפוצות</li>
                                    <li>• ENCOURAGEMENT_LIBRARY - מסרי עידוד</li>
                                </ul>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">2</div>
                            <div><strong>בחר את הקובץ</strong> באמצעות כפתור "בחר קובץ Excel"</div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">3</div>
                            <div><strong>לחץ על "העלה לשרת"</strong> והמתן לטעינה</div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">4</div>
                            <div><strong>בדוק את הסטטוס</strong> - אם הכל תקין תראה סימן ירוק</div>
                        </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
                        <button
                            onClick={downloadTemplate}
                            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold"
                        >
                            <Download className="w-5 h-5" />
                            הורד תבנית לדוגמה (בקרוב)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PersonalityUploader;