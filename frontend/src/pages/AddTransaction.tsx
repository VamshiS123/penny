import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { 
  ArrowLeft, Calendar as CalendarIcon, 
  Store, Tag, DollarSign, Sparkles,
  Utensils, ShoppingBag, Car, Film, 
  Apple, Heart, Wrench, Plus, Check,
  Camera, Upload, X, Loader2, Trash2,
  ScanLine, Split, Receipt
} from 'lucide-react';

import { useFinance } from '@/contexts/FinanceContext';
import { analyzeReceipt } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PennyMascot } from '@/components/PennyMascot';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const categories = [
  { id: 'Food & Drink', icon: Utensils, color: 'bg-orange-100 text-orange-600' },
  { id: 'Shopping', icon: ShoppingBag, color: 'bg-pink-100 text-pink-600' },
  { id: 'Transport', icon: Car, color: 'bg-blue-100 text-blue-600' },
  { id: 'Entertainment', icon: Film, color: 'bg-purple-100 text-purple-600' },
  { id: 'Groceries', icon: Apple, color: 'bg-green-100 text-green-600' },
  { id: 'Health', icon: Heart, color: 'bg-red-100 text-red-600' },
  { id: 'Utilities', icon: Wrench, color: 'bg-slate-100 text-slate-600' },
  { id: 'Income', icon: DollarSign, color: 'bg-emerald-100 text-emerald-600' },
  { id: 'Mixed', icon: Split, color: 'bg-gray-100 text-gray-600' },
];

const formSchema = z.object({
  merchant: z.string().min(2, {
    message: "Merchant name must be at least 2 characters.",
  }),
  category: z.string({
    required_error: "Please select a category.",
  }),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Amount must be a positive number.",
  }),
  date: z.date({
    required_error: "Please select a date.",
  }),
});

interface ReceiptSplit {
  category: string;
  amount: number;
  items: string[];
}

interface ReceiptAnalysisResponse {
  merchant: string;
  date: string;
  total_amount: number;
  splits: ReceiptSplit[];
}

export default function AddTransaction() {
  const navigate = useNavigate();
  const { addTransaction, data: financeData } = useFinance();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("manual");

  // Scanning State
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [analyzedData, setAnalyzedData] = useState<ReceiptAnalysisResponse | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      merchant: "",
      category: "Shopping",
      amount: "",
      date: new Date(),
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      await addTransaction({
        merchant: values.merchant,
        category: values.category,
        amount: parseFloat(values.amount),
        date: values.date.toISOString(),
        icon: values.category,
      });
      toast.success("Transaction added successfully!");
      navigate('/transactions');
    } catch (error) {
      console.error("Error adding transaction:", error);
      toast.error("Failed to add transaction. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setReceiptFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setAnalyzedData(null);
    }
  };

  const handleAnalyze = async () => {
    if (!receiptFile) return;
    setIsAnalyzing(true);
    try {
      const data: ReceiptAnalysisResponse = await analyzeReceipt(receiptFile);
      setAnalyzedData(data);
      toast.success(`Analysis complete! Found ${data.splits.length} categories.`);
    } catch (error) {
      console.error("Analysis failed:", error);
      toast.error("Failed to analyze receipt. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveAnalyzedTransaction = async () => {
    if (!analyzedData) return;
    setIsSubmitting(true);
    try {
      // Determine primary category: "Mixed" if multiple, else the single one.
      const primaryCategory = analyzedData.splits.length > 1 ? "Mixed" : analyzedData.splits[0]?.category || "Shopping";

      await addTransaction({
        merchant: analyzedData.merchant,
        category: primaryCategory,
        amount: analyzedData.total_amount,
        date: new Date(analyzedData.date).toISOString(),
        icon: primaryCategory,
        splits: analyzedData.splits.map(s => ({
            category: s.category,
            amount: s.amount,
            note: s.items.join(", ")
        }))
      });
      
      toast.success(`Successfully saved transaction for ${analyzedData.merchant}!`);
      navigate('/transactions');
    } catch (error) {
      console.error("Error saving transaction:", error);
      toast.error("Failed to save transaction.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateSplitAmount = (index: number, newAmount: number) => {
      if (!analyzedData) return;
      const newSplits = [...analyzedData.splits];
      newSplits[index].amount = newAmount;
      // Recalculate total? Or keep total fixed and warn?
      // Let's recalculate total for now.
      const newTotal = newSplits.reduce((sum, s) => sum + s.amount, 0);
      setAnalyzedData({ ...analyzedData, splits: newSplits, total_amount: newTotal });
  };

  const amount = form.watch("amount");
  const timeCost = amount ? (parseFloat(amount) / (financeData.calculatedHourlyRate || 25)).toFixed(1) : "0";

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-display font-bold">Add Purchase</h1>
          <p className="text-muted-foreground">Log your spending manually or scan a receipt</p>
        </div>
      </div>

      <Tabs defaultValue="manual" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          <TabsTrigger value="scan">Scan Receipt</TabsTrigger>
        </TabsList>

        <TabsContent value="manual">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Card className="border-2 border-primary/10 shadow-lg">
                <CardHeader>
                  <CardTitle>Transaction Details</CardTitle>
                  <CardDescription>
                    Where did your money go today?
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="merchant"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Merchant / Place</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input placeholder="Chipotle, Amazon, Netflix..." className="pl-10" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="amount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Amount</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                  <Input type="number" step="0.01" placeholder="0.00" className="pl-10" {...field} />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="date"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel className="mb-2">Date</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) =>
                                      date > new Date() || date < new Date("1900-01-01")
                                    }
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories.map((cat) => (
                                  <SelectItem key={cat.id} value={cat.id}>
                                    <div className="flex items-center gap-2">
                                      <cat.icon className="w-4 h-4" />
                                      <span>{cat.id}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" className="w-full btn-gradient-primary h-12 text-lg font-bold" disabled={isSubmitting}>
                        {isSubmitting ? "Adding..." : (
                          <>
                            <Plus className="w-5 h-5 mr-2" />
                            Add Transaction
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="bg-primary/5 border-none">
                <CardContent className="pt-6">
                  <div className="text-center mb-4">
                    <PennyMascot mood={parseFloat(amount) > 100 ? "concerned" : "happy"} size="md" />
                  </div>
                  <div className="space-y-4">
                    <div className="bg-card p-4 rounded-2xl border border-primary/10 shadow-sm">
                      <div className="flex items-center gap-2 mb-1 text-primary">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Penny's Insight</span>
                      </div>
                      <p className="text-sm leading-relaxed">
                        {amount && parseFloat(amount) > 0 ? (
                          <>
                            This purchase will cost you <span className="font-bold text-primary">{timeCost} hours</span> of your life! 
                            Is it worth it?
                          </>
                        ) : (
                          "I'll help you see how much this purchase really costs in terms of your working time!"
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="scan">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              {!analyzedData && (
                <Card className="border-2 border-dashed border-primary/20 bg-primary/5">
                  <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    
                    {previewUrl ? (
                      <div className="relative w-full max-w-sm mb-6 rounded-lg overflow-hidden border-2 border-primary/20">
                        <img src={previewUrl} alt="Receipt Preview" className="w-full h-auto" />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 rounded-full h-8 w-8"
                          onClick={() => {
                            setReceiptFile(null);
                            setPreviewUrl(null);
                            setAnalyzedData(null);
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="mb-6 w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                        <Camera className="w-10 h-10 text-primary" />
                      </div>
                    )}

                    <h3 className="text-xl font-bold mb-2">
                      {previewUrl ? "Receipt Ready" : "Upload Receipt"}
                    </h3>
                    <p className="text-muted-foreground mb-6 max-w-sm">
                      {previewUrl 
                        ? "Penny is ready to read your receipt. Click analyze to start."
                        : "Take a photo or upload an image of your receipt. Penny will automatically extract items and prices."
                      }
                    </p>

                    {previewUrl ? (
                      <Button 
                        size="lg" 
                        onClick={handleAnalyze} 
                        disabled={isAnalyzing}
                        className="btn-gradient-primary"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <ScanLine className="w-5 h-5 mr-2" />
                            Analyze Receipt
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="lg">
                        <Upload className="w-5 h-5 mr-2" />
                        Select Image
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}

              {analyzedData && (
                <div className="space-y-6">
                  <Card className="border-2 border-primary/10 shadow-lg overflow-hidden">
                    <CardHeader className="bg-primary/5 pb-4">
                      <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl">{analyzedData.merchant}</CardTitle>
                            <CardDescription>{analyzedData.date}</CardDescription>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-primary">${analyzedData.total_amount.toFixed(2)}</div>
                            <div className="text-xs text-muted-foreground">Total Paid</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <h4 className="font-semibold mb-4 flex items-center gap-2">
                            <Split className="w-4 h-4" />
                            Budget Impact Breakdown
                        </h4>
                        
                        <div className="space-y-4">
                            {analyzedData.splits.map((split, index) => (
                                <div key={index} className="flex items-start gap-4 p-4 rounded-xl bg-secondary/5 border border-secondary/10">
                                    <div className="mt-1">
                                        {categories.find(c => c.id === split.category)?.icon ? (
                                            (() => {
                                                const Icon = categories.find(c => c.id === split.category)!.icon;
                                                return <Icon className="w-5 h-5 text-secondary" />;
                                            })()
                                        ) : <Tag className="w-5 h-5 text-secondary" />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-medium">{split.category}</span>
                                            <div className="relative w-24">
                                                <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                                                <Input 
                                                    type="number" 
                                                    value={split.amount}
                                                    onChange={(e) => updateSplitAmount(index, parseFloat(e.target.value) || 0)}
                                                    className="h-8 pl-6 text-right font-mono"
                                                />
                                            </div>
                                        </div>
                                        <div className="text-xs text-muted-foreground leading-relaxed">
                                            {split.items.length > 0 ? split.items.join(", ") : "No specific items listed"}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                    <CardFooter className="bg-muted/30 pt-6">
                         <div className="w-full flex gap-4">
                            <Button variant="outline" className="flex-1" onClick={() => {
                                setAnalyzedData(null);
                                setReceiptFile(null);
                                setPreviewUrl(null);
                            }}>
                                Cancel
                            </Button>
                            <Button 
                                className="flex-[2] btn-gradient-primary" 
                                onClick={handleSaveAnalyzedTransaction}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-5 h-5 mr-2" />
                                        Confirm & Save Transaction
                                    </>
                                )}
                            </Button>
                         </div>
                    </CardFooter>
                  </Card>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <Card className="bg-primary/5 border-none">
                <CardContent className="pt-6">
                  <div className="text-center mb-4">
                    <PennyMascot 
                      mood={isAnalyzing ? "analyzing" : analyzedData ? "celebrating" : "thinking"} 
                      size="md" 
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="bg-card p-4 rounded-2xl border border-primary/10 shadow-sm">
                      <div className="flex items-center gap-2 mb-1 text-primary">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Penny's Insight</span>
                      </div>
                      <p className="text-sm leading-relaxed">
                        {isAnalyzing ? (
                          "I'm reading your receipt and grouping items by category..."
                        ) : analyzedData ? (
                          `I found ${analyzedData.splits.length} different categories in this receipt! This helps keep your budgets accurate.`
                        ) : (
                          "Upload a receipt and I'll create a single transaction but split the costs into the right budgets!"
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
