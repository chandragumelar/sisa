import { formatCurrency } from '@/shared/utils/formatCurrency'
import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'
import type { HandoffView } from '../onboarding.types'

interface Props {
  view: HandoffView | null
  onCta: () => void
}

/** Closing summary card — two numbers + CTA. Nothing else belongs here. */
export function StepHandoff({ view, onCta }: Props) {
  const lang = useLanguage()
  if (!view) return null

  return (
    <div className="ob-card" style={{ padding: '16px 18px' }}>
      <span className="ob-label">{t('ob.handoff.sisa_label', lang)}</span>
      <div
        style={{
          fontSize: 'clamp(26px, 9vw, var(--text-hero))',
          fontWeight: 700,
          fontFamily: 'var(--font-mono)',
          color: 'var(--ink-primary)',
          lineHeight: 1.1,
          marginTop: 4,
        }}
      >
        {formatCurrency(view.sisaUang, view.currency)}
      </div>

      <div style={{ height: 1, background: 'var(--border-hair)', margin: '14px 0' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span className="ob-label">{t('ob.handoff.jatah_label', lang)}</span>
        <span
          style={{
            fontSize: 'var(--text-title)',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            color: 'var(--ink-primary)',
          }}
        >
          {formatCurrency(view.jatahHariIni, view.currency)}
        </span>
      </div>

      <div className="ob-footer">
        <button type="button" className="ob-btn-primary ob-btn-full" onClick={onCta}>
          {t('ob.handoff.cta', lang)}
        </button>
      </div>
    </div>
  )
}
