// src/components/ai/MathRenderer.jsx - Mathematical Content Renderer
import React, { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

const MathRenderer = ({ content, className = '' }) => {
    const contentRef = useRef(null);

    useEffect(() => {
        if (!contentRef.current) return;

        // Process the content to render math
        const processedContent = processMathContent(content);
        contentRef.current.innerHTML = processedContent;

        // Render all math expressions
        const mathElements = contentRef.current.querySelectorAll('.math-inline, .math-block');
        mathElements.forEach(elem => {
            try {
                const isBlock = elem.classList.contains('math-block');
                katex.render(elem.textContent, elem, {
                    displayMode: isBlock,
                    throwOnError: false,
                    output: 'html',
                    strict: false,
                    macros: {
                        "\\RR": "\\mathbb{R}",
                        "\\NN": "\\mathbb{N}",
                        "\\ZZ": "\\mathbb{Z}",
                        "\\QQ": "\\mathbb{Q}",
                    }
                });
            } catch (e) {
                console.warn('KaTeX rendering error:', e);
                elem.innerHTML = elem.textContent;
            }
        });
    }, [content]);

    return (
        <div
            ref={contentRef}
            className={`math-renderer ${className}`}
        />
    );
};

// Process content to identify and mark mathematical expressions
function processMathContent(text) {
    let processed = text;

    // Escape HTML to prevent XSS
    processed = escapeHtml(processed);

    // Convert common mathematical notations to LaTeX
    processed = convertToLatex(processed);

    // Process block equations (on their own line)
    processed = processed.replace(
        /^([^\\n]*[=<>≤≥][^\\n]*)$/gm,
        '<div class="math-block">$1</div>'
    );

    // Process inline math expressions
    // Pattern 1: Expressions with equals sign
    processed = processed.replace(
        /([a-zA-Z0-9\u0590-\u05FF\(\)\[\]]+\s*[+\-*/=<>≤≥]\s*[^.,:;!?\s]+)/g,
        '<span class="math-inline">$1</span>'
    );

    // Pattern 2: Fractions
    processed = processed.replace(
        /(\d+\/\d+)/g,
        '<span class="math-inline">\\frac{$1}</span>'
    );

    // Pattern 3: Powers
    processed = processed.replace(
        /([a-zA-Z0-9]+)\*\*(\d+)/g,
        '<span class="math-inline">$1^{$2}</span>'
    );

    // Pattern 4: Square roots
    processed = processed.replace(
        /sqrt\(([^)]+)\)/g,
        '<span class="math-inline">\\sqrt{$1}</span>'
    );

    // Pattern 5: Common functions
    const functions = ['sin', 'cos', 'tan', 'log', 'ln', 'lim'];
    functions.forEach(func => {
        const regex = new RegExp(`\\b${func}\\s*\\(([^)]+)\\)`, 'g');
        processed = processed.replace(regex, `<span class="math-inline">\\${func}($1)</span>`);
    });

    return processed;
}

// Convert common mathematical notations to LaTeX
function convertToLatex(text) {
    let latex = text;

    // Convert ** to ^
    latex = latex.replace(/\*\*/g, '^');

    // Convert fractions a/b to \frac{a}{b}
    latex = latex.replace(/(\d+)\/(\d+)/g, '\\frac{$1}{$2}');

    // Convert >= and <= to LaTeX symbols
    latex = latex.replace(/>=/g, '\\geq');
    latex = latex.replace(/<=/g, '\\leq');

    // Convert common Greek letters
    const greekLetters = {
        'alpha': 'α', 'beta': 'β', 'gamma': 'γ', 'delta': 'δ',
        'theta': 'θ', 'lambda': 'λ', 'mu': 'μ', 'pi': 'π',
        'sigma': 'σ', 'phi': 'φ', 'omega': 'ω'
    };

    Object.entries(greekLetters).forEach(([name, symbol]) => {
        const regex = new RegExp(`\\b${name}\\b`, 'gi');
        latex = latex.replace(regex, `\\${name}`);
    });

    return latex;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Export both the component and a hook for manual math rendering
export const useMathRenderer = () => {
    const renderMath = (element) => {
        if (!element) return;

        const mathElements = element.querySelectorAll('.math-inline, .math-block');
        mathElements.forEach(elem => {
            try {
                const isBlock = elem.classList.contains('math-block');
                katex.render(elem.textContent, elem, {
                    displayMode: isBlock,
                    throwOnError: false,
                });
            } catch (e) {
                console.warn('KaTeX rendering error:', e);
            }
        });
    };

    return { renderMath };
};

export default MathRenderer;