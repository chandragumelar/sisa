import { useState } from 'react'
import type { Wallet } from '@/db/database'
import { formatCurrency, getCurrencySymbol } from '@/shared/utils/formatCurrency'
import { formatNominalDisplay, parseNominalRaw } from '@/shared/utils/formatNominalInput'
import { BottomSheet } from '@/shared/components/BottomSheet'
import { buildTransaction, type QuickLogMode } from './quickLog.utils'
import { addTransactionAndUpdateBalance, replaceTransaction } from '@/db/transactions.repository'
import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'
import styles from './QuickLogSheet.module.css'

interface Props {
  isOpen: boolean
  onClose: () => void
  wallets: Wallet[]
  currency: string
  totalNabung: number
  nowMs: number
  onCommit: (txId: number, mode: QuickLogMode) => void
  initialAmount?: number
  initialMode?: QuickLogMode
  editTxId?: number
  initialWalletId?: number
  initialLabel?: string
  initialNote?: string
  initialDateMs?: number
}

function msToDateStr(ms: number): string {
  const d = new Date(ms)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function QuickLogSheet({
  isOpen,
  onClose,
  wallets,
  currency,
  totalNabung,
  nowMs,
  onCommit,
  initialAmount,
  initialMode,
  editTxId,
  initialWalletId,
  initialLabel,
  initialNote,
  initialDateMs,
}: Props) {
  const lang = useLanguage()
  const [mode, setMode] = useState<QuickLogMode>(initialMode ?? 'keluar')
  const [walletId, setWalletId] = useState<number>(initialWalletId ?? wallets[0]?.id ?? 0)
  const [amountStr, setAmountStr] = useState(
    initialAmount ? formatNominalDisplay(String(initialAmount)) : '',
  )
  const [isFromSavings, setIsFromSavings] = useState(false)
  const [dateMs, setDateMs] = useState(initialDateMs ?? nowMs)
  const [noteExpanded, setNoteExpanded] = useState(!!initialNote)
  const [note, setNote] = useState(initialNote ?? '')
  const [submitting, setSubmitting] = useState(false)
  const [savingsWarning, setSavingsWarning] = useState(false)

  const amount = parseInt(parseNominalRaw(amountStr), 10) || 0
  const walletCurrency = wallets.find((w) => w.id === walletId)?.currency ?? currency

  const todayStart = (() => {
    const d = new Date(nowMs)
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  })()
  const yesterdayStart = todayStart - 86_400_000
  const isToday = dateMs >= todayStart
  const isYesterday = dateMs >= yesterdayStart && dateMs < todayStart
  const isCustomDate = !isToday && !isYesterday
  const todayStr = msToDateStr(todayStart)
  const dateStr = msToDateStr(dateMs)

  function handleAmountInput(val: string) {
    const raw = parseNominalRaw(val)
    setAmountStr(formatNominalDisplay(raw))
    if (isFromSavings && parseInt(raw, 10) > totalNabung) {
      setSavingsWarning(true)
    } else {
      setSavingsWarning(false)
    }
  }

  function handleFromSavingsToggle() {
    const next = !isFromSavings
    setIsFromSavings(next)
    setSavingsWarning(next && amount > totalNabung)
  }

  function handleDateInput(val: string) {
    if (!val) return
    const [y, m, d] = val.split('-').map(Number)
    setDateMs(new Date(y, m - 1, d, 12, 0, 0).getTime())
  }

  async function handleSubmit() {
    if (!amount || !walletId) return
    setSubmitting(true)
    try {
      const tx = buildTransaction({
        mode,
        walletId,
        amount,
        label: initialLabel ?? '',
        note,
        dateMs,
        currency: walletCurrency,
        isFromSavings: mode === 'keluar' ? isFromSavings : false,
      })
      let txId: number
      if (editTxId !== undefined) {
        txId = await replaceTransaction(editTxId, tx)
      } else {
        txId = await addTransactionAndUpdateBalance(tx)
      }
      onCommit(txId, mode)
      if (!editTxId) resetForm()
      onClose()
    } catch {
      // TODO: show error toast
    } finally {
      setSubmitting(false)
    }
  }

  function resetForm() {
    setAmountStr('')
    setNote('')
    setIsFromSavings(false)
    setSavingsWarning(false)
    setNoteExpanded(false)
  }

  function handleModeChange(m: QuickLogMode) {
    setMode(m)
    setIsFromSavings(false)
    setSavingsWarning(false)
  }

  const modeLabels: Record<QuickLogMode, string> = {
    keluar: t('quick_log.mode_keluar', lang),
    masuk: t('quick_log.mode_masuk', lang),
    nabung: t('quick_log.mode_nabung', lang),
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose}>
      {/* Mode toggle */}
      <div className={styles.modeToggle}>
        {(['keluar', 'masuk', 'nabung'] as QuickLogMode[]).map((m) => (
          <button
            key={m}
            className={`${styles.modeBtn} ${mode === m ? styles.modeBtnActive : ''}`}
            onClick={() => handleModeChange(m)}
          >
            {modeLabels[m]}
          </button>
        ))}
      </div>

      {/* Wallet chips */}
      <div className={styles.walletChips}>
        {wallets.map((w) => (
          <button
            key={w.id}
            className={`${styles.walletChip} ${walletId === w.id ? styles.walletChipActive : ''}`}
            onClick={() => setWalletId(w.id!)}
          >
            <span className={styles.walletChipName}>{w.name}</span>
            <span className={styles.walletChipBal}>{formatCurrency(w.balance, w.currency)}</span>
          </button>
        ))}
      </div>

      {/* Nominal */}
      <div className={styles.nominalWrap}>
        <span className={styles.nominalPrefix}>{getCurrencySymbol(walletCurrency)}</span>
        <input
          className={styles.nominalInput}
          type="text"
          inputMode="numeric"
          placeholder="0"
          value={amountStr}
          onChange={(e) => handleAmountInput(e.target.value)}
          autoFocus={isOpen}
        />
      </div>

      {/* Savings warning */}
      {savingsWarning && (
        <div className={styles.savingsWarning}>
          {t('quick_log.savings_warning', lang).replace(
            '{amount}',
            formatCurrency(totalNabung, walletCurrency),
          )}
        </div>
      )}

      {/* Dari tabungan toggle (keluar only) */}
      {mode === 'keluar' && (
        <div className={styles.toggleRow}>
          <label className={styles.toggleLabel}>{t('quick_log.from_savings', lang)}</label>
          <button
            className={`${styles.toggle} ${isFromSavings ? styles.toggleOn : ''}`}
            onClick={handleFromSavingsToggle}
            role="switch"
            aria-checked={isFromSavings}
          >
            <span className={styles.toggleThumb} />
          </button>
        </div>
      )}

      {/* Date pills + calendar input */}
      <div className={styles.datePills}>
        <button
          className={`${styles.datePill} ${isToday ? styles.datePillActive : ''}`}
          onClick={() => setDateMs(nowMs)}
        >
          {t('common.today', lang)}
        </button>
        <button
          className={`${styles.datePill} ${isYesterday ? styles.datePillActive : ''}`}
          onClick={() => setDateMs(yesterdayStart + 12 * 3600 * 1000)}
        >
          {t('common.yesterday', lang)}
        </button>
        <label
          className={`${styles.datePill} ${styles.datePillCalendar} ${isCustomDate ? styles.datePillActive : ''}`}
        >
          {isCustomDate ? dateStr : t('quick_log.date_label', lang)}
          <input
            type="date"
            className={styles.dateInputHidden}
            max={todayStr}
            value={isCustomDate ? dateStr : ''}
            onChange={(e) => handleDateInput(e.target.value)}
            aria-label={t('quick_log.date_custom_aria', lang)}
          />
        </label>
      </div>

      {/* Note expander */}
      {!noteExpanded ? (
        <button className={styles.noteToggle} onClick={() => setNoteExpanded(true)}>
          {t('quick_log.add_note', lang)}
        </button>
      ) : (
        <textarea
          className={styles.noteInput}
          placeholder={t('quick_log.note_placeholder', lang)}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
        />
      )}

      {/* Submit */}
      <button
        className={styles.submitBtn}
        onClick={handleSubmit}
        disabled={!amount || !walletId || submitting}
      >
        {submitting
          ? t('quick_log.submitting', lang)
          : editTxId !== undefined
            ? t('quick_log.submit_edit', lang)
            : t('quick_log.submit_new', lang)}
      </button>
    </BottomSheet>
  )
}
