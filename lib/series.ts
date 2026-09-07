import type { EventItem, EventType } from './types'

export interface SeriesEventMatch {
  /** Match against real EventItem.type values only. */
  types?: EventType[]
  /** Match against a real substring of EventItem.name. */
  nameContains?: string
}

export interface SeriesItem {
  slug: string
  /** Verbatim label from the existing /schedule cards (app/detail-page.tsx). */
  title: string
  /** Existing card image, unchanged. */
  image: string
  /** Date fragment already present in the existing label, if any (e.g. "11.22~28"). */
  periodHint: string | null
  /** How this series maps to real EventItem rows. Uses only real Event values. */
  match: SeriesEventMatch
}

/**
 * URL-safe encoding of the existing schedule labels.
 * No pre-existing series slug exists in the codebase (no Series type, no
 * series table/JSON, detail-page.tsx uses label+image only), so slugs are
 * derived deterministically from those existing labels instead of inventing
 * a new arbitrary scheme.
 */
export function slugifySeriesLabel(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function defineSeries(label: string, image: string, match: SeriesEventMatch): SeriesItem {
  const period = label.match(/\d{1,2}\.\d{1,2}~\d{1,2}/)?.[0] ?? null
  return {
    slug: slugifySeriesLabel(label),
    title: label.trim(),
    image,
    periodHint: period,
    match,
  }
}

/**
 * Series source: the four cards rendered by /schedule today
 * (app/detail-page.tsx content.schedule.items, label + image verbatim).
 * Series -> Event linkage reuses only real EventItem values; the match key
 * follows each card's existing image semantics (warmup / plo / main-event /
 * high-roller). No event data is fabricated.
 */
export const SERIES: SeriesItem[] = [
  defineSeries('KSOP NAVER ENDING         ', '/images/schedule-warmup.png', { nameContains: 'Warm-up' }),
  defineSeries('CROWN SERIES  11.22~28 ', '/images/schedule-plo.png', { types: ['PLO'] }),
  defineSeries('YEAR FOR LAST 12.18~23', '/images/schedule-main-event.png', { types: ['MAIN EVENT'] }),
  defineSeries('CHAMPIONSHIP 12.27~30', '/images/schedule-high-roller.png', { types: ['HIGH ROLLER'] }),
]

export function getAllSeries(): SeriesItem[] {
  return SERIES
}

export function getSeries(slug: string): SeriesItem | undefined {
  return SERIES.find((series) => series.slug === slug)
}

function compareEvents(a: EventItem, b: EventItem): number {
  const dayA = Number(a.date.replace(/\D/g, ''))
  const dayB = Number(b.date.replace(/\D/g, ''))
  if (dayA !== dayB) return dayA - dayB
  const numA = Number(a.name.match(/#(\d+)/)?.[1] ?? 0)
  const numB = Number(b.name.match(/#(\d+)/)?.[1] ?? 0)
  return numA - numB
}

/** Published events linked to a series, sorted like the rest of the site. */
export function getSeriesEvents(series: SeriesItem, events: EventItem[]): EventItem[] {
  return events
    .filter((event) => event.published)
    .filter((event) => {
      if (series.match.types && !series.match.types.includes(event.type)) return false
      if (series.match.nameContains && !event.name.includes(series.match.nameContains)) return false
      return true
    })
    .sort(compareEvents)
}

/** Date range computed from real linked event dates (e.g. "NOV 17 - NOV 21"). */
export function getSeriesDateRange(seriesEvents: EventItem[]): string | null {
  if (seriesEvents.length === 0) return null
  const first = seriesEvents[0].date
  const last = seriesEvents[seriesEvents.length - 1].date
  return first === last ? first : `${first} - ${last}`
}
