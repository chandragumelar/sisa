import { useState } from 'react'
import { Info, Trash2, Plus } from 'lucide-react'
import { useLanguage } from '@/app/providers/useLanguage'
import type { NominalType } from '@/db/database'
import { BottomSheet } from '@/shared/components/BottomSheet'
import { ScrollSegmented } from '@/shared/components/ScrollSegmented'
import { formatNominalDisplay, parseNominalRaw } from '@/shared/utils/formatNominalInput'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import { ALL_CURRENCIES } from '@/constants/currencies'
import { t } from '@/shared/strings/strings'
import { TagihanAnchorInput } from '@/features/profil/TagihanAnchorInput'
import { EMPTY_FORM, FREQ_KEYS, FREQ_LABEL } from '@/features/profil/ProfilTagihanSheet.utils'
import type { FormState } from '@/features/profil/ProfilTagihanSheet.utils'
import styles from './StepTagihan.module.css'

interface Props {
  tagihan: FormState[]
  currency: string
  onChange: (items: FormState[]) => void
  onNext: () => void
}

export function StepTagihan({ tagihan, currency, onChange, onNext }: Props) {
  const lang = useLanguage()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)

  const canProceed = tagihan.length > 0

  function patch<K extends keyof FormState>(k: K) {
    return (v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }))
  }

  function handleAdd() {
    const nominal = parseNominalRaw(form.nominalEstimate)
    if (!form.name.trim() || !nominal || nominal === '0') return
    const item = { ...form, currency: form.currency || currency }
    onChange([...tagihan, item])
    setForm(EMPTY_FORM)
    setSheetOpen(false)
  }

  function handleRemove(idx: number) {
    onChange(tagihan.filter((_, i) => i !== idx))
  }

  const primaryTotal = tagihan
    .filter((tg) => (tg.currency || currency) === currency)
    .reduce((s, tg) => s + (parseInt(parseNominalRaw(tg.nominalEstimate), 10) || 0), 0)

  const otherCurrencies = new Map<string, number>()
  tagihan.forEach((tg) => {
    const cur = tg.currency || currency
    if (cur !== currency) {
      const amt = parseInt(parseNominalRaw(tg.nominalEstimate), 10) || 0
      otherCurrencies.set(cur, (otherCurrencies.get(cur) ?? 0) + amt)
    }
  })

  const canAddItem =
    form.name.trim().length > 0 && parseInt(parseNominalRaw(form.nominalEstimate), 10) > 0

  return (
    <>
      <h1 className="ob-heading">{t('ob.tagihan.heading', lang)}</h1>
      <p className="ob-subheading">{t('ob.tagihan.subheading', lang)}</p>

      {tagihan.length === 0 ? (
        <div className="ob-card" style={{ padding: '28px 16px', textAlign: 'center' }}>
          <div className={styles.emptyIcon}>
            <Info size={16} strokeWidth={1.75} />
          </div>
          <div className={styles.emptyLabel}>{t('ob.tagihan.empty', lang)}</div>
          <div className={styles.emptyHint}>{t('ob.tagihan.example', lang)}</div>
        </div>
      ) : (
        <div className="ob-card">
          {tagihan.map((item, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                padding: '12px 14px',
                borderBottom: i < tagihan.length - 1 ? '1px solid var(--border-soft)' : 'none',
              }}
            >
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div
                  style={{ flex: 1, fontSize: 14, fontWeight: 600, color: 'var(--ink-primary)' }}
                >
                  {item.name}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(i)}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    border: '1px solid var(--border-hair)',
                    background: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Trash2 size={12} strokeWidth={1.75} />
                </button>
              </div>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--ink-tertiary)' }}>
                  {t(FREQ_LABEL[item.frequency], lang)}
                </span>
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    fontFamily: 'var(--font-mono)',
                    fontFeatureSettings: "'tnum'",
                    color: 'var(--ink-primary)',
                  }}
                >
                  {formatCurrency(
                    parseInt(parseNominalRaw(item.nominalEstimate), 10) || 0,
                    item.currency || currency,
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        className="ob-add-dashed"
        onClick={() => {
          setForm({ ...EMPTY_FORM, currency })
          setSheetOpen(true)
        }}
      >
        <Plus size={14} strokeWidth={1.75} />
        {t('ob.tagihan.add', lang)}
      </button>

      <div className="ob-footer">
        <div className="ob-footer-total">
          <span>{t('ob.tagihan.monthly_total', lang)}</span>
          <div style={{ textAlign: 'right' }}>
            <span
              className="ob-footer-total-amt"
              style={{ color: primaryTotal > 0 ? 'var(--signal-danger)' : 'var(--ink-tertiary)' }}
            >
              {formatCurrency(primaryTotal, currency)}
            </span>
            {otherCurrencies.size > 0 &&
              Array.from(otherCurrencies.entries()).map(([cur, amt]) => (
                <div key={cur} style={{ fontSize: 11, color: 'var(--ink-tertiary)', marginTop: 2 }}>
                  + {formatCurrency(amt, cur)} {t('ob.common.other_currency', lang)}
                </div>
              ))}
          </div>
        </div>
        <button
          type="button"
          className="ob-btn-primary ob-btn-full"
          disabled={!canProceed}
          onClick={onNext}
        >
          {t('ob.tagihan.continue', lang)}
        </button>
        {!canProceed && (
          <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--ink-tertiary)' }}>
            {t('ob.tagihan.min_hint', lang)}
          </div>
        )}
      </div>

      {/* Add tagihan sheet */}
      <BottomSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title={t('profil.tagihan_title_add', lang)}
      >
        <div className={styles.formWrap}>
          <div className={styles.fieldLabel}>{t('profil.tagihan_name_label', lang)}</div>
          <input
            className={styles.fieldInput}
            placeholder={t('profil.tagihan_name_placeholder', lang)}
            value={form.name}
            onChange={(e) => patch('name')(e.target.value)}
            autoFocus
          />

          <div className={styles.fieldLabel}>{t('profil.tagihan_nominal_label', lang)}</div>
          <div className={styles.segRow}>
            {(['tetap', 'variabel'] as NominalType[]).map((n) => (
              <button
                key={n}
                type="button"
                className={`${styles.seg} ${form.nominalType === n ? styles.segActive : ''}`}
                onClick={() => patch('nominalType')(n)}
              >
                {n === 'tetap'
                  ? t('profil.tagihan_fixed', lang)
                  : t('profil.tagihan_variable', lang)}
              </button>
            ))}
          </div>

          <div className={styles.amountRow}>
            <select
              className={styles.amountCurrency}
              value={form.currency || currency}
              onChange={(e) => patch('currency')(e.target.value)}
              aria-label={t('profil.tagihan_currency_label', lang)}
            >
              {ALL_CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code}
                </option>
              ))}
            </select>
            <input
              className={styles.amountInput}
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={form.nominalEstimate}
              onChange={(e) =>
                patch('nominalEstimate')(formatNominalDisplay(parseNominalRaw(e.target.value)))
              }
            />
          </div>

          <div className={styles.fieldLabel}>{t('profil.tagihan_freq_label', lang)}</div>
          <ScrollSegmented
            items={FREQ_KEYS.map((f) => ({ value: f, label: t(FREQ_LABEL[f], lang) }))}
            value={form.frequency}
            onChange={(f) => patch('frequency')(f)}
          />

          <TagihanAnchorInput
            frequency={form.frequency}
            fields={form}
            onChange={(field, value) => setForm((f) => ({ ...f, [field]: value }))}
            lang={lang}
          />

          <button
            type="button"
            className={`${styles.saveBtn} ${!canAddItem ? styles.saveBtnDisabled : ''}`}
            disabled={!canAddItem}
            onClick={handleAdd}
          >
            {t('common.save', lang)}
          </button>
          <button type="button" className={styles.cancelBtn} onClick={() => setSheetOpen(false)}>
            {t('common.cancel', lang)}
          </button>
        </div>
      </BottomSheet>
    </>
  )
}
