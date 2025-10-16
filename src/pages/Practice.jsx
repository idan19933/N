// src/pages/Practice.jsx - COMPLETE FILE
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Brain, MessageSquare, Calculator, Sparkles } from "lucide-react";
import MathTutor from "../components/ai/MathTutor.jsx";
import AIChatAssistant from "../components/ai/AIChatAssistant";
import useAuthStore from "../store/authStore";

const Practice = () => {
    const [activeTab, setActiveTab] = useState("math");
    const [currentProblem, setCurrentProblem] = useState(null);
    const user = useAuthStore((state) => state.user);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-4xl font-bold text-white mb-3 flex items-center justify-center">
                        <Sparkles className="w-10 h-10 text-yellow-400 mr-3" />
                        מרכז תרגול AI
                    </h1>
                    <p className="text-gray-300 text-lg">
                        תרגל מתמטיקה או שאל שאלות - ה-AI כאן לעזור!
                    </p>
                </motion.div>

                {/* Tab Selector */}
                <div className="flex justify-center gap-4 mb-8">
                    <button
                        onClick={() => setActiveTab("math")}
                        className={`flex items-center px-8 py-4 rounded-2xl font-bold text-lg transition-all ${
                            activeTab === "math"
                                ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl scale-105"
                                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                        }`}
                    >
                        <Calculator className="w-6 h-6 mr-2" />
                        תרגול מתמטיקה
                    </button>
                    <button
                        onClick={() => setActiveTab("chat")}
                        className={`flex items-center px-8 py-4 rounded-2xl font-bold text-lg transition-all ${
                            activeTab === "chat"
                                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xl scale-105"
                                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                        }`}
                    >
                        <MessageSquare className="w-6 h-6 mr-2" />
                        עוזר AI
                    </button>
                </div>

                {/* Content */}
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: activeTab === "math" ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {activeTab === "math" ? (
                        <MathTutor onProblemChange={setCurrentProblem} />
                    ) : (
                        <AIChatAssistant currentProblem={currentProblem} />
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default Practice;