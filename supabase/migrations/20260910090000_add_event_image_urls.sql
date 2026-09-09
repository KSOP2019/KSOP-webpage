-- KSOP event image URLs (safe, idempotent, data-preserving).
-- Adds optional public image fields consumed by the admin CMS (AdminImageField)
-- and the public event list / detail / home cards.
-- Applies cleanly on the production database; existing rows and IDs untouched.

alter table public.events
  add column if not exists poster_url text,
  add column if not exists banner_url text,
  add column if not exists thumbnail_url text;
