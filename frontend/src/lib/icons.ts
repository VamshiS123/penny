import { 
  Home, Zap, Smartphone, Car, RefreshCw, Pizza, Fuel,
  Shield, Plane, CreditCard, GraduationCap, Star,
  Egg, Flame, Coins, Ghost, Target, Crown, Clock, Users,
  LucideIcon
} from 'lucide-react';

export const iconMap: Record<string, LucideIcon> = {
  Home, Zap, Smartphone, Car, RefreshCw, Pizza, Fuel,
  Shield, Plane, CreditCard, GraduationCap, Star,
  Egg, Flame, Coins, Ghost, Target, Crown, Clock, Users,
  // Add mappings for lowercase or specific IDs used in Onboarding
  emergency: Shield,
  vacation: Plane,
  debt: CreditCard,
  car: Car,
  house: Home,
  education: GraduationCap,
  custom: Star,
  // Fallbacks
  default: Star
};

export function getIcon(name: string): LucideIcon {
  return iconMap[name] || iconMap[name.toLowerCase()] || iconMap.default;
}
