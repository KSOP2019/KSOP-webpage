import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SeriesDetailClient } from '@/components/site/series-detail-client'
import { getEvents, getSiteContent } from '@/lib/data'
import { getAllSeries, getSeries, getSeriesDateRange, getSeriesEvents } from '@/lib/series'

type PageProps = { params: Promise<{ 'series-slug': string }> }

export const revalidate = 120

export function generateStaticParams() {
  return getAllSeries().map((series) => ({ 'series-slug': series.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { 'series-slug': slug } = await params
  const series = getSeries(slug)
  if (!series) return { title: 'Series not found · KSOP' }
  return {
    title: series.title.trim(),
    description: `${series.title.trim()} — KSOP schedule series.`,
    alternates: { canonical: `/schedule/${slug}` },
  }
}

export default async function SeriesDetailPage({ params }: PageProps) {
  const { 'series-slug': slug } = await params
  const series = getSeries(slug)

  if (!series) notFound()

  const [events, content] = await Promise.all([getEvents(), getSiteContent()])
  const seriesEvents = getSeriesEvents(series, events)
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
