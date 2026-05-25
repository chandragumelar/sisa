import { useState } from 'react'
import type { Tagihan, Wallet } from '@/db/database'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import { formatNominalDisplay, parseNominalRaw } from '@/shared/utils/formatNominalInput'
import { hapticMedium } from '@/shared/utils/haptic'
import { BottomSheet } from '@/shared/components/BottomSheet'
import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'
import styles from './MarkPaidSheet.module.css'

interface Props {
  tagihan: Tagihan
  wallets: Wallet[]
  nowMs: number
  isOpen: boolean
  onClose: () => void
  onCommit: (walletId: number, amount: number, dateMs: number) => void
}

function toLocalDateStr(ms: number): string {
  const d = new Date(ms)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function fromLocalDateStr(s: string): number {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d, 12, 0, 0).getTime()
}

export function MarkPaidSheet({ tagihan, wallets, nowMs, isOpen, onClose, onCommit }: Props) {
  const lang = useLanguage()
  const [amountStr, setAmountStr] = useState(formatNominalDisplay(String(tagihan.nominalEstimate)))
  const [walletId, setWalletId] = useState<number>(wallets[0]?.id ?? 0)
  const [dateStr, setDateStr] = useState(toLocalDateStr(nowMs))

  const todayStr = toLocalDateStr(nowMs)
  const yesterdayStr = toLocalDateStr(nowMs - 86_400_000)

  const amount = parseInt(parseNominalRaw(amountStr), 10) || 0
  const selectedWallet = wallets.find((w) => w.id === walletId)
  const insufficient = selectedWallet ? selectedWallet.balance < amount : false

  function handleAmountChange(val: string) {
    setAmountStr(formatNominalDisplay(parseNominalRaw(val)))
  }

  function handleCommit() {
    if (!walletId || amount <= 0) return
    hapticMedium()
    onCommit(walletId, amount, fromLocalDateStr(dateStr))
    onClose()
  }

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={t('mark_paid.title', lang).replace('{name}', tagihan.name)}
    >
      <div className={styles.section}>
        <div className={styles.label}>{t('mark_paid.nominal', lang)}</div>
        <input
          className={styles.amountInput}
          type="text"
          inputMode="numeric"
          value={amountStr}
          onChange={(e) => handleAmountChange(e.target.value)}
        />
        {tagihan.nominalEstimate > 0 && amount !== tagihan.nominalEstimate && (
          <div className={styles.amountHint}>
            {t('mark_paid.estimate', lang).replace(
              '{amount}',
              formatCurrency(tagihan.nominalEstimate, tagihan.currency),
            )}
          </div>
        )}
      </div>

      <div className={styles.section}>
        <div className={styles.label}>{t('mark_paid.from', lang)}</div>
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
            {t('mark_paid.insufficient', lang).replace('{wallet}', selectedWallet?.name ?? '')}
          </div>
        )}
      </div>

      <div className={styles.section}>
        <div className={styles.label}>{t('mark_paid.date_label', lang)}</div>
        <div className={styles.datePills}>
          <button
            className={`${styles.datePill} ${dateStr === todayStr ? styles.datePillActive : ''}`}
            onClick={() => setDateStr(todayStr)}
          >
            {t('common.today', lang)}
          </button>
          <button
            className={`${styles.datePill} ${dateStr === yesterdayStr ? styles.datePillActive : ''}`}
            onClick={() => setDateStr(yesterdayStr)}
          >
            {t('common.yesterday', lang)}
          </button>
        </div>
        {dateStr !== todayStr && dateStr !== yesterdayStr && (
          <div className={styles.dateSelectedNote}>{dateStr}</div>
        )}
        <input
          className={styles.dateInput}
          type="date"
          value={dateStr}
          max={todayStr}
          onChange={(e) => e.target.value && setDateStr(e.target.value)}
        />
      </div>

      <button
        className={styles.commitBtn}
        onClick={handleCommit}
        disabled={!walletId || amount <= 0}
      >
        {t('mark_paid.submit', lang)}
      </button>
    </BottomSheet>
  )
}
