-- Player results table for KSOP ranking score engine
-- References players (uuid) and events (uuid) as in existing schema.

create table if not exists public.player_results (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  event_id uuid references public.events(id) on delete set null,
  event_name text not null default '',
  event_date text not null default '',
  position integer not null default 1,
  field_size integer not null default 1,
  buy_in bigint not null default 0,
  earnings bigint default 0,
  created_at timestamptz not null default now()
);

-- Indexes for ranking lookups
create index if not exists idx_player_results_player_id on public.player_results(player_id);
create index if not exists idx_player_results_event_date on public.player_results(event_date);

-- RLS: public SELECT on published ranking/result data
alter table public.player_results enable row level security;

create policy if not exists "public player results select" on public.player_results
  for select to anon, authenticated using (true);

create policy if not exists "no anon insert player results" on public.player_results
  for insert to anon with check (false);

create policy if not exists "no anon update player results" on public.player_results
  for update to anon using (false) with check (false);

create policy if not exists "no anon delete player results" on public.player_results
  for delete to anon using (false);

-- Admin writes only through authenticated admin path; existing admin policies cover it,
-- but we enforce no anon mutations explicitly.
