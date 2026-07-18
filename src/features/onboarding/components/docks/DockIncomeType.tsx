import type { IncomeType } from '@/db/database'
import { useLanguage } from '@/app/providers/useLanguage'
import { t, type StringKey } from '@/shared/strings/strings'
import styles from './Dock.module.css'

interface Props {
  onNext: (incomeType: IncomeType, echo: string) => void
}

const OPTIONS: { value: IncomeType; labelKey: StringKey; subKey: StringKey }[] = [
  { value: 'tetap', labelKey: 'ob.step4a.tetap_label', subKey: 'ob.step4a.tetap_sub' },
  { value: 'freelance', labelKey: 'ob.step4a.freelance_label', subKey: 'ob.step4a.freelance_sub' },
  { value: 'mix', labelKey: 'ob.step4a.mix_label', subKey: 'ob.step4a.mix_sub' },
]

export function DockIncomeType({ onNext }: Props) {
  const lang = useLanguage()

  return (
    <div className={`${styles.chipColumn} ${styles.dockPop}`}>
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          className={styles.optionChip}
          onClick={() => onNext(opt.value, t(opt.labelKey, lang))}
        >
          <span className={styles.optionLabel}>{t(opt.labelKey, lang)}</span>
          <span className={styles.optionSub}>{t(opt.subKey, lang)}</span>
        </button>
      ))}
    </div>
  )
}
