import React , { useRef, useState } from 'react';

import { motion } from 'framer-motion';

const TextReveal = ({ text, className = '' }) => {
    const words = text.split(' ');

    return (
        <div className={className}>
            {words.map((word, i) => (
                <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 50, rotateX: 90 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{
                        duration: 0.5,
                        delay: i * 0.1,
                        type: 'spring',
                        stiffness: 100
                    }}
                    className="inline-block mr-2"
                >
                    {word}
                </motion.span>
            ))}
        </div>
    );
};

export default TextReveal;