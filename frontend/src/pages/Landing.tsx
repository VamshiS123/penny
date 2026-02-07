import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { PennyMascot } from '@/components/PennyMascot';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, Calendar, Search, TrendingUp, Users, 
  Landmark, Upload, CheckCircle, Shield, Lock,
  Sparkles, Globe, Share2, MessageSquare, Heart
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

// Custom component to render typewriter text with gradient on "time"
function TypewriterTextWithGradient() {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [videoEnded, setVideoEnded] = useState(false);
  const fullText = "See where your time really goes";
  const speed = 80;

  // Check if intro video has completed
  useEffect(() => {
    // Check sessionStorage for video completion
    const checkVideoCompletion = () => {
      const completed = sessionStorage.getItem('introVideoCompleted');
      if (completed === 'true') {
        setVideoEnded(true);
      } else {
        // If not completed yet, check periodically
        const interval = setInterval(() => {
          const completed = sessionStorage.getItem('introVideoCompleted');
          if (completed === 'true') {
            setVideoEnded(true);
            clearInterval(interval);
          }
        }, 100);
        return () => clearInterval(interval);
      }
    };
    
    checkVideoCompletion();
  }, []);

  useEffect(() => {
    // Only start typing after video ends
    if (!videoEnded) {
      return;
    }

    if (currentIndex < fullText.length) {
      const timeout = setTimeout(() => {
        setDisplayText(fullText.slice(0, currentIndex + 1));
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, fullText, videoEnded]);

  // Split the text and apply gradient to "time"
  const renderText = () => {
    const parts = displayText.split(/(time)/i);
    return parts.map((part, index) => {
      if (part.toLowerCase() === 'time') {
        return <span key={index} className="gradient-text">{part}</span>;
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
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <span className="text-xl font-display font-bold">Penny</span>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" className="hidden sm:inline-flex" onClick={() => navigate('/login')}>Login</Button>
              <Button onClick={() => navigate('/register')} className="btn-gradient-primary">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-accent/30 to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">
                <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                Now with AI-Powered Forecasts
              </Badge>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-extrabold leading-tight mb-6">
                <TypewriterTextWithGradient />
              </h1>

              <p className="text-lg text-muted-foreground mb-8 max-w-lg">
                Penny is the AI budget companion that translates your spending into hours worked.
                Regain control of your finances and your time with a simple, smart dashboard.
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <Button
                  size="lg"
                  className="btn-gradient-primary gap-2"
                  onClick={() => navigate('/register')}
                >
                  <Landmark className="w-4 h-4" />
                  Connect Bank
                </Button>
                <Button size="lg" variant="outline" className="gap-2" onClick={() => navigate('/register')}>
                  <Upload className="w-4 h-4" />
                  Upload CSV
                </Button>
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center"
                    >
                      <span className="text-xs font-medium">{String.fromCharCode(64 + i)}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Joined by <span className="font-semibold text-foreground">12,000+</span> users this month
                </p>
              </div>
            </motion.div>

            {/* Right Column - App Preview Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <Card className="p-6 bg-card shadow-card-hover max-w-md mx-auto">
                <div className="flex justify-center mb-4">
                  <PennyMascot mood="waving" size="lg" />
                </div>

                <div className="text-center mb-4">
                  <Badge variant="outline" className="text-xs mb-3">
                    <Sparkles className="w-3 h-3 mr-1 text-primary" />
                    PENNY AI ASSISTANT
                  </Badge>
                  <p className="text-sm text-muted-foreground italic">
                    "That coffee cost you 15 minutes of work, Dave. Is it worth the caffeine rush?"
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Coffee Spend</p>
                    <p className="text-2xl font-bold">$5.50</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">Time Worked</p>
                    <p className="text-2xl font-bold text-primary">12 mins</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-28 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Features designed for your future self
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Stop looking at numbers and start looking at freedom. Penny helps you visualize your
              financial health through the lens of your most valuable asset: time.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6 h-full hover:shadow-card-hover transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-display font-bold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-12 bg-muted/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-16 mb-6">
            {trustLogos.map((logo) => (
              <span key={logo} className="text-sm font-bold text-muted-foreground tracking-wider">
                {logo}
              </span>
            ))}
          </div>
          <div className="flex justify-center items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-primary" />
              AES-256 Bank Grade Encryption
            </div>
            <span className="text-border">•</span>
            <div className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-primary" />
              SOC2 Type II Compliant
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-primary rounded-3xl p-10 lg:p-16 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-4">
              Ready to see your time differently?
            </h2>
            <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
              Join thousands of users converting their spending into freedom. It only takes
              60 seconds to link your bank and start saving hours every day.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                variant="secondary"
                className="font-semibold"
                onClick={() => navigate('/register')}
              >
                Start Your Free Trial
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/10"
              >
                Watch Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-xl font-display font-bold">Penny</span>
              </div>
              <p className="text-sm text-muted mb-4">
                Helping modern workers reclaim their time by simplifying financial decisions with AI and radical transparency.
              </p>
              <div className="flex gap-3">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted hover:text-background">
                  <Globe className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted hover:text-background">
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted hover:text-background">
                  <MessageSquare className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted">
                <li><a href="#" className="hover:text-background transition-colors">How it works</a></li>
                <li><a href="#" className="hover:text-background transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-background transition-colors">Security</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted">
                <li><a href="#" className="hover:text-background transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-background transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-background transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted">
                <li><a href="#" className="hover:text-background transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-background transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-background transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-muted/20 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted">
              © 2024 Penny AI Inc. All rights reserved.
            </p>
            <p className="text-sm text-muted flex items-center gap-1">
              Designed with <Heart className="w-3 h-3 text-destructive" /> for better finance.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
