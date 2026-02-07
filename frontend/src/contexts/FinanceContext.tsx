import { createContext, useContext, ReactNode, useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LucideIcon } from 'lucide-react';
import { getIcon } from '@/lib/icons';
import * as api from '@/lib/api';

export interface UserFinanceData {
  email: string;
  fullName?: string;
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

  // Expenses
  expenses: Expense[];

  // Accounts
  accounts: Account[];
  
  // Transactions
  transactions: Transaction[];
  
  // Gamification
  xp: number;
  level: number;
  streak: number;
  coins: number;
  achievements: Achievement[];
  ownedItems: ShopItem[];
  equippedItems: ShopItem[];
}

export interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  color: string;
  initial: string;
}

export interface Goal {
  id: string;
  name: string;
  icon: LucideIcon;
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
  type: 'income' | 'expense';
}

const initialData: UserFinanceData = {
  email: '',
  fullName: '',
  incomeType: 'salary',
  calculatedHourlyRate: 0,
  monthlyIncome: 0,
  selectedGoals: [],
  expenses: [],
  accounts: [],
  transactions: [],
  xp: 0,
  level: 1,
  streak: 0,
  coins: 100,
  achievements: [],
  ownedItems: [],
  equippedItems: [],
};

interface FinanceContextType {
  data: UserFinanceData;
  isLoading: boolean;
  isAuthenticated: boolean;
  shopCatalog: ShopItem[];
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
  logout: () => void;
  checkAuth: () => void;
  uploadCSV: (file: File) => Promise<void>;
  addTransaction: (data: any) => Promise<any>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const isAuthenticated = !!token;

  const checkAuth = () => {
    setToken(localStorage.getItem("token"));
  };

  // --- Queries ---
  const userQuery = useQuery({ 
      queryKey: ['user'], 
      queryFn: api.fetchUser,
      enabled: isAuthenticated 
  });
  const expensesQuery = useQuery({ 
      queryKey: ['expenses'], 
      queryFn: api.fetchExpenses,
      enabled: isAuthenticated 
  });
  const goalsQuery = useQuery({ 
      queryKey: ['goals'], 
      queryFn: api.fetchGoals,
      enabled: isAuthenticated 
  });
  const accountsQuery = useQuery({ 
      queryKey: ['accounts'], 
      queryFn: api.fetchAccounts,
      enabled: isAuthenticated 
  });
  const transactionsQuery = useQuery({ 
      queryKey: ['transactions'], 
      queryFn: api.fetchTransactions,
      enabled: isAuthenticated 
  });
  const achievementsQuery = useQuery({ 
      queryKey: ['achievements'], 
      queryFn: api.fetchAchievements,
      enabled: isAuthenticated 
  });
  const shopQuery = useQuery({ 
      queryKey: ['shop'], 
      queryFn: api.fetchShopItems,
      enabled: isAuthenticated 
  });
  
  // Seed if empty (One time check or handled by backend? Handled here for simplicity)
  useEffect(() => {
    if (isAuthenticated && achievementsQuery.data && achievementsQuery.data.length === 0) {
      api.seedAchievements().then(() => queryClient.invalidateQueries({ queryKey: ['achievements'] }));
    }
    if (isAuthenticated && shopQuery.data && shopQuery.data.length === 0) {
      api.seedShopItems().then(() => queryClient.invalidateQueries({ queryKey: ['shop'] }));
    }
  }, [achievementsQuery.data, shopQuery.data, queryClient, isAuthenticated]);


  // --- Mutations ---
  const updateUserMutation = useMutation({
    mutationFn: api.updateUser,
    onSuccess: (newData) => {
        queryClient.setQueryData(['user'], newData);
        queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  const createGoalMutation = useMutation({
    mutationFn: api.createGoal,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goals'] }),
  });

  const unlockAchievementMutation = useMutation({
    mutationFn: api.unlockAchievement,
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['achievements'] });
        queryClient.invalidateQueries({ queryKey: ['user'] }); // XP update
    }
  });

  const purchaseItemMutation = useMutation({
    mutationFn: api.purchaseItem,
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['shop'] });
        queryClient.invalidateQueries({ queryKey: ['user'] }); // Coins update
    }
  });

  const equipItemMutation = useMutation({
    mutationFn: api.equipItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['user'] }) 
  });

  const uploadCSVMutation = useMutation({
    mutationFn: api.uploadCSV,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    }
  });

  const createTransactionMutation = useMutation({
    mutationFn: api.createTransaction,
  });


  // --- Data Construction ---
  const data: UserFinanceData = useMemo(() => {
    const user = userQuery.data || {};
    const expenses = expensesQuery.data || [];
    const goals = goalsQuery.data || [];
    const transactions = transactionsQuery.data || [];
    const accounts = accountsQuery.data || [];
    const allAchievements = achievementsQuery.data || [];
    const allShopItems = shopQuery.data || [];

    // Calculate generic values if missing from backend or needing calculation
    // Note: Backend stores raw values.
    
    // Map User
    const mappedUser: Partial<UserFinanceData> = {
        email: user.email || '',
        fullName: user.full_name || '',
        incomeType: user.income_type || 'salary',
        annualSalary: user.annual_salary,
        payFrequency: user.pay_frequency,
        hourlyRate: user.hourly_rate,
        hoursPerWeek: user.hours_per_week,
        calculatedHourlyRate: 0, // Recalculated below
        monthlyIncome: 0, // Recalculated below
        age: user.age,
        city: user.city,
        householdSize: user.household_size,
        housingStatus: user.housing_status,
        xp: user.xp || 0,
        level: user.level || 1,
        streak: user.streak || 0,
        coins: user.coins || 100,
    };

    // Recalculate derived income fields locally for now to match frontend logic
    if (mappedUser.incomeType === 'hourly' && mappedUser.hourlyRate) {
        mappedUser.calculatedHourlyRate = mappedUser.hourlyRate;
        mappedUser.monthlyIncome = (mappedUser.hourlyRate * (mappedUser.hoursPerWeek || 40)) * 4.33;
    } else if (mappedUser.annualSalary) {
        mappedUser.calculatedHourlyRate = mappedUser.annualSalary / 2080;
        mappedUser.monthlyIncome = mappedUser.annualSalary / 12;
    }

    // Map Expenses
    const mappedExpenses: Expense[] = expenses.map((e: any) => ({
        id: e.id,
        category: e.category,
        name: e.name,
        amount: e.amount,
        isFixed: e.is_fixed,
        icon: getIcon(e.icon || e.category), // backend sends string
    }));

    // Map Goals
    const mappedGoals: Goal[] = goals.map((g: any) => ({
        id: g.id,
        name: g.name,
        description: g.description,
        targetAmount: g.target_amount,
        savedAmount: g.saved_amount,
        icon: getIcon(g.icon),
    }));
    
    // Map Accounts
    const mappedAccounts: Account[] = accounts.map((a: any) => ({
        id: a.id,
        name: a.name,
        type: a.type,
        balance: a.balance,
        color: a.color,
        initial: a.initial,
    }));

    // Map Transactions
    const mappedTransactions: Transaction[] = transactions.map((t: any) => ({
        id: t.id,
        merchant: t.merchant,
        category: t.category,
        amount: t.amount,
        date: new Date(t.date),
        timeCost: 0, 
        icon: getIcon(t.icon || t.category),
        type: t.category === 'Income' ? 'income' : 'expense',
    }));

    // Map Achievements
    const unlockedAchievementIds = new Set((user.achievements || []).map((ua: any) => ua.achievement_id));
    
    const mappedAchievements: Achievement[] = allAchievements.map((a: any) => ({
        id: a.id,
        name: a.name,
        description: a.description,
        icon: getIcon(a.icon),
        xpReward: a.xp_reward,
        unlockedAt: unlockedAchievementIds.has(a.id) ? new Date() : undefined,
    }));

    // Map Shop Items
    const ownedItemIds = new Set((user.items || []).map((ui: any) => ui.item_id));
    const equippedItemIds = new Set((user.items || []).filter((ui: any) => ui.is_equipped).map((ui: any) => ui.item_id));

    const mappedOwnedItems: ShopItem[] = allShopItems
        .filter((item: any) => ownedItemIds.has(item.id))
        .map((item: any) => ({
            id: item.id,
            name: item.name,
            category: item.category,
            description: item.description,
            price: item.price,
            rarity: item.rarity
        }));

    const mappedEquippedItems: ShopItem[] = allShopItems
        .filter((item: any) => equippedItemIds.has(item.id))
        .map((item: any) => ({
            id: item.id,
            name: item.name,
            category: item.category,
            description: item.description,
            price: item.price,
            rarity: item.rarity
        }));

    return {
        ...initialData,
        ...mappedUser,
        selectedGoals: mappedGoals,
        expenses: mappedExpenses,
        accounts: mappedAccounts,
        transactions: mappedTransactions,
        achievements: mappedAchievements,
        ownedItems: mappedOwnedItems,
        equippedItems: mappedEquippedItems,
    } as UserFinanceData;

  }, [userQuery.data, expensesQuery.data, goalsQuery.data, achievementsQuery.data, shopQuery.data, accountsQuery.data, transactionsQuery.data]);


  const updateData = (updates: Partial<UserFinanceData>) => {
    // Determine what to update on backend
    const userUpdates: any = {};
    let hasUserUpdates = false;

    if (updates.incomeType) { userUpdates.income_type = updates.incomeType; hasUserUpdates = true; }
    if (updates.annualSalary !== undefined) { userUpdates.annual_salary = updates.annualSalary; hasUserUpdates = true; }
    if (updates.payFrequency) { userUpdates.pay_frequency = updates.payFrequency; hasUserUpdates = true; }
    if (updates.hourlyRate !== undefined) { userUpdates.hourly_rate = updates.hourlyRate; hasUserUpdates = true; }
    if (updates.hoursPerWeek !== undefined) { userUpdates.hours_per_week = updates.hoursPerWeek; hasUserUpdates = true; }
    if (updates.age !== undefined) { userUpdates.age = updates.age; hasUserUpdates = true; }
    if (updates.city !== undefined) { userUpdates.city = updates.city; hasUserUpdates = true; }
    if (updates.householdSize !== undefined) { userUpdates.household_size = updates.householdSize; hasUserUpdates = true; }
    if (updates.housingStatus) { userUpdates.housing_status = updates.housingStatus; hasUserUpdates = true; }

    if (hasUserUpdates) {
        updateUserMutation.mutate(userUpdates);
    }

    if (updates.selectedGoals) {
        // Simple logic: Create new goals.
        // Warning: This creates duplicates if not careful.
        // Onboarding flow creates new goals.
        updates.selectedGoals.forEach(g => {
            // Check if it has a real ID (UUID) -> Update
            // If ID is short string (e.g. 'car') -> Create
            if (g.id && g.id.length > 10) { 
                 // Update? api.updateGoal(g.id, ...)
            } else {
                createGoalMutation.mutate({
                    name: g.name,
                    description: g.description,
                    target_amount: g.targetAmount,
                    icon: g.icon,
                });
            }
        });
    }

    // Expenses: Logic needed if updating expenses via this method
  };

  const calculateHourlyRate = (): number => data.calculatedHourlyRate;
  const getTotalExpenses = (): number => data.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const getRemainingIncome = (): number => data.monthlyIncome - getTotalExpenses();
  
  const getTimeEquivalent = (amount: number): number => {
    const hourlyRate = data.calculatedHourlyRate || 0;
    if (hourlyRate <= 0) return 0;
    return amount / hourlyRate;
  };

  const addXP = (amount: number) => {
      // Optimistic update done by query invalidation usually, 
      // but here we just need to ensure backend knows.
      // Backend handles XP via achievement unlock mostly.
      // If manual XP add is needed, we need an endpoint or just update user.
      const newXP = data.xp + amount;
      updateUserMutation.mutate({ xp: newXP });
  };

  const addCoins = (amount: number) => {
      const newCoins = data.coins + amount;
      updateUserMutation.mutate({ coins: newCoins });
  };

  const unlockAchievement = (id: string) => {
      unlockAchievementMutation.mutate(id);
  };

  const purchaseItem = (item: ShopItem): boolean => {
      // Optimistic check
      if (data.coins < item.price) return false;
      purchaseItemMutation.mutate(item.id);
      return true;
  };

  const equipItem = (item: ShopItem) => {
      equipItemMutation.mutate(item.id);
  };

  const logout = () => {
      api.logout();
      setToken(null);
      queryClient.clear();
      window.location.href = "/login";
  };

  // Only consider loading if we don't have data yet
  const isLoading = isAuthenticated && (
    (userQuery.isPending && !userQuery.data) || 
    (expensesQuery.isPending && !expensesQuery.data)
  );

  const shopCatalog = (shopQuery.data || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      description: item.description,
      price: item.price,
      rarity: item.rarity,
      preview: item.preview
  }));

  return (
    <FinanceContext.Provider value={{
      data: isAuthenticated ? data : initialData,
      isLoading,
      isAuthenticated,
      shopCatalog,
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
      logout,
      checkAuth,
      uploadCSV: async (file: File) => {
          await uploadCSVMutation.mutateAsync(file);
      },
      addTransaction: async (data: any) => {
          const result = await createTransactionMutation.mutateAsync(data);
          await Promise.all([
             queryClient.invalidateQueries({ queryKey: ['transactions'] }),
             queryClient.invalidateQueries({ queryKey: ['user'] })
          ]);
          return result;
      },
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