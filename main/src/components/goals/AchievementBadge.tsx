import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Lock } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  unlocked: boolean;
}

interface AchievementBadgeProps {
  badge: Badge;
  index: number;
}

export function AchievementBadge({ badge, index }: AchievementBadgeProps) {
  const IconComponent = badge.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        delay: 0.6 + index * 0.05,
        duration: 0.4,
        ease: [0.34, 1.56, 0.64, 1]
      }}
      whileHover={badge.unlocked ? { scale: 1.1, y: -4 } : undefined}
      className={`relative ${!badge.unlocked && 'opacity-50'}`}
    >
      <Card 
        className={`p-4 text-center transition-all duration-300 ${
          badge.unlocked 
            ? 'bg-gradient-to-br from-accent to-card hover:shadow-glow cursor-pointer' 
            : 'bg-muted/50'
        }`}
      >
        <div className="flex items-center justify-center mb-2">
          {badge.unlocked ? (
            <IconComponent className="w-8 h-8" />
          ) : (
            <Lock className="w-6 h-6 text-muted-foreground" />
          )}
        </div>
        <p className="text-xs font-semibold truncate">{badge.name}</p>
      </Card>
      
      {!badge.unlocked && (
        <motion.div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 + index * 0.05 }}
        >
          <div className="w-8 h-8 rounded-full bg-muted-foreground/20 backdrop-blur-sm flex items-center justify-center">
            <Lock className="w-4 h-4 text-muted-foreground" />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
