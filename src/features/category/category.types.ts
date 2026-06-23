export interface Category {
  id?: number
  name: string
  type: 'expense' | 'income'
  iconName: string
  isDefault: boolean
  order: number
}

export type CategoryType = 'expense' | 'income'

export const FALLBACK_CATEGORY = 'Lainnya'

export const DEFAULT_EXPENSE_CATEGORIES: Omit<Category, 'id'>[] = [
  { name: 'Makanan', type: 'expense', iconName: 'Utensils', isDefault: true, order: 0 },
  { name: 'Transport', type: 'expense', iconName: 'Car', isDefault: true, order: 1 },
  { name: 'Belanja', type: 'expense', iconName: 'ShoppingBag', isDefault: true, order: 2 },
  { name: 'Tagihan', type: 'expense', iconName: 'Receipt', isDefault: true, order: 3 },
  { name: 'Hiburan', type: 'expense', iconName: 'Gamepad2', isDefault: true, order: 4 },
  { name: 'Kesehatan', type: 'expense', iconName: 'HeartPulse', isDefault: true, order: 5 },
  { name: 'Pendidikan', type: 'expense', iconName: 'GraduationCap', isDefault: true, order: 6 },
  { name: 'Transfer', type: 'expense', iconName: 'ArrowLeftRight', isDefault: true, order: 7 },
  { name: FALLBACK_CATEGORY, type: 'expense', iconName: 'Tag', isDefault: true, order: 8 },
]

export const DEFAULT_INCOME_CATEGORIES: Omit<Category, 'id'>[] = [
  { name: 'Gaji', type: 'income', iconName: 'Wallet', isDefault: true, order: 0 },
  { name: 'Bonus', type: 'income', iconName: 'Gift', isDefault: true, order: 1 },
  { name: 'Transfer Keluarga', type: 'income', iconName: 'Users', isDefault: true, order: 2 },
  { name: 'Hadiah', type: 'income', iconName: 'Star', isDefault: true, order: 3 },
  { name: 'Side Income', type: 'income', iconName: 'TrendingUp', isDefault: true, order: 4 },
  { name: 'Pacar', type: 'income', iconName: 'Heart', isDefault: true, order: 5 },
  { name: FALLBACK_CATEGORY, type: 'income', iconName: 'Tag', isDefault: true, order: 6 },
]

// Subset of Lucide icons valid in lucide-react@1.21.0, relevant to personal finance
export const ICON_PICKER_OPTIONS = [
  'Utensils',
  'Car',
  'ShoppingBag',
  'Receipt',
  'Gamepad2',
  'HeartPulse',
  'GraduationCap',
  'ArrowLeftRight',
  'Wallet',
  'Gift',
  'Star',
  'Heart',
  'TrendingUp',
  'Users',
  'Home',
  'Coffee',
  'Music',
  'Plane',
  'Package',
  'Briefcase',
  'Zap',
  'BookOpen',
  'DollarSign',
  'PiggyBank',
  'Tag',
  'Landmark',
  'CreditCard',
  'Stethoscope',
  'Baby',
  'Banknote',
] as const

export type IconPickerName = (typeof ICON_PICKER_OPTIONS)[number]
