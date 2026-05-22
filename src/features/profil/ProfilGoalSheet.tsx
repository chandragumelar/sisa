import { useState } from 'react'
import { addGoal, updateGoal, deleteGoal } from '@/db/goals.repository'
import type { Goal } from '@/db/database'
import { BottomSheet } from '@/shared/components/BottomSheet'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import styles from './ProfilPage.module.css'

interface Props {
  isOpen: boolean
  onClose: () => void
  goals: Goal[]
  currency: string
  nowMs: number
  onUpdate: () => Promise<void>
}

type Step = 'list' | 'form'

export function ProfilGoalSheet({ isOpen, onClose, goals, currency, nowMs, onUpdate }: Props) {
  const [step, setStep] = useState<Step>('list')
  const [editId, setEditId] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [targetStr, setTargetStr] = useState('')
  const [deleteId, setDeleteId] = useState<number | null>(null)

  function openAdd() {
    setEditId(null)
    setName('')
    setTargetStr('')
    setStep('form')
  }

  function openEdit(g: Goal) {
    setEditId(g.id!)
    setName(g.name)
    setTargetStr(String(g.target))
    setStep('form')
  }

  async function handleSave() {
    const target = parseInt(targetStr, 10) || 0
    if (!name.trim()) return
    if (editId !== null) {
      await updateGoal(editId, { name: name.trim(), target })
    } else {
      await addGoal({
        name: name.trim(),
        target,
        currency,
        order: goals.length,
        createdAt: nowMs,
      })
    }
    await onUpdate()
    setStep('list')
  }

  async function handleDelete(id: number) {
    await deleteGoal(id)
    setDeleteId(null)
    await onUpdate()
  }

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={() => {
        setStep('list')
        setDeleteId(null)
        onClose()
      }}
      title={step === 'list' ? 'Goal tabungan' : editId ? 'Edit goal' : 'Tambah goal'}
    >
      {step === 'list' && (
        <div className={styles.sheetForm}>
          {goals.length === 0 && <div className={styles.emptyNote}>Belum ada goal.</div>}
          {goals.map((g) => (
            <div key={g.id} className={styles.itemRow}>
              <button className={styles.itemBody} onClick={() => openEdit(g)}>
                <span className={styles.listLabel}>{g.name}</span>
                <span className={styles.listVal}>{formatCurrency(g.target, currency)}</span>
              </button>
              {deleteId === g.id ? (
                <div className={styles.inlineConfirm}>
                  <button className={styles.dangerBtn} onClick={() => handleDelete(g.id!)}>
                    Hapus
                  </button>
                  <button className={styles.ghostBtn} onClick={() => setDeleteId(null)}>
                    Batal
                  </button>
                </div>
              ) : (
                <button className={styles.deleteBtn} onClick={() => setDeleteId(g.id!)}>
                  ✕
                </button>
              )}
            </div>
          ))}
          <div className={styles.fieldNote}>Urutan goal diatur di Home lewat drag-drop.</div>
          <button className={styles.ghostBtn} onClick={openAdd}>
            + Tambah goal
          </button>
        </div>
      )}

      {step === 'form' && (
        <div className={styles.sheetForm}>
          <div className={styles.fieldLabel}>nama goal</div>
          <input
            className={styles.fieldInput}
            placeholder="e.g. Emergency fund, Liburan"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <div className={styles.fieldLabel}>target nominal</div>
          <div className={styles.amountRow}>
            <span className={styles.prefix}>Rp</span>
            <input
              className={styles.amountInput}
              type="number"
              inputMode="numeric"
              placeholder="0"
              value={targetStr}
              onChange={(e) => setTargetStr(e.target.value.replace(/\D/g, ''))}
            />
          </div>
          <button className={styles.primaryBtn} onClick={handleSave} disabled={!name.trim()}>
            Simpan
          </button>
          <button className={styles.ghostBtn} onClick={() => setStep('list')}>
            Batal
          </button>
        </div>
      )}
    </BottomSheet>
  )
}
