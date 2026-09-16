-- Extend the existing homepage CMS; no project/table replacement or content deletion.
alter table public.player_results add column if not exists status text not null default 'published' check (status in ('draft','published','archived'));
alter table public.player_results add column if not exists updated_at timestamptz not null default now();
alter policy "public player results select" on public.player_results using (status='published' and exists (select 1 from public.players p where p.id=player_id and p.status='published'));
create index if not exists motion_series_public_order on public.series (status,starts_at,id);
create index if not exists motion_events_public_order on public.events (status,series_id,starts_at,id);
create index if not exists motion_articles_public_order on public.articles (status,published_at desc,id);
create index if not exists motion_players_public_order on public.players (status,points desc,id);
create index if not exists motion_results_public_order on public.player_results (player_id,status,event_date desc,id);
create index if not exists motion_settings_content_order on public.site_settings ((value->>'status'),(value->'sort_order'),key text_pattern_ops) where key like 'motion:%';
-- Server-only file listing reads all years/subfolders, with bounded page size.
create or replace function public.ksop_media_page(folder_prefix text default '', page_number integer default 1)
returns jsonb language sql stable security definer set search_path=pg_catalog,public as $$
with filtered as (
 select name,metadata,created_at,id from storage.objects where bucket_id='media'
 and (folder_prefix='' or name like replace(replace(replace(folder_prefix,'\','\\'),'%','\%'),'_','\_')||'/%')
), paged as (
 select name,metadata,created_at from filtered order by created_at desc,id limit 24 offset (greatest(1,least(page_number,100000))-1)*24
)
select jsonb_build_object('items',coalesce((select jsonb_agg(p) from paged p),'[]'::jsonb),'total',(select count(*) from filtered));
$$;
revoke all on function public.ksop_media_page(text,integer) from public,anon,authenticated;
grant execute on function public.ksop_media_page(text,integer) to service_role;
