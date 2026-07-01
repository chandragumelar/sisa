import { useState } from 'react'
import type { Tagihan } from '@/db/database'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import { BottomSheet } from '@/shared/components/BottomSheet'
import { getTagihanUrgency, rankTagihan, isTagihanPaidThisPeriod } from '../tagihan.utils'
import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'
import styles from './TagihanDetailSheet.module.css'

interface SingleProps {
  tagihan: Tagihan
  nowMs: number
  isOpen: boolean
  onClose: () => void
  onPay: (tagihan: Tagihan) => void
  onEdit?: (tagihan: Tagihan) => void
  onDelete?: (tagihan: Tagihan) => void
}

export function TagihanDetailSheet({
  tagihan,
  nowMs,
  isOpen,
  onClose,
  onPay,
  onEdit,
  onDelete,
}: SingleProps) {
  const lang = useLanguage()
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const urgency = getTagihanUrgency(tagihan, nowMs)
  const isPaid = isTagihanPaidThisPeriod(tagihan, nowMs)

  function handleClose() {
    setDeleteConfirm(false)
    onClose()
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose} title={tagihan.name}>
      <div className={styles.detail}>
        <div className={styles.row}>
          <span className={styles.rowLabel}>{t('tagihan_detail.nominal', lang)}</span>
          <span className={styles.rowValue}>
            {tagihan.nominalType === 'variabel' ? '± ' : ''}
            {formatCurrency(tagihan.nominalEstimate, tagihan.currency)}
          </span>
        </div>
        <div className={styles.row}>
          <span className={styles.rowLabel}>{t('tagihan_detail.due_date_label', lang)}</span>
          <span className={styles.rowValue}>
            {t('tagihan_detail.due_day', lang).replace('{day}', String(tagihan.dueDay))}
          </span>
        </div>
        <div className={styles.row}>
          <span className={styles.rowLabel}>{t('tagihan_detail.status', lang)}</span>
          <span
            className={
              urgency === 'lewat-tempo' || urgency === 'hari-ini'
                ? styles.rowValueUrgent
                : styles.rowValue
            }
          >
            {isPaid
              ? t('tagihan_detail.status_paid', lang)
              : urgency === 'lewat-tempo'
                ? t('tagihan_detail.status_overdue', lang)
                : urgency === 'hari-ini'
                  ? t('tagihan_detail.status_due_today', lang)
                  : t('tagihan_detail.status_unpaid', lang)}
          </span>
        </div>
        {tagihan.lastPaidAmount !== null && (
          <div className={styles.row}>
            <span className={styles.rowLabel}>{t('tagihan_detail.last_paid', lang)}</span>
            <span className={styles.rowValue}>
              {formatCurrency(tagihan.lastPaidAmount, tagihan.currency)}
            </span>
          </div>
        )}
      </div>

      {!isPaid && (
        <button
          className={styles.payBtn}
          onClick={() => {
            onPay(tagihan)
            handleClose()
          }}
        >
          {t('tagihan_detail.mark_paid', lang)}
        </button>
      )}

      {onEdit && (
        <button
          className={styles.editBtn}
          onClick={() => {
            onEdit(tagihan)
            handleClose()
          }}
        >
          {t('history.edit_aria', lang)}
        </button>
      )}

      {onDelete && !deleteConfirm && (
        <button className={styles.deleteBtn} onClick={() => setDeleteConfirm(true)}>
          {t('common.delete', lang)}
        </button>
      )}

      {onDelete && deleteConfirm && (
        <div className={styles.confirmRow}>
          <span className={styles.confirmText}>
            {t('tagihan_detail.delete_confirm', lang).replace('{name}', tagihan.name)}
          </span>
          <button
            className={styles.dangerBtn}
            onClick={() => {
              onDelete(tagihan)
              handleClose()
            }}
          >
            {t('common.delete', lang)}
          </button>
          <button className={styles.ghostBtn} onClick={() => setDeleteConfirm(false)}>
            {t('common.cancel', lang)}
          </button>
        </div>
      )}
    </BottomSheet>
  )
}

interface UrgentListProps {
  tagihan: Tagihan[]
  nowMs: number
  isOpen: boolean
  onClose: () => void
  onPay: (tagihan: Tagihan) => void
}

export function UrgentTagihanSheet({ tagihan, nowMs, isOpen, onClose, onPay }: UrgentListProps) {
  const lang = useLanguage()
  const urgent = rankTagihan(tagihan, nowMs).filter((tg) => {
    const u = getTagihanUrgency(tg, nowMs)
    return u === 'lewat-tempo' || u === 'hari-ini'
  })

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={t('tagihan_detail.urgent_title', lang)}>
      {urgent.map((tg) => {
        const u = getTagihanUrgency(tg, nowMs)
        const overdueDays = new Date(nowMs).getDate() - tg.dueDay
        return (
          <div key={tg.id} className={styles.urgentRow}>
            <div className={styles.urgentLeft}>
              <span className={styles.urgentName}>{tg.name}</span>
              <span className={styles.urgentMeta}>
                {u === 'lewat-tempo'
                  ? t('tagihan_detail.overdue_days', lang).replace('{n}', String(overdueDays))
                  : t('tagihan_detail.due_today', lang)}
              </span>
            </div>
            <div className={styles.urgentRight}>
              <span className={styles.urgentAmount}>
                {formatCurrency(tg.nominalEstimate, tg.currency)}
              </span>
              <button
                className={styles.urgentPayBtn}
                onClick={() => {
                  onPay(tg)
                  onClose()
                }}
              >
                {t('tagihan_detail.pay_btn', lang)}
              </button>
            </div>
          </div>
        )
      })}
    </BottomSheet>
  )
}
