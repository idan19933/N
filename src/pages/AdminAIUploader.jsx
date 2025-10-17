// src/pages/AdminAIUploader.jsx - COMPLETE AI-POWERED UPLOADER
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Upload, Download, CheckCircle, AlertCircle, Sparkles, Loader, FileText, Globe, Zap, BarChart } from 'lucide-react';
import { universalFetcher } from '../services/universalProblemFetcher';
import { aiProblemMapper } from '../services/aiProblemMapper';
import { problemDatabase } from '../services/problemDatabase';
import toast from 'react-hot-toast';

const AdminAIUploader = () => {
    // Source configuration
    const [sourceType, setSourceType] = useState('url');
    const [sourceUrl, setSourceUrl] = useState('');
    const [textInput, setTextInput] = useState('');

    // Processing state
    const [fetching, setFetching] = useState(false);
    const [mapping, setMapping] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Data state
    const [fetchedData, setFetchedData] = useState(null);
    const [mappedProblems, setMappedProblems] = useState([]);
    const [uploadResult, setUploadResult] = useState(null);

    // Preview & Stats
    const [preview, setPreview] = useState(null);
    const [progress, setProgress] = useState(null);
    const [stats, setStats] = useState(null);
    const [errors, setErrors] = useState([]);

    // Check if API key is configured
    const hasAPIKey = !!import.meta.env.VITE_CLAUDE_API_KEY;

    // Step 1: Fetch raw data
    const handleFetch = async () => {
        setFetching(true);
        setFetchedData(null);
        setErrors([]);

        try {
            let source = {};

            if (sourceType === 'text') {
                if (!textInput.trim()) {
                    toast.error('Please enter some text');
                    setFetching(false);
                    return;
                }
                source = {
                    type: 'text',
                    text: textInput
                };
            } else {
                if (!sourceUrl) {
                    toast.error('Please enter a URL');
                    setFetching(false);
                    return;
                }
                source = {
                    type: 'url',
                    url: sourceUrl
                };
            }

            console.log('🌐 Fetching from source:', source);
            const data = await universalFetcher.fetch(source);

            setFetchedData(data);
            setPreview({ raw: JSON.stringify(data[0], null, 2).substring(0, 500) });
            toast.success(`✅ Fetched data successfully!`);

        } catch (error) {
            console.error('❌ Fetch error:', error);
            toast.error('Failed to fetch: ' + error.message);
            setErrors([{ stage: 'fetch', error: error.message }]);
        } finally {
            setFetching(false);
        }
    };

    // Step 2: Map with AI
    const handleAIMap = async () => {
        setMapping(true);
        setMappedProblems([]);
        setProgress(null);

        try {
            console.log('🤖 Starting AI mapping...');

            const result = await aiProblemMapper.mapProblemsWithAI(
                fetchedData,
                (progressInfo) => {
                    setProgress(progressInfo);
                }
            );

            setMappedProblems(result.mapped);
            setErrors(result.errors);
            setStats(result.stats);

            if (result.mapped.length > 0) {
                setPreview(result.mapped[0]);
                toast.success(`✅ AI mapped ${result.mapped.length} problems!`);

                // Show distributions
                const diffDist = aiProblemMapper.getDifficultyDistribution(result.mapped);
                const topicDist = aiProblemMapper.getTopicDistribution(result.mapped);
                console.log('📊 Difficulty distribution:', diffDist);
                console.log('📊 Topic distribution:', topicDist);
            }

            if (result.errors.length > 0) {
                toast.error(`⚠️ ${result.errors.length} problems failed to map`);
            }
        } catch (error) {
            console.error('❌ Mapping error:', error);
            toast.error('AI mapping failed: ' + error.message);
            setErrors([...errors, { stage: 'mapping', error: error.message }]);
        } finally {
            setMapping(false);
            setProgress(null);
        }
    };

    // Step 3: Upload to database
    const handleUpload = async () => {
        setUploading(true);
        setUploadResult(null);

        try {
            console.log('⬆️ Uploading to database...');

            // Format for database
            const formattedProblems = mappedProblems.map(p => ({
                question: p.question,
                answer: p.answer,
                steps: JSON.stringify(p.steps),
                hints: JSON.stringify(p.hints),
                difficulty: p.difficulty,
                topic: p.topic,
                category: p.category,
                subcategory: p.subcategory,
                grade: p.grade,
                tier: p.tier
            }));

            const result = await problemDatabase.bulkAddProblems(formattedProblems);
            setUploadResult(result);
            toast.success(`🎉 Uploaded ${result.count || mappedProblems.length} problems!`);

        } catch (error) {
            console.error('❌ Upload error:', error);
            toast.error('Failed to upload: ' + error.message);
            setErrors([...errors, { stage: 'upload', error: error.message }]);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 mb-6 relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10"></div>
                    <div className="relative flex items-center gap-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl flex items-center justify-center">
                            <Brain className="w-10 h-10 text-white" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                                AI Problem Importer
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400 text-lg">
                                Powered by Claude AI • Understands Any Format • Zero Hardcoding
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className={`px-4 py-2 rounded-full ${hasAPIKey ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {hasAPIKey ? '✅ API Key Set' : '❌ No API Key'}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {!hasAPIKey && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 rounded-2xl p-6 mb-6"
                    >
                        <div className="flex items-start gap-4">
                            <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
                            <div>
                                <h3 className="text-xl font-bold text-red-900 dark:text-red-300 mb-2">
                                    API Key Required
                                </h3>
                                <p className="text-red-800 dark:text-red-200 mb-3">
                                    Add VITE_CLAUDE_API_KEY to your .env file and restart the server.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Configuration */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Source Type */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
                        >
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <Zap className="w-6 h-6 text-yellow-500" />
                                1. Select Source
                            </h2>

                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { value: 'url', icon: Globe, label: 'URL' },
                                    { value: 'text', icon: FileText, label: 'Text' }
                                ].map((type) => (
                                    <button
                                        key={type.value}
                                        onClick={() => setSourceType(type.value)}
                                        className={`p-4 rounded-xl border-2 transition ${
                                            sourceType === type.value
                                                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                                : 'border-gray-200 hover:border-purple-300'
                                        }`}
                                    >
                                        <type.icon className="w-8 h-8 mx-auto mb-2" />
                                        <div className="font-bold">{type.label}</div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>

                        {/* Source Input */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
                        >
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <Download className="w-6 h-6 text-blue-500" />
                                2. Fetch Data
                            </h2>

                            {sourceType === 'text' ? (
                                <textarea
                                    value={textInput}
                                    onChange={(e) => setTextInput(e.target.value)}
                                    placeholder="Paste math problems here in ANY format... AI will extract and solve them!"
                                    rows={10}
                                    className="w-full px-4 py-3 border-2 rounded-xl dark:bg-gray-700 dark:border-gray-600 font-mono text-sm"
                                />
                            ) : (
                                <input
                                    type="text"
                                    value={sourceUrl}
                                    onChange={(e) => setSourceUrl(e.target.value)}
                                    placeholder="https://example.com/problems.json or .txt or .csv"
                                    className="w-full px-4 py-3 border-2 rounded-xl dark:bg-gray-700 dark:border-gray-600"
                                />
                            )}

                            <button
                                onClick={handleFetch}
                                disabled={fetching}
                                className="mt-4 w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl transition disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {fetching ? (
                                    <>
                                        <Loader className="w-6 h-6 animate-spin" />
                                        Fetching...
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-6 h-6" />
                                        Fetch Data
                                    </>
                                )}
                            </button>
                        </motion.div>

                        {/* AI Mapping */}
                        {fetchedData && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl shadow-xl p-6 border-2 border-purple-300"
                            >
                                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                    <Brain className="w-6 h-6 text-purple-600" />
                                    3. AI Mapping
                                </h2>

                                <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-xl">
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                        <strong>What AI will do:</strong>
                                    </p>
                                    <ul className="text-xs space-y-1 text-gray-600 dark:text-gray-400 list-disc list-inside">
                                        <li>Extract all math problems from the data</li>
                                        <li>Solve each problem and verify answers</li>
                                        <li>Generate solution steps in Hebrew</li>
                                        <li>Create helpful hints</li>
                                        <li>Classify difficulty (1-7)</li>
                                        <li>Map to topics: algebra, geometry, calculus, etc.</li>
                                    </ul>
                                </div>

                                <button
                                    onClick={handleAIMap}
                                    disabled={mapping || !hasAPIKey}
                                    className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl transition disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {mapping ? (
                                        <>
                                            <Loader className="w-6 h-6 animate-spin" />
                                            AI Analyzing... {progress && `${progress.percent}%`}
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-6 h-6" />
                                            Map with AI
                                        </>
                                    )}
                                </button>

                                {progress && (
                                    <div className="mt-4">
                                        <div className="flex justify-between text-sm mb-2">
                                            <span>Progress: {progress.current}/{progress.total}</span>
                                            <span>{progress.percent}%</span>
                                        </div>
                                        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                            <motion.div
                                                animate={{ width: `${progress.percent}%` }}
                                                className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
                                            />
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* Upload */}
                        {mappedProblems.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
                            >
                                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                    <Upload className="w-6 h-6 text-green-600" />
                                    4. Upload to Database
                                </h2>

                                <button
                                    onClick={handleUpload}
                                    disabled={uploading}
                                    className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl transition disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {uploading ? (
                                        <>
                                            <Loader className="w-6 h-6 animate-spin" />
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-6 h-6" />
                                            Upload {mappedProblems.length} Problems
                                        </>
                                    )}
                                </button>
                            </motion.div>
                        )}
                    </div>

                    {/* Right: Status & Preview */}
                    <div className="space-y-6">
                        {/* Status */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
                        >
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <BarChart className="w-6 h-6" />
                                Status
                            </h3>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                    <span className="font-medium">Fetched</span>
                                    <span className="text-2xl font-bold text-blue-600">
                                        {fetchedData ? '✓' : '—'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                                    <span className="font-medium">AI Mapped</span>
                                    <span className="text-2xl font-bold text-purple-600">
                                        {mappedProblems.length}
                                    </span>
                                </div>
                                {uploadResult && (
                                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                                        <span className="font-medium">Uploaded</span>
                                        <span className="text-2xl font-bold text-green-600">
                                            {uploadResult.count || mappedProblems.length}
                                        </span>
                                    </div>
                                )}
                                {stats && (
                                    <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                        <div className="text-sm font-medium mb-2">Success Rate</div>
                                        <div className="text-3xl font-bold text-indigo-600">
                                            {stats.successRate}%
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Preview */}
                        {preview && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
                            >
                                <h3 className="text-xl font-bold mb-4">Preview</h3>

                                <div className="space-y-3 text-sm">
                                    {preview.question && (
                                        <>
                                            <div>
                                                <div className="font-semibold text-gray-600 dark:text-gray-400 mb-1">Question:</div>
                                                <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                                                    {preview.question?.substring(0, 150)}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="font-semibold text-gray-600 dark:text-gray-400 mb-1">Answer:</div>
                                                <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                                                    {preview.answer}
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <div className="font-semibold text-gray-600 dark:text-gray-400 mb-1">Topic:</div>
                                                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                                                        {preview.topic}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-600 dark:text-gray-400 mb-1">Difficulty:</div>
                                                    <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                                                        Level {preview.difficulty || '?'}
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    {preview.raw && (
                                        <div>
                                            <div className="font-semibold text-gray-600 dark:text-gray-400 mb-1">Raw Data:</div>
                                            <pre className="p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs overflow-auto max-h-48">
                                                {preview.raw}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* Errors */}
                        {errors.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-red-50 dark:bg-red-900/20 rounded-2xl shadow-xl p-6 border-2 border-red-300"
                            >
                                <h3 className="text-xl font-bold mb-4 text-red-900 dark:text-red-300 flex items-center gap-2">
                                    <AlertCircle className="w-6 h-6" />
                                    Errors ({errors.length})
                                </h3>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {errors.map((err, i) => (
                                        <div key={i} className="text-sm p-2 bg-white dark:bg-red-900/40 rounded">
                                            <span className="font-bold">{err.stage}:</span> {err.error}
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAIUploader;