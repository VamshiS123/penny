import { createContext, useContext, useState, ReactNode } from 'react';
import { 
  Home, Zap, Smartphone, Car, RefreshCw, Pizza, Fuel,
  Shield, Plane, CreditCard, GraduationCap, Star,
  Egg, Flame, Coins, Ghost, Target, Crown, Clock, Users
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export interface UserFinanceData {
  // Income
  incomeType: 'salary' | 'hourly';
  annualSalary?: number;
  payFrequency?: 'weekly' | 'biweekly' | 'monthly';
  hourlyRate?: number;
  hoursPerWeek?: number;
  calculatedHourlyRate: number;
  monthlyIncome: number;

  // About
  age?: number;
  city?: string;
  householdSize?: number;
  housingStatus?: 'rent' | 'own' | 'family';

  // Goals
  selectedGoals: Goal[];

  // Expenses (mock data for demo)
  expenses: Expense[];
  
  // Gamification
  xp: number;
  level: number;
  streak: number;
  coins: number;
  achievements: Achievement[];
  ownedItems: ShopItem[];
  equippedItems: ShopItem[];
}

export interface Goal {
  id: string;
  name: string;
  icon: string;
  description: string;
  targetAmount: number;
  savedAmount: number;
}

export interface Expense {
  id: string;
  category: string;
  icon: LucideIcon;
  name: string;
  amount: number;
  isFixed: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  unlockedAt?: Date;
  xpReward: number;
}

export interface ShopItem {
  id: string;
  name: string;
  category: 'outfit' | 'theme' | 'expression' | 'widget' | 'streak';
  description: string;
  price: number;
  rarity: 'common' | 'rare' | 'legendary';
  preview?: string;
}

export interface Transaction {
  id: string;
  merchant: string;
  category: string;
  icon: LucideIcon;
  amount: number;
  date: Date;
  timeCost: number;
}

const defaultExpenses: Expense[] = [
  { id: '1', category: 'Housing', icon: Home, name: 'Rent', amount: 1400, isFixed: true },
  { id: '2', category: 'Utilities', icon: Zap, name: 'Utilities', amount: 180, isFixed: true },
  { id: '3', category: 'Phone', icon: Smartphone, name: 'Phone', amount: 85, isFixed: true },
  { id: '4', category: 'Transportation', icon: Car, name: 'Car Payment', amount: 350, isFixed: true },
  { id: '5', category: 'Subscriptions', icon: RefreshCw, name: 'Subscriptions', amount: 127, isFixed: true },
  { id: '6', category: 'Food', icon: Pizza, name: 'Food (estimated)', amount: 450, isFixed: false },
  { id: '7', category: 'Gas', icon: Fuel, name: 'Gas/Transport', amount: 200, isFixed: false },
];

const defaultGoals: Goal[] = [];

const defaultAchievements: Achievement[] = [
  { id: '1', name: 'First Steps', description: 'Complete onboarding', icon: Egg, xpReward: 50 },
  { id: '2', name: 'Week Warrior', description: '7 day streak', icon: Flame, xpReward: 100 },
  { id: '3', name: 'First $100', description: 'Save your first $100', icon: Coins, xpReward: 150 },
  { id: '4', name: 'Ghost Buster', description: 'Cancel first subscription', icon: Ghost, xpReward: 75 },
  { id: '5', name: 'Goal Getter', description: 'Complete your first goal', icon: Target, xpReward: 200 },
  { id: '6', name: 'Budget Master', description: 'Stay under budget for a month', icon: Crown, xpReward: 300 },
  { id: '7', name: 'Time Lord', description: 'Check time calendar 30 times', icon: Clock, xpReward: 100 },
  { id: '8', name: 'Social Saver', description: 'Compare with 10 Financial Twins', icon: Users, xpReward: 75 },
];

const initialData: UserFinanceData = {
  incomeType: 'salary',
  calculatedHourlyRate: 0,
  monthlyIncome: 0,
  selectedGoals: defaultGoals,
  expenses: defaultExpenses,
  xp: 0,
  level: 1,
  streak: 0,
  coins: 100,
  achievements: defaultAchievements,
  ownedItems: [],
  equippedItems: [],
};

interface FinanceContextType {
  data: UserFinanceData;
  updateData: (updates: Partial<UserFinanceData>) => void;
  calculateHourlyRate: () => number;
  getTotalExpenses: () => number;
  getRemainingIncome: () => number;
  getTimeEquivalent: (amount: number) => number;
  addXP: (amount: number) => void;
  addCoins: (amount: number) => void;
  unlockAchievement: (id: string) => void;
  purchaseItem: (item: ShopItem) => boolean;
  equipItem: (item: ShopItem) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<UserFinanceData>(initialData);

  const updateData = (updates: Partial<UserFinanceData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const calculateHourlyRate = (): number => {
    if (data.incomeType === 'hourly' && data.hourlyRate) {
      return data.hourlyRate;
    }
    if (data.incomeType === 'salary' && data.annualSalary) {
      // Assuming 2080 work hours per year (40 hours/week * 52 weeks)
      return data.annualSalary / 2080;
    }
    return 0;
  };

  const getTotalExpenses = (): number => {
    return data.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  };

  const getRemainingIncome = (): number => {
    return data.monthlyIncome - getTotalExpenses();
  };

  const getTimeEquivalent = (amount: number): number => {
    const hourlyRate = data.calculatedHourlyRate || calculateHourlyRate();
    if (hourlyRate <= 0) return 0;
    return amount / hourlyRate;
  };

  const addXP = (amount: number) => {
    setData(prev => {
      const newXP = prev.xp + amount;
      const xpPerLevel = 500;
      const newLevel = Math.floor(newXP / xpPerLevel) + 1;
      return { ...prev, xp: newXP, level: newLevel };
    });
  };

  const addCoins = (amount: number) => {
    setData(prev => ({ ...prev, coins: prev.coins + amount }));
  };

  const unlockAchievement = (id: string) => {
    setData(prev => {
      const achievements = prev.achievements.map(a => 
        a.id === id && !a.unlockedAt 
          ? { ...a, unlockedAt: new Date() } 
          : a
      );
      const achievement = achievements.find(a => a.id === id);
      const newXP = achievement?.unlockedAt ? prev.xp : prev.xp + (achievement?.xpReward || 0);
      return { ...prev, achievements, xp: newXP };
    });
  };

  const purchaseItem = (item: ShopItem): boolean => {
    if (data.coins < item.price) return false;
    setData(prev => ({
      ...prev,
      coins: prev.coins - item.price,
      ownedItems: [...prev.ownedItems, item],
    }));
    return true;
  };

  const equipItem = (item: ShopItem) => {
    setData(prev => {
      // Remove any equipped item of the same category
      const filtered = prev.equippedItems.filter(i => i.category !== item.category);
      return { ...prev, equippedItems: [...filtered, item] };
    });
  };

  return (
    <FinanceContext.Provider value={{
      data,
      updateData,
      calculateHourlyRate,
      getTotalExpenses,
      getRemainingIncome,
      getTimeEquivalent,
      addXP,
      addCoins,
      unlockAchievement,
      purchaseItem,
      equipItem,
    }}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}
