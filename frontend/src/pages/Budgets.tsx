import { motion } from 'framer-motion';
import { 
  TrendingUp, AlertTriangle, Check,
  Utensils, Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFinance } from '@/contexts/FinanceContext';

interface Budget {
  id: string;
  name: string;
  icon: any;
  allocated: number;
  spent: number;
  color: string;
}

export default function Budgets() {
  const { data } = useFinance();
  
  // Calculate budgets based on expenses (allocation) and transactions (spending)
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const spendingByCategory: Record<string, number> = {};
  data.transactions.forEach(t => {
      const d = new Date(t.date);
      if (d.getUTCMonth() === currentMonth && d.getUTCFullYear() === currentYear && t.type === 'expense') {
          const currentTotal = spendingByCategory[t.category] || 0;
          spendingByCategory[t.category] = Math.round((currentTotal + Math.abs(t.amount)) * 100) / 100; // Round to 2 decimal places
      }
  });

  const budgets: Budget[] = data.expenses
      .map(e => ({
          id: e.id,
          name: e.name,
          icon: e.icon || Utensils,
          allocated: Math.round(e.amount * 100) / 100, // Round to 2 decimal places
          spent: Math.round((spendingByCategory[e.category] || 0) * 100) / 100, // Round to 2 decimal places
          color: 'bg-primary'
      }))
      .filter(b => b.spent > 0); // Only show budgets with spending

  const totalAllocated = Math.round(budgets.reduce((sum, b) => sum + b.allocated, 0) * 100) / 100;
  const totalSpent = Math.round(budgets.reduce((sum, b) => sum + b.spent, 0) * 100) / 100;
  const remaining = Math.round((totalAllocated - totalSpent) * 100) / 100;

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
          <p className="text-3xl font-bold">${totalAllocated.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="text-xs text-muted-foreground mt-2">This month</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="brutal-card"
        >
          <p className="text-sm font-medium text-muted-foreground mb-1">Spent</p>
          <p className="text-3xl font-bold">${totalSpent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <div className="flex items-center gap-1 mt-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs text-muted-foreground">
              {totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0}% of budget
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
            {remaining < 0 ? '-' : ''}${Math.abs(remaining).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
          const percentage = budget.allocated > 0 ? Math.min(Math.round((budget.spent / budget.allocated) * 100 * 100) / 100, 100) : 0;
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
                    <h3 className={`font-bold ${isOverBudget ? 'text-destructive' : ''}`}>{budget.name}</h3>
                    <p className={`text-sm ${isOverBudget ? 'text-destructive' : 'text-muted-foreground'}`}>
                      ${budget.spent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} of ${budget.allocated.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${isOverBudget ? 'text-destructive' : ''}`}>
                    {isOverBudget ? '-' : ''}${Math.abs(Math.round((budget.allocated - budget.spent) * 100) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className={`text-xs ${isOverBudget ? 'text-destructive' : 'text-muted-foreground'}`}>
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
                    className={`h-full ${isOverBudget ? 'bg-red-500' : 'bg-green-500'}`}
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
