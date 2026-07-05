import { describe, it, expect } from 'vitest'
import { buildKeluar, buildMasuk, buildTransaction } from './quickLog.utils'
import type { QuickLogInput } from './quickLog.utils'

const BASE: QuickLogInput = {
  mode: 'keluar',
  walletId: 1,
  amount: 50000,
  label: 'makan',
  dateMs: 1700000000000,
  nowMs: 1700000001000,
  currency: 'IDR',
  category: 'Lainnya',
}

describe('buildKeluar', () => {
  it('amount is negative', () => {
    const tx = buildKeluar(BASE)
    expect(tx.amount).toBe(-50000)
    expect(tx.type).toBe('keluar')
  })

  it('already-negative input is still stored negative', () => {
    const tx = buildKeluar({ ...BASE, amount: -50000 })
    expect(tx.amount).toBe(-50000)
  })

  it('isFromSavings always false, isEarmark always false', () => {
    const tx = buildKeluar(BASE)
    expect(tx.isFromSavings).toBe(false)
    expect(tx.isEarmark).toBe(false)
  })

  it('omits empty label', () => {
    const tx = buildKeluar({ ...BASE, label: '' })
    expect(tx.label).toBeUndefined()
  })

  it('note field absent', () => {
    const tx = buildKeluar(BASE)
    expect(tx.note).toBeUndefined()
  })

  it('createdAt = nowMs, not Date.now()', () => {
    const tx = buildKeluar(BASE)
    expect(tx.createdAt).toBe(BASE.nowMs)
  })
})

describe('buildMasuk', () => {
  it('amount is positive', () => {
    const tx = buildMasuk({ ...BASE, mode: 'masuk', amount: 3000000 })
    expect(tx.amount).toBe(3000000)
    expect(tx.type).toBe('masuk')
  })

  it('isFromSavings is always false', () => {
    const tx = buildMasuk({ ...BASE, mode: 'masuk' })
    expect(tx.isFromSavings).toBe(false)
  })

  it('isEarmark is always false', () => {
    const tx = buildMasuk({ ...BASE, mode: 'masuk' })
    expect(tx.isEarmark).toBe(false)
  })

  it('createdAt = nowMs, not Date.now()', () => {
    const tx = buildMasuk({ ...BASE, mode: 'masuk' })
    expect(tx.createdAt).toBe(BASE.nowMs)
  })
})

describe('buildTransaction', () => {
  it('routes keluar correctly', () => {
    const tx = buildTransaction({ ...BASE, mode: 'keluar' })
    expect(tx.type).toBe('keluar')
    expect(tx.amount).toBeLessThan(0)
  })

  it('routes masuk correctly', () => {
    const tx = buildTransaction({ ...BASE, mode: 'masuk' })
    expect(tx.type).toBe('masuk')
    expect(tx.amount).toBeGreaterThan(0)
  })

  it('preserves walletId and currency', () => {
    const tx = buildTransaction({ ...BASE, walletId: 3, currency: 'USD' })
    expect(tx.walletId).toBe(3)
    expect(tx.currency).toBe('USD')
  })

  it('preserves date', () => {
    const tx = buildTransaction({ ...BASE, dateMs: 1699999999000 })
    expect(tx.date).toBe(1699999999000)
  })

  it('no note field on QuickLogInput', () => {
    const tx = buildTransaction(BASE)
    expect(tx.note).toBeUndefined()
  })
})
