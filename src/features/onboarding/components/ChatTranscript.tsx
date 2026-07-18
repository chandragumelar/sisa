import type { TranscriptEntry } from './chatTranscript.types'
import { BotBubble, UserBubble, CardEntry, TypingIndicator } from './ChatBubble'
import styles from './ChatShell.module.css'

interface Props {
  entries: TranscriptEntry[]
  animateFromIndex: number
  showTyping: boolean
}

export function ChatTranscript({ entries, animateFromIndex, showTyping }: Props) {
  let lastRole: 'bot' | 'user' | null = null

  const rendered = entries.map((entry, index) => {
    const animate = index >= animateFromIndex
    const showAvatar = entry.role === 'bot' && lastRole !== 'bot'
    lastRole = entry.role

    if (entry.role === 'user') {
      return <UserBubble key={entry.id} text={entry.text ?? ''} />
    }
    if (entry.card) {
      return (
        <CardEntry key={entry.id} showAvatar={showAvatar} animate={animate}>
          {entry.card}
        </CardEntry>
      )
    }
    return (
      <BotBubble key={entry.id} text={entry.text ?? ''} showAvatar={showAvatar} animate={animate} />
    )
  })

  return (
    <div className={styles.transcriptInner}>
      {rendered}
      {showTyping && <TypingIndicator />}
    </div>
  )
}
