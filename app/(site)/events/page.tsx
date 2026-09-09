import { Suspense } from 'react'
import { EventsPageClient } from '@/components/site/events-page-client'
import { getEvents } from '@/lib/data'

export const revalidate = 120

export default async function EventsPage() {
  const events = await getEvents()

  return (
    <Suspense fallback={<section className="section-pad">Loading events...</section>}>
      <EventsPageClient events={events.filter((event) => event.published)} />
    </Suspense>
  )
}
