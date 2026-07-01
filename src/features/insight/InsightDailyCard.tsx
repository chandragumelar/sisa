import { useState, useCallback } from 'react'
import type { Language } from '@/db/database'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import { t } from '@/shared/strings/strings'
import { BottomSheet } from '@/shared/components/BottomSheet'
import { buildDailyHeatmap, heatBucket } from './insight.utils'
import type { Transaction } from '@/db/database'
import styles from './InsightDailyCard.module.css'
import insightStyles from './InsightPage.module.css'

interface Props {
  currTxs: Transaction[]
  viewYear: number
  viewMonth: number
  currency: string
  lang: Language
}

const DAY_HEADERS_ID = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
const DAY_HEADERS_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

interface SheetDay {
  day: number
  total: number
  txs: { label: string; category: string; amount: number }[]
}

export function InsightDailyCard({ currTxs, viewYear, viewMonth, currency, lang }: Props) {
  const [sheetDay, setSheetDay] = useState<SheetDay | null>(null)

  const cells = buildDailyHeatmap(currTxs, viewYear, viewMonth)
  const maxDay = Math.max(...cells.map((c) => c.total), 0)
  const activeDays = cells.filter((c) => c.total > 0).length

  const isEmpty = activeDays === 0

  // Offset: which column day 1 falls on (Mon=0 … Sun=6)
  const firstDow = new Date(viewYear, viewMonth, 1).getDay()
  const ghostsBefore = (firstDow + 6) % 7 // convert Sun=0 to Mon=0

  const cellCount = Math.ceil((ghostsBefore + cells.length) / 7) * 7

  const openSheet = useCallback(
    (idx: number) => {
      const cell = cells[idx]
      if (!cell || cell.total === 0) return
      setSheetDay(cell)
    },
    [cells],
  )

  const closeSheet = useCallback(() => setSheetDay(null), [])

  const sheetTitle = sheetDay
    ? new Date(viewYear, viewMonth, sheetDay.day).toLocaleDateString(
        lang === 'id' ? 'id-ID' : 'en-US',
        { weekday: 'long', day: 'numeric', month: 'long' },
      )
    : ''

  const dayHeaders = lang === 'id' ? DAY_HEADERS_ID : DAY_HEADERS_EN

  return (
    <div className={insightStyles.card}>
      <div className={insightStyles.cardLabel}>{t('insight.card_daily', lang)}</div>

      {isEmpty ? (
        <div className={insightStyles.emptyBlock}>
          <p className={insightStyles.emptyMsg} style={{ whiteSpace: 'pre-line' }}>
            {t('insight.daily_empty', lang)}
          </p>
          <p className={insightStyles.emptySub}>{t('insight.daily_empty_sub', lang)}</p>
        </div>
      ) : (
        <>
          <div className={styles.hmHeader}>
            {dayHeaders.map((d) => (
              <div key={d} className={styles.hmDlbl}>
                {d}
              </div>
            ))}
          </div>

          <div className={styles.hmGrid}>
            {Array.from({ length: cellCount }, (_, i) => {
              const dayIdx = i - ghostsBefore
              if (i < ghostsBefore || dayIdx >= cells.length) {
                return <div key={i} className={`${styles.hmCell} ${styles.ghost}`} />
              }
              const cell = cells[dayIdx]
              const heat = heatBucket(cell.total, maxDay)
              const idle = cell.total === 0

              return (
                <div
                  key={i}
                  className={[styles.hmCell, idle ? styles.idle : ''].filter(Boolean).join(' ')}
                  data-h={heat}
                  onClick={idle ? undefined : () => openSheet(dayIdx)}
                  role={idle ? undefined : 'button'}
                  tabIndex={idle ? undefined : 0}
                  onKeyDown={
                    idle
                      ? undefined
                      : (e) => {
                          if (e.key === 'Enter' || e.key === ' ') openSheet(dayIdx)
                        }
                  }
                >
                  <span className={styles.hmDn}>{cell.day}</span>
                </div>
              )
            })}
          </div>

          <div className={styles.hmLegend}>
            <span className={styles.hmLl}>{t('insight.daily_legend_low', lang)}</span>
            <div className={styles.hmSwatches}>
              {[0, 1, 2, 3, 4, 5].map((h) => (
                <div key={h} className={styles.hmSw} data-h={h} />
              ))}
            </div>
            <span className={styles.hmLl}>{t('insight.daily_legend_high', lang)}</span>
          </div>
        </>
      )}

      <BottomSheet isOpen={sheetDay !== null} onClose={closeSheet} title={sheetTitle}>
        {sheetDay && (
          <>
            {sheetDay.txs.length === 0 ? (
              <div className={styles.shEmptyBody}>{t('insight.daily_sheet_empty', lang)}</div>
            ) : (
              <div className={styles.shBody}>
                {sheetDay.txs.map((tx, i) => {
                  const lbl = tx.label.trim()
                  const cat = tx.category.trim()
                  const display =
                    lbl && cat
                      ? `${lbl} · ${cat}`
                      : lbl || cat || t('insight.daily_tx_fallback', lang)
                  return (
                    <div key={i} className={styles.shTx}>
                      <span className={styles.shTxN}>{display}</span>
                      <span className={styles.shTxA}>{formatCurrency(tx.amount, currency)}</span>
                    </div>
                  )
                })}
              </div>
            )}
            {sheetDay.txs.length > 0 && (
              <div className={styles.shFoot}>
                <span className={styles.shFootLbl}>{t('insight.daily_sheet_total', lang)}</span>
                <span className={styles.shFootTotal}>
                  {formatCurrency(sheetDay.total, currency)}
                </span>
              </div>
            )}
          </>
        )}
      </BottomSheet>
    </div>
  )
}
