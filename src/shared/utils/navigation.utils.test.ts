import { describe, it, expect, vi, afterEach } from 'vitest'
import type { NavigateFunction } from 'react-router-dom'
import { navigateBack, initVTGuard } from './navigation.utils'

afterEach(() => {
  delete document.documentElement.dataset.vtDirection
  delete document.documentElement.dataset.vtSkip
  // @ts-expect-error — test-only cleanup of a property we stub per test
  delete document.startViewTransition
  vi.useRealTimers()
})

/** Registers initVTGuard's popstate listener via a spy and returns it as a plain
 *  callable, so tests can simulate history traversal without dispatching a real
 *  popstate event (which would leak a listener onto the shared jsdom window). */
function getPopstateHandler(): () => void {
  const addSpy = vi.spyOn(window, 'addEventListener')
  initVTGuard()
  const calls = addSpy.mock.calls as unknown as [string, () => void, ...unknown[]][]
  const call = calls.find(([type]) => type === 'popstate')
  addSpy.mockRestore()
  if (!call) throw new Error('initVTGuard did not register a popstate listener')
  return call[1]
}

/** Fresh handler with the shared programmaticTraversal flag guaranteed false —
 *  flushes any leftover true state a previous navigateBack test left behind, since
 *  the flag lives in module scope and only a popstate consumes it. */
function freshPopstateHandler(): () => void {
  const handler = getPopstateHandler()
  handler()
  delete document.documentElement.dataset.vtSkip
  return handler
}

describe('navigateBack', () => {
  it('happy: with View Transitions support, sets back direction and clears it once finished', async () => {
    const navigate = vi.fn() as unknown as NavigateFunction
    let finishResolve = () => {}
    const finished = new Promise<void>((resolve) => {
      finishResolve = resolve
    })
    document.startViewTransition = vi.fn((callback?: () => void) => {
      callback?.()
      return {
        finished,
        ready: Promise.resolve(),
        updateCallbackDone: Promise.resolve(),
      } as ViewTransition
    })

    navigateBack(navigate)

    expect(navigate).toHaveBeenCalledWith(-1)
    expect(document.documentElement.dataset.vtDirection).toBe('back')

    finishResolve()
    await finished
    await Promise.resolve() // let the .finally() microtask run
    expect(document.documentElement.dataset.vtDirection).toBeUndefined()
  })

  it('empty: no View Transitions API falls back to plain navigate(-1)', () => {
    const navigate = vi.fn() as unknown as NavigateFunction
    // @ts-expect-error — simulating a browser without the API (property absent)
    delete document.startViewTransition

    navigateBack(navigate)

    expect(navigate).toHaveBeenCalledWith(-1)
    expect(document.documentElement.dataset.vtDirection).toBeUndefined()
  })

  it('boundary: startViewTransition present but falsy value still falls back safely', () => {
    const navigate = vi.fn() as unknown as NavigateFunction
    // @ts-expect-error — some polyfills/older typings may set it to undefined explicitly
    document.startViewTransition = undefined

    navigateBack(navigate)

    expect(navigate).toHaveBeenCalledWith(-1)
    expect(document.documentElement.dataset.vtDirection).toBeUndefined()
  })
})

describe('initVTGuard', () => {
  it('happy: browser-driven traversal sets vt-skip, then clears it after 600ms', () => {
    vi.useFakeTimers()
    const handler = freshPopstateHandler()

    handler()

    expect(document.documentElement.dataset.vtSkip).toBe('1')
    vi.advanceTimersByTime(600)
    expect(document.documentElement.dataset.vtSkip).toBeUndefined()
  })

  it("empty: our own navigateBack()-triggered traversal doesn't set vt-skip", () => {
    const navigate = vi.fn() as unknown as NavigateFunction
    document.startViewTransition = vi.fn((callback?: () => void) => {
      callback?.()
      return {
        finished: Promise.resolve(),
        ready: Promise.resolve(),
        updateCallbackDone: Promise.resolve(),
      } as ViewTransition
    })
    const handler = freshPopstateHandler()

    navigateBack(navigate)
    handler()

    expect(document.documentElement.dataset.vtSkip).toBeUndefined()
  })

  it('boundary: the programmatic-traversal flag is consumed by one popstate, not the next', () => {
    const navigate = vi.fn() as unknown as NavigateFunction
    document.startViewTransition = vi.fn((callback?: () => void) => {
      callback?.()
      return {
        finished: Promise.resolve(),
        ready: Promise.resolve(),
        updateCallbackDone: Promise.resolve(),
      } as ViewTransition
    })
    const handler = freshPopstateHandler()

    navigateBack(navigate)
    handler() // consumes the flag — no vt-skip
    expect(document.documentElement.dataset.vtSkip).toBeUndefined()

    handler() // a second, unrelated traversal — flag is gone, vt-skip applies
    expect(document.documentElement.dataset.vtSkip).toBe('1')
  })
})
