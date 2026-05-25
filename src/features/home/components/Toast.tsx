import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'
import styles from './Toast.module.css'

const TOAST_DURATION_MS = 2_000

interface Props {
  message: string
  onUndo: () => void
  onEdit?: () => void
  onDismiss: () => void
}

export function Toast({ message, onUndo, onEdit, onDismiss }: Props) {
  const lang = useLanguage()
  const [progress, setProgress] = useState(100)
  const startRef = useRef<number>(Date.now())
  const rafRef = useRef<number>(0)
  const dismissRef = useRef(onDismiss)

  useEffect(() => {
    dismissRef.current = onDismiss
  })

  useEffect(() => {
    startRef.current = Date.now()

    function tick() {
      const elapsed = Date.now() - startRef.current
      const remaining = Math.max(0, 100 - (elapsed / TOAST_DURATION_MS) * 100)
      setProgress(remaining)
      if (remaining > 0) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        dismissRef.current()
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <div className={styles.toast} role="status" aria-live="polite">
      <div className={styles.progressBar} style={{ width: `${progress}%` }} />
      <div className={styles.body}>
        <span className={styles.message}>{message}</span>
        <div className={styles.actions}>
          {onEdit && (
            <button className={styles.editBtn} onClick={onEdit}>
              {t('toast.edit', lang)}
            </button>
          )}
          <button className={styles.undoBtn} onClick={onUndo}>
            {t('toast.undo', lang)}
          </button>
        </div>
      </div>
    </div>
  )
}
