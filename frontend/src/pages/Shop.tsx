import { useState } from 'react';
import { motion } from 'framer-motion';
import { useFinance, ShopItem } from '@/contexts/FinanceContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PennyMascot } from '@/components/PennyMascot';
import { Coins, Check, Star, Sparkles, Shirt, Palette, Smile, LayoutGrid, Flame, ShoppingBag, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import pennyTopHat from '@/assets/penny-tophat.png';

const rarityColors: Record<string, string> = {
  common: 'bg-muted text-muted-foreground',
  rare: 'bg-primary/20 text-primary',
  legendary: 'bg-secondary/20 text-secondary',
};

export default function Shop() {
  const { data, purchaseItem, shopCatalog } = useFinance();
  const [selectedCategory, setSelectedCategory] = useState('outfit');

  const handlePurchase = (item: ShopItem) => {
    if (data.ownedItems.find(i => i.id === item.id)) {
      toast.info('You already own this item!');
      return;
    }
    
    if (data.coins < item.price) {
      toast.error("Not enough coins! Keep completing challenges to earn more.");
      return;
    }

    const success = purchaseItem(item);
    if (success) {
      toast.success(`You bought ${item.name}! 🎉`);
    }
  };

  const filteredItems = shopCatalog.filter(item => item.category === selectedCategory);
  const ownedItemIds = data.ownedItems.map(i => i.id);

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold mb-2">Penny's Shop</h1>
            <p className="text-muted-foreground">Spend your hard-earned rewards!</p>
          </div>
          
          {/* Coins balance */}
          <motion.div
            className="flex items-center gap-2 px-4 py-2 bg-secondary/20 rounded-full"
            whileHover={{ scale: 1.05 }}
          >
            <Coins className="w-5 h-5 text-secondary" />
            <span className="font-bold text-lg">{data.coins}</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Penny shopkeeper */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-4 mb-8 p-4 bg-accent rounded-2xl"
      >
        <img 
          src={pennyTopHat} 
          alt="Penny" 
          className="w-24 h-24 object-contain flex-shrink-0"
        />
        <div className="bg-card rounded-xl p-3 shadow-card relative">
          <div className="absolute -left-2 top-4 w-4 h-4 bg-card rotate-45" />
          <p className="font-medium relative z-10 flex items-center gap-2">
            Welcome! Spend your hard-earned rewards on cool stuff!
            <ShoppingBag className="w-4 h-4 text-primary" />
            <Sparkles className="w-4 h-4 text-secondary" />
          </p>
        </div>
      </motion.div>

      {/* Category tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="grid grid-cols-5 w-full mb-6">
          <TabsTrigger value="outfit" className="font-medium gap-1.5">
            <Shirt className="w-4 h-4" /> Outfits
          </TabsTrigger>
          <TabsTrigger value="theme" className="font-medium gap-1.5">
            <Palette className="w-4 h-4" /> Themes
          </TabsTrigger>
          <TabsTrigger value="expression" className="font-medium gap-1.5">
            <Smile className="w-4 h-4" /> Expressions
          </TabsTrigger>
          <TabsTrigger value="widget" className="font-medium gap-1.5">
            <LayoutGrid className="w-4 h-4" /> Widgets
          </TabsTrigger>
          <TabsTrigger value="streak" className="font-medium gap-1.5">
            <Flame className="w-4 h-4" /> Streaks
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item, index) => {
              const isOwned = ownedItemIds.includes(item.id);
              
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`p-4 hover:shadow-card-hover transition-all ${isOwned ? 'bg-success/5 border-success/30' : ''}`}>
                    {/* Rarity badge */}
                    <div className="flex justify-between items-start mb-3">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full capitalize ${rarityColors[item.rarity]}`}>
                        {item.rarity}
                      </span>
                      {item.rarity === 'legendary' && (
                        <Sparkles className="w-4 h-4 text-secondary animate-sparkle" />
                      )}
                    </div>

                    {/* Item preview */}
                    <div className="h-24 flex items-center justify-center bg-muted rounded-xl mb-3">
                      {item.category === 'outfit' && <PennyMascot mood="default" size="lg" />}
                      {item.category === 'theme' && (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary" />
                      )}
                      {item.category === 'expression' && <PennyMascot mood="celebrating" size="lg" />}
                      {item.category === 'widget' && (
                        <div className="w-full h-full bg-card rounded-lg p-2 flex items-center justify-center">
                          <BarChart3 className="w-8 h-8 text-primary" />
                        </div>
                      )}
                      {item.category === 'streak' && (
                        <Flame className="w-10 h-10 text-secondary" />
                      )}
                    </div>

                    {/* Item info */}
                    <h3 className="font-display font-bold mb-1">{item.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{item.description}</p>

                    {/* Price & action */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Coins className="w-4 h-4 text-secondary" />
                        <span className="font-bold">{item.price}</span>
                      </div>
                      
                      {isOwned ? (
                        <Button size="sm" variant="outline" disabled className="gap-1">
                          <Check className="w-4 h-4" />
                          Owned
                        </Button>
                      ) : (
                        <Button 
                          size="sm" 
                          className={data.coins >= item.price ? 'btn-gradient-primary' : ''}
                          disabled={data.coins < item.price}
                          onClick={() => handlePurchase(item)}
                        >
                          Buy
                        </Button>
                      )}
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Penny's picks section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-12"
      >
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-5 h-5 text-secondary" />
          <h2 className="text-xl font-display font-bold">Penny's Picks</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {shopCatalog.filter(i => i.rarity === 'legendary').slice(0, 3).map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + index * 0.1 }}
            >
              <Card className="p-4 border-2 border-secondary/30 bg-gradient-to-br from-secondary/5 to-transparent">
                <div className="flex items-center gap-3 mb-2">
                  <Sparkles className="w-4 h-4 text-secondary" />
                  <span className="text-xs font-medium text-secondary">Featured</span>
                </div>
                <h3 className="font-display font-bold">{item.name}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
                <div className="flex items-center gap-1 mt-2">
                  <Coins className="w-4 h-4 text-secondary" />
                  <span className="font-bold">{item.price}</span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
