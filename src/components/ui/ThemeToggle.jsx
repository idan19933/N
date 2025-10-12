import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle = () => {
    const { isDark, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            aria-label="Toggle dark mode"
        >
            {isDark ? (
                <Sun size={20} className="text-yellow-400" />
            ) : (
                <Moon size={20} className="text-gray-700 dark:text-gray-300" />
            )}
        </button>
    );
};

export default ThemeToggle;