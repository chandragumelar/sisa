import { useState } from 'react'
import type { Wallet } from '@/db/database'
import { calcSisa } from '@/shared/utils/sisa.utils'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'
import styles from './SaldoModule.module.css'

interface Props {
  wallets: Wallet[]
  currency: string
  unpaidTagihanTotal: number
  totalNabung: number
  daysUntilPayday: number
  yesterdaySpent: number
  yesterdayEarned: number
  onWalletTap?: (wallet: Wallet) => void
  onAddWalletTap?: () => void
}

const SALDO_EXPANDED_KEY = 'sisa:saldoExpanded'

function getExpandedPref(): boolean {
  try {
    return localStorage.getItem(SALDO_EXPANDED_KEY) !== 'false'
  } catch {
    return true
  }
}

function splitRp(formatted: string): [string, string] {
  if (formatted.startsWith('Rp')) return ['Rp', formatted.slice(2)]
  if (formatted.startsWith('−Rp')) return ['Rp', formatted.slice(3)]
  return ['', formatted]
}

export function SaldoModule({
  wallets,
  currency,
  unpaidTagihanTotal,
  totalNabung,
  daysUntilPayday,
  yesterdaySpent,
  yesterdayEarned,
  onWalletTap,
  onAddWalletTap,
}: Props) {
  const lang = useLanguage()
  const [expanded, setExpanded] = useState(getExpandedPref)

  const total = wallets.reduce((sum, w) => sum + w.balance, 0)
  const sisa = calcSisa(total, unpaidTagihanTotal, totalNabung)
  const [rpPrefix, sisaNum] = splitRp(formatCurrency(sisa, currency))

  let heroSub = ''
  if (yesterdaySpent > 0) {
    heroSub = t('saldo.spent_yesterday', lang).replace(
      '{amount}',
      formatCurrency(yesterdaySpent, currency),
    )
  } else if (yesterdayEarned > 0) {
    heroSub = t('saldo.income_yesterday', lang).replace(
      '{amount}',
      formatCurrency(yesterdayEarned, currency),
    )
  }

  function handleToggle() {
    setExpanded((e) => {
      const next = !e
      localStorage.setItem(SALDO_EXPANDED_KEY, String(next))
      return next
    })
  }

  const paydayKey = daysUntilPayday === 1 ? 'home.day_to_payday' : 'home.days_to_payday'
  const metaRight = t(paydayKey, lang).replace('{n}', String(daysUntilPayday))

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.cardTop}>
          <span className={styles.eyebrow}>{t('saldo.title', lang)}</span>
          <span className={styles.metaRight}>{metaRight}</span>
        </div>

        <button
          className={styles.heroAmountBtn}
          onClick={handleToggle}
          aria-expanded={expanded}
          aria-label={t('saldo.toggle_aria', lang)}
        >
          <span className={styles.heroAmount}>
            <span className={styles.heroRp}>{rpPrefix}</span>
            {sisaNum}
          </span>
        </button>

        {heroSub && (
          <div
            style={{
              fontSize: 11,
              color: 'var(--muted)',
              fontFamily: 'var(--font-mono)',
              marginTop: 4,
            }}
          >
            {heroSub}
          </div>
        )}

        <div className={styles.breakdown}>
          <div className={styles.bkdwnRow}>
            <span className={styles.bkdwnLabel}>{t('saldo.total', lang)}</span>
            <span className={styles.bkdwnValue}>{formatCurrency(total, currency)}</span>
          </div>
          <div className={styles.bkdwnRow}>
            <span className={styles.bkdwnLabel}>{t('saldo.tagihan', lang)}</span>
            <span className={styles.bkdwnValue}>
              {formatCurrency(unpaidTagihanTotal, currency)}
            </span>
          </div>
          <div className={styles.bkdwnRow}>
            <span className={styles.bkdwnLabel}>{t('saldo.nabung', lang)}</span>
            <span className={styles.bkdwnValue}>{formatCurrency(totalNabung, currency)}</span>
          </div>
        </div>

        {expanded && (
          <>
            <div className={styles.walletDivider} />
            {wallets.length === 0 ? (
              <div className={styles.empty}>{t('saldo.no_wallets', lang)}</div>
            ) : (
              wallets.map((w) => (
                <button
                  key={w.id}
                  className={styles.walletRow}
                  onClick={() => onWalletTap?.(w)}
                  disabled={!onWalletTap}
                >
                  <span className={styles.walletName}>{w.name}</span>
                  <span className={styles.walletAmount}>
                    {formatCurrency(w.balance, w.currency)}
                  </span>
                </button>
              ))
            )}
            <button className={styles.addBtn} onClick={onAddWalletTap}>
              {t('saldo.add_wallet', lang)}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
