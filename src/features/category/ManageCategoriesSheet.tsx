import { useEffect, useState } from 'react'
import * as Icons from 'lucide-react'
import { Trash2, Edit2, Plus, Check, X } from 'lucide-react'
import type { Category } from '@/db/database'
import {
  getCategoriesByType,
  addCategory,
  updateCategory,
  deleteCategory,
  seedDefaultCategoriesIfEmpty,
} from '@/db/categories.repository'
import { BottomSheet } from '@/shared/components/BottomSheet'
import { FALLBACK_CATEGORY, ICON_PICKER_OPTIONS } from './category.types'
import styles from './ManageCategoriesSheet.module.css'

interface Props {
  isOpen: boolean
  onClose: () => void
}

type TabType = 'expense' | 'income'

function CategoryIcon({ name, size = 15 }: { name: string; size?: number }) {
  const Icon = (
    Icons as unknown as Record<string, React.FC<{ size: number; strokeWidth: number }>>
  )[name]
  if (!Icon) return null
  return <Icon size={size} strokeWidth={1.8} />
}

function IconPicker({ value, onChange }: { value: string; onChange: (name: string) => void }) {
  return (
    <div className={styles.iconGrid}>
      {ICON_PICKER_OPTIONS.map((name) => (
        <button
          key={name}
          type="button"
          className={`${styles.iconOption} ${value === name ? styles.iconOptionActive : ''}`}
          onClick={() => onChange(name)}
          aria-label={name}
        >
          <CategoryIcon name={name} size={17} />
        </button>
      ))}
    </div>
  )
}

export function ManageCategoriesSheet({ isOpen, onClose }: Props) {
  const [tab, setTab] = useState<TabType>('expense')
  const [categories, setCategories] = useState<Category[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editIcon, setEditIcon] = useState('Tag')
  const [addingNew, setAddingNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [newIcon, setNewIcon] = useState('Tag')
  const [deletingId, setDeletingId] = useState<number | null>(null)

  async function reload() {
    await seedDefaultCategoriesIfEmpty()
    const cats = await getCategoriesByType(tab)
    setCategories(cats)
  }

  useEffect(() => {
    if (!isOpen) return
    setEditingId(null)
    setAddingNew(false)
    reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, tab])

  function startEdit(cat: Category) {
    setEditingId(cat.id!)
    setEditName(cat.name)
    setEditIcon(cat.iconName)
    setAddingNew(false)
  }

  async function saveEdit() {
    if (!editName.trim() || editingId === null) return
    await updateCategory(editingId, { name: editName.trim(), iconName: editIcon })
    setEditingId(null)
    reload()
  }

  function cancelEdit() {
    setEditingId(null)
  }

  function startAdd() {
    setAddingNew(true)
    setNewName('')
    setNewIcon('Tag')
    setEditingId(null)
  }

  async function saveNew() {
    if (!newName.trim()) return
    await addCategory({ name: newName.trim(), type: tab, iconName: newIcon })
    setAddingNew(false)
    reload()
  }

  function cancelAdd() {
    setAddingNew(false)
  }

  async function confirmDelete(id: number) {
    await deleteCategory(id)
    setDeletingId(null)
    reload()
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Kelola Kategori">
      {/* Tab toggle */}
      <div className={styles.tabRow}>
        {(['expense', 'income'] as TabType[]).map((t) => (
          <button
            key={t}
            className={`${styles.tabBtn} ${tab === t ? styles.tabBtnActive : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
          </button>
        ))}
      </div>

      <div className={styles.list}>
        {categories.map((cat) => {
          const isLainnya = cat.name === FALLBACK_CATEGORY
          const isEditing = editingId === cat.id
          const isDeleting = deletingId === cat.id

          if (isEditing) {
            return (
              <div key={cat.id} className={styles.editRow}>
                <input
                  className={styles.editInput}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  autoFocus
                />
                <IconPicker value={editIcon} onChange={setEditIcon} />
                <div className={styles.editActions}>
                  <button className={styles.iconBtn} onClick={saveEdit} aria-label="Simpan">
                    <Check size={14} strokeWidth={2} />
                  </button>
                  <button className={styles.iconBtn} onClick={cancelEdit} aria-label="Batal">
                    <X size={14} strokeWidth={2} />
                  </button>
                </div>
              </div>
            )
          }

          if (isDeleting) {
            return (
              <div key={cat.id} className={styles.deleteConfirmRow}>
                <span className={styles.deleteMsg}>
                  Hapus "{cat.name}"? Transaksi lama jadi Lainnya.
                </span>
                <div className={styles.editActions}>
                  <button
                    className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
                    onClick={() => confirmDelete(cat.id!)}
                    aria-label="Hapus"
                  >
                    <Trash2 size={14} strokeWidth={2} />
                  </button>
                  <button
                    className={styles.iconBtn}
                    onClick={() => setDeletingId(null)}
                    aria-label="Batal"
                  >
                    <X size={14} strokeWidth={2} />
                  </button>
                </div>
              </div>
            )
          }

          return (
            <div key={cat.id} className={styles.catRow}>
              <span className={styles.catIcon}>
                <CategoryIcon name={cat.iconName} />
              </span>
              <span className={styles.catName}>{cat.name}</span>
              {!isLainnya && (
                <div className={styles.catActions}>
                  <button
                    className={styles.iconBtn}
                    onClick={() => startEdit(cat)}
                    aria-label={`Edit ${cat.name}`}
                  >
                    <Edit2 size={14} strokeWidth={1.8} />
                  </button>
                  <button
                    className={styles.iconBtn}
                    onClick={() => setDeletingId(cat.id!)}
                    aria-label={`Hapus ${cat.name}`}
                  >
                    <Trash2 size={14} strokeWidth={1.8} />
                  </button>
                </div>
              )}
            </div>
          )
        })}

        {addingNew && (
          <div className={styles.editRow}>
            <input
              className={styles.editInput}
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nama kategori baru"
              autoFocus
            />
            <IconPicker value={newIcon} onChange={setNewIcon} />
            <div className={styles.editActions}>
              <button className={styles.iconBtn} onClick={saveNew} aria-label="Simpan">
                <Check size={14} strokeWidth={2} />
              </button>
              <button className={styles.iconBtn} onClick={cancelAdd} aria-label="Batal">
                <X size={14} strokeWidth={2} />
              </button>
            </div>
          </div>
        )}
      </div>

      {!addingNew && !editingId && (
        <button className={styles.addBtn} onClick={startAdd}>
          <Plus size={13} strokeWidth={2} />
          Tambah kategori
        </button>
      )}
    </BottomSheet>
  )
}
