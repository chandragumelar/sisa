import type {
  Transaction,
  Wallet,
  Tagihan,
  Settings,
  Allocation,
  SavedScenario,
  Category,
} from '@/db/database'
import type { db as liveDb } from '@/db/database'
import type { IconPickerName } from '@/features/category/category.types'

/** Structural type of the live Dexie singleton — type-only import, no runtime instantiation. */
export type SisaDb = typeof liveDb

/**
 * Bump on every seed data revision. seedDemoDb compares this against the stored value to
 * decide whether existing demo data needs a full wipe-and-reseed.
 */
export const DEMO_SEED_VERSION = 2

/**
 * `meta` table (db/database.ts) only accepts MetaKey = 'schemaVersion' | 'installId' — not
 * a fit for an arbitrary new key without touching database.ts, which is out of scope here.
 * localStorage is a deliberate fallback; see PR description.
 */
export const DEMO_SEED_VERSION_STORAGE_KEY = 'sisa.demoSeedVersion'

const DAY_MS = 86_400_000

function dayAt(daysAgoN: number, hour: number, minute = 0): number {
  const d = new Date()
  d.setDate(d.getDate() - daysAgoN)
  d.setHours(hour, minute, 0, 0)
  return d.getTime()
}

/** Most recent occurrence of `day`-of-month at/before now; rolls back a month if not reached yet. */
function mostRecentOccurrence(day: number, hour = 9): number {
  const now = new Date()
  const d = new Date(now.getFullYear(), now.getMonth(), day, hour)
  if (d.getTime() > now.getTime()) d.setMonth(d.getMonth() - 1)
  return d.getTime()
}

/** Occurrence of `day`-of-month this month, clamped to now — always lands in the current cycle. */
function occurrenceThisMonth(day: number, hour = 9): number {
  const now = new Date()
  const occ = new Date(now.getFullYear(), now.getMonth(), day, hour).getTime()
  return Math.min(occ, now.getTime())
}

/** Occurrence of `day`-of-month last month — guarantees "not paid this cycle" regardless of today's date. */
function occurrencePriorMonth(day: number, hour = 9): number {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() - 1, day, hour).getTime()
}

/** Same day-of-month as `anchorMs`, `monthsAgo` calendar months earlier. Used for payday history. */
function monthsBefore(anchorMs: number, monthsAgo: number): number {
  const d = new Date(anchorMs)
  d.setMonth(d.getMonth() - monthsAgo)
  return d.getTime()
}

interface DemoDates {
  createdAt: number
  lastPayday: number
  nextPayday: number
  rentPaid: number
  electricityPaid: number
  internetPaid: number
  netflixPaid: number
  gymPaid: number
  bpjsPaid: number
}

function buildDates(): DemoDates {
  const lastPayday = mostRecentOccurrence(25)
  const nextPaydayDate = new Date(lastPayday)
  nextPaydayDate.setMonth(nextPaydayDate.getMonth() + 1)

  return {
    createdAt: dayAt(180, 9),
    lastPayday,
    nextPayday: nextPaydayDate.getTime(),
    rentPaid: occurrenceThisMonth(1),
    electricityPaid: occurrencePriorMonth(10),
    internetPaid: mostRecentOccurrence(15),
    netflixPaid: occurrencePriorMonth(20),
    gymPaid: occurrenceThisMonth(5),
    bpjsPaid: occurrenceThisMonth(12),
  }
}

interface WalletIds {
  anz: number
  up: number
  cash: number
  bca: number
  wise: number
}

interface TagihanIds {
  rent: number
  electricity: number
  internet: number
  netflix: number
  gym: number
  bpjs: number
}

function buildWalletSeeds(createdAt: number): Record<keyof WalletIds, Omit<Wallet, 'id'>> {
  return {
    anz: { name: 'ANZ', balance: 0, currency: 'AUD', order: 0, createdAt },
    up: { name: 'Up', balance: 0, currency: 'AUD', order: 1, createdAt },
    cash: { name: 'Cash', balance: 0, currency: 'AUD', order: 2, createdAt },
    bca: { name: 'BCA', balance: 0, currency: 'IDR', order: 3, createdAt },
    wise: { name: 'Wise USD', balance: 0, currency: 'USD', order: 4, createdAt },
  }
}

// ── Categories ──────────────────────────────────────────────────────────────
// English set for the AU persona — intentionally not DEFAULT_EXPENSE_CATEGORIES /
// DEFAULT_INCOME_CATEGORIES (those are Indonesian). Icon names checked against
// ICON_PICKER_OPTIONS via the IconPickerName type.

interface DemoCategorySeed {
  name: string
  type: 'expense' | 'income'
  iconName: IconPickerName
  order: number
}

const EXPENSE_CATEGORIES: DemoCategorySeed[] = [
  { name: 'Food', type: 'expense', iconName: 'Utensils', order: 0 },
  { name: 'Groceries', type: 'expense', iconName: 'ShoppingBag', order: 1 },
  { name: 'Transport', type: 'expense', iconName: 'Car', order: 2 },
  { name: 'Bills', type: 'expense', iconName: 'Receipt', order: 3 },
  { name: 'Entertainment', type: 'expense', iconName: 'Gamepad2', order: 4 },
  { name: 'Health', type: 'expense', iconName: 'HeartPulse', order: 5 },
  { name: 'Shopping', type: 'expense', iconName: 'Package', order: 6 },
  { name: 'Coffee', type: 'expense', iconName: 'Coffee', order: 7 },
  { name: 'Transfer', type: 'expense', iconName: 'ArrowLeftRight', order: 8 },
  { name: 'Other', type: 'expense', iconName: 'Tag', order: 9 },
]

const INCOME_CATEGORIES: DemoCategorySeed[] = [
  { name: 'Salary', type: 'income', iconName: 'Wallet', order: 0 },
  { name: 'Bonus', type: 'income', iconName: 'Gift', order: 1 },
  { name: 'Side Income', type: 'income', iconName: 'TrendingUp', order: 2 },
  { name: 'Other', type: 'income', iconName: 'Tag', order: 3 },
]

function buildCategories(): Omit<Category, 'id'>[] {
  return [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES].map((c) => ({ ...c, isDefault: true }))
}

// ── Tagihan ──────────────────────────────────────────────────────────────────

function buildTagihanSeeds(dates: DemoDates): Record<keyof TagihanIds, Omit<Tagihan, 'id'>> {
  const base = { anchorDate: dates.createdAt, createdAt: dates.createdAt, isActive: true }

  return {
    rent: {
      ...base,
      name: 'Rent',
      nominalType: 'tetap',
      nominalEstimate: 1_800,
      dueDay: 1,
      frequency: 'bulanan',
      currency: 'AUD',
      lastPaidAt: dates.rentPaid,
      lastPaidAmount: 1_800,
    },
    electricity: {
      ...base,
      name: 'Electricity — AGL',
      nominalType: 'variabel',
      nominalEstimate: 110,
      dueDay: 10,
      frequency: 'bulanan',
      currency: 'AUD',
      lastPaidAt: dates.electricityPaid,
      lastPaidAmount: 118.35,
    },
    internet: {
      ...base,
      name: 'Internet — Telstra',
      nominalType: 'tetap',
      nominalEstimate: 89,
      dueDay: 15,
      frequency: 'bulanan',
      currency: 'AUD',
      lastPaidAt: dates.internetPaid,
      lastPaidAmount: 89,
    },
    netflix: {
      ...base,
      name: 'Netflix',
      nominalType: 'tetap',
      nominalEstimate: 18.99,
      dueDay: 20,
      frequency: 'bulanan',
      currency: 'AUD',
      lastPaidAt: dates.netflixPaid,
      lastPaidAmount: 18.99,
    },
    gym: {
      ...base,
      name: 'Gym — Anytime Fitness',
      nominalType: 'tetap',
      nominalEstimate: 64,
      dueDay: 5,
      frequency: 'bulanan',
      currency: 'AUD',
      lastPaidAt: dates.gymPaid,
      lastPaidAmount: 64,
    },
    bpjs: {
      ...base,
      name: 'BPJS for parents',
      nominalType: 'tetap',
      nominalEstimate: 300_000,
      dueDay: 12,
      frequency: 'bulanan',
      currency: 'IDR',
      lastPaidAt: dates.bpjsPaid,
      lastPaidAmount: 300_000,
    },
  }
}

/** One 'tagihan'-type settlement transaction per bill, dated at its lastPaidAt. */
function buildTagihanTransactions(
  w: WalletIds,
  t: TagihanIds,
  tagihanSeeds: Record<keyof TagihanIds, Omit<Tagihan, 'id'>>,
): Omit<Transaction, 'id'>[] {
  const entries: { key: keyof TagihanIds; walletId: number }[] = [
    { key: 'rent', walletId: w.anz },
    { key: 'electricity', walletId: w.anz },
    { key: 'internet', walletId: w.anz },
    { key: 'netflix', walletId: w.anz },
    { key: 'gym', walletId: w.anz },
    { key: 'bpjs', walletId: w.bca },
  ]

  return entries.map(({ key, walletId }) => {
    const seed = tagihanSeeds[key]
    const date = seed.lastPaidAt ?? seed.anchorDate
    return {
      walletId,
      amount: -(seed.lastPaidAmount ?? seed.nominalEstimate),
      type: 'tagihan',
      currency: seed.currency,
      category: 'Bills',
      tagihanId: t[key],
      date,
      createdAt: date,
      isFromSavings: false,
      isEarmark: false,
    }
  })
}

// ── Opening balances (BCA + Wise carry a static float, not day-to-day AUD spend) ──

function buildOpeningBalanceTransactions(
  dates: DemoDates,
  w: WalletIds,
): Omit<Transaction, 'id'>[] {
  return [
    {
      walletId: w.bca,
      // BPJS (IDR 300,000) is debited from this same wallet later — net settles to ~Rp 4,500,000.
      amount: 4_800_000,
      type: 'masuk',
      currency: 'IDR',
      label: 'Opening balance',
      category: 'Other',
      date: dates.createdAt,
      createdAt: dates.createdAt,
      isFromSavings: false,
      isEarmark: false,
    },
    {
      walletId: w.wise,
      amount: 320,
      type: 'masuk',
      currency: 'USD',
      label: 'Opening balance',
      category: 'Other',
      date: dates.createdAt,
      createdAt: dates.createdAt,
      isFromSavings: false,
      isEarmark: false,
    },
  ]
}

// ── Income: 6 monthly paydays + occasional side income ──────────────────────

function buildIncomeTransactions(dates: DemoDates, w: WalletIds): Omit<Transaction, 'id'>[] {
  const salary: Omit<Transaction, 'id'>[] = [0, 1, 2, 3, 4, 5].map((monthsAgo) => {
    const date = monthsBefore(dates.lastPayday, monthsAgo)
    return {
      walletId: w.anz,
      amount: 5_400,
      type: 'masuk',
      currency: 'AUD',
      label: 'Salary',
      category: 'Salary',
      date,
      createdAt: date,
      isFromSavings: false,
      isEarmark: false,
    }
  })

  const sideIncome: { monthsAgo: number; amount: number }[] = [
    { monthsAgo: 1, amount: 320 },
    { monthsAgo: 4, amount: 450 },
  ]

  const side: Omit<Transaction, 'id'>[] = sideIncome.map(({ monthsAgo, amount }) => {
    const date = monthsBefore(dates.lastPayday, monthsAgo) + DAY_MS * 3
    return {
      walletId: w.anz,
      amount,
      type: 'masuk',
      currency: 'AUD',
      label: 'Side Income',
      category: 'Side Income',
      date,
      createdAt: date,
      isFromSavings: false,
      isEarmark: false,
    }
  })

  return [...salary, ...side]
}

// ── Nabung (savings earmark) — separate from wallet balance, once per demo history ──

function buildNabungTransaction(dates: DemoDates, w: WalletIds): Omit<Transaction, 'id'> {
  const date = dates.lastPayday + DAY_MS
  return {
    walletId: w.anz,
    amount: 300,
    type: 'nabung',
    currency: 'AUD',
    isEarmark: true,
    label: 'Savings',
    category: 'Other',
    date,
    createdAt: date,
    isFromSavings: false,
  }
}

// ── Inter-wallet transfers ───────────────────────────────────────────────────

function buildTransferTransactions(w: WalletIds): Omit<Transaction, 'id'>[] {
  const topupDate = dayAt(24, 10)
  const atmDate = dayAt(10, 11)

  const mk = (overrides: Partial<Transaction>): Omit<Transaction, 'id'> => ({
    walletId: w.anz,
    amount: 0,
    type: 'transfer',
    currency: 'AUD',
    category: 'Transfer',
    date: topupDate,
    createdAt: topupDate,
    isFromSavings: false,
    isEarmark: false,
    ...overrides,
  })

  return [
    mk({ walletId: w.anz, amount: -200, transferPairId: 'topup-1' }),
    mk({ walletId: w.up, amount: 200, transferPairId: 'topup-1' }),
    mk({
      walletId: w.anz,
      amount: -150,
      transferPairId: 'atm-withdraw',
      date: atmDate,
      createdAt: atmDate,
    }),
    mk({
      walletId: w.cash,
      amount: 150,
      transferPairId: 'atm-withdraw',
      date: atmDate,
      createdAt: atmDate,
    }),
  ]
}

// ── Historical monthly spend (5 completed months before the current one) ────

interface MonthlySpendRow {
  day: number
  hour: number
  amount: number
  label: string
  category: string
  wallet: keyof WalletIds
}

const MONTHLY_PATTERN: readonly MonthlySpendRow[] = [
  { day: 2, hour: 8, amount: 5.5, label: 'Flat white', category: 'Coffee', wallet: 'up' },
  { day: 3, hour: 18, amount: 42, label: 'Woolworths run', category: 'Groceries', wallet: 'anz' },
  { day: 5, hour: 12, amount: 18, label: 'Brunch Degraves St', category: 'Food', wallet: 'up' },
  { day: 7, hour: 8, amount: 4.6, label: 'Myki top-up', category: 'Transport', wallet: 'up' },
  { day: 9, hour: 19, amount: 65, label: 'Dinner with friends', category: 'Food', wallet: 'anz' },
  { day: 12, hour: 17, amount: 28, label: 'Kmart', category: 'Shopping', wallet: 'anz' },
  { day: 14, hour: 9, amount: 12, label: 'Chemist Warehouse', category: 'Health', wallet: 'cash' },
  { day: 16, hour: 20, amount: 22, label: 'Uber', category: 'Transport', wallet: 'up' },
  { day: 19, hour: 20, amount: 16, label: 'Cinema', category: 'Entertainment', wallet: 'anz' },
  { day: 22, hour: 8, amount: 38, label: 'Woolworths run', category: 'Groceries', wallet: 'anz' },
  { day: 24, hour: 12, amount: 15, label: 'Brunch Degraves St', category: 'Food', wallet: 'cash' },
]

function buildHistoricalMonthsSpend(w: WalletIds): Omit<Transaction, 'id'>[] {
  const now = new Date()
  const out: Omit<Transaction, 'id'>[] = []

  for (let monthsAgo = 1; monthsAgo <= 5; monthsAgo++) {
    for (const row of MONTHLY_PATTERN) {
      const date = new Date(
        now.getFullYear(),
        now.getMonth() - monthsAgo,
        row.day,
        row.hour,
      ).getTime()
      out.push({
        walletId: w[row.wallet],
        amount: -row.amount,
        type: 'keluar',
        currency: 'AUD',
        label: row.label,
        category: row.category,
        date,
        createdAt: date,
        isFromSavings: false,
        isEarmark: false,
      })
    }
  }

  return out
}

// ── Current-month daily rhythm: at least one expense every day from the 1st to today ──

const DAILY_CYCLE: readonly [
  hour: number,
  amount: number,
  label: string,
  category: string,
  wallet: keyof WalletIds,
][] = [
  [8, 5.5, 'Flat white', 'Coffee', 'up'],
  [12, 16, 'Brunch Degraves St', 'Food', 'up'],
  [18, 12, 'Woolworths run', 'Groceries', 'anz'],
  [8, 4.6, 'Myki top-up', 'Transport', 'up'],
  [19, 45, 'Dinner with friends', 'Food', 'anz'],
  [17, 25, 'Kmart', 'Shopping', 'anz'],
  [9, 14, 'Chemist Warehouse', 'Health', 'cash'],
]

function buildCurrentMonthDailySpend(w: WalletIds): Omit<Transaction, 'id'>[] {
  const now = new Date()
  const today = now.getDate()
  const out: Omit<Transaction, 'id'>[] = []

  // Day 1 through yesterday: cycle through a fixed weekly pattern for chart variety.
  for (let day = 1; day < today; day++) {
    const [hour, amount, label, category, wallet] = DAILY_CYCLE[(day - 1) % DAILY_CYCLE.length]
    const date = new Date(now.getFullYear(), now.getMonth(), day, hour).getTime()
    out.push({
      walletId: w[wallet],
      amount: -amount,
      type: 'keluar',
      currency: 'AUD',
      label,
      category,
      date,
      createdAt: date,
      isFromSavings: false,
      isEarmark: false,
    })
  }

  // Today: kept small and fixed so spentToday stays well under jatahHarian regardless
  // of the current day-of-month (jatahHarian ≈ buatDipakai / daysAtLock ≈ AUD 100/day).
  const todayDate = new Date(now.getFullYear(), now.getMonth(), today, 8).getTime()
  out.push({
    walletId: w.up,
    amount: -5.9,
    type: 'keluar',
    currency: 'AUD',
    label: 'Flat white',
    category: 'Coffee',
    date: todayDate,
    createdAt: todayDate,
    isFromSavings: false,
    isEarmark: false,
  })

  return out
}

function readStoredSeedVersion(): number | null {
  const raw = localStorage.getItem(DEMO_SEED_VERSION_STORAGE_KEY)
  if (raw === null) return null
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : null
}

function writeStoredSeedVersion(version: number): void {
  localStorage.setItem(DEMO_SEED_VERSION_STORAGE_KEY, String(version))
}

/** Clears every table the demo persona writes to. Shared by the version-mismatch and
 * empty-settings seed paths so the table list lives in exactly one place. */
async function wipeDemoTables(db: SisaDb): Promise<void> {
  await Promise.all([
    db.transactions.clear(),
    db.wallets.clear(),
    db.tagihan.clear(),
    db.goals.clear(),
    db.settings.clear(),
    db.categories.clear(),
    db.allocation.clear(),
    db.savedScenarios.clear(),
    db.rates.clear(),
  ])
}

async function applyWalletBalances(
  db: SisaDb,
  w: WalletIds,
  tx: Omit<Transaction, 'id'>[],
): Promise<void> {
  const walletIds = Object.values(w)
  const sums: Record<number, number> = Object.fromEntries(walletIds.map((id) => [id, 0]))
  for (const t of tx) {
    if (t.isEarmark) continue
    sums[t.walletId] += t.amount
  }
  await Promise.all(walletIds.map((id) => db.wallets.update(id, { balance: sums[id] })))
}

function buildSettings(dates: DemoDates): Settings {
  return {
    id: 1,
    language: 'en',
    theme: 'dark',
    incomeType: 'tetap',
    incomeDay: 25,
    freelanceMinBalance: null,
    primaryCurrency: 'AUD',
    incomeFrequency: 'bulanan',
    incomeAnchorDate: dates.lastPayday,
    weekendBehavior: 'tetap',
    onboardingCompleted: true,
    lastExportedAt: null,
    lastPaydayConfirmed: dates.lastPayday,
    avgIncome: null,
    avgIncomeBasis: null,
    fixedIncome: 5_400,
    pushAsked: true,
  }
}

function buildAllocation(dates: DemoDates): Allocation {
  const daysAtLock = Math.round((dates.nextPayday - dates.lastPayday) / DAY_MS)
  const buatDipakai = 3_000
  return {
    id: 1,
    jatahHarian: Math.round(buatDipakai / daysAtLock),
    daysAtLock,
    lockedAt: dates.lastPayday,
    periodEndDate: dates.nextPayday,
    buatDipakai,
  }
}

function buildSavedScenarios(): Omit<SavedScenario, 'id'>[] {
  const savedAt = dayAt(3, 9)
  return [
    {
      name: 'Buy running shoes',
      items: JSON.stringify([{ id: 'item-1', kind: 'beli', desc: 'Running shoes', amount: 180 }]),
      savedAt,
    },
    {
      name: 'Freelance payment',
      items: JSON.stringify([
        { id: 'item-2', kind: 'income', desc: 'Freelance project', amount: 950 },
      ]),
      savedAt: dayAt(3, 10),
    },
  ]
}

/**
 * Seeds a demo persona (Mia, 27, Indonesian expat in Melbourne) into an empty demo Dexie
 * instance. Caller must supply a demo-only db — never the live singleton. Idempotent when
 * settings already exist AND the stored seed version matches DEMO_SEED_VERSION — a no-op
 * in that case. Otherwise (empty db, or a stale stored version) wipes all demo tables and
 * reseeds, so bumping DEMO_SEED_VERSION is enough to push fresh data to returning visitors.
 */
export async function seedDemoDb(db: SisaDb): Promise<void> {
  const settingsCount = await db.settings.count()
  const storedVersion = readStoredSeedVersion()
  if (settingsCount > 0 && storedVersion === DEMO_SEED_VERSION) return

  // Also covers clearAllData() (Settings → Delete all data), which does not clear
  // categories/allocation/savedScenarios/rates — without this, re-seeding after a reset
  // in the same demo session (or a stale seed version) would duplicate/mix stale rows.
  await wipeDemoTables(db)

  const dates = buildDates()
  const walletSeeds = buildWalletSeeds(dates.createdAt)
  const tagihanSeeds = buildTagihanSeeds(dates)

  await db.categories.bulkAdd(buildCategories())

  const walletIds: WalletIds = {
    anz: (await db.wallets.add(walletSeeds.anz)) as number,
    up: (await db.wallets.add(walletSeeds.up)) as number,
    cash: (await db.wallets.add(walletSeeds.cash)) as number,
    bca: (await db.wallets.add(walletSeeds.bca)) as number,
    wise: (await db.wallets.add(walletSeeds.wise)) as number,
  }

  await db.rates.bulkPut([
    { base: 'AUD', target: 'IDR', rate: 10_500, fetchedAt: Date.now() },
    { base: 'AUD', target: 'USD', rate: 0.66, fetchedAt: Date.now() },
  ])

  const tagihanIds: TagihanIds = {
    rent: (await db.tagihan.add(tagihanSeeds.rent)) as number,
    electricity: (await db.tagihan.add(tagihanSeeds.electricity)) as number,
    internet: (await db.tagihan.add(tagihanSeeds.internet)) as number,
    netflix: (await db.tagihan.add(tagihanSeeds.netflix)) as number,
    gym: (await db.tagihan.add(tagihanSeeds.gym)) as number,
    bpjs: (await db.tagihan.add(tagihanSeeds.bpjs)) as number,
  }

  const allTx: Omit<Transaction, 'id'>[] = [
    ...buildOpeningBalanceTransactions(dates, walletIds),
    ...buildIncomeTransactions(dates, walletIds),
    ...buildTagihanTransactions(walletIds, tagihanIds, tagihanSeeds),
    ...buildTransferTransactions(walletIds),
    buildNabungTransaction(dates, walletIds),
    ...buildHistoricalMonthsSpend(walletIds),
    ...buildCurrentMonthDailySpend(walletIds),
  ]

  await db.transactions.bulkAdd(allTx)
  await applyWalletBalances(db, walletIds, allTx)

  await db.settings.put(buildSettings(dates))
  await db.allocation.put(buildAllocation(dates))
  await db.savedScenarios.bulkAdd(buildSavedScenarios())

  writeStoredSeedVersion(DEMO_SEED_VERSION)
}
