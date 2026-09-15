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

## Homepage 1920×1080 zoom stability pass

Representative request: at browser 100% the desktop reference is 1920×1080, and Ctrl+wheel zoom must scale the page without moving text/cards into tablet/mobile geometry.

- Scope: homepage first only. Other page responsive behavior is intentionally unchanged.
- Reference geometry: 1920px page width; 82px header + 998px hero = 1080px first-screen reference.
- Implementation file: `app/premium-glass-preview.css`.
- Homepage-only desktop canvas lock is scoped with `:has(main > .premium-hero)`.
- Home canvas/header/hero/section widths and key typography/grid geometry use fixed desktop pixel values instead of viewport-driven `vw`, `vh`, or `clamp()` values that were causing browser-zoom reflow.
- Header keeps the five desktop navigation items, six SNS slots, language/theme controls, and no mobile hamburger on the homepage zoomed desktop canvas.
- Schedule remains two-column; Events/About remain three-column; News remains three-column; section headings and hero copy keep desktop geometry under browser zoom.
- At zoom levels above 100%, the browser may show less of the fixed 1920px canvas or horizontal overflow; that is expected. The requirement is that internal boxes/text do not recompose into another responsive layout.
- Functional code, CMS, DB, and production `main` were not changed by this pass.
- Implementation commit: `5bc97e5ed369ac3b2496421a21be2086570f4736` (`fix(home): lock 1920x1080 desktop canvas against browser zoom reflow`).
- Vercel Preview for the implementation commit reached READY and `/` returned HTTP 200.

## Homepage Hero approved visual reference pass

Representative supplied a homepage screenshot and requested that the actual website Hero match the approved arena/glass composition rather than generating a standalone image.

- Scope: homepage Hero only; production `main` remains unchanged.
- Hero uses the approved site arena asset `/images/ksop-hero-arena.png` and no longer falls back to a black panel because the image allow-list now explicitly accepts this asset.
- The old `KineticText` and `ParallaxImage` wrappers were removed from the Hero to stop the title/image from moving independently under browser zoom.
- Hero visual is a single 1920-reference composition with balanced 40px left/right inset and a dark left-to-right overlay for legibility.
- Glass card, title, description and two CTAs are one fixed group: they must scale together under browser zoom and must not reflow separately.
- Korean Hero title is grouped as two lines inside the card: `라이브` / `포커의 정점`.
- Primary CTA is restored as `이벤트 확인` → `/events`.
- Secondary CTA is restored as `일정` → `/schedule` with a calendar icon.
- The top-right pending marker remains deliberately small and secondary.
- Final Hero override file: `app/home-hero-reference.css`, imported after the existing premium layer so the approved geometry wins without rewriting the global design system.
- Relevant commits: `6f2cf4478bcc337b4b3f84057764d3a4fccd2679`, `fe02ea3d2490e92663d210e4f530710894102428`, `d230d1b757fe76ec0b0eb71d022e37495180b01b`, `e29047f9f0906957be477d5f51e2bea4fcf3fbb8`.
- Latest Vercel Preview reached READY and `/` returned HTTP 200. Rendered HTML confirms the arena image, the full `라이브 포커의 정점` title, the `이벤트 확인` link, and the schedule link are present.

## Homepage compact partner directory pass

Representative requested the former large partnership block to behave like the other homepage sections and remain compact even after the partner list grows beyond 20 companies.

- Removed the large `KSOP와 함께하는 파트너십` headline from the homepage partner strip.
- Homepage partner header now uses `OFFICIAL PARTNERS` with the same section-label visual scale as sections 01–05.
- Added `전체 파트너 보기` → `/partners`, matching the existing Schedule / Events / News view-all pattern.
- The partner strip uses the same 154px-inset 1px separator geometry as the other homepage section dividers; the bottom boundary now follows the same rule instead of a full-width border.
- Homepage partner cards were reduced to a compact 150px-high six-column strip and only the first six partners render on Home, preventing future 20+ partner lists from expanding the homepage vertically.
- Added full `/partners` directory page. It displays the complete CMS partner list in a scalable desktop/mobile grid.
- Partner CMS remains inside the existing admin content flow and now supports up to 60 entries. Each entry manages company name, optional destination URL, partner logo, and alt text.
- Partner data remains in existing `site_settings.global.partners`; no Supabase table/schema/auth migration was introduced.
- Current default partners: Japan Open Poker Tour, China Poker Games, Global Poker Index, PLAYSOFT, PLAYPLACE, FLOPIN.
- Added temporary local SVG assets for PLAYSOFT and PLAYPLACE as requested. FLOPIN uses a neutral temporary wordmark until its approved final brand asset is supplied/reused.
- PLAYSOFT / PLAYPLACE / FLOPIN have intentionally blank destination URLs because no official URLs were supplied; they render as non-clickable cards until URLs are entered through CMS.
- Current default external partner URLs remain JOPT `https://japanopenpoker.com/`, China Poker Games `http://www.chinapokergames.com/`, and GPI `https://www.globalpokerindex.com/`.
- Partner saves revalidate both `/` and `/partners`.
- Latest functional commit before this handoff update: `0dba8bec98c124e2e4cd583ffbbaf60b21621f6c` (`feat(cms): scale partner editor beyond twenty entries`).
- Vercel Preview for that commit reached READY. `/`, `/partners`, and `/api/partners` returned HTTP 200, and `/api/partners` returned all six current partners.
- Production `main` remains unchanged.

## Validation performed

- Vercel Preview build: READY.
- `/`: 200.
- `/partners`: 200.
- `/api/partners`: 200 and returns all six current partners.
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
2. Desktop visual check of homepage at 80% / 100% / 125% browser zoom. Automated build/HTTP validation is complete, but the available deployment tools do not emulate the representative's physical Ctrl+wheel browser interaction.
3. After homepage approval, apply the same stable desktop geometry policy page-by-page to Schedule / Events / Ranking / News / About without changing functionality.
4. Real SNS URLs are still blank and should be entered through CMS when confirmed.
5. PLAYSOFT / PLAYPLACE / FLOPIN destination URLs remain intentionally blank until their official destinations are confirmed.
6. Replace temporary PLAYSOFT / PLAYPLACE / FLOPIN partner assets with approved brand originals when available; no layout/code rewrite is required.
7. Official event registration submission/backend is not confirmed; current page displays truthful pending state rather than a dummy form.
8. Final Production smoke test is required only after approved PR merge.

## Merge gate

Do not merge to `main` until the representative confirms the Preview visual result. After approval: merge PR → Vercel Production deploy → verify root/nav/CMS/social/events/register/partners/light-dark/languages/mobile.
