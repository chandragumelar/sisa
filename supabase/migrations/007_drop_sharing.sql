-- 007_drop_sharing.sql
-- Menghapus skema eksklusif fitur "Berbagi dengan Pasangan" (join via kode undangan).
--
-- Yang TIDAK disentuh (backup/restore solo tetap berfungsi):
--   profile_members, profiles, recovery_codes, profile_snapshot,
--   is_profile_member, create_profile, recover_profile,
--   regenerate_recovery_code — TIDAK di-DROP/ALTER.
--
-- Jalankan MANUAL di Supabase SQL Editor (project: nqhevbnzqqpecvxxyxlx).

-- 1. Drop RPC join (SECURITY DEFINER)
--    Signatures diverifikasi dari 001_initial_schema.sql:
--      validate_join_code(p_code TEXT)   → line 312
--      redeem_join_code(p_code TEXT, p_display_name TEXT)  → line 361
DROP FUNCTION IF EXISTS public.validate_join_code(TEXT);
DROP FUNCTION IF EXISTS public.redeem_join_code(TEXT, TEXT);

-- 2. Drop tabel join_codes
--    CASCADE menghapus RLS policies & index secara otomatis.
--    Tidak ada FK dari tabel lain ke join_codes selain profile_id → profiles (satu arah).
DROP TABLE IF EXISTS public.join_codes CASCADE;
