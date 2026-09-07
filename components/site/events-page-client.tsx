'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ArrowUpRight, ChevronDown } from 'lucide-react'
import { useSite } from '@/components/site/site-provider'
import { EVENT_CATEGORIES } from '@/lib/nav'
import { filterEvents } from '@/lib/event-filters'
import type { EventItem } from '@/lib/types'

export function EventsPageClient({ events }: { events: EventItem[] }) {
  const { t, content } = useSite()
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get('category') ?? 'ALL EVENT'
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [selectedDate, setSelectedDate] = useState('ALL')
  const [open, setOpen] = useState(-1)

  const dates = Array.from(new Set(events.map((event) => event.date)))
  const visibleEvents = useMemo(
    () => filterEvents(events, selectedCategory, selectedDate),
    [events, selectedCategory, selectedDate],
  )

  return (
    <section className="schedule-section section-pad">
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
            }}
          >
            {category}
          </button>
        ))}
      </div>

      {selectedCategory === 'DAY' ? (
        <div className="date-filter" style={{ display: 'flex', gap: '14px', marginBottom: '20px' }}>
          <button type="button" className={selectedDate === 'ALL' ? 'is-active' : ''} onClick={() => setSelectedDate('ALL')}>
            ALL DATES
          </button>
          {dates.map((date) => (
            <button
              key={date}
              type="button"
              className={selectedDate === date ? 'is-active' : ''}
              onClick={() => setSelectedDate(date)}
            >
              {date}
            </button>
          ))}
        </div>
      ) : null}

      <div className="schedule-list">
        {visibleEvents.map((event, index) => (
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
              <span className="event-type">{event.type}</span>
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
      </div>
    </section>
  )
}
