import { useState } from 'react'
import { patchSettings } from '@/db/settings.repository'
import type { Settings, IncomeType, WeekendBehavior } from '@/db/database'
import { BottomSheet } from '@/shared/components/BottomSheet'
import styles from './ProfilPage.module.css'

interface Props {
  isOpen: boolean
  onClose: () => void
  settings: Settings
  nowMs: number
  onUpdate: () => Promise<void>
}

export function ProfilIncomeSheet({ isOpen, onClose, settings, onUpdate }: Props) {
  const [incomeType, setIncomeType] = useState<IncomeType>(settings.incomeType)
  const [incomeDay, setIncomeDay] = useState(String(settings.incomeDay ?? 25))
  const [weekendBehavior, setWeekendBehavior] = useState<WeekendBehavior | null>(
    settings.weekendBehavior,
  )
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    await patchSettings({
      incomeType,
      incomeDay: incomeType !== 'freelance' ? parseInt(incomeDay, 10) || 25 : null,
      weekendBehavior,
    })
    await onUpdate()
    setSaving(false)
    onClose()
  }

  const showPayday = incomeType !== 'freelance'

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Profil keuangan">
      <div className={styles.sheetForm}>
        <div className={styles.fieldLabel}>tipe income</div>
        <div className={styles.segmented}>
          {(['tetap', 'freelance', 'mix'] as IncomeType[]).map((t) => (
            <button
              key={t}
              className={`${styles.seg} ${incomeType === t ? styles.segActive : ''}`}
              onClick={() => setIncomeType(t)}
            >
              {t}
            </button>
          ))}
        </div>

        {showPayday && (
          <>
            <div className={styles.fieldLabel}>tanggal gajian (1–31)</div>
            <input
              className={styles.fieldInput}
              type="number"
              inputMode="numeric"
              min={1}
              max={31}
              value={incomeDay}
              onChange={(e) => setIncomeDay(e.target.value.replace(/\D/g, ''))}
            />
            <div className={styles.fieldLabel}>kalau jatuh di weekend</div>
            <div className={styles.optionList}>
              {(
                [
                  ['maju-jumat', 'Maju ke Jumat'],
                  ['mundur-senin', 'Mundur ke Senin'],
                  ['tetap', 'Tetap di hari itu'],
                  ['tidak-konsisten', 'Tidak konsisten'],
                ] as [WeekendBehavior, string][]
              ).map(([val, label]) => (
                <button
                  key={val}
                  className={`${styles.optionBtn} ${weekendBehavior === val ? styles.optionBtnActive : ''}`}
                  onClick={() => setWeekendBehavior(val)}
                >
                  {label}
                </button>
              ))}
            </div>
          </>
        )}

        {incomeType === 'freelance' && (
          <div className={styles.fieldNote}>
            Freelance: sisa = saldo minimum akhir bulan. Payday = hari terakhir bulan.
          </div>
        )}

        <button className={styles.primaryBtn} onClick={handleSave} disabled={saving}>
          Simpan
        </button>
      </div>
    </BottomSheet>
  )
}
