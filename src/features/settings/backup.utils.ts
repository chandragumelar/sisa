import type { Transaction } from '@/db/database'
import type { BackupData } from '@/db/database'
import { SCHEMA_VERSION } from '@/db/database'

export type { BackupData }

export interface ImportPreview {
  walletCount: number
  tagihanCount: number
  goalCount: number
  txCount: number
}

export type ParseResult =
  | { ok: true; data: BackupData; preview: ImportPreview }
  | { ok: false; error: string }

export function buildBackupJSON(data: BackupData): string {
  return JSON.stringify(data, null, 2)
}

export function buildTransactionsCSV(transactions: Transaction[]): string {
  const header = 'id,date,type,amount,currency,label,note,walletId,isFromSavings,isEarmark'
  const rows = transactions.map((t) => {
    const cells = [
      t.id ?? '',
      new Date(t.date).toISOString().split('T')[0],
      t.type,
      t.amount,
      t.currency,
      t.label ?? '',
      t.note ?? '',
      t.walletId,
      t.isFromSavings ? '1' : '0',
      t.isEarmark ? '1' : '0',
    ]
    return cells.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')
  })
  return [header, ...rows].join('\n')
}

export function parseBackupJSON(json: string): ParseResult {
  let data: Record<string, unknown>
  try {
    data = JSON.parse(json) as Record<string, unknown>
  } catch {
    return {
      ok: false,
      error: 'File tidak bisa dibaca. Pastikan file adalah backup SISA yang valid.',
    }
  }
  if (typeof data['schemaVersion'] !== 'number')
    return { ok: false, error: 'File tidak valid: schemaVersion tidak ditemukan.' }
  if (data['schemaVersion'] !== SCHEMA_VERSION)
    return {
      ok: false,
      error: `Versi schema tidak cocok (file: ${data['schemaVersion']}, app: ${SCHEMA_VERSION}).`,
    }
  if (
    !Array.isArray(data['wallets']) ||
    !Array.isArray(data['tagihan']) ||
    !Array.isArray(data['goals']) ||
    !Array.isArray(data['transactions'])
  )
    return { ok: false, error: 'File tidak valid: struktur data tidak lengkap.' }
  const backup = data as unknown as BackupData
  return {
    ok: true,
    data: backup,
    preview: {
      walletCount: backup.wallets.length,
      tagihanCount: backup.tagihan.length,
      goalCount: backup.goals.length,
      txCount: backup.transactions.length,
    },
  }
}

export function downloadFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
