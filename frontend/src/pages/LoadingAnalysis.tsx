import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import pennyWorking from '@/assets/penny-computer.png';
import { 
  BarChart3, Calculator, Coffee, FolderOpen, Sparkles, Flag,
  Pizza, Home, Car, Smartphone, Gamepad2, CreditCard
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface Phase {
  message: string;
  mood: 'analyzing' | 'thinking' | 'celebrating' | 'waving';
  duration: number;
  icon: LucideIcon;
}

const phases: Phase[] = [
  { 
    message: "Gathering your transactions...", 
    mood: 'analyzing',
    duration: 2000,
    icon: BarChart3
  },
  { 
    message: "Crunching the numbers...", 
    mood: 'thinking',
    duration: 2500,
    icon: Calculator
  },
  { 
    message: "Wow, you really like coffee...", 
    mood: 'celebrating',
    duration: 1500,
    icon: Coffee
  },
  { 
    message: "Sorting your spending...", 
    mood: 'analyzing',
    duration: 2000,
    icon: FolderOpen
  },
  { 
    message: "Found some interesting stuff!", 
    mood: 'waving',
    duration: 1500,
    icon: Sparkles
  },
  { 
    message: "Almost there...", 
    mood: 'thinking',
    duration: 1500,
    icon: Flag
  },
];

interface CategoryItem {
  icon: LucideIcon;
  label: string;
}

const categories: CategoryItem[] = [
  { icon: Pizza, label: 'Food' },
  { icon: Home, label: 'Rent' },
  { icon: Car, label: 'Transport' },
  { icon: Smartphone, label: 'Phone' },
  { icon: Gamepad2, label: 'Entertainment' },
  { icon: CreditCard, label: 'Shopping' },
];

export default function LoadingAnalysis() {
  const navigate = useNavigate();
  const [currentPhase, setCurrentPhase] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showCategories, setShowCategories] = useState(false);

  useEffect(() => {
    const totalDuration = phases.reduce((sum, p) => sum + p.duration, 0);
    let elapsed = 0;

    const interval = setInterval(() => {
      elapsed += 100;
      setProgress((elapsed / totalDuration) * 100);
    }, 100);

    let phaseTimeout: NodeJS.Timeout;
    let currentElapsed = 0;

    const advancePhase = (index: number) => {
      if (index >= phases.length) {
        clearInterval(interval);
        setTimeout(() => navigate('/breakdown'), 500);
        return;
      }

      setCurrentPhase(index);
      
      if (index === 3) {
        setShowCategories(true);
      }

      phaseTimeout = setTimeout(() => {
        advancePhase(index + 1);
      }, phases[index].duration);
    };

    advancePhase(0);

    return () => {
      clearInterval(interval);
      clearTimeout(phaseTimeout);
    };
  }, [navigate]);

  const currentPhasData = phases[currentPhase];
  const CurrentIcon = currentPhasData?.icon;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-background">
      {/* Floating numbers background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-primary/10 font-bold"
            style={{
              left: `${(i * 8) + 5}%`,
              fontSize: `${20 + (i % 4) * 10}px`,
            }}
            initial={{ y: '100vh', opacity: 0 }}
            animate={{ 
              y: '-100vh', 
              opacity: [0, 0.3, 0.3, 0],
            }}
            transition={{
              duration: 8,
              delay: i * 0.5,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            ${Math.floor(Math.random() * 900 + 100)}
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 text-center flex flex-col items-center">
        {/* Penny with animation - centered */}
        <motion.div
          className="mb-8 flex justify-center"
          animate={{
            rotate: currentPhase === 1 ? [0, -5, 5, 0] : 0,
          }}
          transition={{ duration: 0.5, repeat: currentPhase === 1 ? Infinity : 0 }}
        >
          <img 
            src={pennyWorking} 
            alt="Penny working" 
            className="w-64 h-64 object-contain drop-shadow-xl"
          />
        </motion.div>

        {/* Message */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPhase}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-display font-bold text-foreground mb-2">
              {currentPhasData?.message}
            </h2>
          </motion.div>
        </AnimatePresence>

        {/* Category icons */}
        <AnimatePresence>
          {showCategories && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap justify-center gap-3 mb-8 max-w-sm mx-auto"
            >
              {categories.map((category, index) => {
                const CategoryIcon = category.icon;
                return (
                  <motion.span
                    key={category.label}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="px-3 py-2 bg-card rounded-full text-sm font-medium shadow-card flex items-center gap-2"
                  >
                    <CategoryIcon className="w-4 h-4" />
                    {category.label}
                  </motion.span>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress bar */}
        <div className="w-64 mx-auto">
          <Progress value={progress} className="h-3" />
          <p className="text-sm text-muted-foreground mt-2">
            {Math.round(progress)}% complete
          </p>
        </div>
      </div>
    </div>
  );
}
