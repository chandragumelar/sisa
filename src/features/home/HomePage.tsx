import { useEffect, useState } from 'react'
import styles from './HomePage.module.css'
import { BackupCard } from './components/BackupCard'
import { getAllWallets } from '@/db/wallets.repository'
import { getSettings } from '@/db/settings.repository'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import type { Wallet, Settings } from '@/db/database'

export function HomePage() {
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [settings, setSettings] = useState<Settings | null>(null)
  const [backupDismissed, setBackupDismissed] = useState(false)

  useEffect(() => {
    void getAllWallets().then(setWallets)
    void getSettings().then((s) => setSettings(s ?? null))
  }, [])

  const currency = settings?.primaryCurrency ?? 'IDR'
  const total = wallets.reduce((sum, w) => sum + w.balance, 0)

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <span className={styles.wordmark}>SISA</span>
      </header>

      <div className={styles.body}>
        {!backupDismissed && <BackupCard onDismiss={() => setBackupDismissed(true)} />}

        <div className={styles.totalCard}>
          <div className={styles.totalLabel}>Total saldo</div>
          <div className={styles.totalAmount}>{formatCurrency(total, currency)}</div>
        </div>

        {wallets.length > 0 && (
          <>
            <div className={styles.sectionLabel}>Dompet</div>
            <div className={styles.walletList}>
              {wallets.map((w) => (
                <div key={w.id} className={styles.walletRow}>
                  <span className={styles.walletName}>{w.name}</span>
                  <span className={styles.walletBalance}>
                    {formatCurrency(w.balance, w.currency)}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {wallets.length === 0 && settings && (
          <div className={styles.empty}>Belum ada dompet — tambah di Pengaturan.</div>
        )}
      </div>
    </main>
  )
}
