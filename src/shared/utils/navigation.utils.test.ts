import { describe, it, expect, vi, afterEach } from 'vitest'
import type { NavigateFunction } from 'react-router-dom'
import { navigateBack } from './navigation.utils'

afterEach(() => {
  delete document.documentElement.dataset.vtDirection
  // @ts-expect-error — test-only cleanup of a property we stub per test
  delete document.startViewTransition
})

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
