import { useState } from 'react'
import { renameWallet, deleteWallet, setWalletBalance, addWallet } from '@/db/wallets.repository'
import { addTransactionAndUpdateBalance } from '@/db/transactions.repository'
import type { Wallet } from '@/db/database'
import { BottomSheet } from '@/shared/components/BottomSheet'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import styles from './ProfilPage.module.css'

interface Props {
  isOpen: boolean
  onClose: () => void
  wallets: Wallet[]
  currency: string
  nowMs: number
  onUpdate: () => Promise<void>
}

type Step = 'list' | 'detail' | 'sesuaikan' | 'sesuaikan-transfer' | 'add'

export function ProfilWalletsSheet({ isOpen, onClose, wallets, currency, nowMs, onUpdate }: Props) {
  const [step, setStep] = useState<Step>('list')
  const [selected, setSelected] = useState<Wallet | null>(null)
  const [nameInput, setNameInput] = useState('')
  const [actualBalanceStr, setActualBalanceStr] = useState('')
  const [transferTargetId, setTransferTargetId] = useState<number | null>(null)
  const [addName, setAddName] = useState('')
  const [addBalance, setAddBalance] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  function reset() {
    setStep('list')
    setSelected(null)
    setNameInput('')
    setActualBalanceStr('')
    setDeleteConfirm(false)
  }

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

  const diff = selected ? (parseInt(actualBalanceStr, 10) || 0) - selected.balance : 0

  async function handleSesuaikanLupatCatat() {
    if (!selected) return
    const actual = parseInt(actualBalanceStr, 10)
    if (isNaN(actual)) return
    await addTransactionAndUpdateBalance({
      walletId: selected.id!,
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
    reset()
  }

  async function handleSesuaikanTransfer() {
    if (!selected || !transferTargetId || diff === 0) return
    await addTransactionAndUpdateBalance({
      walletId: selected.id!,
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
    reset()
  }

  async function handleSesuaikanKoreksi() {
    if (!selected) return
    const actual = parseInt(actualBalanceStr, 10)
    if (isNaN(actual)) return
    await setWalletBalance(selected.id!, actual)
    await onUpdate()
    reset()
  }

  async function handleAddWallet() {
    const balance = parseInt(addBalance, 10) || 0
    if (!addName.trim()) return
    await addWallet({
      name: addName.trim(),
      balance,
      currency,
      order: wallets.length,
      createdAt: nowMs,
    })
    setAddName('')
    setAddBalance('')
    await onUpdate()
    setStep('list')
  }

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={() => {
        reset()
        onClose()
      }}
      title={step === 'list' ? 'Dompet' : step === 'add' ? 'Tambah dompet' : (selected?.name ?? '')}
    >
      {step === 'list' && (
        <div className={styles.sheetForm}>
          {wallets.map((w) => (
            <button key={w.id} className={styles.listRow} onClick={() => openDetail(w)}>
              <span className={styles.listLabel}>{w.name}</span>
              <span className={styles.listVal}>{formatCurrency(w.balance, currency)}</span>
            </button>
          ))}
          <button className={styles.ghostBtn} onClick={() => setStep('add')}>
            + Tambah dompet
          </button>
        </div>
      )}

      {step === 'detail' && selected && (
        <div className={styles.sheetForm}>
          <div className={styles.fieldLabel}>nama dompet</div>
          <div className={styles.inlineRow}>
            <input
              className={styles.fieldInput}
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
            />
            <button className={styles.inlineBtn} onClick={handleRename}>
              Simpan
            </button>
          </div>
          <div className={styles.balanceDisplay}>{formatCurrency(selected.balance, currency)}</div>
          <button className={styles.secondaryBtn} onClick={() => setStep('sesuaikan')}>
            Sesuaikan saldo
          </button>
          {!deleteConfirm ? (
            <button className={styles.dangerGhostBtn} onClick={() => setDeleteConfirm(true)}>
              Hapus dompet
            </button>
          ) : (
            <div className={styles.confirmRow}>
              <span className={styles.confirmText}>Yakin hapus {selected.name}?</span>
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

      {step === 'sesuaikan' && selected && (
        <div className={styles.sheetForm}>
          <div className={styles.fieldLabel}>saldo aktual sekarang</div>
          <div className={styles.amountRow}>
            <span className={styles.prefix}>Rp</span>
            <input
              className={styles.amountInput}
              type="number"
              inputMode="numeric"
              value={actualBalanceStr}
              onChange={(e) => setActualBalanceStr(e.target.value.replace(/\D/g, ''))}
              autoFocus
            />
          </div>
          {actualBalanceStr !== '' && (
            <div className={`${styles.diffLabel} ${diff < 0 ? styles.diffNeg : styles.diffPos}`}>
              selisih {diff >= 0 ? '+' : ''}
              {formatCurrency(diff, currency)}
            </div>
          )}
          <div className={styles.fieldLabel}>selisih dari mana?</div>
          <button
            className={styles.optionBtn}
            onClick={handleSesuaikanLupatCatat}
            disabled={!actualBalanceStr}
          >
            Lupa catat — buat transaksi koreksi
          </button>
          <button
            className={styles.optionBtn}
            onClick={() => {
              setTransferTargetId(null)
              setStep('sesuaikan-transfer')
            }}
            disabled={!actualBalanceStr || diff === 0}
          >
            Transfer ke wallet lain — 2 transaksi pasangan
          </button>
          <button
            className={styles.optionBtn}
            onClick={handleSesuaikanKoreksi}
            disabled={!actualBalanceStr}
          >
            Koreksi saja — update angka tanpa transaksi
          </button>
          <button className={styles.ghostBtn} onClick={() => setStep('detail')}>
            Batal
          </button>
        </div>
      )}

      {step === 'sesuaikan-transfer' && selected && (
        <div className={styles.sheetForm}>
          <div className={styles.fieldLabel}>pilih dompet tujuan</div>
          {wallets
            .filter((w) => w.id !== selected.id)
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

      {step === 'add' && (
        <div className={styles.sheetForm}>
          <div className={styles.fieldLabel}>nama dompet</div>
          <input
            className={styles.fieldInput}
            placeholder="e.g. BCA, Dana, Tunai"
            value={addName}
            onChange={(e) => setAddName(e.target.value)}
            autoFocus
          />
          <div className={styles.fieldLabel}>saldo awal</div>
          <div className={styles.amountRow}>
            <span className={styles.prefix}>Rp</span>
            <input
              className={styles.amountInput}
              type="number"
              inputMode="numeric"
              value={addBalance}
              onChange={(e) => setAddBalance(e.target.value.replace(/\D/g, ''))}
            />
          </div>
          <button
            className={styles.primaryBtn}
            onClick={handleAddWallet}
            disabled={!addName.trim()}
          >
            Tambah dompet
          </button>
          <button className={styles.ghostBtn} onClick={() => setStep('list')}>
            Batal
          </button>
        </div>
      )}
    </BottomSheet>
  )
}
