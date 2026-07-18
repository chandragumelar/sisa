import type { ReactNode } from 'react'

export interface TranscriptEntry {
  id: string
  role: 'bot' | 'user'
  text?: string
  card?: ReactNode
}
