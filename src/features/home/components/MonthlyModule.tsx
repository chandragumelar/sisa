import { TrendingUp, TrendingDown } from 'lucide-react'
import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import { getCurrencyLabel } from '@/constants/currencies'
import styles from './MonthlyModule.module.css'

interface Props {
  incomeByCurrency: Record<string, number>
  expenseByCurrency: Record<string, number>
  primaryCurrency: string
  nowMs: number
  onHistoryTap?: () => void
}

function sortedCurrencies(byCurrency: Record<string, number>, primaryCurrency: string): string[] {
  const nonZero = Object.keys(byCurrency).filter((c) => byCurrency[c] > 0)
  if (nonZero.length === 0) return [primaryCurrency]
  const hasPrimary = nonZero.includes(primaryCurrency)
  const others = nonZero.filter((c) => c !== primaryCurrency).sort()
  return hasPrimary ? [primaryCurrency, ...others] : others
}

export function MonthlyModule({
  incomeByCurrency,
  expenseByCurrency,
  primaryCurrency,
  nowMs,
  onHistoryTap,
}: Props) {
  const lang = useLanguage()
  const locale = lang === 'en' ? 'en-US' : 'id-ID'
  const monthLabel = new Intl.DateTimeFormat(locale, { month: 'short', year: 'numeric' }).format(
    new Date(nowMs),
  )

  const sections = [
    {
      label: t('home.income_label', lang),
      byCurrency: incomeByCurrency,
      colorVar: 'var(--signal-safe)',
      icon: <TrendingUp size={12} strokeWidth={1.75} />,
    },
    {
      label: t('home.expense_label', lang),
      byCurrency: expenseByCurrency,
      colorVar: 'var(--signal-danger)',
      icon: <TrendingDown size={12} strokeWidth={1.75} />,
    },
  ]

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.label}>
          {t('home.monthly_title', lang).replace('{cur}', getCurrencyLabel(primaryCurrency, lang))}
        </span>
        <span className={styles.month}>{monthLabel}</span>
      </div>
      <div className={styles.headerDivider} />
      <div className={styles.list}>
        {sections.map((section, i) => {
          const currencies = sortedCurrencies(section.byCurrency, primaryCurrency)
          return (
            <div
              key={section.label}
              className={styles.section}
              style={{
                borderBottom: i < sections.length - 1 ? '1px solid var(--border-soft)' : 'none',
              }}
            >
              <div className={styles.row}>
                <div className={styles.rowLeft}>
                  <span className={styles.rowIcon} style={{ color: section.colorVar }}>
                    {section.icon}
                  </span>
                  <span className={styles.rowLabel}>{section.label}</span>
                </div>
              </div>
              {currencies.map((curr) => (
                <div key={curr} className={styles.subRow}>
                  <span className={styles.currencyLabel}>{curr}</span>
                  <span className={styles.rowValue} style={{ color: section.colorVar }}>
                    {formatCurrency(section.byCurrency[curr] ?? 0, curr)}
                  </span>
                </div>
              ))}
            </div>
          )
        })}
      </div>
      {onHistoryTap && (
        <button className={styles.historyLink} onClick={onHistoryTap}>
          {t('home.lihat_riwayat', lang)}
        </button>
      )}
    </div>
  )
}
