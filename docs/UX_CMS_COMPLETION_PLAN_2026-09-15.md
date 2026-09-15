# KSOP Homepage UX/CMS Completion Plan

Approved: 2026-09-15
Branch: preview/ux-cms-completion-20260915
Base: main @ 202972fad282ae61edc71bcda66bcd96ac25ef54

## Approved scope
1. Preserve existing production structure, DB, RLS, auth, locales and published-data safety.
2. Align Header navigation and Home section naming/order: SCHEDULE / EVENTS / RANKING / NEWS / ABOUT.
3. Restore all 6 SNS slots (FLOPIN, Instagram, X, Discord, Facebook, YouTube) even before URLs are configured; empty URLs render disabled.
4. Move social URLs to one CMS-controlled source shared by Header/Footer.
5. Replace dead registration CTA behavior with real route navigation and complete `/register/[event-slug]` as a real event registration entry page.
6. Keep official empty states when events/news/ranking data is zero.
7. Expand CMS coverage for global copy, imagery, poster/thumbnail usage and social URLs.
8. Strengthen the existing premium glass / shadow / depth system without changing the approved black/off-white/gold palette into neon/cyberpunk.
9. Validate Desktop/Tablet/Mobile, Light/Dark and KR/EN/JP/CN before merge.

## Production guardrail
Do not merge this branch to main until Preview review is approved.
