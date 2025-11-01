import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Award, Target } from 'lucide-react';

const AdaptiveDifficultyDisplay = ({
                                       currentDifficulty,
                                       recommendation,
                                       performance,
                                       questionsAnswered,
                                       adjustmentHistory,
                                       difficultyEmoji,
                                       difficultyLabel,
                                       difficultyColor,
                                       compact = false,
                                       showDetails = false
                                   }) => {
    if (!currentDifficulty) return null;

    // Compact mode - just badge
    if (compact) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 bg-white rounded-xl px-4 py-2 shadow-lg border-2"
                style={{ borderColor: difficultyColor }}
            >
                <span className="text-2xl">{difficultyEmoji}</span>
                <div>
                    <div className="text-sm text-gray-600">רמת קושי</div>
                    <div className="font-bold text-gray-800">{difficultyLabel}</div>
                </div>
                {questionsAnswered > 0 && (
                    <div className="mr-3 pr-3 border-r-2 border-gray-200">
                        <div className="text-xs text-gray-500">שאלות</div>
                        <div className="font-bold text-blue-600">{questionsAnswered}</div>
                    </div>
                )}
            </motion.div>
        );
    }

    // Full mode - detailed view
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 shadow-xl border-2 border-blue-200"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Target className="w-8 h-8 text-blue-600" />
                    <div>
                        <h3 className="text-xl font-black text-gray-800">קושי אדפטיבי</h3>
                        <p className="text-sm text-gray-600">מתאים אישית לביצועיך</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-3xl mb-1">{difficultyEmoji}</div>
                    <div className="font-bold text-gray-800">{difficultyLabel}</div>
                </div>
            </div>

            {/* Stats */}
            {performance && (
                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-white rounded-xl p-3 text-center">
                        <div className="text-2xl font-black text-green-600">
                            {performance.recentAccuracy}%
                        </div>
                        <div className="text-xs text-gray-600">דיוק אחרון</div>
                    </div>
                    <div className="bg-white rounded-xl p-3 text-center">
                        <div className="text-2xl font-black text-blue-600">
                            {questionsAnswered}
                        </div>
                        <div className="text-xs text-gray-600">שאלות</div>
                    </div>
                    <div className="bg-white rounded-xl p-3 text-center">
                        <div className="text-2xl font-black text-purple-600">
                            {performance.currentStreak}
                        </div>
                        <div className="text-xs text-gray-600">רצף</div>
                    </div>
                </div>
            )}

            {/* Recommendation */}
            {recommendation && (
                <div className="bg-white rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Award className="w-5 h-5 text-amber-500" />
                        <span className="font-bold text-gray-800">המלצה</span>
                    </div>
                    <p className="text-gray-700">{recommendation.message}</p>
                </div>
            )}

            {/* Adjustment History */}
            {showDetails && adjustmentHistory && adjustmentHistory.length > 0 && (
                <div className="bg-white rounded-xl p-4">
                    <div className="font-bold text-gray-800 mb-3">היסטוריית שינויים</div>
                    <div className="space-y-2">
                        {adjustmentHistory.slice(-3).map((adj, idx) => (
                            <div key={idx} className="flex items-center gap-3 text-sm">
                                {adj.to > adj.from ? (
                                    <TrendingUp className="w-4 h-4 text-green-500" />
                                ) : adj.to < adj.from ? (
                                    <TrendingDown className="w-4 h-4 text-red-500" />
                                ) : (
                                    <Minus className="w-4 h-4 text-gray-400" />
                                )}
                                <span className="text-gray-700">
                                    {adj.from} → {adj.to}
                                </span>
                                <span className="text-xs text-gray-500">
                                    אחרי {adj.questionsAnswered} שאלות
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default AdaptiveDifficultyDisplay;