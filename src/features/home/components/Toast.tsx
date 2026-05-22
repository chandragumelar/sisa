import { useEffect, useRef, useState } from 'react'
import styles from './Toast.module.css'

const DURATION_MS = 5000

interface Props {
  message: string
  onUndo: () => void
  onEdit?: () => void
  onDismiss: () => void
}

export function Toast({ message, onUndo, onEdit, onDismiss }: Props) {
  const [progress, setProgress] = useState(100)
  const startRef = useRef<number>(Date.now())
  const rafRef = useRef<number>(0)

  useEffect(() => {
    startRef.current = Date.now()

    function tick() {
      const elapsed = Date.now() - startRef.current
      const remaining = Math.max(0, 100 - (elapsed / DURATION_MS) * 100)
      setProgress(remaining)
      if (remaining > 0) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        onDismiss()
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [onDismiss])

  return (
    <div className={styles.toast} role="status" aria-live="polite">
      <div className={styles.progressBar} style={{ width: `${progress}%` }} />
      <div className={styles.body}>
        <span className={styles.message}>{message}</span>
        <div className={styles.actions}>
          {onEdit && (
            <button className={styles.editBtn} onClick={onEdit}>
              Ubah
            </button>
          )}
          <button className={styles.undoBtn} onClick={onUndo}>
            Batal
          </button>
        </div>
      </div>
    </div>
  )
}
