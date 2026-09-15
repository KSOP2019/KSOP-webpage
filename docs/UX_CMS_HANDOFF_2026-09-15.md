# KSOP Homepage UX/CMS Handoff

## Status
- Goal: Complete KSOP public website UX, routes and CMS without rebuilding the project.
- Working branch: `preview/ux-cms-completion-20260915`
- Main preserved: YES
- Approved by representative: YES, 2026-09-15

## Current execution order
1. Header/Footer + 6 SNS visibility and single source
2. Home section naming/order parity with navigation
3. Dead CTA and registration route completion
4. CMS expansion for text/images/social URLs
5. Visual glass/shadow/depth refinement
6. Responsive + theme + locale QA
7. Preview review before merge

## Non-negotiables
- No Supabase schema redesign unless unavoidable and separately approved.
- No fake production events/news/players.
- No removal of public sections because data is empty.
- Preserve KR/EN/JP/CN and event-name non-translation rule.
- Preserve RLS/Auth/service-role protections.
- Keep approved black/off-white/gold palette; avoid neon/cyberpunk.

## Next action
Complete the first implementation batch and open a draft PR against main for Preview review only.
