# KSOP Homepage Partnership Handoff — 2026-09-15

## Scope

Home final block only. The former `확정된 일정과 결과 / 시리즈 안내` brand strip is replaced with a partnership logo wall.

## Approved public structure

- Eyebrow: `OFFICIAL PARTNERS`
- Heading: `KSOP와 함께하는 파트너십`
- Purpose: visually show companies with an approved KSOP relationship.
- Partner cards show a logo and company name.
- Clicking a partner opens its official destination URL in a new tab.

Initial partner destinations:

1. Japan Open Poker Tour — https://japanopenpoker.com/
2. China Poker Games — http://www.chinapokergames.com/
3. Global Poker Index — https://www.globalpokerindex.com/

## CMS management

Admin route: `/admin/content`

A `Homepage Partnerships` editor is available below the existing site content editor. Admin can:

- add a partner;
- remove a partner;
- edit company name;
- edit official destination URL;
- upload/select partner logo;
- edit logo alt text;
- save partnership entries.

The data is stored inside the existing `site_settings.key = global` JSON as `partners`. No Supabase schema migration is introduced.

Public API: `/api/partners`

- GET is public and normalized.
- PUT requires admin authentication.
- URL validation accepts `http:` and `https:` only.
- Maximum normalized list size is 24.
- If CMS data is unavailable, the three approved defaults remain visible.

## Visual rules

Implemented in `app/home-content-polish.css`:

- 1920px Home desktop canvas preserved.
- premium off-white/glass partner section;
- equal three-column logo cards at current count;
- large isolated logo surface;
- logo uses `object-fit: contain` and `mix-blend-mode: multiply` for a cutout-like presentation;
- subtle raise/shadow interaction on hover;
- same Home zoom-lock architecture remains intact.

For final production brand quality, prefer contract-provided transparent PNG/WebP/SVG logos uploaded through CMS instead of relying on remote fallback images.

## Files

- `lib/partners.ts`
- `app/api/partners/route.ts`
- `components/site/partner-logo-wall.tsx`
- `components/admin/partner-editor.tsx`
- `components/site/home-view-v2.tsx`
- `app/home-content-polish.css`
- `app/admin/content/page.tsx`

## Validation

Latest validated Preview commit before this documentation commit: `fa3d161de720e6bf6d0f615f6f0a7377c9b8532c`.

- Vercel Preview deployment: READY
- Home `/`: HTTP 200
- `/api/partners`: HTTP 200 and returns all three initial partners
- Preview remains `noindex, nofollow`
- Production `main` remains untouched

## Merge gate

Do not merge PR #17 to `main` until representative visual approval and the production synthetic-data safety gate are rechecked.
