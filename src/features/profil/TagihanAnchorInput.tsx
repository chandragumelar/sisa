import type { TagihanFrequency } from '@/db/database'
import type { Language } from '@/db/database'
import { t, toLocale } from '@/shared/strings/strings'
import styles from './ProfilPage.module.css'

export interface AnchorFields {
  dueDay: string
  fullDate: string
  weekDay: string
  anchorMonth: string
  annualMonth: string
}

interface Props {
  frequency: TagihanFrequency
  fields: AnchorFields
  onChange: (field: keyof AnchorFields, value: string) => void
  lang: Language
}

function getDayNames(lang: Language): string[] {
  const locale = toLocale(lang)
  // Generate Mon–Sun names (2024-01-01 = Monday)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(2024, 0, 1 + i)
    return d.toLocaleDateString(locale, { weekday: 'long' })
  })
}

function getMonthNames(lang: Language): string[] {
  const locale = toLocale(lang)
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(2024, i, 1)
    return d.toLocaleDateString(locale, { month: 'long' })
  })
}

export function TagihanAnchorInput({ frequency, fields, onChange, lang }: Props) {
  if (frequency === 'sekali') {
    return (
      <>
        <div className={styles.fieldLabel}>{t('profil.tagihan_date_label', lang)}</div>
        <input
          className={styles.fieldInput}
          type="date"
          value={fields.fullDate}
          onChange={(e) => onChange('fullDate', e.target.value)}
        />
      </>
    )
  }

  if (frequency === 'mingguan' || frequency === '2mingguan') {
    const dayNames = getDayNames(lang)
    return (
      <>
        <div className={styles.fieldLabel}>{t('profil.tagihan_weekday_label', lang)}</div>
        <select
          className={styles.fieldInput}
          value={fields.weekDay}
          onChange={(e) => onChange('weekDay', e.target.value)}
        >
          {dayNames.map((name, i) => (
            <option key={i} value={String(i + 1)}>
              {name}
            </option>
          ))}
        </select>
      </>
    )
  }

  if (frequency === 'bulanan') {
    return (
      <>
        <div className={styles.fieldLabel}>{t('profil.tagihan_due_label', lang)}</div>
        <input
          className={styles.fieldInput}
          type="number"
          inputMode="numeric"
          min={1}
          max={31}
          placeholder="25"
          value={fields.dueDay}
          onChange={(e) => onChange('dueDay', e.target.value.replace(/\D/g, ''))}
        />
      </>
    )
  }

  if (frequency === '2bulanan' || frequency === '3bulanan') {
    const monthNames = getMonthNames(lang)
    return (
      <>
        <div className={styles.fieldLabel}>{t('profil.tagihan_date_label', lang)}</div>
        <input
          className={styles.fieldInput}
          type="number"
          inputMode="numeric"
          min={1}
          max={31}
          placeholder="25"
          value={fields.dueDay}
          onChange={(e) => onChange('dueDay', e.target.value.replace(/\D/g, ''))}
        />

        <div className={styles.fieldLabel}>{t('profil.tagihan_anchor_month_label', lang)}</div>
        <select
          className={styles.fieldInput}
          value={fields.anchorMonth}
          onChange={(e) => onChange('anchorMonth', e.target.value)}
        >
          {monthNames.map((name, i) => (
            <option key={i} value={String(i + 1)}>
              {name}
            </option>
          ))}
        </select>
      </>
    )
  }

  if (frequency === 'tahunan') {
    const monthNames = getMonthNames(lang)
    return (
      <>
        <div className={styles.fieldLabel}>{t('profil.tagihan_date_label', lang)}</div>
        <input
          className={styles.fieldInput}
          type="number"
          inputMode="numeric"
          min={1}
          max={31}
          placeholder="25"
          value={fields.dueDay}
          onChange={(e) => onChange('dueDay', e.target.value.replace(/\D/g, ''))}
        />

        <div className={styles.fieldLabel}>{t('profil.tagihan_annual_month_label', lang)}</div>
        <select
          className={styles.fieldInput}
          value={fields.annualMonth}
          onChange={(e) => onChange('annualMonth', e.target.value)}
        >
          {monthNames.map((name, i) => (
            <option key={i} value={String(i + 1)}>
              {name}
            </option>
          ))}
        </select>
      </>
    )
  }

  return null
}
