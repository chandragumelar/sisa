import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClock } from '@/app/providers/useClock'
import { getSettings } from '@/db/settings.repository'
import { getAllWallets } from '@/db/wallets.repository'
import { getActiveTagihan } from '@/db/tagihan.repository'
import { getTotalNabung } from '@/db/transactions.repository'
import { calcUnpaidTagihanTotal } from '@/features/home/home.utils'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import { calcAndai, buildAndaiBaseline } from './andai.utils'
import type { AndaiBaseline, AndaiItem, AndaiKind } from './andai.utils'
import { BottomSheet } from '@/shared/components/BottomSheet'
import styles from './AndaiPage.module.css'

type AddKind = AndaiKind

export function AndaiPage() {
  const clock = useClock()
  const navigate = useNavigate()
  const nowMs = clock.now()

  const [baseline, setBaseline] = useState<AndaiBaseline | null>(null)
  const [currency, setCurrency] = useState('IDR')
  const [items, setItems] = useState<AndaiItem[]>([])
  const [addSheet, setAddSheet] = useState<AddKind | null>(null)
  const [addDesc, setAddDesc] = useState('')
  const [addAmount, setAddAmount] = useState('')
  const [proTagShown, setProTagShown] = useState(false)

  useEffect(() => {
    let cancelled = false
    Promise.all([getSettings(), getAllWallets(), getActiveTagihan()]).then(
      ([settings, wallets, tagihan]) => {
        if (cancelled || !settings) return
        const totalSaldo = wallets.reduce((s, w) => s + w.balance, 0)
        const unpaidTagihanTotal = calcUnpaidTagihanTotal(tagihan, nowMs)
        getTotalNabung(settings.primaryCurrency).then((totalNabung) => {
          if (cancelled) return
          setCurrency(settings.primaryCurrency)
          setBaseline(
            buildAndaiBaseline(totalSaldo, unpaidTagihanTotal, totalNabung, settings, nowMs),
          )
        })
      },
    )
    return () => {
      cancelled = true
    }
  }, [nowMs])

  if (!baseline) return null

  const result = calcAndai(items, baseline)

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
        </>
      )}

      {/* Actions */}
      <div className={styles.actions}>
        <button
          className={styles.resetBtn}
          onClick={() => {
            setItems([])
            setProTagShown(false)
          }}
        >
          Reset
        </button>
        <button className={styles.saveBtn} onClick={() => setProTagShown(true)}>
          <span className={styles.saveBtnLabel}>Simpan skenario</span>
          {proTagShown && <span className={styles.proTag}>Pro</span>}
        </button>
      </div>

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
