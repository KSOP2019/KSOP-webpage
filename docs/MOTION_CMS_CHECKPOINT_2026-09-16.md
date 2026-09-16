# KSOP CMS integration checkpoint — 2026-09-16

STATUS: INCOMPLETE / NOT DEPLOYED. This branch is a recovery checkpoint, not the final website.
The working environment disconnected during the final Next production build (environment_offline). GitHub main and Vercel production were not changed.

## Canonical projects
- GitHub: KSOP2019/KSOP-webpage; production branch main.
- Vercel: ksophomepage / prj_XcuBCh3TGvUj2AalPT4s0rRP1y1v, team team_mi9GCXv8PNBXDwr4QDtP58U4.
- Production URL: https://ksophomepage.vercel.app
- Homepage Supabase: srkxcezthuzldxndcpkt. Do not touch KSOP Company OS (lnqkxfirsyppuepzqaki).
- Prior approved motion review: https://ksop-motion-review.koreaseriesofpoker.chatgpt.site
- Approved home style commit: 815e901f3bd6a23a4c076a451a746bf00543244b.
- Prior Site detail version commit: 1d4f5762f3bd1e853b6adf17ac2e4ff2b3b6e212.
- Main baseline: dbf8835c55a506dbc2dd16f3255df4cdce963627.

## Persisted changes already applied to Supabase
- Migration motion_cms_content_and_pagination: result publication state/revision, parent-published result RLS, ordered-list indexes, server-only paginated file-list RPC.
- Existing 25 draft events and 2 draft articles remain drafts.
- site_settings motion:settings contains approved home copy and asset references; six existing partners and three previously verified YouTube videos inserted as per-record JSON keys.
- New public file-list RPC is NOT executable by anon or authenticated roles; only service_role.
- No records, projects or storage files were deleted.

## Local implementation to recover (not contained in this checkpoint)
Working tree: /workspace/scratch/03b921473e6d/ksop-webpage
Local branch: feat/motion-cms-final-20260916
- public/motion: approved static home assets, exact unchanged style.css, new cms.js, CMS detail router pages.js, pages.css.
- app/api/motion/route.ts: authenticated unified writes, whitelisted schema, stale-revision conflict detection, public-published reads, stable pagination24, server cache15s/invalidation.
- lib/motion-cms.ts, components/admin/motion-editor.tsx, app/admin/manage/[resource].
- Existing admin dashboard/sidebar and old editor routes redirected to unified CMS.
- File manager changed to paginated server-only storage RPC including year/subfolders; PDF uploads included, maximum4MB.
- next.config.mjs public routes rewrite to approved static app; server CMS remains existing Next app.
- Detail category numbers removed; consistent title/subtitle layout; routes and inquiry settings connected.
- Homepage design hash checked identical to approved baseline. No new dependencies.
- Existing handwritten/manual season points remain separate from proposed ranking analysis; no claim that formula is official.
- Company recipient email remains unconfirmed/empty. Inquiry drafts work; user must register recipient in settings before mail handoff.
- Full fresh source upload/commit still required. Do NOT merge this checkpoint alone as the finished implementation.

## Passed checks
- TypeScript passed after CMS/results/file-management edits.
- An earlier production build passed; FINAL rebuild outcome unknown due environment disconnect.
- Local API fixtures:1005 videos,42 pages,21 final-page records;61 events,13 final-page records; draft news hidden; unauthenticated admin read and write denied;10 public direct routes served approved app.
-40 concurrent LOCAL fixture-backed reads succeeded in204ms. This is NOT a production load-capacity guarantee.
- Browser fixture UI: media shows24 thumbnails and1/42 total1005; Next button shows item25 andpage2; no horizontal overflow at tested desktop size; partner detail six logos/cards and missing-URL badges render.
- During browser QA a malformed API query separator was fixed in public/motion/cms.js: use & between resource and other params.
- Authenticated browser save/upload has not been tested: browserAuth capability unavailable; do not bypass login/cookie controls.

## Resume steps
1. Recover local working tree before changing files. Preserve user changes.
2. Restore temporary review-site QA setup: copy /tmp/ksop-vite-original.mjs to ksop-motion-review/vite.config.mjs; delete only temporary dist/motion/ and qa-fixtures.json there after any remaining frontend checks. Review site's original dist/pages.js/css edits are real pending work.
3. Local .env.local test DB settings were removed before final build. Ensure none is committed.
4. Inspect hero image/logo selectors against actual HTML and CMS media item object shape; finish browser checks for schedule accordion, player details, mobile, settings.
5. About company/greeting/history CMS supports records; live database has no about records yet. Register approved copy/draft templates without fabricated historical facts.
6. Complete final build; review diff and update HOME_DESIGN_LOCK integration notes.
7. Commit full tested source to feature branch, verify one Vercel preview, then main deployment under same existing project.
8. Confirm real public API and final production routes. Actual admin sign-in/save/upload requires supported user login.
9. Only after final production is verified, close obsolete preview PRs and consolidate old review links. No old deployments, branches or projects have been deleted. Current Vercel tools expose no deletion action.
10. Update original handoff file identity libfile_4379475d5d908191bf326f3298e843bb, expected version9, preserving its history.
11. Remove checkpoint branch after full integration is safely on main. Its vercel.json disables deployment ONLY for this checkpoint branch (official Vercel git.deploymentEnabled config).

오늘 Next Action: Restore work environment, recover source, finish final build and deploy verified integration.
