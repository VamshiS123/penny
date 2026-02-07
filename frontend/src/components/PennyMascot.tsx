import { motion } from 'framer-motion';
import pennyImage from '@/assets/penny.png';
export type PennyMood = 'default' | 'waving' | 'thinking' | 'celebrating' | 'concerned' | 'analyzing';

interface PennyMascotProps {
  mood?: PennyMood;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  className?: string;
  animate?: boolean;
}

const sizeClasses: Record<string, string> = {
  sm: 'w-16 h-16',
  md: 'w-24 h-24',
  lg: 'w-32 h-32',
  xl: 'w-48 h-48',
  hero: 'w-64 h-64 md:w-80 md:h-80',
};

export function PennyMascot({ 
  mood = 'default', 
  size = 'md', 
  className = '',
  animate = true 
}: PennyMascotProps) {
  // Get animation based on mood
  const getMoodAnimation = () => {
    switch (mood) {
      case 'waving':
        return { rotate: [0, 8, -5, 6, 0] };
      case 'celebrating':
        return { y: [0, -12, 0], scale: [1, 1.05, 1] };
      case 'thinking':
        return { x: [0, 3, -3, 0] };
      case 'concerned':
        return { y: [0, 2, 0] };
      case 'analyzing':
        return { scale: [1, 1.02, 1] };
      default:
        return { y: [0, -6, 0] };
    }
  };

  const getMoodTransition = () => {
    switch (mood) {
      case 'waving':
        return { duration: 0.8, repeat: 2, ease: 'easeInOut' as const };
      case 'celebrating':
        return { duration: 0.6, repeat: Infinity, ease: 'easeInOut' as const };
      default:
        return { duration: 2.5, repeat: Infinity, ease: 'easeInOut' as const };
    }
  };

  return (
    <motion.div
      className={`relative ${sizeClasses[size]} ${className}`}
      initial={animate ? { scale: 0.9, opacity: 0 } : false}
      animate={animate ? { scale: 1, opacity: 1 } : false}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <motion.img
        src={pennyImage}
        alt="Penny the penguin"
        className="w-full h-full object-contain drop-shadow-xl"
        animate={animate ? getMoodAnimation() : undefined}
        transition={animate ? getMoodTransition() : undefined}
      />
    </motion.div>
  );
}
