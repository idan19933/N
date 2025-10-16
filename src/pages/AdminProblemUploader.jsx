import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Plus, Trash2, Save, FileText, Download, AlertCircle } from 'lucide-react';
import { problemDatabase } from '../services/problemDatabase';
import toast from 'react-hot-toast';

const AdminProblemUploader = () => {
    const [problems, setProblems] = useState([createEmptyProblem()]);
    const [uploading, setUploading] = useState(false);
    const [jsonMode, setJsonMode] = useState(false);
    const [jsonText, setJsonText] = useState('');
    const [stats, setStats] = useState(null);

    function createEmptyProblem() {
        return {
            topic: 'trigonometry',
            subTopic: '',
            difficulty: 'intermediate',
            tier: 3,
            grade: '10',
            track: '4 יחידות',
            question: '',
            answer: '',
            steps: [{ stepNumber: 1, description: '', content: '', hint: '' }],
            hints: [''],
            explanation: '',
            tags: [],
            hebrewTopic: 'טריגונומטריה'
        };
    }

    const addProblem = () => {
        setProblems([...problems, createEmptyProblem()]);
    };

    const removeProblem = (index) => {
        setProblems(problems.filter((_, i) => i !== index));
    };

    const updateProblem = (index, field, value) => {
        const updated = [...problems];
        updated[index] = { ...updated[index], [field]: value };
        setProblems(updated);
    };

    const updateStep = (problemIndex, stepIndex, field, value) => {
        const updated = [...problems];
        updated[problemIndex].steps[stepIndex][field] = value;
        setProblems(updated);
    };

    const addStep = (problemIndex) => {
        const updated = [...problems];
        const newStepNumber = updated[problemIndex].steps.length + 1;
        updated[problemIndex].steps.push({
            stepNumber: newStepNumber,
            description: '',
            content: '',
            hint: ''
        });
        setProblems(updated);
    };

    const removeStep = (problemIndex, stepIndex) => {
        const updated = [...problems];
        updated[problemIndex].steps = updated[problemIndex].steps.filter((_, i) => i !== stepIndex);
        // Renumber steps
        updated[problemIndex].steps.forEach((step, i) => {
            step.stepNumber = i + 1;
        });
        setProblems(updated);
    };

    const uploadProblems = async () => {
        setUploading(true);
        try {
            const results = await problemDatabase.bulkUpload(problems);

            if (results.success.length > 0) {
                toast.success(`✅ ${results.success.length} problems uploaded successfully!`);
            }

            if (results.failed.length > 0) {
                toast.error(`❌ ${results.failed.length} problems failed to upload`);
                console.error('Failed problems:', results.failed);
            }

            // Reset on full success
            if (results.failed.length === 0) {
                setProblems([createEmptyProblem()]);
            }
        } catch (error) {
            toast.error('Upload failed: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const loadStats = async () => {
        const statistics = await problemDatabase.getStatistics();
        setStats(statistics);
    };

    const exportJSON = () => {
        const json = JSON.stringify(problems, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `problems-${Date.now()}.json`;
        a.click();
        toast.success('JSON exported!');
    };

    const importJSON = () => {
        try {
            const parsed = JSON.parse(jsonText);
            if (Array.isArray(parsed)) {
                setProblems(parsed);
                toast.success(`Loaded ${parsed.length} problems`);
                setJsonMode(false);
                setJsonText('');
            } else if (parsed.topic) {
                setProblems([parsed]);
                toast.success('Loaded 1 problem');
                setJsonMode(false);
                setJsonText('');
            } else {
                toast.error('Invalid JSON format');
            }
        } catch (error) {
            toast.error('Failed to parse JSON: ' + error.message);
        }
    };

    React.useEffect(() => {
        loadStats();
    }, []);

    if (jsonMode) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                            Import JSON
                        </h2>
                        <textarea
                            value={jsonText}
                            onChange={(e) => setJsonText(e.target.value)}
                            placeholder="Paste JSON here..."
                            className="w-full h-96 p-4 bg-gray-50 dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-xl text-sm font-mono"
                        />
                        <div className="flex gap-4 mt-4">
                            <button
                                onClick={importJSON}
                                className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
                            >
                                Import
                            </button>
                            <button
                                onClick={() => { setJsonMode(false); setJsonText(''); }}
                                className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                                Problem Uploader
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Add math problems with step-by-step solutions
                            </p>
                        </div>
                        <Upload className="w-16 h-16 text-purple-600" />
                    </div>

                    {/* Statistics */}
                    {stats && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                                <div className="text-2xl font-bold text-purple-600">{stats.total}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Total Problems</div>
                            </div>
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                <div className="text-2xl font-bold text-blue-600">{Object.keys(stats.byTopic).length}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Topics</div>
                            </div>
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                                <div className="text-2xl font-bold text-green-600">{problems.length}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">In Queue</div>
                            </div>
                            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                                <div className="text-2xl font-bold text-orange-600">{Object.keys(stats.byGrade).length}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">Grade Levels</div>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-4 mt-6 flex-wrap">
                        <button
                            onClick={addProblem}
                            className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Add Problem
                        </button>
                        <button
                            onClick={uploadProblems}
                            disabled={uploading}
                            className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50"
                        >
                            <Save className="w-5 h-5" />
                            {uploading ? 'Uploading...' : `Upload ${problems.length} Problem${problems.length !== 1 ? 's' : ''}`}
                        </button>
                        <button
                            onClick={exportJSON}
                            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition flex items-center gap-2"
                        >
                            <Download className="w-5 h-5" />
                            Export JSON
                        </button>
                        <button
                            onClick={() => setJsonMode(true)}
                            className="px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition flex items-center gap-2"
                        >
                            <FileText className="w-5 h-5" />
                            Import JSON
                        </button>
                    </div>
                </div>

                {/* Problems List */}
                <AnimatePresence>
                    {problems.map((problem, problemIndex) => (
                        <motion.div
                            key={problemIndex}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl mb-6"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Problem {problemIndex + 1}
                                </h2>
                                {problems.length > 1 && (
                                    <button
                                        onClick={() => removeProblem(problemIndex)}
                                        className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg hover:bg-red-200 transition"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                )}
                            </div>

                            {/* Basic Info Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Topic (English)
                                    </label>
                                    <select
                                        value={problem.topic}
                                        onChange={(e) => updateProblem(problemIndex, 'topic', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-xl"
                                    >
                                        <option value="trigonometry">Trigonometry</option>
                                        <option value="algebra">Algebra</option>
                                        <option value="calculus">Calculus</option>
                                        <option value="geometry">Geometry</option>
                                        <option value="functions">Functions</option>
                                        <option value="sequences">Sequences</option>
                                        <option value="probability">Probability</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Hebrew Topic
                                    </label>
                                    <input
                                        type="text"
                                        value={problem.hebrewTopic}
                                        onChange={(e) => updateProblem(problemIndex, 'hebrewTopic', e.target.value)}
                                        placeholder="טריגונומטריה"
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-xl"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Sub-Topic
                                    </label>
                                    <input
                                        type="text"
                                        value={problem.subTopic}
                                        onChange={(e) => updateProblem(problemIndex, 'subTopic', e.target.value)}
                                        placeholder="sine/cosine identities"
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-xl"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Difficulty
                                    </label>
                                    <select
                                        value={problem.difficulty}
                                        onChange={(e) => updateProblem(problemIndex, 'difficulty', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-xl"
                                    >
                                        <option value="beginner">Beginner</option>
                                        <option value="intermediate">Intermediate</option>
                                        <option value="advanced">Advanced</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Tier (1-7)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="7"
                                        value={problem.tier}
                                        onChange={(e) => updateProblem(problemIndex, 'tier', parseInt(e.target.value))}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-xl"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Grade
                                    </label>
                                    <select
                                        value={problem.grade}
                                        onChange={(e) => updateProblem(problemIndex, 'grade', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-xl"
                                    >
                                        {['7', '8', '9', '10', '11', '12'].map(g => (
                                            <option key={g} value={g}>כיתה {g}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Question & Answer */}
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Question
                                    </label>
                                    <textarea
                                        value={problem.question}
                                        onChange={(e) => updateProblem(problemIndex, 'question', e.target.value)}
                                        placeholder="Find sin(45°) × cos(30°)"
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-xl"
                                        rows="3"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Final Answer
                                    </label>
                                    <input
                                        type="text"
                                        value={problem.answer}
                                        onChange={(e) => updateProblem(problemIndex, 'answer', e.target.value)}
                                        placeholder="√6/4"
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-xl"
                                    />
                                </div>
                            </div>

                            {/* Solution Steps */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                        Solution Steps
                                    </h3>
                                    <button
                                        onClick={() => addStep(problemIndex)}
                                        className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg hover:bg-purple-200 transition flex items-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Step
                                    </button>
                                </div>

                                {problem.steps.map((step, stepIndex) => (
                                    <div key={stepIndex} className="mb-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="font-bold text-purple-600">Step {step.stepNumber}</span>
                                            {problem.steps.length > 1 && (
                                                <button
                                                    onClick={() => removeStep(problemIndex, stepIndex)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 gap-3">
                                            <input
                                                type="text"
                                                value={step.description}
                                                onChange={(e) => updateStep(problemIndex, stepIndex, 'description', e.target.value)}
                                                placeholder="Description: 'Convert to exact values'"
                                                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm"
                                            />
                                            <input
                                                type="text"
                                                value={step.content}
                                                onChange={(e) => updateStep(problemIndex, stepIndex, 'content', e.target.value)}
                                                placeholder="Content: 'sin(45°) = √2/2, cos(30°) = √3/2'"
                                                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm"
                                            />
                                            <input
                                                type="text"
                                                value={step.hint}
                                                onChange={(e) => updateStep(problemIndex, stepIndex, 'hint', e.target.value)}
                                                placeholder="Hint: 'Use the unit circle values'"
                                                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Explanation */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    Explanation (Optional)
                                </label>
                                <textarea
                                    value={problem.explanation}
                                    onChange={(e) => updateProblem(problemIndex, 'explanation', e.target.value)}
                                    placeholder="Detailed explanation of the problem and solution..."
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-xl"
                                    rows="3"
                                />
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Template Examples */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-6">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="text-lg font-bold text-blue-900 dark:text-blue-300 mb-2">
                                Tips for Creating Problems
                            </h3>
                            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                                <li>• Include detailed step-by-step solutions</li>
                                <li>• Add hints for each step to guide students</li>
                                <li>• Use clear, concise language in both Hebrew and English</li>
                                <li>• Set appropriate tier (1=easiest, 7=hardest)</li>
                                <li>• Tag problems with relevant topics for easy filtering</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminProblemUploader;