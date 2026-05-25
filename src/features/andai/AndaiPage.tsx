import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClock } from '@/app/providers/useClock'
import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'
import type { Language } from '@/db/database'
import { getSettings } from '@/db/settings.repository'
import { getAllWallets } from '@/db/wallets.repository'
import { getActiveTagihan } from '@/db/tagihan.repository'
import { getTotalNabung } from '@/db/transactions.repository'
import {
  getSavedScenarios,
  saveScenario,
  deleteScenario,
  MAX_SAVED_SCENARIOS,
} from '@/db/scenarios.repository'
import type { SavedScenario } from '@/db/database'
import { calcUnpaidTagihanTotal } from '@/features/home/tagihan.utils'
import { calcSisa } from '@/shared/utils/sisa.utils'
import { formatCurrency, getCurrencySymbol } from '@/shared/utils/formatCurrency'
import { calcAndai, buildAndaiBaseline } from './andai.utils'
import type { AndaiBaseline, AndaiItem, AndaiKind } from './andai.utils'
import { BottomSheet } from '@/shared/components/BottomSheet'
import { SaveScenarioSheet } from './SaveScenarioSheet'
import { ScenariosRack } from './ScenariosRack'
import { CompareSheet } from './CompareSheet'
import styles from './AndaiPage.module.css'

type AddKind = AndaiKind

function kindLabel(kind: AndaiKind, lang: Language): string {
  switch (kind) {
    case 'beli':
      return t('andai.kind_beli', lang)
    case 'income':
      return t('andai.kind_income', lang)
    case 'tagihan':
      return t('andai.kind_tagihan', lang)
    case 'target-nabung':
      return t('andai.kind_target_nabung', lang)
  }
}

function kindPlaceholder(kind: AndaiKind, lang: Language): string {
  switch (kind) {
    case 'beli':
      return t('andai.placeholder_beli', lang)
    case 'income':
      return t('andai.placeholder_income', lang)
    case 'tagihan':
      return t('andai.placeholder_tagihan', lang)
    case 'target-nabung':
      return t('andai.placeholder_nabung', lang)
  }
}

export function AndaiPage() {
  const clock = useClock()
  const navigate = useNavigate()
  const lang = useLanguage()
  const nowMs = clock.now()

  const [baseline, setBaseline] = useState<AndaiBaseline | null>(null)
  const [currency, setCurrency] = useState('IDR')
  const [items, setItems] = useState<AndaiItem[]>([])
  const [addSheet, setAddSheet] = useState<AddKind | null>(null)
  const [addDesc, setAddDesc] = useState('')
  const [addAmount, setAddAmount] = useState('')

  // scenario state
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([])
  const [saveSheetOpen, setSaveSheetOpen] = useState(false)
  const [compareMode, setCompareMode] = useState(false)
  const [compareIds, setCompareIds] = useState<number[]>([])
  const [compareSheetOpen, setCompareSheetOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    Promise.all([getSettings(), getAllWallets(), getActiveTagihan()]).then(
      ([s, wallets, tagihan]) => {
        if (cancelled || !s) return
        const totalSaldo = wallets.reduce((sum, w) => sum + w.balance, 0)
        const unpaidTagihanTotal = calcUnpaidTagihanTotal(tagihan, nowMs)
        getTotalNabung(s.primaryCurrency).then((totalNabung) => {
          if (cancelled) return
          const bl = buildAndaiBaseline(totalSaldo, unpaidTagihanTotal, totalNabung, s, nowMs)
          setBaseline(bl)
          setCurrency(s.primaryCurrency)

          getSavedScenarios().then((rows) => {
            if (!cancelled) setSavedScenarios(rows)
          })
        })
      },
    )
    return () => {
      cancelled = true
    }
  }, [nowMs])

  if (!baseline) return null

  const result = calcAndai(items, baseline)

  const suggestedName =
    items
      .slice(0, 2)
      .map((i) => i.desc || kindLabel(i.kind, lang))
      .join(' + ') || (lang === 'en' ? 'new scenario' : 'skenario baru')

  function handleAddItem() {
    const amount = parseInt(addAmount, 10)
    if (!amount || !addSheet) return
    setItems((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random()}`,
        kind: addSheet,
        desc: addDesc.trim() || kindLabel(addSheet, lang),
        amount,
      },
    ])
    setAddDesc('')
    setAddAmount('')
    setAddSheet(null)
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  async function handleSaveScenario(name: string) {
    await saveScenario(name, JSON.stringify(items))
    const rows = await getSavedScenarios()
    setSavedScenarios(rows)
  }

  async function handleDeleteScenario(id: number) {
    await deleteScenario(id)
    setSavedScenarios((prev) => prev.filter((s) => s.id !== id))
    setCompareIds((prev) => prev.filter((i) => i !== id))
  }

  function handleOpenScenario(scenario: SavedScenario) {
    try {
      const parsed = JSON.parse(scenario.items) as AndaiItem[]
      setItems(parsed)
    } catch {
      // malformed — ignore
    }
  }

  function handleToggleCompare(id: number) {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((i) => i !== id)
      if (prev.length >= 2) return prev
      return [...prev, id]
    })
  }

  const compareScenarios =
    compareIds.length === 2
      ? (compareIds.map((id) => savedScenarios.find((s) => s.id === id)).filter(Boolean) as [
          SavedScenario,
          SavedScenario,
        ])
      : null

  const canSave = items.length > 0 && savedScenarios.length < MAX_SAVED_SCENARIOS

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <button
          className={styles.backBtn}
          onClick={() => navigate(-1)}
          aria-label={t('andai.back_aria', lang)}
        >
          ‹
        </button>
        <span className={styles.title}>{t('andai.title', lang)}</span>
        <span className={styles.titleSub}>{t('andai.sub', lang)}</span>
      </div>

      {/* Baseline card */}
      <div className={styles.baseline}>
        <div className={styles.baselineLabel}>{t('andai.baseline_label', lang)}</div>
        <div className={styles.baselineGrid}>
          <div className={styles.baselineCell}>
            <span className={styles.blKey}>{t('andai.baseline_saldo', lang)}</span>
            <span className={styles.blVal}>
              {formatCurrency(
                Math.max(
                  0,
                  calcSisa(baseline.totalSaldo, baseline.unpaidTagihanTotal, baseline.totalNabung),
                ),
                currency,
              )}
            </span>
          </div>
          <div className={styles.baselineCell}>
            <span className={styles.blKey}>{t('andai.baseline_tabungan', lang)}</span>
            <span className={styles.blVal}>{formatCurrency(baseline.totalNabung, currency)}</span>
          </div>
        </div>
      </div>

      {/* Stack */}
      <div className={styles.stackLabel}>{t('andai.stack_label', lang)}</div>

      {items.map((item, i) => (
        <div key={item.id} className={styles.andaiItem}>
          <span className={styles.branch}>{i === items.length - 1 ? '└' : '├'}</span>
          <div className={styles.aiBody}>
            <div className={styles.aiKind}>{kindLabel(item.kind, lang)}</div>
            <div className={styles.aiDesc}>{item.desc}</div>
          </div>
          <span className={styles.aiAmount}>
            {item.kind === 'income' ? '+' : '−'}
            {formatCurrency(item.amount, currency)}
          </span>
          <button
            className={styles.aiRemove}
            onClick={() => removeItem(item.id)}
            aria-label={t('andai.remove_aria', lang)}
          >
            ✕
          </button>
        </div>
      ))}

      {/* Add chips */}
      <div className={styles.addChips}>
        {(['beli', 'income', 'tagihan', 'target-nabung'] as AndaiKind[]).map((k) => (
          <button key={k} className={styles.addChip} onClick={() => setAddSheet(k)}>
            <span className={styles.addPlus}>+</span> {kindLabel(k, lang)}
          </button>
        ))}
      </div>

      {items.length > 0 && (
        <>
          <div className={styles.divider} />

          {/* Results */}
          <div className={styles.resultLabel}>{t('andai.result_label', lang)}</div>

          <div className={styles.resultCard}>
            <ResultRow
              label={t('andai.result_daily', lang)}
              before={result.dailyBefore}
              after={result.dailyAfter}
              currency={currency}
            />
            <ResultRow
              label={t('andai.result_sisa', lang)}
              before={result.sisaBefore}
              after={result.sisaAfter}
              currency={currency}
            />
            <ResultRow
              label={t('andai.result_tabungan', lang)}
              before={result.nabungBefore}
              after={result.nabungAfter}
              currency={currency}
            />
          </div>
        </>
      )}

      {/* Actions */}
      <div className={styles.actions}>
        <button
          className={styles.resetBtn}
          onClick={() => {
            setItems([])
            setCompareIds([])
            setCompareMode(false)
          }}
        >
          {t('andai.reset', lang)}
        </button>

        <div className={styles.proActions}>
          <button
            className={canSave ? styles.saveBtn : `${styles.saveBtn} ${styles.saveBtnDisabled}`}
            onClick={() => canSave && setSaveSheetOpen(true)}
          >
            {t('andai.save', lang)}
          </button>
          {savedScenarios.length >= 2 && (
            <button
              className={
                compareMode ? `${styles.compareBtn} ${styles.compareBtnActive}` : styles.compareBtn
              }
              onClick={() => {
                setCompareMode((prev) => !prev)
                setCompareIds([])
              }}
            >
              {t('andai.compare', lang)}
            </button>
          )}
        </div>
      </div>

      {/* Compare action bar */}
      {compareMode && compareIds.length === 2 && (
        <div className={styles.compareBar}>
          <button className={styles.compareBarBtn} onClick={() => setCompareSheetOpen(true)}>
            {t('andai.compare_bar', lang)}
          </button>
        </div>
      )}

      <ScenariosRack
        scenarios={savedScenarios}
        selectedIds={compareIds}
        compareMode={compareMode}
        onOpen={handleOpenScenario}
        onDelete={handleDeleteScenario}
        onToggleCompare={handleToggleCompare}
      />

      {/* Add item sheet */}
      <BottomSheet
        isOpen={addSheet !== null}
        onClose={() => setAddSheet(null)}
        title={addSheet ? `${t('andai.title', lang)} ${kindLabel(addSheet, lang)}` : ''}
      >
        <div className={styles.addForm}>
          <div className={styles.addLabel}>{t('andai.add_desc_label', lang)}</div>
          <input
            className={styles.addInput}
            type="text"
            placeholder={addSheet ? kindPlaceholder(addSheet, lang) : ''}
            value={addDesc}
            onChange={(e) => setAddDesc(e.target.value)}
          />

          <div className={styles.addLabel}>
            {addSheet === 'target-nabung'
              ? t('andai.add_target_label', lang)
              : t('andai.add_nominal_label', lang)}
          </div>
          <div className={styles.addAmountRow}>
            <span className={styles.addAmountPrefix}>{getCurrencySymbol(currency)}</span>
            <input
              className={styles.addAmountInput}
              type="number"
              inputMode="numeric"
              placeholder="0"
              value={addAmount}
              onChange={(e) => setAddAmount(e.target.value.replace(/\D/g, ''))}
              autoFocus={addSheet !== null}
            />
          </div>

          <button
            className={styles.addSubmitBtn}
            onClick={handleAddItem}
            disabled={!addAmount || parseInt(addAmount, 10) <= 0}
          >
            {t('andai.add_submit', lang)}
          </button>
        </div>
      </BottomSheet>

      {/* Save sheet */}
      <SaveScenarioSheet
        isOpen={saveSheetOpen}
        onClose={() => setSaveSheetOpen(false)}
        suggestedName={suggestedName}
        onSave={handleSaveScenario}
      />

      {/* Compare sheet */}
      {compareScenarios && (
        <CompareSheet
          isOpen={compareSheetOpen}
          onClose={() => setCompareSheetOpen(false)}
          scenarios={compareScenarios}
          baseline={baseline}
          currency={currency}
        />
      )}
    </div>
  )
}

function ResultRow({
  label,
  before,
  after,
  currency,
}: {
  label: string
  before: number
  after: number
  currency: string
}) {
  return (
    <div className={styles.resRow}>
      <span className={styles.resKey}>{label}</span>
      <span className={styles.resVgrp}>
        <span className={styles.resBefore}>{formatCurrency(before, currency)}</span>
        <span className={styles.resArrow}>→</span>
        <span className={styles.resAfter}>{formatCurrency(after, currency)}</span>
      </span>
    </div>
  )
}
