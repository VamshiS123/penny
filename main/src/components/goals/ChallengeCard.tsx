import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Zap, Gamepad2 } from 'lucide-react';

interface Challenge {
  id: string;
  name: string;
  progress: number;
  xpReward: number;
  active: boolean;
}

interface ChallengeCardProps {
  challenges: Challenge[];
}

export function ChallengeCard({ challenges }: ChallengeCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
    >
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-5">
          <Gamepad2 className="w-6 h-6" />
          <h3 className="font-display font-bold text-lg">Active Challenges</h3>
        </div>
        
        <div className="space-y-5">
          {challenges.map((challenge, index) => (
            <motion.div 
              key={challenge.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="group"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-sm group-hover:text-primary transition-colors">
                  {challenge.name}
                </span>
                <div className="flex items-center gap-1 text-secondary">
                  <Zap className="w-3.5 h-3.5" />
                  <span className="text-sm font-bold">+{challenge.xpReward}</span>
                </div>
              </div>
              <div className="relative">
                <Progress value={challenge.progress} className="h-2.5" />
                <span className="absolute right-0 -top-5 text-xs text-muted-foreground">
                  {challenge.progress}%
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
