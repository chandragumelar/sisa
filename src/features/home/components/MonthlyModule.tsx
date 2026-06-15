import { formatCurrency } from '@/shared/utils/formatCurrency'
import styles from './MonthlyModule.module.css'

interface Props {
  income: number
  expense: number
  totalNabung: number
  currency: string
  nowMs: number
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

export function MonthlyModule({ income, expense, totalNabung, currency, nowMs }: Props) {
  const now = new Date(nowMs)
  const monthLabel = `${MONTHS[now.getMonth()]} ${now.getFullYear()}`

  const items = [
    {
      label: 'Pemasukan',
      value: income,
      colorVar: 'var(--signal-safe)',
      icon: (
        <svg width="12" height="12" viewBox="0 0 13 13" fill="none">
          <polyline
            points="1,10 4.5,5.5 7,8 12,2"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline
            points="9,2 12,2 12,5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      label: 'Pengeluaran',
      value: expense,
      colorVar: 'var(--signal-danger)',
      icon: (
        <svg width="12" height="12" viewBox="0 0 13 13" fill="none">
          <polyline
            points="1,3 4.5,7.5 7,5 12,11"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline
            points="9,11 12,11 12,8"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
    },
    {
      label: 'Tabungan',
      value: totalNabung,
      colorVar: 'var(--accent)',
      icon: (
        <svg width="12" height="12" viewBox="0 0 13 13" fill="none">
          <path d="M6.5 11V3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <path
            d="M4 5L6.5 2.5L9 5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <line
            x1="2"
            y1="12"
            x2="11"
            y2="12"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      ),
    },
  ]

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.label}>Bulan Ini</span>
        <span className={styles.month}>{monthLabel}</span>
      </div>
      <div className={styles.grid}>
        {items.map((item) => (
          <div key={item.label} className={styles.cell}>
            <div className={styles.cellIcon} style={{ color: item.colorVar }}>
              {item.icon}
            </div>
            <div className={styles.cellValue} style={{ color: item.colorVar }}>
              {formatCurrency(item.value, currency)}
            </div>
            <div className={styles.cellLabel}>{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
