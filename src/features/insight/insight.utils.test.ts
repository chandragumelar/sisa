import { describe, it, expect } from 'vitest'
import type { Transaction } from '@/db/database'
import {
  sumExpense,
  sumIncome,
  spendPct,
  dailyAvg,
  buildHeroVariant,
  aggregateByCategory,
  buildCategoryRanking,
  buildTop5,
  buildChartData,
  formatMonthShort,
} from './insight.utils'

type TxType = Transaction['type']

function makeTx(
  id: number,
  type: TxType,
  amount: number,
  category: string,
  label: string,
  dateStr: string,
): Transaction {
  return {
    id,
    walletId: 1,
    amount,
    type,
    currency: 'IDR',
    label,
    category,
    date: new Date(dateStr).getTime(),
    isFromSavings: false,
    isEarmark: false,
    createdAt: 0,
  }
}

// ── Dummy data ────────────────────────────────────────────────────────────────
// Juni 2025: income 8.5M, expense 6.12M → net +2.38M, spend% 72%
// Top-5 single txs: Sewa Kos 1.2M, Belanja Bulanan 950k, Tagihan Listrik 340k, Grab 220k, GoPay Makan 185k
// Kesehatan: 380k (Juni) vs 260k (Mei) → delta +46%
// Kopi: 600k (Juni) vs 430k (Mei) → delta +40%

const juniIncome: Transaction[] = [
  makeTx(1, 'masuk', 8_000_000, 'Pemasukan', 'Gaji', '2025-06-25'),
  makeTx(2, 'masuk', 500_000, 'Pemasukan', 'Freelance', '2025-06-12'),
]

const juniExpenseTop5: Transaction[] = [
  makeTx(3, 'keluar', -1_200_000, 'Sewa', 'Sewa Kos', '2025-06-01'),
  makeTx(4, 'keluar', -950_000, 'Belanja', 'Belanja Bulanan', '2025-06-10'),
  makeTx(5, 'tagihan', -340_000, 'Tagihan', 'Tagihan Listrik', '2025-06-05'),
  makeTx(6, 'keluar', -220_000, 'Transport', 'Grab', '2025-06-18'),
  makeTx(7, 'keluar', -185_000, 'Makan', 'GoPay Makan', '2025-06-20'),
]

const juniExpenseOther: Transaction[] = [
  // Makan extra: 8 × 175k = 1.400k (each < 185k, so top-5 rank 5 stays)
  ...Array.from({ length: 8 }, (_, i) =>
    makeTx(10 + i, 'keluar', -175_000, 'Makan', 'Makan', `2025-06-0${(i % 9) + 1}`),
  ),
  // Kopi: 4 × 150k = 600k
  ...Array.from({ length: 4 }, (_, i) =>
    makeTx(20 + i, 'keluar', -150_000, 'Kopi', 'Kopi', `2025-06-0${i + 1}`),
  ),
  // Kesehatan: 2×130k + 1×120k = 380k
  makeTx(30, 'keluar', -130_000, 'Kesehatan', 'Dokter', '2025-06-10'),
  makeTx(31, 'keluar', -130_000, 'Kesehatan', 'Apotek', '2025-06-15'),
  makeTx(32, 'keluar', -120_000, 'Kesehatan', 'Vitamin', '2025-06-20'),
  // Transport extra: 5 × 79k = 395k
  ...Array.from({ length: 5 }, (_, i) =>
    makeTx(40 + i, 'keluar', -79_000, 'Transport', 'Ojek', `2025-06-0${i + 1}`),
  ),
  // Hiburan: 3 × 150k = 450k
  ...Array.from({ length: 3 }, (_, i) =>
    makeTx(50 + i, 'keluar', -150_000, 'Hiburan', 'Hiburan', `2025-06-0${i + 1}`),
  ),
]
// Total expense: top-5(2.895k) + makan(1.400k) + kopi(600k) + kes(380k) + trans(395k) + hib(450k) = 6.120k ✓

const juniTxs: Transaction[] = [...juniIncome, ...juniExpenseTop5, ...juniExpenseOther]

const meiTxs: Transaction[] = [
  makeTx(100, 'masuk', 8_760_000, 'Pemasukan', 'Gaji', '2025-05-25'),
  // Kesehatan Mei: 260k
  makeTx(110, 'keluar', -130_000, 'Kesehatan', 'Dokter', '2025-05-10'),
  makeTx(111, 'keluar', -130_000, 'Kesehatan', 'Vitamin', '2025-05-20'),
  // Kopi Mei: 430k
  makeTx(120, 'keluar', -150_000, 'Kopi', 'Kopi', '2025-05-05'),
  makeTx(121, 'keluar', -150_000, 'Kopi', 'Kopi', '2025-05-12'),
  makeTx(122, 'keluar', -130_000, 'Kopi', 'Kopi', '2025-05-20'),
  makeTx(130, 'keluar', -400_000, 'Makan', 'Makan', '2025-05-15'),
]

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('sumExpense / sumIncome — dummy data', () => {
  it('net Juni = +2.380.000', () => {
    expect(sumIncome(juniTxs) - sumExpense(juniTxs)).toBe(2_380_000)
  })

  it('persen pakai = 72%', () => {
    expect(spendPct(sumExpense(juniTxs), sumIncome(juniTxs))).toBe(72)
  })

  it('empty → zero', () => {
    expect(sumExpense([])).toBe(0)
    expect(sumIncome([])).toBe(0)
  })
})

describe('spendPct', () => {
  it('returns null when income is 0', () => {
    expect(spendPct(100, 0)).toBeNull()
  })

  it('rounds correctly', () => {
    expect(spendPct(1, 3)).toBe(33) // 33.33% → 33
  })
})

describe('dailyAvg', () => {
  it('rounds expense / days', () => {
    expect(dailyAvg(6_120_000, 30)).toBe(204_000)
  })

  it('returns 0 when daysElapsed = 0', () => {
    expect(dailyAvg(1_000, 0)).toBe(0)
  })
})

describe('buildCategoryRanking — delta', () => {
  it('Kesehatan delta = +46%', () => {
    const curr = aggregateByCategory(juniTxs)
    const prev = aggregateByCategory(meiTxs)
    const rows = buildCategoryRanking(curr, prev)
    const kes = rows.find((r) => r.name === 'Kesehatan')
    expect(kes?.deltaPct).toBe(46)
  })

  it('Kopi delta = +40%', () => {
    const curr = aggregateByCategory(juniTxs)
    const prev = aggregateByCategory(meiTxs)
    const rows = buildCategoryRanking(curr, prev)
    const kopi = rows.find((r) => r.name === 'Kopi')
    expect(kopi?.deltaPct).toBe(40)
  })

  it('ranking sorted desc by amount', () => {
    const curr = aggregateByCategory(juniTxs)
    const rows = buildCategoryRanking(curr, new Map())
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i - 1].amount).toBeGreaterThanOrEqual(rows[i].amount)
    }
  })

  it('>15 categories → Lainnya row appended', () => {
    const big = new Map(Array.from({ length: 20 }, (_, i) => [`Cat${i + 1}`, (20 - i) * 1000]))
    const rows = buildCategoryRanking(big, new Map())
    expect(rows).toHaveLength(16) // 15 capped + 1 Lainnya
    expect(rows[15].name).toBe('Lainnya')
    // Cat16-Cat20: 5+4+3+2+1 = 15k
    expect(rows[15].amount).toBe(15_000)
  })

  it('empty → empty array', () => {
    expect(buildCategoryRanking(new Map(), new Map())).toEqual([])
  })
})

describe('buildTop5', () => {
  it('top 5 ordered by amount desc', () => {
    const top5 = buildTop5(juniTxs)
    expect(top5).toHaveLength(5)
    expect(top5[0].amount).toBe(1_200_000)
    expect(top5[1].amount).toBe(950_000)
    expect(top5[2].amount).toBe(340_000)
    expect(top5[3].amount).toBe(220_000)
    expect(top5[4].amount).toBe(185_000)
  })

  it('top-5 labels match expected transactions', () => {
    const top5 = buildTop5(juniTxs)
    expect(top5[0].label).toBe('Sewa Kos')
    expect(top5[1].label).toBe('Belanja Bulanan')
    expect(top5[4].label).toBe('GoPay Makan')
  })

  it('empty → empty array', () => {
    expect(buildTop5([])).toEqual([])
  })
})

describe('buildHeroVariant', () => {
  it('comparative hemat when prev > curr', () => {
    const v = buildHeroVariant(6_120_000, 8_500_000, 6_960_000)
    expect(v.kind).toBe('comparative')
    if (v.kind === 'comparative') expect(v.hemat).toBe(true)
  })

  it('comparative boros when curr > prev', () => {
    const v = buildHeroVariant(7_000_000, 8_500_000, 5_000_000)
    expect(v.kind).toBe('comparative')
    if (v.kind === 'comparative') expect(v.hemat).toBe(false)
  })

  it('ratio when no prev but has income', () => {
    const v = buildHeroVariant(6_120_000, 8_500_000, null)
    expect(v.kind).toBe('ratio')
    if (v.kind === 'ratio') expect(v.pct).toBe(72)
  })

  it('neutral when no prev and no income', () => {
    const v = buildHeroVariant(0, 0, null)
    expect(v.kind).toBe('neutral')
  })
})

describe('buildChartData', () => {
  it('single-month data → length 1 (leading empties stripped)', () => {
    // juniTxs only has data in Juni 2025 (month 5); endMonth = 5
    const bars = buildChartData(juniTxs, 2025, 5)
    expect(bars).toHaveLength(1)
    expect(bars[0].year).toBe(2025)
    expect(bars[0].month).toBe(5)
    expect(bars[0].keluar).toBe(sumExpense(juniTxs))
  })

  it('last bar = view month even when it has data', () => {
    const bars = buildChartData(juniTxs, 2025, 5)
    const last = bars[bars.length - 1]
    expect(last.year).toBe(2025)
    expect(last.month).toBe(5)
  })

  it('empty txs → returns 1 bar (current month, all zeros)', () => {
    const bars = buildChartData([], 2025, 5)
    expect(bars).toHaveLength(1)
    expect(bars[0].year).toBe(2025)
    expect(bars[0].month).toBe(5)
    expect(bars[0].net).toBe(0)
  })

  it('gap in middle preserved — no leading empties trimmed past first active month', () => {
    // Data in Apr (month 3) and Jun (month 5), nothing in May (month 4)
    const aprTx = makeTx(999, 'keluar', -100_000, 'Test', 'Test', '2025-04-15')
    const junTx = makeTx(998, 'keluar', -200_000, 'Test', 'Test', '2025-06-15')
    const bars = buildChartData([aprTx, junTx], 2025, 5)
    // Apr is first active → strip months before Apr (8 leading empties gone)
    // Keep Apr, May (gap), Jun = 3 bars
    expect(bars).toHaveLength(3)
    expect(bars[0].month).toBe(3) // Apr
    expect(bars[1].keluar).toBe(0) // May gap preserved
    expect(bars[2].month).toBe(5) // Jun
  })

  it('data in oldest slot → all 12 bars kept (no stripping)', () => {
    // Tx in July 2024 = the oldest slot when endMonth is June 2025
    const oldTx = makeTx(800, 'keluar', -50_000, 'Test', 'Test', '2024-07-15')
    const bars = buildChartData([oldTx], 2025, 5)
    expect(bars).toHaveLength(12)
    expect(bars[0].month).toBe(6) // July 2024 = month 6
    expect(bars[0].year).toBe(2024)
  })
})

describe('formatMonthShort', () => {
  it('returns mmm-yy format in lowercase (ID)', () => {
    const result = formatMonthShort(2025, 6, 'id') // Juli 2025
    expect(result).toMatch(/^[a-z]+-25$/)
    expect(result.endsWith('-25')).toBe(true)
  })

  it('returns mmm-yy format in lowercase (EN)', () => {
    const result = formatMonthShort(2026, 11, 'en') // Dec 2026
    expect(result).toBe('dec-26')
  })

  it('cross-year distinguishable — dec-25 vs jan-26', () => {
    const dec = formatMonthShort(2025, 11, 'en')
    const jan = formatMonthShort(2026, 0, 'en')
    expect(dec).toBe('dec-25')
    expect(jan).toBe('jan-26')
    expect(dec).not.toBe(jan)
  })
})
