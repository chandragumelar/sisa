import { useCallback, useEffect, useState } from 'react'
import { useClock } from '@/app/providers/useClock'

const REFRESH_INTERVAL_MS = 60_000

export function useNow(): { nowMs: number; refresh: () => void } {
  const clock = useClock()
  const [nowMs, setNowMs] = useState(() => clock.now())

  const refresh = useCallback(() => setNowMs(clock.now()), [clock])

  useEffect(() => {
    const id = setInterval(() => setNowMs(clock.now()), REFRESH_INTERVAL_MS)
    return () => clearInterval(id)
  }, [clock])

  return { nowMs, refresh }
}
