-- 008_drop_profile_backup.sql
-- Menghapus sisa skema cloud backup/recovery + sharing (profiles, profile_members,
-- profile_snapshot, recovery_codes) beserta RPC-nya. Fitur ini sudah dicabut dari klien.
--
-- Yang TIDAK disentuh (masih dipakai production):
--   tagihan_reminder, push_subscriptions
--   (dipakai src/lib/supabase/api.ts, src/lib/push.ts, supabase/functions/send-tagihan-push)
--
-- Jalankan MANUAL di Supabase SQL Editor (project: nqhevbnzqqpecvxxyxlx).

-- ============================================================
-- 0. PRE-FLIGHT — jalankan dulu, cek manual sebelum lanjut.
--    Kalau ada baris dengan updated_at recent (mis. dalam 24-48 jam terakhir),
--    tunda eksekusi migration ini — kemungkinan masih ada device aktif pakai backup.
--
--    SELECT count(*), max(updated_at) FROM profile_snapshot;
-- ============================================================

-- 1. Drop RPC (SECURITY DEFINER) — urutan sesuai dependency, is_profile_member paling akhir
--    karena dipakai RLS policy tabel yang di-drop di bawah.
--    Signatures diverifikasi dari 001_initial_schema.sql, 003_regenerate_recovery_code.sql,
--    004_recover_profile_swap.sql:
--      create_profile(p_name TEXT, p_display_name TEXT, p_recovery_code_hash TEXT) → 001 line 276 (redefined 005)
--      recover_profile(p_code_hash TEXT, p_display_name TEXT)                      → 004 line 5 (redefines 001's version, same signature)
--      regenerate_recovery_code(p_recovery_code_hash TEXT)                         → 003 line 3
--      is_profile_member(p_profile_id UUID)                                       → 001 line 188
DROP FUNCTION IF EXISTS public.create_profile(TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.recover_profile(TEXT, TEXT);
DROP FUNCTION IF EXISTS public.regenerate_recovery_code(TEXT);
DROP FUNCTION IF EXISTS public.is_profile_member(UUID);

-- NOTE: validate_join_code + redeem_join_code (RPC join) dan tabel join_codes
-- sudah di-drop di 007_drop_sharing.sql. Jika 007 belum dijalankan, jalankan 007 dulu
-- sebelum migration ini — jangan duplikasi DROP-nya di sini.

-- 2. Drop tabel — urutan aman mengikuti arah FK (child dulu, baru parent):
--    profile_snapshot → profiles
--    recovery_codes   → profiles
--    profile_members  → profiles
--    profiles         (root)
DROP TABLE IF EXISTS public.profile_snapshot CASCADE;
DROP TABLE IF EXISTS public.recovery_codes CASCADE;
DROP TABLE IF EXISTS public.profile_members CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
