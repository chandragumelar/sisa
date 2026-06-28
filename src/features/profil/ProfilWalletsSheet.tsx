import { useState, useEffect } from 'react'
import { renameWallet, deleteWallet, setWalletBalance, addWallet } from '@/db/wallets.repository'
import { addTransactionAndUpdateBalance } from '@/db/transactions.repository'
import type { Wallet } from '@/db/database'
import { BottomSheet } from '@/shared/components/BottomSheet'
import { formatCurrency, getCurrencySymbol } from '@/shared/utils/formatCurrency'
import { formatNominalDisplay, parseNominalRaw } from '@/shared/utils/formatNominalInput'
import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'
import { ALL_CURRENCIES } from '@/constants/currencies'
import styles from './ProfilPage.module.css'

interface Props {
  isOpen: boolean
  onClose: () => void
  wallets: Wallet[]
  currency: string
  nowMs: number
  onUpdate: () => Promise<void>
  initialStep?: Step
  showAdd?: boolean
}

type Step = 'list' | 'detail' | 'sesuaikan' | 'sesuaikan-transfer' | 'add'

export function ProfilWalletsSheet({
  isOpen,
  onClose,
  wallets,
  currency,
  nowMs,
  onUpdate,
  initialStep,
  showAdd = true,
}: Props) {
  const lang = useLanguage()
  const [step, setStep] = useState<Step>(initialStep ?? 'list')
  const [selected, setSelected] = useState<Wallet | null>(null)
  const [nameInput, setNameInput] = useState('')
  const [actualBalanceStr, setActualBalanceStr] = useState('')
  const [transferTargetId, setTransferTargetId] = useState<number | null>(null)
  const [addName, setAddName] = useState('')
  const [addBalance, setAddBalance] = useState('')
  const [addCurrencyCode, setAddCurrencyCode] = useState(currency)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  function reset() {
    setStep(initialStep ?? 'list')
    setSelected(null)
    setNameInput('')
    setActualBalanceStr('')
    setDeleteConfirm(false)
    setAddCurrencyCode(currency)
  }

  useEffect(() => {
    if (isOpen) setStep(initialStep ?? 'list')
  }, [isOpen, initialStep])

  function openDetail(w: Wallet) {
    setSelected(w)
    setNameInput(w.name)
    setActualBalanceStr('')
    setDeleteConfirm(false)
    setStep('detail')
  }

  async function handleRename() {
    if (!selected || !nameInput.trim()) return
    await renameWallet(selected.id!, nameInput.trim())
    await onUpdate()
    reset()
  }

  async function handleDelete() {
    if (!selected) return
    await deleteWallet(selected.id!)
    await onUpdate()
    reset()
  }

  const diff = selected
    ? (parseInt(parseNominalRaw(actualBalanceStr), 10) || 0) - selected.balance
    : 0

  async function handleSesuaikanLupatCatat() {
    if (!selected) return
    const actual = parseInt(parseNominalRaw(actualBalanceStr), 10)
    if (isNaN(actual)) return
    await addTransactionAndUpdateBalance({
      walletId: selected.id!,
      amount: diff,
      type: diff >= 0 ? 'masuk' : 'keluar',
      currency: selected.currency,
      label: 'koreksi saldo',
      date: nowMs,
      isFromSavings: false,
      isEarmark: false,
      createdAt: nowMs,
    })
    await onUpdate()
    reset()
  }

  async function handleSesuaikanTransfer() {
    if (!selected || !transferTargetId || diff === 0) return
    await addTransactionAndUpdateBalance({
      walletId: selected.id!,
      amount: diff,
      type: diff >= 0 ? 'masuk' : 'keluar',
      currency: selected.currency,
      label: 'transfer koreksi',
      transferPairId: `adj-${nowMs}`,
      date: nowMs,
      isFromSavings: false,
      isEarmark: false,
      createdAt: nowMs,
    })
    await addTransactionAndUpdateBalance({
      walletId: transferTargetId,
      amount: -diff,
      type: -diff >= 0 ? 'masuk' : 'keluar',
      currency: selected.currency,
      label: 'transfer koreksi',
      transferPairId: `adj-${nowMs}`,
      date: nowMs,
      isFromSavings: false,
      isEarmark: false,
      createdAt: nowMs,
    })
    await onUpdate()
    reset()
  }

  async function handleSesuaikanKoreksi() {
    if (!selected) return
    const actual = parseInt(parseNominalRaw(actualBalanceStr), 10)
    if (isNaN(actual)) return
    await setWalletBalance(selected.id!, actual)
    await onUpdate()
    reset()
  }

  async function handleAddWallet() {
    const balance = parseInt(parseNominalRaw(addBalance), 10) || 0
    if (!addName.trim()) return
    await addWallet({
      name: addName.trim(),
      balance,
      currency: addCurrencyCode,
      order: wallets.length,
      createdAt: nowMs,
    })
    setAddName('')
    setAddBalance('')
    setAddCurrencyCode(currency)
    await onUpdate()
    setStep('list')
  }

  const sameCurrencyTargets = selected
    ? wallets.filter((w) => w.id !== selected.id && w.currency === selected.currency)
    : []

  const sheetTitle =
    step === 'list'
      ? t('profil.wallets_title_list', lang)
      : step === 'add'
        ? t('profil.wallets_title_add', lang)
        : (selected?.name ?? '')

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={() => {
        reset()
        onClose()
      }}
      title={sheetTitle}
    >
      {step === 'list' && (
        <div className={styles.sheetForm}>
          {wallets.map((w) => (
            <button key={w.id} className={styles.listRow} onClick={() => openDetail(w)}>
              <span className={styles.listLabel}>{w.name}</span>
              <span className={styles.listVal}>{formatCurrency(w.balance, w.currency)}</span>
            </button>
          ))}
          {showAdd && (
            <button className={styles.ghostBtn} onClick={() => setStep('add')}>
              {t('profil.wallets_add_more', lang)}
            </button>
          )}
        </div>
      )}

      {step === 'detail' && selected && (
        <div className={styles.sheetForm}>
          <div className={styles.fieldLabel}>{t('profil.wallets_name_label', lang)}</div>
          <div className={styles.inlineRow}>
            <input
              className={styles.fieldInput}
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
            />
            <button className={styles.inlineBtn} onClick={handleRename}>
              {t('common.save', lang)}
            </button>
          </div>
          <div className={styles.balanceDisplay}>
            {formatCurrency(selected.balance, selected.currency)}
          </div>
          <button className={styles.secondaryBtn} onClick={() => setStep('sesuaikan')}>
            {t('profil.wallets_sesuaikan_btn', lang)}
          </button>
          {!deleteConfirm ? (
            <button className={styles.dangerGhostBtn} onClick={() => setDeleteConfirm(true)}>
              {t('profil.wallets_delete_btn', lang)}
            </button>
          ) : (
            <div className={styles.confirmRow}>
              <span className={styles.confirmText}>
                {t('profil.wallets_delete_confirm', lang).replace('{name}', selected.name)}
              </span>
              <button className={styles.dangerBtn} onClick={handleDelete}>
                {t('common.delete', lang)}
              </button>
              <button className={styles.ghostBtn} onClick={() => setDeleteConfirm(false)}>
                {t('common.cancel', lang)}
              </button>
            </div>
          )}
        </div>
      )}

      {step === 'sesuaikan' && selected && (
        <div className={styles.sheetForm}>
          <div className={styles.fieldLabel}>{t('profil.wallets_balance_label', lang)}</div>
          <div className={styles.amountRow}>
            <span className={styles.prefix}>{getCurrencySymbol(selected.currency)}</span>
            <input
              className={styles.amountInput}
              type="text"
              inputMode="numeric"
              value={actualBalanceStr}
              onChange={(e) =>
                setActualBalanceStr(formatNominalDisplay(parseNominalRaw(e.target.value)))
              }
              autoFocus
            />
          </div>
          {actualBalanceStr !== '' && (
            <div className={`${styles.diffLabel} ${diff < 0 ? styles.diffNeg : styles.diffPos}`}>
              {t('profil.wallets_diff_prefix', lang)} {diff >= 0 ? '+' : ''}
              {formatCurrency(diff, selected.currency)}
            </div>
          )}
          <div className={styles.fieldLabel}>{t('profil.wallets_diff_from', lang)}</div>
          <button
            className={styles.optionBtn}
            onClick={handleSesuaikanLupatCatat}
            disabled={!actualBalanceStr}
          >
            {t('profil.wallets_opt_lupa', lang)}
          </button>
          <button
            className={styles.optionBtn}
            onClick={() => {
              setTransferTargetId(null)
              setStep('sesuaikan-transfer')
            }}
            disabled={!actualBalanceStr || diff === 0 || sameCurrencyTargets.length === 0}
          >
            {t('profil.wallets_opt_transfer', lang)}
          </button>
          <button
            className={styles.optionBtn}
            onClick={handleSesuaikanKoreksi}
            disabled={!actualBalanceStr}
          >
            {t('profil.wallets_opt_koreksi', lang)}
          </button>
          <button className={styles.ghostBtn} onClick={() => setStep('detail')}>
            {t('common.cancel', lang)}
          </button>
        </div>
      )}

      {step === 'sesuaikan-transfer' && selected && (
        <div className={styles.sheetForm}>
          <div className={styles.fieldLabel}>{t('profil.wallets_transfer_pick_label', lang)}</div>
          {sameCurrencyTargets.map((w) => (
            <button
              key={w.id}
              className={`${styles.optionBtn} ${transferTargetId === w.id ? styles.optionBtnActive : ''}`}
              onClick={() => setTransferTargetId(w.id!)}
            >
              {w.name} · {formatCurrency(w.balance, w.currency)}
            </button>
          ))}
          <button
            className={styles.primaryBtn}
            onClick={handleSesuaikanTransfer}
            disabled={!transferTargetId}
          >
            {t('profil.wallets_transfer_confirm', lang)}
          </button>
          <button className={styles.ghostBtn} onClick={() => setStep('sesuaikan')}>
            {t('common.cancel', lang)}
          </button>
        </div>
      )}

      {step === 'add' && (
        <div className={styles.sheetForm}>
          <div className={styles.fieldLabel}>{t('profil.wallets_name_label', lang)}</div>
          <input
            className={styles.fieldInput}
            placeholder={t('profil.wallets_add_placeholder', lang)}
            value={addName}
            onChange={(e) => setAddName(e.target.value)}
            autoFocus
          />
          <div className={styles.fieldLabel}>{t('profil.wallets_initial_balance', lang)}</div>
          <div className={styles.amountRow}>
            <select
              className={styles.amountCurrency}
              value={addCurrencyCode}
              onChange={(e) => setAddCurrencyCode(e.target.value)}
              aria-label={t('profil.wallets_currency_label', lang)}
            >
              {ALL_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code}
                </option>
              ))}
            </select>
            <input
              className={styles.amountInput}
              type="text"
              inputMode="numeric"
              value={addBalance}
              onChange={(e) => setAddBalance(formatNominalDisplay(parseNominalRaw(e.target.value)))}
            />
          </div>
          <button
            className={styles.primaryBtn}
            onClick={handleAddWallet}
            disabled={!addName.trim()}
          >
            {t('profil.wallets_add_btn', lang)}
          </button>
          <button className={styles.ghostBtn} onClick={() => setStep('list')}>
            {t('common.cancel', lang)}
          </button>
        </div>
      )}
    </BottomSheet>
  )
}
