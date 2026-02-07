import { motion } from 'framer-motion';
import { useFinance } from '@/contexts/FinanceContext';
import { Card } from '@/components/ui/card';
import { 
  TrendingUp, Search, Bell, Flame, Plus, MoreVertical,
  CheckCircle, AlertTriangle, Lightbulb, Clock
} from 'lucide-react';
import { PennyMascot } from '@/components/PennyMascot';
import { useState } from 'react';
import pennyScroll from '@/assets/penny-scroll.png';

export default function Dashboard() {
  const { data } = useFinance();
  const [timeRange, setTimeRange] = useState<'1M' | '6M' | '1Y'>('6M');
  
  const accounts = data.accounts || [];
  const transactions = data.transactions || [];
  const expenses = data.expenses || [];

  const netWorth = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const netWorthChange = 2.4; // Placeholder or calculate if history available
  
  const totalSpent = transactions
    .filter(t => t.amount < 0 && new Date(t.date).getUTCMonth() === new Date().getUTCMonth())
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const monthlyBudget = data.monthlyIncome || 4500;
  const hourlyRate = data.calculatedHourlyRate || 27.88;
  const hoursOfWork = Math.round(totalSpent / (hourlyRate || 1));

  const userName = data.fullName || (data.email ? data.email.split('@')[0] : 'User');

  // Recent transactions
  const recentTransactions = transactions.slice(0, 5).map(t => ({
      ...t,
      categoryColor: 'bg-gray-500', // Default or map category to color
      initial: t.merchant.substring(0, 2).toUpperCase()
  }));

  // Upcoming bills (simulated from fixed expenses)
  const upcomingBills = expenses.filter(e => e.isFixed).slice(0, 3).map((e, i) => ({
      id: e.id,
      month: new Date().toLocaleString('default', { month: 'short' }).toUpperCase(),
      day: (28 + i).toString(), // Fake day
      name: e.name,
      amount: e.amount,
      status: 'Autopay: On',
      statusType: 'scheduled'
  }));

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-8"
      >
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input 
            type="text"
            placeholder="Search accounts, insights, or bills..."
            className="w-full pl-10 pr-4 py-2.5 bg-card border-2 border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Level indicator */}
        <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
          <span>LEVEL {data.level}</span>
          <div className="w-24 h-2 bg-muted border border-border">
            <div className="h-full bg-primary" style={{ width: `${(data.xp % 500) / 5}%` }} />
          </div>
          <span>{500 - (data.xp % 500)} XP LEFT</span>
        </div>

        {/* Streak */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary text-secondary-foreground font-semibold text-sm">
          <Flame className="w-4 h-4" />
          <span>{data.streak} Day Streak</span>
        </div>

        {/* Notifications */}
        <button className="w-10 h-10 border-2 border-border bg-card flex items-center justify-center hover:bg-muted transition-colors">
          <Bell className="w-5 h-5" />
        </button>

        {/* Penny Avatar */}
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary bg-card flex items-center justify-center">
          <PennyMascot size="sm" animate={false} className="w-8 h-8" />
        </div>
      </motion.div>

      {/* Net Worth Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Current Net Worth</p>
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold">${netWorth.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h1>
              <div className="flex items-center gap-1 text-green-500">
                <TrendingUp className="w-4 h-4" />
                <span className="font-medium">{netWorthChange}%</span>
              </div>
            </div>
          </div>
          
          {/* Time range toggles */}
          <div className="flex gap-1">
            {(['1M', '6M', '1Y'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 text-sm font-medium border-2 transition-colors ${
                  timeRange === range 
                    ? 'bg-primary text-primary-foreground border-border' 
                    : 'bg-card border-border hover:bg-muted'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Account Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {accounts.map((account) => (
            <Card key={account.id} className="p-4 border-2 border-border">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 ${account.color} flex items-center justify-center text-white font-bold`}>
                  {account.initial}
                </div>
                <button className="text-muted-foreground hover:text-foreground">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-muted-foreground">{account.name}</p>
              <p className="text-xl font-bold">${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            </Card>
          ))}
          
          {/* Link Account Card */}
          <Card className="p-4 border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground cursor-pointer transition-colors">
            <Plus className="w-8 h-8 mb-2" />
            <span className="text-sm font-medium">Link Account</span>
          </Card>
        </div>
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Penny's Daily Briefing - Takes 2 columns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="p-6 border-2 border-border relative overflow-hidden">
            <div className="flex items-start gap-4 mb-6">
              <img
                src={pennyScroll}
                alt="Penny"
                className="w-16 h-16 object-contain drop-shadow-xl"
              />
              <div>
                <h2 className="text-xl font-bold">Penny's Daily Briefing</h2>
                <p className="text-muted-foreground">Good morning, {userName}. You're doing great!</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Under Budget Alert */}
              <div className="flex items-start gap-3 p-3 bg-muted/50 border border-border">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">Under Budget Alert</p>
                  <p className="text-sm text-muted-foreground">
                    You're currently <span className="text-green-500 font-medium">$142 under budget</span> for groceries this week. Keep it up!
                  </p>
                </div>
              </div>

              {/* Price Alert */}
              <div className="flex items-start gap-3 p-3 bg-muted/50 border border-border">
                <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">Price Alert: Netflix</p>
                  <p className="text-sm text-muted-foreground">
                    Heads up: Your Netflix subscription increased from $15.49 to <span className="font-medium">$17.99</span> this month.
                  </p>
                </div>
              </div>

              {/* Optimization Opportunity */}
              <div className="flex items-start gap-3 p-3 bg-muted/50 border border-border">
                <Lightbulb className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">Optimization Opportunity</p>
                  <p className="text-sm text-muted-foreground">
                    Switching to a HYSA could earn you an extra <span className="text-green-500 font-medium">$42.50</span> in interest based on your current cash balance.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Spending Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-6 border-2 border-border h-full">
            <h2 className="text-lg font-bold mb-4 text-center">Spending Summary</h2>
            
            {/* Donut Chart Placeholder */}
            <div className="relative w-48 h-48 mx-auto mb-4">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="12"
                  className="text-muted"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="12"
                  strokeDasharray={`${(totalSpent / monthlyBudget) * 251.2} 251.2`}
                  className="text-primary"
                  strokeLinecap="butt"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">${totalSpent.toLocaleString()}</span>
                <span className="text-sm text-muted-foreground">of ${monthlyBudget.toLocaleString()} budget</span>
              </div>
            </div>

            <div className="border-t-2 border-border pt-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                <span>Time-Cost Perspective</span>
                <Clock className="w-4 h-4" />
              </div>
              <p className="text-2xl font-bold text-center">{hoursOfWork} Hours of Work</p>
              <p className="text-xs text-muted-foreground text-center uppercase tracking-wide">Equivalent Value</p>
            </div>
          </Card>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card className="p-6 border-2 border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Recent Transactions</h2>
              <button className="text-sm font-medium text-primary hover:underline">View All</button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-muted-foreground border-b border-border">
                    <th className="pb-3 font-medium">DATE</th>
                    <th className="pb-3 font-medium">MERCHANT</th>
                    <th className="pb-3 font-medium">CATEGORY</th>
                    <th className="pb-3 font-medium text-right">AMOUNT</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-border last:border-0">
                      <td className="py-4 text-muted-foreground">
                        {tx.date instanceof Date ? tx.date.toLocaleDateString() : tx.date}
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-muted border border-border flex items-center justify-center text-xs font-bold">
                            {tx.initial}
                          </div>
                          <span className="font-medium">{tx.merchant}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className={`px-2 py-1 text-xs font-medium ${tx.categoryColor} text-white`}>
                          {tx.category}
                        </span>
                      </td>
                      <td className={`py-4 text-right font-medium ${tx.amount > 0 ? 'text-green-500' : ''}`}>
                        {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </motion.div>

        {/* Upcoming Bills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6 border-2 border-border h-full">
            <h2 className="text-lg font-bold mb-4">Upcoming Bills</h2>
            
            <div className="space-y-4">
              {upcomingBills.map((bill) => (
                <div key={bill.id} className="flex items-center gap-3">
                  <div className="w-12 text-center border-2 border-border p-1">
                    <p className="text-xs text-muted-foreground">{bill.month}</p>
                    <p className="text-lg font-bold">{bill.day}</p>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{bill.name}</p>
                    <p className="text-xs text-muted-foreground">{bill.status}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${bill.amount.toFixed(2)}</p>
                    <span className={`text-xs font-medium ${
                      bill.statusType === 'scheduled' ? 'text-green-500' : 'text-amber-500'
                    }`}>
                      {bill.statusType === 'scheduled' ? 'SCHEDULED' : 'PAY NOW'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-4 py-2.5 border-2 border-primary text-primary font-medium hover:bg-primary hover:text-primary-foreground transition-colors">
              Manage All Bills
            </button>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
