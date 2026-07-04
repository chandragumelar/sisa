-- recover_profile: SWAP the primary device instead of adding a new one.
-- Recovery code belongs to the profile creator (primary member). On a new
-- device, we replace the old primary seat rather than consuming a slot, so
-- a non-primary partner (if any) is never touched.
CREATE OR REPLACE FUNCTION recover_profile(
  p_code_hash    TEXT,
  p_display_name TEXT DEFAULT 'Pengguna'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_recovery recovery_codes%ROWTYPE;
BEGIN
  SELECT * INTO v_recovery
  FROM recovery_codes
  WHERE code_hash = p_code_hash AND used_at IS NULL;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'RECOVERY_CODE_INVALID');
  END IF;

  -- Consume the recovery code.
  UPDATE recovery_codes SET used_at = now() WHERE id = v_recovery.id;

  -- Remove the OLD primary device (the phone being replaced), unless the
  -- caller IS already that device. Partner (is_primary = false) untouched.
  DELETE FROM profile_members
  WHERE profile_id = v_recovery.profile_id
    AND is_primary = true
    AND anonymous_id <> auth.uid();

  -- Link this device as the new primary. Upsert handles re-link on same device.
  INSERT INTO profile_members (profile_id, anonymous_id, display_name, is_primary)
  VALUES (v_recovery.profile_id, auth.uid(), p_display_name, true)
  ON CONFLICT (anonymous_id) DO UPDATE
    SET profile_id   = EXCLUDED.profile_id,
        display_name = EXCLUDED.display_name,
        is_primary   = true,
        joined_at    = now();

  RETURN json_build_object('ok', true, 'profile_id', v_recovery.profile_id);
END;
$$;
