import { useEffect, useRef, useState, type CSSProperties, type RefObject } from 'react'
import styles from './ChatIntro.module.css'

const LOGO_SRC = '/sisa-logo/icon-192.png'

const LOGO_ENTER_MS = 400
const WORDMARK_ENTER_MS = 200
const HOLD_MS = 700
const MOVE_MS = 550

function usePrefersReducedMotion(): boolean {
  const [reduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  return reduced
}

type Phase = 'enter' | 'hold' | 'move'

interface ChatIntroProps {
  /** Hidden avatar-slot anchor sitting where the first bubble's avatar will land. */
  anchorRef: RefObject<HTMLDivElement>
  onDone: () => void
}

/**
 * One-time brand splash before the chat starts: logo scales in, wordmark follows, a short
 * hold, then the logo shrinks and slides into the first bubble's avatar spot. Skipped
 * entirely under prefers-reduced-motion.
 */
export function ChatIntro({ anchorRef, onDone }: ChatIntroProps) {
  const reduceMotion = usePrefersReducedMotion()
  const logoRef = useRef<HTMLImageElement>(null)
  const [logoVisible, setLogoVisible] = useState(false)
  const [phase, setPhase] = useState<Phase>('enter')
  const [moveStyle, setMoveStyle] = useState<CSSProperties>()
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  useEffect(() => {
    if (reduceMotion) return
    const raf = requestAnimationFrame(() => setLogoVisible(true))
    return () => cancelAnimationFrame(raf)
  }, [reduceMotion])

  useEffect(() => {
    if (reduceMotion) {
      onDoneRef.current()
      return undefined
    }

    const toHold = setTimeout(() => setPhase('hold'), LOGO_ENTER_MS + WORDMARK_ENTER_MS)

    const toMove = setTimeout(
      () => {
        const logoEl = logoRef.current
        const anchorEl = anchorRef.current
        if (logoEl && anchorEl) {
          const logoRect = logoEl.getBoundingClientRect()
          const anchorRect = anchorEl.getBoundingClientRect()
          const dx = anchorRect.left + anchorRect.width / 2 - (logoRect.left + logoRect.width / 2)
          const dy = anchorRect.top + anchorRect.height / 2 - (logoRect.top + logoRect.height / 2)
          const scale = anchorRect.width / logoRect.width
          setMoveStyle({ transform: `translate(${dx}px, ${dy}px) scale(${scale})` })
        }
        setPhase('move')
      },
      LOGO_ENTER_MS + WORDMARK_ENTER_MS + HOLD_MS,
    )

    const toDone = setTimeout(
      () => onDoneRef.current(),
      LOGO_ENTER_MS + WORDMARK_ENTER_MS + HOLD_MS + MOVE_MS,
    )

    return () => {
      clearTimeout(toHold)
      clearTimeout(toMove)
      clearTimeout(toDone)
    }
  }, [reduceMotion, anchorRef])

  if (reduceMotion) return null

  return (
    <div className={styles.overlay}>
      <img
        ref={logoRef}
        src={LOGO_SRC}
        alt=""
        className={`${styles.logo} ${logoVisible ? styles.logoVisible : ''} ${phase === 'move' ? styles.logoMove : ''}`}
        style={moveStyle}
      />
      <span
        className={`${styles.wordmark} ${phase !== 'enter' ? styles.wordmarkVisible : ''} ${phase === 'move' ? styles.wordmarkHidden : ''}`}
      >
        Sisa
      </span>
    </div>
  )
}
