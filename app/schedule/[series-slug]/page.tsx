import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SeriesDetailClient } from '@/components/site/series-detail-client'
import { getEvents, getSiteContent } from '@/lib/data'
import { getScheduleContent } from '@/lib/schedule-content'
import { getEventSeriesLinkMap } from '@/lib/series-db'
import { getSeries, getSeriesDateRange, getSeriesEvents } from '@/lib/series'

type PageProps = { params: Promise<{ 'series-slug': string }> }

export const revalidate = 120

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { 'series-slug': slug } = await params
  const scheduleContent = await getScheduleContent()
  const series = getSeries(scheduleContent, slug)
  if (!series) return { title: 'Series not found · KSOP' }
  return {
    title: series.title.trim(),
    description: `${series.title.trim()} — KSOP series schedule and events.`,
    alternates: { canonical: `/schedule/${slug}` },
  }
}

export default async function SeriesDetailPage({ params }: PageProps) {
  const { 'series-slug': slug } = await params
  const [events, content, scheduleContent, seriesLinks] = await Promise.all([
    getEvents(),
    getSiteContent(),
    getScheduleContent(),
    getEventSeriesLinkMap(),
  ])
  const series = getSeries(scheduleContent, slug)

  if (!series) notFound()

  const linkedEvents = events.map((event) => ({ ...event, seriesId: seriesLinks[event.id] || event.seriesId }))
  const seriesEvents = getSeriesEvents(series, linkedEvents)
  const dateRange = getSeriesDateRange(seriesEvents) ?? series.periodHint

  return (
    <SeriesDetailClient
      series={series}
      seriesEvents={seriesEvents}
      dateRange={dateRange}
      content={content}
    />
  )
}
