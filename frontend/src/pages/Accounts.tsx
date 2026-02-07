import { motion } from 'framer-motion';
import { Plus, CreditCard, Building2, Wallet, PiggyBank, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFinance, Account } from '@/contexts/FinanceContext';

const accountIcons: Record<string, any> = {
  checking: Building2,
  savings: PiggyBank,
  credit: CreditCard,
  investment: TrendingUp,
};

export default function Accounts() {
  const { data } = useFinance();
  const accounts = data.accounts || [];

  const totalAssets = accounts
    .filter(a => a.balance > 0)
    .reduce((sum, a) => sum + a.balance, 0);
  
  const totalLiabilities = accounts
    .filter(a => a.balance < 0)
    .reduce((sum, a) => sum + Math.abs(a.balance), 0);

  const netWorth = totalAssets - totalLiabilities;

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto page-enter">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Accounts</h1>
          <p className="text-muted-foreground mt-1">Manage your connected accounts</p>
        </div>
        <Button className="brutal-btn-primary gap-2">
          <Plus className="w-5 h-5" />
          Link Account
        </Button>
      </div>

      {/* Net Worth Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="brutal-card mb-8"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <p className="text-sm font-bold text-muted-foreground mb-1">Net Worth</p>
            <p className="text-4xl md:text-5xl font-bold">
              ${netWorth.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="flex gap-6">
            <div className="text-right">
              <p className="text-xs font-bold text-muted-foreground">Assets</p>
              <p className="text-xl font-bold">
                ${totalAssets.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-muted-foreground">Liabilities</p>
              <p className="text-xl font-bold">
                ${totalLiabilities.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Account Groups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cash Accounts */}
        <div>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Cash Accounts
          </h2>
          <div className="space-y-3">
            {accounts
              .filter(a => {
                const name = a.name.toLowerCase();
                const isBrokerage = name.includes('brokerage') || name.includes('investment');
                return (a.type === 'checking' || a.type === 'savings') && !isBrokerage;
              })
              .map((account, index) => {
                const Icon = accountIcons[account.type] || Building2;
                return (
                  <motion.div
                    key={account.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="brutal-card interactive-card cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-muted border-2 border-border">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold">{account.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {account.initial} ••••
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">
                          ${account.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
          </div>
        </div>

        {/* Credit & Investment */}
        <div>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Credit & Investments
          </h2>
          <div className="space-y-3">
            {accounts
              .filter(a => {
                const name = a.name.toLowerCase();
                const isBrokerage = name.includes('brokerage') || name.includes('investment');
                return a.type !== 'checking' && a.type !== 'savings' || isBrokerage;
              })
              .map((account, index) => {
                const Icon = accountIcons[account.type] || CreditCard;
                const isCredit = account.type === 'credit' || account.balance < 0;
                return (
                  <motion.div
                    key={account.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="brutal-card interactive-card cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-muted border-2 border-border">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold">{account.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {account.initial} ••••
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-lg ${isCredit ? 'text-muted-foreground' : ''}`}>
                          {isCredit && account.balance > 0 ? '-' : ''}${Math.abs(account.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
