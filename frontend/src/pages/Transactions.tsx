import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinance, Transaction } from '@/contexts/FinanceContext';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Search, Filter, Clock, ArrowUpDown, 
  TrendingUp, TrendingDown, Calendar,
} from 'lucide-react';
import { PennyMascot } from '@/components/PennyMascot';

const categories = [
  'All',
  'Food & Drink',
  'Shopping',
  'Transport',
  'Entertainment',
  'Groceries',
  'Health',
  'Utilities',
  'Income',
];

export default function Transactions() {
  const { data } = useFinance();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOrder, setSortOrder] = useState<'date' | 'amount'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  const hourlyRate = data.calculatedHourlyRate || 27.88;
  const transactions = data.transactions || [];
  
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        t => t.merchant.toLowerCase().includes(query) ||
             t.category.toLowerCase().includes(query)
      );
    }
    
    // Category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }
    
    // Sorting
    filtered.sort((a, b) => {
      if (sortOrder === 'date') {
        return sortDirection === 'desc' 
          ? b.date.getTime() - a.date.getTime()
          : a.date.getTime() - b.date.getTime();
      } else {
        return sortDirection === 'desc'
          ? b.amount - a.amount
          : a.amount - b.amount;
      }
    });
    
    return filtered;
  }, [searchQuery, selectedCategory, sortOrder, sortDirection]);
  
  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const groupTransactionsByDate = (transactions: Transaction[]) => {
    const groups: Record<string, Transaction[]> = {};
    
    transactions.forEach(t => {
      const dateKey = t.date.toLocaleDateString('en-US', { 
        weekday: 'long',
        month: 'short', 
        day: 'numeric' 
      });
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(t);
    });
    
    return groups;
  };
  
  const groupedTransactions = groupTransactionsByDate(filteredTransactions);
  
  const toggleSort = (field: 'date' | 'amount') => {
    if (sortOrder === field) {
      setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setSortOrder(field);
      setSortDirection('desc');
    }
  };
  
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-3xl font-display font-bold">Transactions</h1>
          <p className="text-muted-foreground">Track every dollar—and every hour</p>
        </div>
        
        {/* Quick Stats */}
        <div className="flex gap-4">
          <Card className="px-4 py-2 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-destructive" />
            <div>
              <p className="text-xs text-muted-foreground">Spent</p>
              <p className="font-bold">${totalExpenses.toFixed(2)}</p>
            </div>
          </Card>
          <Card className="px-4 py-2 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Time Cost</p>
              <p className="font-bold text-primary">{(totalExpenses / hourlyRate).toFixed(1)}h</p>
            </div>
          </Card>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col md:flex-row gap-4 mb-6"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <div className="flex gap-2">
          <Button
            variant={sortOrder === 'date' ? 'default' : 'outline'}
            size="sm"
            onClick={() => toggleSort('date')}
            className="flex items-center gap-1"
          >
            <Calendar className="w-4 h-4" />
            Date
            <ArrowUpDown className="w-3 h-3" />
          </Button>
          <Button
            variant={sortOrder === 'amount' ? 'default' : 'outline'}
            size="sm"
            onClick={() => toggleSort('amount')}
            className="flex items-center gap-1"
          >
            $
            <ArrowUpDown className="w-3 h-3" />
          </Button>
        </div>
      </motion.div>

      {/* Transactions List */}
      <div className="space-y-6">
        <AnimatePresence>
          {Object.entries(groupedTransactions).map(([dateGroup, transactions], groupIndex) => (
            <motion.div
              key={dateGroup}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: groupIndex * 0.05 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-sm font-medium text-muted-foreground">{dateGroup}</h3>
                <div className="flex-1 h-px bg-border" />
                <span className="text-sm text-muted-foreground">
                  ${transactions.reduce((sum, t) => sum + (t.type === 'expense' ? t.amount : 0), 0).toFixed(2)}
                </span>
              </div>
              
              <Card className="divide-y divide-border">
                {transactions.map((transaction, i) => {
                  const IconComponent = transaction.icon;
                  return (
                    <motion.div
                      key={transaction.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{transaction.merchant}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {transaction.category}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className={`font-bold ${transaction.type === 'income' ? 'text-success' : ''}`}>
                          {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                        </p>
                        {transaction.type === 'expense' && (
                          <p className="text-xs text-primary">
                            {(transaction.amount / hourlyRate).toFixed(1)}h of work
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {filteredTransactions.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <PennyMascot mood="thinking" size="md" />
            <p className="text-muted-foreground mt-4">No transactions found</p>
            <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
