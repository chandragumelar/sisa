import { useEffect, useRef, useState } from 'react'
import type { TranscriptEntry } from './chatTranscript.types'

const TYPING_MS = 500
const STAGGER_MS = 600
const POP_MS = 260

function usePrefersReducedMotion(): boolean {
  const [reduced] = useState(
    () =>
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  return reduced
}

interface UseChatRevealArgs {
  historyEntries: TranscriptEntry[]
  activeStepEntries: TranscriptEntry[]
  activeStepKey: string
}

interface UseChatRevealResult {
  entries: TranscriptEntry[]
  animateFromIndex: number
  showTyping: boolean
  dockVisible: boolean
}

/**
 * Paces the active step's bot lines in one at a time (typing indicator, then pop-in,
 * staggered) and only reveals the dock once every line has landed. History is always
 * shown in full immediately — only the current, unanswered step animates.
 */
export function useChatReveal({
  historyEntries,
  activeStepEntries,
  activeStepKey,
}: UseChatRevealArgs): UseChatRevealResult {
  const reduceMotion = usePrefersReducedMotion()
  const [revealedCount, setRevealedCount] = useState(0)
  const [showTyping, setShowTyping] = useState(false)
  const [dockVisible, setDockVisible] = useState(false)
  const stepKeyRef = useRef(activeStepKey)

  useEffect(() => {
    if (stepKeyRef.current === activeStepKey) return
    stepKeyRef.current = activeStepKey
    setRevealedCount(0)
    setShowTyping(false)
    setDockVisible(false)
  }, [activeStepKey])

  useEffect(() => {
    if (revealedCount >= activeStepEntries.length) return undefined
    if (reduceMotion) {
      setRevealedCount(activeStepEntries.length)
      return undefined
    }
    const delay = revealedCount === 0 ? 0 : STAGGER_MS
    let typingTimer: ReturnType<typeof setTimeout> | undefined
    const preTimer = setTimeout(() => {
      setShowTyping(true)
      typingTimer = setTimeout(() => {
        setShowTyping(false)
        setRevealedCount((c) => c + 1)
      }, TYPING_MS)
    }, delay)
    return () => {
      clearTimeout(preTimer)
      if (typingTimer) clearTimeout(typingTimer)
    }
  }, [revealedCount, activeStepEntries.length, reduceMotion])

  useEffect(() => {
    if (revealedCount < activeStepEntries.length) return undefined
    if (reduceMotion) {
      setDockVisible(true)
      return undefined
    }
    const timer = setTimeout(() => setDockVisible(true), POP_MS)
    return () => clearTimeout(timer)
  }, [revealedCount, activeStepEntries.length, reduceMotion])

  return {
    entries: [...historyEntries, ...activeStepEntries.slice(0, revealedCount)],
    animateFromIndex: historyEntries.length,
    showTyping,
    dockVisible,
  }
}
