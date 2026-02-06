import { useState } from 'react';
import { motion } from 'framer-motion';
import { useFinance } from '@/contexts/FinanceContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Clock, Sparkles } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

// Generate mock transactions for a given month
const generateMockTransactions = (year: number, month: number) => {
  const transactions: Record<string, { amount: number; items: { name: string; amount: number }[] }> = {};
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;
  const maxDay = isCurrentMonth ? today.getDate() : daysInMonth;
  
  for (let day = 1; day <= maxDay; day++) {
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dailyItems: { name: string; amount: number }[] = [];
    const numTransactions = Math.floor(Math.random() * 4) + 1;
    
    const possibleItems = [
      { name: 'Coffee', range: [4, 8] },
      { name: 'Lunch', range: [12, 25] },
      { name: 'Groceries', range: [30, 80] },
      { name: 'Gas', range: [40, 70] },
      { name: 'Uber', range: [15, 35] },
      { name: 'Amazon', range: [20, 100] },
      { name: 'Dining', range: [25, 60] },
      { name: 'Subscription', range: [10, 20] },
    ];
    
    for (let i = 0; i < numTransactions; i++) {
      const item = possibleItems[Math.floor(Math.random() * possibleItems.length)];
      const amount = Math.random() * (item.range[1] - item.range[0]) + item.range[0];
      dailyItems.push({ name: item.name, amount: Math.round(amount * 100) / 100 });
    }
    
    const totalAmount = dailyItems.reduce((sum, item) => sum + item.amount, 0);
    transactions[dateKey] = {
      amount: Math.round(totalAmount * 100) / 100,
      items: dailyItems,
    };
  }
  
  return transactions;
};

// Cache for transactions by month
const transactionCache: Record<string, ReturnType<typeof generateMockTransactions>> = {};

const getTransactionsForMonth = (year: number, month: number) => {
  const key = `${year}-${month}`;
  if (!transactionCache[key]) {
    transactionCache[key] = generateMockTransactions(year, month);
  }
  return transactionCache[key];
};

type CostLevel = 'zero' | 'low' | 'medium' | 'high';

const getCostLevel = (hours: number): CostLevel => {
  if (hours === 0) return 'zero';
  if (hours < 1.5) return 'low';
  if (hours < 3) return 'medium';
  return 'high';
};

const getCostLabel = (level: CostLevel): string => {
  switch (level) {
    case 'zero': return 'Zero Spend';
    case 'low': return 'Low Cost';
    case 'medium': return 'Medium';
    case 'high': return 'High Cost';
  }
};

const getCostBorderColor = (level: CostLevel): string => {
  switch (level) {
    case 'zero': return 'border-t-muted-foreground/30';
    case 'low': return 'border-t-green-500';
    case 'medium': return 'border-t-yellow-500';
    case 'high': return 'border-t-destructive';
  }
};

const getCostTextColor = (level: CostLevel): string => {
  switch (level) {
    case 'zero': return 'text-muted-foreground';
    case 'low': return 'text-green-500';
    case 'medium': return 'text-yellow-500';
    case 'high': return 'text-destructive';
  }
};

export default function TimeCalendar() {
  const { data } = useFinance();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  const hourlyRate = data.calculatedHourlyRate || 27.88;
  
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, year, month };
  };
  
  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);
  const transactions = getTransactionsForMonth(year, month);
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  
  const getDateKey = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };
  
  const getHoursForDay = (day: number) => {
    const dateKey = getDateKey(day);
    const dayData = transactions[dateKey];
    if (!dayData) return 0;
    return dayData.amount / hourlyRate;
  };
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
    setSelectedDate(null);
  };
  
  const today = new Date();
  const isCurrentMonth = today.getMonth() === month && today.getFullYear() === year;
  
  // Calculate monthly stats
  const monthlyTotal = Object.values(transactions).reduce((sum, data) => sum + data.amount, 0);
  const monthlyHours = monthlyTotal / hourlyRate;
  const daysWithData = Object.keys(transactions).length;
  const avgDailyHours = daysWithData > 0 ? monthlyHours / daysWithData : 0;
  
  const selectedDayData = selectedDate ? transactions[selectedDate] : null;
  
  // Find highest spending day of week for insight
  const dayOfWeekTotals: number[] = [0, 0, 0, 0, 0, 0, 0];
  const dayOfWeekCounts: number[] = [0, 0, 0, 0, 0, 0, 0];
  
  Object.entries(transactions).forEach(([dateKey, data]) => {
    const date = new Date(dateKey);
    const dayOfWeek = date.getDay();
    dayOfWeekTotals[dayOfWeek] += data.amount;
    dayOfWeekCounts[dayOfWeek]++;
  });
  
  const dayOfWeekAvgs = dayOfWeekTotals.map((total, i) => 
    dayOfWeekCounts[i] > 0 ? total / dayOfWeekCounts[i] : 0
  );
  
  const highestDay = dayOfWeekAvgs.indexOf(Math.max(...dayOfWeekAvgs));
  const lowestDay = dayOfWeekAvgs.indexOf(Math.min(...dayOfWeekAvgs.filter(v => v > 0)));
  const dayNamesShort = ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays'];
  const highestAvg = dayOfWeekAvgs[highestDay] / hourlyRate;
  const lowestAvg = dayOfWeekAvgs[lowestDay] / hourlyRate;
  const ratio = lowestAvg > 0 ? (highestAvg / lowestAvg).toFixed(1) : '2.0';
  
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-display font-bold">
            {monthNames[month]} {year}
          </h1>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => navigateMonth('next')}
              disabled={isCurrentMonth}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-muted px-4 py-2 border-2 border-border">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Rate: ${hourlyRate.toFixed(2)}/hr</span>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
      >
        <Card className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total Month Cost</span>
          </div>
          <p className="text-3xl font-bold">{monthlyHours.toFixed(1)} <span className="text-lg font-normal text-muted-foreground">hrs</span></p>
          <p className="text-sm text-muted-foreground mt-1">Converted from ${monthlyTotal.toFixed(2)}</p>
        </Card>
        
        <Card className="p-5">
          <span className="text-sm text-muted-foreground">Daily Avg</span>
          <p className="text-3xl font-bold mt-2">{avgDailyHours.toFixed(1)} <span className="text-lg font-normal text-muted-foreground">hrs</span></p>
          <Progress value={(avgDailyHours / 4) * 100} className="mt-3 h-2" />
        </Card>
        
        <Card className="p-5 bg-gradient-to-br from-card to-muted/50">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-primary mb-1">Penny's Insight</h3>
              <p className="text-sm text-muted-foreground">
                {dayNamesShort[highestDay]} cost you <span className="text-destructive font-semibold">{ratio}x more</span> than {dayNamesShort[lowestDay]}. Consider shifting big purchases to mid-week.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3"
        >
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2 tracking-wider">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Empty cells for days before the first of the month */}
            {Array.from({ length: startingDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-[4/3]" />
            ))}

            {/* Days of the month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateKey = getDateKey(day);
              const hours = getHoursForDay(day);
              const dayData = transactions[dateKey];
              const isToday = isCurrentMonth && day === today.getDate();
              const isFuture = isCurrentMonth && day > today.getDate();
              const isSelected = selectedDate === dateKey;
              const costLevel = getCostLevel(hours);

              return (
                <motion.button
                  key={day}
                  whileHover={{ scale: isFuture ? 1 : 1.02 }}
                  whileTap={{ scale: isFuture ? 1 : 0.98 }}
                  onClick={() => !isFuture && dayData && setSelectedDate(dateKey)}
                  disabled={isFuture || !dayData}
                  className={`
                    aspect-[4/3] rounded-none p-3 flex flex-col items-start justify-between
                    transition-all relative border-2 border-border border-t-4
                    ${isFuture ? 'opacity-30 cursor-not-allowed bg-muted/30' : dayData ? 'cursor-pointer hover:bg-muted/50 bg-card' : 'bg-muted/30'}
                    ${isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}
                    ${isToday ? 'ring-2 ring-secondary' : ''}
                    ${dayData ? getCostBorderColor(costLevel) : 'border-t-muted'}
                  `}
                >
                  <span className={`text-sm font-bold ${isToday ? 'text-secondary' : ''}`}>
                    {day}
                  </span>
                  {!isFuture && dayData && (
                    <div className="w-full">
                      <span className={`text-xs font-medium ${getCostTextColor(costLevel)}`}>
                        {getCostLabel(costLevel)}
                      </span>
                      <p className="text-sm font-bold">
                        {hours.toFixed(1)} <span className="text-xs font-normal text-muted-foreground">hrs</span>
                      </p>
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 bg-green-500" />
              <span className="text-xs text-muted-foreground">Low Cost</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 bg-yellow-500" />
              <span className="text-xs text-muted-foreground">Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-1 bg-destructive" />
              <span className="text-xs text-muted-foreground">High Cost</span>
            </div>
          </div>
        </motion.div>

        {/* Sidebar Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          {/* Selected Day Details */}
          {selectedDayData ? (
            <Card className="p-5">
              <h3 className="text-lg font-display font-bold mb-4">
                {new Date(selectedDate!).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </h3>
              <div className="mb-4">
                <p className="text-2xl font-bold">${selectedDayData.amount.toFixed(2)}</p>
                <p className="text-primary font-medium">
                  = {(selectedDayData.amount / hourlyRate).toFixed(1)} hours of work
                </p>
              </div>
              <div className="space-y-3 border-t border-border pt-4">
                <h4 className="text-sm font-semibold text-muted-foreground">Transactions</h4>
                {selectedDayData.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-sm">{item.name}</span>
                    <div className="text-right">
                      <span className="text-sm font-medium">${item.amount.toFixed(2)}</span>
                      <p className="text-xs text-muted-foreground">
                        {(item.amount / hourlyRate).toFixed(1)}h
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <Card className="p-5 bg-gradient-to-br from-card to-muted/30">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-display font-bold mb-2">Select a Day</h3>
                  <p className="text-sm text-muted-foreground">
                    Click on any day to see the breakdown of hours worked to cover that day's spending.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Monthly Breakdown */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-muted-foreground mb-4">Cost by Day of Week</h3>
            <div className="space-y-2">
              {dayNamesShort.map((dayName, i) => {
                const avgHours = dayOfWeekAvgs[i] / hourlyRate;
                const maxHours = Math.max(...dayOfWeekAvgs) / hourlyRate;
                const percentage = maxHours > 0 ? (avgHours / maxHours) * 100 : 0;
                
                return (
                  <div key={dayName} className="flex items-center gap-2">
                    <span className="text-xs w-12 text-muted-foreground">{dayName.slice(0, 3)}</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${i === highestDay ? 'bg-destructive' : i === lowestDay ? 'bg-green-500' : 'bg-primary/50'}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium w-10 text-right">{avgHours.toFixed(1)}h</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
