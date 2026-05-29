-- Write-Kudos feature: schema additions for full-fidelity persistence.
--
-- Adds:
--   1. `sunners` directory table (recipient autocomplete source of truth)
--   2. `kudos.honor_title` (Vi: "Danh hiệu"), `kudos.is_anonymous`,
--      `kudos.anonymous_name` columns
--   3. `kudos_recipients.sunner_id` FK (optional link to a sunner row)
--
-- RLS: authenticated users can SELECT from sunners. The existing kudos +
-- kudos_recipients + kudos_hashtags policies already gate inserts/reads.

-- 1. Sunners directory
create table if not exists public.sunners (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  level       text not null,
  badge       text not null,
  avatar      text,
  department  text,
  created_at  timestamptz not null default now()
);

create index if not exists sunners_name_idx on public.sunners (name);

alter table public.sunners enable row level security;

drop policy if exists "Authenticated users can read sunners" on public.sunners;
create policy "Authenticated users can read sunners"
  on public.sunners
  for select
  to authenticated
  using (true);

-- 2. Kudos: new write-kudos columns
alter table public.kudos
  add column if not exists honor_title    text,
  add column if not exists is_anonymous   boolean not null default false,
  add column if not exists anonymous_name text;

-- 3. Recipients: optional link to a sunner row (preserves denorm fields)
alter table public.kudos_recipients
  add column if not exists sunner_id uuid references public.sunners (id) on delete set null;

create index if not exists kudos_recipients_sunner_id_idx
  on public.kudos_recipients (sunner_id);
