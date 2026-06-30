import { useState } from 'react'
import { patchSettings } from '@/db/settings.repository'
import type { Settings, IncomeType, WeekendBehavior } from '@/db/database'
import { BottomSheet } from '@/shared/components/BottomSheet'
import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'
import styles from './ProfilPage.module.css'

interface Props {
  isOpen: boolean
  onClose: () => void
  settings: Settings
  nowMs: number
  onUpdate: () => Promise<void>
}

export function ProfilIncomeSheet({ isOpen, onClose, settings, onUpdate }: Props) {
  const lang = useLanguage()
  const [incomeType, setIncomeType] = useState<IncomeType>(settings.incomeType)
  const [incomeDay, setIncomeDay] = useState(String(settings.incomeDay ?? 25))
  const [weekendBehavior, setWeekendBehavior] = useState<WeekendBehavior>(
    settings.weekendBehavior ?? 'tetap',
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

  const incomeTypeLabels: Record<IncomeType, string> = {
    tetap: t('profil.income_type_tetap', lang),
    freelance: t('profil.income_type_freelance', lang),
    mix: t('profil.income_type_mix', lang),
  }

  const weekendOptions: [WeekendBehavior, string][] = [
    ['maju-jumat', t('profil.income_weekend_maju', lang)],
    ['mundur-senin', t('profil.income_weekend_mundur', lang)],
    ['tetap', t('profil.income_weekend_tetap', lang)],
  ]

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={t('profil.income_title', lang)}>
      <div className={styles.sheetForm}>
        <div className={styles.fieldLabel}>{t('profil.income_type_label', lang)}</div>
        <div className={styles.segmented}>
          {(['tetap', 'freelance', 'mix'] as IncomeType[]).map((type) => (
            <button
              key={type}
              className={`${styles.seg} ${incomeType === type ? styles.segActive : ''}`}
              onClick={() => setIncomeType(type)}
            >
              {incomeTypeLabels[type]}
            </button>
          ))}
        </div>

        {showPayday && (
          <>
            <div className={styles.fieldLabel}>{t('profil.income_day_label', lang)}</div>
            <input
              className={styles.fieldInput}
              type="number"
              inputMode="numeric"
              min={1}
              max={31}
              value={incomeDay}
              onChange={(e) => setIncomeDay(e.target.value.replace(/\D/g, ''))}
            />
            <div className={styles.fieldLabel}>{t('profil.income_weekend_label', lang)}</div>
            <div className={styles.optionList}>
              {weekendOptions.map(([val, label]) => (
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
          <div className={styles.fieldNote}>{t('profil.income_freelance_note', lang)}</div>
        )}

        <button className={styles.primaryBtn} onClick={handleSave} disabled={saving}>
          {t('profil.income_save', lang)}
        </button>
      </div>
    </BottomSheet>
  )
}
