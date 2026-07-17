import type {
  Transaction,
  Wallet,
  Tagihan,
  Settings,
  Allocation,
  SavedScenario,
} from '@/db/database'
import type { db as liveDb } from '@/db/database'
import {
  DEFAULT_EXPENSE_CATEGORIES,
  DEFAULT_INCOME_CATEGORIES,
} from '@/features/category/category.types'

/** Structural type of the live Dexie singleton — type-only import, no runtime instantiation. */
export type SisaDb = typeof liveDb

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

interface DemoDates {
  createdAt: number
  lastPayday: number
  nextPayday: number
  kosLastPaid: number
  spotifyLastPaid: number
  listrikLastPaid: number
  internetLastPaid: number
  netflixLastPaid: number
}

function buildDates(): DemoDates {
  const lastPayday = mostRecentOccurrence(25)
  const nextPaydayDate = new Date(lastPayday)
  nextPaydayDate.setMonth(nextPaydayDate.getMonth() + 1)

  return {
    createdAt: dayAt(60, 9),
    lastPayday,
    nextPayday: nextPaydayDate.getTime(),
    kosLastPaid: occurrenceThisMonth(1),
    spotifyLastPaid: occurrenceThisMonth(5),
    listrikLastPaid: occurrencePriorMonth(10),
    internetLastPaid: mostRecentOccurrence(15),
    netflixLastPaid: occurrencePriorMonth(20),
  }
}

interface WalletIds {
  bca: number
  gopay: number
  cash: number
}

interface TagihanIds {
  kos: number
  spotify: number
  listrik: number
}

function buildWalletSeeds(createdAt: number): Record<keyof WalletIds, Omit<Wallet, 'id'>> {
  return {
    bca: { name: 'BCA', balance: 0, currency: 'IDR', order: 0, createdAt },
    gopay: { name: 'GoPay', balance: 0, currency: 'IDR', order: 1, createdAt },
    cash: { name: 'Cash', balance: 0, currency: 'IDR', order: 2, createdAt },
  }
}

type TagihanKey = 'kos' | 'spotify' | 'listrik' | 'internet' | 'netflix'

function buildTagihanSeeds(dates: DemoDates): Record<TagihanKey, Omit<Tagihan, 'id'>> {
  const base = {
    anchorDate: dates.createdAt,
    createdAt: dates.createdAt,
    frequency: 'bulanan' as const,
    isActive: true,
    currency: 'IDR',
  }
  return {
    kos: {
      ...base,
      name: 'Kos',
      nominalType: 'tetap',
      nominalEstimate: 1_500_000,
      dueDay: 1,
      lastPaidAt: dates.kosLastPaid,
      lastPaidAmount: 1_500_000,
    },
    spotify: {
      ...base,
      name: 'Spotify',
      nominalType: 'tetap',
      nominalEstimate: 54_990,
      dueDay: 5,
      lastPaidAt: dates.spotifyLastPaid,
      lastPaidAmount: 54_990,
    },
    listrik: {
      ...base,
      name: 'Listrik Token',
      nominalType: 'variabel',
      nominalEstimate: 150_000,
      dueDay: 10,
      lastPaidAt: dates.listrikLastPaid,
      lastPaidAmount: 163_500,
    },
    internet: {
      ...base,
      name: 'Internet Kuota',
      nominalType: 'tetap',
      nominalEstimate: 100_000,
      dueDay: 15,
      lastPaidAt: dates.internetLastPaid,
      lastPaidAmount: 100_000,
    },
    netflix: {
      ...base,
      name: 'Netflix Patungan',
      nominalType: 'tetap',
      nominalEstimate: 45_000,
      dueDay: 20,
      lastPaidAt: dates.netflixLastPaid,
      lastPaidAmount: 45_000,
    },
  }
}

function buildCoreTransactions(
  w: WalletIds,
  t: TagihanIds,
  dates: DemoDates,
): Omit<Transaction, 'id'>[] {
  const mk = (overrides: Partial<Transaction>): Omit<Transaction, 'id'> => ({
    walletId: w.bca,
    amount: 0,
    type: 'keluar',
    currency: 'IDR',
    date: dates.lastPayday,
    isFromSavings: false,
    isEarmark: false,
    createdAt: dates.lastPayday,
    ...overrides,
  })

  const nabungDate = dates.lastPayday + DAY_MS
  const topup1Date = dayAt(24, 10)
  const topup2Date = dayAt(10, 10)
  const tarikTunaiDate = dayAt(20, 11)

  return [
    mk({ amount: 5_200_000, type: 'masuk', category: 'Gaji' }),
    mk({
      amount: 500_000,
      type: 'nabung',
      isEarmark: true,
      label: 'Nabung',
      date: nabungDate,
      createdAt: nabungDate,
    }),
    mk({
      amount: -1_500_000,
      type: 'tagihan',
      tagihanId: t.kos,
      category: 'Tagihan',
      date: dates.kosLastPaid,
      createdAt: dates.kosLastPaid,
    }),
    mk({
      amount: -54_990,
      type: 'tagihan',
      tagihanId: t.spotify,
      category: 'Tagihan',
      date: dates.spotifyLastPaid,
      createdAt: dates.spotifyLastPaid,
    }),
    mk({
      amount: -163_500,
      type: 'tagihan',
      tagihanId: t.listrik,
      category: 'Tagihan',
      date: dates.listrikLastPaid,
      createdAt: dates.listrikLastPaid,
    }),
    mk({
      walletId: w.bca,
      amount: -300_000,
      type: 'transfer',
      transferPairId: 'topup-1',
      category: 'Transfer',
      date: topup1Date,
      createdAt: topup1Date,
    }),
    mk({
      walletId: w.gopay,
      amount: 300_000,
      type: 'transfer',
      transferPairId: 'topup-1',
      category: 'Transfer',
      date: topup1Date,
      createdAt: topup1Date,
    }),
    mk({
      walletId: w.bca,
      amount: -350_000,
      type: 'transfer',
      transferPairId: 'topup-2',
      category: 'Transfer',
      date: topup2Date,
      createdAt: topup2Date,
    }),
    mk({
      walletId: w.gopay,
      amount: 350_000,
      type: 'transfer',
      transferPairId: 'topup-2',
      category: 'Transfer',
      date: topup2Date,
      createdAt: topup2Date,
    }),
    mk({
      walletId: w.bca,
      amount: -370_000,
      type: 'transfer',
      transferPairId: 'tarik-tunai',
      category: 'Transfer',
      date: tarikTunaiDate,
      createdAt: tarikTunaiDate,
    }),
    mk({
      walletId: w.cash,
      amount: 370_000,
      type: 'transfer',
      transferPairId: 'tarik-tunai',
      category: 'Transfer',
      date: tarikTunaiDate,
      createdAt: tarikTunaiDate,
    }),
  ]
}

type SpendRow = readonly [daysAgoN: number, hour: number, amount: number, label: string]

interface ManualSpend {
  daysAgoN: number
  hour: number
  amount: number
  label: string
  category: string
  wallet: keyof WalletIds
}

function toManualSpend(
  rows: readonly SpendRow[],
  category: string,
  wallet: keyof WalletIds,
): ManualSpend[] {
  return rows.map(([daysAgoN, hour, amount, label]) => ({
    daysAgoN,
    hour,
    amount,
    label,
    category,
    wallet,
  }))
}

function buildManualSpend(): ManualSpend[] {
  const kopi: SpendRow[] = [
    [27, 7, 20000, 'Kopi susu'],
    [24, 8, 22000, 'Americano'],
    [21, 7, 18000, 'Kopi kenangan'],
    [18, 9, 25000, 'Kopi susu'],
    [15, 8, 28000, 'Kopi gula aren'],
    [12, 7, 20000, 'Americano'],
    [9, 8, 24000, 'Kopi susu'],
    [3, 7, 19000, 'Kopi kenangan'],
  ]
  const makanSiang: SpendRow[] = [
    [26, 12, 25000, 'Makan siang'],
    [23, 13, 30000, 'Makan siang'],
    [20, 12, 22000, 'Makan siang'],
    [17, 13, 35000, 'Makan siang'],
    [14, 12, 28000, 'Makan siang'],
    [11, 13, 20000, 'Makan siang'],
    [8, 12, 32000, 'Makan siang'],
    [2, 13, 24000, 'Makan siang'],
  ]
  const gofood: SpendRow[] = [
    [19, 19, 55000, 'GoFood'],
    [13, 20, 65000, 'GoFood'],
    [5, 19, 75000, 'GoFood'],
  ]
  const ojol: SpendRow[] = [
    [25, 8, 15000, 'Ojol'],
    [22, 18, 18000, 'Ojol'],
    [16, 8, 20000, 'Ojol'],
    [7, 18, 22000, 'Ojol'],
    [4, 8, 25000, 'Ojol'],
  ]
  const indomaretCash: SpendRow[] = [
    [9, 20, 20000, 'Indomaret'],
    [18, 20, 35000, 'Indomaret'],
  ]
  const indomaretBca: SpendRow[] = [[26, 20, 28000, 'Indomaret']]
  const nonton: SpendRow[] = [[6, 19, 50000, 'Nonton']]

  return [
    ...toManualSpend(kopi, 'Makanan', 'gopay'),
    ...toManualSpend(makanSiang, 'Makanan', 'cash'),
    ...toManualSpend(gofood, 'Makanan', 'gopay'),
    ...toManualSpend(ojol, 'Transport', 'gopay'),
    ...toManualSpend(indomaretCash, 'Belanja', 'cash'),
    ...toManualSpend(indomaretBca, 'Belanja', 'bca'),
    ...toManualSpend(nonton, 'Hiburan', 'bca'),
  ]
}

function manualSpendToTransactions(spend: ManualSpend[], w: WalletIds): Omit<Transaction, 'id'>[] {
  return spend.map((s) => {
    const date = dayAt(s.daysAgoN, s.hour)
    return {
      walletId: w[s.wallet],
      amount: -s.amount,
      type: 'keluar',
      currency: 'IDR',
      label: s.label,
      category: s.category,
      date,
      isFromSavings: false,
      isEarmark: false,
      createdAt: date,
    }
  })
}

async function applyWalletBalances(
  db: SisaDb,
  w: WalletIds,
  tx: Omit<Transaction, 'id'>[],
): Promise<void> {
  const sums: Record<number, number> = { [w.bca]: 0, [w.gopay]: 0, [w.cash]: 0 }
  for (const t of tx) {
    if (t.isEarmark) continue
    sums[t.walletId] += t.amount
  }
  await db.wallets.update(w.bca, { balance: sums[w.bca] })
  await db.wallets.update(w.gopay, { balance: sums[w.gopay] })
  await db.wallets.update(w.cash, { balance: sums[w.cash] })
}

function buildSettings(dates: DemoDates): Settings {
  return {
    id: 1,
    language: 'en',
    theme: 'system',
    incomeType: 'tetap',
    incomeDay: 25,
    freelanceMinBalance: null,
    primaryCurrency: 'IDR',
    incomeFrequency: 'bulanan',
    incomeAnchorDate: dates.lastPayday,
    weekendBehavior: 'tetap',
    onboardingCompleted: true,
    lastExportedAt: null,
    lastPaydayConfirmed: dates.lastPayday,
    avgIncome: null,
    avgIncomeBasis: null,
    fixedIncome: 5_200_000,
    pushAsked: true,
  }
}

function buildAllocation(dates: DemoDates): Allocation {
  const daysAtLock = Math.round((dates.nextPayday - dates.lastPayday) / DAY_MS)
  const buatDipakai = 3_500_000
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
      name: 'Beli sepatu',
      items: JSON.stringify([{ id: 'item-1', kind: 'beli', desc: 'Sepatu lari', amount: 800_000 }]),
      savedAt,
    },
    {
      name: 'Freelance masuk',
      items: JSON.stringify([
        { id: 'item-2', kind: 'income', desc: 'Project logo', amount: 1_500_000 },
      ]),
      savedAt: dayAt(3, 10),
    },
  ]
}

/**
 * Seeds a demo persona (Raka, 24, karyawan Jakarta) into an empty demo Dexie instance.
 * Caller must supply a demo-only db — never the live singleton. Idempotent: no-ops if
 * settings already exist, so re-running against an already-seeded db is a safe no-op.
 */
export async function seedDemoDb(db: SisaDb): Promise<void> {
  if ((await db.settings.count()) > 0) return

  const dates = buildDates()
  const walletSeeds = buildWalletSeeds(dates.createdAt)
  const tagihanSeeds = buildTagihanSeeds(dates)

  await db.categories.bulkAdd([...DEFAULT_EXPENSE_CATEGORIES, ...DEFAULT_INCOME_CATEGORIES])

  const walletIds: WalletIds = {
    bca: (await db.wallets.add(walletSeeds.bca)) as number,
    gopay: (await db.wallets.add(walletSeeds.gopay)) as number,
    cash: (await db.wallets.add(walletSeeds.cash)) as number,
  }

  const tagihanIds: TagihanIds = {
    kos: (await db.tagihan.add(tagihanSeeds.kos)) as number,
    spotify: (await db.tagihan.add(tagihanSeeds.spotify)) as number,
    listrik: (await db.tagihan.add(tagihanSeeds.listrik)) as number,
  }
  await db.tagihan.add(tagihanSeeds.internet)
  await db.tagihan.add(tagihanSeeds.netflix)

  const manualTx = manualSpendToTransactions(buildManualSpend(), walletIds)
  const coreTx = buildCoreTransactions(walletIds, tagihanIds, dates)
  const allTx = [...coreTx, ...manualTx]

  await db.transactions.bulkAdd(allTx)
  await applyWalletBalances(db, walletIds, allTx)

  await db.settings.put(buildSettings(dates))
  await db.allocation.put(buildAllocation(dates))
  await db.savedScenarios.bulkAdd(buildSavedScenarios())
}
