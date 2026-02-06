import { motion } from 'framer-motion';
import { useFinance } from '@/contexts/FinanceContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { GoalCard } from '@/components/goals/GoalCard';
import { XPCard } from '@/components/goals/XPCard';
import { ChallengeCard } from '@/components/goals/ChallengeCard';
import { AchievementBadge } from '@/components/goals/AchievementBadge';
import { 
  Plus, Sparkles, Trophy, Shield, Plane, Car,
  Flame, Coins, Ghost, Target, Crown, Clock, Users, Egg
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface BadgeData {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  unlocked: boolean;
}

const allBadges: BadgeData[] = [
  { id: '1', name: 'First Steps', description: 'Complete onboarding', icon: Egg, unlocked: true },
  { id: '2', name: 'Week Warrior', description: '7 day streak', icon: Flame, unlocked: true },
  { id: '3', name: 'First $100', description: 'Save your first $100', icon: Coins, unlocked: false },
  { id: '4', name: 'Ghost Buster', description: 'Cancel first subscription', icon: Ghost, unlocked: false },
  { id: '5', name: 'Goal Getter', description: 'Complete your first goal', icon: Target, unlocked: false },
  { id: '6', name: 'Budget Master', description: 'Stay under budget for a month', icon: Crown, unlocked: false },
  { id: '7', name: 'Time Lord', description: 'Check time calendar 30 times', icon: Clock, unlocked: false },
  { id: '8', name: 'Social Saver', description: 'Compare with 10 Financial Twins', icon: Users, unlocked: false },
];

const challenges = [
  { id: '1', name: 'Stay under $30 today', progress: 60, xpReward: 25, active: true },
  { id: '2', name: 'No impulse purchases this week', progress: 43, xpReward: 100, active: true },
  { id: '3', name: 'Check your budget 3 days in a row', progress: 66, xpReward: 50, active: true },
];

const recentXP = [
  { action: 'Daily check-in', xp: 10, time: '2 hours ago' },
  { action: 'Stayed under budget', xp: 25, time: 'Yesterday' },
  { action: 'Completed challenge', xp: 50, time: '2 days ago' },
];

interface GoalData {
  id: string;
  name: string;
  icon: LucideIcon;
  targetAmount: number;
  savedAmount: number;
  monthlyContribution: number;
  projectedDate: string;
}

// Sample goals for demo
const demoGoals: GoalData[] = [
  { id: 'emergency', name: 'Emergency Fund', icon: Shield, targetAmount: 5000, savedAmount: 2450, monthlyContribution: 200, projectedDate: 'Aug 2026' },
  { id: 'vacation', name: 'Vacation', icon: Plane, targetAmount: 3000, savedAmount: 1200, monthlyContribution: 150, projectedDate: 'Dec 2026' },
  { id: 'car', name: 'New Car', icon: Car, targetAmount: 15000, savedAmount: 4500, monthlyContribution: 400, projectedDate: 'Mar 2028' },
];

export default function Goals() {
  const { data } = useFinance();
  const goals = data.selectedGoals.length > 0 ? data.selectedGoals.map(g => ({
    ...g,
    icon: Shield, // Default icon for user goals
    monthlyContribution: 0,
    projectedDate: ''
  })) : demoGoals;
  
  const xpForNextLevel = 500;
  const currentLevelXP = data.xp % xpForNextLevel;

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-display font-bold">Goals & Progress</h1>
          <Sparkles className="w-6 h-6" />
        </div>
        <p className="text-muted-foreground">Track your journey to financial freedom</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Goals Section - Left 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Goals */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-display font-bold">Your Goals</h2>
              <Button size="sm" className="brutal-btn-primary gap-2">
                <Plus className="w-4 h-4" />
                New Goal
              </Button>
            </div>

            <div className="space-y-4">
              {goals.map((goal, index) => (
                <GoalCard 
                  key={goal.id} 
                  goal={goal} 
                  index={index}
                  onAddFunds={() => console.log('Add funds to', goal.name)}
                  onViewDetails={() => console.log('View', goal.name)}
                />
              ))}
            </div>
          </motion.div>

          {/* Completed Goals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <h2 className="text-xl font-display font-bold mb-4">Completed</h2>
            <Card className="p-6 border-2 border-border">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-muted border-2 border-border flex items-center justify-center">
                  <Trophy className="w-8 h-8" />
                </div>
                <div>
                  <p className="font-semibold text-lg">No completed goals yet</p>
                  <p className="text-sm text-muted-foreground">Keep saving! You're making great progress!</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* XP & Achievements Section - Right column */}
        <div className="space-y-6">
          {/* XP Progress */}
          <XPCard 
            level={data.level}
            currentXP={currentLevelXP}
            xpForNextLevel={xpForNextLevel}
            streak={data.streak}
          />

          {/* Recent XP */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Card className="p-6 border-2 border-border">
              <h3 className="font-display font-bold mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {recentXP.map((item, index) => (
                  <motion.div 
                    key={index} 
                    className="flex items-center justify-between"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    <div>
                      <p className="text-sm font-medium">{item.action}</p>
                      <p className="text-xs text-muted-foreground">{item.time}</p>
                    </div>
                    <span className="text-sm font-bold bg-muted px-2 py-1 border border-border">
                      +{item.xp} XP
                    </span>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Daily Challenges */}
          <ChallengeCard challenges={challenges} />
        </div>
      </div>

      {/* Achievements Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="mt-10"
      >
        <div className="flex items-center gap-2 mb-5">
          <h2 className="text-xl font-display font-bold">Achievements</h2>
          <span className="text-sm text-muted-foreground bg-muted px-2 py-1 border border-border">
            {allBadges.filter(b => b.unlocked).length}/{allBadges.length} unlocked
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {allBadges.map((badge, index) => (
            <AchievementBadge key={badge.id} badge={badge} index={index} />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
