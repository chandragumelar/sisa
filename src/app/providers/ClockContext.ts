import { createContext } from 'react'
import type { Clock } from '@/shared/types/clock'
import { SystemClock } from '@/shared/utils/clock'

export const ClockContext = createContext<Clock>(SystemClock)
