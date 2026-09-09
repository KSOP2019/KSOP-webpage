-- KSOP RLS coverage fix: public schedule CMS document.
--
-- The app publicly reads two site_settings documents:
--   key = 'global'   (site content; already publicly readable)
--   key = 'schedule' (schedule cards via lib/schedule-content.ts)
-- The baseline "public settings read" policy only allowed key='global',
-- so schedule CMS edits saved by admins were invisible to anonymous public
-- reads (fail-closed; getScheduleContent fell back to defaults).
--
-- This migration widens ONLY the SELECT allowlist to include 'schedule'.
-- No write access is opened: the existing "admins settings write" policy
-- (authenticated + is_admin()) is untouched. No data is modified.
-- Safe to run multiple times; touches policies only.

drop policy if exists "public settings read" on public.site_settings;

create policy "public settings read" on public.site_settings
  for select to anon, authenticated using (key in ('global', 'schedule'));
