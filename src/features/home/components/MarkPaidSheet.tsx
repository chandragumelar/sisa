import { useState } from 'react'
import type { Tagihan, Wallet } from '@/db/database'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import { BottomSheet } from '@/shared/components/BottomSheet'
import styles from './MarkPaidSheet.module.css'

interface Props {
  tagihan: Tagihan
  wallets: Wallet[]
  nowMs: number
  isOpen: boolean
  onClose: () => void
  onCommit: (walletId: number, amount: number) => void
}

export function MarkPaidSheet({ tagihan, wallets, nowMs, isOpen, onClose, onCommit }: Props) {
  const [amount, setAmount] = useState(tagihan.nominalEstimate)
  const [walletId, setWalletId] = useState<number>(wallets[0]?.id ?? 0)
  const [dateMs, setDateMs] = useState(nowMs)

  const isVariabel = tagihan.nominalType === 'variabel'
  const todayStart = (() => {
    const d = new Date(nowMs)
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  })()
  const yesterdayStart = todayStart - 86_400_000

  const selectedWallet = wallets.find((w) => w.id === walletId)
  const insufficient = selectedWallet ? selectedWallet.balance < amount : false

  function handleAmountChange(val: string) {
    const n = parseInt(val.replace(/\D/g, ''), 10)
    if (!isNaN(n)) setAmount(n)
  }

  function handleCommit() {
    if (!walletId || amount <= 0) return
    onCommit(walletId, amount)
    onClose()
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={`Bayar ${tagihan.name}`}>
      <div className={styles.section}>
        <div className={styles.label}>Nominal</div>
        {isVariabel ? (
          <input
            className={styles.amountInput}
            type="number"
            inputMode="numeric"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
          />
        ) : (
          <div className={styles.amountFixed}>{formatCurrency(amount, tagihan.currency)}</div>
        )}
        {isVariabel && (
          <div className={styles.amountHint}>
            estimasi: {formatCurrency(tagihan.nominalEstimate, tagihan.currency)}
          </div>
        )}
      </div>

      <div className={styles.section}>
        <div className={styles.label}>Bayar dari</div>
        <div className={styles.walletList}>
          {wallets.map((w) => (
            <button
              key={w.id}
              className={`${styles.walletChip} ${w.id === walletId ? styles.walletChipActive : ''}`}
              onClick={() => setWalletId(w.id!)}
            >
              <span className={styles.walletChipName}>{w.name}</span>
              <span className={styles.walletChipBalance}>
                {formatCurrency(w.balance, w.currency)}
              </span>
            </button>
          ))}
        </div>
        {insufficient && (
          <div className={styles.warning}>
            Saldo {selectedWallet?.name} tidak cukup untuk pembayaran ini.
          </div>
        )}
      </div>

      <div className={styles.section}>
        <div className={styles.label}>Tanggal</div>
        <div className={styles.datePills}>
          <button
            className={`${styles.datePill} ${dateMs >= todayStart ? styles.datePillActive : ''}`}
            onClick={() => setDateMs(nowMs)}
          >
            Hari ini
          </button>
          <button
            className={`${styles.datePill} ${dateMs >= yesterdayStart && dateMs < todayStart ? styles.datePillActive : ''}`}
            onClick={() => setDateMs(yesterdayStart + 12 * 3600 * 1000)}
          >
            Kemarin
          </button>
        </div>
      </div>

      <button
        className={styles.commitBtn}
        onClick={handleCommit}
        disabled={!walletId || amount <= 0}
      >
        Tandai Dibayar
      </button>
    </BottomSheet>
  )
}
