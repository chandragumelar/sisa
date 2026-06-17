import { describe, it, expect } from 'vitest'
import { buildBackupJSON, buildTransactionsCSV, parseBackupJSON } from './backup.utils'
import type { BackupData } from './backup.utils'
import { SCHEMA_VERSION } from '@/db/database'
import type { Transaction } from '@/db/database'

const SETTINGS: BackupData['settings'] = {
  id: 1,
  language: 'id',
  theme: 'light',
  incomeType: 'tetap',
  incomeFrequency: 'bulanan',
  incomeAnchorDate: null,
  incomeDay: 25,
  freelanceMinBalance: null,
  primaryCurrency: 'IDR',
  secondaryCurrency: null,
  activeCurrencyMode: 'IDR',
  weekendBehavior: null,
  onboardingCompleted: true,
  lastExportedAt: null,
}

const WALLET: BackupData['wallets'][0] = {
  id: 1,
  name: 'Tunai',
  balance: 500_000,
  currency: 'IDR',
  order: 0,
  createdAt: 1_700_000_000_000,
}

const TX: Transaction = {
  id: 1,
  walletId: 1,
  amount: -50_000,
  type: 'keluar',
  currency: 'IDR',
  label: 'makan',
  note: '',
  date: 1_700_000_000_000,
  isFromSavings: false,
  isEarmark: false,
  createdAt: 1_700_000_000_000,
}

const SAMPLE: BackupData = {
  schemaVersion: SCHEMA_VERSION,
  exportedAt: 1_700_000_000_000,
  settings: SETTINGS,
  wallets: [WALLET],
  tagihan: [],
  goals: [],
  transactions: [TX],
}

describe('buildBackupJSON', () => {
  it('produces valid JSON with schemaVersion', () => {
    const json = buildBackupJSON(SAMPLE)
    const parsed = JSON.parse(json) as BackupData
    expect(parsed.schemaVersion).toBe(SCHEMA_VERSION)
  })

  it('roundtrips wallet count', () => {
    const json = buildBackupJSON(SAMPLE)
    const parsed = JSON.parse(json) as BackupData
    expect(parsed.wallets).toHaveLength(1)
  })

  it('roundtrips transaction fields', () => {
    const json = buildBackupJSON(SAMPLE)
    const parsed = JSON.parse(json) as BackupData
    expect(parsed.transactions[0].amount).toBe(-50_000)
    expect(parsed.transactions[0].type).toBe('keluar')
  })
})

describe('buildTransactionsCSV', () => {
  it('produces header row', () => {
    const csv = buildTransactionsCSV([TX])
    const firstLine = csv.split('\n')[0]
    expect(firstLine).toContain('id')
    expect(firstLine).toContain('date')
    expect(firstLine).toContain('amount')
    expect(firstLine).toContain('currency')
  })

  it('produces correct row count (header + n transactions)', () => {
    const csv = buildTransactionsCSV([TX, TX])
    const lines = csv.split('\n')
    expect(lines).toHaveLength(3)
  })

  it('empty transactions → only header', () => {
    const csv = buildTransactionsCSV([])
    const lines = csv.split('\n')
    expect(lines).toHaveLength(1)
  })

  it('escapes double-quotes inside values', () => {
    const txWithQuote: Transaction = { ...TX, note: 'dia bilang "halo"' }
    const csv = buildTransactionsCSV([txWithQuote])
    expect(csv).toContain('""halo""')
  })
})

describe('parseBackupJSON — valid', () => {
  it('parses valid backup', () => {
    const json = buildBackupJSON(SAMPLE)
    const result = parseBackupJSON(json)
    expect(result.ok).toBe(true)
  })

  it('returns correct preview counts', () => {
    const json = buildBackupJSON(SAMPLE)
    const result = parseBackupJSON(json)
    if (!result.ok) throw new Error('expected ok')
    expect(result.preview.walletCount).toBe(1)
    expect(result.preview.txCount).toBe(1)
    expect(result.preview.tagihanCount).toBe(0)
    expect(result.preview.goalCount).toBe(0)
  })
})

describe('parseBackupJSON — errors', () => {
  it('rejects malformed JSON', () => {
    const result = parseBackupJSON('not json {{')
    expect(result.ok).toBe(false)
  })

  it('rejects missing schemaVersion', () => {
    const data = { ...SAMPLE } as Partial<BackupData>
    delete (data as Record<string, unknown>)['schemaVersion']
    const result = parseBackupJSON(JSON.stringify(data))
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toMatch(/schemaVersion/)
  })

  it('rejects wrong schemaVersion', () => {
    const data = { ...SAMPLE, schemaVersion: 999 }
    const result = parseBackupJSON(JSON.stringify(data))
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toMatch(/schema/)
  })

  it('rejects missing arrays', () => {
    const data = { schemaVersion: SCHEMA_VERSION, exportedAt: 0, settings: SETTINGS }
    const result = parseBackupJSON(JSON.stringify(data))
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toMatch(/tidak lengkap/)
  })
})
