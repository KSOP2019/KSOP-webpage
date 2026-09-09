'use client'

import Link from 'next/link'
import { SiteProvider, useSite } from '@/components/site/site-provider'
import { DetailHeader } from '@/components/site/detail-header'
import { Reveal } from '@/components/site/reveal'
import type { EventItem, SiteContent } from '@/lib/types'
import type { SeriesItem } from '@/lib/series'

export function SeriesDetailClient({
  series,
  seriesEvents,
  dateRange,
  content,
}: {
  series: SeriesItem
  seriesEvents: EventItem[]
  dateRange: string | null
  content: SiteContent
}) {
  return (
    <SiteProvider initialContent={content}>
      <SeriesDetailInner series={series} seriesEvents={seriesEvents} dateRange={dateRange} content={content} />
    </SiteProvider>
  )
}

function SeriesDetailInner({
  series,
  seriesEvents,
  dateRange,
  content,
}: {
  series: SeriesItem
  seriesEvents: EventItem[]
  dateRange: string | null
  content: SiteContent
}) {
  const { t } = useSite()

  return (
    <main className="detail-page series-detail">
      <DetailHeader activeHref="/schedule" />

      <section className="detail-hero">
        <div className="detail-kicker">{t.scheduleKicker ?? '01 / SCHEDULE · SERIES'}</div>
        <div className="detail-hero-grid">
          <h1>{series.title}</h1>
          <div>
            {dateRange ? <p>{dateRange}</p> : null}
            <p className="muted-copy" style={{ marginTop: '12px' }}>
              {seriesEvents.length} {t.eventsWord ?? 'EVENTS'}{content.seriesVenue ? ` · ${content.seriesVenue}` : ''}
            </p>
          </div>
        </div>
      </section>

      <Reveal as="section" className="detail-list" ariaLabel={`${series.title.trim()} series details`}>
        <div className="detail-facts series-facts">
          <div>
            <span>{t.seriesWord ?? 'SERIES'}</span>
            <strong>{series.title.trim()}</strong>
          </div>
          <div>
            <span>{t.dateRangeLabel ?? 'DATE RANGE'}</span>
            <strong>{dateRange ?? (t.tba ?? 'TBA')}</strong>
          </div>
          <div>
            <span>{t.eventsWord ?? 'EVENTS'}</span>
            <strong>{seriesEvents.length}</strong>
          </div>
          {content.seriesVenue ? (
            <div>
              <span>{t.venueLabel ?? 'VENUE'}</span>
              <strong>{content.seriesVenue}</strong>
            </div>
          ) : null}
        </div>

        <div className="section-label" style={{ marginTop: '48px' }}>{t.eventList ?? 'EVENT LIST'}</div>

        {seriesEvents.length === 0 ? (
          <p className="muted-copy" style={{ marginTop: '24px' }}>{t.schedulePending ?? 'EVENT SCHEDULE PENDING'}</p>
        ) : (
          <div style={{ marginTop: '12px' }}>
            {seriesEvents.map((event, index) => (
              <Link
                key={event.id}
                className="detail-row series-event"
                href={`/events/${event.id}`}
                aria-label={`${event.name} event detail`}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                <span className="series-event-body">
                  <h2>{event.name}</h2>
                  <span className="series-event-meta muted-copy">
                    <span>{event.date}</span>
                    <span>{event.dayLabel}</span>
                    <span>{event.type}</span>
                    <span>{t.factBuyin ?? 'BUY-IN'} {event.buyIn}</span>
                    <span>{event.gtd} GTD</span>
                  </span>
                </span>
                <span className="detail-arrow">↗</span>
              </Link>
            ))}
          </div>
        )}
      </Reveal>

      <footer className="detail-footer">
        <span>THE KOREA SERIES OF POKER · 2026</span>
        <span style={{ display: 'flex', gap: '24px' }}>
          <Link href="/schedule">{t.backToScheduleArrow ?? 'BACK TO SCHEDULE ↗'}</Link>
          <Link href="/">{t.backHome ?? 'BACK TO HOME ↗'}</Link>
        </span>
      </footer>
    </main>
  )
}
