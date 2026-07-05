import { ChevronRight } from 'lucide-react'
import type { Tagihan } from '@/db/database'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import {
  rankTagihan,
  getTagihanUrgency,
  formatDueDate,
  isTagihanPaidThisPeriod,
} from '../tagihan.utils'
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

  const currencyMap = new Map<string, { total: number; paid: number }>()
  for (const tg of active) {
    const c = tg.currency || currency
    const prev = currencyMap.get(c) ?? { total: 0, paid: 0 }
    currencyMap.set(c, {
      total: prev.total + tg.nominalEstimate,
      paid: prev.paid + (isTagihanPaidThisPeriod(tg, nowMs) ? tg.nominalEstimate : 0),
    })
  }
  const idrData = currencyMap.get(currency) ?? { total: 0, paid: 0 }
  const heroUnpaidIDR = idrData.total - idrData.paid
  const idrPaid = idrData.paid
  const idrTotal = idrData.total

  const foreignRows = [...currencyMap.entries()]
    .filter(([c]) => c !== currency)
    .map(([code, { total, paid }]) => ({
      code,
      totalFormatted: formatCurrency(total, code),
      paid: total > 0 && paid === total,
    }))
    .sort((a, b) => a.code.localeCompare(b.code))

  const allPaid = active.length > 0 && active.every((tg) => isTagihanPaidThisPeriod(tg, nowMs))
  const hasForeign = foreignRows.length > 0

  const totalZoneState = allPaid
    ? ('all_paid' as const)
    : !hasForeign
      ? ('idr_only' as const)
      : heroUnpaidIDR === 0
        ? ('idr_paid' as const)
        : ('unpaid' as const)

  const ctxTotalTmpl = t('tagihan_module.ctx_total', lang)
  const [ctxTotalPre, ctxTotalPost = ''] = ctxTotalTmpl.split('{total}')
  const ctxPaidTmpl = t('tagihan_module.ctx_paid', lang)
  const [ctxPaidPre, ctxPaidPost = ''] = ctxPaidTmpl.split('{paid}')

  const overdue = ranked.filter((tg) => getTagihanUrgency(tg, nowMs) === 'lewat-tempo')
  const regular = ranked.filter((tg) => getTagihanUrgency(tg, nowMs) !== 'lewat-tempo')
  const sortedRegular = [...regular].sort(
    (a, b) => Number(isTagihanPaidThisPeriod(a, nowMs)) - Number(isTagihanPaidThisPeriod(b, nowMs)),
  )
  const visibleRegular = sortedRegular.slice(0, MAX_REGULAR)
  const hiddenCount = regular.length - visibleRegular.length

  return (
    <div className={styles.card}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.label}>{t('tagihan_module.title', lang)}</span>
        </div>
        <button className={styles.addBtn} onClick={onAddTap} aria-label={t('ob.tagihan.add', lang)}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="var(--ink-secondary)"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <path d="M7 2.5v9M2.5 7h9" />
          </svg>
        </button>
      </div>

      <div className={styles.headerDivider} />

      {active.length === 0 ? (
        <div className={styles.emptyBlock}>
          <p className={styles.emptyText}>{t('tagihan_module.empty_text', lang)}</p>
          <button className={styles.addBtnLabel} onClick={onAddTap}>
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
                <div className={styles.overdueSub}>{t('tagihan_module.overdue_sub', lang)}</div>
              </div>
              <span className={styles.overdueAmt}>
                {formatCurrency(tg.nominalEstimate, tg.currency || currency)}
              </span>
              <button className={styles.bayarBtn} onClick={() => onPayTap(tg)}>
                {t('tagihan_detail.pay_btn', lang)}
              </button>
            </div>
          ))}

          {/* Regular rows — 2-col: name+date left, chip+amount+chevron right */}
          {visibleRegular.map((tg, i) => {
            const paid = isTagihanPaidThisPeriod(tg, nowMs)
            return (
              <button
                key={tg.id}
                className={`${styles.row} ${paid ? styles.rowPaid : ''}`}
                style={{
                  borderBottom:
                    i < visibleRegular.length - 1 || hiddenCount > 0
                      ? '1px solid var(--border-soft)'
                      : 'none',
                }}
                onClick={() => onRowTap(tg)}
              >
                <div className={styles.rowInfo}>
                  <span className={paid ? styles.rowNamePaid : styles.rowName}>{tg.name}</span>
                  <span className={styles.rowDate}>
                    {paid
                      ? t('tagihan_module.chip_paid', lang)
                      : `${t('tagihan_module.due_prefix', lang)} ${formatDueDate(tg, nowMs, lang)}`}
                  </span>
                </div>
                <div className={styles.rowRight}>
                  <span className={paid ? styles.chipPaid : styles.chipUnpaid}>
                    {paid
                      ? t('tagihan_module.chip_paid', lang)
                      : t('tagihan_module.chip_unpaid', lang)}
                  </span>
                  <span className={paid ? styles.rowAmtPaid : styles.rowAmt}>
                    {formatCurrency(tg.nominalEstimate, tg.currency || currency)}
                  </span>
                  <ChevronRight size={14} stroke="var(--ink-tertiary)" />
                </div>
              </button>
            )
          })}

          {hiddenCount > 0 && (
            <button className={styles.expandRow} onClick={onAddTap}>
              <span>{t('tagihan_module.more', lang).replace('{n}', String(hiddenCount))}</span>
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

          {/* Total zone — redesigned */}
          <div
            className={`${styles.totalZone}${totalZoneState === 'all_paid' ? ` ${styles.totalZoneAllPaid}` : ''}`}
          >
            {totalZoneState === 'all_paid' ? (
              <>
                <div className={styles.tzRewardRow}>
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                    <circle
                      cx="11"
                      cy="11"
                      r="10"
                      fill="var(--signal-safe-bg)"
                      stroke="var(--signal-safe-br)"
                      strokeWidth="1.2"
                    />
                    <path
                      d="M6.5 11l3 3 6-6.5"
                      stroke="var(--signal-safe)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div>
                    <div className={styles.tzAllPaidHero}>{t('tagihan_module.all_paid', lang)}</div>
                    <div className={styles.tzAllPaidSub}>
                      {t('tagihan_module.all_paid_sub', lang).replace('{n}', String(active.length))}
                    </div>
                  </div>
                </div>
                <div className={styles.tzDivider} />
                <div className={styles.tzCtx}>
                  <span>
                    {ctxTotalPre}
                    <span className={styles.tzCtxNum}>{formatCurrency(idrTotal, currency)}</span>
                    {ctxTotalPost}
                  </span>
                  {foreignRows.map((fr) => (
                    <span key={fr.code}>
                      <span className={styles.tzCtxNum}>{fr.totalFormatted}</span>
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className={styles.tzHero}>
                  <span className={styles.tzHeroLabel}>
                    {t('tagihan_module.unpaid_label', lang)}
                  </span>
                  {totalZoneState === 'idr_paid' ? (
                    <div className={styles.tzIdrPaidRow}>
                      <span className={styles.tzHeroNumPaid}>{formatCurrency(0, currency)}</span>
                      <span className={styles.tzPillPaid}>
                        <svg width="9" height="9" viewBox="0 0 9 9" fill="none" aria-hidden="true">
                          <path
                            d="M1.5 4.5l2 2 4-4"
                            stroke="var(--signal-safe)"
                            strokeWidth="1.3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        {t('tagihan_module.idr_lunas', lang)}
                      </span>
                    </div>
                  ) : (
                    <span className={styles.tzHeroNum}>
                      {formatCurrency(heroUnpaidIDR, currency)}
                    </span>
                  )}
                </div>

                {hasForeign && (
                  <div className={styles.tzForeignList}>
                    {foreignRows.map((fr) => (
                      <div key={fr.code} className={styles.tzForeignRow}>
                        <span className={fr.paid ? styles.tzForeignAmtPaid : styles.tzForeignAmt}>
                          {fr.totalFormatted}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className={styles.tzDivider} />

                <div className={styles.tzCtx}>
                  <span>
                    {ctxTotalPre}
                    <span className={styles.tzCtxNum}>{formatCurrency(idrTotal, currency)}</span>
                    {ctxTotalPost}
                  </span>
                  <span>
                    {ctxPaidPre}
                    <span className={styles.tzCtxNum}>{formatCurrency(idrPaid, currency)}</span>
                    {ctxPaidPost}
                  </span>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
