/** Formats a raw digit string to Indonesian thousand-separated display ("2000000" → "2.000.000") */
export function formatNominalDisplay(raw: string): string {
  if (!raw) return ''
  const digits = raw.replace(/\D/g, '')
  if (!digits) return ''
  return Number(digits).toLocaleString('id-ID')
}

/** Strips thousand separators from a display value to get raw digits ("2.000.000" → "2000000") */
export function parseNominalRaw(display: string): string {
  return display.replace(/\./g, '').replace(/\D/g, '')
}
