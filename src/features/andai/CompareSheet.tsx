import type { SavedScenario } from '@/db/database'
import type { AndaiBaseline, AndaiItem } from './andai.utils'
import { calcAndai } from './andai.utils'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import { BottomSheet } from '@/shared/components/BottomSheet'
import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'
import styles from './CompareSheet.module.css'

interface Props {
  isOpen: boolean
  onClose: () => void
  scenarios: [SavedScenario, SavedScenario]
  baseline: AndaiBaseline
  currency: string
}

function parseItems(scenario: SavedScenario): AndaiItem[] {
  try {
    return JSON.parse(scenario.items) as AndaiItem[]
  } catch {
    return []
  }
}

export function CompareSheet({ isOpen, onClose, scenarios, baseline, currency }: Props) {
  const lang = useLanguage()
  const [a, b] = scenarios
  const resultA = calcAndai(parseItems(a), baseline)
  const resultB = calcAndai(parseItems(b), baseline)

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={t('andai.compare_sheet_title', lang)}>
      <div className={styles.body}>
        <div className={styles.cols}>
          <div className={styles.colHead}>{a.name}</div>
          <div className={styles.colHead}>{b.name}</div>
        </div>

        <CompareRow
          label={t('andai.compare_daily', lang)}
          valA={resultA.dailyAfter}
          valB={resultB.dailyAfter}
          currency={currency}
        />
        <CompareRow
          label={t('andai.compare_sisa', lang)}
          valA={resultA.sisaAfter}
          valB={resultB.sisaAfter}
          currency={currency}
        />
        <CompareRow
          label={t('andai.compare_tabungan', lang)}
          valA={resultA.nabungAfter}
          valB={resultB.nabungAfter}
          currency={currency}
        />
      </div>
    </BottomSheet>
  )
}

function CompareRow({
  label,
  valA,
  valB,
  currency,
}: {
  label: string
  valA: number
  valB: number
  currency: string
}) {
  const aWins = valA >= valB

  return (
    <div className={styles.metricRow}>
      <div className={styles.metricLabel}>{label}</div>
      <div className={styles.metricCols}>
        <span className={`${styles.metricVal} ${aWins ? styles.metricWin : ''}`}>
          {formatCurrency(valA, currency)}
        </span>
        <span className={`${styles.metricVal} ${!aWins ? styles.metricWin : ''}`}>
          {formatCurrency(valB, currency)}
        </span>
      </div>
    </div>
  )
}
