import { useState } from 'react'
import { useLanguage } from '@/app/providers/useLanguage'
import { BottomSheet } from '@/shared/components/BottomSheet'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import { t } from '@/shared/strings/strings'
import { AlokasiEditor } from './AlokasiEditor'
import styles from './AlokasiEditSheet.module.css'

interface Props {
  isOpen: boolean
  onClose: () => void
  bisaDialokasi: number
  sisaHari: number
  currency: string
  initialOperasional: number
  periodeLabel: string
  onSave: (operasional: number) => void
}

export function AlokasiEditSheet({
  isOpen,
  onClose,
  bisaDialokasi,
  sisaHari,
  currency,
  initialOperasional,
  periodeLabel,
  onSave,
}: Props) {
  const lang = useLanguage()
  const [operasional, setOperasional] = useState(initialOperasional)

  function handleSave() {
    onSave(operasional)
    onClose()
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={t('alokasi.atur_ulang_title', lang)}>
      <div className={styles.reminderRow}>
        <span className={styles.reminderLabel}>{t('alokasi.bisa_kamu_atur', lang)}</span>
        <span className={styles.reminderAmt}>{formatCurrency(bisaDialokasi, currency)}</span>
      </div>

      <AlokasiEditor
        bisaDialokasi={bisaDialokasi}
        sisaHari={sisaHari}
        currency={currency}
        operasional={operasional}
        periodeLabel={periodeLabel}
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
