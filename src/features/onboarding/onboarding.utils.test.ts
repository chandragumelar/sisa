import { describe, it, expect } from 'vitest'
import {
  getProgressCount,
  getNextStep,
  buildSettings,
  parseWalletBalance,
  buildWalletRecords,
  TOTAL_PROGRESS_DOTS,
} from './onboarding.utils'
import type { CompletedOnboardingData } from './onboarding.utils'
import type { WalletInput } from './onboarding.types'

// ---------------------------------------------------------------------------
// getProgressCount
// ---------------------------------------------------------------------------
describe('getProgressCount', () => {
  it('langCurrency → 1', () => expect(getProgressCount('langCurrency')).toBe(1))
  it('license → 2', () => expect(getProgressCount('license')).toBe(2))
  it('incomeType → 3', () => expect(getProgressCount('incomeType')).toBe(3))
  it('incomeDetail → 3 (same dot as incomeType)', () =>
    expect(getProgressCount('incomeDetail')).toBe(3))
  it('payConfirm → 3 (same dot)', () => expect(getProgressCount('payConfirm')).toBe(3))
  it('tagihan → 4', () => expect(getProgressCount('tagihan')).toBe(4))
  it('wallet → 4 (same dot as tagihan)', () => expect(getProgressCount('wallet')).toBe(4))
  it('alokasi → 5', () => expect(getProgressCount('alokasi')).toBe(5))
  it('max filled equals TOTAL_PROGRESS_DOTS', () => {
    expect(getProgressCount('alokasi')).toBe(TOTAL_PROGRESS_DOTS)
  })
  it('TOTAL_PROGRESS_DOTS is 5', () => expect(TOTAL_PROGRESS_DOTS).toBe(5))
})

// ---------------------------------------------------------------------------
// getNextStep
// ---------------------------------------------------------------------------
describe('getNextStep', () => {
  it('langCurrency → license', () => {
    expect(getNextStep('langCurrency', null)).toBe('license')
  })
  it('license → incomeType', () => {
    expect(getNextStep('license', null)).toBe('incomeType')
  })
  it('incomeType → incomeDetail', () => {
    expect(getNextStep('incomeType', 'tetap')).toBe('incomeDetail')
  })
  it('incomeDetail + freelance → tagihan (skip payConfirm, currency already chosen)', () => {
    expect(getNextStep('incomeDetail', 'freelance')).toBe('tagihan')
  })
  it('incomeDetail + tetap → payConfirm', () => {
    expect(getNextStep('incomeDetail', 'tetap')).toBe('payConfirm')
  })
  it('incomeDetail + mix → payConfirm', () => {
    expect(getNextStep('incomeDetail', 'mix')).toBe('payConfirm')
  })
  it('payConfirm → tagihan', () => {
    expect(getNextStep('payConfirm', 'tetap')).toBe('tagihan')
  })
  it('tagihan → wallet', () => {
    expect(getNextStep('tagihan', 'tetap')).toBe('wallet')
  })
  it('wallet → alokasi', () => {
    expect(getNextStep('wallet', 'tetap')).toBe('alokasi')
  })
  it('alokasi → done', () => {
    expect(getNextStep('alokasi', 'tetap')).toBe('done')
  })
})

// ---------------------------------------------------------------------------
// buildSettings
// ---------------------------------------------------------------------------
describe('buildSettings', () => {
  const base: CompletedOnboardingData = {
    language: 'id',
    incomeType: 'tetap',
    incomeFrequency: 'bulanan',
    incomeAnchorDate: null,
    incomeDay: 25,
    freelanceMinBalance: null,
    fixedIncome: null,
    avgIncome: null,
    avgIncomeBasis: null,
    lastPaydayConfirmed: null,
    primaryCurrency: 'IDR',
  }

  it('always sets onboardingCompleted: true', () => {
    expect(buildSettings(base).onboardingCompleted).toBe(true)
  })

  it('maps all fields correctly', () => {
    const s = buildSettings(base)
    expect(s.id).toBe(1)
    expect(s.language).toBe('id')
    expect(s.incomeType).toBe('tetap')
    expect(s.incomeDay).toBe(25)
    expect(s.primaryCurrency).toBe('IDR')
    expect(s.weekendBehavior).toBe('tetap')
    expect(s.lastExportedAt).toBeNull()
  })

  it('handles freelance with minBalance', () => {
    const s = buildSettings({
      ...base,
      incomeType: 'freelance',
      incomeDay: null,
      freelanceMinBalance: 500000,
    })
    expect(s.incomeType).toBe('freelance')
    expect(s.incomeDay).toBeNull()
    expect(s.freelanceMinBalance).toBe(500000)
  })

  it('avgIncome and avgIncomeBasis are passed through', () => {
    const s = buildSettings({ ...base, avgIncome: 5_000_000, avgIncomeBasis: 'bulanan' })
    expect(s.avgIncome).toBe(5_000_000)
    expect(s.avgIncomeBasis).toBe('bulanan')
  })

  it('lastPaydayConfirmed=null stored as null', () => {
    const s = buildSettings({ ...base, lastPaydayConfirmed: null })
    expect(s.lastPaydayConfirmed).toBeNull()
  })

  it('lastPaydayConfirmed epoch ms stored correctly', () => {
    const epoch = new Date('2024-01-10T12:00:00Z').getTime()
    const s = buildSettings({ ...base, lastPaydayConfirmed: epoch })
    expect(s.lastPaydayConfirmed).toBe(epoch)
  })
})

// ---------------------------------------------------------------------------
// parseWalletBalance
// ---------------------------------------------------------------------------
describe('parseWalletBalance', () => {
  it('parses positive integer string', () => {
    expect(parseWalletBalance('500000')).toBe(500000)
  })
  it('parses decimal string', () => {
    expect(parseWalletBalance('1234.5')).toBe(1234.5)
  })
  it('empty string → 0', () => {
    expect(parseWalletBalance('')).toBe(0)
  })
  it('whitespace-only string → 0', () => {
    expect(parseWalletBalance('   ')).toBe(0)
  })
  it('non-numeric string → 0', () => {
    expect(parseWalletBalance('abc')).toBe(0)
  })
  it('negative value → 0', () => {
    expect(parseWalletBalance('-100')).toBe(0)
  })
  it('zero → 0', () => {
    expect(parseWalletBalance('0')).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// buildWalletRecords
// ---------------------------------------------------------------------------
describe('buildWalletRecords', () => {
  const NOW = 1_700_000_000_000
  const inputs: WalletInput[] = [
    { id: '1', name: 'BCA', balance: '2000000' },
    { id: '2', name: 'GoPay', balance: '50000' },
  ]

  it('maps inputs to Wallet records correctly', () => {
    const records = buildWalletRecords(inputs, 'IDR', NOW)
    expect(records).toHaveLength(2)
    expect(records[0]).toEqual({
      name: 'BCA',
      balance: 2000000,
      currency: 'IDR',
      order: 0,
      createdAt: NOW,
    })
    expect(records[1]).toEqual({
      name: 'GoPay',
      balance: 50000,
      currency: 'IDR',
      order: 1,
      createdAt: NOW,
    })
  })

  it('trims wallet names', () => {
    const result = buildWalletRecords([{ id: '1', name: '  BNI  ', balance: '0' }], 'IDR', NOW)
    expect(result[0].name).toBe('BNI')
  })

  it('empty balance string → balance 0', () => {
    const result = buildWalletRecords([{ id: '1', name: 'Cash', balance: '' }], 'IDR', NOW)
    expect(result[0].balance).toBe(0)
  })

  it('empty inputs array → empty records', () => {
    expect(buildWalletRecords([], 'IDR', NOW)).toEqual([])
  })

  it('preserves order index', () => {
    const threeWallets: WalletInput[] = [
      { id: '1', name: 'A', balance: '0' },
      { id: '2', name: 'B', balance: '0' },
      { id: '3', name: 'C', balance: '0' },
    ]
    const records = buildWalletRecords(threeWallets, 'USD', NOW)
    expect(records.map((r) => r.order)).toEqual([0, 1, 2])
  })
})
