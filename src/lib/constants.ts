import {
  BookOpen,
  Laptop,
  FlaskConical,
  Calculator,
  Camera,
  Music,
  Dumbbell,
  Package,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface Category {
  name: string;
  icon: LucideIcon;
  color: string;
}

export const CATEGORIES: Category[] = [
  { name: 'Books', icon: BookOpen, color: 'bg-chocolate-100 text-chocolate-800' },
  { name: 'Electronics', icon: Laptop, color: 'bg-sand-200 text-chocolate-800' },
  { name: 'Lab Equipment', icon: FlaskConical, color: 'bg-chocolate-200 text-chocolate-800' },
  { name: 'Calculators', icon: Calculator, color: 'bg-sand-300 text-chocolate-800' },
  { name: 'Cameras', icon: Camera, color: 'bg-chocolate-100 text-chocolate-800' },
  { name: 'Music', icon: Music, color: 'bg-sand-200 text-chocolate-800' },
  { name: 'Sports', icon: Dumbbell, color: 'bg-chocolate-200 text-chocolate-800' },
  { name: 'Other', icon: Package, color: 'bg-sand-300 text-chocolate-800' },
];

export const CATEGORY_NAMES = CATEGORIES.map((c) => c.name);

export const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  returned: 'Returned',
};

export const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-sand-300 text-chocolate-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  returned: 'bg-chocolate-200 text-chocolate-800',
};
