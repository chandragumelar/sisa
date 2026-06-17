import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import styles from './MonthlyModule.module.css'

interface Props {
  income: number
  expense: number
  totalNabung: number
  currency: string
  nowMs: number
}

export function MonthlyModule({ income, expense, totalNabung, currency, nowMs }: Props) {
  const lang = useLanguage()
  const locale = lang === 'en' ? 'en-US' : 'id-ID'
  const monthLabel = new Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric' }).format(
    new Date(nowMs),
  )

  const items = [
    {
      label: t('home.income_label', lang),
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
      label: t('home.expense_label', lang),
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
      label: t('home.savings_label', lang),
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
        <span className={styles.label}>{t('home.monthly_title', lang)}</span>
        <span className={styles.month}>{monthLabel}</span>
      </div>
      <div className={styles.list}>
        {items.map((item, i) => (
          <div
            key={item.label}
            className={styles.row}
            style={{
              borderBottom: i < items.length - 1 ? '1px solid var(--border-soft)' : 'none',
            }}
          >
            <div className={styles.rowLeft}>
              <span className={styles.rowIcon} style={{ color: item.colorVar }}>
                {item.icon}
              </span>
              <span className={styles.rowLabel}>{item.label}</span>
            </div>
            <span className={styles.rowValue} style={{ color: item.colorVar }}>
              {formatCurrency(item.value, currency)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
