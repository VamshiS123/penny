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
        return "Tell me a bit about yourself so I can find your Financial Twin—people like you.";
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
                  elementLevelClassName="text-primary font-bold"
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
          <motion.div
            key="income"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Income type toggle */}
            <div className="flex p-1 bg-muted/50 rounded-full">
              <button
                onClick={() => setIncomeType('salary')}
                className={`flex-1 py-3 px-6 rounded-full font-medium transition-all ${
                  incomeType === 'salary' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Salary
              </button>
              <button
                onClick={() => setIncomeType('hourly')}
                className={`flex-1 py-3 px-6 rounded-full font-medium transition-all ${
                  incomeType === 'hourly' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Hourly
              </button>
            </div>

            {incomeType === 'salary' ? (
              <div className="space-y-5">
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
                    What's your annual salary?
                  </Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      type="number"
                      placeholder="85,000"
                      value={salary}
                      onChange={e => setSalary(e.target.value)}
                      className="pl-8 h-14 text-lg bg-muted/50 border-0 rounded-xl"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
                    Pay Frequency
                  </Label>
                  <Select value={payFrequency} onValueChange={setPayFrequency}>
                    <SelectTrigger className="h-14 bg-muted/50 border-0 rounded-xl">
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
              <div className="space-y-5">
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
                    Hourly Rate
                  </Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      type="number"
                      placeholder="25"
                      value={hourlyRate}
                      onChange={e => setHourlyRate(e.target.value)}
                      className="pl-8 h-14 text-lg bg-muted/50 border-0 rounded-xl"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">
                    Hours per Week
                  </Label>
                  <Input
                    type="number"
                    placeholder="40"
                    value={hoursPerWeek}
                    onChange={e => setHoursPerWeek(e.target.value)}
                    className="h-14 text-lg bg-muted/50 border-0 rounded-xl"
                  />
                </div>
              </div>
            )}

            {/* Live calculation */}
            {calculateHourlyRate() > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 bg-primary/10 rounded-2xl border border-primary/20"
              >
                <p className="text-xs uppercase tracking-wider text-primary font-semibold mb-1">Live Calculation</p>
                <p className="text-foreground">
                  1 hour of your life = <span className="text-2xl font-bold text-primary">${calculateHourlyRate().toFixed(2)}</span>
                </p>
              </motion.div>
            )}
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            key="about"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-5"
          >
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Age</Label>
              <Input
                type="number"
                placeholder="28"
                value={age}
                onChange={e => setAge(e.target.value)}
                className="h-14 text-lg bg-muted/50 border-0 rounded-xl"
              />
            </div>

            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">City</Label>
              <Input
                type="text"
                placeholder="San Francisco"
                value={city}
                onChange={e => setCity(e.target.value)}
                className="h-14 text-lg bg-muted/50 border-0 rounded-xl"
              />
            </div>

            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Household Size</Label>
              <Select value={householdSize} onValueChange={setHouseholdSize}>
                <SelectTrigger className="h-14 bg-muted/50 border-0 rounded-xl">
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
              <Label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Housing Status</Label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'rent', label: 'Renting' },
                  { value: 'own', label: 'Own' },
                  { value: 'family', label: 'With Family' },
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => setHousingStatus(option.value as 'rent' | 'own' | 'family')}
                    className={`p-4 rounded-xl text-sm font-medium transition-all ${
                      housingStatus === option.value
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted/50 hover:bg-muted text-foreground'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="goals"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <p className="text-sm text-muted-foreground">Select 1-3 goals ({selectedGoals.length}/3 selected)</p>
            <div className="grid grid-cols-2 gap-3">
              {goalOptions.map(goal => {
                const isSelected = selectedGoals.includes(goal.id);
                const isDisabled = !isSelected && selectedGoals.length >= 3;
                const IconComponent = goal.icon;
                
                return (
                  <motion.div key={goal.id} whileHover={{ scale: isDisabled ? 1 : 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Card
                      className={`p-4 cursor-pointer transition-all border-0 ${
                        isSelected 
                          ? 'bg-primary/20 ring-2 ring-primary' 
                          : isDisabled 
                            ? 'opacity-50 cursor-not-allowed bg-muted/50' 
                            : 'bg-muted/50 hover:bg-muted'
                      }`}
                      onClick={() => !isDisabled && toggleGoal(goal.id)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <IconComponent className="w-6 h-6" />
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-3 h-3 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                      <h3 className="font-semibold text-sm">{goal.name}</h3>
                      <p className="text-xs text-muted-foreground">{goal.description}</p>
                      
                      {isSelected && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          className="mt-3"
                        >
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                            <Input
                              type="number"
                              placeholder="5,000"
                              value={goalAmounts[goal.id] || ''}
                              onChange={e => setGoalAmounts(prev => ({ ...prev, [goal.id]: e.target.value }))}
                              onClick={e => e.stopPropagation()}
                              className="pl-7 h-9 text-sm bg-background/50 border-0 rounded-lg"
                            />
                          </div>
                        </motion.div>
                      )}
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="connect"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="grid gap-4">
              <Card className="p-5 cursor-pointer hover:bg-muted/30 transition-all border-0 bg-muted/50 group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Connect with Plaid</h3>
                    <p className="text-sm text-muted-foreground">Secure bank-level encryption</p>
                  </div>
                </div>
              </Card>

              <Card 
                className="p-5 cursor-pointer hover:bg-muted/30 transition-all border-0 bg-muted/50 group"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".csv"
                  className="hidden"
                />
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                    <Upload className="w-6 h-6 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">Upload Statements</h3>
                    <p className="text-sm text-muted-foreground">CSV or PDF bank statements</p>
                  </div>
                </div>
              </Card>

              <button 
                onClick={handleNext}
                className="text-center text-muted-foreground hover:text-foreground text-sm mt-2"
              >
                Skip for now — I'll use sample data
              </button>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-4 lg:px-8 flex items-center justify-between border-b border-border/50">
        <div className="flex items-center gap-3">
          <span className="font-display font-bold text-lg">Penny</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </span>
            <Progress value={progress} className="w-24 h-1.5" />
            <span className="text-xs font-medium text-primary">{Math.round(progress)}% Complete</span>
          </div>
        </div>

        <button 
          onClick={() => navigate('/')}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Save & Exit
        </button>
      </header>

      {/* Main Content - Two Column Layout */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left Column - Penny */}
        <div className="lg:w-1/2 p-6 lg:p-12 flex flex-col justify-center items-center lg:items-start">
          {/* Speech Bubble */}
          <motion.div
            className="relative bg-card rounded-2xl p-5 shadow-card border border-border max-w-md mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={currentStep}
          >
            <p className="text-foreground font-medium text-lg">
              <span className="inline-block whitespace-nowrap">
                {renderAnimatedMessage()}
              </span>
            </p>
          </motion.div>

          {/* Penny Mascot */}
          <motion.div 
            className="relative w-48 h-48 flex items-center justify-center"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <motion.img 
              src={pennyPointing} 
              alt="Penny" 
              className="w-full h-full object-contain drop-shadow-xl"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
        </div>

        {/* Right Column - Form Card */}
        <div className="lg:w-1/2 p-6 lg:p-12 flex items-center justify-center">
          <Card className="w-full max-w-md p-8 bg-card/80 backdrop-blur border-border/50 rounded-3xl shadow-xl">
            {/* Step Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-display font-bold mb-2">{stepTitles[currentStep].title}</h1>
              <p className="text-muted-foreground">{stepTitles[currentStep].subtitle}</p>
            </div>

            {/* Mobile Progress */}
            <div className="sm:hidden mb-6">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="uppercase tracking-wider text-muted-foreground">
                  Step {currentStep + 1} of {steps.length}
                </span>
                <span className="font-medium text-primary">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>

            {/* Step Content */}
            <div className="min-h-[300px]">
              <AnimatePresence mode="wait">
                {renderStepContent()}
              </AnimatePresence>
            </div>

            {/* Navigation */}
            <div className="mt-8 flex gap-3">
              {currentStep > 0 && (
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="h-14 px-6 rounded-xl"
                >
                  Back
                </Button>
              )}
              <Button
                ref={continueButtonRef}
                onClick={handleNext}
                className="flex-1 h-14 text-lg font-semibold rounded-xl btn-gradient-primary"
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
                    <ArrowRight className="w-5 h-5 ml-2" />
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
