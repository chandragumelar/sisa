import { useEffect, useState, type ReactNode } from 'react'
import styles from './ChatShell.module.css'

const AVATAR_SRC = '/sisa-logo/icon-192.png'

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

interface BotBubbleProps {
  text: string
  showAvatar: boolean
  animate: boolean
}

export function BotBubble({ text, showAvatar, animate }: BotBubbleProps) {
  const mounted = usePopIn(animate)
  return (
    <div className={styles.row}>
      <div className={styles.avatarSlot}>
        {showAvatar && <img src={AVATAR_SRC} alt="" className={styles.avatar} />}
      </div>
      <div
        className={`${styles.bubble} ${styles.bubbleBot} ${animate ? styles.pop : ''} ${mounted ? styles.popIn : ''}`}
      >
        {text}
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
  children: ReactNode
}

export function CardEntry({ showAvatar, animate, children }: CardEntryProps) {
  const mounted = usePopIn(animate)
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
