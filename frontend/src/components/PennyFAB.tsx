import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PennyMascot } from './PennyMascot';
import { X, Lightbulb, TrendingUp, AlertTriangle, Send, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollVelocity } from '@/components/ui/scroll-velocity';
import pennyQuestions from '@/assets/penny-questions.png';

const insights = [
  {
    type: 'tip',
    icon: Lightbulb,
    message: "You've spent 20% less on dining this week! 🎉",
    color: 'text-success bg-success/10',
  },
  {
    type: 'alert',
    icon: AlertTriangle,
    message: "Spotify charged $2 more this month—price increase?",
    color: 'text-warning bg-warning/10',
  },
  {
    type: 'trend',
    icon: TrendingUp,
    message: "Your coffee spending is down. That's $15 saved!",
    color: 'text-primary bg-primary/10',
  },
];

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const initialMessages: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: "Hey there! 👋 I'm Penny, your budget buddy. I've been keeping an eye on your spending and have some insights for you above! What would you like to chat about today?",
    timestamp: new Date(),
  },
];

export function PennyFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate Penny's response (in a real app, this would call an AI API)
    setTimeout(() => {
      const responses = [
        "That's a great question! Based on your spending patterns, I'd suggest setting aside about 20% of your income for savings. Would you like me to help you create a savings plan?",
        "I noticed you've been doing really well with your budget this month! Keep it up! 🎉 Is there anything specific you'd like to work on?",
        "Looking at your transactions, I see some opportunities to save. Want me to analyze your subscriptions for any you might not be using?",
        "Great thinking! Your financial twin comparison shows you're in the top 30% for savings. Let me know if you want tips to climb even higher!",
      ];

      const pennyResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, pennyResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* FAB Button */}
      <motion.button
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/80 shadow-glow flex items-center justify-center z-50 overflow-hidden"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        animate={{
          y: [0, -5, 0],
        }}
        transition={{
          y: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
        }}
      >
        <img 
          src={pennyQuestions} 
          alt="Penny" 
          className="w-14 h-14 object-contain"
        />
        
        {/* Notification badge */}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-secondary text-secondary-foreground text-xs font-bold rounded-full flex items-center justify-center">
            {insights.length}
          </span>
        )}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Chat Container */}
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.9 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-24 right-6 w-96 h-[600px] max-h-[80vh] bg-card rounded-3xl shadow-xl border border-border z-50 overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary/5 to-secondary/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center overflow-hidden">
                    <img src={pennyQuestions} alt="Penny" className="w-9 h-9 object-contain" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold">Chat with Penny</h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                      <span>Online</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Insights Section */}
              <div className="p-3 border-b border-border bg-muted/30">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-secondary" />
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Latest Insights</span>
                </div>
                <div className="overflow-hidden pb-1">
                  <ScrollVelocity 
                    velocity={-3} 
                    className="text-xs leading-normal tracking-normal"
                  >
                    {[...insights, ...insights, ...insights].map((insight, index) => (
                      <div
                        key={`${index}-${insight.type}`}
                        className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap ${insight.color} mr-4 shrink-0`}
                      >
                        <insight.icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="max-w-[150px] truncate">{insight.message}</span>
                      </div>
                    ))}
                  </ScrollVelocity>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-muted rounded-bl-md'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </motion.div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex gap-1">
                        <motion.span
                          className="w-2 h-2 bg-muted-foreground rounded-full"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                        />
                        <motion.span
                          className="w-2 h-2 bg-muted-foreground rounded-full"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                        />
                        <motion.span
                          className="w-2 h-2 bg-muted-foreground rounded-full"
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-border bg-card">
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask Penny anything..."
                    className="flex-1 rounded-full bg-muted border-0 focus-visible:ring-primary"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!inputValue.trim()}
                    size="icon"
                    className="rounded-full btn-gradient-primary w-10 h-10"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
