'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ArrowUpRight, ChevronDown } from 'lucide-react'
import { useSite } from '@/components/site/site-provider'
import { EVENT_CATEGORIES } from '@/lib/nav'
import { filterEvents } from '@/lib/event-filters'
import type { EventItem } from '@/lib/types'

const PAGE_SIZE = 15

export function EventsPageClient({ events }: { events: EventItem[] }) {
  const { t, content } = useSite()
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get('category') ?? 'ALL EVENT'
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [selectedDate, setSelectedDate] = useState('ALL')
  const [open, setOpen] = useState(-1)
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
          <div className="section-label">02 / UPCOMING SERIES</div>
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
            key={category}
            type="button"
            className={selectedCategory === category ? 'is-active' : ''}
            onClick={() => {
              setSelectedCategory(category)
              setSelectedDate('ALL')
              setVisibleCount(PAGE_SIZE)
              setOpen(-1)
            }}
          >
            {category}
          </button>
        ))}
      </div>

      {selectedCategory === 'DAY' ? (
        <div className="date-filter" style={{ display: 'flex', gap: '14px', marginBottom: '20px' }}>
          <button type="button" className={selectedDate === 'ALL' ? 'is-active' : ''} onClick={() => { setSelectedDate('ALL'); setVisibleCount(PAGE_SIZE); setOpen(-1) }}>
            ALL DATES
          </button>
          {dates.map((date) => (
            <button
              key={date}
              type="button"
              className={selectedDate === date ? 'is-active' : ''}
              onClick={() => { setSelectedDate(date); setVisibleCount(PAGE_SIZE); setOpen(-1) }}
            >
              {date}
            </button>
          ))}
        </div>
      ) : null}

      <div className="schedule-list">
        {visibleEvents.length > 0 ? (
          <p className="muted-copy" style={{ marginBottom: '12px' }}>
            SHOWING {shownEvents.length} OF {visibleEvents.length} EVENTS
          </p>
        ) : null}
        {visibleEvents.length === 0 ? (
          <div>
            <p className="muted-copy">NO EVENTS MATCH THE SELECTED FILTERS</p>
            <div className="detail-actions" style={{ marginTop: '16px' }}>
              <button
                type="button"
                className="ghost-button"
                onClick={() => {
                  setSelectedCategory('ALL EVENT')
                  setSelectedDate('ALL')
                  setVisibleCount(PAGE_SIZE)
                  setOpen(-1)
                }}
              >
                CLEAR FILTERS
              </button>
            </div>
          </div>
        ) : null}
        {shownEvents.map((event, index) => (
          <article className={open === index ? 'schedule-item open' : 'schedule-item'} key={event.id}>
            <button className="schedule-trigger" type="button" onClick={() => setOpen(open === index ? -1 : index)}>
              <span className="date">
                <strong>{event.date}</strong>
                <span>{event.dayLabel}</span>
              </span>
              <span className="event-title">
                <b>{event.name}</b>
                <small>
                  {event.type} · Buy-in {event.buyInType} · {event.gtd} GTD
                </small>
              </span>
              <ChevronDown className="chevron" />
            </button>
            {open === index && (
              <div className="event-detail">
                <div className="detail-actions">
                  <Link className="primary-cta" href={`/events/${event.id}`}>
                    Open event page <ArrowUpRight />
                  </Link>
                </div>
              </div>
            )}
          </article>
        ))}
        {remainingCount > 0 ? (
          <div className="detail-actions" style={{ marginTop: '20px' }}>
            <button type="button" className="ghost-button" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>
              SHOW MORE ({remainingCount} REMAINING)
            </button>
          </div>
        ) : null}
      </div>
    </section>
  )
}
