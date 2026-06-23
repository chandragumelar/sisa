import { useState } from 'react'
import { useLanguage } from '@/app/providers/useLanguage'
import type { NominalType } from '@/db/database'
import { BottomSheet } from '@/shared/components/BottomSheet'
import { ScrollSegmented } from '@/shared/components/ScrollSegmented'
import { formatNominalDisplay, parseNominalRaw } from '@/shared/utils/formatNominalInput'
import { getCurrencySymbol } from '@/shared/utils/formatCurrency'
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
  const currSymbol = getCurrencySymbol(currency)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)

  const canProceed = tagihan.length > 0

  function patch<K extends keyof FormState>(k: K) {
    return (v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }))
  }

  function handleAdd() {
    const nominal = parseNominalRaw(form.nominalEstimate)
    if (!form.name.trim() || !nominal || nominal === '0') return
    onChange([...tagihan, form])
    setForm(EMPTY_FORM)
    setSheetOpen(false)
  }

  function handleRemove(idx: number) {
    onChange(tagihan.filter((_, i) => i !== idx))
  }

  const total = tagihan.reduce(
    (s, tg) => s + (parseInt(parseNominalRaw(tg.nominalEstimate), 10) || 0),
    0,
  )
  const canAddItem =
    form.name.trim().length > 0 && parseInt(parseNominalRaw(form.nominalEstimate), 10) > 0

  return (
    <>
      <h1 className="ob-heading">Tagihan rutin lo apa aja?</h1>
      <p className="ob-subheading">Isi ini biar angka Sisa lo akurat. Minimal 1 tagihan ya.</p>

      {tagihan.length === 0 ? (
        <div className="ob-card" style={{ padding: '28px 16px', textAlign: 'center' }}>
          <div className={styles.emptyIcon}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            >
              <circle cx="8" cy="8" r="6.5" />
              <path d="M8 5v3M8 10.5v.5" />
            </svg>
          </div>
          <div className={styles.emptyLabel}>Belum ada tagihan</div>
          <div className={styles.emptyHint}>Contoh: kos, cicilan motor, langganan streaming.</div>
        </div>
      ) : (
        <div className="ob-card">
          {tagihan.map((item, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 14px',
                gap: 10,
                borderBottom: i < tagihan.length - 1 ? '1px solid var(--border-soft)' : 'none',
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-primary)' }}>
                  {item.name}
                </div>
                <div style={{ fontSize: 11, color: 'var(--ink-tertiary)', marginTop: 2 }}>
                  {t(FREQ_LABEL[item.frequency], lang)}
                </div>
              </div>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--ink-primary)',
                }}
              >
                {currSymbol}
                {(parseInt(parseNominalRaw(item.nominalEstimate), 10) || 0).toLocaleString('id-ID')}
              </span>
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
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 14 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 3.5h10M5.5 3.5V2h3v1.5M3.5 3.5l.8 8h5.4l.8-8" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        className="ob-add-dashed"
        onClick={() => {
          setForm(EMPTY_FORM)
          setSheetOpen(true)
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <path d="M8 3V13M3 8H13" />
        </svg>
        Tambah tagihan
      </button>

      <div className="ob-footer">
        <div className="ob-footer-total">
          <span>Total tagihan bulanan</span>
          <span
            className="ob-footer-total-amt"
            style={{ color: total > 0 ? 'var(--signal-danger)' : 'var(--ink-tertiary)' }}
          >
            {currSymbol}
            {total.toLocaleString('id-ID')}
          </span>
        </div>
        <button
          type="button"
          className="ob-btn-primary ob-btn-full"
          disabled={!canProceed}
          onClick={onNext}
        >
          Lanjut →
        </button>
        {!canProceed && (
          <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--ink-tertiary)' }}>
            Tambah minimal 1 tagihan dulu
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
            <span className={styles.amountPrefix}>{currSymbol}</span>
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
