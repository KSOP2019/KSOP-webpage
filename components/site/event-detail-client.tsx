'use client'

import Link from 'next/link'
import { useSite } from '@/components/site/site-provider'
import { Reveal } from '@/components/site/reveal'
import { eventDetailMedia } from '@/lib/event-images'
import type { EventItem } from '@/lib/types'

export function EventDetailClient({
  event,
  seriesVenue,
  seriesDate,
}: {
  event: EventItem
  seriesVenue: string
  seriesDate: string
}) {
  const { t } = useSite()
  const media = eventDetailMedia(event)

  return (
    <section className="section-pad event-detail-page">
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
          <div><span>{t.factBuyin}</span><strong>{event.buyIn}</strong></div>
          <div><span>GTD</span><strong>{event.gtd}</strong></div>
          <div><span>{t.factChips}</span><strong>{event.startingChips.toLocaleString()}</strong></div>
          <div><span>{t.factLate}</span><strong>{event.lateReg}</strong></div>
          <div><span>{t.eventStatus}</span><strong>{t.statusPending}</strong></div>
          <div><span>{t.regStatus}</span><strong>{t.regPending}</strong></div>
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
            {t.registerShort || t.register}
          </Link>
          <Link className="ghost-button" href="/events">
            {t.backToSchedule}
          </Link>
        </div>
      </Reveal>

      <p className="muted-copy" style={{ marginTop: '24px' }}>
        {seriesVenue} · {seriesDate}
      </p>
    </section>
  )
}
