import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { EventDetailClient } from '@/components/site/event-detail-client'
import { getEvent, getSiteContent } from '@/lib/data'
import { SITE_OG_IMAGE } from '@/lib/site-url'

type PageProps = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const event = await getEvent(id)
  if (!event || !event.published) return {}
  const image = event.bannerUrl || event.posterUrl || event.thumbnailUrl || SITE_OG_IMAGE
  return {
    title: event.name,
    description: `${event.name} — ${event.date} · ${event.type}. KSOP event details.`,
    alternates: { canonical: `/events/${event.id}` },
    openGraph: { title: event.name, url: `/events/${event.id}`, images: [{ url: image }] },
    twitter: { card: 'summary_large_image', title: event.name, images: [image] },
  }
}

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params
  const [event, content] = await Promise.all([getEvent(id), getSiteContent()])

  if (!event || !event.published) notFound()

  return (
    <EventDetailClient event={event} seriesVenue={content.seriesVenue} seriesDate={content.seriesDate} />
  )
}
