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
          <div className="section-label">{t.scheduleLabel}</div>
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
            key={category}
          >
            {category}
          </button>
        ))}
      </div>

      {selectedCategory === 'DAY' ? (
        <div className="date-filter" style={{ display: 'flex', gap: '14px', marginBottom: '20px' }}>
          <button type="button" className={selectedDate === 'ALL' ? 'is-active' : ''} onClick={() => { setSelectedDate('ALL'); setVisibleCount(PAGE_SIZE) }}>
            {t.allDates}
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
            {t.showing
              .replace('{shown}', String(shownEvents.length))
              .replace('{total}', String(visibleEvents.length))}
          </p>
        ) : null}
        {visibleEvents.length === 0 ? (
          <div>
            <p className="muted-copy">{t.noEvents}</p>
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
                {t.clearFilters}
              </button>
            </div>
          </div>
        ) : null}
        {shownEvents.map((event) => (
          <article
            className="schedule-item event-row glass"
            data-glass="card"
            key={event.id}
            style={{
              border: '1px solid var(--border)',
              borderRadius: 18,
              overflow: 'hidden',
              padding: '18px 20px',
              marginBottom: 12,
              background: 'var(--glass-surface, rgba(255,255,255,.62))',
            }}
          >
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
                  style={{ width: 56, height: 56, borderRadius: 12, objectFit: 'cover', flex: '0 0 56px' }}
                />
              ) : null}
              <span className="event-title">
                <b>{event.name}</b>
                <small>
                  {event.type} · {t.buyin} {event.buyInType} · {event.gtd} GTD
                </small>
              </span>
              <ArrowUpRight className="chevron" aria-hidden="true" />
            </Link>
          </article>
        ))}
        {remainingCount > 0 ? (
          <div className="detail-actions" style={{ marginTop: '20px' }}>
            <button type="button" className="ghost-button" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>
              {t.showMore.replace('{remaining}', String(remainingCount))}
            </button>
          </div>
        ) : null}
      </Reveal>
    </section>
  )
}
