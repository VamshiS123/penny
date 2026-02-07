import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { 
  ArrowLeft, Calendar as CalendarIcon, 
  Store, Tag, DollarSign, Sparkles,
  Utensils, ShoppingBag, Car, Film, 
  Apple, Heart, Wrench, Plus, Check
} from 'lucide-react';

import { useFinance } from '@/contexts/FinanceContext';
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

export default function AddTransaction() {
  const navigate = useNavigate();
  const { addTransaction, data: financeData } = useFinance();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        icon: values.category, // Backend uses this to map icons
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

  const amount = form.watch("amount");
  const timeCost = amount ? (parseFloat(amount) / (financeData.calculatedHourlyRate || 25)).toFixed(1) : "0";

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-display font-bold">Add Purchase</h1>
          <p className="text-muted-foreground">Log your spending manually</p>
        </div>
      </div>

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
                
                <div className="flex items-center justify-between px-2">
                  <span className="text-sm text-muted-foreground">Daily Budget</span>
                  <span className="text-sm font-semibold">$120.00</span>
                </div>
                <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-primary h-full transition-all duration-500" 
                    style={{ width: amount ? `${Math.min(100, (parseFloat(amount) / 120) * 100)}%` : '0%' }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="p-4 rounded-2xl bg-secondary/10 border border-secondary/20">
            <h4 className="font-bold text-secondary mb-2 flex items-center gap-2">
              <Check className="w-4 h-4" />
              Quick Tips
            </h4>
            <ul className="text-xs space-y-2 text-muted-foreground">
              <li>• Categorizing helps Penny give better advice</li>
              <li>• Try to log purchases as they happen</li>
              <li>• Small daily wins lead to big goals!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
