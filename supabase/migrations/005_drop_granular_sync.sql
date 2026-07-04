-- 005: drop granular per-table sync (pivot to snapshot model)
-- Run manually in Supabase SQL Editor.
-- NOTE: create_profile RPC in 001 has INSERT INTO profile_settings — that INSERT
-- will error once profile_settings is dropped. The replacement function below
-- is identical to 001 minus that line. Deploy this migration BEFORE any new
-- device calls create_profile, or existing users will see ALREADY_IN_PROFILE.

-- Drop granular sync tables
DROP TABLE IF EXISTS profile_transactions CASCADE;
DROP TABLE IF EXISTS profile_settings CASCADE;
DROP TABLE IF EXISTS profile_goals CASCADE;
DROP TABLE IF EXISTS profile_tagihan CASCADE;
DROP TABLE IF EXISTS profile_wallets CASCADE;

-- Replace create_profile to remove the now-dropped profile_settings INSERT
CREATE OR REPLACE FUNCTION create_profile(
  p_name               TEXT DEFAULT 'Rumah Kita',
  p_display_name       TEXT DEFAULT 'Pengguna',
  p_recovery_code_hash TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile_id UUID;
BEGIN
  IF EXISTS (SELECT 1 FROM profile_members WHERE anonymous_id = auth.uid()) THEN
    RETURN json_build_object('error', 'ALREADY_IN_PROFILE');
  END IF;

  INSERT INTO profiles (name) VALUES (p_name) RETURNING id INTO v_profile_id;

  INSERT INTO profile_members (profile_id, anonymous_id, display_name, is_primary)
  VALUES (v_profile_id, auth.uid(), p_display_name, true);

  IF p_recovery_code_hash IS NOT NULL THEN
    INSERT INTO recovery_codes (profile_id, code_hash)
    VALUES (v_profile_id, p_recovery_code_hash);
  END IF;

  RETURN json_build_object('ok', true, 'profile_id', v_profile_id);
END;
$$;
