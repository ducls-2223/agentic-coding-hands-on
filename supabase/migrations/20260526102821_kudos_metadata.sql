-- Sun* Kudos: metadata for the All-Kudos feed.
--
-- Adds denormalized author display columns + images array to public.kudos,
-- and creates two child tables: kudos_recipients (1:1 today, extensible to 1:N)
-- and kudos_hashtags (composite PK).
--
-- author_id is relaxed to NULLABLE so seed rows can omit it (no auth.users
-- row needed for fake authors). The existing INSERT RLS policy
-- (with check author_id = auth.uid()) still rejects authenticated NULL inserts.

-- 1. Relax FK + add denorm columns + images
alter table public.kudos
  alter column author_id drop not null;

alter table public.kudos
  add column if not exists author_name text,
  add column if not exists author_avatar text,
  add column if not exists author_level text,
  add column if not exists author_badge text,
  add column if not exists images text[];

-- 1a. Tighten INSERT policy: make NOT NULL author_id explicit (was relying on
-- three-valued logic where NULL = auth.uid() yields NULL, not TRUE, which the
-- old policy implicitly used). Self-documenting intent.
drop policy if exists "Authenticated users can insert their own kudos" on public.kudos;
create policy "Authenticated users can insert their own kudos"
  on public.kudos
  for insert
  to authenticated
  with check (author_id is not null and author_id = auth.uid());

-- 2. Recipients (1:1 per kudos today; PK on kudos_id enforces uniqueness)
create table if not exists public.kudos_recipients (
  kudos_id uuid primary key references public.kudos (id) on delete cascade,
  name text not null,
  level text not null,
  badge text not null,
  avatar text
);

alter table public.kudos_recipients enable row level security;

drop policy if exists "Authenticated users can read all kudos recipients" on public.kudos_recipients;
create policy "Authenticated users can read all kudos recipients"
  on public.kudos_recipients
  for select
  to authenticated
  using (true);

-- 3. Hashtags (composite PK; no duplicate tag per kudos)
create table if not exists public.kudos_hashtags (
  kudos_id uuid not null references public.kudos (id) on delete cascade,
  hashtag text not null,
  primary key (kudos_id, hashtag)
);

create index if not exists kudos_hashtags_kudos_id_idx
  on public.kudos_hashtags (kudos_id);

alter table public.kudos_hashtags enable row level security;

drop policy if exists "Authenticated users can read all kudos hashtags" on public.kudos_hashtags;
create policy "Authenticated users can read all kudos hashtags"
  on public.kudos_hashtags
  for select
  to authenticated
  using (true);
