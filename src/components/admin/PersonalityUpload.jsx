import React, { useState, useEffect } from 'react';
import { Upload, CheckCircle, FileSpreadsheet } from 'lucide-react';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

const PersonalityUpload = () => {
    const [status, setStatus] = useState(null);
    const [uploading, setUploading] = useState(false);

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
        }
    };

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch(`${API_URL}/api/admin/upload-personality`, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                toast.success('מערכת האישיות הועלתה בהצלחה!');
                fetchStatus();
            } else {
                toast.error(data.error || 'שגיאה בהעלאה');
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('שגיאה בהעלאה');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6" dir="rtl">
            <h2 className="text-2xl font-bold mb-4">מערכת אישיות AI</h2>

            {status?.loaded ? (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-green-800">מערכת פעילה</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                        <div>דוגמאות: {status.stats.examples}</div>
                        <div>נושאים: {status.stats.topics}</div>
                        <div>רמזים: {status.stats.hints}</div>
                        <div>שגיאות: {status.stats.errors}</div>
                    </div>
                </div>
            ) : (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <span className="text-yellow-800">מערכת האישיות לא טעונה</span>
                </div>
            )}

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <label className="cursor-pointer">
                    <input
                        type="file"
                        accept=".xlsx,.xls"
                        onChange={handleUpload}
                        disabled={uploading}
                        className="hidden"
                    />
                    <div className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 inline-flex items-center gap-2">
                        <Upload className="w-5 h-5" />
                        {uploading ? 'מעלה...' : 'העלה קובץ Excel'}
                    </div>
                </label>
                <p className="text-sm text-gray-500 mt-2">
                    קובץ Excel עם 12 גיליונות
                </p>
            </div>
        </div>
    );
};

export default PersonalityUpload;