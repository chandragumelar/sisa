-- Regenerate recovery code: invalidate all existing codes for the caller's
-- profile, then insert a fresh one. Caller must be a member of the profile.
CREATE OR REPLACE FUNCTION regenerate_recovery_code(
  p_recovery_code_hash TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile_id UUID;
BEGIN
  SELECT profile_id INTO v_profile_id
  FROM profile_members
  WHERE anonymous_id = auth.uid();

  IF v_profile_id IS NULL THEN
    RETURN json_build_object('error', 'NOT_IN_PROFILE');
  END IF;

  UPDATE recovery_codes
  SET used_at = now()
  WHERE profile_id = v_profile_id AND used_at IS NULL;

  INSERT INTO recovery_codes (profile_id, code_hash)
  VALUES (v_profile_id, p_recovery_code_hash);

  RETURN json_build_object('ok', true);
END;
$$;
