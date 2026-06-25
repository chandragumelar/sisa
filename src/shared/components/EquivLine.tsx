import { useEffect, useState } from 'react'
import { useLanguage } from '@/app/providers/useLanguage'
import { t } from '@/shared/strings/strings'
import { formatCurrency } from '@/shared/utils/formatCurrency'
import { convert, getRateAsOf, formatRateDate } from '@/shared/utils/fx'
import styles from './EquivLine.module.css'

interface Props {
  amount: number
  currency: string
  primaryCurrency: string
}

export function EquivLine({ amount, currency, primaryCurrency }: Props) {
  const lang = useLanguage()
  const [equiv, setEquiv] = useState<number | null>(null)
  const [dateStr, setDateStr] = useState<string | null>(null)

  useEffect(() => {
    if (currency === primaryCurrency || amount <= 0) {
      setEquiv(null)
      setDateStr(null)
      return
    }
    let cancelled = false
    void Promise.all([
      convert(amount, currency, primaryCurrency),
      getRateAsOf(primaryCurrency, currency),
    ]).then(([converted, record]) => {
      if (cancelled) return
      setEquiv(converted)
      setDateStr(record ? formatRateDate(record.fetchedAt) : null)
    })
    return () => {
      cancelled = true
    }
  }, [amount, currency, primaryCurrency])

  if (currency === primaryCurrency || amount <= 0 || equiv === null || dateStr === null) return null

  return (
    <div className={styles.line}>
      {t('equiv.approx', lang)
        .replace('{equiv}', formatCurrency(equiv, primaryCurrency))
        .replace('{date}', dateStr)}
    </div>
  )
}
