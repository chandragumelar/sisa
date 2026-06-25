import type { Tagihan, NominalType, TagihanFrequency } from '@/db/database'
import { formatNominalDisplay } from '@/shared/utils/formatNominalInput'
import type { StringKey } from '@/shared/strings/strings'

export interface FormState {
  name: string
  nominalType: NominalType
  nominalEstimate: string
  frequency: TagihanFrequency
  dueDay: string
  fullDate: string
  weekDay: string
  anchorMonth: string
  annualMonth: string
  currency: string
}

export const EMPTY_FORM: FormState = {
  name: '',
  nominalType: 'tetap',
  nominalEstimate: '',
  frequency: 'bulanan',
  dueDay: '',
  fullDate: '',
  weekDay: '1',
  anchorMonth: '',
  annualMonth: '',
  currency: '',
}

export const FREQ_KEYS: TagihanFrequency[] = [
  'sekali',
  'mingguan',
  '2mingguan',
  'bulanan',
  '2bulanan',
  '3bulanan',
  'tahunan',
]

export const FREQ_LABEL: Record<TagihanFrequency, StringKey> = {
  sekali: 'profil.tagihan_freq_sekali',
  mingguan: 'profil.tagihan_freq_mingguan',
  '2mingguan': 'profil.tagihan_freq_2mingguan',
  bulanan: 'profil.tagihan_freq_bulanan',
  '2bulanan': 'profil.tagihan_freq_2bulanan',
  '3bulanan': 'profil.tagihan_freq_3bulanan',
  tahunan: 'profil.tagihan_freq_tahunan',
}

function isoDateStr(ms: number): string {
  const d = new Date(ms)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function toIsoWeekDay(jsDay: number): string {
  // JS: 0=Sun → ISO Sun=7; Mon=1…Sat=6 stay same
  return String(jsDay === 0 ? 7 : jsDay)
}

export function tagihanToForm(tg: Tagihan): FormState {
  const anchor = new Date(tg.anchorDate)
  return {
    name: tg.name,
    nominalType: tg.nominalType,
    nominalEstimate: formatNominalDisplay(String(tg.nominalEstimate)),
    frequency: tg.frequency,
    dueDay: String(tg.dueDay),
    fullDate: tg.frequency === 'sekali' ? isoDateStr(tg.anchorDate) : '',
    weekDay: toIsoWeekDay(anchor.getDay()),
    anchorMonth: String(anchor.getMonth() + 1),
    annualMonth: String(anchor.getMonth() + 1),
    currency: tg.currency,
  }
}

export function computeAnchor(
  form: FormState,
  nowMs: number,
): { anchorDate: number; dueDay: number } {
  const now = new Date(nowMs)

  if (form.frequency === 'sekali') {
    const d = form.fullDate ? new Date(form.fullDate) : now
    return { anchorDate: d.getTime(), dueDay: d.getDate() }
  }

  if (form.frequency === 'mingguan' || form.frequency === '2mingguan') {
    const isoDay = parseInt(form.weekDay, 10) || 1
    // ISO Mon=1…Sun=7 → JS Sun=0, Mon=1…Sat=6
    const jsDay = isoDay === 7 ? 0 : isoDay
    const todayJsDay = now.getDay()
    const diff = (jsDay - todayJsDay + 7) % 7
    const anchor = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diff)
    return { anchorDate: anchor.getTime(), dueDay: 1 }
  }

  if (form.frequency === 'bulanan') {
    const day = parseInt(form.dueDay, 10) || 1
    return { anchorDate: nowMs, dueDay: day }
  }

  if (form.frequency === '2bulanan' || form.frequency === '3bulanan') {
    const day = parseInt(form.dueDay, 10) || 1
    const month = (parseInt(form.anchorMonth, 10) || now.getMonth() + 1) - 1
    const anchor = new Date(now.getFullYear(), month, Math.min(day, 28))
    return { anchorDate: anchor.getTime(), dueDay: day }
  }

  // tahunan
  const day = parseInt(form.dueDay, 10) || 1
  const month = (parseInt(form.annualMonth, 10) || now.getMonth() + 1) - 1
  const anchor = new Date(now.getFullYear(), month, Math.min(day, 28))
  return { anchorDate: anchor.getTime(), dueDay: day }
}
