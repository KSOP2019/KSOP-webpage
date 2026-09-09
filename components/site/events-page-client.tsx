'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ArrowUpRight } from 'lucide-react'
import { useSite } from '@/components/site/site-provider'
import { Reveal } from '@/components/site/reveal'
import { EVENT_CATEGORIES } from '@/lib/nav'
import { eventCardImage } from '@/lib/event-images'
import { filterEvents } from '@/lib/event-filters'
import type { EventItem } from '@/lib/types'

const PAGE_SIZE = 15

export function EventsPageClient({ events }: { events: EventItem[] }) {
  const { t, content } = useSite()
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get('category') ?? 'ALL EVENT'
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [selectedDate, setSelectedDate] = useState('ALL')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const dates = Array.from(new Set(events.map((event) => event.date)))
  const visibleEvents = useMemo(
    () => filterEvents(events, selectedCategory, selectedDate),
    [events, selectedCategory, selectedDate],
  )
  const shownEvents = visibleEvents.slice(0, visibleCount)
  const remainingCount = visibleEvents.length - shownEvents.length

  return (
    <section className="schedule-section section-pad events-density">
      <div className="section-top">
        <div>
          <div className="section-label">{t.scheduleLabel ?? '02 / UPCOMING SERIES'}</div>
          <h2>{t.schedule}</h2>
        </div>
        <div className="series-meta">
          <strong>{content.seriesDate}</strong>
          <span>{content.seriesVenue}</span>
          <span>{content.seriesGtd}</span>
        </div>
      </div>

      <div className="event-filters" role="tablist" aria-label="Event filters">
        {EVENT_CATEGORIES.map((category) => (
            <button
              type="button"
              className={selectedCategory === category ? 'is-active' : ''}
              aria-selected={selectedCategory === category}
              onClick={() => {
              setSelectedCategory(category)
              setSelectedDate('ALL')
              setVisibleCount(PAGE_SIZE)
            }}
          >
            {category}
          </button>
        ))}
      </div>

      {selectedCategory === 'DAY' ? (
        <div className="date-filter" style={{ display: 'flex', gap: '14px', marginBottom: '20px' }}>
          <button type="button" className={selectedDate === 'ALL' ? 'is-active' : ''} onClick={() => { setSelectedDate('ALL'); setVisibleCount(PAGE_SIZE); }}>
            {t.allDates ?? 'ALL DATES'}
          </button>
          {dates.map((date) => (
            <button
              key={date}
              type="button"
              className={selectedDate === date ? 'is-active' : ''}
              aria-selected={selectedDate === date}
              onClick={() => { setSelectedDate(date); setVisibleCount(PAGE_SIZE) }}
            >
              {date}
            </button>
          ))}
        </div>
      ) : null}

      <Reveal className="schedule-list">
        {visibleEvents.length > 0 ? (
          <p className="muted-copy" style={{ marginBottom: '12px' }}>
            {(t.showing ?? 'SHOWING {shown} OF {total} EVENTS')
              .replace('{shown}', String(shownEvents.length))
              .replace('{total}', String(visibleEvents.length))}
          </p>
        ) : null}
        {visibleEvents.length === 0 ? (
          <div>
            <p className="muted-copy">{t.noEvents ?? 'NO EVENTS MATCH THE SELECTED FILTERS'}</p>
            <div className="detail-actions" style={{ marginTop: '16px' }}>
              <button
                type="button"
                className="ghost-button"
                onClick={() => {
                  setSelectedCategory('ALL EVENT')
                  setSelectedDate('ALL')
                  setVisibleCount(PAGE_SIZE)
                }}
              >
                {t.clearFilters ?? 'CLEAR FILTERS'}
              </button>
            </div>
          </div>
        ) : null}
        {shownEvents.map((event) => (
          <article className="schedule-item event-row" key={event.id}>
            <Link
              className="schedule-trigger event-row-link"
              href={`/events/${event.id}`}
              aria-label={`${event.name} event detail`}>
              <span className="date">
                <strong>{event.date}</strong>
                <span>{event.dayLabel}</span>
              </span>
              {eventCardImage(event) ? (
                <img
                  src={eventCardImage(event)}
                  alt=""
                  loading="lazy"
                  style={{ width: 56, height: 56, borderRadius: 10, objectFit: 'cover', flex: '0 0 56px' }}
                />
              ) : null}
              <span className="event-title">
                <b>{event.name}</b>
                <small>
                  {event.type} · {t.buyin ?? 'BUY-IN'} {event.buyInType} · {event.gtd} GTD
                </small>
              </span>
              <ArrowUpRight className="chevron" aria-hidden="true" />
            </Link>
          </article>
        ))}
        {remainingCount > 0 ? (
          <div className="detail-actions" style={{ marginTop: '20px' }}>
            <button type="button" className="ghost-button" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>
              {(t.showMore ?? 'SHOW MORE ({remaining} REMAINING)').replace('{remaining}', String(remainingCount))}
            </button>
          </div>
        ) : null}
      </Reveal>
    </section>
  )
}
