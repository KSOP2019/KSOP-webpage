'use client'

import Link from 'next/link'
import { useSite } from '@/components/site/site-provider'
import { Reveal } from '@/components/site/reveal'
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

  return (
    <section className="section-pad">
      <div className="section-top">
        <div>
          <div className="section-label">{t.eventDetail ?? 'EVENT DETAIL'}</div>
          <h2>{event.name}</h2>
        </div>
        <div className="series-meta">
          <strong>{event.date}</strong>
          <span>{event.dayLabel}</span>
          <span>{event.type}</span>
        </div>
      </div>

      <Reveal className="event-detail" style={{ marginTop: 0 }}>
        <div className="detail-facts">
          <div>
            <span>{t.factBuyin ?? 'BUY-IN'}</span>
            <strong>{event.buyIn}</strong>
          </div>
          <div>
            <span>GTD</span>
            <strong>{event.gtd}</strong>
          </div>
          <div>
            <span>{t.factChips ?? 'STARTING CHIPS'}</span>
            <strong>{event.startingChips.toLocaleString()}</strong>
          </div>
          <div>
            <span>{t.factLate ?? 'LATE REG.'}</span>
            <strong>{event.lateReg}</strong>
          </div>
          <div>
            <span>{t.eventStatus ?? 'EVENT STATUS'}</span>
            <strong>{t.statusPending ?? 'STATUS PENDING'}</strong>
          </div>
          <div>
            <span>{t.regStatus ?? 'REGISTRATION STATUS'}</span>
            <strong>{t.regPending ?? 'REGISTRATION PENDING'}</strong>
          </div>
        </div>

        <div className="blind-label">{t.blindStructure ?? 'BLIND STRUCTURE'}</div>
        <div className="blind-table">
          <div>
            <span>{t.blindLevel ?? 'LEVEL'}</span>
            <span>{t.blindSmallBig ?? 'SMALL / BIG'}</span>
            <span>{t.blindAnte ?? 'ANTE'}</span>
          </div>
          {event.blindStructure.map((level) => (
            <div key={level.level}>
              <span>{level.level}</span>
              <strong>
                {level.small} / {level.big}
              </strong>
              <span>{level.ante}</span>
            </div>
          ))}
        </div>

        <div className="blind-label">{t.resultLabel ?? 'RESULT'}</div>
        <p className="muted-copy" style={{ marginTop: '12px' }}>
          {t.resultPending ?? 'RESULT DATA PENDING'}
        </p>

        <div className="blind-label">{t.liveLabel ?? 'LIVE'}</div>
        <p className="muted-copy" style={{ marginTop: '12px' }}>
          {t.livePending ?? 'LIVE DATA PENDING'}
        </p>

        <div className="detail-actions">
          <button className="primary-cta" type="button" disabled aria-disabled="true" title={t.regPending ?? 'Registration not yet available'}>
            {t.regPending ?? 'REGISTRATION PENDING'}
          </button>
          <Link className="ghost-button" href="/events">
            {t.backToSchedule ?? 'Back to schedule'}
          </Link>
        </div>
      </Reveal>

      <p className="muted-copy" style={{ marginTop: '24px' }}>
        {seriesVenue} · {seriesDate}
      </p>
    </section>
  )
}
