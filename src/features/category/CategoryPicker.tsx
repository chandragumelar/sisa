import { useEffect, useState } from 'react'
import * as Icons from 'lucide-react'
import { Settings } from 'lucide-react'
import type { Category } from '@/db/database'
import { getCategoriesByType } from '@/db/categories.repository'
import { seedDefaultCategoriesIfEmpty } from '@/db/categories.repository'
import { FALLBACK_CATEGORY } from './category.types'
import { getCategoryDisplayName } from './category-display'
import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'
import styles from './CategoryPicker.module.css'

interface Props {
  type: 'expense' | 'income'
  value: string
  onChange: (category: string) => void
  onManage?: () => void
}

function CategoryIcon({ name, size = 13 }: { name: string; size?: number }) {
  const Icon = (
    Icons as unknown as Record<string, React.FC<{ size: number; strokeWidth: number }>>
  )[name]
  if (!Icon) return null
  return <Icon size={size} strokeWidth={1.8} />
}

export function CategoryPicker({ type, value, onChange, onManage }: Props) {
  const lang = useLanguage()
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    seedDefaultCategoriesIfEmpty()
      .then(() => getCategoriesByType(type))
      .then(setCategories)
  }, [type])

  if (categories.length === 0) return null

  return (
    <div className={styles.wrap}>
      <div className={styles.row}>
        <div className={styles.chips}>
          {categories.map((cat) => {
            const active = value === cat.name
            return (
              <button
                key={cat.id ?? cat.name}
                type="button"
                className={`${styles.chip} ${active ? styles.chipActive : ''}`}
                onClick={() => onChange(cat.name)}
              >
                <span className={styles.chipIcon}>
                  <CategoryIcon name={cat.iconName} />
                </span>
                <span className={styles.chipName}>{getCategoryDisplayName(cat.name, lang)}</span>
              </button>
            )
          })}
        </div>
        {onManage && (
          <div className={styles.manageDivider}>
            <button type="button" className={styles.manageBtn} onClick={onManage}>
              <Settings size={12} strokeWidth={1.8} />
              {t('category.manage_btn', lang)}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export { CategoryIcon }
export type { Category }

export function useCategoryName(name: string, type: 'expense' | 'income'): { iconName: string } {
  const [iconName, setIconName] = useState('Tag')
  useEffect(() => {
    getCategoriesByType(type).then((cats) => {
      const found = cats.find((c) => c.name === name)
      setIconName(found?.iconName ?? 'Tag')
    })
  }, [name, type])
  return { iconName }
}

export const FALLBACK = FALLBACK_CATEGORY
