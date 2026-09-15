'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ArrowUpRight, CalendarDays, Search } from 'lucide-react'
import { useSite } from '@/components/site/site-provider'
import { Reveal } from '@/components/site/reveal'
import { EVENT_CATEGORIES } from '@/lib/nav'
import { eventCardImage } from '@/lib/event-images'
import { filterEvents } from '@/lib/event-filters'
import type { EventItem } from '@/lib/types'

const PAGE_SIZE = 15

export function EventsPageClient({ events }: { events: EventItem[] }) {
  const { t, content, language } = useSite()
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get('category') ?? 'ALL EVENT'
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [selectedDate, setSelectedDate] = useState('ALL')
  const [query, setQuery] = useState('')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const labels = {
    KR: { kicker: '02 / 전체 이벤트', title: '전체 이벤트', series: '시리즈 일정', search: '이벤트명 · 종목 검색' },
    EN: { kicker: '02 / ALL EVENTS', title: 'ALL EVENTS', series: 'SERIES SCHEDULE', search: 'Search event or game type' },
    JP: { kicker: '02 / 全イベント', title: '全イベント', series: 'シリーズ日程', search: 'イベント名・種目を検索' },
    CN: { kicker: '02 / 全部赛事', title: '全部赛事', series: '系列赛日程', search: '搜索赛事名称或类型' },
  }[language]

  const dates = Array.from(new Set(events.map((event) => event.date)))
  const visibleEvents = useMemo(() => {
    const base = filterEvents(events, selectedCategory, selectedDate)
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return base
    return base.filter((event) =>
      `${event.name} ${event.type} ${event.dayLabel}`.toLowerCase().includes(normalizedQuery),
    )
  }, [events, selectedCategory, selectedDate, query])
  const shownEvents = visibleEvents.slice(0, visibleCount)
  const remainingCount = visibleEvents.length - shownEvents.length

  return (
    <section className="schedule-section section-pad events-density">
      <div className="section-top">
        <div>
          <div className="section-label">{labels.kicker}</div>
          <h2>{labels.title}</h2>
        </div>
        <div className="series-meta">
          <strong>{content.seriesDate}</strong>
          <span>{content.seriesVenue}</span>
          <Link className="text-link" href="/schedule">{labels.series} <ArrowUpRight /></Link>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 14, marginBottom: 22 }}>
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

        <label
          className="glass"
          data-glass="subtle"
          style={{ display: 'flex', alignItems: 'center', gap: 10, borderRadius: 14, padding: '12px 14px' }}
        >
          <Search size={17} aria-hidden="true" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setVisibleCount(PAGE_SIZE) }}
            placeholder={labels.search}
            aria-label={labels.search}
            style={{ width: '100%', border: 0, outline: 0, background: 'transparent', color: 'inherit', font: 'inherit' }}
          />
        </label>

        {dates.length > 0 ? (
          <div className="date-filter" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button type="button" className={selectedDate === 'ALL' ? 'is-active' : ''} onClick={() => { setSelectedDate('ALL'); setVisibleCount(PAGE_SIZE) }}>
              <CalendarDays size={14} aria-hidden="true" /> {t.allDates}
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
      </div>

      <Reveal className="schedule-list">
        {visibleEvents.length > 0 ? (
          <p className="muted-copy" style={{ marginBottom: 12 }}>
            {t.showing
              .replace('{shown}', String(shownEvents.length))
              .replace('{total}', String(visibleEvents.length))}
          </p>
        ) : null}
        {visibleEvents.length === 0 ? (
          <div>
            <p className="muted-copy">{t.noEvents}</p>
            <div className="detail-actions" style={{ marginTop: 16 }}>
              <button
                type="button"
                className="ghost-button"
                onClick={() => {
                  setSelectedCategory('ALL EVENT')
                  setSelectedDate('ALL')
                  setQuery('')
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
                <small>{event.type} · {t.buyin} {event.buyIn} · {event.gtd} GTD</small>
              </span>
              <ArrowUpRight className="chevron" aria-hidden="true" />
            </Link>
          </article>
        ))}
        {remainingCount > 0 ? (
          <div className="detail-actions" style={{ marginTop: 20 }}>
            <button type="button" className="ghost-button" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>
              {t.showMore.replace('{remaining}', String(remainingCount))}
            </button>
          </div>
        ) : null}
      </Reveal>
    </section>
  )
}
