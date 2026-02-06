import { motion } from 'framer-motion';
import { PennyMascot, PennyMood } from './PennyMascot';

interface SpeechBubbleProps {
  message: string;
  pennyMood?: PennyMood;
  pennySize?: 'sm' | 'md' | 'lg';
  position?: 'left' | 'right' | 'top';
  showPenny?: boolean;
  className?: string;
}

export function SpeechBubble({
  message,
  pennyMood = 'default',
  pennySize = 'md',
  position = 'left',
  showPenny = true,
  className = '',
}: SpeechBubbleProps) {
  const isLeft = position === 'left';
  const isTop = position === 'top';

  return (
    <motion.div 
      className={`flex items-end gap-4 ${isLeft ? 'flex-row' : 'flex-row-reverse'} ${isTop ? 'flex-col items-center' : ''} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {showPenny && (
        <PennyMascot mood={pennyMood} size={pennySize} />
      )}
      
      <motion.div
        className={`relative bg-card rounded-2xl p-4 shadow-card border border-border max-w-md ${
          isTop ? 'mt-2' : ''
        }`}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        {/* Speech bubble tail */}
        <div
          className={`absolute w-4 h-4 bg-card border-border rotate-45 ${
            isTop 
              ? '-top-2 left-1/2 -translate-x-1/2 border-t border-l' 
              : isLeft 
                ? '-left-2 bottom-4 border-b border-l'
                : '-right-2 bottom-4 border-t border-r'
          }`}
        />
        
        <p className="text-foreground font-medium relative z-10">
          {message}
        </p>
      </motion.div>
    </motion.div>
  );
}
