import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useFinance } from '@/contexts/FinanceContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowRight, Check, Shield, Plane, CreditCard, Car, Home, GraduationCap, Star, Upload, Building2 } from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { uploadCSV } from '@/lib/api';
import { toast } from 'sonner';
import pennyPointing from '@/assets/penny_pointup.png';
import { VerticalCutReveal } from '@/components/ui/vertical-cut-reveal';

const steps = ['Income', 'About You', 'Goals', 'Connect Bank'];

interface GoalOption {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
}

const goalOptions: GoalOption[] = [
  { id: 'emergency', name: 'Emergency Fund', icon: Shield, description: "For life's surprises" },
  { id: 'vacation', name: 'Vacation', icon: Plane, description: 'You deserve a break' },
  { id: 'debt', name: 'Pay Off Debt', icon: CreditCard, description: 'Freedom from payments' },
  { id: 'car', name: 'New Car', icon: Car, description: 'Upgrade your ride' },
  { id: 'house', name: 'House Down Payment', icon: Home, description: 'Plant your roots' },
  { id: 'education', name: 'Education', icon: GraduationCap, description: 'Invest in yourself' },
  { id: 'custom', name: 'Custom Goal', icon: Star, description: 'Something else' },
];

const stepTitles = [
  { title: 'Income Details', subtitle: "Tell me how you're compensated so I can calculate your time value." },
  { title: 'About You', subtitle: "Help me find your Financial Twin—people with similar profiles." },
  { title: 'Your Goals', subtitle: "What are we working toward? Pick 1-3 goals to focus on." },
  { title: 'Connect Your Bank', subtitle: "Let's see where your money's been going. Bank-level security." },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { data, updateData, uploadCSV } = useFinance();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const continueButtonRef = useRef<HTMLButtonElement>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  const [incomeType, setIncomeType] = useState<'salary' | 'hourly'>('salary');
  const [salary, setSalary] = useState('');
  const [payFrequency, setPayFrequency] = useState('biweekly');
  const [hourlyRate, setHourlyRate] = useState('');
  const [hoursPerWeek, setHoursPerWeek] = useState('40');
  const [age, setAge] = useState('');
  const [city, setCity] = useState('');
  const [householdSize, setHouseholdSize] = useState('1');
  const [housingStatus, setHousingStatus] = useState<'rent' | 'own' | 'family'>('rent');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [goalAmounts, setGoalAmounts] = useState<Record<string, string>>({});

  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await uploadCSV(file);
      toast.success("CSV Uploaded successfully!");
      handleNext();
    } catch (error) {
      toast.error("Failed to upload CSV");
    }
  };

  const calculateHourlyRate = (): number => {
    if (incomeType === 'hourly') {
      return parseFloat(hourlyRate) || 0;
    }
    const annualSalary = parseFloat(salary) || 0;
    return annualSalary / 2080;
  };

  const calculateMonthlyIncome = (): number => {
    if (incomeType === 'hourly') {
      const rate = parseFloat(hourlyRate) || 0;
      const hours = parseFloat(hoursPerWeek) || 40;
      return rate * hours * 4.33;
    }
    return (parseFloat(salary) || 0) / 12;
  };

  const handleNext = () => {
    if (currentStep === 0) {
      const hourly = calculateHourlyRate();
      const monthly = calculateMonthlyIncome();
      updateData({
        incomeType,
        annualSalary: incomeType === 'salary' ? parseFloat(salary) : undefined,
        payFrequency: incomeType === 'salary' ? payFrequency as 'weekly' | 'biweekly' | 'monthly' : undefined,
        hourlyRate: incomeType === 'hourly' ? parseFloat(hourlyRate) : undefined,
        hoursPerWeek: incomeType === 'hourly' ? parseFloat(hoursPerWeek) : undefined,
        calculatedHourlyRate: hourly,
        monthlyIncome: monthly,
      });
    } else if (currentStep === 1) {
      updateData({
        age: parseInt(age) || undefined,
        city,
        householdSize: parseInt(householdSize),
        housingStatus,
      });
    } else if (currentStep === 2) {
      const goals = selectedGoals.map(id => {
        const goal = goalOptions.find(g => g.id === id);
        return {
          id,
          name: goal?.name || '',
          icon: goal?.id || '',
          description: goal?.description || '',
          targetAmount: parseFloat(goalAmounts[id]) || 0,
          savedAmount: 0,
        };
      });
      updateData({ selectedGoals: goals });
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      navigate('/loading');
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const toggleGoal = (id: string) => {
    if (selectedGoals.includes(id)) {
      setSelectedGoals(prev => prev.filter(g => g !== id));
      const newAmounts = { ...goalAmounts };
      delete newAmounts[id];
      setGoalAmounts(newAmounts);
    } else if (selectedGoals.length < 3) {
      setSelectedGoals(prev => [...prev, id]);
    }
  };

  // Auto-scroll to continue button when on goals step and goals are selected
  useEffect(() => {
    if (currentStep === 2 && selectedGoals.length > 0 && continueButtonRef.current) {
      const timer = setTimeout(() => {
        continueButtonRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'end',
          inline: 'nearest'
        });
      }, 300); // Small delay to allow animation to complete
      return () => clearTimeout(timer);
    }
  }, [currentStep, selectedGoals.length]);


  const getPennyMessage = (): string => {
    switch (currentStep) {
      case 0:
        if (calculateHourlyRate() > 0) {
          return `Nice! That's $${calculateHourlyRate().toFixed(2)} per hour of your life. Let's make every hour count!`;
        }
        return "Hey there! I'm Penny!";
      case 1:
        return "Tell me a bit about yourself so I can find your Financial Twin—people with similar profiles.";
      case 2:
        if (selectedGoals.length > 0) {
          const goalName = goalOptions.find(g => g.id === selectedGoals[selectedGoals.length - 1])?.name;
          return `Ooh, ${goalName}! Great choice! ${selectedGoals.length === 3 ? "That's the max—let's focus!" : 'Pick up to 3 goals.'}`;
        }
        return "What are we working toward? Pick 1-3 goals and I'll help you get there!";
      case 3:
        return "Last step! Let's see where your money's been going. Don't worry—I keep secrets better than a vault.";
      default:
        return "Let's do this!";
    }
  };

  const renderAnimatedMessage = () => {
    const message = getPennyMessage();
    const parts = message.split("Penny");

    return (
      <span className="inline-flex flex-wrap items-baseline">
        {parts.map((part, i, arr) => {
          if (i < arr.length - 1) {
            return (
              <span key={i} className="inline-flex items-baseline">
                <VerticalCutReveal
                  splitBy="words"
                  staggerDuration={0.05}
                  staggerFrom="first"
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 21,
                    delay: i * 0.3,
                  }}
                  containerClassName="inline-flex"
                >
                  {part}
                </VerticalCutReveal>
                <VerticalCutReveal
                  splitBy="characters"
                  staggerDuration={0.03}
                  staggerFrom="first"
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 21,
                    delay: (i * 0.3) + 0.2,
                  }}
                  containerClassName="inline-flex"
                  elementLevelClassName="text-accent font-black"
                >
                  Penny
                </VerticalCutReveal>
              </span>
            );
          }
          return (
            <VerticalCutReveal
              key={i}
              splitBy="words"
              staggerDuration={0.05}
              staggerFrom="first"
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 21,
                delay: i * 0.3,
              }}
              containerClassName="inline-flex"
            >
              {part}
            </VerticalCutReveal>
          );
        })}
      </span>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            {/* Income type toggle */}
            <div className="flex p-1 bg-muted/50 rounded-full border-2 border-border/10">
              <button
                onClick={() => setIncomeType('salary')}
                className={`flex-1 py-3 px-6 rounded-full font-bold transition-all border-2 ${incomeType === 'salary'
                    ? 'bg-primary text-primary-foreground border-primary shadow-neo-sm transform -translate-y-[1px]'
                    : 'text-muted-foreground border-transparent hover:text-foreground'
                  }`}
              >
                Salary
              </button>
              <button
                onClick={() => setIncomeType('hourly')}
                className={`flex-1 py-3 px-6 rounded-full font-bold transition-all border-2 ${incomeType === 'hourly'
                    ? 'bg-primary text-primary-foreground border-primary shadow-neo-sm transform -translate-y-[1px]'
                    : 'text-muted-foreground border-transparent hover:text-foreground'
                  }`}
              >
                Hourly
              </button>
            </div>

            {incomeType === 'salary' ? (
              <div className="space-y-6">
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block font-bold">
                    What's your annual salary?
                  </Label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">$</span>
                    <Input
                      type="number"
                      placeholder="85,000"
                      value={salary}
                      onChange={e => setSalary(e.target.value)}
                      className="pl-8 h-14 text-lg bg-white border-2 border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary shadow-sm transition-all"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block font-bold">
                    Pay Frequency
                  </Label>
                  <Select value={payFrequency} onValueChange={setPayFrequency}>
                    <SelectTrigger className="h-14 bg-white border-2 border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary shadow-sm transition-all font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly (52 times a year)</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly (26 times a year)</SelectItem>
                      <SelectItem value="monthly">Monthly (12 times a year)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block font-bold">
                    Hourly Rate
                  </Label>
                  <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">$</span>
                    <Input
                      type="number"
                      placeholder="25"
                      value={hourlyRate}
                      onChange={e => setHourlyRate(e.target.value)}
                      className="pl-8 h-14 text-lg bg-white border-2 border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary shadow-sm transition-all"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block font-bold">
                    Hours per Week
                  </Label>
                  <Input
                    type="number"
                    placeholder="40"
                    value={hoursPerWeek}
                    onChange={e => setHoursPerWeek(e.target.value)}
                    className="h-14 text-lg bg-white border-2 border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary shadow-sm transition-all"
                  />
                </div>
              </div>
            )}

            {/* Live calculation */}
            {calculateHourlyRate() > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-muted/30 rounded-2xl border-2 border-border/10"
              >
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-2">Live Calculation</p>
                <p className="text-foreground text-lg font-medium">
                  1 hour of your life = <span className="text-3xl font-black text-accent ml-2">${calculateHourlyRate().toFixed(2)}</span>
                </p>
              </motion.div>
            )}
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block font-bold">Age</Label>
              <Input
                type="number"
                placeholder="28"
                value={age}
                onChange={e => setAge(e.target.value)}
                className="h-14 text-lg bg-white border-2 border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary shadow-sm transition-all"
              />
            </div>

            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block font-bold">City</Label>
              <Input
                type="text"
                placeholder="San Francisco"
                value={city}
                onChange={e => setCity(e.target.value)}
                className="h-14 text-lg bg-white border-2 border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary shadow-sm transition-all"
              />
            </div>

            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block font-bold">Household Size</Label>
              <Select value={householdSize} onValueChange={setHouseholdSize}>
                <SelectTrigger className="h-14 bg-white border-2 border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary shadow-sm transition-all font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Just me</SelectItem>
                  <SelectItem value="2">2 people</SelectItem>
                  <SelectItem value="3">3 people</SelectItem>
                  <SelectItem value="4">4 people</SelectItem>
                  <SelectItem value="5">5+ people</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block font-bold">Housing Status</Label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'rent', label: 'Renting' },
                  { value: 'own', label: 'Own' },
                  { value: 'family', label: 'With Family' },
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setHousingStatus(option.value as 'rent' | 'own' | 'family')}
                    className={`p-4 rounded-xl text-sm font-bold transition-all border-2 ${housingStatus === option.value
                        ? 'bg-primary text-primary-foreground border-primary shadow-neo-sm transform -translate-y-[1px]'
                        : 'bg-white text-foreground border-border/20 hover:border-primary/50 hover:bg-muted/30'
                      }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <p className="text-sm text-secondary font-medium">Select 1-3 goals</p>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${selectedGoals.length > 0 ? 'bg-accent-light text-accent' : 'bg-muted text-muted-foreground'}`}>
                {selectedGoals.length}/3 selected
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {goalOptions.map((goal, index) => {
                const isSelected = selectedGoals.includes(goal.id);
                const isDisabled = !isSelected && selectedGoals.length >= 3;
                const IconComponent = goal.icon;
                const isCustom = goal.id === 'custom';

                return (
                  <motion.div
                    key={goal.id}
                    whileHover={{ scale: isDisabled ? 1 : 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={isCustom ? "col-span-2" : ""}
                  >
                    <Card
                      className={`p-5 cursor-pointer transition-all duration-200 h-full flex flex-col justify-between ${isSelected
                          ? 'bg-accent-light border-2 border-primary shadow-neo-sm'
                          : isDisabled
                            ? 'opacity-50 cursor-not-allowed bg-muted border border-border/10'
                            : isCustom
                              ? 'bg-white border-2 border-dashed border-border/30 hover:border-primary hover:shadow-sm'
                              : 'bg-white border border-border/20 hover:border-primary/50 hover:shadow-sm'
                        }`}
                      onClick={() => !isDisabled && toggleGoal(goal.id)}
                    >
                      <div>
                        <div className="flex items-start justify-between mb-3">
                          <IconComponent className={`w-6 h-6 ${isSelected ? 'text-accent' : 'text-secondary'}`} strokeWidth={2.5} />
                          {isSelected && (
                            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-sm">
                              <Check className="w-3 h-3 text-white" strokeWidth={3} />
                            </div>
                          )}
                        </div>
                        <h3 className={`font-bold text-sm mb-1 ${isSelected ? 'text-primary' : 'text-foreground'}`}>{goal.name}</h3>
                        <p className="text-xs text-secondary leading-tight">{goal.description}</p>
                      </div>

                      {isSelected && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          className="mt-4 pt-3 border-t border-primary/10"
                        >
                          <div className="relative">
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 text-primary font-bold text-sm">$</span>
                            <Input
                              type="number"
                              placeholder="5,000"
                              value={goalAmounts[goal.id] || ''}
                              onChange={e => setGoalAmounts(prev => ({ ...prev, [goal.id]: e.target.value }))}
                              onClick={e => e.stopPropagation()}
                              style={{ paddingLeft: '2.5rem' }}
                              className="h-8 text-sm bg-transparent border-0 border-b-2 border-primary/30 rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary placeholder:text-muted-foreground/50 font-medium"
                            />
                          </div>
                        </motion.div>
                      )}
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-5">
            <div className="grid gap-5">
              <Card className="p-6 cursor-pointer hover:bg-muted/10 transition-all border-2 border-border/10 bg-white hover:border-primary/50 hover:shadow-neo-sm group">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 border-2 border-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Building2 className="w-7 h-7 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">Connect with Plaid</h3>
                    <p className="text-sm text-muted-foreground">Secure bank-level encryption</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Card>

              <Card
                className="p-6 cursor-pointer hover:bg-muted/10 transition-all border-2 border-border/10 bg-white hover:border-primary/50 hover:shadow-neo-sm group"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".csv"
                  className="hidden"
                />
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-secondary/10 border-2 border-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="w-7 h-7 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg mb-1">Upload Statements</h3>
                    <p className="text-sm text-muted-foreground">CSV or PDF bank statements</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Card>

              <button
                onClick={handleNext}
                className="text-center text-muted-foreground hover:text-primary font-medium text-sm mt-4 underline decoration-2 underline-offset-4 decoration-transparent hover:decoration-primary/30 transition-all"
              >
                Skip for now — I'll use sample data
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Header */}
      <header className="px-6 py-4 lg:px-12 flex items-center justify-between border-b-2 border-border bg-white z-50 sticky top-0">
        <div className="flex items-center gap-3">
          <span className="font-black text-xl tracking-tight">Penny</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3">
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-bold">
              Step {currentStep + 1} of {steps.length}
            </span>
            <Progress value={progress} className="w-32 h-2 rounded-full border border-border/20 bg-muted" />
            <span className="text-xs font-bold text-primary">{Math.round(progress)}%</span>
          </div>
        </div>

        <button
          onClick={() => navigate('/')}
          className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors border-b-2 border-transparent hover:border-accent"
        >
          Save & Exit
        </button>
      </header>

      {/* Main Content - Two Column Layout */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-6xl mx-auto w-full items-center justify-center p-6 lg:p-0">

        {/* Left Column - Penny */}
        <div className="lg:w-[35%] w-full flex flex-col justify-center items-center lg:items-end lg:pr-12 mb-8 lg:mb-0">
          <div className="max-w-[320px] w-full flex flex-col items-center">
            {/* Speech Bubble */}
            <motion.div
              className="relative bg-white rounded-2xl p-5 border-2 border-primary shadow-neo-sm mb-5 w-full bubble-tail-bottom z-10"
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.1 }}
              key={currentStep}
            >
              <p className="text-foreground font-medium text-lg leading-relaxed">
                <span className="inline-block">
                  {renderAnimatedMessage()}
                </span>
              </p>

              {/* Bubble Tail pseudo-element simulated with div for better control */}
              <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-5 h-5 bg-white border-b-2 border-r-2 border-primary rotate-45"></div>
            </motion.div>

            {/* Penny Mascot */}
            <motion.div
              className="relative w-36 h-36 flex items-center justify-center z-20"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            >
              <div className="absolute inset-0 bg-muted/20 rounded-full scale-90 blur-xl -z-10"></div>
              <motion.img
                src={pennyPointing}
                alt="Penny"
                className="w-full h-full object-contain drop-shadow-xl"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />
            </motion.div>
          </div>
        </div>

        {/* Right Column - Form Card */}
        <div className="lg:w-[65%] w-full flex items-center justify-center lg:justify-start lg:pl-4">
          <Card className="w-full max-w-xl p-8 lg:p-10 bg-white border-2 border-primary shadow-neo rounded-[2rem]">
            {/* Step Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-black mb-2 tracking-tight">{stepTitles[currentStep].title}</h1>
              <p className="text-secondary font-medium text-lg">{stepTitles[currentStep].subtitle}</p>
            </div>

            {/* Mobile Progress */}
            <div className="sm:hidden mb-8">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="uppercase tracking-wider text-muted-foreground font-bold">
                  Step {currentStep + 1} of {steps.length}
                </span>
                <span className="font-bold text-primary">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2 rounded-full" />
            </div>

            {/* Step Content */}
            <div className="min-h-[320px]">
              {isMounted && (
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    {renderStepContent()}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>

            {/* Navigation */}
            <div className="mt-10 flex gap-4">
              {currentStep > 0 && (
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="h-14 px-8 rounded-xl border-2 border-border font-bold hover:bg-muted/50 hover:border-primary/50 text-base"
                >
                  Back
                </Button>
              )}
              <Button
                ref={continueButtonRef}
                onClick={handleNext}
                className="flex-1 h-14 text-lg font-bold rounded-xl bg-primary text-primary-foreground border-2 border-primary shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neo-sm transition-all"
                disabled={
                  (currentStep === 0 && calculateHourlyRate() <= 0) ||
                  (currentStep === 2 && selectedGoals.length === 0)
                }
              >
                {currentStep === steps.length - 1 ? (
                  'Analyze My Finances'
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-5 h-5 ml-2" strokeWidth={3} />
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
