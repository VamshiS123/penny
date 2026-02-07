import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useFinance } from '@/contexts/FinanceContext';
import { PennyMascot } from '@/components/PennyMascot';
import { Button } from '@/components/ui/button';
import { ArrowRight, Clock } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export default function FinanceBreakdown() {
  const navigate = useNavigate();
  const { data, getTotalExpenses, getRemainingIncome, getTimeEquivalent } = useFinance();
  const [step, setStep] = useState(0);
  const [animatingExpense, setAnimatingExpense] = useState(-1);
  const [showTimeTranslation, setShowTimeTranslation] = useState(false);

  const monthlyIncome = data.monthlyIncome;
  const expenses = data.expenses;
  const totalExpenses = getTotalExpenses();
  const remaining = monthlyIncome - totalExpenses;
  const hourlyRate = data.calculatedHourlyRate;

  const expenseHours = getTimeEquivalent(totalExpenses);
  const remainingHours = getTimeEquivalent(remaining);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // Step 0: Show income (delay 1s)
    timers.push(setTimeout(() => setStep(1), 1000));

    // Step 1: Start expense animation (delay 2.5s)
    timers.push(setTimeout(() => {
      setStep(2);
      // Animate each expense one by one
      expenses.forEach((_, index) => {
        timers.push(setTimeout(() => {
          setAnimatingExpense(index);
        }, index * 600));
      });
    }, 2500));

    // Step 2: Show remaining (after all expenses)
    timers.push(setTimeout(() => {
      setStep(3);
    }, 2500 + expenses.length * 600 + 500));

    // Step 3: Show time translation
    timers.push(setTimeout(() => {
      setShowTimeTranslation(true);
      setStep(4);
    }, 2500 + expenses.length * 600 + 2000));

    return () => timers.forEach(t => clearTimeout(t));
  }, [expenses.length]);

  const getProgressWidth = () => {
    if (step < 2) return 100;
    if (monthlyIncome === 0) return 0;
    const spentSoFar = expenses
      .slice(0, animatingExpense + 1)
      .reduce((sum, e) => sum + e.amount, 0);
    return Math.max(0, ((monthlyIncome - spentSoFar) / monthlyIncome) * 100);
  };

  const getPennyMessage = () => {
    if (step === 1) return "Let's start with the good news...";
    if (step === 2) return "Now let's see what's already claimed...";
    if (step === 3) return "And what's left...";
    if (step === 4) return "But let me show you what this really means...";
    return "Here's my promise: I'll help you make every hour count.";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 px-4 py-8">
      <div className="max-w-lg mx-auto">
        {/* Penny with message */}
        <motion.div
          className="flex items-start gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="shrink-0">
            <PennyMascot 
              mood={step >= 4 ? 'celebrating' : step >= 2 ? 'analyzing' : 'waving'} 
              size="md" 
            />
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="relative flex-1"
            >
              {/* Speech bubble */}
              <div className="bg-card rounded-2xl p-4 shadow-lg border-2 border-border relative ml-2">
                {/* Triangle pointer */}
                <div className="absolute left-0 top-4 -translate-x-full">
                  <div className="w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-border" />
                  <div className="absolute top-[2px] left-[2px] w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[6px] border-r-card" />
                </div>
                <p className="font-medium text-foreground">{getPennyMessage()}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Monthly Income */}
        <AnimatePresence>
          {step >= 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl p-6 shadow-lg border-2 border-border mb-6"
            >
              <p className="text-muted-foreground mb-2">Monthly Income</p>
              <motion.p
                className="text-4xl font-bold text-green-600 font-display"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                ${monthlyIncome.toLocaleString()}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress bar */}
        {step >= 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6"
          >
            <div className="h-8 bg-muted rounded-full overflow-hidden relative">
              <motion.div
                className="h-full bg-gradient-to-r from-success to-primary rounded-full"
                initial={{ width: '100%' }}
                animate={{ width: `${getProgressWidth()}%` }}
                transition={{ duration: 0.5 }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-medium text-foreground">
                  ${(monthlyIncome * (getProgressWidth() / 100)).toLocaleString(undefined, { maximumFractionDigits: 0 })} remaining
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Expenses list */}
        {step >= 2 && (
          <div className="space-y-3 mb-6">
            {expenses.map((expense, index) => (
              <AnimatePresence key={expense.id}>
                {animatingExpense >= index && (
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-4 bg-card rounded-xl shadow-card"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-muted border border-border flex items-center justify-center">
                        <expense.icon className="w-5 h-5" />
                      </div>
                      <span className="font-medium">{expense.name}</span>
                    </div>
                    <motion.span
                      className="text-destructive font-bold"
                      initial={{ scale: 1.5 }}
                      animate={{ scale: 1 }}
                    >
                      -${expense.amount.toLocaleString()}
                    </motion.span>
                  </motion.div>
                )}
              </AnimatePresence>
            ))}
          </div>
        )}

        {/* Remaining amount */}
        <AnimatePresence>
          {step >= 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-primary text-primary-foreground rounded-2xl p-6 mb-6 border-2 border-primary shadow-lg"
            >
              <p className="text-primary-foreground/80 mb-2 font-medium">What's Left</p>
              <motion.p
                className="text-5xl font-bold font-display"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
              >
                ${remaining.toLocaleString()}
              </motion.p>
              <p className="text-sm text-primary-foreground/70 mt-2">
                This is your breathing room each month
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Time translation */}
        <AnimatePresence>
          {showTimeTranslation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl p-6 shadow-lg mb-6 border-2 border-secondary"
            >
              <div className="flex items-center gap-2 text-secondary mb-4">
                <Clock className="w-5 h-5" />
                <span className="font-bold text-lg">Time Translation</span>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-muted-foreground">Fixed expenses cost you</span>
                  <span className="font-bold text-lg text-foreground">{Math.round(expenseHours)} hours/month</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
                  <span className="text-muted-foreground">Your remaining time to spend</span>
                  <span className="font-bold text-lg text-primary">{Math.round(remainingHours)} hours</span>
                </div>
              </div>

              <div className="mt-4 p-4 bg-secondary/10 rounded-xl border border-secondary/30">
                <p className="text-sm text-foreground">
                  <span className="font-bold">At ${hourlyRate.toFixed(2)}/hour</span>, every purchase 
                  is a trade-off of your time.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Penny's commitment */}
        <AnimatePresence>
          {step >= 4 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-center"
            >
              <PennyMascot mood="celebrating" size="lg" className="mx-auto mb-4" />
              <h3 className="text-xl font-display font-bold mb-2">
                Here's my promise
              </h3>
              <p className="text-muted-foreground mb-6">
                I'll help you make every hour count.
              </p>

              <div className="bg-accent rounded-xl p-4 mb-6">
                <p className="text-sm text-muted-foreground">Target: Save 10%</p>
                <p className="font-bold text-lg">${Math.round(monthlyIncome * 0.1)}/month</p>
                <p className="text-sm text-muted-foreground mt-1">
                  That's about ${Math.round((monthlyIncome * 0.1) / 4)} per week in small changes
                </p>
              </div>

              <Button
                size="lg"
                className="btn-gradient-primary w-full"
                onClick={() => navigate('/dashboard')}
              >
                Let's Do This
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
