import type { EventItem } from './types'

function clean(url: string | undefined): string {
  return typeof url === 'string' ? url.trim() : ''
}

const OFFICIAL_LOGOS = [
  '/images/ksop-light-approved.png',
  '/images/ksop-dark-approved.png',
  '/images/ksop-light-logo.png',
  '/images/ksop-dark-logo.png',
  '/images/ksop-logo-black.png',
  '/images/ksop-logo-white.png',
]

/**
 * Documentary imagery policy: real KSOP photos first.
 * Accepts /images/real/*, official logos, and confirmed CMS uploads (http/https).
 * Anything else (AI/synthetic placeholders) resolves to '' so callers
 * render solid black + typography instead of fake imagery.
 */
export function isRealPhoto(url: string | undefined): boolean {
  const value = clean(url)
  if (!value) return false
  if (value.startsWith('/images/real/')) return true
  if ((OFFICIAL_LOGOS as readonly string[]).includes(value)) return true
  if (/^https?:\/\//.test(value)) return true
  return false
}

/** Real photo URL or '' (caller renders black + typography fallback). */
export function realPhotoOrBlank(url: string | undefined): string {
  return isRealPhoto(url) ? clean(url) : ''
}

/** List card image: thumbnail -> poster -> '' (text-only card fallback, never broken). */
export function eventCardImage(event: Pick<EventItem, 'thumbnailUrl' | 'posterUrl'>): string {
  return realPhotoOrBlank(event.thumbnailUrl) || realPhotoOrBlank(event.posterUrl)
}

/** Detail hero/banner slot: banner -> poster -> ''. */
export function eventBannerImage(event: Pick<EventItem, 'bannerUrl' | 'posterUrl'>): string {
  return realPhotoOrBlank(event.bannerUrl) || realPhotoOrBlank(event.posterUrl)
}

/** Detail poster/visual slot: poster -> banner -> ''. */
export function eventPosterImage(event: Pick<EventItem, 'posterUrl' | 'bannerUrl'>): string {
  return realPhotoOrBlank(event.posterUrl) || realPhotoOrBlank(event.bannerUrl)
}

/** Detail media frame: banner (cover) wins; otherwise poster (contain, never cropped). */
export function eventDetailMedia(event: Pick<EventItem, 'bannerUrl' | 'posterUrl'>): {
  src: string
  fit: 'cover' | 'contain'
} {
  const banner = realPhotoOrBlank(event.bannerUrl)
  if (banner) return { src: banner, fit: 'cover' }
  const poster = realPhotoOrBlank(event.posterUrl)
  return { src: poster, fit: 'contain' }
}
