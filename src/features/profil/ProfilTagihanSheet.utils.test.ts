import { describe, it, expect } from 'vitest'
import { computeAnchor, type FormState, EMPTY_FORM } from './ProfilTagihanSheet.utils'

// Base clock: Friday 15 March 2024 noon local — avoids UTC-date-string timezone edge cases
const NOW_MS = new Date(2024, 2, 15, 12, 0, 0).getTime()

function form(overrides: Partial<FormState>): FormState {
  return { ...EMPTY_FORM, ...overrides }
}

// ─────────────────────────────────────────────────────────
// sekali
// ─────────────────────────────────────────────────────────
describe('computeAnchor — sekali', () => {
  it('fullDate ada → anchorDate = tanggal tersebut', () => {
    const f = form({ frequency: 'sekali', fullDate: '2024-04-10' })
    const d = new Date('2024-04-10')
    const result = computeAnchor(f, NOW_MS)
    expect(result.anchorDate).toBe(d.getTime())
    expect(result.dueDay).toBe(d.getDate())
  })

  it('fullDate kosong → anchorDate = nowMs, dueDay = getDate(now)', () => {
    const f = form({ frequency: 'sekali', fullDate: '' })
    const result = computeAnchor(f, NOW_MS)
    expect(result.anchorDate).toBe(NOW_MS)
    expect(result.dueDay).toBe(new Date(NOW_MS).getDate()) // 15
  })

  it('fullDate Feb 29 tahun kabisat → anchorDate valid', () => {
    const f = form({ frequency: 'sekali', fullDate: '2024-02-29' })
    const d = new Date('2024-02-29')
    const result = computeAnchor(f, NOW_MS)
    expect(result.anchorDate).toBe(d.getTime())
    expect(result.dueDay).toBe(d.getDate())
  })
})

// ─────────────────────────────────────────────────────────
// mingguan — nowMs = Jumat (jsDay 5)
// ─────────────────────────────────────────────────────────
describe('computeAnchor — mingguan', () => {
  it('weekDay cocok hari ini → diff 0 (same day)', () => {
    // ISO 5 = Jumat, jsDay 5 = Jumat; diff=(5-5+7)%7=0
    const f = form({ frequency: 'mingguan', weekDay: '5' })
    const result = computeAnchor(f, NOW_MS)
    expect(result.anchorDate).toBe(new Date(2024, 2, 15).getTime())
    expect(result.dueDay).toBe(1)
  })

  it('weekDay 7 (Minggu ISO) → jsDay 0 → diff 2 → Mar 17', () => {
    // diff=(0-5+7)%7=2
    const f = form({ frequency: 'mingguan', weekDay: '7' })
    const result = computeAnchor(f, NOW_MS)
    expect(result.anchorDate).toBe(new Date(2024, 2, 17).getTime())
    expect(result.dueDay).toBe(1)
  })

  it('weekDay 1 (Senin ISO) → diff 3 → Mar 18', () => {
    // diff=(1-5+7)%7=3
    const f = form({ frequency: 'mingguan', weekDay: '1' })
    const result = computeAnchor(f, NOW_MS)
    expect(result.anchorDate).toBe(new Date(2024, 2, 18).getTime())
    expect(result.dueDay).toBe(1)
  })

  it('weekDay kosong → default ISO 1 (Senin) → diff 3', () => {
    // parseInt('',10)=NaN, NaN||1=1
    const f = form({ frequency: 'mingguan', weekDay: '' })
    const result = computeAnchor(f, NOW_MS)
    expect(result.anchorDate).toBe(new Date(2024, 2, 18).getTime())
    expect(result.dueDay).toBe(1)
  })
})

// ─────────────────────────────────────────────────────────
// 2mingguan — logika identik mingguan
// ─────────────────────────────────────────────────────────
describe('computeAnchor — 2mingguan', () => {
  it('weekDay 7 (Minggu) → diff 2 → Mar 17', () => {
    const f = form({ frequency: '2mingguan', weekDay: '7' })
    const result = computeAnchor(f, NOW_MS)
    expect(result.anchorDate).toBe(new Date(2024, 2, 17).getTime())
    expect(result.dueDay).toBe(1)
  })

  it('weekDay cocok hari ini → diff 0', () => {
    const f = form({ frequency: '2mingguan', weekDay: '5' })
    const result = computeAnchor(f, NOW_MS)
    expect(result.anchorDate).toBe(new Date(2024, 2, 15).getTime())
    expect(result.dueDay).toBe(1)
  })
})

// ─────────────────────────────────────────────────────────
// bulanan
// ─────────────────────────────────────────────────────────
describe('computeAnchor — bulanan', () => {
  it('dueDay valid → anchorDate=nowMs, dueDay diparse', () => {
    const f = form({ frequency: 'bulanan', dueDay: '25' })
    const result = computeAnchor(f, NOW_MS)
    expect(result.anchorDate).toBe(NOW_MS)
    expect(result.dueDay).toBe(25)
  })

  it('dueDay kosong → default 1', () => {
    const f = form({ frequency: 'bulanan', dueDay: '' })
    const result = computeAnchor(f, NOW_MS)
    expect(result.anchorDate).toBe(NOW_MS)
    expect(result.dueDay).toBe(1)
  })
})

// ─────────────────────────────────────────────────────────
// 2bulanan
// ─────────────────────────────────────────────────────────
describe('computeAnchor — 2bulanan', () => {
  it('anchorMonth + dueDay valid → anchor di bulan tersebut', () => {
    const f = form({ frequency: '2bulanan', anchorMonth: '6', dueDay: '15' })
    const result = computeAnchor(f, NOW_MS)
    expect(result.anchorDate).toBe(new Date(2024, 5, 15).getTime()) // June 15
    expect(result.dueDay).toBe(15)
  })

  it('day > 28 di Feb → di-clamp ke 28; dueDay dikembalikan as-is', () => {
    const f = form({ frequency: '2bulanan', anchorMonth: '2', dueDay: '31' })
    const result = computeAnchor(f, NOW_MS)
    expect(result.anchorDate).toBe(new Date(2024, 1, 28).getTime()) // Feb 28
    expect(result.dueDay).toBe(31) // as-is, tidak di-clamp
  })

  it('anchorMonth kosong → fallback bulan sekarang (Maret)', () => {
    // now = March 2024, getMonth()+1 = 3 → month = 3-1 = 2 (March, 0-indexed)
    const f = form({ frequency: '2bulanan', anchorMonth: '', dueDay: '10' })
    const result = computeAnchor(f, NOW_MS)
    expect(result.anchorDate).toBe(new Date(2024, 2, 10).getTime())
    expect(result.dueDay).toBe(10)
  })

  it('dueDay kosong → default 1', () => {
    const f = form({ frequency: '2bulanan', anchorMonth: '4', dueDay: '' })
    const result = computeAnchor(f, NOW_MS)
    expect(result.anchorDate).toBe(new Date(2024, 3, 1).getTime()) // April 1
    expect(result.dueDay).toBe(1)
  })
})

// ─────────────────────────────────────────────────────────
// 3bulanan — code path sama dengan 2bulanan
// ─────────────────────────────────────────────────────────
describe('computeAnchor — 3bulanan', () => {
  it('anchorMonth + dueDay valid', () => {
    const f = form({ frequency: '3bulanan', anchorMonth: '9', dueDay: '5' })
    const result = computeAnchor(f, NOW_MS)
    expect(result.anchorDate).toBe(new Date(2024, 8, 5).getTime()) // Sep 5
    expect(result.dueDay).toBe(5)
  })

  it('day 31 di Feb → clamp ke 28', () => {
    const f = form({ frequency: '3bulanan', anchorMonth: '2', dueDay: '31' })
    const result = computeAnchor(f, NOW_MS)
    expect(result.anchorDate).toBe(new Date(2024, 1, 28).getTime())
    expect(result.dueDay).toBe(31)
  })
})

// ─────────────────────────────────────────────────────────
// tahunan
// ─────────────────────────────────────────────────────────
describe('computeAnchor — tahunan', () => {
  it('annualMonth + dueDay valid', () => {
    const f = form({ frequency: 'tahunan', annualMonth: '12', dueDay: '20' })
    const result = computeAnchor(f, NOW_MS)
    expect(result.anchorDate).toBe(new Date(2024, 11, 20).getTime()) // Dec 20
    expect(result.dueDay).toBe(20)
  })

  it('day 31 di Feb → clamp ke 28', () => {
    const f = form({ frequency: 'tahunan', annualMonth: '2', dueDay: '31' })
    const result = computeAnchor(f, NOW_MS)
    expect(result.anchorDate).toBe(new Date(2024, 1, 28).getTime())
    expect(result.dueDay).toBe(31)
  })

  it('annualMonth kosong → fallback bulan sekarang', () => {
    const f = form({ frequency: 'tahunan', annualMonth: '', dueDay: '1' })
    const result = computeAnchor(f, NOW_MS)
    expect(result.anchorDate).toBe(new Date(2024, 2, 1).getTime()) // March 1
    expect(result.dueDay).toBe(1)
  })
})

// ─────────────────────────────────────────────────────────
// boundary kabisat
// ─────────────────────────────────────────────────────────
describe('computeAnchor — boundary kabisat', () => {
  it('2bulanan Feb day 29 → clamp ke 28, konsisten di kabisat maupun bukan', () => {
    const nowLeap = new Date(2024, 0, 15, 12, 0, 0).getTime() // Jan 2024 (kabisat)
    const nowNonLeap = new Date(2023, 0, 15, 12, 0, 0).getTime() // Jan 2023 (bukan kabisat)
    const f = form({ frequency: '2bulanan', anchorMonth: '2', dueDay: '29' })

    // Math.min(29, 28) = 28 → Feb 28 di kedua tahun
    const rLeap = computeAnchor(f, nowLeap)
    expect(rLeap.anchorDate).toBe(new Date(2024, 1, 28).getTime())
    expect(rLeap.dueDay).toBe(29) // dikembalikan as-is

    const rNonLeap = computeAnchor(f, nowNonLeap)
    expect(rNonLeap.anchorDate).toBe(new Date(2023, 1, 28).getTime())
    expect(rNonLeap.dueDay).toBe(29)
  })

  it('tahunan Feb day 29 → clamp ke 28', () => {
    const f = form({ frequency: 'tahunan', annualMonth: '2', dueDay: '29' })
    const result = computeAnchor(f, NOW_MS) // year = 2024
    expect(result.anchorDate).toBe(new Date(2024, 1, 28).getTime())
    expect(result.dueDay).toBe(29)
  })
})
