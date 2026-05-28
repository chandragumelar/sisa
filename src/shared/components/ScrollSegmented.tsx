import styles from './ScrollSegmented.module.css'

interface Item<T extends string> {
  value: T
  label: string
}

interface Props<T extends string> {
  items: Item<T>[]
  value: T
  onChange: (v: T) => void
}

export function ScrollSegmented<T extends string>({ items, value, onChange }: Props<T>) {
  return (
    <div className={styles.track}>
      {items.map((item) => (
        <button
          key={item.value}
          className={`${styles.pill} ${item.value === value ? styles.pillActive : ''}`}
          onClick={() => onChange(item.value)}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}
