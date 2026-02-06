import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, TrendingUp, AlertTriangle, Check,
  Utensils, Car, Gamepad2, ShoppingBag, Zap, Heart
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface Budget {
  id: string;
  name: string;
  icon: LucideIcon;
  allocated: number;
  spent: number;
  color: string;
}

const mockBudgets: Budget[] = [
  { id: '1', name: 'Food & Dining', icon: Utensils, allocated: 600, spent: 423, color: 'bg-orange-500' },
  { id: '2', name: 'Transportation', icon: Car, allocated: 300, spent: 287, color: 'bg-blue-500' },
  { id: '3', name: 'Entertainment', icon: Gamepad2, allocated: 200, spent: 156, color: 'bg-purple-500' },
  { id: '4', name: 'Shopping', icon: ShoppingBag, allocated: 400, spent: 512, color: 'bg-pink-500' },
  { id: '5', name: 'Utilities', icon: Zap, allocated: 250, spent: 198, color: 'bg-yellow-500' },
  { id: '6', name: 'Health', icon: Heart, allocated: 150, spent: 45, color: 'bg-green-500' },
];

export default function Budgets() {
  const [budgets] = useState<Budget[]>(mockBudgets);

  const totalAllocated = budgets.reduce((sum, b) => sum + b.allocated, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const remaining = totalAllocated - totalSpent;

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto page-enter">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Budgets</h1>
          <p className="text-muted-foreground mt-1">Track your spending limits</p>
        </div>
        <Button className="brutal-btn-primary gap-2">
          <Plus className="w-5 h-5" />
          New Budget
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="brutal-card"
        >
          <p className="text-sm font-medium text-muted-foreground mb-1">Total Budget</p>
          <p className="text-3xl font-bold">${totalAllocated.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-2">This month</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="brutal-card"
        >
          <p className="text-sm font-medium text-muted-foreground mb-1">Spent</p>
          <p className="text-3xl font-bold">${totalSpent.toLocaleString()}</p>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs text-muted-foreground">
              {Math.round((totalSpent / totalAllocated) * 100)}% of budget
            </span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="brutal-card"
        >
          <p className="text-sm font-medium text-muted-foreground mb-1">Remaining</p>
          <p className={`text-3xl font-bold ${remaining < 0 ? 'text-destructive' : ''}`}>
            {remaining < 0 ? '-' : ''}${Math.abs(remaining).toLocaleString()}
          </p>
          <div className="flex items-center gap-1 mt-2">
            {remaining >= 0 ? (
              <>
                <Check className="w-4 h-4" />
                <span className="text-xs text-muted-foreground">On track</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4" />
                <span className="text-xs text-muted-foreground">Over budget</span>
              </>
            )}
          </div>
        </motion.div>
      </div>

      {/* Budget List */}
      <div className="space-y-4">
        {budgets.map((budget, index) => {
          const percentage = Math.min((budget.spent / budget.allocated) * 100, 100);
          const isOverBudget = budget.spent > budget.allocated;
          const IconComponent = budget.icon;

          return (
            <motion.div
              key={budget.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="brutal-card interactive-card cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-muted border-2 border-border flex items-center justify-center">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold">{budget.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      ${budget.spent} of ${budget.allocated}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${isOverBudget ? 'text-destructive' : ''}`}>
                    {isOverBudget ? '-' : ''}${Math.abs(budget.allocated - budget.spent)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isOverBudget ? 'over' : 'left'}
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="h-4 bg-muted border-2 border-border overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, delay: index * 0.05 }}
                    className={`h-full ${isOverBudget ? 'bg-red-500' : budget.color}`}
                  />
                </div>
                {isOverBudget && (
                  <div className="absolute right-0 -top-1">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
