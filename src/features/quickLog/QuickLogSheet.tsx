import { useState } from 'react'
import type { Wallet } from '@/db/database'
import { formatCurrency, getCurrencySymbol } from '@/shared/utils/formatCurrency'
import { formatNominalDisplay, parseNominalRaw } from '@/shared/utils/formatNominalInput'
import { BottomSheet } from '@/shared/components/BottomSheet'
import { EquivLine } from '@/shared/components/EquivLine'
import { buildTransaction, type QuickLogMode } from './quickLog.utils'
import { addTransactionAndUpdateBalance, replaceTransaction } from '@/db/transactions.repository'
import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'
import { CategoryPicker } from '@/features/category/CategoryPicker'
import { ManageCategoriesSheet } from '@/features/category/ManageCategoriesSheet'
import {
  suggestExpenseCategory,
  suggestIncomeCategory,
} from '@/features/category/category-keywords'
import { FALLBACK_CATEGORY } from '@/features/category/category.types'
import styles from './QuickLogSheet.module.css'

interface Props {
  isOpen: boolean
  onClose: () => void
  wallets: Wallet[]
  currency: string
  nowMs: number
  onCommit: (txId: number, mode: QuickLogMode) => void
  initialAmount?: number
  initialMode?: QuickLogMode
  editTxId?: number
  initialWalletId?: number
  initialLabel?: string
  initialDateMs?: number
  initialCategory?: string
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
  nowMs,
  onCommit,
  initialAmount,
  initialMode,
  editTxId,
  initialWalletId,
  initialLabel,
  initialDateMs,
  initialCategory,
}: Props) {
  const lang = useLanguage()
  const uniqueCurrencies = [...new Set(wallets.map((w) => w.currency))]
  const isMultiCurrency = uniqueCurrencies.length > 1

  const [mode, setMode] = useState<QuickLogMode>(initialMode ?? 'keluar')
  const [activeCurrency, setActiveCurrency] = useState(
    initialWalletId
      ? (wallets.find((w) => w.id === initialWalletId)?.currency ?? currency)
      : currency,
  )
  const [walletId, setWalletId] = useState<number>(initialWalletId ?? wallets[0]?.id ?? 0)
  const [amountStr, setAmountStr] = useState(
    initialAmount ? formatNominalDisplay(String(initialAmount)) : '',
  )
  const [label, setLabel] = useState(initialLabel ?? '')
  const [category, setCategory] = useState(initialCategory ?? FALLBACK_CATEGORY)
  const [categoryManuallySet, setCategoryManuallySet] = useState(!!initialCategory)
  const [dateMs, setDateMs] = useState(initialDateMs ?? nowMs)
  const [submitting, setSubmitting] = useState(false)
  const [manageOpen, setManageOpen] = useState(false)

  const amount = parseInt(parseNominalRaw(amountStr), 10) || 0
  const currencyWallets = wallets.filter((w) => w.currency === activeCurrency)
  const walletCurrency = wallets.find((w) => w.id === walletId)?.currency ?? currency

  function handleCurrencyChip(cur: string) {
    setActiveCurrency(cur)
    const first = wallets.find((w) => w.currency === cur)
    if (first?.id) setWalletId(first.id)
  }

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

  const categoryType: 'expense' | 'income' = mode === 'masuk' ? 'income' : 'expense'

  function handleAmountInput(val: string) {
    const raw = parseNominalRaw(val)
    setAmountStr(formatNominalDisplay(raw))
  }

  function handleLabelBlur() {
    if (categoryManuallySet || !label.trim()) return
    const suggested =
      mode === 'masuk' ? suggestIncomeCategory(label) : suggestExpenseCategory(label)
    setCategory(suggested)
  }

  function handleCategoryChange(cat: string) {
    setCategory(cat)
    setCategoryManuallySet(true)
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
        label,
        dateMs,
        nowMs,
        currency: walletCurrency,
        category,
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
    setLabel('')
    setCategory(FALLBACK_CATEGORY)
    setCategoryManuallySet(false)
  }

  function handleModeChange(m: QuickLogMode) {
    setMode(m)
    if (!categoryManuallySet) {
      setCategory(FALLBACK_CATEGORY)
    }
  }

  const modeLabels: Record<QuickLogMode, string> = {
    keluar: t('quick_log.mode_keluar', lang),
    masuk: t('quick_log.mode_masuk', lang),
  }

  return (
    <>
      <BottomSheet isOpen={isOpen} onClose={onClose}>
        {/* Mode toggle */}
        <div className={styles.modeToggle}>
          {(['keluar', 'masuk'] as QuickLogMode[]).map((m) => (
            <button
              key={m}
              className={`${styles.modeBtn} ${mode === m ? styles.modeBtnActive : ''}`}
              onClick={() => handleModeChange(m)}
            >
              {modeLabels[m]}
            </button>
          ))}
        </div>

        {/* Currency chips — only when wallets span multiple currencies */}
        {isMultiCurrency && (
          <div className={styles.walletChips}>
            {uniqueCurrencies.map((cur) => (
              <button
                key={cur}
                className={`${styles.walletChip} ${activeCurrency === cur ? styles.walletChipActive : ''}`}
                onClick={() => handleCurrencyChip(cur)}
              >
                <span className={styles.walletChipName}>{cur}</span>
              </button>
            ))}
          </div>
        )}

        {/* Wallet chips */}
        <div className={styles.walletChips}>
          {(isMultiCurrency ? currencyWallets : wallets).map((w) => (
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
          <span className={styles.nominalPrefix}>
            {walletCurrency !== currency ? walletCurrency : getCurrencySymbol(walletCurrency)}
          </span>
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
        <EquivLine amount={amount} currency={walletCurrency} primaryCurrency={currency} />

        {/* Label freetext — primary field, triggers auto-suggest on blur */}
        <input
          className={styles.labelInput}
          type="text"
          placeholder={t('quick_log.label_placeholder', lang)}
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={handleLabelBlur}
        />

        {/* Category picker */}
        <CategoryPicker
          type={categoryType}
          value={category}
          onChange={handleCategoryChange}
          onManage={() => setManageOpen(true)}
        />

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

      <ManageCategoriesSheet isOpen={manageOpen} onClose={() => setManageOpen(false)} />
    </>
  )
}
