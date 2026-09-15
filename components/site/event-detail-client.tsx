'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { useSite } from '@/components/site/site-provider'
import { Reveal } from '@/components/site/reveal'
import { eventDetailMedia } from '@/lib/event-images'
import type { SeriesItem } from '@/lib/series'
import type { EventItem } from '@/lib/types'

export function EventDetailClient({
  event,
  series,
  seriesVenue,
  seriesDate,
}: {
  event: EventItem
  series?: SeriesItem
  seriesVenue: string
  seriesDate: string
}) {
  const { t, language } = useSite()
  const media = eventDetailMedia(event)
  const labels = {
    KR: { allEvents: '전체 이벤트', series: '시리즈 일정', register: '참가하기' },
    EN: { allEvents: 'ALL EVENTS', series: 'SERIES SCHEDULE', register: 'REGISTER' },
    JP: { allEvents: '全イベント', series: 'シリーズ日程', register: '参加する' },
    CN: { allEvents: '全部赛事', series: '系列赛日程', register: '报名' },
  }[language]

  return (
    <section className="section-pad event-detail-page">
      <nav className="muted-copy" aria-label="Breadcrumb" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
        <Link href="/schedule">{labels.series}</Link>
        <span>/</span>
        {series ? (
          <>
            <Link href={`/schedule/${series.slug}`}>{series.title}</Link>
            <span>/</span>
          </>
        ) : null}
        <Link href="/events">{labels.allEvents}</Link>
        <span>/</span>
        <span aria-current="page">{event.name}</span>
      </nav>

      <div className="section-top event-detail-top">
        <div>
          <div className="section-label">{t.eventDetail}</div>
          <h2>{event.name}</h2>
        </div>
        <div className="series-meta">
          <strong>{event.date}</strong>
          <span>{event.dayLabel}</span>
          <span>{event.type}</span>
        </div>
      </div>

      {media.src ? (
        <figure className={`event-detail-media is-${media.fit}`} style={{ margin: '0 0 28px' }}>
          <img src={media.src} alt="" loading="lazy" />
        </figure>
      ) : null}

      <Reveal className="event-detail" style={{ marginTop: 0 }}>
        <div className="detail-facts">
          <div>
            <span>{t.factBuyin}</span>
            <strong>{event.buyIn}</strong>
          </div>
          <div>
            <span>GTD</span>
            <strong>{event.gtd}</strong>
          </div>
          <div>
            <span>{t.factChips}</span>
            <strong>{event.startingChips.toLocaleString()}</strong>
          </div>
          <div>
            <span>{t.factLate}</span>
            <strong>{event.lateReg}</strong>
          </div>
          <div>
            <span>{t.eventStatus}</span>
            <strong>{t.statusPending}</strong>
          </div>
          <div>
            <span>{t.regStatus}</span>
            <strong>{t.regPending}</strong>
          </div>
        </div>

        <div className="blind-label">{t.blindStructure}</div>
        <div className="blind-table">
          <div>
            <span>{t.blindLevel}</span>
            <span>{t.blindSmallBig}</span>
            <span>{t.blindAnte}</span>
          </div>
          {event.blindStructure.map((level) => (
            <div key={level.level}>
              <span>{level.level}</span>
              <strong>{level.small} / {level.big}</strong>
              <span>{level.ante}</span>
            </div>
          ))}
        </div>

        <div className="detail-actions">
          <Link className="primary-cta" href={`/register/${event.id}`}>
            {t.registerShort || labels.register} <ArrowUpRight />
          </Link>
          {series ? (
            <Link className="ghost-button" href={`/schedule/${series.slug}`}>
              {series.title}
            </Link>
          ) : null}
          <Link className="ghost-button" href="/events">
            {labels.allEvents}
          </Link>
        </div>
      </Reveal>

      <p className="muted-copy" style={{ marginTop: 24 }}>
        {seriesVenue}{seriesDate ? ` · ${seriesDate}` : ''}
      </p>
    </section>
  )
}
