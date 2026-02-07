import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, Target, ArrowRight, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useFinance } from '@/contexts/FinanceContext';

export default function FutureYou() {
  const { data } = useFinance();
  const [savingsRate, setSavingsRate] = useState([20]);
  const [years, setYears] = useState([5]);

  // Calculate real values from data
  const currentSavings = (data.accounts || [])
    .filter(a => a.type === 'savings' || a.type === 'investment')
    .reduce((sum, a) => sum + a.balance, 0);
    
  const monthlyIncome = data.monthlyIncome || 0;
  
  const monthlySavings = (monthlyIncome * savingsRate[0]) / 100;
  const projectedSavings = currentSavings + (monthlySavings * 12 * years[0]);
  const investmentReturn = projectedSavings * 0.07 * years[0]; // 7% annual return
  const totalProjected = projectedSavings + investmentReturn;

  const milestones = [
    { amount: 10000, label: 'Emergency Fund', achieved: totalProjected >= 10000 },
    { amount: 25000, label: 'House Down Payment', achieved: totalProjected >= 25000 },
    { amount: 50000, label: 'Investment Portfolio', achieved: totalProjected >= 50000 },
    { amount: 100000, label: 'Financial Freedom', achieved: totalProjected >= 100000 },
  ];

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto page-enter">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-muted border-2 border-border">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">Future You</h1>
        </div>
        <p className="text-muted-foreground">See where your money habits are taking you</p>
      </div>

      {/* Projection Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="brutal-card mb-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <p className="text-sm font-bold text-muted-foreground mb-1">
              Projected in {years[0]} {years[0] === 1 ? 'year' : 'years'}
            </p>
            <p className="text-5xl md:text-6xl font-bold">
              ${totalProjected.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
            <div className="flex items-center gap-2 mt-3">
              <TrendingUp className="w-5 h-5 text-muted-foreground" />
              <span className="text-muted-foreground font-medium">
                +${(totalProjected - currentSavings).toLocaleString(undefined, { maximumFractionDigits: 0 })} growth
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted p-4 border-2 border-border">
              <p className="text-xs font-bold text-muted-foreground">Savings</p>
              <p className="text-xl font-bold">
                ${projectedSavings.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="bg-muted p-4 border-2 border-border">
              <p className="text-xs font-bold text-muted-foreground">Returns</p>
              <p className="text-xl font-bold">
                ${investmentReturn.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="brutal-card"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">Savings Rate</h3>
            <span className="text-2xl font-bold">{savingsRate[0]}%</span>
          </div>
          <Slider
            value={savingsRate}
            onValueChange={setSavingsRate}
            max={50}
            min={5}
            step={1}
            className="mb-2"
          />
          <p className="text-sm text-muted-foreground">
            ${monthlySavings.toLocaleString()}/month from ${monthlyIncome.toLocaleString()} income
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="brutal-card"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">Time Horizon</h3>
            <span className="text-2xl font-bold">{years[0]} {years[0] === 1 ? 'year' : 'years'}</span>
          </div>
          <Slider
            value={years}
            onValueChange={setYears}
            max={30}
            min={1}
            step={1}
            className="mb-2"
          />
          <p className="text-sm text-muted-foreground">
            {years[0] * 12} months of consistent saving
          </p>
        </motion.div>
      </div>

      {/* Milestones */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="brutal-card"
      >
        <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
          <Target className="w-5 h-5" />
          Milestones You'll Hit
        </h3>
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute left-[22px] top-0 bottom-0 w-1 bg-muted border border-border" />
          
          <div className="space-y-6">
            {milestones.map((milestone, index) => (
              <motion.div
                key={milestone.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex items-center gap-4 relative"
              >
                <div className={`w-11 h-11 border-2 border-border flex items-center justify-center z-10 ${
                  milestone.achieved ? 'bg-foreground' : 'bg-muted'
                }`}>
                  {milestone.achieved ? (
                    <Zap className="w-5 h-5 text-background" />
                  ) : (
                    <span className="text-muted-foreground font-bold">{index + 1}</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-bold">{milestone.label}</p>
                  <p className="text-sm text-muted-foreground">
                    ${milestone.amount.toLocaleString()}
                  </p>
                </div>
                {milestone.achieved && (
                  <span className="text-xs font-bold px-3 py-1 bg-foreground text-background border-2 border-border">
                    UNLOCKED
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-8 brutal-card"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg">Ready to boost your savings?</h3>
            <p className="text-muted-foreground">
              Penny can help you find hidden savings opportunities
            </p>
          </div>
          <Button className="brutal-btn-primary gap-2">
            Get Personalized Tips
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
