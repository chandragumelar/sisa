import { useState } from 'react'
import { BottomSheet } from '@/shared/components/BottomSheet'
import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'
import styles from './SaveScenarioSheet.module.css'

interface Props {
  isOpen: boolean
  onClose: () => void
  suggestedName: string
  onSave: (name: string) => void
}

export function SaveScenarioSheet({ isOpen, onClose, suggestedName, onSave }: Props) {
  const lang = useLanguage()
  const [name, setName] = useState(suggestedName)

  function handleSave() {
    const trimmed = name.trim()
    if (!trimmed) return
    onSave(trimmed)
    onClose()
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={t('andai.save_sheet_title', lang)}>
      <div className={styles.body}>
        <div className={styles.label}>{t('andai.save_sheet_label', lang)}</div>
        <input
          className={styles.input}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('andai.save_sheet_placeholder', lang)}
          autoFocus={isOpen}
        />
        <button className={styles.saveBtn} onClick={handleSave} disabled={!name.trim()}>
          {t('andai.save_sheet_submit', lang)}
        </button>
      </div>
    </BottomSheet>
  )
}
