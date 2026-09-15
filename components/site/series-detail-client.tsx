'use client'

import Link from 'next/link'
import { ArrowUpRight, CalendarDays, MapPin } from 'lucide-react'
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
  const { t, language } = useSite()
  const grouped = seriesEvents.reduce<Record<string, EventItem[]>>((acc, event) => {
    if (!acc[event.date]) acc[event.date] = []
    acc[event.date].push(event)
    return acc
  }, {})
  const labels = {
    KR: { hub: '시리즈 안내', allEvents: '전체 이벤트', events: '시리즈 이벤트', venue: '장소 / 안내', back: '전체 일정' },
    EN: { hub: 'SERIES GUIDE', allEvents: 'ALL EVENTS', events: 'SERIES EVENTS', venue: 'VENUE / GUIDE', back: 'ALL SERIES' },
    JP: { hub: 'シリーズ案内', allEvents: '全イベント', events: 'シリーズイベント', venue: '会場 / 案内', back: '全日程' },
    CN: { hub: '系列赛指南', allEvents: '全部赛事', events: '系列赛赛事', venue: '场馆 / 指南', back: '全部日程' },
  }[language]
  const venue = series.venue || content.seriesVenue

  return (
    <main className="detail-page series-detail">
      <DetailHeader activeHref="/schedule" />

      <section className="detail-hero">
        <div className="detail-kicker">01 / {labels.hub}</div>
        <div className="detail-hero-grid">
          <div>
            <h1>{series.title}</h1>
            <div className="detail-actions" style={{ marginTop: 22 }}>
              <Link className="ghost-button" href="/schedule">{labels.back}</Link>
              <Link className="primary-cta" href="/events">{labels.allEvents} <ArrowUpRight /></Link>
            </div>
          </div>
          <div>
            {dateRange ? <p><CalendarDays size={16} /> {dateRange}</p> : null}
            {venue ? <p className="muted-copy" style={{ marginTop: 12 }}><MapPin size={16} /> {venue}</p> : null}
            <p className="muted-copy" style={{ marginTop: 12 }}>{seriesEvents.length} {t.eventsWord}</p>
          </div>
        </div>
      </section>

      {series.image ? (
        <section className="detail-list" style={{ paddingTop: 0 }}>
          <figure className="event-detail-media is-cover" style={{ margin: 0 }}>
            <img src={series.image} alt="" loading="eager" />
          </figure>
        </section>
      ) : null}

      <Reveal as="section" className="detail-list" ariaLabel={`${series.title.trim()} series details`}>
        <div className="detail-facts series-facts">
          <div><span>{t.seriesWord}</span><strong>{series.title.trim()}</strong></div>
          <div><span>{t.dateRangeLabel}</span><strong>{dateRange ?? t.tba}</strong></div>
          <div><span>{labels.events}</span><strong>{seriesEvents.length}</strong></div>
          {venue ? <div><span>{t.venueLabel}</span><strong>{venue}</strong></div> : null}
        </div>

        <div className="section-label" style={{ marginTop: 48 }}>{labels.events}</div>

        {seriesEvents.length === 0 ? (
          <div className="premium-empty-state" style={{ marginTop: 18 }}>
            <strong>{t.schedulePending}</strong>
            <Link className="text-link" href="/events">{labels.allEvents} <ArrowUpRight /></Link>
          </div>
        ) : (
          Object.entries(grouped).map(([date, dayEvents]) => (
            <div key={date} style={{ marginTop: 26 }}>
              <div className="section-label">{date}</div>
              <div style={{ marginTop: 10 }}>
                {dayEvents.map((event, index) => (
                  <Link
                    key={event.id}
                    className="detail-row series-event premium-depth-card"
                    href={`/events/${event.id}`}
                    aria-label={`${event.name} event detail`}
                    style={{ borderRadius: 18, marginBottom: 10, overflow: 'hidden' }}
                  >
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <span className="series-event-body">
                      <h2>{event.name}</h2>
                      <span className="series-event-meta muted-copy">
                        <span>{event.dayLabel}</span>
                        <span>{event.type}</span>
                        <span>{t.factBuyin} {event.buyIn}</span>
                        <span>{event.gtd} GTD</span>
                      </span>
                    </span>
                    <span className="detail-arrow">↗</span>
                  </Link>
                ))}
              </div>
            </div>
          ))
        )}

        {venue ? (
          <div style={{ marginTop: 56 }}>
            <div className="section-label">{labels.venue}</div>
            <div className="detail-facts" style={{ marginTop: 16 }}>
              <div><span>{t.venueLabel}</span><strong>{venue}</strong></div>
              {dateRange ? <div><span>{t.dateLabel}</span><strong>{dateRange}</strong></div> : null}
            </div>
          </div>
        ) : null}
      </Reveal>

      <footer className="detail-footer">
        <span>THE KOREA SERIES OF POKER · 2026</span>
        <span style={{ display: 'flex', gap: 24 }}>
          <Link href="/schedule">{labels.back}</Link>
          <Link href="/events">{labels.allEvents}</Link>
        </span>
      </footer>
    </main>
  )
}
