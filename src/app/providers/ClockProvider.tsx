import { type ReactNode } from 'react'
import type { Clock } from '@/shared/types/clock'
import { SystemClock } from '@/shared/utils/clock'
import { ClockContext } from './ClockContext'

interface ClockProviderProps {
  clock?: Clock
  children: ReactNode
}

export function ClockProvider({ clock = SystemClock, children }: ClockProviderProps) {
  return <ClockContext.Provider value={clock}>{children}</ClockContext.Provider>
}
