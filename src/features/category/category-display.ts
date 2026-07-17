import type { Language } from '@/db/database'
import type { StringKey } from '@/shared/strings/strings'
import { t } from '@/shared/strings/strings'

// Canonical category names are stored in the DB as Indonesian strings (seeded from
// category.types.ts) — this maps them to a localized display string. User-created
// categories have no entry here and are returned unchanged.
const CANONICAL_NAME_KEYS: Record<string, StringKey> = {
  Makanan: 'cat.name_makanan',
  Transport: 'cat.name_transport',
  Belanja: 'cat.name_belanja',
  Tagihan: 'cat.name_tagihan',
  Hiburan: 'cat.name_hiburan',
  Kesehatan: 'cat.name_kesehatan',
  Pendidikan: 'cat.name_pendidikan',
  Transfer: 'cat.name_transfer',
  Lainnya: 'cat.name_lainnya',
  Gaji: 'cat.name_gaji',
  Bonus: 'cat.name_bonus',
  'Transfer Keluarga': 'cat.name_transfer_keluarga',
  Hadiah: 'cat.name_hadiah',
  'Side Income': 'cat.name_side_income',
  Pacar: 'cat.name_pacar',
}

export function getCategoryDisplayName(name: string, lang: Language): string {
  const key = CANONICAL_NAME_KEYS[name]
  return key ? t(key, lang) : name
}
