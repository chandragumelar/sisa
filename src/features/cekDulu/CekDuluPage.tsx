import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClock } from '@/app/providers/useClock'
import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'
import { getSettings } from '@/db/settings.repository'
import { getAllWallets } from '@/db/wallets.repository'
import { getActiveTagihan } from '@/db/tagihan.repository'
import { getTotalNabung } from '@/db/transactions.repository'
import type { Settings, Wallet } from '@/db/database'
import { calcDaysUntilPayday } from '@/features/home/home.utils'
import { calcUnpaidTagihanTotal } from '@/features/home/tagihan.utils'
import { formatCurrency, getCurrencySymbol } from '@/shared/utils/formatCurrency'
import { calcCekDulu } from './cekDulu.utils'
import { QuickLogSheet } from '@/features/quickLog/QuickLogSheet'
import styles from './CekDuluPage.module.css'

interface PageData {
  settings: Settings
  wallets: Wallet[]
  totalSaldo: number
  unpaidTagihanTotal: number
  daysUntilPayday: number
  totalNabung: number
}

export function CekDuluPage() {
  const clock = useClock()
  const navigate = useNavigate()
  const lang = useLanguage()
  const nowMs = clock.now()

  const [data, setData] = useState<PageData | null>(null)
  const [amountStr, setAmountStr] = useState('')
  const [quickLogOpen, setQuickLogOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    Promise.all([getSettings(), getAllWallets(), getActiveTagihan()]).then(
      ([settings, wallets, tagihan]) => {
        if (cancelled || !settings) return
        const totalSaldo = wallets.reduce((s, w) => s + w.balance, 0)
        const unpaidTagihanTotal = calcUnpaidTagihanTotal(tagihan, nowMs)
        const daysUntilPayday = calcDaysUntilPayday(nowMs, settings)
        getTotalNabung(settings.primaryCurrency).then((totalNabung) => {
          if (!cancelled)
            setData({
              settings,
              wallets,
              totalSaldo,
              unpaidTagihanTotal,
              daysUntilPayday,
              totalNabung,
            })
        })
      },
    )
    return () => {
      cancelled = true
    }
  }, [nowMs])

  if (!data) return null

  const { settings, wallets, totalSaldo, unpaidTagihanTotal, daysUntilPayday, totalNabung } = data
  const currency = settings.primaryCurrency

  const nominal = parseInt(amountStr, 10) || 0
  const result = calcCekDulu({
    nominal,
    totalSaldo,
    unpaidTagihanTotal,
    daysUntilPayday,
    totalNabung,
  })

  return (
    <div className={styles.page}>
      <div className={styles.grab} />

      <div className={styles.head}>
        <div>
          <div className={styles.title}>{t('cek_dulu.title', lang)}</div>
          <div className={styles.sub}>{t('cek_dulu.sub', lang)}</div>
        </div>
        <button
          className={styles.closeBtn}
          onClick={() => navigate(-1)}
          aria-label={t('cek_dulu.close_aria', lang)}
        >
          ✕
        </button>
      </div>

      {/* Nominal input */}
      <div className={styles.nominalBlock}>
        <div className={styles.nominalLabel}>{t('cek_dulu.price_label', lang)}</div>
        <div className={styles.nominalRow}>
          <span className={styles.nominalPrefix}>{getCurrencySymbol(currency)}</span>
          <input
            className={styles.nominalInput}
            type="number"
            inputMode="numeric"
            placeholder="0"
            value={amountStr}
            onChange={(e) => setAmountStr(e.target.value.replace(/\D/g, ''))}
            autoFocus
          />
        </div>
        <div className={styles.nominalContext}>
          {t('cek_dulu.context_line', lang)
            .replace('{days}', String(daysUntilPayday))
            .replace('{amount}', formatCurrency(totalSaldo, currency))}
        </div>
      </div>

      {/* Comparison frame */}
      <div className={styles.cmpFrame}>
        <div className={styles.cmpColHead}>
          <span className={styles.headBefore}>{t('cek_dulu.col_now', lang)}</span>
          <span className={styles.headArrow}>→</span>
          <span className={styles.headAfter}>{t('cek_dulu.col_after', lang)}</span>
        </div>

        {/* Row 1 — always */}
        <div className={styles.cmpRow}>
          <div className={styles.rowLabel}>{t('cek_dulu.daily_label', lang)}</div>
          <div className={styles.cmpValues}>
            <span className={styles.valueBefore}>
              {formatCurrency(result.dailyBefore, currency)}
              <span className={styles.valueUnit}>{t('cek_dulu.daily_unit', lang)}</span>
            </span>
            <span className={styles.cmpArrow}>→</span>
            <span className={styles.valueAfter}>
              {nominal > 0 ? formatCurrency(result.dailyAfter, currency) : '—'}
              {nominal > 0 && (
                <span className={styles.valueUnit}>{t('cek_dulu.daily_unit', lang)}</span>
              )}
            </span>
          </div>
          {nominal > 0 && (
            <div className={styles.rowDelta}>
              {formatCurrency(result.dailyDelta, currency)}
              {t('cek_dulu.daily_unit', lang)} · {daysUntilPayday} {lang === 'en' ? 'days' : 'hari'}
            </div>
          )}
        </div>

        {/* Row 2 — muncul saat nembus operasional */}
        {result.showSisaRow && (
          <div className={styles.cmpRow}>
            <div className={styles.rowLabel}>
              {t('cek_dulu.sisa_label', lang)}
              <span className={styles.newFlag}>{t('cek_dulu.new_flag', lang)}</span>
            </div>
            <div className={styles.cmpValues}>
              <span className={styles.valueBefore}>
                {formatCurrency(result.sisaBefore, currency)}
              </span>
              <span className={styles.cmpArrow}>→</span>
              <span className={styles.valueAfter}>
                {formatCurrency(result.sisaAfter, currency)}
              </span>
            </div>
          </div>
        )}

        {/* Row 3 — muncul saat nyentuh tabungan */}
        {result.showTabunganRow && (
          <div className={`${styles.cmpRow} ${styles.cmpRowHeavy}`}>
            <div className={styles.rowLabel}>
              {t('cek_dulu.tabungan_label', lang)}
              <span className={styles.newFlag}>{t('cek_dulu.new_flag', lang)}</span>
            </div>
            <div className={styles.cmpValues}>
              <span className={styles.valueBefore}>
                {formatCurrency(result.nabungBefore, currency)}
              </span>
              <span className={styles.cmpArrow}>→</span>
              <span className={styles.valueAfter}>
                {formatCurrency(result.nabungAfter, currency)}
              </span>
            </div>
            <div className={styles.rowSubNote}>
              {t('cek_dulu.tabungan_note', lang).replace(
                '{amount}',
                formatCurrency(result.nabungDrawn, currency),
              )}
            </div>
          </div>
        )}
      </div>

      {nominal > 0 && <div className={styles.growHint}>{t('cek_dulu.grow_hint', lang)}</div>}

      <div className={styles.srcLine}>
        <span>{t('cek_dulu.src_label', lang)}</span>
        <span className={styles.srcVal}>
          {t('cek_dulu.src_wallets', lang)
            .replace('{n}', String(wallets.length))
            .replace('{amount}', formatCurrency(totalSaldo, currency))}
        </span>
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <button className={styles.closeAction} onClick={() => navigate(-1)}>
          {t('cek_dulu.close_btn', lang)}
        </button>
        <button
          className={styles.buyAction}
          onClick={() => setQuickLogOpen(true)}
          disabled={nominal === 0}
        >
          <span className={styles.buyLabel}>{t('cek_dulu.buy_label', lang)}</span>
          <span className={styles.buySub}>{t('cek_dulu.buy_sub', lang)}</span>
        </button>
      </div>

      <QuickLogSheet
        isOpen={quickLogOpen}
        onClose={() => setQuickLogOpen(false)}
        wallets={wallets}
        currency={currency}
        totalNabung={totalNabung}
        nowMs={nowMs}
        initialAmount={nominal}
        initialMode="keluar"
        onCommit={() => {
          setQuickLogOpen(false)
          navigate('/')
        }}
      />
    </div>
  )
}
