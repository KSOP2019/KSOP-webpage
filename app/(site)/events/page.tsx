import { Suspense } from 'react'
import type { Metadata } from 'next'
import { EventsPageClient } from '@/components/site/events-page-client'
import { getEvents } from '@/lib/data'

export const revalidate = 120

export const metadata: Metadata = {
  title: '이벤트',
  description: 'KSOP 이벤트 — 토너먼트 일정과 상세 정보. KSOP tournament events and details.',
  alternates: { canonical: '/events' },
}

export default async function EventsPage() {
  const events = await getEvents()

  return (
    <Suspense fallback={<section className="section-pad">Loading events...</section>}>
      <EventsPageClient events={events.filter((event) => event.published)} />
    </Suspense>
  )
}
