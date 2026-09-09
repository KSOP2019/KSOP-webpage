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
