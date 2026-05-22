import { useState } from 'react'
import { BottomSheet } from '@/shared/components/BottomSheet'
import styles from './SaveScenarioSheet.module.css'

interface Props {
  isOpen: boolean
  onClose: () => void
  suggestedName: string
  onSave: (name: string) => void
}

export function SaveScenarioSheet({ isOpen, onClose, suggestedName, onSave }: Props) {
  const [name, setName] = useState(suggestedName)

  function handleSave() {
    const trimmed = name.trim()
    if (!trimmed) return
    onSave(trimmed)
    onClose()
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Simpan skenario">
      <div className={styles.body}>
        <div className={styles.label}>Nama skenario</div>
        <input
          className={styles.input}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. beli motor + freelance"
          autoFocus={isOpen}
        />
        <button className={styles.saveBtn} onClick={handleSave} disabled={!name.trim()}>
          Simpan
        </button>
      </div>
    </BottomSheet>
  )
}
