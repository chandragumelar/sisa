import type { NavigateFunction } from 'react-router-dom'

// html[data-vt-direction='back'] CSS hook — read by the back-slide keyframes in global.css
const VT_BACK_ATTR = 'vtDirection'

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
  const transition = document.startViewTransition(() => {
    navigate(-1)
  })
  transition.finished.finally(() => {
    delete document.documentElement.dataset[VT_BACK_ATTR]
  })
}
