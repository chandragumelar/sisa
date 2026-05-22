import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClock } from '@/app/providers/useClock'
import { getSettings } from '@/db/settings.repository'
import { getLicense } from '@/db/license.repository'
import { getAllWallets } from '@/db/wallets.repository'
import { getActiveTagihan } from '@/db/tagihan.repository'
import { getTotalNabung, getMonthlyIncomeSummary } from '@/db/transactions.repository'
import {
  getSavedScenarios,
  saveScenario,
  deleteScenario,
  MAX_SAVED_SCENARIOS,
} from '@/db/scenarios.repository'
import type { SavedScenario } from '@/db/database'
import { calcUnpaidTagihanTotal } from '@/features/home/home.utils'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import { calcAndai, buildAndaiBaseline } from './andai.utils'
import type { AndaiBaseline, AndaiItem, AndaiKind } from './andai.utils'
import { calcForecast, type ForecastMonth } from '@/features/home/forecast.utils'
import { BottomSheet } from '@/shared/components/BottomSheet'
import { SaveScenarioSheet } from './SaveScenarioSheet'
import { ScenariosRack } from './ScenariosRack'
import { CompareSheet } from './CompareSheet'
import styles from './AndaiPage.module.css'

type AddKind = AndaiKind

export function AndaiPage() {
  const clock = useClock()
  const navigate = useNavigate()
  const nowMs = clock.now()

  const [baseline, setBaseline] = useState<AndaiBaseline | null>(null)
  const [currency, setCurrency] = useState('IDR')
  const [isPro, setIsPro] = useState(false)
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

  // forecast
  const [forecastMonths, setForecastMonths] = useState<ForecastMonth[]>([])

  useEffect(() => {
    let cancelled = false
    Promise.all([getSettings(), getLicense(), getAllWallets(), getActiveTagihan()]).then(
      ([s, license, wallets, tagihan]) => {
        if (cancelled || !s) return
        const totalSaldo = wallets.reduce((sum, w) => sum + w.balance, 0)
        const unpaidTagihanTotal = calcUnpaidTagihanTotal(tagihan, nowMs)
        const proTier = license?.tier === 'pro'
        setIsPro(proTier)
        getTotalNabung(s.primaryCurrency).then((totalNabung) => {
          if (cancelled) return
          const bl = buildAndaiBaseline(totalSaldo, unpaidTagihanTotal, totalNabung, s, nowMs)
          setBaseline(bl)
          setCurrency(s.primaryCurrency)

          if (proTier) {
            const tagihanTotalForForecast = tagihan.reduce((sum, t) => sum + t.nominalEstimate, 0)
            getMonthlyIncomeSummary(s.primaryCurrency).then((incomeAvg) => {
              if (cancelled) return
              setForecastMonths(
                calcForecast(
                  bl.sisaPasGajian,
                  tagihanTotalForForecast,
                  bl.dailyBudget,
                  incomeAvg,
                  s,
                  nowMs,
                ),
              )
            })
            getSavedScenarios().then((rows) => {
              if (!cancelled) setSavedScenarios(rows)
            })
          }
        })
      },
    )
    return () => {
      cancelled = true
    }
  }, [nowMs])

  if (!baseline) return null

  const result = calcAndai(items, baseline)

  // auto-suggest name from items
  const suggestedName =
    items
      .slice(0, 2)
      .map((i) => i.desc || kindLabel(i.kind))
      .join(' + ') || 'skenario baru'

  function handleAddItem() {
    const amount = parseInt(addAmount, 10)
    if (!amount || !addSheet) return
    setItems((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random()}`,
        kind: addSheet,
        desc: addDesc.trim() || kindLabel(addSheet),
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

  const canSave = isPro && items.length > 0 && savedScenarios.length < MAX_SAVED_SCENARIOS

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <button className={styles.backBtn} onClick={() => navigate(-1)} aria-label="Kembali">
          ‹
        </button>
        <span className={styles.title}>Andai</span>
        <span className={styles.titleSub}>skenario hipotetis</span>
      </div>

      {/* Baseline card */}
      <div className={styles.baseline}>
        <div className={styles.baselineLabel}>sekarang · tanpa diandai</div>
        <div className={styles.baselineGrid}>
          <div className={styles.baselineCell}>
            <span className={styles.blKey}>saldo operasional</span>
            <span className={styles.blVal}>
              {formatCurrency(
                Math.max(0, baseline.totalSaldo - baseline.unpaidTagihanTotal),
                currency,
              )}
            </span>
          </div>
          <div className={styles.baselineCell}>
            <span className={styles.blKey}>total tabungan</span>
            <span className={styles.blVal}>{formatCurrency(baseline.totalNabung, currency)}</span>
          </div>
        </div>
      </div>

      {/* Stack */}
      <div className={styles.stackLabel}>andai...</div>

      {items.map((item, i) => (
        <div key={item.id} className={styles.andaiItem}>
          <span className={styles.branch}>{i === items.length - 1 ? '└' : '├'}</span>
          <div className={styles.aiBody}>
            <div className={styles.aiKind}>{kindLabel(item.kind)}</div>
            <div className={styles.aiDesc}>{item.desc}</div>
          </div>
          <span className={styles.aiAmount}>
            {item.kind === 'income' ? '+' : '−'}
            {formatCurrency(item.amount, currency)}
          </span>
          <button
            className={styles.aiRemove}
            onClick={() => removeItem(item.id)}
            aria-label="Hapus"
          >
            ✕
          </button>
        </div>
      ))}

      {/* Add chips */}
      <div className={styles.addChips}>
        {(['beli', 'income', 'tagihan', 'target-nabung'] as AndaiKind[]).map((k) => (
          <button key={k} className={styles.addChip} onClick={() => setAddSheet(k)}>
            <span className={styles.addPlus}>+</span> {kindLabel(k)}
          </button>
        ))}
      </div>

      {items.length > 0 && (
        <>
          <div className={styles.divider} />

          {/* Results */}
          <div className={styles.resultLabel}>kalau semua ini kejadian</div>

          <div className={styles.resultCard}>
            <ResultRow
              label="jatah harian sampai gajian"
              before={result.dailyBefore}
              after={result.dailyAfter}
              currency={currency}
            />
            <ResultRow
              label="sisa operasional"
              before={result.sisaBefore}
              after={result.sisaAfter}
              currency={currency}
            />
            <ResultRow
              label="total tabungan"
              before={result.nabungBefore}
              after={result.nabungAfter}
              currency={currency}
            />
          </div>

          {/* 8.7 Pro: Forecast 3-bulan di Andai */}
          {isPro && forecastMonths.length > 0 && (
            <div className={styles.andaiForecast}>
              <div className={styles.andaiForecastLabel}>proyeksi 3 bulan ke depan</div>
              <div className={styles.andaiForecastCols}>
                {forecastMonths.map((m) => (
                  <div key={m.label} className={styles.andaiForecastCol}>
                    <span className={styles.andaiForecastMonth}>{m.label}</span>
                    <span
                      className={m.sisa >= 0 ? styles.andaiForecastAmt : styles.andaiForecastAmtNeg}
                    >
                      {formatCurrency(m.sisa, currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
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
          Reset
        </button>

        {isPro ? (
          <div className={styles.proActions}>
            <button
              className={canSave ? styles.saveBtn : `${styles.saveBtn} ${styles.saveBtnDisabled}`}
              onClick={() => canSave && setSaveSheetOpen(true)}
            >
              Simpan
            </button>
            {savedScenarios.length >= 2 && (
              <button
                className={
                  compareMode
                    ? `${styles.compareBtn} ${styles.compareBtnActive}`
                    : styles.compareBtn
                }
                onClick={() => {
                  setCompareMode((prev) => !prev)
                  setCompareIds([])
                }}
              >
                Banding
              </button>
            )}
          </div>
        ) : (
          <button className={styles.saveBtn} onClick={() => {}}>
            <span className={styles.saveBtnLabel}>Simpan skenario</span>
            <span className={styles.proTag}>Pro</span>
          </button>
        )}
      </div>

      {/* Compare action bar */}
      {compareMode && compareIds.length === 2 && (
        <div className={styles.compareBar}>
          <button className={styles.compareBarBtn} onClick={() => setCompareSheetOpen(true)}>
            Bandingkan 2 skenario ini
          </button>
        </div>
      )}

      {/* Scenarios rack (Pro) */}
      {isPro && (
        <ScenariosRack
          scenarios={savedScenarios}
          selectedIds={compareIds}
          compareMode={compareMode}
          onOpen={handleOpenScenario}
          onDelete={handleDeleteScenario}
          onToggleCompare={handleToggleCompare}
        />
      )}

      {/* Add item sheet */}
      <BottomSheet
        isOpen={addSheet !== null}
        onClose={() => setAddSheet(null)}
        title={addSheet ? `Andai ${kindLabel(addSheet)}` : ''}
      >
        <div className={styles.addForm}>
          <div className={styles.addLabel}>Deskripsi (opsional)</div>
          <input
            className={styles.addInput}
            type="text"
            placeholder={addSheet ? kindPlaceholder(addSheet) : ''}
            value={addDesc}
            onChange={(e) => setAddDesc(e.target.value)}
          />

          <div className={styles.addLabel}>
            {addSheet === 'target-nabung' ? 'Target per bulan' : 'Nominal'}
          </div>
          <div className={styles.addAmountRow}>
            <span className={styles.addAmountPrefix}>Rp</span>
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
            Tambah
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

function kindLabel(kind: AndaiKind): string {
  switch (kind) {
    case 'beli':
      return 'beli'
    case 'income':
      return 'income'
    case 'tagihan':
      return 'tagihan'
    case 'target-nabung':
      return 'target nabung'
  }
}

function kindPlaceholder(kind: AndaiKind): string {
  switch (kind) {
    case 'beli':
      return 'e.g. service mobil'
    case 'income':
      return 'e.g. gaji, freelance'
    case 'tagihan':
      return 'e.g. langganan baru'
    case 'target-nabung':
      return 'e.g. nabung tiap bulan'
  }
}
