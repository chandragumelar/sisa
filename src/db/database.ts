import Dexie, { type EntityTable } from 'dexie'
import { applyMigrations } from './migrations'

// ---------------------------------------------------------------------------
// Entity types
// ---------------------------------------------------------------------------

export type TransactionType = 'keluar' | 'masuk' | 'nabung' | 'transfer' | 'tagihan'
export type NominalType = 'tetap' | 'variabel'
export type RecurrenceType = 'rutin' | 'sekali'
export type TagihanFrequency =
  | 'sekali'
  | 'mingguan'
  | '2mingguan'
  | 'bulanan'
  | '2bulanan'
  | '3bulanan'
  | 'tahunan'
export type IncomeType = 'tetap' | 'freelance' | 'mix'
export type IncomeFrequency = 'mingguan' | '2mingguan' | 'bulanan'
export type WeekendBehavior = 'maju-jumat' | 'mundur-senin' | 'tetap' | 'tidak-konsisten'
export type Theme = 'light' | 'dark' | 'system'
export type Language = 'id' | 'en'
export type LicenseStatus = 'unactivated' | 'active' | 'expired' | 'invalid' | 'tampered'
export type MetaKey = 'schemaVersion' | 'installId'

/**
 * Signed amount convention:
 *   - Wallet inflow (masuk, transfer credit): positive
 *   - Wallet outflow (keluar, tagihan, transfer debit): negative
 *   - Nabung earmark: positive (the saving amount; excluded from wallet balance calc)
 *
 * Wallet balance  = SUM(amount) for walletId, excluding (type='nabung' && isEarmark=true)
 * Total savings   = SUM(amount WHERE type='nabung')
 *                 + SUM(amount WHERE type='keluar' && isFromSavings=true)
 */
export interface Transaction {
  id?: number
  walletId: number
  amount: number
  type: TransactionType
  currency: string
  label?: string
  note?: string
  date: number // epoch ms
  tagihanId?: number // FK to tagihan.id when type='tagihan'
  transferPairId?: string // UUID linking a transfer debit+credit pair
  isFromSavings: boolean // expense drawn from savings, not operational budget
  isEarmark: boolean // nabung stays in wallet; excluded from wallet balance calc
  createdAt: number // epoch ms
  category?: string // optional; defaults to 'Lainnya' when unset
}

export interface Wallet {
  id?: number
  name: string
  balance: number // pre-computed running balance, kept in sync on each write
  currency: string
  order: number
  createdAt: number // epoch ms
}

export interface Tagihan {
  id?: number
  name: string
  nominalType: NominalType
  nominalEstimate: number
  dueDay: number // 1–31; day of month for month-cadence frequencies
  frequency: TagihanFrequency
  anchorDate: number // epoch ms — reference date for cycle alignment
  recurrenceType?: RecurrenceType // legacy; kept for v3 additive migration
  currency: string
  isActive: boolean
  lastPaidAt: number | null // epoch ms
  lastPaidAmount: number | null
  createdAt: number // epoch ms
}

export interface Goal {
  id?: number
  name: string
  target: number
  currency: string
  order: number // drag-drop priority; waterfall pours from order=0 downward
  createdAt: number // epoch ms
}

// Singleton row — always id=1. Use db.settings.put({ id: 1, ... }).
export interface Settings {
  id: 1
  language: Language
  theme: Theme
  incomeType: IncomeType
  incomeDay: number | null // 1–31 for tetap/mix
  freelanceMinBalance: number | null // target minimum for freelance
  primaryCurrency: string // ISO 4217
  secondaryCurrency: string | null
  activeCurrencyMode: string // current currency context (Pro: one of the two currencies)
  incomeFrequency: IncomeFrequency // 'bulanan' for existing users (migration default)
  incomeAnchorDate: number | null // epoch ms; reference date for weekly/biweekly cycle
  weekendBehavior: WeekendBehavior | null // null until first payday falls on a weekend
  onboardingCompleted: boolean
  lastExportedAt: number | null // epoch ms; drives backup reminder cadence
  lastPaydayConfirmed: number | null // epoch ms of last confirmed payday; null = hari pertama
  avgIncome: number | null // freelance/mix: estimated income per avgIncomeBasis period
  avgIncomeBasis: IncomeFrequency | null // period basis for avgIncome
  fixedIncome: number | null // tetap/mix: nominal salary per period; used as pemasukanPeriode fallback
}

// Singleton row — always id=1. Use db.allocation.put({ id: 1, ... }).
export interface Allocation {
  id: 1
  jatahHarian: number
  daysAtLock: number
  lockedAt: number
  periodEndDate: number | null
}

// Singleton row — always id=1. Use db.license.put({ id: 1, ... }).
export interface LicenseRecord {
  id: 1
  rawKey: string // full key string; never log this
  version: number // payload.v from key format
  issuedAt: number // epoch ms
  expiresAt: number // epoch ms
  buyerIdHash: string // bid from key payload; 8-char hash, not raw PII
  lastSeenAt: number // epoch ms; used for anti-rollback check
  activatedAt: number // epoch ms
}

export interface MetaRecord {
  key: MetaKey
  value: string // store as string; parse in repository as needed
}

export interface SavedScenario {
  id?: number
  name: string
  items: string // JSON-serialized AndaiItem[]
  savedAt: number // epoch ms
}

export interface BackupData {
  schemaVersion: number
  exportedAt: number
  settings: Settings
  wallets: Wallet[]
  tagihan: Tagihan[]
  goals: Goal[]
  transactions: Transaction[]
}

export interface Category {
  id?: number
  name: string
  type: 'expense' | 'income'
  iconName: string
  isDefault: boolean
  order: number
}

// ---------------------------------------------------------------------------
// Database class
// ---------------------------------------------------------------------------

class SisaDatabase extends Dexie {
  transactions!: EntityTable<Transaction, 'id'>
  wallets!: EntityTable<Wallet, 'id'>
  tagihan!: EntityTable<Tagihan, 'id'>
  goals!: EntityTable<Goal, 'id'>
  settings!: EntityTable<Settings, 'id'>
  license!: EntityTable<LicenseRecord, 'id'>
  meta!: EntityTable<MetaRecord, 'key'>
  savedScenarios!: EntityTable<SavedScenario, 'id'>
  categories!: EntityTable<Category, 'id'>
  allocation!: EntityTable<Allocation, 'id'>

  constructor() {
    super('sisa')
    applyMigrations(this)
  }
}

export const db = new SisaDatabase()

export const SCHEMA_VERSION = 1
