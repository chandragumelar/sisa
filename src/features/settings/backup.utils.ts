import type { Transaction } from '@/db/database'

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

export function downloadFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
