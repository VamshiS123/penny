import { motion } from 'framer-motion';
import { 
  AlertTriangle, Calendar, MoreVertical, Pause, Trash2, ExternalLink,
  Film
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useFinance } from '@/contexts/FinanceContext';

interface Subscription {
  id: string;
  name: string;
  icon: any;
  price: number;
  cycle: 'monthly' | 'yearly';
  nextBilling: string;
  category: string;
  status: 'active' | 'paused' | 'trial';
  usage?: 'low' | 'medium' | 'high';
  color: string;
}

export default function Subscriptions() {
  const { data } = useFinance();

  // Derived subscriptions from transactions
  const subscriptions: Subscription[] = data.transactions
    .filter(t => t.category === 'Subscriptions' || t.category === 'Entertainment')
    .filter((t, index, self) => index === self.findIndex((obj) => obj.merchant === t.merchant)) // Unique by merchant for list
    .map(t => ({
        id: t.id,
        name: t.merchant,
        icon: t.icon || Film,
        price: Math.abs(t.amount),
        cycle: 'monthly',
        nextBilling: new Date().toISOString(), // Mock next billing
        category: t.category,
        status: 'active',
        usage: 'medium',
        color: 'bg-primary'
    }));

  const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
  const monthlyTotal = activeSubscriptions.reduce((sum, s) => sum + (s.cycle === 'monthly' ? s.price : s.price / 12), 0);
  const yearlyTotal = monthlyTotal * 12;
  const lowUsageCount = subscriptions.filter(s => s.usage === 'low').length;

  const getUsageIndicator = (usage?: string) => {
    switch (usage) {
      case 'high': return 'bg-foreground';
      case 'medium': return 'bg-foreground/50';
      case 'low': return 'bg-muted-foreground';
      default: return 'bg-muted';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return 'bg-foreground text-background';
      case 'paused': return 'bg-muted text-muted-foreground';
      case 'trial': return 'bg-muted text-foreground';
      default: return '';
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto page-enter">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">Subscriptions</h1>
        <p className="text-muted-foreground mt-1">Track and manage recurring payments</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="brutal-card"
        >
          <p className="text-sm font-medium text-muted-foreground mb-1">Monthly Cost</p>
          <p className="text-3xl font-bold">${monthlyTotal.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-2">{activeSubscriptions.length} active subscriptions</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="brutal-card"
        >
          <p className="text-sm font-medium text-muted-foreground mb-1">Yearly Cost</p>
          <p className="text-3xl font-bold">${yearlyTotal.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground mt-2">Projected annual spending</p>
        </motion.div>

        {lowUsageCount > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="brutal-card border-2 border-amber-500 bg-amber-50 dark:bg-amber-950/20"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 mt-0.5 text-amber-500" />
              <div>
                <p className="font-bold text-amber-700 dark:text-amber-400">Low Usage Alert</p>
                <p className="text-sm text-amber-600 dark:text-amber-300 mt-1">
                  {lowUsageCount} subscription{lowUsageCount > 1 ? 's' : ''} barely used. Consider canceling to save ${subscriptions.filter(s => s.usage === 'low').reduce((sum, s) => sum + s.price, 0).toFixed(2)}/mo
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Subscription List */}
      <div className="space-y-3">
        {subscriptions.map((sub, index) => {
          const IconComponent = sub.icon;
          return (
            <motion.div
              key={sub.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`brutal-card interactive-card ${sub.status === 'paused' ? 'opacity-60' : ''}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 ${sub.color} border-2 border-border flex items-center justify-center`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold truncate">{sub.name}</h3>
                    <span className={`text-xs font-bold px-2 py-0.5 border-2 border-border ${getStatusBadge(sub.status)}`}>
                      {sub.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{sub.category}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(sub.nextBilling).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {sub.usage && (
                  <div className="hidden md:flex items-center gap-2">
                    <div className={`w-3 h-3 ${getUsageIndicator(sub.usage)} border-2 border-border`} />
                    <span className="text-xs text-muted-foreground capitalize">{sub.usage} usage</span>
                  </div>
                )}

                <div className="text-right">
                  <p className="font-bold text-lg">${sub.price.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">/{sub.cycle === 'monthly' ? 'mo' : 'yr'}</p>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="border-2 border-border">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="brutal-card p-2">
                    <DropdownMenuItem className="gap-2 cursor-pointer">
                      <ExternalLink className="w-4 h-4" />
                      Manage
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 cursor-pointer">
                      <Pause className="w-4 h-4" />
                      {sub.status === 'paused' ? 'Resume' : 'Pause'}
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 cursor-pointer">
                      <Trash2 className="w-4 h-4" />
                      Cancel
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
