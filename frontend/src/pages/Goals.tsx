import { motion } from 'framer-motion';
import { useState } from 'react';
import { useFinance } from '@/contexts/FinanceContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { GoalCard } from '@/components/goals/GoalCard';
import { XPCard } from '@/components/goals/XPCard';
import { ChallengeCard } from '@/components/goals/ChallengeCard';
import { AchievementBadge } from '@/components/goals/AchievementBadge';
import { 
  Plus, Sparkles, Trophy, Shield, Plane, Car,
  Flame, Coins, Ghost, Target, Crown, Clock, Users, Egg, CreditCard, Home, GraduationCap, Star
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { toast } from 'sonner';
import * as api from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';

interface BadgeData {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  unlocked: boolean;
}

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

const goalOptions = [
  { id: 'emergency', name: 'Emergency Fund', icon: Shield, description: "For life's surprises" },
  { id: 'vacation', name: 'Vacation', icon: Plane, description: 'You deserve a break' },
  { id: 'debt', name: 'Pay Off Debt', icon: CreditCard, description: 'Freedom from payments' },
  { id: 'car', name: 'New Car', icon: Car, description: 'Upgrade your ride' },
  { id: 'house', name: 'House Down Payment', icon: Home, description: 'Plant your roots' },
  { id: 'education', name: 'Education', icon: GraduationCap, description: 'Invest in yourself' },
  { id: 'custom', name: 'Custom Goal', icon: Star, description: 'Something else' },
];

export default function Goals() {
  const { data } = useFinance();
  const queryClient = useQueryClient();
  const [newGoalOpen, setNewGoalOpen] = useState(false);
  const [addFundsOpen, setAddFundsOpen] = useState<string | null>(null);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalAmount, setNewGoalAmount] = useState('');
  const [newGoalType, setNewGoalType] = useState('custom');
  const [addFundsAmount, setAddFundsAmount] = useState('');
  
  const goals = data.selectedGoals.map(g => ({
    ...g,
    monthlyContribution: 0,
    projectedDate: 'TBD'
  }));
  
  const xpForNextLevel = 500;
  const currentLevelXP = data.xp % xpForNextLevel;

  const badges: BadgeData[] = data.achievements.map(a => ({
      id: a.id,
      name: a.name,
      description: a.description,
      icon: a.icon,
      unlocked: !!a.unlockedAt
  }));

  const handleCreateGoal = async () => {
    if (!newGoalAmount || parseFloat(newGoalAmount) <= 0) {
      toast.error('Please enter a valid target amount');
      return;
    }

    try {
      const selectedOption = goalOptions.find(o => o.id === newGoalType);
      const goalName = newGoalName.trim() || selectedOption?.name || 'Custom Goal';
      
      await api.createGoal({
        name: goalName,
        description: selectedOption?.description || 'Custom goal',
        target_amount: Math.round(parseFloat(newGoalAmount) * 100) / 100, // Round to 2 decimal places
        icon: selectedOption?.id || 'custom',
      });
      
      await queryClient.invalidateQueries({ queryKey: ['goals'] });
      await queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success('Goal created successfully!');
      setNewGoalOpen(false);
      setNewGoalName('');
      setNewGoalAmount('');
      setNewGoalType('custom');
    } catch (error) {
      toast.error('Failed to create goal');
      console.error(error);
    }
  };

  const handleAddFunds = async (goalId: string) => {
    if (!addFundsAmount || parseFloat(addFundsAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) {
        toast.error('Goal not found');
        return;
      }

      const amountToAdd = Math.round(parseFloat(addFundsAmount) * 100) / 100; // Round to 2 decimal places
      const newSavedAmount = Math.round((goal.savedAmount + amountToAdd) * 100) / 100; // Round to 2 decimal places
      
      await api.updateGoal(goalId, {
        saved_amount: newSavedAmount,
      });
      
      await queryClient.invalidateQueries({ queryKey: ['goals'] });
      await queryClient.invalidateQueries({ queryKey: ['user'] });
      toast.success(`Added $${amountToAdd.toFixed(2)} to ${goal.name}`);
      setAddFundsOpen(null);
      setAddFundsAmount('');
    } catch (error) {
      toast.error('Failed to add funds');
      console.error(error);
    }
  };

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
              <Dialog open={newGoalOpen} onOpenChange={setNewGoalOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="brutal-btn-primary gap-2">
                    <Plus className="w-4 h-4" />
                    New Goal
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Goal</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Goal Type</Label>
                      <select
                        value={newGoalType}
                        onChange={(e) => setNewGoalType(e.target.value)}
                        className="w-full mt-1 px-3 py-2 border-2 border-border rounded-lg bg-card"
                      >
                        {goalOptions.map(option => (
                          <option key={option.id} value={option.id}>{option.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label>Goal Name</Label>
                      <Input
                        value={newGoalName}
                        onChange={(e) => setNewGoalName(e.target.value)}
                        placeholder="e.g., Emergency Fund"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Target Amount</Label>
                      <Input
                        type="number"
                        value={newGoalAmount}
                        onChange={(e) => setNewGoalAmount(e.target.value)}
                        placeholder="5000"
                        className="mt-1"
                      />
                    </div>
                    <Button onClick={handleCreateGoal} className="w-full">
                      Create Goal
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-4">
              {goals.map((goal, index) => (
                <div key={goal.id}>
                  <GoalCard 
                    goal={goal} 
                    index={index}
                    onAddFunds={() => setAddFundsOpen(goal.id)}
                    onViewDetails={() => console.log('View', goal.name)}
                  />
                  <Dialog open={addFundsOpen === goal.id} onOpenChange={(open) => !open && setAddFundsOpen(null)}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Funds to {goal.name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Amount to Add</Label>
                          <Input
                            type="number"
                            value={addFundsAmount}
                            onChange={(e) => setAddFundsAmount(e.target.value)}
                            placeholder="0.00"
                            className="mt-1"
                          />
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Current: ${goal.savedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / ${goal.targetAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <Button onClick={() => handleAddFunds(goal.id)} className="w-full">
                          Add Funds
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
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
            {badges.filter(b => b.unlocked).length}/{badges.length} unlocked
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {badges.map((badge, index) => (
            <AchievementBadge key={badge.id} badge={badge} index={index} />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
