import { useState } from 'react'
import { BottomSheet } from '@/shared/components/BottomSheet'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import { AlokasiEditor } from './AlokasiEditor'
import styles from './AlokasiEditSheet.module.css'

interface Props {
  isOpen: boolean
  onClose: () => void
  bisaDialokasi: number
  sisaHari: number
  currency: string
  initialOperasional: number
  onSave: (operasional: number) => void
}

export function AlokasiEditSheet({
  isOpen,
  onClose,
  bisaDialokasi,
  sisaHari,
  currency,
  initialOperasional,
  onSave,
}: Props) {
  const [operasional, setOperasional] = useState(initialOperasional)

  function handleSave() {
    onSave(operasional)
    onClose()
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Atur ulang alokasi">
      <div className={styles.reminderRow}>
        <span className={styles.reminderLabel}>Bisa dialokasikan</span>
        <span className={styles.reminderAmt}>{formatCurrency(bisaDialokasi, currency)}</span>
      </div>

      <AlokasiEditor
        bisaDialokasi={bisaDialokasi}
        sisaHari={sisaHari}
        currency={currency}
        operasional={operasional}
        onChange={setOperasional}
        compact
      />

      <div className={styles.actions}>
        <button className={styles.saveBtn} onClick={handleSave}>
          Simpan alokasi
        </button>
        <button className={styles.cancelBtn} onClick={onClose}>
          Batal
        </button>
      </div>
    </BottomSheet>
  )
}
