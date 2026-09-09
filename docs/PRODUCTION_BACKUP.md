# KSOP Production Backup & Recovery Runbook

Project: **KSOP-webpage** · Supabase ref: `srkxcezthuzldxndcpkt`

No secrets are stored in this file. Never commit database passwords or keys.
All commands below use placeholders you fill in at runtime.

---

## 1. Database backup

### Option A — Supabase Dashboard (simplest)
1. Open the KSOP-webpage project → **Database → Backups**.
2. On paid plans, download the latest daily automatic backup before any
   risky change. On free plans there are no automatic backups — use B or C.

### Option B — Schema + data via pg_dump (recommended manual backup)
Run from a machine with network access to the project. Get the connection
string from **Project Settings → Database → Connection string (URI)**.

```bash
# Full backup: schema + data, custom format (use for restore)
pg_dump "<POSTGRES_CONNECTION_URI>" \
  --format=custom \
  --file="ksop-backup-YYYYMMDD.dump"

# Schema-only (structure, policies, functions)
pg_dump "<POSTGRES_CONNECTION_URI>" \
  --format=plain --schema-only \
  --file="ksop-schema-YYYYMMDD.sql"

# Data-only (no schema)
pg_dump "<POSTGRES_CONNECTION_URI>" \
  --format=custom --data-only \
  --file="ksop-data-YYYYMMDD.dump"
```

Tables covered: `admin_users`, `site_settings`, `series`, `events`,
`players`, `articles`, `about_pages`, `audit_logs` (plus `storage.objects`
metadata — actual files need the storage backup below).

### Option C — Table-level CSV export
Supabase Dashboard → **Table Editor** → table → **Export as CSV**.
Useful for quick `events` / `articles` snapshots before bulk imports.

### Backup cadence
- Before every migration or bulk event import: Option B full backup.
- Weekly: full backup kept off-site (e.g. encrypted drive).
- `supabase/schema.sql` + `supabase/migrations/*` in this repo are the
  versioned schema source of truth — they are NOT a data backup.

---

## 2. Storage backup (media bucket)

The `media` bucket holds CMS images at stable paths, e.g.
`home/2026/...`, `schedule/...`, `news/...`, `events/posters|banners|thumbnails/...`, `logos/...`.

### List / download (service-role, server-side only)
```bash
# Install once: npm i -g supabase
# Login and link: supabase login && supabase link --project-ref srkxcezthuzldxndcpkt

# Download the whole bucket preserving paths
supabase storage download media --recursive --dest ./ksop-media-backup-YYYYMMDD
```

Alternative without CLI: Dashboard → **Storage → media** → download per
folder. For scripted copies, use the `/admin/media` page in the running app
(authenticated) to enumerate public URLs, then fetch them — this preserves
original storage paths only if you re-upload to the same paths on restore.

### Restore approach
Re-upload files to the **same object paths** (public URLs are derived from
paths, so identical paths = zero CMS changes). Verify a sample of public
URLs afterwards. Never rename in bulk.

### Orphan policy
Replaced CMS images are intentionally **retained** (uploads never delete).
Quarterly: compare bucket listing against URLs referenced in
`site_settings`, `events`, `articles`, `players` rows and delete only
objects referenced nowhere, after a fresh backup.

---

## 3. Recovery order

1. **Restore DB/schema/data** — `pg_restore` the latest full dump into the
   project (or a fresh project), then re-apply any repo migrations in
   `supabase/migrations/*` created after the dump.
2. **Restore media bucket** — re-upload to identical paths.
3. **Restore Vercel env vars** — see section 4. Redeploy after setting them.
4. **Deploy known-good Git commit** — current safe commit: `bcc8759`
   (verify with `git log --oneline -3` and smoke-test before announcing).
5. **Set SITE_URL** — `NEXT_PUBLIC_SITE_URL=https://official-domain`
   once the custom domain is confirmed; redeploy.
6. **Verify admin login** — `/admin/login` → dashboard loads.
7. **Smoke-test public routes** — `/`, `/schedule`, `/events`,
   `/events/[id]`, `/ranking`, `/news`, `/news/[slug]`, `/about`,
   plus `/robots.txt` and `/sitemap.xml`.

---

## 4. Required Vercel production env vars

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Public reads (events, news, content) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public reads (RLS anon role) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only admin writes/uploads (NEVER public) |
| `ADMIN_PASSWORD` | Admin login (fails closed if absent) |
| `NEXT_PUBLIC_SITE_URL` | Canonical origin for metadata/sitemap (once custom domain confirmed) |

No other env vars are required by the current codebase.
