import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Shield, Palette, CreditCard, LogOut, ChevronRight, Moon, Sun, Smartphone } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useFinance } from '@/contexts/FinanceContext';

interface SettingSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  items: SettingItem[];
}

interface SettingItem {
  id: string;
  label: string;
  description?: string;
  type: 'toggle' | 'link' | 'select';
  value?: boolean;
}

export default function Settings() {
  const { data, logout } = useFinance();
  const [notifications, setNotifications] = useState({
    spending: true,
    goals: true,
    weekly: true,
    marketing: false,
  });

  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      if (stored === 'dark' || stored === 'light' || stored === 'system') {
        return stored;
      }
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.remove('light', 'dark');
      root.classList.add(systemTheme);
    } else {
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
    }
    
    localStorage.setItem('theme', theme);
  }, [theme]);

  const sections: SettingSection[] = [
    {
      id: 'profile',
      title: 'Profile',
      icon: <User className="w-5 h-5" />,
      items: [
        { id: 'name', label: 'Name', description: data.fullName || 'User', type: 'link' },
        { id: 'email', label: 'Email', description: data.email || 'user@example.com', type: 'link' },
        { id: 'phone', label: 'Phone', description: '+1 (555) 123-4567', type: 'link' },
      ],
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: <Bell className="w-5 h-5" />,
      items: [
        { id: 'spending', label: 'Spending Alerts', description: 'Get notified when you overspend', type: 'toggle', value: notifications.spending },
        { id: 'goals', label: 'Goal Progress', description: 'Updates on your savings goals', type: 'toggle', value: notifications.goals },
        { id: 'weekly', label: 'Weekly Summary', description: 'Weekly spending overview', type: 'toggle', value: notifications.weekly },
        { id: 'marketing', label: 'Tips & Offers', description: 'Helpful money tips from Penny', type: 'toggle', value: notifications.marketing },
      ],
    },
    {
      id: 'security',
      title: 'Security',
      icon: <Shield className="w-5 h-5" />,
      items: [
        { id: 'password', label: 'Change Password', type: 'link' },
        { id: 'biometric', label: 'Face ID / Touch ID', description: 'Quick login with biometrics', type: 'toggle', value: true },
        { id: '2fa', label: 'Two-Factor Auth', description: 'Extra security for your account', type: 'link' },
      ],
    },
    {
      id: 'billing',
      title: 'Billing',
      icon: <CreditCard className="w-5 h-5" />,
      items: [
        { id: 'plan', label: 'Current Plan', description: 'Penny Pro - $9.99/mo', type: 'link' },
        { id: 'payment', label: 'Payment Method', description: '•••• 4242', type: 'link' },
        { id: 'history', label: 'Billing History', type: 'link' },
      ],
    },
  ];

  const handleToggle = (sectionId: string, itemId: string) => {
    if (sectionId === 'notifications') {
      setNotifications(prev => ({
        ...prev,
        [itemId]: !prev[itemId as keyof typeof prev],
      }));
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto page-enter">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your preferences</p>
      </div>

      {/* Theme Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="brutal-card mb-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-muted border-2 border-border">
            <Palette className="w-5 h-5" />
          </div>
          <h2 className="font-bold text-lg">Appearance</h2>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'light', label: 'Light', icon: Sun },
            { id: 'dark', label: 'Dark', icon: Moon },
            { id: 'system', label: 'System', icon: Smartphone },
          ].map((option) => (
            <button
              key={option.id}
              onClick={() => setTheme(option.id as typeof theme)}
              className={`p-4 border-2 border-border flex flex-col items-center gap-2 transition-all ${
                theme === option.id 
                  ? 'bg-foreground text-background' 
                  : 'bg-card hover:bg-muted'
              }`}
              style={{ boxShadow: theme === option.id ? 'var(--shadow-sm)' : 'none' }}
            >
              <option.icon className="w-5 h-5" />
              <span className="text-sm font-bold">{option.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {sections.map((section, sectionIndex) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIndex * 0.1 }}
            className="brutal-card"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-muted border-2 border-border">
                {section.icon}
              </div>
              <h2 className="font-bold text-lg">{section.title}</h2>
            </div>

            <div className="divide-y-2 divide-border">
              {section.items.map((item) => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{item.label}</p>
                      {item.description && (
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      )}
                    </div>
                    {item.type === 'toggle' ? (
                      <Switch
                        checked={item.value}
                        onCheckedChange={() => handleToggle(section.id, item.id)}
                      />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Logout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8"
      >
        <Button 
          className="w-full brutal-btn bg-foreground text-background gap-2"
          onClick={logout}
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </Button>
      </motion.div>

      {/* Version */}
      <p className="text-center text-xs text-muted-foreground mt-6">
        Penny v1.0.0 • Made with 💜
      </p>
    </div>
  );
}
