import { useEffect, useRef, type ReactNode } from 'react'
import { ChevronLeft } from 'lucide-react'
import type { OnboardingStep } from '../onboarding.types'
import type { TranscriptEntry } from './chatTranscript.types'
import { getProgressCount, TOTAL_PROGRESS_DOTS } from '../onboarding.utils'
import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'
import { useChatReveal } from './useChatReveal'
import { ChatTranscript } from './ChatTranscript'
import { ChatIntro } from './ChatIntro'
import styles from './ChatShell.module.css'

interface ChatShellProps {
  step: OnboardingStep
  onBack?: () => void
  historyEntries: TranscriptEntry[]
  activeStepEntries: TranscriptEntry[]
  dock: ReactNode | null
  /** True only for the very first, not-yet-played brand intro (fresh start on langCurrency). */
  introActive?: boolean
  onIntroDone?: () => void
}

export function ChatShell({
  step,
  onBack,
  historyEntries,
  activeStepEntries,
  dock,
  introActive = false,
  onIntroDone,
}: ChatShellProps) {
  const lang = useLanguage()
  const filled = getProgressCount(step)
  const filledStr = String(filled).padStart(2, '0')
  const totalStr = String(TOTAL_PROGRESS_DOTS).padStart(2, '0')
  const touchStartX = useRef<number | null>(null)
  const touchStartY = useRef<number | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const introAnchorRef = useRef<HTMLDivElement>(null)

  const { entries, animateFromIndex, showTyping, dockVisible, onEntryDone } = useChatReveal({
    historyEntries,
    activeStepEntries,
    activeStepKey: step,
    paused: introActive,
  })

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight })
  }, [entries.length, showTyping, dockVisible])

  // Catches everything else that changes the transcript's height — typewriter reveal,
  // card fields appearing/disappearing — so long content never runs off-screen while typing.
  useEffect(() => {
    const scrollEl = scrollRef.current
    const contentEl = contentRef.current
    if (!scrollEl || !contentEl || typeof ResizeObserver === 'undefined') return undefined
    const observer = new ResizeObserver(() => {
      scrollEl.scrollTo({ top: scrollEl.scrollHeight })
    })
    observer.observe(contentEl)
    return () => observer.disconnect()
  }, [])

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null || touchStartY.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current)
    touchStartX.current = null
    touchStartY.current = null
    if (dx > 60 && dy < 40 && onBack) onBack()
  }

  return (
    <div className={styles.screen} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {step !== 'langCurrency' && (
        <div className={styles.header}>
          <div className={styles.headerRow}>
            {onBack && (
              <button className={styles.backBtn} onClick={onBack}>
                <ChevronLeft size={18} />
                <span>{t('common.back_aria', lang)}</span>
              </button>
            )}
            <div className={styles.segments} aria-hidden="true">
              {Array.from({ length: TOTAL_PROGRESS_DOTS }, (_, i) => {
                let cls = styles.segment
                if (i < filled - 1) cls = styles.segmentDone
                else if (i === filled - 1) cls = styles.segmentActive
                return <span key={i} className={cls} />
              })}
            </div>
          </div>
          <div className={styles.stepLabel}>
            {filledStr} / {totalStr}
          </div>
        </div>
      )}

      <div className={styles.transcriptArea} ref={scrollRef}>
        <ChatTranscript
          entries={entries}
          animateFromIndex={animateFromIndex}
          showTyping={showTyping}
          onEntryDone={onEntryDone}
          contentRef={contentRef}
          leadingAnchorRef={introActive ? introAnchorRef : undefined}
        />
      </div>

      {dock && (
        <div className={`${styles.dock} ${dockVisible ? styles.dockVisible : ''}`}>{dock}</div>
      )}

      {introActive && onIntroDone && <ChatIntro anchorRef={introAnchorRef} onDone={onIntroDone} />}
    </div>
  )
}
