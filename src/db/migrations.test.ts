import { describe, it, expect } from 'vitest'
import { buildV3MigrationPatch, applyV12WeekendBehaviorFix } from './migrations'

describe('buildV3MigrationPatch', () => {
  it('rutin dueDay=15 → bulanan, anchorDate = day 15 of createdAt month', () => {
    const createdAt = new Date(2025, 2, 10).getTime() // Mar 10 2025
    const patch = buildV3MigrationPatch({ recurrenceType: 'rutin', dueDay: 15, createdAt })
    expect(patch.frequency).toBe('bulanan')
    const anchor = new Date(patch.anchorDate)
    expect(anchor.getFullYear()).toBe(2025)
    expect(anchor.getMonth()).toBe(2) // March
    expect(anchor.getDate()).toBe(15)
  })

  it('rutin dueDay=31 (Jan) → bulanan, anchorDate = Jan 31 (no overflow)', () => {
    const createdAt = new Date(2025, 0, 5).getTime() // Jan 5 2025
    const patch = buildV3MigrationPatch({ recurrenceType: 'rutin', dueDay: 31, createdAt })
    expect(patch.frequency).toBe('bulanan')
    const anchor = new Date(patch.anchorDate)
    expect(anchor.getFullYear()).toBe(2025)
    expect(anchor.getMonth()).toBe(0) // January
    expect(anchor.getDate()).toBe(31)
  })

  it('rutin dueDay=31 from Feb createdAt → JS overflow to March (documented behavior)', () => {
    const createdAt = new Date(2025, 1, 3).getTime() // Feb 3 2025
    const patch = buildV3MigrationPatch({ recurrenceType: 'rutin', dueDay: 31, createdAt })
    // Feb has 28 days in 2025 → new Date(2025, 1, 31) overflows to Mar 3
    const anchor = new Date(patch.anchorDate)
    expect(anchor.getFullYear()).toBe(2025)
    expect(anchor.getMonth()).toBe(2) // March (overflow)
  })

  it('sekali dueDay=20 → sekali, correct anchorDate', () => {
    const createdAt = new Date(2025, 5, 1).getTime() // Jun 1 2025
    const patch = buildV3MigrationPatch({ recurrenceType: 'sekali', dueDay: 20, createdAt })
    expect(patch.frequency).toBe('sekali')
    const anchor = new Date(patch.anchorDate)
    expect(anchor.getFullYear()).toBe(2025)
    expect(anchor.getMonth()).toBe(5) // June
    expect(anchor.getDate()).toBe(20)
  })

  it('no data loss: original fields remain unchanged', () => {
    const record = { recurrenceType: 'rutin', dueDay: 5, createdAt: new Date(2024, 3, 1).getTime() }
    const patch = buildV3MigrationPatch(record)
    // patch only adds new fields; original record object is not mutated
    expect(record.recurrenceType).toBe('rutin')
    expect(record.dueDay).toBe(5)
    expect(Object.keys(patch)).toEqual(['frequency', 'anchorDate'])
  })
})

describe('applyV12WeekendBehaviorFix', () => {
  it('null weekendBehavior → tetap', () => {
    const row: Record<string, unknown> = { weekendBehavior: null }
    applyV12WeekendBehaviorFix(row)
    expect(row.weekendBehavior).toBe('tetap')
  })

  it('undefined weekendBehavior → tetap', () => {
    const row: Record<string, unknown> = {}
    applyV12WeekendBehaviorFix(row)
    expect(row.weekendBehavior).toBe('tetap')
  })

  it("'tidak-konsisten' → tetap", () => {
    const row: Record<string, unknown> = { weekendBehavior: 'tidak-konsisten' }
    applyV12WeekendBehaviorFix(row)
    expect(row.weekendBehavior).toBe('tetap')
  })

  it("valid values unchanged: 'maju-jumat', 'mundur-senin', 'tetap'", () => {
    for (const val of ['maju-jumat', 'mundur-senin', 'tetap']) {
      const row: Record<string, unknown> = { weekendBehavior: val }
      applyV12WeekendBehaviorFix(row)
      expect(row.weekendBehavior).toBe(val)
    }
  })
})
