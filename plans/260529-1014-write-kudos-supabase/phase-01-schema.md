# Phase 01 — DB Schema + Storage

## Goal
Add the persistence surface needed by all later phases: `sunners` lookup table with seed, three new `kudos` columns, and a Storage bucket for images.

## Migration file
- `supabase/migrations/20260529101400_write_kudos_schema.sql`

## Schema deltas
```sql
-- 1. Sunners directory (recipient autocomplete source of truth).
create table if not exists public.sunners (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  level       text not null,
  badge       text not null,
  avatar      text,
  department  text,
  created_at  timestamptz not null default now()
);
create index sunners_name_idx on public.sunners (name);
alter table public.sunners enable row level security;
create policy "auth read sunners" on public.sunners
  for select to authenticated using (true);
-- Seed: copy the 7 names previously hard-coded in RecipientAutocomplete + match
-- existing kudos_recipients seed by name to keep the feed consistent.

-- 2. Kudos delta columns.
alter table public.kudos
  add column if not exists honor_title    text,
  add column if not exists is_anonymous   boolean not null default false,
  add column if not exists anonymous_name text;

-- 3. Tighten kudos_recipients to optionally link the sunner row by id.
alter table public.kudos_recipients
  add column if not exists sunner_id uuid references public.sunners(id);
```

## Storage bucket
Create bucket `kudos-images` (public read, authenticated insert). Done via `supabase/config.toml` `[storage.buckets.kudos-images]` block AND a one-time migration that uses `storage.create_bucket` / RLS policies on `storage.objects`.

## Files
- New: `supabase/migrations/20260529101400_write_kudos_schema.sql`
- New: `supabase/seeds/common/02_sunners.sql` (8 demo rows matching kudos_recipients seed names)
- Modified: `supabase/config.toml` — add the bucket block if needed

## Acceptance
- `supabase migration up` applies cleanly.
- `select * from public.sunners limit 1` returns a row.
- Storage bucket `kudos-images` exists and is readable from a browser.

## Result
**Status:** Completed. Migration `20260529101400_write_kudos_schema.sql` applied cleanly. Sunners table seeded with 8 demo rows. Storage bucket `kudos-images` configured with public read + authenticated write RLS. All columns added to `kudos` table (honor_title, is_anonymous, anonymous_name). Foreign key `sunner_id` added to `kudos_recipients`.
