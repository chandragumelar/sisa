import { describe, it, expect } from 'vitest'
import { buildKeluar, buildMasuk, buildNabung, buildTransaction } from './quickLog.utils'
import type { QuickLogInput } from './quickLog.utils'

const BASE: QuickLogInput = {
  mode: 'keluar',
  walletId: 1,
  amount: 50000,
  label: 'makan',
  note: '',
  dateMs: 1700000000000,
  currency: 'IDR',
  isFromSavings: false,
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

  it('sets isFromSavings flag', () => {
    const tx = buildKeluar({ ...BASE, isFromSavings: true })
    expect(tx.isFromSavings).toBe(true)
    expect(tx.isEarmark).toBe(false)
  })

  it('omits empty label/note', () => {
    const tx = buildKeluar({ ...BASE, label: '', note: '' })
    expect(tx.label).toBeUndefined()
    expect(tx.note).toBeUndefined()
  })

  it('keeps non-empty label and note', () => {
    const tx = buildKeluar({ ...BASE, label: 'makan', note: 'warung padang' })
    expect(tx.label).toBe('makan')
    expect(tx.note).toBe('warung padang')
  })
})

describe('buildMasuk', () => {
  it('amount is positive', () => {
    const tx = buildMasuk({ ...BASE, mode: 'masuk', amount: 3000000 })
    expect(tx.amount).toBe(3000000)
    expect(tx.type).toBe('masuk')
  })

  it('isFromSavings is always false', () => {
    const tx = buildMasuk({ ...BASE, mode: 'masuk', isFromSavings: true })
    expect(tx.isFromSavings).toBe(false)
  })

  it('isEarmark is always false', () => {
    const tx = buildMasuk({ ...BASE, mode: 'masuk' })
    expect(tx.isEarmark).toBe(false)
  })
})

describe('buildNabung', () => {
  it('positive amount, type nabung', () => {
    const tx = buildNabung({ ...BASE, mode: 'nabung' })
    expect(tx.amount).toBe(50000)
    expect(tx.type).toBe('nabung')
  })

  it('isEarmark is always true', () => {
    const tx = buildNabung({ ...BASE, mode: 'nabung' })
    expect(tx.isEarmark).toBe(true)
  })

  it('never mutates wallet saldo — isEarmark always true', () => {
    const tx = buildNabung({ ...BASE, mode: 'nabung' })
    expect(tx.amount).toBe(50000)
    expect(tx.isEarmark).toBe(true)
  })

  it('isFromSavings is always false', () => {
    const tx = buildNabung({ ...BASE, mode: 'nabung' })
    expect(tx.isFromSavings).toBe(false)
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

  it('routes nabung correctly', () => {
    const tx = buildTransaction({ ...BASE, mode: 'nabung' })
    expect(tx.type).toBe('nabung')
    expect(tx.isEarmark).toBe(true)
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
})
