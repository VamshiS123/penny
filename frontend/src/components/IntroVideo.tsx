import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface IntroVideoProps {
    onComplete: () => void;
}

export const IntroVideo: React.FC<IntroVideoProps> = ({ onComplete }) => {
    const [isVisible, setIsVisible] = useState(true);

    // Fallback timeout in case video doesn't play or end event is missed
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
        }, 7500); // 7s video + buffer

        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence onExitComplete={onComplete}>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-[#F8F8F8]"
                >
                    <video
                        src="/intro.mp4"
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                        onEnded={() => setIsVisible(false)}
                        style={{ objectFit: 'cover' }}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
};
