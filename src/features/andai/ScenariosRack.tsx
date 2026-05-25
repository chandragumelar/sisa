import { useRef, useState } from 'react'
import type { SavedScenario } from '@/db/database'
import { hapticLight } from '@/shared/utils/haptic'
import { useLanguage } from '@/app/providers/useLanguage'
import { t, toLocale } from '@/shared/strings/strings'
import styles from './ScenariosRack.module.css'

interface Props {
  scenarios: SavedScenario[]
  selectedIds: number[]
  onOpen: (scenario: SavedScenario) => void
  onDelete: (id: number) => void
  onToggleCompare: (id: number) => void
  compareMode: boolean
}

const REVEAL_WIDTH = 80

function ScenarioRow({
  scenario,
  selected,
  compareMode,
  onOpen,
  onDelete,
  onToggleCompare,
}: {
  scenario: SavedScenario
  selected: boolean
  compareMode: boolean
  onOpen: () => void
  onDelete: () => void
  onToggleCompare: () => void
}) {
  const lang = useLanguage()
  const [translateX, setTranslateX] = useState(0)
  const [snapped, setSnapped] = useState(false)
  const startX = useRef<number | null>(null)
  const startTranslate = useRef(0)
  const didMove = useRef(false)

  function handlePointerDown(e: React.PointerEvent) {
    startX.current = e.clientX
    startTranslate.current = translateX
    didMove.current = false
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (startX.current === null) return
    const delta = e.clientX - startX.current
    if (Math.abs(delta) > 5) didMove.current = true
    const raw = startTranslate.current + delta
    const clamped = Math.min(0, Math.max(-REVEAL_WIDTH, raw))
    setTranslateX(clamped)
  }

  function handlePointerUp() {
    if (startX.current === null) return
    startX.current = null
    if (translateX < -REVEAL_WIDTH / 2) {
      setTranslateX(-REVEAL_WIDTH)
      setSnapped(true)
      hapticLight()
    } else {
      setTranslateX(0)
      setSnapped(false)
    }
  }

  function handleRowClick() {
    if (didMove.current) return
    if (snapped) {
      setTranslateX(0)
      setSnapped(false)
      return
    }
    if (compareMode) {
      onToggleCompare()
    } else {
      onOpen()
    }
  }

  const savedDate = new Date(scenario.savedAt).toLocaleDateString(toLocale(lang), {
    day: 'numeric',
    month: 'short',
  })

  return (
    <div className={styles.rowWrapper}>
      <button
        className={styles.deleteReveal}
        onClick={onDelete}
        aria-label={t('andai.scenarios_delete_aria', lang)}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14H6L5 6" />
          <path d="M10 11v6M14 11v6" />
          <path d="M9 6V4h6v2" />
        </svg>
        {t('andai.scenarios_delete_label', lang)}
      </button>

      <div
        className={selected ? `${styles.row} ${styles.rowSelected}` : styles.row}
        style={{
          transform: `translateX(${translateX}px)`,
          transition: startX.current === null ? 'transform 0.2s ease-out' : 'none',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={handleRowClick}
      >
        <div className={styles.rowLeft}>
          {compareMode && <div className={selected ? styles.checkboxOn : styles.checkboxOff} />}
          <div className={styles.rowInfo}>
            <span className={styles.rowName}>{scenario.name}</span>
            <span className={styles.rowDate}>{savedDate}</span>
          </div>
        </div>
        <span className={styles.rowChev}>›</span>
      </div>
    </div>
  )
}

export function ScenariosRack({
  scenarios,
  selectedIds,
  onOpen,
  onDelete,
  onToggleCompare,
  compareMode,
}: Props) {
  const lang = useLanguage()
  if (scenarios.length === 0) return null

  return (
    <div className={styles.rack}>
      <div className={styles.rackLabel}>{t('andai.scenarios_label', lang)}</div>
      {scenarios.map((s) => (
        <ScenarioRow
          key={s.id}
          scenario={s}
          selected={selectedIds.includes(s.id!)}
          compareMode={compareMode}
          onOpen={() => onOpen(s)}
          onDelete={() => onDelete(s.id!)}
          onToggleCompare={() => onToggleCompare(s.id!)}
        />
      ))}
    </div>
  )
}
