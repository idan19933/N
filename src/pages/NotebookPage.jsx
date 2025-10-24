// src/pages/NotebookPage.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Calendar, AlertCircle } from 'lucide-react';
import useAuthStore from '../store/authStore';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

const NotebookPage = () => {
    const [entries, setEntries] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const { user } = useAuthStore();

    useEffect(() => {
        if (user?.uid) {  // ✅ Using Firebase UID
            loadNotebookData();
        }
    }, [user?.uid]);

    const loadNotebookData = async () => {
        try {
            setLoading(true);
            const userId = user?.uid;  // ✅ Using Firebase UID

            console.log('🔍 Loading notebook for user:', userId);

            // Fetch entries
            const entriesRes = await fetch(`${API_URL}/api/notebook/entries?userId=${userId}`);
            const entriesData = await entriesRes.json();

            // Fetch stats
            const statsRes = await fetch(`${API_URL}/api/notebook/stats?userId=${userId}`);
            const statsData = await statsRes.json();

            console.log('📊 Entries:', entriesData);
            console.log('📊 Stats:', statsData);

            if (entriesData.success) {
                setEntries(entriesData.entries || []);
            }

            if (statsData.success) {
                setStats(statsData.stats);
            }
        } catch (error) {
            console.error('❌ Error loading notebook:', error);
        } finally {
            setLoading(false);
        }
    };

    const uniqueTopics = [...new Set(entries.map(e => e.topic).filter(Boolean))];
    const filteredEntries = filter === 'all' ? entries : entries.filter(e => e.topic === filter);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin w-16 h-16 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-white text-lg">טוען את המחברת שלך...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 py-8 px-4">
            <div className="max-w-6xl mx-auto mb-8">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <BookOpen className="w-12 h-12 text-white" />
                        <h1 className="text-4xl font-bold text-white">המחברת שלי</h1>
                    </div>
                    <p className="text-gray-200 text-lg">כל התרגילים והנושאים שפתרת במקום אחד</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl">
                    {stats ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-indigo-50 rounded-xl p-4">
                                <div className="text-2xl font-bold text-indigo-600">{stats.total_entries || 0}</div>
                                <div className="text-sm text-gray-600">רשומות סך הכל</div>
                            </div>
                            <div className="bg-green-50 rounded-xl p-4">
                                <div className="text-2xl font-bold text-green-600">{stats.topic_count || 0}</div>
                                <div className="text-sm text-gray-600">נושאים</div>
                            </div>
                            <div className="bg-purple-50 rounded-xl p-4">
                                <div className="text-2xl font-bold text-purple-600">{stats.exercise_count || 0}</div>
                                <div className="text-sm text-gray-600">תרגילים</div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-white">
                            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm opacity-70">אין נתונים סטטיסטיים זמינים</p>
                        </div>
                    )}
                </motion.div>
            </div>

            {uniqueTopics.length > 0 && (
                <div className="max-w-6xl mx-auto mb-6">
                    <div className="bg-white rounded-xl p-4 shadow-lg flex gap-2 overflow-x-auto">
                        <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                            הכל ({entries.length})
                        </button>
                        {uniqueTopics.map(topic => (
                            <button key={topic} onClick={() => setFilter(topic)} className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${filter === topic ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                                {topic}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="max-w-6xl mx-auto">
                {filteredEntries.length === 0 ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl p-12 text-center shadow-xl">
                        <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-700 mb-2">המחברת שלך ריקה</h3>
                        <p className="text-gray-600">התחל לפתור תרגילים כדי לראות כאן את ההתקדמות שלך!</p>
                    </motion.div>
                ) : (
                    <div className="grid gap-4">
                        {filteredEntries.map((entry, index) => (
                            <motion.div key={entry.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg mb-2 text-gray-900">{entry.title}</h3>
                                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                            {entry.topic && (<span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full">{entry.topic}</span>)}
                                            {entry.subtopic && (<span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full">{entry.subtopic}</span>)}
                                        </div>
                                    </div>
                                    <div className="text-3xl">{entry.summary?.includes('✅') ? '✅' : '📝'}</div>
                                </div>
                                <p className="text-gray-700 mb-3">{entry.summary}</p>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(entry.created_at).toLocaleDateString('he-IL', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotebookPage;