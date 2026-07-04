/** djb2 hash of a JSON string — fast, sync, adequate for dedup skip-guard. */
export function snapshotHash(json: string): string {
  let h = 5381
  for (let i = 0; i < json.length; i++) {
    h = ((h << 5) + h + json.charCodeAt(i)) >>> 0
  }
  return h.toString(36)
}

export function snapshotHashKey(profileId: string): string {
  return `sisa_snapshot_hash:${profileId}`
}
