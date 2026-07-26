// Maps spending category keys to CSS custom property names.
// Falls back to --viz-cat-lainnya for unknown categories.

const CATEGORY_COLOR_MAP: Record<string, string> = {
  makanan: 'var(--viz-cat-makanan)',
  food: 'var(--viz-cat-makanan)',
  transport: 'var(--viz-cat-transport)',
  transportation: 'var(--viz-cat-transport)',
  belanja: 'var(--viz-cat-belanja)',
  shopping: 'var(--viz-cat-belanja)',
  tagihan: 'var(--viz-cat-tagihan)',
  bills: 'var(--viz-cat-tagihan)',
  hiburan: 'var(--viz-cat-hiburan)',
  entertainment: 'var(--viz-cat-hiburan)',
  kesehatan: 'var(--viz-cat-kesehatan)',
  health: 'var(--viz-cat-kesehatan)',
  investasi: 'var(--viz-cat-investasi)',
  investment: 'var(--viz-cat-investasi)',
}

const FALLBACK = 'var(--viz-cat-lainnya)'

export function getCategoryColor(categoryKey: string): string {
  return CATEGORY_COLOR_MAP[categoryKey.toLowerCase()] ?? FALLBACK
}

// Ordered palette for indexed access (e.g., sankey ribbons by position).
// Use getCategoryColor() when you have a category key.
// Use this array when you only have an index.
export const VIZ_CAT_PALETTE = [
  'var(--viz-cat-makanan)',
  'var(--viz-cat-transport)',
  'var(--viz-cat-belanja)',
  'var(--viz-cat-tagihan)',
  'var(--viz-cat-hiburan)',
  'var(--viz-cat-kesehatan)',
  'var(--viz-cat-investasi)',
  'var(--viz-cat-lainnya)',
]

// Sequential ramp for single-metric bar charts.
// Index 0 = most inactive, index 3 = active/current month.
export const VIZ_SEQ = [
  'var(--viz-seq-1)',
  'var(--viz-seq-2)',
  'var(--viz-seq-3)',
  'var(--viz-seq-4)',
]
