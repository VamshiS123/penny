import { motion } from 'framer-motion';
import { PennyMascot } from '@/components/PennyMascot';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Sparkles, Clock, DollarSign } from 'lucide-react';

export function PennyAICard() {
    return (
        <div className="relative w-full max-w-md mx-auto">
            {/* Decorative background elements */}
            <div className="absolute inset-0 bg-accent/5 rounded-full blur-3xl -z-10 transform scale-150" />
            <div className="absolute -top-6 -right-6 w-12 h-12 bg-accent/20 rounded-full blur-xl animate-pulse" />
            <div className="absolute -bottom-8 -left-8 w-16 h-16 bg-primary/5 rounded-full blur-xl" />

            {/* Main Card with Float Animation */}
            <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            >
                <Card className="relative overflow-hidden border-2 border-border shadow-neo bg-card p-6">
                    {/* Header with Mascot */}
                    <div className="flex flex-col items-center mb-6">
                        <div className="relative mb-4">
                            <div className="absolute inset-0 bg-accent/10 rounded-full blur-lg transform scale-110" />
                            <PennyMascot mood="waving" size="lg" />
                        </div>

                        <Badge
                            variant="outline"
                            className="bg-accent-light text-accent border-2 border-accent shadow-neo-sm px-3 py-1 font-bold tracking-wide"
                        >
                            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                            PENNY AI ASSISTANT
                        </Badge>
                    </div>

                    {/* Chat Bubble */}
                    <div className="relative bg-muted border-2 border-border p-4 rounded-xl rounded-tr-none mb-6 shadow-neo-sm">
                        <p className="text-sm font-medium italic text-foreground leading-relaxed">
                            "That coffee cost you <span className="text-accent font-bold">15 minutes</span> of work, Dave. Is it worth the caffeine rush?"
                        </p>
                        {/* Bubble Tail */}
                        <div className="absolute -top-3 right-6 w-6 h-6 bg-muted border-t-2 border-l-2 border-border transform rotate-45 z-10" />
                        {/* Tail Cover to hide bottom border of tail */}
                        <div className="absolute -top-1.5 right-6 w-8 h-4 bg-muted z-20" />
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-background border-2 border-border rounded-lg p-3 text-center shadow-neo-sm">
                            <div className="flex items-center justify-center gap-1.5 text-xs text-secondary font-bold mb-1 uppercase tracking-wider">
                                <DollarSign className="w-3.5 h-3.5" />
                                Coffee Spend
                            </div>
                            <p className="text-2xl font-black text-foreground">$5.50</p>
                        </div>

                        <div className="bg-background border-2 border-border rounded-lg p-3 text-center shadow-neo-sm">
                            <div className="flex items-center justify-center gap-1.5 text-xs text-secondary font-bold mb-1 uppercase tracking-wider">
                                <Clock className="w-3.5 h-3.5 text-accent" />
                                Time Worked
                            </div>
                            <p className="text-2xl font-black text-accent">12 mins</p>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* Floating Elements (Coins/Clocks) */}
            <motion.div
                className="absolute -right-4 top-1/4 bg-accent text-white p-2 rounded-full border-2 border-border shadow-neo-sm"
                animate={{ y: [0, -15, 0], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: 1 }}
            >
                <Clock className="w-5 h-5" />
            </motion.div>

            <motion.div
                className="absolute -left-2 bottom-1/3 bg-white text-primary p-2 rounded-full border-2 border-border shadow-neo-sm"
                animate={{ y: [0, 10, 0], rotate: [0, -5, 5, 0] }}
                transition={{ duration: 5, repeat: Infinity, delay: 0.5 }}
            >
                <DollarSign className="w-5 h-5" />
            </motion.div>
        </div>
    );
}
