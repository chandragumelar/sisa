import type { IncomeType } from '@/db/database'
import { useLanguage } from '@/app/providers/useLanguage'
import { t, type StringKey } from '@/shared/strings/strings'
import styles from './Dock.module.css'

interface Props {
  onNext: (incomeType: IncomeType, echo: string) => void
}

const OPTIONS: { value: IncomeType; labelKey: StringKey }[] = [
  { value: 'tetap', labelKey: 'ob.step4a.tetap_label' },
  { value: 'freelance', labelKey: 'ob.step4a.freelance_label' },
  { value: 'mix', labelKey: 'ob.step4a.mix_label' },
]

export function DockIncomeType({ onNext }: Props) {
  const lang = useLanguage()

  return (
    <div className={styles.chipColumn}>
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          className={styles.optionChip}
          onClick={() => onNext(opt.value, t(opt.labelKey, lang))}
        >
          <span className={styles.optionLabel}>{t(opt.labelKey, lang)}</span>
        </button>
      ))}
    </div>
  )
}
