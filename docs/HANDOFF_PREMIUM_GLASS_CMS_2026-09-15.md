# KSOP Homepage Premium Glass + CMS Handoff

Date: 2026-09-15

## Source of truth

- Production URL: https://ksophomepage.vercel.app/
- Repository: `KSOP2019/KSOP-webpage`
- Base main at start: `202972fad282ae61edc71bcda66bcd96ac25ef54`
- Working branch: `preview/premium-glass-cms-20260915`
- Stable Preview URL: https://ksophomepage-git-preview-premium-glass-cms-20260915-ksop.vercel.app/
- Production main was not merged during this session.

## Approved goal

Complete the existing KSOP website without rebuilding it: repair empty/broken routes and CTAs, align home section names/order with primary navigation, strengthen glass/shadow/3D depth using the existing black/off-white/gold system, extend CMS editing, and always expose six SNS channels with CMS-managed URLs.

## Implemented in Preview

1. Primary navigation remains route-driven: Schedule / Events / Ranking / News / About.
2. English `EVENT` display is normalized to `EVENTS` while `/events` remains canonical.
3. Home now follows the same navigation source and order: Hero → Schedule → Events → Ranking → News → About.
4. Added additive premium glass layer: deeper blur, layered shadows, subtle gold depth, perspective poster, hover elevation, responsive/reduced-motion fallbacks.
5. Six fixed social channels: FLOPIN / Instagram / X / Discord / Facebook / YouTube.
6. Six social icons stay visible when URL is blank; blank means disabled/non-link state.
7. Header, Footer, and DetailHeader use the same `/api/social` CMS source.
8. Social URLs persist in `site_settings.global.social`; no Supabase schema migration was introduced.
9. Home CMS can edit hero/media/series/home copy, six social URLs, navigation labels, all scalar multilingual UI copy, and nested About/application-form copy.
10. Saved CMS locale copy now overlays static locale defaults in the public SiteProvider.
11. Event detail registration CTA now routes to `/register/[event-slug]`.
12. Registration page is event-aware and uses the normal site shell. No fake registration submission was invented because an official registration endpoint/channel is not confirmed.
13. Existing production-only real-data safeguards remain unchanged; Preview/dev may show QA seed data only.

## Validation performed

- Vercel Preview build: READY.
- `/`: 200.
- `/events`: 200.
- `/events/event-1`: 200 in Preview QA data; registration href confirmed.
- `/register/event-1`: initially exposed a missing-provider 500; fixed with `app/register/layout.tsx`; revalidated 200.
- `/schedule`: 200.
- `/api/social`: 200 and returns all six keys.
- `/admin/content`: unauthenticated access resolves to Admin Login as expected.
- Preview has `noindex, nofollow`.
- Main production was not changed.

## Still intentionally pending

1. Representative visual approval on Preview before merging to `main`.
2. Real SNS URLs are still blank and should be entered through CMS when confirmed.
3. Official event registration submission/backend is not confirmed; current page displays truthful pending state rather than a dummy form.
4. Final Production smoke test is required only after approved PR merge.

## Merge gate

Do not merge to `main` until the representative confirms the Preview visual result. After approval: merge PR → Vercel Production deploy → verify root/nav/CMS/social/events/register/light-dark/languages/mobile.
