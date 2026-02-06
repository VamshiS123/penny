import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, CreditCard, Building2, Wallet, PiggyBank, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment';
  balance: number;
  institution: string;
  lastFour: string;
  change: number;
}

const mockAccounts: Account[] = [
  { id: '1', name: 'Main Checking', type: 'checking', balance: 4523.67, institution: 'Chase', lastFour: '4521', change: 234.50 },
  { id: '2', name: 'High Yield Savings', type: 'savings', balance: 12850.00, institution: 'Ally', lastFour: '8832', change: 125.00 },
  { id: '3', name: 'Travel Rewards', type: 'credit', balance: -1234.56, institution: 'Amex', lastFour: '3001', change: -456.78 },
  { id: '4', name: 'Emergency Fund', type: 'savings', balance: 8500.00, institution: 'Marcus', lastFour: '6654', change: 50.00 },
  { id: '5', name: 'Investment Portfolio', type: 'investment', balance: 25670.89, institution: 'Fidelity', lastFour: '9912', change: 1234.56 },
];

const accountIcons = {
  checking: Building2,
  savings: PiggyBank,
  credit: CreditCard,
  investment: TrendingUp,
};

export default function Accounts() {
  const [accounts] = useState<Account[]>(mockAccounts);

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
              .filter(a => a.type === 'checking' || a.type === 'savings')
              .map((account, index) => {
                const Icon = accountIcons[account.type];
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
                          {account.institution} ••••{account.lastFour}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">
                          ${account.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                        <div className="flex items-center justify-end gap-1">
                          {account.change >= 0 ? (
                            <ArrowUpRight className="w-3 h-3" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3" />
                          )}
                          <span className="text-xs text-muted-foreground">
                            ${Math.abs(account.change).toFixed(2)}
                          </span>
                        </div>
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
              .filter(a => a.type === 'credit' || a.type === 'investment')
              .map((account, index) => {
                const Icon = accountIcons[account.type];
                const isCredit = account.type === 'credit';
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
                          {account.institution} ••••{account.lastFour}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-lg ${isCredit ? 'text-muted-foreground' : ''}`}>
                          {isCredit ? '-' : ''}${Math.abs(account.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                        <div className="flex items-center justify-end gap-1">
                          {account.change >= 0 ? (
                            <ArrowUpRight className="w-3 h-3" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3" />
                          )}
                          <span className="text-xs text-muted-foreground">
                            ${Math.abs(account.change).toFixed(2)}
                          </span>
                        </div>
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
