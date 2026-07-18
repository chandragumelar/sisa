import type { RefObject } from 'react'
import type { TranscriptEntry } from './chatTranscript.types'
import { BotBubble, UserBubble, CardEntry, TypingIndicator } from './ChatBubble'
import styles from './ChatShell.module.css'

interface Props {
  entries: TranscriptEntry[]
  animateFromIndex: number
  showTyping: boolean
  onEntryDone: (id: string) => void
  contentRef?: React.Ref<HTMLDivElement>
  /** Hidden avatar-slot anchor the brand intro measures its landing spot against. */
  leadingAnchorRef?: RefObject<HTMLDivElement>
}

export function ChatTranscript({
  entries,
  animateFromIndex,
  showTyping,
  onEntryDone,
  contentRef,
  leadingAnchorRef,
}: Props) {
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
        <CardEntry
          key={entry.id}
          showAvatar={showAvatar}
          animate={animate}
          onDone={() => onEntryDone(entry.id)}
        >
          {entry.card}
        </CardEntry>
      )
    }
    return (
      <BotBubble
        key={entry.id}
        text={entry.text ?? ''}
        showAvatar={showAvatar}
        animate={animate}
        onDone={() => onEntryDone(entry.id)}
      />
    )
  })

  return (
    <div className={styles.transcriptInner} ref={contentRef}>
      {leadingAnchorRef && (
        <div className={styles.row}>
          <div
            className={styles.avatarSlot}
            ref={leadingAnchorRef}
            style={{ visibility: 'hidden' }}
          />
        </div>
      )}
      {rendered}
      {showTyping && <TypingIndicator />}
    </div>
  )
}
