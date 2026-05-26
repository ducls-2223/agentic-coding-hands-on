-- Sun* Kudos: minimal persistence for the write-kudos dialog.
--
-- Columns: id (uuid pk), author_id (FK auth.users, cascade on delete),
-- content (1..5000 chars), created_at (timestamptz default now).
--
-- RLS: any authenticated user can INSERT their own rows; any authenticated
-- user can SELECT all rows. Anonymous users get nothing.

create extension if not exists "pgcrypto";

create table if not exists public.kudos (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users (id) on delete cascade,
  content text not null check (
    char_length(content) > 0 and char_length(content) <= 5000
  ),
  created_at timestamptz not null default now()
);

create index if not exists kudos_created_at_desc_idx
  on public.kudos (created_at desc);

create index if not exists kudos_author_id_idx
  on public.kudos (author_id);

alter table public.kudos enable row level security;

drop policy if exists "Authenticated users can read all kudos" on public.kudos;
create policy "Authenticated users can read all kudos"
  on public.kudos
  for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can insert their own kudos" on public.kudos;
create policy "Authenticated users can insert their own kudos"
  on public.kudos
  for insert
  to authenticated
  with check (author_id = auth.uid());
