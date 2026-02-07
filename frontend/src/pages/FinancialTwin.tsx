import { useState } from 'react';
import { motion } from 'framer-motion';
import { useFinance } from '@/contexts/FinanceContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, TrendingUp, TrendingDown, 
  ArrowRight, Trophy, Target, Lightbulb,
  User, MapPin, Home, Pizza, Car, Clapperboard, ShoppingBag, RefreshCw, Medal, Award
} from 'lucide-react';
import { PennyMascot } from '@/components/PennyMascot';

// Mock "Financial Twin" data based on similar demographics
const generateTwinData = (
  userData: { age?: number; city?: string; householdSize?: number; fullName?: string },
  expenses: Record<string, number>
) => {
  // Helper to get expense or default
  const getExp = (cat: string, def: number) => expenses[cat] || def;

  const matchScore = userData.city && userData.age ? 92 : 65;
  const twinCount = userData.city ? 1450 : 8500;

  // In a real app, this would come from aggregated user data
  return {
    matchScore,
    twinCount,
    demographics: {
      ageRange: userData.age ? `${userData.age - 2}-${userData.age + 2}` : '25-35',
      location: userData.city || 'Similar metro area',
      householdSize: userData.householdSize || 1,
    },
    comparisons: [
      {
        category: 'Housing',
        icon: Home,
        yourAmount: getExp('Housing', 1400),
        twinAverage: 1350,
        difference: getExp('Housing', 1400) - 1350,
        percentile: 55,
      },
      {
        category: 'Food & Dining', // Matches 'Food' or 'Food & Drink'
        icon: Pizza,
        yourAmount: getExp('Food', 450),
        twinAverage: 520,
        difference: getExp('Food', 450) - 520,
        percentile: 35,
      },
      {
        category: 'Transportation',
        icon: Car,
        yourAmount: getExp('Transportation', 350),
        twinAverage: 380,
        difference: getExp('Transportation', 350) - 380,
        percentile: 42,
      },
      {
        category: 'Entertainment',
        icon: Clapperboard,
        yourAmount: getExp('Entertainment', 200),
        twinAverage: 180,
        difference: getExp('Entertainment', 200) - 180,
        percentile: 62,
      },
      {
        category: 'Shopping',
        icon: ShoppingBag,
        yourAmount: getExp('Shopping', 280),
        twinAverage: 310,
        difference: getExp('Shopping', 280) - 310,
        percentile: 38,
      },
      {
        category: 'Subscriptions',
        icon: RefreshCw,
        yourAmount: getExp('Subscriptions', 127),
        twinAverage: 145,
        difference: getExp('Subscriptions', 127) - 145,
        percentile: 40,
      },
    ],
    insights: [
      {
        type: 'positive',
        title: 'Food Champion',
        description: 'You spend 13% less on food than your Financial Twins!',
        savings: '$70/month',
      },
      {
        type: 'opportunity',
        title: 'Entertainment Splurge',
        description: 'Your entertainment spending is higher than 62% of your Twins',
        potential: '$20/month',
      },
      {
        type: 'positive',
        title: 'Subscription Savvy',
        description: 'You\'re spending less on subscriptions than most Twins',
        savings: '$18/month',
      },
    ],
    topSavers: [
      { rank: 1, savings: '$850/mo', badge: Trophy },
      { rank: 2, savings: '$720/mo', badge: Medal },
      { rank: 3, savings: '$680/mo', badge: Award },
    ],
    yourRank: 847,
    yourSavings: '$520/mo',
  };
};

export default function FinancialTwin() {
  const { data, addXP } = useFinance();
  const [hasCompared, setHasCompared] = useState(false);
  
  // Calculate category totals
  const categoryTotals: Record<string, number> = {};
  data.expenses.forEach(e => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  const twinData = generateTwinData({
    age: data.age,
    city: data.city,
    householdSize: data.householdSize,
  }, categoryTotals);

  const handleCompare = () => {
    setHasCompared(true);
    addXP(25);
  };

  const getPercentileColor = (percentile: number) => {
    if (percentile <= 33) return 'text-success';
    if (percentile <= 66) return 'text-warning';
    return 'text-destructive';
  };

  const getPercentileLabel = (percentile: number) => {
    if (percentile <= 25) return 'Much Lower';
    if (percentile <= 40) return 'Lower';
    if (percentile <= 60) return 'Average';
    if (percentile <= 75) return 'Higher';
    return 'Much Higher';
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            Financial Twin
          </h1>
          <p className="text-muted-foreground">Compare spending with people like you</p>
        </div>
      </motion.div>

      {!hasCompared ? (
        /* Initial State - Prompt to Compare */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto text-center py-12"
        >
          <Card className="p-8 bg-gradient-to-br from-primary/10 to-secondary/10">
            <PennyMascot mood="thinking" size="lg" className="mx-auto mb-6" />
            
            <h2 className="text-2xl font-display font-bold mb-4">
              Find Your Financial Twins
            </h2>
            <p className="text-muted-foreground mb-6">
              Compare your spending habits with {twinData.twinCount.toLocaleString()} people who share similar demographics:
              ages {twinData.demographics.ageRange}, living in {twinData.demographics.location}
            </p>
            
            <div className="flex items-center justify-center gap-4 mb-8">
              <Badge variant="secondary" className="text-sm py-1 px-3 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Age {data.age || '25-30'}
              </Badge>
              <Badge variant="secondary" className="text-sm py-1 px-3 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> {data.city || 'Metro area'}
              </Badge>
              <Badge variant="secondary" className="text-sm py-1 px-3 flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5" /> {data.householdSize || 1} person
              </Badge>
            </div>
            
            <Button size="lg" onClick={handleCompare} className="group">
              Compare My Spending
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <p className="text-xs text-muted-foreground mt-4">
              +25 XP for comparing with your Twins
            </p>
          </Card>
        </motion.div>
      ) : (
        /* Comparison Results */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Match Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-3"
          >
            <Card className="p-6 bg-gradient-to-r from-primary/10 to-secondary/10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-3xl font-bold text-primary">{twinData.matchScore}%</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-display font-bold">Twin Match Score</h2>
                    <p className="text-muted-foreground">
                      Compared with {twinData.twinCount.toLocaleString()} similar users
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Your Rank</p>
                    <p className="text-2xl font-bold">#{twinData.yourRank}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Your Savings</p>
                    <p className="text-2xl font-bold text-success">{twinData.yourSavings}</p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Category Comparisons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card className="p-6">
              <h3 className="text-lg font-display font-bold mb-6">Spending Comparison</h3>
              
              <div className="space-y-6">
                {twinData.comparisons.map((comp, i) => (
                  <motion.div
                    key={comp.category}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.05 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <comp.icon className="w-5 h-5 text-primary" />
                        <span className="font-medium">{comp.category}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold">${comp.yourAmount}</p>
                          <p className="text-xs text-muted-foreground">You</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-muted-foreground">${comp.twinAverage}</p>
                          <p className="text-xs text-muted-foreground">Avg Twin</p>
                        </div>
                        <div className={`w-20 text-right ${comp.difference <= 0 ? 'text-success' : 'text-destructive'}`}>
                          <p className="font-bold">
                            {comp.difference > 0 ? '+' : ''}{comp.difference}
                          </p>
                          {comp.difference <= 0 ? (
                            <TrendingDown className="w-4 h-4 inline" />
                          ) : (
                            <TrendingUp className="w-4 h-4 inline" />
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Progress value={comp.percentile} className="flex-1 h-2" />
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getPercentileColor(comp.percentile)}`}
                      >
                        {getPercentileLabel(comp.percentile)}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Right Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Leaderboard */}
            <Card className="p-6">
              <h3 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-warning" />
                Top Savers
              </h3>
              <div className="space-y-3">
                {twinData.topSavers.map((saver) => (
                  <div key={saver.rank} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <saver.badge className="w-5 h-5 text-warning" />
                      <span className="font-medium">Rank #{saver.rank}</span>
                    </div>
                    <span className="font-bold text-success">{saver.savings}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    <span className="font-medium">You (#{twinData.yourRank})</span>
                  </div>
                  <span className="font-bold">{twinData.yourSavings}</span>
                </div>
              </div>
            </Card>

            {/* Insights */}
            <Card className="p-6 bg-gradient-to-br from-accent to-background">
              <h3 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-secondary" />
                Insights
              </h3>
              <div className="space-y-4">
                {twinData.insights.map((insight, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className={`p-3 rounded-lg ${
                      insight.type === 'positive' 
                        ? 'bg-success/10 border border-success/20' 
                        : 'bg-warning/10 border border-warning/20'
                    }`}
                  >
                    <p className="font-medium text-sm">{insight.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {insight.description}
                    </p>
                    <Badge 
                      className="mt-2" 
                      variant={insight.type === 'positive' ? 'default' : 'secondary'}
                    >
                      {insight.type === 'positive' 
                        ? `Saving ${insight.savings}` 
                        : `Potential: ${insight.potential}`
                      }
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </Card>

            {/* Penny's Take */}
            <Card className="p-6 border-2 border-primary/20">
              <div className="flex items-start gap-3">
                <PennyMascot mood="celebrating" size="sm" />
                <div>
                  <p className="font-medium text-sm">
                    "You're doing great! You spend less than your Twins in 4 out of 6 categories!"
                  </p>
                  <Badge className="mt-2" variant="secondary">
                    +25 XP earned
                  </Badge>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
}
