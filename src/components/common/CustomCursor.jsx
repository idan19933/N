import React , { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const CustomCursor = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Only show on screens larger than 1280px
        const checkScreenSize = () => {
            setIsVisible(window.innerWidth >= 1280);
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);

        const mouseMove = (e) => {
            if (window.innerWidth >= 1280) {
                setMousePosition({ x: e.clientX, y: e.clientY });
            }
        };

        window.addEventListener('mousemove', mouseMove);

        const handleMouseOver = () => setIsHovering(true);
        const handleMouseOut = () => setIsHovering(false);

        const addHoverListeners = () => {
            const hoverElements = document.querySelectorAll('button, a, .cursor-hover');
            hoverElements.forEach((el) => {
                el.addEventListener('mouseenter', handleMouseOver);
                el.addEventListener('mouseleave', handleMouseOut);
            });
        };

        addHoverListeners();

        const observer = new MutationObserver(addHoverListeners);
        observer.observe(document.body, { childList: true, subtree: true });

        return () => {
            window.removeEventListener('mousemove', mouseMove);
            window.removeEventListener('resize', checkScreenSize);
            observer.disconnect();
        };
    }, []);

    if (!isVisible) return null;

    return (
        <>
            <motion.div
                className="fixed w-4 h-4 bg-purple-600 rounded-full pointer-events-none z-[9999] mix-blend-difference"
                animate={{
                    x: mousePosition.x - 8,
                    y: mousePosition.y - 8,
                    scale: isHovering ? 2 : 1,
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 28 }}
            />

            <motion.div
                className="fixed w-10 h-10 border-2 border-purple-600 rounded-full pointer-events-none z-[9999]"
                animate={{
                    x: mousePosition.x - 20,
                    y: mousePosition.y - 20,
                    scale: isHovering ? 1.5 : 1,
                }}
                transition={{ type: 'spring', stiffness: 150, damping: 15, mass: 0.1 }}
            />
        </>
    );
};

export default CustomCursor;