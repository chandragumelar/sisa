import { describe, it, expect } from 'vitest'
import { serializeSnapshot, parseSnapshot } from './snapshot.serializer'
import { SCHEMA_VERSION } from '@/db/database'
import type { SnapshotData, Category, SavedScenario } from '@/db/database'

const SETTINGS: SnapshotData['settings'] = {
  id: 1,
  language: 'id',
  theme: 'light',
  incomeType: 'tetap',
  incomeFrequency: 'bulanan',
  incomeAnchorDate: null,
  incomeDay: 25,
  freelanceMinBalance: null,
  avgIncome: null,
  avgIncomeBasis: null,
  lastPaydayConfirmed: null,
  fixedIncome: null,
  primaryCurrency: 'IDR',
  weekendBehavior: 'tetap',
  onboardingCompleted: true,
  lastExportedAt: null,
}

const WALLET: SnapshotData['wallets'][0] = {
  id: 1,
  name: 'Tunai',
  balance: 500_000,
  currency: 'IDR',
  order: 0,
  createdAt: 1_700_000_000_000,
}

const TX: SnapshotData['transactions'][0] = {
  id: 1,
  walletId: 1,
  amount: -50_000,
  type: 'keluar',
  currency: 'IDR',
  label: 'makan',
  date: 1_700_000_000_000,
  isFromSavings: false,
  isEarmark: false,
  createdAt: 1_700_000_000_000,
}

const DEFAULT_CAT: Category = {
  id: 1,
  name: 'Makanan',
  type: 'expense',
  iconName: 'food',
  isDefault: true,
  order: 0,
}

const CUSTOM_CAT: Category = {
  id: 2,
  name: 'Hobi Custom',
  type: 'expense',
  iconName: 'star',
  isDefault: false,
  order: 10,
}

const SCENARIO: SavedScenario = {
  id: 1,
  name: 'Beli HP',
  items: '[]',
  savedAt: 1_700_000_000_000,
}

const BASE_PARTS = {
  settings: SETTINGS,
  wallets: [WALLET],
  tagihan: [],
  goals: [],
  transactions: [TX],
  allCategories: [DEFAULT_CAT, CUSTOM_CAT],
  savedScenarios: [SCENARIO],
  licenseRawKey: null,
  nowMs: 1_700_000_000_000,
}

describe('serializeSnapshot', () => {
  it('sets schemaVersion and exportedAt', () => {
    const snap = serializeSnapshot(BASE_PARTS)
    expect(snap.schemaVersion).toBe(SCHEMA_VERSION)
    expect(snap.exportedAt).toBe(1_700_000_000_000)
  })

  it('filters out default categories', () => {
    const snap = serializeSnapshot(BASE_PARTS)
    expect(snap.customCategories).toHaveLength(1)
    expect(snap.customCategories[0].name).toBe('Hobi Custom')
  })

  it('includes all custom categories when none are default', () => {
    const parts = { ...BASE_PARTS, allCategories: [CUSTOM_CAT] }
    const snap = serializeSnapshot(parts)
    expect(snap.customCategories).toHaveLength(1)
  })

  it('customCategories empty when all categories are default', () => {
    const parts = { ...BASE_PARTS, allCategories: [DEFAULT_CAT] }
    const snap = serializeSnapshot(parts)
    expect(snap.customCategories).toHaveLength(0)
  })

  it('passes licenseRawKey through', () => {
    const snap = serializeSnapshot({ ...BASE_PARTS, licenseRawKey: 'abc.xyz' })
    expect(snap.licenseRawKey).toBe('abc.xyz')
  })
})

describe('parseSnapshot — round-trip', () => {
  it('roundtrips full snapshot', () => {
    const snap = serializeSnapshot(BASE_PARTS)
    const json = JSON.stringify(snap)
    const result = parseSnapshot(json)
    expect(result.ok).toBe(true)
    if (!result.ok) throw new Error('expected ok')
    expect(result.data.wallets).toHaveLength(1)
    expect(result.data.transactions[0].amount).toBe(-50_000)
    expect(result.data.customCategories).toHaveLength(1)
    expect(result.data.savedScenarios).toHaveLength(1)
    expect(result.data.licenseRawKey).toBeNull()
  })

  it('roundtrips preview counts', () => {
    const snap = serializeSnapshot(BASE_PARTS)
    const result = parseSnapshot(JSON.stringify(snap))
    if (!result.ok) throw new Error('expected ok')
    expect(result.preview.walletCount).toBe(1)
    expect(result.preview.txCount).toBe(1)
    expect(result.preview.tagihanCount).toBe(0)
    expect(result.preview.goalCount).toBe(0)
    expect(result.preview.customCategoryCount).toBe(1)
    expect(result.preview.scenarioCount).toBe(1)
    expect(result.preview.hasLicense).toBe(false)
  })

  it('roundtrips hasLicense true when key present', () => {
    const snap = serializeSnapshot({ ...BASE_PARTS, licenseRawKey: 'abc.xyz' })
    const result = parseSnapshot(JSON.stringify(snap))
    if (!result.ok) throw new Error('expected ok')
    expect(result.preview.hasLicense).toBe(true)
    expect(result.data.licenseRawKey).toBe('abc.xyz')
  })
})

describe('parseSnapshot — backward-compat', () => {
  const LEGACY_JSON = JSON.stringify({
    schemaVersion: SCHEMA_VERSION,
    exportedAt: 1_700_000_000_000,
    settings: SETTINGS,
    wallets: [WALLET],
    tagihan: [],
    goals: [],
    transactions: [TX],
    // no customCategories, no savedScenarios, no licenseRawKey
  })

  it('ok:true for legacy snapshot missing new fields', () => {
    const result = parseSnapshot(LEGACY_JSON)
    expect(result.ok).toBe(true)
  })

  it('defaults customCategories to []', () => {
    const result = parseSnapshot(LEGACY_JSON)
    if (!result.ok) throw new Error('expected ok')
    expect(result.data.customCategories).toEqual([])
  })

  it('defaults savedScenarios to []', () => {
    const result = parseSnapshot(LEGACY_JSON)
    if (!result.ok) throw new Error('expected ok')
    expect(result.data.savedScenarios).toEqual([])
  })

  it('defaults licenseRawKey to null', () => {
    const result = parseSnapshot(LEGACY_JSON)
    if (!result.ok) throw new Error('expected ok')
    expect(result.data.licenseRawKey).toBeNull()
  })
})

describe('parseSnapshot — errors', () => {
  it('rejects malformed JSON', () => {
    const result = parseSnapshot('not json {{')
    expect(result.ok).toBe(false)
  })

  it('rejects missing schemaVersion', () => {
    const data = { exportedAt: 0, wallets: [], tagihan: [], goals: [], transactions: [] }
    const result = parseSnapshot(JSON.stringify(data))
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toMatch(/schemaVersion/)
  })

  it('rejects wrong schemaVersion', () => {
    const snap = serializeSnapshot(BASE_PARTS)
    const data = { ...snap, schemaVersion: 999 }
    const result = parseSnapshot(JSON.stringify(data))
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toMatch(/schema/)
  })

  it('rejects missing required arrays', () => {
    const data = { schemaVersion: SCHEMA_VERSION, exportedAt: 0, settings: SETTINGS }
    const result = parseSnapshot(JSON.stringify(data))
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toMatch(/tidak lengkap/)
  })
})
