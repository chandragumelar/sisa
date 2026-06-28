import type { Tagihan } from '@/db/database'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import { rankTagihan, getTagihanUrgency, formatDueDate } from '../tagihan.utils'
import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'
import styles from './TagihanModule.module.css'

interface Props {
  tagihan: Tagihan[]
  currency: string
  nowMs: number
  onPayTap: (tagihan: Tagihan) => void
  onRowTap: (tagihan: Tagihan) => void
  onAddTap?: () => void
}

const MAX_REGULAR = 4

export function TagihanModule({ tagihan, currency, nowMs, onPayTap, onRowTap, onAddTap }: Props) {
  const lang = useLanguage()
  const active = tagihan.filter((tg) => tg.isActive)
  const ranked = rankTagihan(active, nowMs)

  const byCurrency = new Map<string, number>()
  for (const tg of active) {
    const c = tg.currency || currency
    byCurrency.set(c, (byCurrency.get(c) ?? 0) + tg.nominalEstimate)
  }
  const primaryTotal = byCurrency.get(currency) ?? 0
  const otherTotals = [...byCurrency.entries()]
    .filter(([c]) => c !== currency)
    .map(([c, sum]) => ({ currency: c, sum }))
    .sort((a, b) => b.sum - a.sum)

  const overdue = ranked.filter((tg) => getTagihanUrgency(tg, nowMs) === 'lewat-tempo')
  const regular = ranked.filter((tg) => getTagihanUrgency(tg, nowMs) !== 'lewat-tempo')
  const visibleRegular = regular.slice(0, MAX_REGULAR)
  const hiddenCount = regular.length - visibleRegular.length

  return (
    <div className={styles.card}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            stroke="var(--ink-tertiary)"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="6" cy="6" r="4.5" />
            <path d="M6 3.5V6L7.8 7.8" />
          </svg>
          <span className={styles.label}>{t('tagihan_module.title', lang)}</span>
        </div>
      </div>

      <div className={styles.headerDivider} />

      {active.length === 0 ? (
        <div className={styles.emptyBlock}>
          <p className={styles.emptyText}>{t('tagihan_module.empty_text', lang)}</p>
          <button className={styles.addBtn} onClick={onAddTap}>
            {t('tagihan_module.add', lang)}
          </button>
        </div>
      ) : (
        <>
          {/* Overdue blocks */}
          {overdue.map((tg) => (
            <div key={tg.id} className={styles.overdueBlock}>
              <svg
                width="13"
                height="13"
                viewBox="0 0 14 14"
                fill="none"
                stroke="var(--signal-danger)"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={styles.warnIcon}
              >
                <path d="M7 1.5L1.2 12H12.8L7 1.5Z" />
                <line x1="7" y1="6" x2="7" y2="8.5" />
                <circle cx="7" cy="10.5" r="0.65" fill="var(--signal-danger)" stroke="none" />
              </svg>
              <div className={styles.overdueInfo}>
                <div className={styles.overdueName}>{tg.name}</div>
                <div className={styles.overdueSub}>Lewat tempo — segera bayar</div>
              </div>
              <span className={styles.overdueAmt}>
                {formatCurrency(tg.nominalEstimate, tg.currency || currency)}
              </span>
              <button className={styles.bayarBtn} onClick={() => onPayTap(tg)}>
                Bayar
              </button>
            </div>
          ))}

          {/* Regular rows — 2-col: name+date left, amount right */}
          {visibleRegular.map((tg, i) => (
            <button
              key={tg.id}
              className={styles.row}
              style={{
                borderBottom:
                  i < visibleRegular.length - 1 || hiddenCount > 0
                    ? '1px solid var(--border-soft)'
                    : 'none',
              }}
              onClick={() => onRowTap(tg)}
            >
              <div className={styles.rowInfo}>
                <span className={styles.rowName}>{tg.name}</span>
                <span className={styles.rowDate}>jatuh tempo {formatDueDate(tg, nowMs)}</span>
              </div>
              <span className={styles.rowAmt}>
                {formatCurrency(tg.nominalEstimate, tg.currency || currency)}
              </span>
            </button>
          ))}

          {hiddenCount > 0 && (
            <button className={styles.expandRow} onClick={onAddTap}>
              <span>+ {hiddenCount} tagihan lagi</span>
              <svg
                width="13"
                height="13"
                viewBox="0 0 14 14"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 5.5L7 9.5L11 5.5" />
              </svg>
            </button>
          )}

          {/* Total zone — tinted, struk-style */}
          <div className={styles.totalZone}>
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>Total</span>
              <span className={styles.totalNum}>{formatCurrency(primaryTotal, currency)}</span>
            </div>
            {otherTotals.map(({ currency: c, sum }) => (
              <div key={c} className={styles.totalRowOther}>
                <span className={styles.totalLabelOther}>Total · {c}</span>
                <span className={styles.totalNumOther}>{formatCurrency(sum, c)}</span>
              </div>
            ))}
          </div>

          <button className={styles.addBtn} onClick={onAddTap}>
            {t('tagihan_module.add', lang)}
          </button>
        </>
      )}
    </div>
  )
}
