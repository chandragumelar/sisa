-- ============================================================
-- SISA — Migration 002: tagihan_reminder + push_subscriptions
-- Supports server-side push reminder for tagihan jatuh tempo.
-- ============================================================

-- Tagihan reminder: minimal mirror dari Dexie tagihan, keyed by anonymous_id
create table if not exists public.tagihan_reminder (
  anonymous_id         uuid        not null default auth.uid(),
  tagihan_local_id     int         not null,        -- Dexie tagihan.id
  name                 text        not null,
  due_day              int         not null,         -- 1..31
  frequency            text        not null,
  anchor_date          bigint      not null,         -- epoch ms
  last_paid_at         bigint,                       -- epoch ms, null = belum dibayar
  is_active            boolean     not null default true,
  last_notified_period text,                         -- "YYYY-MM" period terakhir di-push; null = belum pernah
  updated_at           timestamptz not null default now(),
  primary key (anonymous_id, tagihan_local_id)
);

alter table public.tagihan_reminder enable row level security;

create policy "own rows" on public.tagihan_reminder
  for all
  using (anonymous_id = auth.uid())
  with check (anonymous_id = auth.uid());

create index on public.tagihan_reminder (due_day) where is_active = true;

-- Push subscription (Web Push)
create table if not exists public.push_subscriptions (
  anonymous_id uuid        not null default auth.uid(),
  endpoint     text        not null,
  subscription jsonb       not null,                -- full PushSubscription JSON
  created_at   timestamptz not null default now(),
  primary key (anonymous_id, endpoint)
);

alter table public.push_subscriptions enable row level security;

create policy "own subs" on public.push_subscriptions
  for all
  using (anonymous_id = auth.uid())
  with check (anonymous_id = auth.uid());
