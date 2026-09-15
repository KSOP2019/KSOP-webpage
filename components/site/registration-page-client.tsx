'use client'

import Link from 'next/link'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { useSite } from '@/components/site/site-provider'
import { GlassCard } from '@/components/ui/glass-card'
import type { EventItem } from '@/lib/types'

export function RegistrationPageClient({ event, venue }: { event: EventItem; venue: string }) {
  const { t } = useSite()

  return (
    <section className="section-pad registration-page">
      <div className="section-top">
        <div>
          <div className="section-label">{t.regStatus}</div>
          <h2>{event.name}</h2>
        </div>
        <div className="series-meta">
          <strong>{event.date}</strong>
          <span>{venue}</span>
          <span>{event.type}</span>
        </div>
      </div>

      <GlassCard asChild>
        <div className="event-detail" style={{ marginTop: 0 }}>
          <div className="detail-facts">
            <div><span>{t.factBuyin}</span><strong>{event.buyIn}</strong></div>
            <div><span>GTD</span><strong>{event.gtd}</strong></div>
            <div><span>{t.factChips}</span><strong>{event.startingChips.toLocaleString()}</strong></div>
            <div><span>{t.factLate}</span><strong>{event.lateReg}</strong></div>
          </div>

          <div style={{ display: 'grid', gap: 10, marginTop: 24 }}>
            <span className="section-label">{t.regStatus}</span>
            <strong>{t.regPending}</strong>
            <p className="muted-copy">Registration details are shown only when an official registration channel is confirmed. No placeholder or dummy submission is used.</p>
          </div>

          <div className="detail-actions" style={{ marginTop: 24 }}>
            <Link className="primary-cta" href={`/events/${event.id}`}>
              {t.viewEvent} <ArrowUpRight />
            </Link>
            <Link className="ghost-button" href="/events">
              <ArrowLeft /> {t.viewAllEvents}
            </Link>
          </div>
        </div>
      </GlassCard>
    </section>
  )
}
