import type { NavigateFunction } from 'react-router-dom'

// html[data-vt-direction='back'] CSS hook — read by the back-slide keyframes in global.css
const VT_BACK_ATTR = 'vtDirection'

// True only while a navigateBack()-triggered navigate(-1) is in flight — lets the
// popstate listener in initVTGuard() tell our own back-button traversal apart from a
// browser-driven one (swipe back/forward, hardware back, mouse back button), which
// animates on its own and must not also get our view transition (double animation).
let programmaticTraversal = false

/**
 * Back navigation with a manual View Transition in the 'back' direction.
 * navigate(-1) has no NavigateOptions overload, so viewTransition can't be
 * requested the way it is for forward navigate(to, { viewTransition: true }).
 * Falls back to a plain navigate(-1) when the browser has no View
 * Transitions API — progressive enhancement, never breaks navigation.
 */
export function navigateBack(navigate: NavigateFunction): void {
  if (typeof document === 'undefined' || !document.startViewTransition) {
    navigate(-1)
    return
  }

  document.documentElement.dataset[VT_BACK_ATTR] = 'back'
  programmaticTraversal = true
  const transition = document.startViewTransition(() => {
    navigate(-1)
  })
  transition.finished.finally(() => {
    delete document.documentElement.dataset[VT_BACK_ATTR]
  })
}

/**
 * Suppresses our view transition on browser-driven history traversal (swipe back/
 * forward, hardware back button, mouse back button) — the browser already animates
 * those itself, so ours would double up. Call once at app start, before render.
 */
export function initVTGuard(): void {
  if (typeof window === 'undefined') return

  window.addEventListener(
    'popstate',
    () => {
      if (programmaticTraversal) {
        programmaticTraversal = false
        return
      }
      document.documentElement.dataset.vtSkip = '1'
      setTimeout(() => {
        delete document.documentElement.dataset.vtSkip
      }, 600)
    },
    true,
  )
}
