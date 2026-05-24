import { useEffect, useState } from 'react'
import { addTagihan, updateTagihan, deleteTagihan } from '@/db/tagihan.repository'
import type { Tagihan, NominalType, RecurrenceType } from '@/db/database'
import { BottomSheet } from '@/shared/components/BottomSheet'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import { formatNominalDisplay, parseNominalRaw } from '@/shared/utils/formatNominalInput'
import styles from './ProfilPage.module.css'

interface Props {
  isOpen: boolean
  onClose: () => void
  tagihan: Tagihan[]
  currency: string
  nowMs: number
  onUpdate: () => Promise<void>
  showAdd?: boolean
  initialEditTagihan?: Tagihan | null
}

interface FormState {
  name: string
  nominalType: NominalType
  nominalEstimate: string
  dueDay: string
  recurrenceType: RecurrenceType
}

const EMPTY_FORM: FormState = {
  name: '',
  nominalType: 'tetap',
  nominalEstimate: '',
  dueDay: '',
  recurrenceType: 'rutin',
}

type Step = 'list' | 'form'

export function ProfilTagihanSheet({
  isOpen,
  onClose,
  tagihan,
  currency,
  nowMs,
  onUpdate,
  showAdd = true,
  initialEditTagihan,
}: Props) {
  const [step, setStep] = useState<Step>('list')
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  useEffect(() => {
    if (!isOpen) return
    if (initialEditTagihan) {
      setEditId(initialEditTagihan.id!)
      setForm({
        name: initialEditTagihan.name,
        nominalType: initialEditTagihan.nominalType,
        nominalEstimate: formatNominalDisplay(String(initialEditTagihan.nominalEstimate)),
        dueDay: String(initialEditTagihan.dueDay),
        recurrenceType: initialEditTagihan.recurrenceType,
      })
      setStep('form')
    }
  }, [isOpen, initialEditTagihan])

  function openAdd() {
    setEditId(null)
    setForm(EMPTY_FORM)
    setStep('form')
  }

  function openEdit(t: Tagihan) {
    setEditId(t.id!)
    setForm({
      name: t.name,
      nominalType: t.nominalType,
      nominalEstimate: formatNominalDisplay(String(t.nominalEstimate)),
      dueDay: String(t.dueDay),
      recurrenceType: t.recurrenceType,
    })
    setStep('form')
  }

  async function handleSave() {
    const nominal = parseInt(parseNominalRaw(form.nominalEstimate), 10) || 0
    const dueDay = parseInt(form.dueDay, 10) || 1
    if (!form.name.trim()) return
    if (editId !== null) {
      await updateTagihan(editId, {
        name: form.name.trim(),
        nominalType: form.nominalType,
        nominalEstimate: nominal,
        dueDay,
        recurrenceType: form.recurrenceType,
      })
    } else {
      await addTagihan({
        name: form.name.trim(),
        nominalType: form.nominalType,
        nominalEstimate: nominal,
        dueDay,
        recurrenceType: form.recurrenceType,
        currency,
        isActive: true,
        lastPaidAt: null,
        lastPaidAmount: null,
        createdAt: nowMs,
      })
    }
    await onUpdate()
    setStep('list')
    if (editId === null) onClose()
  }

  async function handleDelete(id: number) {
    await deleteTagihan(id)
    setDeleteId(null)
    await onUpdate()
  }

  const patch = (k: keyof FormState) => (v: string) => setForm((f) => ({ ...f, [k]: v }))

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={() => {
        setStep('list')
        setDeleteId(null)
        onClose()
      }}
      title={step === 'list' ? 'Tagihan' : editId ? 'Edit tagihan' : 'Tambah tagihan'}
    >
      {step === 'list' && (
        <div className={styles.sheetForm}>
          {tagihan.length === 0 && <div className={styles.emptyNote}>Belum ada tagihan.</div>}
          {tagihan.map((t) => (
            <div key={t.id} className={styles.itemRow}>
              <button className={styles.itemBody} onClick={() => openEdit(t)}>
                <span className={styles.listLabel}>{t.name}</span>
                <span className={styles.listVal}>
                  {formatCurrency(t.nominalEstimate, currency)}
                </span>
              </button>
              {deleteId === t.id ? (
                <div className={styles.inlineConfirm}>
                  <button className={styles.dangerBtn} onClick={() => handleDelete(t.id!)}>
                    Hapus
                  </button>
                  <button className={styles.ghostBtn} onClick={() => setDeleteId(null)}>
                    Batal
                  </button>
                </div>
              ) : (
                <button className={styles.deleteBtn} onClick={() => setDeleteId(t.id!)}>
                  ✕
                </button>
              )}
            </div>
          ))}
          {showAdd && (
            <button className={styles.ghostBtn} onClick={openAdd}>
              + Tambah tagihan
            </button>
          )}
        </div>
      )}

      {step === 'form' && (
        <div className={styles.sheetForm}>
          <div className={styles.fieldLabel}>nama tagihan</div>
          <input
            className={styles.fieldInput}
            placeholder="e.g. Spotify, BPJS"
            value={form.name}
            onChange={(e) => patch('name')(e.target.value)}
            autoFocus
          />

          <div className={styles.fieldLabel}>nominal</div>
          <div className={styles.segmented}>
            {(['tetap', 'variabel'] as NominalType[]).map((n) => (
              <button
                key={n}
                className={`${styles.seg} ${form.nominalType === n ? styles.segActive : ''}`}
                onClick={() => patch('nominalType')(n)}
              >
                {n === 'tetap' ? 'selalu sama' : 'bisa berubah'}
              </button>
            ))}
          </div>
          <div className={styles.amountRow}>
            <span className={styles.prefix}>Rp</span>
            <input
              className={styles.amountInput}
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={form.nominalEstimate}
              onChange={(e) =>
                patch('nominalEstimate')(formatNominalDisplay(parseNominalRaw(e.target.value)))
              }
            />
          </div>

          <div className={styles.fieldLabel}>tanggal jatuh tempo (1–31)</div>
          <input
            className={styles.fieldInput}
            type="number"
            inputMode="numeric"
            min={1}
            max={31}
            placeholder="25"
            value={form.dueDay}
            onChange={(e) => patch('dueDay')(e.target.value.replace(/\D/g, ''))}
          />

          <div className={styles.fieldLabel}>frekuensi</div>
          <div className={styles.segmented}>
            {(['rutin', 'sekali'] as RecurrenceType[]).map((r) => (
              <button
                key={r}
                className={`${styles.seg} ${form.recurrenceType === r ? styles.segActive : ''}`}
                onClick={() => patch('recurrenceType')(r)}
              >
                {r}
              </button>
            ))}
          </div>

          <button className={styles.primaryBtn} onClick={handleSave} disabled={!form.name.trim()}>
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
