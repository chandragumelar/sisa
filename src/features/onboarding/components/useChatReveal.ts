import { useEffect, useRef, useState } from 'react'
import type { TranscriptEntry } from './chatTranscript.types'
import { TYPING_MS, GAP_AFTER_BUBBLE_MS, POP_MS } from './chatTiming'

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
  /** While true, holds off starting the reveal sequence (e.g. a brand intro is playing). */
  paused?: boolean
}

interface UseChatRevealResult {
  entries: TranscriptEntry[]
  /** Entries at or after this index should animate (typing indicator → pop → typewriter). */
  animateFromIndex: number
  showTyping: boolean
  dockVisible: boolean
  /** Bubble/card calls this once its own reveal (typewriter, or mount for a card) is done. */
  onEntryDone: (id: string) => void
}

/**
 * Paces the active step's bot lines in one at a time: gap → typing indicator → bubble
 * mounts → caller's typewriter runs → onEntryDone signals completion → next bubble's gap
 * starts. A step that was already fully shown once (visited via back/forward) reveals
 * instantly on every later activation — no replaying typing indicators the user has seen.
 */
export function useChatReveal({
  historyEntries,
  activeStepEntries,
  activeStepKey,
  paused = false,
}: UseChatRevealArgs): UseChatRevealResult {
  const reduceMotion = usePrefersReducedMotion()
  const [revealedCount, setRevealedCount] = useState(0)
  const [showTyping, setShowTyping] = useState(false)
  const [dockVisible, setDockVisible] = useState(false)
  const [awaitingReveal, setAwaitingReveal] = useState(false)
  const [instantStep, setInstantStep] = useState(false)
  const stepKeyRef = useRef(activeStepKey)
  // Seeded with the very first step: its own reveal runs via the initial render's default
  // state (not the step-change effect below, which only fires on a later *change*), so
  // without this it would never be marked visited and would replay on a later back-visit.
  const visitedRef = useRef<Set<string>>(new Set([activeStepKey]))

  // Step changed — decide whether this activation is a fresh reveal or an instant replay.
  useEffect(() => {
    if (stepKeyRef.current === activeStepKey) return
    stepKeyRef.current = activeStepKey
    const alreadyVisited = visitedRef.current.has(activeStepKey)
    visitedRef.current.add(activeStepKey)
    const skipAnimation = alreadyVisited || reduceMotion
    setInstantStep(skipAnimation)
    setShowTyping(false)
    setAwaitingReveal(false)
    if (skipAnimation) {
      setRevealedCount(activeStepEntries.length)
      setDockVisible(true)
    } else {
      setRevealedCount(0)
      setDockVisible(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStepKey, reduceMotion])

  // Hide the dock again while catching up to newly-appended lines (e.g. a follow-up
  // question or an error bubble added mid-step).
  useEffect(() => {
    if (instantStep) return
    if (revealedCount < activeStepEntries.length && dockVisible) setDockVisible(false)
  }, [revealedCount, activeStepEntries.length, instantStep, dockVisible])

  // Gap, then typing indicator, then mount the next entry — waits for awaitingReveal to
  // clear (the mounted entry's own reveal finishing) before it will run again.
  useEffect(() => {
    if (paused) return undefined
    if (instantStep || reduceMotion) return undefined
    if (revealedCount >= activeStepEntries.length) return undefined
    if (awaitingReveal) return undefined

    const delay = revealedCount === 0 ? 0 : GAP_AFTER_BUBBLE_MS
    let typingTimer: ReturnType<typeof setTimeout> | undefined
    const preTimer = setTimeout(() => {
      setShowTyping(true)
      typingTimer = setTimeout(() => {
        setShowTyping(false)
        setRevealedCount((c) => c + 1)
        setAwaitingReveal(true)
      }, TYPING_MS)
    }, delay)
    return () => {
      clearTimeout(preTimer)
      if (typingTimer) clearTimeout(typingTimer)
    }
  }, [revealedCount, activeStepEntries.length, reduceMotion, awaitingReveal, instantStep, paused])

  // Everything caught up and the last entry finished revealing — bring the dock in.
  useEffect(() => {
    if (instantStep || dockVisible) return undefined
    if (revealedCount < activeStepEntries.length) return undefined
    if (awaitingReveal) return undefined
    if (reduceMotion) {
      setDockVisible(true)
      return undefined
    }
    const timer = setTimeout(() => setDockVisible(true), POP_MS)
    return () => clearTimeout(timer)
  }, [
    revealedCount,
    activeStepEntries.length,
    awaitingReveal,
    reduceMotion,
    dockVisible,
    instantStep,
  ])

  function onEntryDone(id: string) {
    if (instantStep || !awaitingReveal) return
    const expectedId = activeStepEntries[revealedCount - 1]?.id
    if (id !== expectedId) return
    setAwaitingReveal(false)
  }

  return {
    entries: [...historyEntries, ...activeStepEntries.slice(0, revealedCount)],
    animateFromIndex: instantStep ? Infinity : historyEntries.length,
    showTyping,
    dockVisible,
    onEntryDone,
  }
}
