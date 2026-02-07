import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface IntroVideoProps {
    onComplete: () => void;
}

export const IntroVideo: React.FC<IntroVideoProps> = ({ onComplete }) => {
    const [isVisible, setIsVisible] = useState(true);

    const handleVideoEnd = () => {
        setIsVisible(false);
        // Store video completion in sessionStorage for Landing page to check
        sessionStorage.setItem('introVideoCompleted', 'true');
    };

    // Fallback timeout in case video doesn't play or end event is missed
    useEffect(() => {
        const timer = setTimeout(() => {
            handleVideoEnd();
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
                    className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#F8F8F8]"
                >
                    <video
                        src="/intro.mp4"
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                        onEnded={handleVideoEnd}
                        style={{ objectFit: 'cover' }}
                    />
                    <button
                        onClick={handleVideoEnd}
                        className="absolute bottom-8 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors cursor-pointer"
                    >
                        Skip
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
