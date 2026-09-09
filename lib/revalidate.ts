import { revalidatePath } from 'next/cache'
import { getAllSeries } from './series'

/**
 * Targeted ISR invalidation after admin saves. Call only from server-side
 * admin mutation routes, after a successful write. Never disables caching.
 */

export function revalidateContentPages() {
  revalidatePath('/')
  revalidatePath('/about')
}

export function revalidateSchedulePages() {
  revalidatePath('/schedule')
}

export function revalidateSeriesPages() {
  try {
    for (const series of getAllSeries()) {
      revalidatePath(`/schedule/${series.slug}`)
    }
  } catch {
    // Series list is static config; a failure here must not break saves.
  }
}

export function revalidateEventPages(detailSlug?: string) {
  revalidatePath('/')
  revalidatePath('/events')
  if (detailSlug) revalidatePath(`/events/${detailSlug}`)
  revalidateSeriesPages()
}

export function revalidateNewsPages(detailSlug?: string) {
  revalidatePath('/')
  revalidatePath('/news')
  if (detailSlug) revalidatePath(`/news/${detailSlug}`)
}

export function revalidatePlayerPages() {
  revalidatePath('/')
  revalidatePath('/ranking')
}
