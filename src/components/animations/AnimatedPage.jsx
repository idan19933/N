import React from 'react';
import { motion } from 'framer-motion';

const pageVariants = {
    initial: {
        opacity: 0,
        y: 20
    },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4,
            ease: 'easeOut'
        }
    },
    exit: {
        opacity: 0,
        y: -20,
        transition: {
            duration: 0.3
        }
    }
};

export const AnimatedPage = ({ children }) => (
    <motion.div
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
    >
        {children}
    </motion.div>
);

// Stagger Animation for Lists
export const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
};

export const fadeInUp = {
    initial: {
        opacity: 0,
        y: 20
    },
    animate: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.4
        }
    }
};

// Scale Animation
export const scaleIn = {
    initial: {
        scale: 0.9,
        opacity: 0
    },
    animate: {
        scale: 1,
        opacity: 1,
        transition: {
            duration: 0.3
        }
    }
};

// Slide Animation
export const slideIn = {
    initial: {
        x: -20,
        opacity: 0
    },
    animate: {
        x: 0,
        opacity: 1,
        transition: {
            duration: 0.4
        }
    }
};

// Bounce Animation
export const bounceIn = {
    initial: {
        scale: 0,
        opacity: 0
    },
    animate: {
        scale: 1,
        opacity: 1,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 20
        }
    }
};