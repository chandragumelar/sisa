import { useState } from 'react'
import { addGoal, updateGoal, deleteGoal } from '@/db/goals.repository'
import type { Goal } from '@/db/database'
import { BottomSheet } from '@/shared/components/BottomSheet'
import { formatCurrency, getCurrencySymbol } from '@/shared/utils/formatCurrency'
import { formatNominalDisplay, parseNominalRaw } from '@/shared/utils/formatNominalInput'
import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'
import styles from './ProfilPage.module.css'

interface Props {
  isOpen: boolean
  onClose: () => void
  goals: Goal[]
  currency: string
  nowMs: number
  onUpdate: () => Promise<void>
  showAdd?: boolean
  onDeleteGoal?: (id: number) => Promise<void>
}

type Step = 'list' | 'form'

export function ProfilGoalSheet({
  isOpen,
  onClose,
  goals,
  currency,
  nowMs,
  onUpdate,
  showAdd = true,
  onDeleteGoal,
}: Props) {
  const lang = useLanguage()
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
    setTargetStr(formatNominalDisplay(String(g.target)))
    setStep('form')
  }

  async function handleSave() {
    const target = parseInt(parseNominalRaw(targetStr), 10) || 0
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
    if (onDeleteGoal) {
      await onDeleteGoal(id)
    } else {
      await deleteGoal(id)
    }
    setDeleteId(null)
    await onUpdate()
  }

  const titleMap: Record<Step, string> = {
    list: t('profil.goals_title_list', lang),
    form: editId ? t('profil.goals_title_edit', lang) : t('profil.goals_title_add', lang),
  }

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={() => {
        setStep('list')
        setDeleteId(null)
        onClose()
      }}
      title={titleMap[step]}
    >
      {step === 'list' && (
        <div className={styles.sheetForm}>
          {goals.length === 0 && (
            <div className={styles.emptyNote}>{t('profil.goals_empty', lang)}</div>
          )}
          {goals.map((g) => (
            <div key={g.id} className={styles.itemRow}>
              <button className={styles.itemBody} onClick={() => openEdit(g)}>
                <span className={styles.listLabel}>{g.name}</span>
                <span className={styles.listVal}>{formatCurrency(g.target, currency)}</span>
              </button>
              {deleteId === g.id ? (
                <div className={styles.inlineConfirm}>
                  <button className={styles.dangerBtn} onClick={() => handleDelete(g.id!)}>
                    {t('common.delete', lang)}
                  </button>
                  <button className={styles.ghostBtn} onClick={() => setDeleteId(null)}>
                    {t('common.cancel', lang)}
                  </button>
                </div>
              ) : (
                <button className={styles.deleteBtn} onClick={() => setDeleteId(g.id!)}>
                  ✕
                </button>
              )}
            </div>
          ))}
          <div className={styles.fieldNote}>{t('profil.goals_reorder_hint', lang)}</div>
          {showAdd && (
            <button className={styles.ghostBtn} onClick={openAdd}>
              {t('profil.goals_title_add', lang)}
            </button>
          )}
        </div>
      )}

      {step === 'form' && (
        <div className={styles.sheetForm}>
          <div className={styles.fieldLabel}>{t('profil.goals_name_label', lang)}</div>
          <input
            className={styles.fieldInput}
            placeholder={t('profil.goals_name_placeholder', lang)}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <div className={styles.fieldLabel}>{t('profil.goals_target_label', lang)}</div>
          <div className={styles.amountRow}>
            <span className={styles.prefix}>{getCurrencySymbol(currency)}</span>
            <input
              className={styles.amountInput}
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={targetStr}
              onChange={(e) => setTargetStr(formatNominalDisplay(parseNominalRaw(e.target.value)))}
            />
          </div>
          <button className={styles.primaryBtn} onClick={handleSave} disabled={!name.trim()}>
            {t('common.save', lang)}
          </button>
          <button className={styles.ghostBtn} onClick={() => setStep('list')}>
            {t('common.cancel', lang)}
          </button>
        </div>
      )}
    </BottomSheet>
  )
}
