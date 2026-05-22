import { useContext } from 'react'
import { ClockContext } from './ClockContext'

export function useClock() {
  return useContext(ClockContext)
}
