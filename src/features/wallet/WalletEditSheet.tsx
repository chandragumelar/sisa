import { useState } from 'react'
import type { Wallet } from '@/db/database'
import { renameWallet, deleteWallet } from '@/db/wallets.repository'
import { addTransactionAndUpdateBalance } from '@/db/transactions.repository'
import { BottomSheet } from '@/shared/components/BottomSheet'
import { EquivLine } from '@/shared/components/EquivLine'
import { formatCurrency, getCurrencySymbol } from '@/shared/utils/formatCurrency'
import { formatNominalDisplay, parseNominalRaw } from '@/shared/utils/formatNominalInput'
import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'
import styles from './WalletEditSheet.module.css'

interface Props {
  wallet: Wallet
  wallets: Wallet[]
  currency: string
  nowMs: number
  isOpen: boolean
  onClose: () => void
  onUpdate: () => Promise<void>
}

type Step = 'detail' | 'sesuaikan' | 'sesuaikan-transfer'

export function WalletEditSheet({
  wallet,
  wallets,
  currency,
  nowMs,
  isOpen,
  onClose,
  onUpdate,
}: Props) {
  const lang = useLanguage()
  const [step, setStep] = useState<Step>('detail')
  const [nameInput, setNameInput] = useState(wallet.name)
  const [actualBalanceDisplay, setActualBalanceDisplay] = useState('')
  const [transferTargetId, setTransferTargetId] = useState<number | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  const actualRaw = parseNominalRaw(actualBalanceDisplay)
  const actual = actualRaw ? parseInt(actualRaw, 10) : NaN
  const diff = !isNaN(actual) ? actual - wallet.balance : 0

  function handleClose() {
    setStep('detail')
    setNameInput(wallet.name)
    setActualBalanceDisplay('')
    setDeleteConfirm(false)
    onClose()
  }

  async function handleDelete() {
    await deleteWallet(wallet.id!)
    await onUpdate()
    handleClose()
  }

  async function handleRename() {
    if (!nameInput.trim() || nameInput.trim() === wallet.name) return
    await renameWallet(wallet.id!, nameInput.trim())
    await onUpdate()
  }

  async function handleSesuaikanLupaCatat() {
    if (isNaN(actual)) return
    await addTransactionAndUpdateBalance({
      walletId: wallet.id!,
      amount: diff,
      type: diff >= 0 ? 'masuk' : 'keluar',
      currency: wallet.currency,
      label: 'koreksi saldo',
      date: nowMs,
      isFromSavings: false,
      isEarmark: false,
      createdAt: nowMs,
    })
    await onUpdate()
    handleClose()
  }

  async function handleSesuaikanTransfer() {
    if (!transferTargetId || diff === 0 || isNaN(actual)) return
    const targetWallet = wallets.find((w) => w.id === transferTargetId)
    await addTransactionAndUpdateBalance({
      walletId: wallet.id!,
      amount: diff,
      type: diff >= 0 ? 'masuk' : 'keluar',
      currency: wallet.currency,
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
      currency: targetWallet?.currency ?? currency,
      label: 'transfer koreksi',
      transferPairId: `adj-${nowMs}`,
      date: nowMs,
      isFromSavings: false,
      isEarmark: false,
      createdAt: nowMs,
    })
    await onUpdate()
    handleClose()
  }

  const sheetTitle =
    step === 'sesuaikan-transfer'
      ? t('profil.wallets_transfer_pick_label', lang)
      : step === 'sesuaikan'
        ? t('profil.wallets_sesuaikan_btn', lang)
        : wallet.name

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose} title={sheetTitle}>
      {step === 'detail' && (
        <div className={styles.form}>
          <div className={styles.fieldLabel}>{t('profil.wallets_name_label', lang)}</div>
          <div className={styles.inlineRow}>
            <input
              className={styles.fieldInput}
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
            />
            <button
              className={styles.inlineBtn}
              onClick={handleRename}
              disabled={!nameInput.trim() || nameInput.trim() === wallet.name}
            >
              {t('common.save', lang)}
            </button>
          </div>
          <div className={styles.balanceDisplay}>
            {formatCurrency(wallet.balance, wallet.currency)}
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
                {t('profil.wallets_delete_confirm', lang).replace('{name}', wallet.name)}
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

      {step === 'sesuaikan' && (
        <div className={styles.form}>
          <div className={styles.fieldLabel}>{t('profil.wallets_balance_label', lang)}</div>
          <div className={styles.amountRow}>
            <span className={styles.prefix}>{getCurrencySymbol(wallet.currency)}</span>
            <input
              className={styles.amountInput}
              type="text"
              inputMode="numeric"
              value={actualBalanceDisplay}
              onChange={(e) =>
                setActualBalanceDisplay(formatNominalDisplay(parseNominalRaw(e.target.value)))
              }
              autoFocus
            />
          </div>
          <EquivLine amount={actual || 0} currency={wallet.currency} primaryCurrency={currency} />
          {actualRaw !== '' && (
            <div className={`${styles.diffLabel} ${diff < 0 ? styles.diffNeg : styles.diffPos}`}>
              {t('profil.wallets_diff_prefix', lang)} {diff >= 0 ? '+' : ''}
              {formatCurrency(diff, wallet.currency)}
            </div>
          )}
          <div className={styles.fieldLabel}>{t('profil.wallets_diff_from', lang)}</div>
          <button
            className={styles.optionBtn}
            onClick={handleSesuaikanLupaCatat}
            disabled={!actualRaw}
          >
            {t('profil.wallets_opt_lupa', lang)}
          </button>
          <button
            className={styles.optionBtn}
            onClick={() => {
              setTransferTargetId(null)
              setStep('sesuaikan-transfer')
            }}
            disabled={!actualRaw || diff === 0}
          >
            {t('profil.wallets_opt_transfer', lang)}
          </button>
          <button className={styles.ghostBtn} onClick={() => setStep('detail')}>
            {t('common.cancel', lang)}
          </button>
        </div>
      )}

      {step === 'sesuaikan-transfer' && (
        <div className={styles.form}>
          <div className={styles.fieldLabel}>{t('profil.wallets_transfer_pick_label', lang)}</div>
          {wallets
            .filter((w) => w.id !== wallet.id)
            .map((w) => (
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
    </BottomSheet>
  )
}
