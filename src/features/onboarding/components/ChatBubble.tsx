import { useEffect, useRef, useState, type ReactNode } from 'react'
import styles from './ChatShell.module.css'
import { CHAR_MS, POP_MS } from './chatTiming'

const AVATAR_SRC = '/sisa-logo/icon-192.png'

function usePrefersReducedMotion(): boolean {
  const [reduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  return reduced
}

/** Toggles the pop-in class one frame after mount so the browser paints the "from" state first. */
function usePopIn(animate: boolean): boolean {
  const [mounted, setMounted] = useState(!animate)
  useEffect(() => {
    if (!animate) return
    const raf = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(raf)
  }, [animate])
  return mounted
}

/** Reveals `text` one character at a time; fires `onDone` once (or immediately if not animating). */
function useTypewriter(text: string, animate: boolean, onDone?: () => void) {
  const reduceMotion = usePrefersReducedMotion()
  const playing = animate && !reduceMotion
  const [count, setCount] = useState(playing ? 0 : text.length)
  const doneFiredRef = useRef(false)
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  useEffect(() => {
    if (!playing || count >= text.length) {
      if (!doneFiredRef.current) {
        doneFiredRef.current = true
        onDoneRef.current?.()
      }
      return undefined
    }
    const timer = setTimeout(() => setCount((c) => c + 1), CHAR_MS)
    return () => clearTimeout(timer)
  }, [count, playing, text.length])

  return { display: text.slice(0, count), typing: playing && count < text.length }
}

interface BotBubbleProps {
  text: string
  showAvatar: boolean
  animate: boolean
  onDone?: () => void
}

export function BotBubble({ text, showAvatar, animate, onDone }: BotBubbleProps) {
  const mounted = usePopIn(animate)
  const { display, typing } = useTypewriter(text, animate, onDone)

  return (
    <div className={styles.row}>
      <div className={styles.avatarSlot}>
        {showAvatar && <img src={AVATAR_SRC} alt="" className={styles.avatar} />}
      </div>
      <div
        className={`${styles.bubble} ${styles.bubbleBot} ${animate ? styles.pop : ''} ${mounted ? styles.popIn : ''}`}
      >
        {animate ? (
          <span className={styles.textStack}>
            <span className={styles.textGhost} aria-hidden="true">
              {text}
            </span>
            <span className={styles.textTyped}>
              {display}
              {typing && <span className={styles.caret} />}
            </span>
          </span>
        ) : (
          text
        )}
      </div>
    </div>
  )
}

interface UserBubbleProps {
  text: string
}

export function UserBubble({ text }: UserBubbleProps) {
  return (
    <div className={`${styles.row} ${styles.rowUser}`}>
      <div className={`${styles.bubble} ${styles.bubbleUser}`}>{text}</div>
    </div>
  )
}

interface CardEntryProps {
  showAvatar: boolean
  animate: boolean
  onDone?: () => void
  children: ReactNode
}

export function CardEntry({ showAvatar, animate, onDone, children }: CardEntryProps) {
  const mounted = usePopIn(animate)
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  useEffect(() => {
    if (!animate) return undefined
    const timer = setTimeout(() => onDoneRef.current?.(), POP_MS)
    return () => clearTimeout(timer)
  }, [animate])

  return (
    <div className={styles.row}>
      <div className={styles.avatarSlot}>
        {showAvatar && <img src={AVATAR_SRC} alt="" className={styles.avatar} />}
      </div>
      <div
        className={`${styles.cardWrap} ${animate ? styles.pop : ''} ${mounted ? styles.popIn : ''}`}
      >
        {children}
      </div>
    </div>
  )
}

export function TypingIndicator() {
  return (
    <div className={styles.row}>
      <div className={styles.avatarSlot}>
        <img src={AVATAR_SRC} alt="" className={styles.avatar} />
      </div>
      <div className={`${styles.bubble} ${styles.bubbleBot} ${styles.typing}`}>
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.dot} />
      </div>
    </div>
  )
}
