import type { SavedScenario } from '@/db/database'
import type { AndaiBaseline, AndaiItem } from './andai.utils'
import { calcAndai } from './andai.utils'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import { BottomSheet } from '@/shared/components/BottomSheet'
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
  const [a, b] = scenarios
  const resultA = calcAndai(parseItems(a), baseline)
  const resultB = calcAndai(parseItems(b), baseline)

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Banding skenario">
      <div className={styles.body}>
        <div className={styles.cols}>
          <div className={styles.colHead}>{a.name}</div>
          <div className={styles.colHead}>{b.name}</div>
        </div>

        <CompareRow
          label="jatah harian"
          valA={resultA.dailyAfter}
          valB={resultB.dailyAfter}
          currency={currency}
        />
        <CompareRow
          label="sisa operasional"
          valA={resultA.sisaAfter}
          valB={resultB.sisaAfter}
          currency={currency}
        />
        <CompareRow
          label="total tabungan"
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
