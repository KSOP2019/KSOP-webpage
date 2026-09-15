import type { Language } from './types'

export const NAV_ROUTES = ['/schedule', '/events', '/ranking', '/news', '/about'] as const

/**
 * Canonical About labels per locale. The /about label never comes from CMS
 * copy, so stale CMS nav arrays cannot override it.
 */
export const ABOUT_NAV_LABELS = {
  KR: '소개',
  EN: 'ABOUT',
  JP: '紹介',
  CN: '介绍',
} as const

/**
 * Fallback labels keyed by NAV_ROUTES position.
 * CMS copy (`site_settings.global.copy[lang].nav`) supplies display labels only;
 * routes always come from NAV_ROUTES so a CMS length/order drift can never
 * misroute a link (e.g. NEWS must always resolve to `/news`).
 */
export const NAV_FALLBACK_LABELS = ['SCHEDULE', 'EVENTS', 'RANKING', 'NEWS', 'ABOUT'] as const

export interface NavEntry {
  href: (typeof NAV_ROUTES)[number]
  label: string
}

export function getNavItems(labels: readonly string[] | undefined | null, language: Language): NavEntry[] {
  return NAV_ROUTES.map((href, index) => {
    const supplied = labels?.[index] ?? NAV_FALLBACK_LABELS[index] ?? `NAV ${index + 1}`
    const label =
      href === '/about'
        ? ABOUT_NAV_LABELS[language]
        : href === '/events' && language === 'EN' && supplied.trim().toUpperCase() === 'EVENT'
          ? 'EVENTS'
          : supplied

    return { href, label }
  })
}

export const EVENT_CATEGORIES = ['ALL EVENT', 'MAIN EVENT', 'HIGH ROLLER', 'DAY'] as const

/**
 * Legacy fallback only. Runtime Header/Footer now read CMS social settings
 * from site_settings.global.social via /api/social.
 */
export const SOCIAL_URLS: Record<string, string> = {
  FLOPIN: '',
  Instagram: '',
  X: '',
  Discord: '',
  Facebook: '',
  YouTube: '',
}

export const socials = {
  Instagram: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Instagram_logo_2016.svg-NBMO0lmv2K7K473c9FrC4lkjBON4CP.xml',
  YouTube: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/YouTube_full-color_icon_%282017%29-lzM6xIHSSDTpUc58zCv1DnznwW1NMZ.svg',
  Facebook: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2021_Facebook_icon-eAvML39Egb3WwCxlfdN5V470AtOd9g.svg',
  X: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/X_logo_2023.svg-SAy6Q2okZ356D0qB9EQkubVclIK1Bk.xml',
} as const
