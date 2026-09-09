import type { EventItem } from './types'

function clean(url: string | undefined): string {
  return typeof url === 'string' ? url.trim() : ''
}

/** List card image: thumbnail -> poster -> '' (text-only card fallback, never broken). */
export function eventCardImage(event: Pick<EventItem, 'thumbnailUrl' | 'posterUrl'>): string {
  return clean(event.thumbnailUrl) || clean(event.posterUrl)
}

/** Detail hero/banner slot: banner -> poster -> ''. */
export function eventBannerImage(event: Pick<EventItem, 'bannerUrl' | 'posterUrl'>): string {
  return clean(event.bannerUrl) || clean(event.posterUrl)
}

/** Detail poster/visual slot: poster -> banner -> ''. */
export function eventPosterImage(event: Pick<EventItem, 'posterUrl' | 'bannerUrl'>): string {
  return clean(event.posterUrl) || clean(event.bannerUrl)
}

/** Detail media frame: banner (cover) wins; otherwise poster (contain, never cropped). */
export function eventDetailMedia(event: Pick<EventItem, 'bannerUrl' | 'posterUrl'>): {
  src: string
  fit: 'cover' | 'contain'
} {
  const banner = clean(event.bannerUrl)
  if (banner) return { src: banner, fit: 'cover' }
  const poster = clean(event.posterUrl)
  return { src: poster, fit: 'contain' }
}
