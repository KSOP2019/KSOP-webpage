import type { EventItem, EventType } from './types'
import { defaultScheduleContent, type ScheduleCard, type ScheduleContent } from './schedule-content'

export interface SeriesEventMatch {
  types?: EventType[]
  nameContains?: string
}

export interface SeriesItem {
  slug: string
  title: string
  image: string
  status: 'upcoming' | 'past'
  periodHint: string | null
  venue: string
  seriesId: string
  match: SeriesEventMatch | null
}

export function slugifySeriesLabel(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function cardMatch(card: ScheduleCard): SeriesEventMatch | null {
  const types = card.matchType ? [card.matchType] : undefined
  const nameContains = card.matchName?.trim() || undefined
  if (!types && !nameContains) return null
  return { types, nameContains }
}

export function seriesFromCard(card: ScheduleCard): SeriesItem {
  const labelPeriod = card.label.match(/\d{1,2}[./]\d{1,2}\s*[~–-]\s*\d{1,2}/)?.[0] ?? null
  return {
    slug: slugifySeriesLabel(card.label),
    title: card.label.trim(),
    image: card.image,
    status: card.status === 'past' ? 'past' : 'upcoming',
    periodHint: card.dateRange?.trim() || labelPeriod,
    venue: card.venue?.trim() || '',
    seriesId: card.seriesId?.trim() || '',
    match: cardMatch(card),
  }
}

export function getAllSeries(scheduleContent: ScheduleContent = defaultScheduleContent): SeriesItem[] {
  return scheduleContent.items.map(seriesFromCard)
}

export function getSeries(scheduleContent: ScheduleContent, slug: string): SeriesItem | undefined {
  return getAllSeries(scheduleContent).find((series) => series.slug === slug)
}

function compareEvents(a: EventItem, b: EventItem): number {
  const dayA = Number(a.date.replace(/\D/g, ''))
  const dayB = Number(b.date.replace(/\D/g, ''))
  if (dayA !== dayB) return dayA - dayB
  const numA = Number(a.name.match(/#(\d+)/)?.[1] ?? 0)
  const numB = Number(b.name.match(/#(\d+)/)?.[1] ?? 0)
  return numA - numB
}

function legacyMatchesSeries(series: SeriesItem, event: EventItem): boolean {
  if (!series.match) return false
  if (series.match.types && !series.match.types.includes(event.type)) return false
  if (series.match.nameContains && !event.name.toLowerCase().includes(series.match.nameContains.toLowerCase())) return false
  return true
}

function matchesSeries(series: SeriesItem, event: EventItem): boolean {
  // Canonical DB ownership always wins. Legacy type/name matching is only for
  // old preview/CMS cards that have not yet been assigned a public.series.id.
  if (series.seriesId) return event.seriesId === series.seriesId
  return legacyMatchesSeries(series, event)
}

export function getSeriesEvents(series: SeriesItem, events: EventItem[]): EventItem[] {
  return events
    .filter((event) => event.published)
    .filter((event) => matchesSeries(series, event))
    .sort(compareEvents)
}

export function findSeriesForEvent(scheduleContent: ScheduleContent, event: EventItem): SeriesItem | undefined {
  const all = getAllSeries(scheduleContent)
  if (event.seriesId) {
    const exact = all.find((series) => series.seriesId && series.seriesId === event.seriesId)
    if (exact) return exact
  }
  return all.find((series) => !series.seriesId && legacyMatchesSeries(series, event))
}

export function getSeriesDateRange(seriesEvents: EventItem[]): string | null {
  if (seriesEvents.length === 0) return null
  const first = seriesEvents[0].date
  const last = seriesEvents[seriesEvents.length - 1].date
  return first === last ? first : `${first} - ${last}`
}
