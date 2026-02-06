import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Flame, Zap } from 'lucide-react';

interface XPCardProps {
  level: number;
  currentXP: number;
  xpForNextLevel: number;
  streak: number;
}

export function XPCard({ level, currentXP, xpForNextLevel, streak }: XPCardProps) {
  const levelProgress = (currentXP / xpForNextLevel) * 100;
  const xpRemaining = xpForNextLevel - currentXP;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
    >
      <Card className="p-6 bg-gradient-to-br from-primary/5 via-card to-secondary/5 border-primary/20">
        {/* Level Badge */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-glow">
              <Trophy className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <p className="text-2xl font-display font-bold">Level {level}</p>
              <p className="text-sm text-muted-foreground">Budgeting Pro</p>
            </div>
          </div>
          
          {/* Streak Badge */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20">
            <Flame className="w-5 h-5 text-secondary" />
            <span className="font-bold text-secondary">{streak}</span>
          </div>
        </div>

        {/* XP Progress */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-warning" />
              <span className="font-medium">{currentXP} XP</span>
            </div>
            <span className="text-muted-foreground">{xpForNextLevel} XP</span>
          </div>
          
          <div className="relative">
            <Progress value={levelProgress} className="h-4" />
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                repeatDelay: 3,
                ease: 'easeInOut'
              }}
            />
          </div>
          
          <p className="text-center text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{xpRemaining} XP</span> to Level {level + 1}
          </p>
        </div>
      </Card>
    </motion.div>
  );
}
