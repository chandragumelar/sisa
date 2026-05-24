import { useState } from 'react'
import type { Wallet } from '@/db/database'
import { renameWallet, setWalletBalance, deleteWallet } from '@/db/wallets.repository'
import { addTransactionAndUpdateBalance } from '@/db/transactions.repository'
import { BottomSheet } from '@/shared/components/BottomSheet'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import { formatNominalDisplay, parseNominalRaw } from '@/shared/utils/formatNominalInput'
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
      currency,
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
    await addTransactionAndUpdateBalance({
      walletId: wallet.id!,
      amount: diff,
      type: diff >= 0 ? 'masuk' : 'keluar',
      currency,
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
      currency,
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

  async function handleSesuaikanKoreksi() {
    if (isNaN(actual)) return
    await setWalletBalance(wallet.id!, actual)
    await onUpdate()
    handleClose()
  }

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={handleClose}
      title={
        step === 'detail'
          ? wallet.name
          : step === 'sesuaikan-transfer'
            ? 'Pilih dompet tujuan'
            : 'Sesuaikan saldo'
      }
    >
      {step === 'detail' && (
        <div className={styles.form}>
          <div className={styles.fieldLabel}>nama dompet</div>
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
              Simpan
            </button>
          </div>
          <div className={styles.balanceDisplay}>{formatCurrency(wallet.balance, currency)}</div>
          <button className={styles.secondaryBtn} onClick={() => setStep('sesuaikan')}>
            Sesuaikan saldo
          </button>
          {!deleteConfirm ? (
            <button className={styles.dangerGhostBtn} onClick={() => setDeleteConfirm(true)}>
              Hapus dompet
            </button>
          ) : (
            <div className={styles.confirmRow}>
              <span className={styles.confirmText}>Yakin hapus {wallet.name}?</span>
              <button className={styles.dangerBtn} onClick={handleDelete}>
                Hapus
              </button>
              <button className={styles.ghostBtn} onClick={() => setDeleteConfirm(false)}>
                Batal
              </button>
            </div>
          )}
        </div>
      )}

      {step === 'sesuaikan' && (
        <div className={styles.form}>
          <div className={styles.fieldLabel}>saldo aktual sekarang</div>
          <div className={styles.amountRow}>
            <span className={styles.prefix}>Rp</span>
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
          {actualRaw !== '' && (
            <div className={`${styles.diffLabel} ${diff < 0 ? styles.diffNeg : styles.diffPos}`}>
              selisih {diff >= 0 ? '+' : ''}
              {formatCurrency(diff, currency)}
            </div>
          )}
          <div className={styles.fieldLabel}>selisih dari mana?</div>
          <button
            className={styles.optionBtn}
            onClick={handleSesuaikanLupaCatat}
            disabled={!actualRaw}
          >
            Lupa catat — buat transaksi koreksi
          </button>
          <button
            className={styles.optionBtn}
            onClick={() => {
              setTransferTargetId(null)
              setStep('sesuaikan-transfer')
            }}
            disabled={!actualRaw || diff === 0}
          >
            Transfer ke wallet lain — 2 transaksi pasangan
          </button>
          <button
            className={styles.optionBtn}
            onClick={handleSesuaikanKoreksi}
            disabled={!actualRaw}
          >
            Koreksi saja — update angka tanpa transaksi
          </button>
          <button className={styles.ghostBtn} onClick={() => setStep('detail')}>
            Batal
          </button>
        </div>
      )}

      {step === 'sesuaikan-transfer' && (
        <div className={styles.form}>
          <div className={styles.fieldLabel}>pilih dompet tujuan</div>
          {wallets
            .filter((w) => w.id !== wallet.id)
            .map((w) => (
              <button
                key={w.id}
                className={`${styles.optionBtn} ${transferTargetId === w.id ? styles.optionBtnActive : ''}`}
                onClick={() => setTransferTargetId(w.id!)}
              >
                {w.name} · {formatCurrency(w.balance, currency)}
              </button>
            ))}
          <button
            className={styles.primaryBtn}
            onClick={handleSesuaikanTransfer}
            disabled={!transferTargetId}
          >
            Konfirmasi transfer
          </button>
          <button className={styles.ghostBtn} onClick={() => setStep('sesuaikan')}>
            Batal
          </button>
        </div>
      )}
    </BottomSheet>
  )
}
