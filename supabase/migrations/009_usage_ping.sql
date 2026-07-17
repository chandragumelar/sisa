-- 009_usage_ping.sql
-- Anonymous daily usage ping — no financial data, no PII. One row per
-- device per day, upserted client-side via sendUsagePing().
--
-- Jalankan MANUAL di Supabase SQL Editor (project: nqhevbnzqqpecvxxyxlx).

CREATE TABLE public.usage_ping (
  anonymous_id      UUID NOT NULL,
  day               DATE NOT NULL,
  app_version       TEXT,
  has_license       BOOLEAN     NOT NULL DEFAULT false,
  is_demo           BOOLEAN     NOT NULL DEFAULT false,
  locale            TEXT,
  theme             TEXT,
  primary_currency  TEXT,
  platform          TEXT,
  tx_count_bucket   TEXT,
  features_used     TEXT[],
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (anonymous_id, day)
);

ALTER TABLE public.usage_ping ENABLE ROW LEVEL SECURITY;

-- Client can only write its own row (anonymous_id = auth.uid()).
-- No SELECT policy — clients cannot read back ping data, only insert/update.
CREATE POLICY "usage_ping_insert"
  ON public.usage_ping FOR INSERT
  WITH CHECK (auth.uid() = anonymous_id);

CREATE POLICY "usage_ping_update"
  ON public.usage_ping FOR UPDATE
  USING (auth.uid() = anonymous_id)
  WITH CHECK (auth.uid() = anonymous_id);

CREATE INDEX idx_usage_ping_day ON public.usage_ping(day);
