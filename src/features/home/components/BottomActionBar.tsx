import { useEffect, useRef, useState } from 'react'
import { TrendingUp, Search, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'
import { formatNominalDisplay, parseNominalRaw } from '@/shared/utils/formatNominalInput'
import { getCurrencySymbol } from '@/shared/utils/formatCurrency'
import styles from './BottomActionBar.module.css'

interface Props {
  onCatat: () => void
  currency: string
  walletCount: number
  tagihanCount: number
  sisa: number
  unpaidTagihanTotal: number
  onCekDulu: (amount?: number) => void
  onAndai: () => void
  onAddTagihan: () => void
  onAddWallet: () => void
}

type CardState = 0 | 1 | 2
type ExpandTab = 'cekdulu' | 'andai'

function getCardState(walletCount: number, tagihanCount: number): CardState {
  if (walletCount > 0 && tagihanCount > 0) return 2
  if (walletCount === 0 && tagihanCount === 0) return 0
  return 1
}

function haptic() {
  if (!navigator.vibrate) return
  navigator.vibrate(10)
}

export function BottomActionBar({
  onCatat,
  currency,
  walletCount,
  tagihanCount,
  onCekDulu,
  onAndai,
  onAddTagihan,
  onAddWallet,
}: Props) {
  const lang = useLanguage()
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(false)
  const [tab, setTab] = useState<ExpandTab>('cekdulu')
  const [amountStr, setAmountStr] = useState('')
  const cardState = getCardState(walletCount, tagihanCount)
  const hasTagihan = tagihanCount > 0
  const onAddMissing = hasTagihan ? onAddWallet : onAddTagihan

  function closeSheet() {
    setExpanded(false)
    setAmountStr('')
  }

  function handleCekDuluClick() {
    if (cardState === 0) return onAddWallet()
    if (cardState === 1) return onAddMissing()
    setExpanded((v) => !v)
  }

  function handleSubmit() {
    const raw = parseNominalRaw(amountStr)
    const val = parseInt(raw, 10)
    onCekDulu(isNaN(val) || val === 0 ? undefined : val)
    closeSheet()
  }

  function handleAndai() {
    onAndai()
    closeSheet()
  }

  const sheetOpen = expanded && cardState === 2
  const cekDuluClass = [
    styles.cekDuluBtn,
    cardState === 0 && styles.cekDuluEmpty,
    cardState === 1 && styles.cekDuluPartial,
    sheetOpen && styles.cekDuluActive,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <>
      {sheetOpen && <div className={styles.backdrop} onClick={closeSheet} />}
      <div className={styles.wrap}>
        {sheetOpen && (
          <ExpandSheet
            tab={tab}
            setTab={setTab}
            currency={currency}
            amountStr={amountStr}
            setAmountStr={setAmountStr}
            onSubmit={handleSubmit}
            onAndai={handleAndai}
          />
        )}
        <div className={sheetOpen ? `${styles.bar} ${styles.barDimmed}` : styles.bar}>
          <button
            className={styles.insightBtn}
            onClick={() => navigate('/insight', { viewTransition: true })}
            aria-label={t('bar.insight_label', lang)}
          >
            <TrendingUp size={18} strokeWidth={2} />
          </button>

          <button className={cekDuluClass} onClick={handleCekDuluClick}>
            <Search size={15} strokeWidth={2} />
            <span>{t('actions.cek_label', lang)}</span>
          </button>

          <button
            className={styles.catatBtn}
            onClick={() => {
              haptic()
              onCatat()
            }}
          >
            <Plus size={17} strokeWidth={2.4} />
            <span>{t('bar.catat_label', lang)}</span>
          </button>
        </div>
      </div>
    </>
  )
}

interface ExpandSheetProps {
  tab: ExpandTab
  setTab: (tab: ExpandTab) => void
  currency: string
  amountStr: string
  setAmountStr: (v: string) => void
  onSubmit: () => void
  onAndai: () => void
}

function ExpandSheet({
  tab,
  setTab,
  currency,
  amountStr,
  setAmountStr,
  onSubmit,
  onAndai,
}: ExpandSheetProps) {
  const lang = useLanguage()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (tab === 'cekdulu') inputRef.current?.focus()
  }, [tab])

  return (
    <div className={styles.sheet}>
      <div className={styles.handle} />
      <div className={styles.tabs}>
        <button
          className={tab === 'cekdulu' ? `${styles.tab} ${styles.tabActive}` : styles.tab}
          onClick={() => setTab('cekdulu')}
        >
          {t('actions.cek_label', lang)}
        </button>
        <button
          className={tab === 'andai' ? `${styles.tab} ${styles.tabActive}` : styles.tab}
          onClick={() => setTab('andai')}
        >
          {t('actions.andai_label', lang)}
        </button>
      </div>

      {tab === 'cekdulu' ? (
        <>
          <div className={styles.inputRow}>
            <span className={styles.currencySymbol}>{getCurrencySymbol(currency)}</span>
            <input
              ref={inputRef}
              className={styles.input}
              type="text"
              inputMode="numeric"
              placeholder={t('decision.input_placeholder', lang)}
              value={amountStr}
              onChange={(e) => setAmountStr(formatNominalDisplay(parseNominalRaw(e.target.value)))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSubmit()
              }}
            />
          </div>
          <button className={styles.ctaBtn} onClick={onSubmit}>
            {t('decision.cek_btn', lang)}
          </button>
        </>
      ) : (
        <button className={styles.ctaBtn} onClick={onAndai}>
          {t('bar.andai_cta', lang)}
        </button>
      )}
    </div>
  )
}
