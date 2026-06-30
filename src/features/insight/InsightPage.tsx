import { useState, useEffect } from 'react'
import { useClock } from '@/app/providers/useClock'
import { useLanguage } from '@/app/providers/useLanguage'
import { getSettings } from '@/db/settings.repository'
import { getAllocation } from '@/db/allocation.repository'
import { getTransactionsByDateRange } from '@/db/transactions.repository'
import { getRate, refreshRatesIfStale } from '@/shared/utils/fx'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import { t } from '@/shared/strings/strings'
import type { Transaction } from '@/db/database'
import {
  getMonthBounds,
  sumExpense,
  sumIncome,
  spendPct,
  dailyAvg,
  buildHeroVariant,
  aggregateByCategory,
  buildCategoryRanking,
  buildTop5,
  buildChartData,
  formatMonthShort,
  formatMonthLong,
  type InsightData,
  type ChartMetric,
} from './insight.utils'
import { InsightMonthlyCard } from './InsightMonthlyCard'
import { InsightCategoryCard } from './InsightCategoryCard'
import { InsightRankingCard } from './InsightRankingCard'
import { InsightTopTxCard } from './InsightTopTxCard'
import styles from './InsightPage.module.css'

export function InsightPage() {
  const clock = useClock()
  const lang = useLanguage()
  const nowMs = clock.now()
  const today = new Date(nowMs)

  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [metric, setMetric] = useState<ChartMetric>('net')
  const [selectedCat, setSelectedCat] = useState('')
  const [data, setData] = useState<InsightData | null>(null)
  const [currency, setCurrency] = useState('IDR')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      const [settings, allocation] = await Promise.all([getSettings(), getAllocation()])
      const primary = settings?.primaryCurrency ?? 'IDR'

      const fetchEnd = new Date(viewYear, viewMonth + 1, 1).getTime()
      const fetchStart = new Date(viewYear, viewMonth - 12, 1).getTime()
      const rawTxs = await getTransactionsByDateRange(fetchStart, fetchEnd)

      const foreignCurrencies = [
        ...new Set(rawTxs.filter((t) => t.currency !== primary).map((t) => t.currency)),
      ]
      if (foreignCurrencies.length > 0) await refreshRatesIfStale(primary, foreignCurrencies)

      const normalized: Transaction[] = []
      let hasForeignSkipped = false
      for (const tx of rawTxs) {
        if (tx.currency === primary) {
          normalized.push(tx)
        } else {
          const rate = await getRate(tx.currency, primary)
          if (rate !== null) {
            normalized.push({ ...tx, amount: tx.amount * rate, currency: primary })
          } else {
            hasForeignSkipped = true
          }
        }
      }

      const { startMs: cStart, endMs: cEnd } = getMonthBounds(viewYear, viewMonth)
      const prevM = viewMonth === 0 ? 11 : viewMonth - 1
      const prevY = viewMonth === 0 ? viewYear - 1 : viewYear
      const { startMs: pStart, endMs: pEnd } = getMonthBounds(prevY, prevM)

      if (!cancelled) {
        setCurrency(primary)
        setData({
          currTxs: normalized.filter((tx) => tx.date >= cStart && tx.date < cEnd),
          prevTxs: normalized.filter((tx) => tx.date >= pStart && tx.date < pEnd),
          allTxs: normalized,
          jatahHarian: allocation?.jatahHarian ?? null,
          hasForeignSkipped,
        })
        setLoading(false)
      }
    }

    load().catch(() => {
      if (!cancelled) setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [viewYear, viewMonth])

  function prevMonth() {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1)
      setViewMonth(11)
    } else setViewMonth((m) => m - 1)
    setSelectedCat('')
  }

  function nextMonth() {
    const now = new Date(nowMs)
    if (viewYear === now.getFullYear() && viewMonth === now.getMonth()) return
    if (viewMonth === 11) {
      setViewYear((y) => y + 1)
      setViewMonth(0)
    } else setViewMonth((m) => m + 1)
    setSelectedCat('')
  }

  const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth()
  const isNextDisabled = isCurrentMonth

  const prevY = viewMonth === 0 ? viewYear - 1 : viewYear
  const prevM = viewMonth === 0 ? 11 : viewMonth - 1
  const currMonthShort = formatMonthShort(viewYear, viewMonth, lang)
  const prevMonthShort = formatMonthShort(prevY, prevM, lang)

  const currExpense = data ? sumExpense(data.currTxs) : 0
  const currIncome = data ? sumIncome(data.currTxs) : 0
  const prevExpense = data ? sumExpense(data.prevTxs) : 0
  const pct = spendPct(currExpense, currIncome)
  const daysElapsed = isCurrentMonth
    ? today.getDate()
    : new Date(viewYear, viewMonth + 1, 0).getDate()
  const avgDaily = dailyAvg(currExpense, daysElapsed)
  const hero = data
    ? buildHeroVariant(currExpense, currIncome, prevExpense > 0 ? prevExpense : null)
    : null
  const chartData = data ? buildChartData(data.allTxs, viewYear, viewMonth) : []
  const currCatMap = data ? aggregateByCategory(data.currTxs) : new Map()
  const prevCatMap = data ? aggregateByCategory(data.prevTxs) : new Map()
  const ranking = buildCategoryRanking(currCatMap, prevCatMap)
  const effectiveCat = selectedCat || ranking[0]?.name || ''
  const currTop5 = data ? buildTop5(data.currTxs) : []
  const prevTop5 = data ? buildTop5(data.prevTxs) : []

  // Auto-select category when ranking loads
  useEffect(() => {
    if (!selectedCat && ranking.length > 0) setSelectedCat(ranking[0].name)
  }, [ranking.length]) // eslint-disable-line react-hooks/exhaustive-deps

  function heroText(): { headline: string; sub: string } {
    if (!hero) return { headline: '', sub: '' }
    if (hero.kind === 'comparative') {
      const key = hero.hemat ? 'insight.hero_hemat' : 'insight.hero_boros'
      const subKey = hero.hemat ? 'insight.hero_hemat_sub' : 'insight.hero_boros_sub'
      return {
        headline: t(key, lang)
          .replace('{pct}', String(hero.deltaPct))
          .replace('{month}', prevMonthShort),
        sub: t(subKey, lang).replace('{amount}', formatCurrency(hero.deltaAmount, currency)),
      }
    }
    if (hero.kind === 'ratio') {
      return {
        headline: t('insight.hero_ratio', lang).replace('{pct}', String(hero.pct)),
        sub: t('insight.hero_ratio_sub', lang)
          .replace('{amount}', formatCurrency(Math.max(hero.remaining, 0), currency))
          .replace('{income}', formatCurrency(hero.income, currency)),
      }
    }
    return {
      headline: t(
        hero.hasExpense ? 'insight.hero_neutral_calm' : 'insight.hero_neutral_fresh',
        lang,
      ),
      sub: t('insight.hero_neutral_sub', lang),
    }
  }

  const { headline, sub } = heroText()

  return (
    <div className={styles.shell}>
      <main className={styles.page}>
        {/* Month nav */}
        <div className={styles.monthNav}>
          <button
            className={styles.navBtn}
            onClick={prevMonth}
            aria-label={t('insight.prev_month_aria', lang)}
          >
            ‹
          </button>
          <span className={styles.navMonth}>{formatMonthLong(viewYear, viewMonth, lang)}</span>
          <button
            className={styles.navBtn}
            onClick={nextMonth}
            disabled={isNextDisabled}
            aria-label={t('insight.next_month_aria', lang)}
          >
            ›
          </button>
        </div>

        {loading ? (
          <div className={styles.loadingBlock} />
        ) : (
          <>
            {data?.hasForeignSkipped && (
              <p className={styles.fxSkip}>{t('insight.fx_skip', lang)}</p>
            )}

            {/* ① Hero */}
            <div className={styles.card}>
              <p className={styles.heroHeadline}>{headline}</p>
              {sub ? <p className={styles.heroSub}>{sub}</p> : null}
            </div>

            {/* ② Monthly chart */}
            <InsightMonthlyCard
              currExpense={currExpense}
              currIncome={currIncome}
              prevExpense={prevExpense}
              prevMonthShort={prevMonthShort}
              chartData={chartData}
              metric={metric}
              onMetricChange={setMetric}
              currency={currency}
              lang={lang}
            />

            {/* ③ Category */}
            <InsightCategoryCard
              rows={ranking}
              selected={effectiveCat}
              onSelect={setSelectedCat}
              currMonthShort={currMonthShort}
              prevMonthShort={prevMonthShort}
              currency={currency}
              lang={lang}
            />

            {/* ④ Spend pct */}
            <div className={styles.card}>
              <div className={styles.cardLabel}>{t('insight.card_spend_pct', lang)}</div>
              {pct === null ? (
                <div className={styles.emptyBlock}>
                  <p className={styles.emptyMsg} style={{ whiteSpace: 'pre-line' }}>
                    {t('insight.spend_pct_empty', lang)}
                  </p>
                  <p className={styles.emptySub}>{t('insight.spend_pct_empty_sub', lang)}</p>
                </div>
              ) : (
                <>
                  <div className={styles.pctRow}>
                    <span className={styles.bigNum}>{pct}%</span>
                    <span className={styles.pctFrom}>{t('insight.spend_pct_from', lang)}</span>
                  </div>
                  <div className={styles.btrack}>
                    <div className={styles.bfill} style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                  <div className={styles.blegend}>
                    <span>
                      {t('insight.spend_pct_used', lang).replace(
                        '{amount}',
                        formatCurrency(currExpense, currency),
                      )}
                    </span>
                    <span>
                      {t('insight.spend_pct_left', lang).replace(
                        '{amount}',
                        formatCurrency(Math.max(currIncome - currExpense, 0), currency),
                      )}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* ⑤ Daily */}
            <div className={styles.card}>
              <div className={styles.cardLabel}>{t('insight.card_daily', lang)}</div>
              {currExpense === 0 ? (
                <div className={styles.emptyBlock}>
                  <p className={styles.emptyMsg} style={{ whiteSpace: 'pre-line' }}>
                    {t('insight.daily_empty', lang)}
                  </p>
                  <p className={styles.emptySub}>{t('insight.daily_empty_sub', lang)}</p>
                </div>
              ) : (
                <>
                  <div className={styles.dailyRow}>
                    <div>
                      <div className={styles.bigNum} style={{ fontSize: 24 }}>
                        {formatCurrency(avgDaily, currency)}
                      </div>
                      <div className={styles.footerLabel}>{t('insight.daily_avg_sub', lang)}</div>
                      {data?.jatahHarian != null && (
                        <p
                          className={
                            avgDaily <= data.jatahHarian ? styles.deltaPos : styles.deltaAlert
                          }
                          style={{ marginTop: 6 }}
                        >
                          {t(
                            avgDaily <= data.jatahHarian
                              ? 'insight.daily_ok'
                              : 'insight.daily_over',
                            lang,
                          )}
                        </p>
                      )}
                    </div>
                    {data?.jatahHarian != null && (
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div className={styles.footerLabel}>
                          {t('insight.daily_target_label', lang)}
                        </div>
                        <div className={styles.dailyTarget}>
                          {formatCurrency(data.jatahHarian, currency)}
                        </div>
                      </div>
                    )}
                  </div>
                  {data?.jatahHarian != null && data.jatahHarian > 0 && (
                    <>
                      <div className={styles.dailyTrack}>
                        <div
                          className={styles.dailyFill}
                          style={{
                            width: `${Math.min(Math.round((avgDaily / data.jatahHarian) * 100), 100)}%`,
                          }}
                        />
                      </div>
                      <div className={styles.blegend}>
                        <span>
                          {t('insight.daily_actual_label', lang).replace(
                            '{amount}',
                            formatCurrency(avgDaily, currency),
                          )}
                        </span>
                        <span>
                          {t('insight.daily_target_amt_label', lang).replace(
                            '{amount}',
                            formatCurrency(data.jatahHarian, currency),
                          )}
                        </span>
                      </div>
                    </>
                  )}
                  {data?.jatahHarian == null && (
                    <p className={styles.deltaMute} style={{ marginTop: 8, fontSize: 11 }}>
                      {t('insight.daily_no_target', lang)}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* ⑥ Ranking */}
            <InsightRankingCard
              rows={ranking}
              prevMonthShort={prevMonthShort}
              currency={currency}
              lang={lang}
            />

            {/* ⑦ Top transactions */}
            <InsightTopTxCard
              currTop={currTop5}
              prevTop={prevTop5}
              currency={currency}
              currMonthShort={currMonthShort}
              prevMonthShort={prevMonthShort}
              lang={lang}
            />
          </>
        )}
      </main>
    </div>
  )
}
