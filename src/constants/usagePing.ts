export const LAST_PING_STORAGE_KEY = 'sisa_last_ping'
export const FEATURES_USED_STORAGE_KEY = 'sisa_features_used'

export type FeatureUsed = 'cek_dulu' | 'andai' | 'tagihan' | 'insight' | 'multi_wallet'

// tx_count_bucket boundaries — inclusive upper bounds for each non-terminal bucket
export const TX_BUCKET_SMALL_MAX = 10
export const TX_BUCKET_MEDIUM_MAX = 50
export const TX_BUCKET_LARGE_MAX = 200
