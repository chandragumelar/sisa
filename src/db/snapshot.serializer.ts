import type {
  Category,
  SavedScenario,
  SnapshotData,
  Settings,
  Wallet,
  Tagihan,
  Goal,
  Transaction,
} from '@/db/database'
import { SCHEMA_VERSION } from '@/db/database'

export interface SnapshotPreview {
  walletCount: number
  tagihanCount: number
  goalCount: number
  txCount: number
  customCategoryCount: number
  scenarioCount: number
  hasLicense: boolean
}

export type SnapshotParseResult =
  | { ok: true; data: SnapshotData; preview: SnapshotPreview }
  | { ok: false; error: string }

export function serializeSnapshot(parts: {
  settings: Settings
  wallets: Wallet[]
  tagihan: Tagihan[]
  goals: Goal[]
  transactions: Transaction[]
  allCategories: Category[]
  savedScenarios: SavedScenario[]
  licenseRawKey: string | null
  nowMs: number
}): SnapshotData {
  return {
    schemaVersion: SCHEMA_VERSION,
    exportedAt: parts.nowMs,
    settings: parts.settings,
    wallets: parts.wallets,
    tagihan: parts.tagihan,
    goals: parts.goals,
    transactions: parts.transactions,
    customCategories: parts.allCategories.filter((c) => !c.isDefault),
    savedScenarios: parts.savedScenarios,
    licenseRawKey: parts.licenseRawKey,
  }
}

export function parseSnapshot(json: string): SnapshotParseResult {
  let raw: Record<string, unknown>
  try {
    raw = JSON.parse(json) as Record<string, unknown>
  } catch {
    return {
      ok: false,
      error: 'File tidak bisa dibaca. Pastikan file adalah snapshot SISA yang valid.',
    }
  }
  if (typeof raw['schemaVersion'] !== 'number')
    return { ok: false, error: 'File tidak valid: schemaVersion tidak ditemukan.' }
  if (raw['schemaVersion'] !== SCHEMA_VERSION)
    return {
      ok: false,
      error: `Versi schema tidak cocok (file: ${raw['schemaVersion']}, app: ${SCHEMA_VERSION}).`,
    }
  if (
    !Array.isArray(raw['wallets']) ||
    !Array.isArray(raw['tagihan']) ||
    !Array.isArray(raw['goals']) ||
    !Array.isArray(raw['transactions'])
  )
    return { ok: false, error: 'File tidak valid: struktur data tidak lengkap.' }

  const data: SnapshotData = {
    ...(raw as unknown as SnapshotData),
    customCategories: Array.isArray(raw['customCategories'])
      ? (raw['customCategories'] as Category[])
      : [],
    savedScenarios: Array.isArray(raw['savedScenarios'])
      ? (raw['savedScenarios'] as SavedScenario[])
      : [],
    licenseRawKey: typeof raw['licenseRawKey'] === 'string' ? raw['licenseRawKey'] : null,
  }

  return {
    ok: true,
    data,
    preview: {
      walletCount: data.wallets.length,
      tagihanCount: data.tagihan.length,
      goalCount: data.goals.length,
      txCount: data.transactions.length,
      customCategoryCount: data.customCategories.length,
      scenarioCount: data.savedScenarios.length,
      hasLicense: data.licenseRawKey !== null,
    },
  }
}
