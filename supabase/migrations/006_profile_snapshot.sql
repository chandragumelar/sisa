-- 006: single-row snapshot per profile (backup-restore model)
-- Run manually in Supabase SQL Editor.
CREATE TABLE profile_snapshot (
  profile_id  UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  data        JSONB       NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by  UUID        NOT NULL
);
ALTER TABLE profile_snapshot ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profile_snapshot_all" ON profile_snapshot FOR ALL
  USING (is_profile_member(profile_id));
