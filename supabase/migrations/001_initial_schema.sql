-- ============================================================
-- SISA Shared Profile — Migration 001
-- Run this in Supabase SQL editor or via Supabase CLI.
--
-- Design decisions:
--   - All RLS policies use is_profile_member() helper to avoid
--     repeated subqueries per row.
--   - join_codes + recovery_codes use SECURITY DEFINER RPCs
--     for operations that need to bypass RLS (validate before join,
--     recover before re-link).
--   - _meta JSONB stores per-field last-write-wins metadata.
--     Format: { "<field>": { "updated_at": ISO8601, "updated_by": UUID } }
--   - SHA-256 hashes are computed on the CLIENT via crypto.subtle,
--     stored as hex strings. No pgcrypto needed.
--   - anonymous_id = auth.uid() for the device's anonymous Supabase session.
-- ============================================================

-- ============================================================
-- 1. PROFILES — one row per household
-- ============================================================
CREATE TABLE profiles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL DEFAULT 'Rumah Kita',
  max_devices INT  NOT NULL DEFAULT 2,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 2. PROFILE_MEMBERS — maps device (anonymous_id) → profile
-- ============================================================
CREATE TABLE profile_members (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  anonymous_id  UUID NOT NULL,   -- = auth.uid() for this device session
  display_name  TEXT NOT NULL DEFAULT 'Pengguna',
  is_primary    BOOL NOT NULL DEFAULT false,
  joined_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(anonymous_id)           -- one device belongs to exactly one profile
);

ALTER TABLE profile_members ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 3. JOIN_CODES — invitation codes, format RUMAH-XXXX
--    Charset: 23456789ABCDEFGHJKLMNPQRSTUVWXYZ (no 0/O, 1/I)
--    Entropy: 32^4 = 1,048,576 combinations; 30-min expiry
-- ============================================================
CREATE TABLE join_codes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  code          TEXT NOT NULL UNIQUE,  -- 'RUMAH-XXXX', uppercase
  created_by    UUID NOT NULL,         -- anonymous_id of the generator
  expires_at    TIMESTAMPTZ NOT NULL,
  is_single_use BOOL NOT NULL DEFAULT true,
  used_at       TIMESTAMPTZ,
  used_by       UUID,                  -- anonymous_id that redeemed
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE join_codes ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 4. RECOVERY_CODES — single-use codes for device recovery
--    Client computes hex(sha256(rawCode)) before sending.
--    Raw code never touches the server.
-- ============================================================
CREATE TABLE recovery_codes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  code_hash   TEXT NOT NULL,           -- hex(sha256(rawCode)), client-computed
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  used_at     TIMESTAMPTZ              -- null = still valid
);

ALTER TABLE recovery_codes ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 5. SHARED FINANCIAL DATA
--    Mirror of Dexie schema on the cloud, scoped per profile.
--    _meta JSONB example:
--      { "name": {"updated_at":"2024-01-01T00:00:00Z","updated_by":"<uuid>"} }
-- ============================================================

CREATE TABLE profile_wallets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name        TEXT         NOT NULL,
  balance     NUMERIC(20,4) NOT NULL DEFAULT 0,
  currency    TEXT         NOT NULL,
  sort_order  INT          NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  _meta       JSONB        NOT NULL DEFAULT '{}'::jsonb
);

ALTER TABLE profile_wallets ENABLE ROW LEVEL SECURITY;

CREATE TABLE profile_tagihan (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name              TEXT         NOT NULL,
  nominal_type      TEXT         NOT NULL,       -- 'tetap' | 'variabel'
  nominal_estimate  NUMERIC(20,4) NOT NULL,
  due_day           INT          NOT NULL,        -- 1–31
  frequency         TEXT         NOT NULL,
  anchor_date       BIGINT       NOT NULL,        -- epoch ms
  currency          TEXT         NOT NULL,
  is_active         BOOL         NOT NULL DEFAULT true,
  last_paid_at      BIGINT,                       -- epoch ms, nullable
  last_paid_amount  NUMERIC(20,4),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  _meta             JSONB        NOT NULL DEFAULT '{}'::jsonb
);

ALTER TABLE profile_tagihan ENABLE ROW LEVEL SECURITY;

CREATE TABLE profile_goals (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name        TEXT         NOT NULL,
  target      NUMERIC(20,4) NOT NULL,
  currency    TEXT         NOT NULL,
  sort_order  INT          NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  _meta       JSONB        NOT NULL DEFAULT '{}'::jsonb
);

ALTER TABLE profile_goals ENABLE ROW LEVEL SECURITY;

CREATE TABLE profile_transactions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  wallet_id        UUID NOT NULL REFERENCES profile_wallets(id) ON DELETE CASCADE,
  amount           NUMERIC(20,4) NOT NULL,
  type             TEXT         NOT NULL,
  currency         TEXT         NOT NULL,
  label            TEXT,
  note             TEXT,
  date             BIGINT       NOT NULL,         -- epoch ms
  tagihan_id       UUID REFERENCES profile_tagihan(id) ON DELETE SET NULL,
  transfer_pair_id UUID,
  is_from_savings  BOOL         NOT NULL DEFAULT false,
  is_earmark       BOOL         NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  _meta            JSONB        NOT NULL DEFAULT '{}'::jsonb
);

ALTER TABLE profile_transactions ENABLE ROW LEVEL SECURITY;

-- Singleton per profile — mirrors Settings in Dexie
CREATE TABLE profile_settings (
  profile_id             UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  income_type            TEXT         NOT NULL DEFAULT 'tetap',
  income_day             INT,
  freelance_min_balance  NUMERIC(20,4),
  primary_currency       TEXT         NOT NULL DEFAULT 'IDR',
  secondary_currency     TEXT,
  income_frequency       TEXT         NOT NULL DEFAULT 'bulanan',
  income_anchor_date     BIGINT,                 -- epoch ms
  weekend_behavior       TEXT,
  _meta                  JSONB        NOT NULL DEFAULT '{}'::jsonb
);

ALTER TABLE profile_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 6. INDEXES
-- ============================================================
CREATE INDEX idx_profile_members_profile_id ON profile_members(profile_id);
CREATE INDEX idx_profile_members_anonymous_id ON profile_members(anonymous_id);
CREATE INDEX idx_join_codes_profile_id ON join_codes(profile_id);
CREATE INDEX idx_join_codes_expires_at ON join_codes(expires_at);
CREATE INDEX idx_recovery_codes_profile_id ON recovery_codes(profile_id);
CREATE INDEX idx_profile_wallets_profile_id ON profile_wallets(profile_id);
CREATE INDEX idx_profile_tagihan_profile_id ON profile_tagihan(profile_id);
CREATE INDEX idx_profile_goals_profile_id ON profile_goals(profile_id);
CREATE INDEX idx_profile_transactions_profile_id ON profile_transactions(profile_id);
CREATE INDEX idx_profile_transactions_wallet_id ON profile_transactions(wallet_id);
CREATE INDEX idx_profile_transactions_date ON profile_transactions(date DESC);

-- ============================================================
-- 7. HELPER FUNCTION
--    is_profile_member(profile_id) — used in RLS policies.
--    SECURITY DEFINER: runs as owner, safe because we only
--    expose a boolean (no data leak).
-- ============================================================
CREATE OR REPLACE FUNCTION is_profile_member(p_profile_id UUID)
RETURNS BOOL
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profile_members
    WHERE profile_id = p_profile_id
      AND anonymous_id = auth.uid()
  );
$$;

-- ============================================================
-- 8. RLS POLICIES
-- ============================================================

-- profiles
CREATE POLICY "profiles_select"
  ON profiles FOR SELECT
  USING (is_profile_member(id));

CREATE POLICY "profiles_update"
  ON profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profile_members
      WHERE profile_id = profiles.id
        AND anonymous_id = auth.uid()
        AND is_primary = true
    )
  );

-- profile_members
CREATE POLICY "profile_members_select"
  ON profile_members FOR SELECT
  USING (is_profile_member(profile_id));

-- Device registers itself — anonymous_id must match caller
CREATE POLICY "profile_members_insert"
  ON profile_members FOR INSERT
  WITH CHECK (anonymous_id = auth.uid());

-- Device can only remove itself
CREATE POLICY "profile_members_delete"
  ON profile_members FOR DELETE
  USING (anonymous_id = auth.uid());

-- join_codes — members can create codes for their profile; members can view their own codes
CREATE POLICY "join_codes_insert"
  ON join_codes FOR INSERT
  WITH CHECK (is_profile_member(profile_id) AND created_by = auth.uid());

CREATE POLICY "join_codes_select"
  ON join_codes FOR SELECT
  USING (is_profile_member(profile_id));

-- recovery_codes — no direct client access; RPCs bypass RLS via SECURITY DEFINER

-- Shared data: full access for profile members
CREATE POLICY "profile_wallets_all"
  ON profile_wallets FOR ALL
  USING (is_profile_member(profile_id));

CREATE POLICY "profile_tagihan_all"
  ON profile_tagihan FOR ALL
  USING (is_profile_member(profile_id));

CREATE POLICY "profile_goals_all"
  ON profile_goals FOR ALL
  USING (is_profile_member(profile_id));

CREATE POLICY "profile_transactions_all"
  ON profile_transactions FOR ALL
  USING (is_profile_member(profile_id));

CREATE POLICY "profile_settings_all"
  ON profile_settings FOR ALL
  USING (is_profile_member(profile_id));

-- ============================================================
-- 9. RPCs (SECURITY DEFINER — bypass RLS for controlled ops)
-- ============================================================

-- 9a. create_profile
--     Called on first "share" action or when user explicitly creates shared profile.
--     p_recovery_code_hash: hex(sha256(rawCode)), computed by client.
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

  INSERT INTO profile_settings (profile_id) VALUES (v_profile_id);

  IF p_recovery_code_hash IS NOT NULL THEN
    INSERT INTO recovery_codes (profile_id, code_hash)
    VALUES (v_profile_id, p_recovery_code_hash);
  END IF;

  RETURN json_build_object('ok', true, 'profile_id', v_profile_id);
END;
$$;

-- 9b. validate_join_code
--     Returns profile preview WITHOUT joining. Used for confirmation screen.
--     Anyone authenticated can call — only leaks profile name (not sensitive).
CREATE OR REPLACE FUNCTION validate_join_code(p_code TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code    join_codes%ROWTYPE;
  v_profile profiles%ROWTYPE;
  v_count   INT;
BEGIN
  SELECT * INTO v_code FROM join_codes WHERE code = UPPER(TRIM(p_code));

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'CODE_NOT_FOUND');
  END IF;

  IF v_code.expires_at < now() THEN
    RETURN json_build_object('error', 'CODE_EXPIRED');
  END IF;

  IF v_code.is_single_use AND v_code.used_at IS NOT NULL THEN
    RETURN json_build_object('error', 'CODE_ALREADY_USED');
  END IF;

  IF EXISTS (SELECT 1 FROM profile_members WHERE anonymous_id = auth.uid()) THEN
    RETURN json_build_object('error', 'ALREADY_IN_PROFILE');
  END IF;

  SELECT * INTO v_profile FROM profiles WHERE id = v_code.profile_id;

  SELECT COUNT(*) INTO v_count FROM profile_members WHERE profile_id = v_code.profile_id;

  IF v_count >= v_profile.max_devices THEN
    RETURN json_build_object('error', 'PROFILE_FULL');
  END IF;

  RETURN json_build_object(
    'ok', true,
    'profile_id', v_code.profile_id,
    'profile_name', v_profile.name
  );
END;
$$;

-- 9c. redeem_join_code
--     Validates + links caller's device to the target profile in one transaction.
--     Joiner's local data is discarded — client is responsible for clearing Dexie
--     before calling this and then pulling shared data.
CREATE OR REPLACE FUNCTION redeem_join_code(
  p_code         TEXT,
  p_display_name TEXT DEFAULT 'Pengguna'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_validate   JSON;
  v_code       join_codes%ROWTYPE;
  v_profile_id UUID;
BEGIN
  v_validate := validate_join_code(p_code);

  IF (v_validate->>'ok') IS NULL THEN
    RETURN v_validate;
  END IF;

  v_profile_id := (v_validate->>'profile_id')::UUID;

  SELECT * INTO v_code FROM join_codes WHERE code = UPPER(TRIM(p_code));

  IF v_code.is_single_use THEN
    UPDATE join_codes
    SET used_at = now(), used_by = auth.uid()
    WHERE id = v_code.id;
  END IF;

  INSERT INTO profile_members (profile_id, anonymous_id, display_name, is_primary)
  VALUES (v_profile_id, auth.uid(), p_display_name, false);

  RETURN json_build_object('ok', true, 'profile_id', v_profile_id);
END;
$$;

-- 9d. recover_profile
--     Re-links a new device to an existing profile using recovery code.
--     p_code_hash: hex(sha256(rawCode)), computed by client.
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
  v_recovery  recovery_codes%ROWTYPE;
  v_profile   profiles%ROWTYPE;
  v_count     INT;
BEGIN
  SELECT * INTO v_recovery
  FROM recovery_codes
  WHERE code_hash = p_code_hash AND used_at IS NULL;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'RECOVERY_CODE_INVALID');
  END IF;

  SELECT * INTO v_profile FROM profiles WHERE id = v_recovery.profile_id;

  SELECT COUNT(*) INTO v_count FROM profile_members WHERE profile_id = v_recovery.profile_id;

  IF v_count >= v_profile.max_devices THEN
    RETURN json_build_object('error', 'PROFILE_FULL');
  END IF;

  UPDATE recovery_codes SET used_at = now() WHERE id = v_recovery.id;

  -- Upsert: device might already be linked (re-linking after clear)
  INSERT INTO profile_members (profile_id, anonymous_id, display_name, is_primary)
  VALUES (v_recovery.profile_id, auth.uid(), p_display_name, false)
  ON CONFLICT (anonymous_id) DO UPDATE
    SET profile_id   = EXCLUDED.profile_id,
        display_name = EXCLUDED.display_name,
        joined_at    = now();

  RETURN json_build_object('ok', true, 'profile_id', v_recovery.profile_id);
END;
$$;

-- ============================================================
-- 10. REALTIME — enable for shared data tables
--     Required for Supabase Realtime subscriptions.
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE profile_wallets;
ALTER PUBLICATION supabase_realtime ADD TABLE profile_tagihan;
ALTER PUBLICATION supabase_realtime ADD TABLE profile_goals;
ALTER PUBLICATION supabase_realtime ADD TABLE profile_transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE profile_settings;
