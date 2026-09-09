import { notFound } from 'next/navigation'
import { EventDetailClient } from '@/components/site/event-detail-client'
import { getEvent, getSiteContent } from '@/lib/data'

type PageProps = { params: Promise<{ id: string }> }

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params
  const [event, content] = await Promise.all([getEvent(id), getSiteContent()])

  if (!event || !event.published) notFound()

  return (
    <EventDetailClient event={event} seriesVenue={content.seriesVenue} seriesDate={content.seriesDate} />
  )
}
