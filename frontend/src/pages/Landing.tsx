import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PennyAICard } from '@/components/landing/PennyAICard';
import { PennyMascot } from '@/components/PennyMascot';
import {
  Calendar, Search, TrendingUp, Users,
  Landmark, Upload, CheckCircle, Shield, Lock,
  Sparkles, Globe, Share2, MessageSquare, Heart,
  Chrome, Bell, MousePointerClick, AlertTriangle, Clock
} from 'lucide-react';

const features = [
  {
    icon: Calendar,
    title: 'Money Calendar',
    description: 'A visual view of when bills are due and money is spent. Know exactly which days belong to you and which belong to your creditors.'
  },
  {
    icon: Search,
    title: 'Subscription Detective',
    description: 'Find and cancel hidden subscriptions draining your wallet. Our AI hunts down the "zombie" payments you forgot years ago.'
  },
  {
    icon: TrendingUp,
    title: 'Future You',
    description: 'Projections of wealth based on current spending habits. See how skipping that daily latte translates into retirement years.'
  },
  {
    icon: Users,
    title: 'Financial Twin',
    description: 'AI-driven comparisons help you optimize your budget. See how people with similar goals and income are saving.'
  },
];

const trustLogos = ['BANKSAFE', 'COSECURE', 'FINTECH.LY', 'SECUREPAY'];

// Custom component to render typewriter text with accent on "time"
function TypewriterTextWithAccent() {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  // Simulating video ended state for now as we don't have the video component here
  const [videoEnded, setVideoEnded] = useState(true);
  const fullText = "See where your time really goes";
  const speed = 50;

  useEffect(() => {
    if (currentIndex < fullText.length) {
      const timeout = setTimeout(() => {
        setDisplayText(fullText.slice(0, currentIndex + 1));
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, fullText]);

  // Split the text and apply accent color to "time"
  const renderText = () => {
    const parts = displayText.split(/(time)/i);
    return parts.map((part, index) => {
      if (part.toLowerCase() === 'time') {
        return <span key={index} className="text-accent">{part}</span>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <>
      {renderText()}
      {currentIndex < fullText.length && <span className="animate-pulse">|</span>}
    </>
  );
}

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background font-sans text-foreground overflow-x-hidden">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background border-b-2 border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight">Penny</span>
            </div>

            <div className="flex items-center gap-4">
              <span
                className="text-sm font-bold cursor-pointer hover:underline underline-offset-4 hidden sm:block"
                onClick={() => navigate('/login')}
              >
                Login
              </span>
              <Button
                onClick={() => navigate('/register')}
                className="bg-primary text-primary-foreground font-bold border-2 border-primary shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neo-sm transition-all rounded-md px-6"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left Column */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="z-10"
            >
              <Badge className="mb-6 bg-accent-light text-accent border-2 border-accent shadow-neo-sm hover:bg-accent-light px-3 py-1.5 rounded-full">
                <Sparkles className="w-3.5 h-3.5 mr-2 fill-accent" />
                Now with AI-Powered Forecasts
              </Badge>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] mb-6 tracking-tight">
                <TypewriterTextWithAccent />
              </h1>

              <p className="text-lg md:text-xl text-secondary mb-8 max-w-lg font-medium leading-relaxed">
                Penny is the AI budget companion that translates your spending into hours worked.
                Regain control of your finances and your time with a simple, smart dashboard.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground font-bold border-2 border-primary shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neo-sm transition-all h-14 px-8 text-base rounded-lg"
                  onClick={() => navigate('/register')}
                >
                  <Landmark className="w-5 h-5 mr-2" />
                  Connect Bank
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-2 border-primary font-bold shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neo-sm transition-all h-14 px-8 text-base rounded-lg"
                  onClick={() => navigate('/register')}
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Upload CSV
                </Button>
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-muted border-2 border-primary flex items-center justify-center font-bold text-xs shadow-sm z-0 hover:z-10 transition-all hover:-translate-y-1"
                      style={{ backgroundColor: i === 1 ? '#ffccbc' : i === 2 ? '#b3e5fc' : '#c8e6c9' }}
                    >
                      <span className="text-primary">{String.fromCharCode(64 + i)}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm font-medium text-secondary">
                  Joined by <span className="font-black text-primary border-b-2 border-accent/30">12,000+ users</span> this month
                </p>
              </div>
            </motion.div>

            {/* Right Column - App Preview Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative z-0"
            >
              {/* Optional: Add a subtle grid pattern behind the card */}
              <div className="absolute inset-0 bg-[radial-gradient(#e8773a_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.1] rounded-full mask-image-radial z-[-1]" />
              <PennyAICard />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-background border-t-2 border-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
              Features designed for your <span className="text-accent underline decoration-4 underline-offset-4 decoration-primary/20">future self</span>
            </h2>
            <p className="text-xl text-secondary max-w-2xl mx-auto leading-relaxed">
              Stop looking at numbers and start looking at freedom. Penny helps you visualize your
              financial health through the lens of your most valuable asset: time.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full border-2 border-primary shadow-neo hover:shadow-neo-lg hover:-translate-y-1 transition-all duration-300 p-6 rounded-xl bg-card">
                  <div className="w-14 h-14 rounded-lg bg-accent-light border-2 border-primary shadow-neo-sm flex items-center justify-center mb-6">
                    <feature.icon className="w-7 h-7 text-accent" strokeWidth={2.5} />
                  </div>
                  <h3 className="text-xl font-bold mb-3 tracking-tight">{feature.title}</h3>
                  <p className="text-secondary leading-relaxed">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* NEW: Chrome Extension Section */}
      <section className="py-24 bg-[#fdf8f4] border-t-2 border-primary overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Badge className="mb-6 bg-primary text-white border-2 border-primary shadow-neo-sm px-3 py-1.5 rounded-full font-bold">
                <Shield className="w-3.5 h-3.5 mr-2" />
                Proactive Protection
              </Badge>

              <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
                Penny warns you <span className="text-destructive decoration-wavy underline decoration-2">before</span> you overspend
              </h2>

              <p className="text-lg text-secondary mb-8 font-medium leading-relaxed">
                Our Chrome extension watches your browsing in real-time and gently nudges you when you're
                about to make a purchase that would break your budget. No more post-purchase regret.
              </p>

              <div className="space-y-4 mb-10">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-md bg-white border-2 border-primary flex items-center justify-center shadow-neo-sm shrink-0">
                    <Bell className="w-4 h-4 text-accent" strokeWidth={3} />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">Real-time spending alerts</h4>
                    <p className="text-secondary text-sm">Get notified while you shop online, before checkout.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-md bg-white border-2 border-primary flex items-center justify-center shadow-neo-sm shrink-0">
                    <Clock className="w-4 h-4 text-accent" strokeWidth={3} />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">Instant time-cost translation</h4>
                    <p className="text-secondary text-sm">See accurate 'hours-of-work' cost on any product page.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-md bg-white border-2 border-primary flex items-center justify-center shadow-neo-sm shrink-0">
                    <AlertTriangle className="w-4 h-4 text-accent" strokeWidth={3} />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">Smart budget guardrails</h4>
                    <p className="text-secondary text-sm">Penny learns your patterns and adapts tailored warnings.</p>
                  </div>
                </div>
              </div>

              <Button
                size="lg"
                className="bg-accent text-white border-2 border-primary shadow-neo hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-neo-sm hover:bg-accent/90 transition-all rounded-lg px-8 py-6 font-bold text-lg"
              >
                <Chrome className="w-6 h-6 mr-3" />
                Add to Chrome — It's Free
              </Button>
            </motion.div>

            {/* Right Visual Placeholder */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-[4/3] bg-white border-2 border-primary rounded-xl shadow-neo flex flex-col items-center justify-center relative overflow-hidden group">
                <div className="absolute inset-x-0 top-0 h-6 bg-muted border-b-2 border-primary flex items-center px-4 gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400 border border-primary/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400 border border-primary/50" />
                  <div className="w-3 h-3 rounded-full bg-green-400 border border-primary/50" />
                  <div className="ml-4 flex-1 h-3 bg-white border border-primary/20 rounded-full" />
                </div>

                {/* Placeholder Content */}
                <div className="text-center p-8 opacity-50 group-hover:opacity-100 transition-opacity">
                  {/* Simulating extension UI */}
                  <PennyMascot mood="concerned" size="lg" className="mx-auto mb-4" animate={false} />
                  <div className="bg-primary text-white p-3 rounded-lg border-2 border-primary/50 shadow-sm max-w-[200px] mx-auto mb-4">
                    <p className="text-xs font-bold">Wait! That's 4 hours of work.</p>
                  </div>
                  <p className="font-mono text-sm text-secondary italic mt-4">[ Extension Preview Screenshot ]</p>
                </div>

                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <Badge variant="outline" className="text-xs bg-muted border-primary text-secondary">
                    Chrome Extension Preview
                  </Badge>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-12 bg-white border-y-2 border-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-16 mb-8">
            {trustLogos.map((logo) => (
              <span key={logo} className="text-xl font-black text-primary/80 tracking-widest hover:text-accent cursor-default transition-colors">
                {logo}
              </span>
            ))}
          </div>
          <div className="flex justify-center items-center gap-6 text-sm font-bold text-secondary">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary" />
              AES-256 Bank Grade Encryption
            </div>
            <span className="text-primary/20">•</span>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              SOC2 Type II Compliant
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary relative overflow-hidden">
        {/* Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(45deg,#ffffff_1px,transparent_1px)] [background-size:24px_24px]" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {/* Decorative Penny */}
            <div className="absolute -top-16 -right-12 hidden lg:block opacity-20 rotate-12">
              <PennyMascot mood="celebrating" size="xl" animate={false} />
            </div>

            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
              Ready to see your <span className="text-accent relative inline-block">
                time
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-accent" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="3" fill="none" />
                </svg>
              </span> differently?
            </h2>

            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10 font-medium leading-relaxed">
              Join thousands of users converting their spending into freedom. It only takes
              60 seconds to link your bank and start saving hours every day.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-5">
              <Button
                size="lg"
                className="bg-accent text-white border-2 border-white/20 shadow-[4px_4px_0px_rgba(255,255,255,0.2)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all h-14 px-8 text-lg font-bold rounded-lg"
                onClick={() => navigate('/register')}
              >
                Start Your Free Trial
              </Button>
              <Button
                size="lg"
                className="bg-transparent text-white border-2 border-white shadow-none hover:bg-white/10 transition-all h-14 px-8 text-lg font-bold rounded-lg"
              >
                Watch Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t-2 border-primary pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            {/* Brand */}
            <div className="col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-2xl font-black tracking-tight">Penny</span>
              </div>
              <p className="text-secondary font-medium mb-6 leading-relaxed">
                Helping modern workers reclaim their time by simplifying financial decisions with AI and radical transparency.
              </p>
              <div className="flex gap-3">
                {[Globe, Share2, MessageSquare].map((Icon, i) => (
                  <Button key={i} variant="outline" size="icon" className="h-10 w-10 border-2 border-primary shadow-neo-sm hover:translate-y-[-2px] transition-transform rounded-md">
                    <Icon className="w-5 h-5 text-primary" />
                  </Button>
                ))}
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-bold text-lg mb-6">Product</h4>
              <ul className="space-y-3 font-medium text-secondary">
                <li><a href="#" className="hover:text-primary hover:underline underline-offset-4 decoration-2 decoration-accent transition-all">How it works</a></li>
                <li><a href="#" className="hover:text-primary hover:underline underline-offset-4 decoration-2 decoration-accent transition-all">Pricing</a></li>
                <li><a href="#" className="hover:text-primary hover:underline underline-offset-4 decoration-2 decoration-accent transition-all">Security</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-bold text-lg mb-6">Company</h4>
              <ul className="space-y-3 font-medium text-secondary">
                <li><a href="#" className="hover:text-primary hover:underline underline-offset-4 decoration-2 decoration-accent transition-all">About Us</a></li>
                <li><a href="#" className="hover:text-primary hover:underline underline-offset-4 decoration-2 decoration-accent transition-all">Careers</a></li>
                <li><a href="#" className="hover:text-primary hover:underline underline-offset-4 decoration-2 decoration-accent transition-all">Contact</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-bold text-lg mb-6">Legal</h4>
              <ul className="space-y-3 font-medium text-secondary">
                <li><a href="#" className="hover:text-primary hover:underline underline-offset-4 decoration-2 decoration-accent transition-all">Privacy</a></li>
                <li><a href="#" className="hover:text-primary hover:underline underline-offset-4 decoration-2 decoration-accent transition-all">Terms</a></li>
                <li><a href="#" className="hover:text-primary hover:underline underline-offset-4 decoration-2 decoration-accent transition-all">Cookies</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t-2 border-primary/10 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm font-bold text-secondary">
              © 2024 Penny AI Inc. All rights reserved.
            </p>
            <p className="text-sm font-bold text-secondary flex items-center gap-1.5 bg-muted px-3 py-1 rounded-full border border-primary/20">
              Designed with <Heart className="w-4 h-4 text-accent fill-accent" /> for better finance.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
