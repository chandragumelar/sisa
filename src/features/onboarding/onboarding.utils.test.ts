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
  it('language → 1', () => expect(getProgressCount('language')).toBe(1))
  it('license → 2', () => expect(getProgressCount('license')).toBe(2))
  it('mentalModel → 3', () => expect(getProgressCount('mentalModel')).toBe(3))
  it('currency → 4', () => expect(getProgressCount('currency')).toBe(4))
  it('incomeType → 5', () => expect(getProgressCount('incomeType')).toBe(5))
  it('incomeDetail → 5 (same dot as incomeType)', () =>
    expect(getProgressCount('incomeDetail')).toBe(5))
  it('wallet → 6', () => expect(getProgressCount('wallet')).toBe(6))
  it('currency2 → 6 (same dot as wallet)', () => expect(getProgressCount('currency2')).toBe(6))
  it('max filled equals TOTAL_PROGRESS_DOTS', () => {
    expect(getProgressCount('wallet')).toBe(TOTAL_PROGRESS_DOTS)
  })
})

// ---------------------------------------------------------------------------
// getNextStep
// ---------------------------------------------------------------------------
describe('getNextStep', () => {
  it('language → installGuide', () => {
    expect(getNextStep('language', null)).toBe('installGuide')
  })
  it('installGuide → license', () => {
    expect(getNextStep('installGuide', null)).toBe('license')
  })
  it('license → mentalModel', () => {
    expect(getNextStep('license', null)).toBe('mentalModel')
  })
  it('mentalModel → currency', () => {
    expect(getNextStep('mentalModel', null)).toBe('currency')
  })
  it('currency → incomeType', () => {
    expect(getNextStep('currency', 'tetap')).toBe('incomeType')
  })
  it('incomeType → incomeDetail', () => {
    expect(getNextStep('incomeType', 'tetap')).toBe('incomeDetail')
  })
  it('incomeDetail → wallet', () => {
    expect(getNextStep('incomeDetail', 'tetap')).toBe('wallet')
  })
  it('wallet → currency2 (always)', () => {
    expect(getNextStep('wallet', 'tetap')).toBe('currency2')
  })
  it('currency2 → done', () => {
    expect(getNextStep('currency2', 'tetap')).toBe('done')
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
    primaryCurrency: 'IDR',
    secondaryCurrency: null,
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
    expect(s.secondaryCurrency).toBeNull()
    expect(s.activeCurrencyMode).toBe('IDR')
    expect(s.weekendBehavior).toBeNull()
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

  it('sets secondaryCurrency when provided', () => {
    const s = buildSettings({ ...base, secondaryCurrency: 'USD' })
    expect(s.secondaryCurrency).toBe('USD')
    expect(s.activeCurrencyMode).toBe('IDR')
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
