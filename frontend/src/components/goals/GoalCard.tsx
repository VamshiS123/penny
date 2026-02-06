import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CircularProgress } from './CircularProgress';
import { Plus, ChevronRight } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface Goal {
  id: string;
  name: string;
  icon: LucideIcon;
  targetAmount: number;
  savedAmount: number;
  monthlyContribution?: number;
  projectedDate?: string;
}

interface GoalCardProps {
  goal: Goal;
  index: number;
  onAddFunds?: () => void;
  onViewDetails?: () => void;
}

export function GoalCard({ goal, index, onAddFunds, onViewDetails }: GoalCardProps) {
  const percentage = Math.round((goal.savedAmount / goal.targetAmount) * 100);
  const remaining = goal.targetAmount - goal.savedAmount;
  const IconComponent = goal.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        delay: 0.1 + index * 0.1,
        duration: 0.5,
        ease: [0.34, 1.56, 0.64, 1]
      }}
    >
      <Card className="p-6 interactive-card group cursor-pointer bg-card hover:bg-accent/30">
        <div className="flex items-center gap-6">
          {/* Circular Progress */}
          <CircularProgress 
            percentage={percentage} 
            size={100} 
            strokeWidth={8}
            color={percentage >= 100 ? 'success' : 'primary'}
          >
            <div className="text-center">
              <IconComponent className="w-8 h-8" />
            </div>
          </CircularProgress>

          {/* Goal Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-display font-bold text-lg group-hover:text-primary transition-colors">
                  {goal.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {goal.projectedDate ? `Est. ${goal.projectedDate}` : 'Set a target date'}
                </p>
              </div>
              <span className="text-2xl font-bold text-primary">{percentage}%</span>
            </div>

            {/* Amount Progress */}
            <div className="flex items-baseline gap-1 mb-3">
              <span className="text-xl font-bold">${goal.savedAmount.toLocaleString()}</span>
              <span className="text-muted-foreground">/ ${goal.targetAmount.toLocaleString()}</span>
            </div>

            {/* Quick stats */}
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">
                ${remaining.toLocaleString()} to go
              </span>
              {goal.monthlyContribution && goal.monthlyContribution > 0 && (
                <span className="text-primary font-medium">
                  +${goal.monthlyContribution}/mo
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Button 
              size="sm" 
              className="btn-gradient-primary gap-2"
              onClick={(e) => {
                e.stopPropagation();
                onAddFunds?.();
              }}
            >
              <Plus className="w-4 h-4" />
              Add
            </Button>
            <Button 
              size="sm" 
              variant="ghost"
              className="text-muted-foreground"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails?.();
              }}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
