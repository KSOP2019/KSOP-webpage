-- KSOP CMS database setup
-- Run once in Supabase SQL Editor. Create the first Auth user in the dashboard,
-- then add that user's UUID to admin_users at the bottom of this file.

create extension if not exists pgcrypto;

create type public.publish_status as enum ('draft','published','archived');

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'editor' check (role in ('owner','manager','editor','reviewer','viewer')),
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.admin_users where user_id=auth.uid()) $$;

create table public.site_settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

create table public.series (
  id uuid primary key default gen_random_uuid(), slug text unique not null,
  title text not null, subtitle text default '', description text default '',
  poster_url text default '', mobile_poster_url text default '', venue_name text default '',
  venue_address text default '', map_url text default '', starts_at timestamptz not null,
  ends_at timestamptz not null, guarantee bigint not null default 0,
  currency text not null default 'KRW', registration_status text not null default 'COMING SOON',
  notice text default '', document_url text default '', status publish_status not null default 'draft',
  sort_order integer not null default 0, created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(), updated_by uuid references auth.users(id)
);

create table public.events (
  id uuid primary key default gen_random_uuid(), slug text unique not null,
  series_id uuid references public.series(id) on delete set null, event_number integer not null default 0,
  title text not null, category text not null default 'NLH', game_type text default 'NLH',
  entry_type text not null default 'OPEN', starts_at timestamptz not null,
  buy_in bigint not null default 0, fee bigint not null default 0, guarantee bigint not null default 0,
  starting_stack integer not null default 0, level_minutes integer not null default 0,
  late_registration text default '', reentry text default '', description text default '',
  structure_url text default '', registration_url text default '', event_status text not null default 'SCHEDULED',
  status publish_status not null default 'draft', sort_order integer not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

create table public.players (
  id uuid primary key default gen_random_uuid(), slug text unique not null, name text not null,
  display_name text default '', country text default 'KR', portrait_url text default '',
  rank integer not null default 0, points integer not null default 0, earnings bigint not null default 0,
  titles integer not null default 0, final_tables integer not null default 0, bio text default '',
  status publish_status not null default 'draft', sort_order integer not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

create table public.articles (
  id uuid primary key default gen_random_uuid(), slug text unique not null, category text default 'ANNOUNCEMENT',
  title text not null, excerpt text default '', body text default '', cover_url text default '',
  author text default 'KSOP EDITORIAL', published_at timestamptz not null default now(),
  status publish_status not null default 'draft', sort_order integer not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

create table public.about_pages (
  id uuid primary key default gen_random_uuid(), slug text unique not null, title text not null,
  eyebrow text default '', excerpt text default '', body text default '', cover_url text default '',
  status publish_status not null default 'draft', sort_order integer not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

create table public.audit_logs (
  id bigint generated always as identity primary key, table_name text not null,
  record_id text not null, action text not null, old_data jsonb, new_data jsonb,
  user_id uuid, created_at timestamptz not null default now()
);

create or replace function public.touch_and_audit()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if tg_op='DELETE' then
    insert into audit_logs(table_name,record_id,action,old_data,user_id)
    values(tg_table_name,old.id::text,tg_op,to_jsonb(old),auth.uid()); return old;
  end if;
  new.updated_at=now(); new.updated_by=auth.uid();
  insert into audit_logs(table_name,record_id,action,old_data,new_data,user_id)
  values(tg_table_name,new.id::text,tg_op,case when tg_op='UPDATE' then to_jsonb(old) end,to_jsonb(new),auth.uid());
  return new;
end $$;

create trigger series_audit before insert or update or delete on public.series for each row execute function public.touch_and_audit();
create trigger events_audit before insert or update or delete on public.events for each row execute function public.touch_and_audit();
create trigger players_audit before insert or update or delete on public.players for each row execute function public.touch_and_audit();
create trigger articles_audit before insert or update or delete on public.articles for each row execute function public.touch_and_audit();
create trigger about_audit before insert or update or delete on public.about_pages for each row execute function public.touch_and_audit();

alter table public.admin_users enable row level security;
alter table public.site_settings enable row level security;
alter table public.series enable row level security;
alter table public.events enable row level security;
alter table public.players enable row level security;
alter table public.articles enable row level security;
alter table public.about_pages enable row level security;
alter table public.audit_logs enable row level security;

create policy "admins see own membership" on public.admin_users for select to authenticated using (user_id=auth.uid() or public.is_admin());
create policy "public settings read" on public.site_settings for select to anon,authenticated using (key='global');
create policy "admins settings write" on public.site_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "public series" on public.series for select to anon,authenticated using (status='published' or public.is_admin());
create policy "admin series" on public.series for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "public events" on public.events for select to anon,authenticated using (status='published' or public.is_admin());
create policy "admin events" on public.events for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "public players" on public.players for select to anon,authenticated using (status='published' or public.is_admin());
create policy "admin players" on public.players for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "public articles" on public.articles for select to anon,authenticated using (status='published' or public.is_admin());
create policy "admin articles" on public.articles for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "public about" on public.about_pages for select to anon,authenticated using (status='published' or public.is_admin());
create policy "admin about" on public.about_pages for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin audit read" on public.audit_logs for select to authenticated using (public.is_admin());

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('media','media',true,10485760,array['image/jpeg','image/png','image/webp','image/gif','application/pdf'])
on conflict(id) do update set file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
create policy "public media read" on storage.objects for select using (bucket_id='media');
create policy "admin media upload" on storage.objects for insert to authenticated with check (bucket_id='media' and public.is_admin());
create policy "admin media update" on storage.objects for update to authenticated using (bucket_id='media' and public.is_admin());
create policy "admin media delete" on storage.objects for delete to authenticated using (bucket_id='media' and public.is_admin());

insert into public.site_settings(key,value) values('global','{
  "site_title":"KSOP — Korea Series of Poker",
  "hero_eyebrow":"THE KOREA SERIES OF POKER · 2026",
  "hero_title":"THE PINNACLE OF LIVE POKER",
  "hero_description":"Where discipline meets instinct. A new standard for live poker in Korea.",
  "hero_image":"https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ksop-hero-arena-JQ0pjfsDhRQgTNBanhgv2w8v4z3X2n.webp",
  "primary_cta_label":"REGISTER NOW",
  "primary_cta_url":"/events",
  "secondary_cta_label":"EXPLORE EVENTS",
  "announcement":"NEXT SERIES · SEOUL · NOVEMBER 17–22, 2026",
  "footer_text":"Korea’s premier live poker series. Designed for the game.",
  "primary_color":"#c5202d",
  "instagram_url":"#","youtube_url":"#","facebook_url":"#","x_url":"#"
}'::jsonb) on conflict(key) do nothing;

-- FIRST ADMIN (do this after creating a user in Authentication > Users):
-- insert into public.admin_users(user_id,role) values('PASTE-AUTH-USER-UUID-HERE','owner');
