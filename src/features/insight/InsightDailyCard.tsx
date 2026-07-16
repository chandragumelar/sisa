import { useState, useCallback } from 'react'
import type { Language } from '@/db/database'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import { t } from '@/shared/strings/strings'
import { BottomSheet } from '@/shared/components/BottomSheet'
import { useClock } from '@/app/providers/useClock'
import { buildDailyHeatmap } from './insight.utils'
import type { DayCell } from './insight.utils'
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

interface SheetDay {
  day: number
  total: number
  txs: { label: string; category: string; amount: number }[]
}

type Column = { kind: 'sep' } | { kind: 'day'; cell: DayCell; isWeekend: boolean }

export function InsightDailyCard({ currTxs, viewYear, viewMonth, currency, lang }: Props) {
  const [sheetDay, setSheetDay] = useState<SheetDay | null>(null)
  const clock = useClock()

  const cells = buildDailyHeatmap(currTxs, viewYear, viewMonth)
  const maxDay = Math.max(...cells.map((c) => c.total), 0)
  const activeDays = cells.filter((c) => c.total > 0).length

  const isEmpty = activeDays === 0

  const today = new Date(clock.now())
  const isCurrentMonth = today.getFullYear() === viewYear && today.getMonth() === viewMonth
  const todayDate = today.getDate()

  const columns: Column[] = []
  cells.forEach((cell, i) => {
    const dow = new Date(viewYear, viewMonth, cell.day).getDay()
    if (dow === 1 && i > 0) columns.push({ kind: 'sep' })
    columns.push({ kind: 'day', cell, isWeekend: dow === 0 || dow === 6 })
  })

  const lastDay = cells[cells.length - 1]?.day ?? 1
  const labelDays = new Set([1, 8, 15, 22, lastDay])

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
          <div className={styles.wave}>
            {columns.map((col, i) => {
              if (col.kind === 'sep') return <div key={`sep-${i}`} className={styles.waveSep} />
              const { cell, isWeekend } = col
              const idx = cell.day - 1
              const idle = cell.total === 0
              const barHeight = idle ? '2px' : `max(${Math.sqrt(cell.total / maxDay) * 100}%, 4px)`
              return (
                <div
                  key={cell.day}
                  className={styles.waveBar}
                  data-idle={idle || undefined}
                  data-weekend={!idle && isWeekend ? true : undefined}
                  style={{ height: barHeight }}
                  onClick={idle ? undefined : () => openSheet(idx)}
                  role={idle ? undefined : 'button'}
                  tabIndex={idle ? undefined : 0}
                  onKeyDown={
                    idle
                      ? undefined
                      : (e) => {
                          if (e.key === 'Enter' || e.key === ' ') openSheet(idx)
                        }
                  }
                >
                  {isCurrentMonth && cell.day === todayDate && (
                    <span className={styles.waveToday} />
                  )}
                </div>
              )
            })}
          </div>

          <div className={styles.waveLabels}>
            {columns.map((col, i) =>
              col.kind === 'sep' ? (
                <div key={`sep-${i}`} className={styles.waveSepSpace} />
              ) : (
                <div key={col.cell.day} className={styles.waveLabel}>
                  {labelDays.has(col.cell.day) ? col.cell.day : ''}
                </div>
              ),
            )}
          </div>

          <p className={styles.waveHint}>{t('insight.daily_hint', lang)}</p>
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
