import type { Tagihan } from '@/db/database'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import { rankTagihan, formatTagihanMeta } from '../tagihan.utils'
import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'
import { TagihanSwipeRow } from './TagihanSwipeRow'
import styles from './TagihanModule.module.css'

interface Props {
  tagihan: Tagihan[]
  currency: string
  nowMs: number
  onPayTap: (tagihan: Tagihan) => void
  onRowTap: (tagihan: Tagihan) => void
  onAddTap?: () => void
}

const MAX_VISIBLE = 4

export function TagihanModule({ tagihan, currency, nowMs, onPayTap, onRowTap, onAddTap }: Props) {
  const lang = useLanguage()
  const active = tagihan.filter((tg) => tg.isActive)
  const ranked = rankTagihan(active, nowMs)
  const visible = ranked.slice(0, MAX_VISIBLE)
  const hidden = ranked.slice(MAX_VISIBLE)

  const total = active.reduce((sum, tg) => sum + tg.nominalEstimate, 0)

  return (
    <>
      <div className={styles.header}>
        <span className={styles.label}>{t('tagihan_module.title', lang)}</span>
        {active.length > 0 && (
          <span className={styles.totalMeta}>± {formatCurrency(total, currency)}</span>
        )}
      </div>

      {active.length === 0 ? (
        <div className={styles.emptyBlock}>
          <p className={styles.emptyText}>{t('tagihan_module.empty_text', lang)}</p>
          <button className={styles.addBtn} onClick={onAddTap}>
            {t('tagihan_module.add', lang)}
          </button>
        </div>
      ) : (
        <>
          {visible.map((tg) => (
            <TagihanSwipeRow
              key={tg.id}
              tagihan={tg}
              nowMs={nowMs}
              metaText={formatTagihanMeta(tg, nowMs)}
              onPayTap={() => onPayTap(tg)}
              onRowTap={() => onRowTap(tg)}
            />
          ))}

          {hidden.length > 0 && (
            <button className={styles.expandLink}>
              +{' '}
              <strong>
                {t('tagihan_module.more', lang).replace('{n}', String(hidden.length))}
              </strong>{' '}
              · {hidden.map((tg) => tg.name).join(', ')} ›
            </button>
          )}

          <div className={styles.swipeHint}>{t('tagihan_module.swipe_hint', lang)}</div>
          <button className={styles.addBtn} onClick={onAddTap}>
            {t('tagihan_module.add', lang)}
          </button>
        </>
      )}
    </>
  )
}
