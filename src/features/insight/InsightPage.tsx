import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
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
import { InsightDailyCard } from './InsightDailyCard'
import { InsightRankingCard } from './InsightRankingCard'
import { InsightTopTxCard } from './InsightTopTxCard'
import styles from './InsightPage.module.css'

export function InsightPage() {
  const clock = useClock()
  const lang = useLanguage()
  const navigate = useNavigate()
  const nowMs = clock.now()
  const today = new Date(nowMs)

  // Locked to current month — no navigation
  const viewYear = today.getFullYear()
  const viewMonth = today.getMonth()

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
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const prevY = viewMonth === 0 ? viewYear - 1 : viewYear
  const prevM = viewMonth === 0 ? 11 : viewMonth - 1
  const prevMonthShort = formatMonthShort(prevY, prevM, lang)
  const prevMonthLong = formatMonthLong(prevY, prevM, lang)

  const currExpense = data ? sumExpense(data.currTxs) : 0
  const currIncome = data ? sumIncome(data.currTxs) : 0
  const prevExpense = data ? sumExpense(data.prevTxs) : 0
  const prevIncome = data ? sumIncome(data.prevTxs) : 0
  const pct = spendPct(currExpense, currIncome)
  const hero = data
    ? buildHeroVariant(currExpense, currIncome, prevExpense > 0 ? prevExpense : null)
    : null
  const chartData = data ? buildChartData(data.allTxs, viewYear, viewMonth) : []
  const currCatMap = data ? aggregateByCategory(data.currTxs) : new Map()
  const prevCatMap = data ? aggregateByCategory(data.prevTxs) : new Map()
  const ranking = buildCategoryRanking(currCatMap, prevCatMap)
  const effectiveCat = selectedCat || ranking[0]?.name || ''
  const currTop5 = data ? buildTop5(data.currTxs) : []

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
      <header className={styles.pageHeader}>
        <button
          className={styles.backBtn}
          onClick={() => navigate(-1)}
          aria-label={t('insight.back_aria', lang)}
        >
          <ChevronLeft size={18} strokeWidth={1.8} />
        </button>
        <span className={styles.pageTitle}>{formatMonthLong(viewYear, viewMonth, lang)}</span>
      </header>

      <main className={styles.page}>
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
              prevIncome={prevIncome}
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
              currExpense={currExpense}
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

            {/* ⑤ Daily — heatmap */}
            <InsightDailyCard
              currTxs={data?.currTxs ?? []}
              viewYear={viewYear}
              viewMonth={viewMonth}
              currency={currency}
              lang={lang}
            />

            {/* ⑥ Ranking */}
            <InsightRankingCard
              rows={ranking}
              prevMonthLong={prevMonthLong}
              currency={currency}
              lang={lang}
            />

            {/* ⑦ Top transactions — current month only */}
            <InsightTopTxCard currTop={currTop5} currency={currency} lang={lang} />
          </>
        )}
      </main>
    </div>
  )
}
