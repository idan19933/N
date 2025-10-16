// src/components/math/MathKeyboard.jsx - COMPLETE
import React from 'react';
import { motion } from 'framer-motion';

const MathKeyboard = ({ onInput, onClear, onSubmit }) => {
    const buttons = [
        ['7', '8', '9', '÷', '(', ')'],
        ['4', '5', '6', '×', 'x', '/'],
        ['1', '2', '3', '-', '+', '='],
        ['0', '.', ' ', '←', 'CLR', '✓']
    ];

    const handleClick = (value) => {
        if (value === '←') {
            onClear();
        } else if (value === 'CLR') {
            onInput('CLEAR_ALL');
        } else if (value === '✓') {
            onSubmit();
        } else {
            onInput(value);
        }
    };

    return (
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="grid grid-cols-6 gap-2">
                {buttons.flat().map((btn, idx) => (
                    <motion.button
                        key={idx}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleClick(btn)}
                        className={`py-3 px-2 rounded-lg font-semibold text-lg transition-colors ${
                            btn === '✓'
                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                : btn === '←' || btn === 'CLR'
                                    ? 'bg-red-600 hover:bg-red-700 text-white text-sm'
                                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                        }`}
                    >
                        {btn}
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

export default MathKeyboard;