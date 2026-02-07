import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, CreditCard, PieChart, Building2, Calendar, 
  Sparkles, Users, Search, Target, ShoppingBag, Settings,
  ChevronLeft, ChevronRight, Flame, LogOut
} from 'lucide-react';
import { useFinance } from '@/contexts/FinanceContext';
import pennyIcon from '@/assets/penny.png';

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const mainNavItems = [
  { icon: Home, label: 'Dashboard', path: '/dashboard' },
  { icon: CreditCard, label: 'Transactions', path: '/transactions' },
  { icon: PieChart, label: 'Budgets', path: '/budgets' },
  { icon: Building2, label: 'Accounts', path: '/accounts' },
];

const toolNavItems = [
  { icon: Calendar, label: 'Time Calendar', path: '/time-calendar' },
  { icon: Sparkles, label: 'Future You', path: '/future-you' },
  { icon: Users, label: 'Financial Twin', path: '/financial-twin' },
  { icon: Search, label: 'Subscriptions', path: '/subscriptions' },
];

const otherNavItems = [
  { icon: Target, label: 'Goals', path: '/goals' },
  { icon: ShoppingBag, label: 'Shop', path: '/shop' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const location = useLocation();
  const { data, logout } = useFinance();

  const NavItem = ({ icon: Icon, label, path, badge }: { icon: any; label: string; path: string; badge?: string }) => {
    const isActive = location.pathname === path;
    
    return (
      <Link to={path}>
        <motion.div
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
            isActive 
              ? 'bg-sidebar-primary text-sidebar-primary-foreground' 
              : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent'
          }`}
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
        >
          <Icon className="w-5 h-5 flex-shrink-0" />
          {!collapsed && (
            <>
              <span className="font-medium text-sm flex-1">{label}</span>
              {badge && (
                <span className="px-2 py-0.5 text-xs bg-secondary text-secondary-foreground rounded-full">
                  {badge}
                </span>
              )}
            </>
          )}
        </motion.div>
      </Link>
    );
  };

  return (
    <motion.aside
      className="h-screen bg-sidebar flex flex-col border-r border-sidebar-border sticky top-0"
      initial={false}
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.2 }}
    >
      {/* Logo */}
      <div className="p-4 flex items-center gap-3">
        <img src={pennyIcon} alt="Penny" className="w-10 h-10" />
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-display font-bold text-xl text-sidebar-foreground"
          >
            Penny
          </motion.span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-6 overflow-y-auto">
        {/* Core */}
        <div className="space-y-1">
          {!collapsed && (
            <p className="px-3 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-2">
              Core
            </p>
          )}
          {mainNavItems.map(item => (
            <NavItem key={item.path} {...item} />
          ))}
        </div>

        {/* Tools */}
        <div className="space-y-1">
          {!collapsed && (
            <p className="px-3 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-2">
              Tools
            </p>
          )}
          {toolNavItems.map(item => (
            <NavItem key={item.path} {...item} />
          ))}
        </div>

        {/* Other */}
        <div className="space-y-1">
          {!collapsed && (
            <p className="px-3 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-2">
              Other
            </p>
          )}
          {otherNavItems.map(item => (
            <NavItem key={item.path} {...item} />
          ))}
        </div>
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-sidebar-border">
        {!collapsed ? (
          <div className="space-y-3">
            {/* XP & Level */}
            <div className="bg-sidebar-accent rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-sidebar-foreground">Level {data.level}</span>
                <span className="text-xs text-sidebar-foreground/70">{data.xp} XP</span>
              </div>
              <div className="h-2 bg-sidebar-border rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(data.xp % 500) / 5}%` }}
                />
              </div>
            </div>

            {/* Streak */}
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-secondary" />
                <span className="font-medium text-sidebar-foreground">{data.streak} day streak</span>
              </div>
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-destructive hover:bg-destructive/10 transition-all mt-2"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium text-sm">Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center">
              <span className="text-xs font-bold text-sidebar-foreground">{data.level}</span>
            </div>
            <div className="flex items-center gap-1">
              <Flame className="w-4 h-4 text-secondary" />
              <span className="text-xs text-sidebar-foreground">{data.streak}</span>
            </div>
            <button
              onClick={logout}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-destructive hover:bg-destructive/10 transition-all mt-2"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 bg-sidebar-accent border border-sidebar-border rounded-full flex items-center justify-center text-sidebar-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground transition-colors"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </motion.aside>
  );
}
