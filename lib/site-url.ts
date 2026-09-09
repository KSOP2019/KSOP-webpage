/**
 * Single source of truth for the public site origin.
 *
 * Production: set NEXT_PUBLIC_SITE_URL (or SITE_URL) to the official domain,
 * e.g. NEXT_PUBLIC_SITE_URL=https://official-domain
 *
 * Fallback order when unset:
 *   NEXT_PUBLIC_SITE_URL -> SITE_URL -> current Vercel production host.
 * The site builds and works on the fallback; a custom domain still needs
 * confirmation from the representative.
 */
const rawSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.SITE_URL ??
  'https://ksophomepage.vercel.app'

export const SITE_URL = rawSiteUrl.replace(/\/+$/, '')

export const SITE_NAME = 'KSOP — Korea Series of Poker'
export const SITE_DESCRIPTION =
  'KSOP 대한민국 라이브 포커 시리즈 공식 홈페이지. The Korea Series of Poker — discipline meets instinct in Seoul.'
export const SITE_OG_IMAGE = '/images/ksop-hero-arena.png'
export const SITE_LOCALE = 'ko_KR'
