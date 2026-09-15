import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SiteProvider } from '@/components/site/site-provider'
import { SiteShell } from '@/components/site/site-shell'
import { GlassCard } from '@/components/ui/glass-card'
import { eventDetailMedia } from '@/lib/event-images'
import { getEvent, getSiteContent } from '@/lib/data'

export default async function RegisterPage({ params }: { params: Promise<{ 'event-slug': string }> }) {
  const { 'event-slug': eventSlug } = await params
  const [event, content] = await Promise.all([getEvent(eventSlug), getSiteContent()])
  if (!event) notFound()

  const media = eventDetailMedia(event)

  return (
    <SiteProvider initialContent={content}>
      <SiteShell>
        <section className="section-pad event-detail-page registration-entry-page">
          <div className="section-top event-detail-top">
            <div>
              <div className="section-label">REGISTRATION</div>
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
              <img src={media.src} alt="" />
            </figure>
          ) : null}

          <GlassCard asChild>
            <div className="event-detail" style={{ marginTop: 0 }}>
              <div className="detail-facts">
                <div><span>BUY-IN</span><strong>{event.buyIn}</strong></div>
                <div><span>GTD</span><strong>{event.gtd}</strong></div>
                <div><span>STARTING STACK</span><strong>{event.startingChips ? event.startingChips.toLocaleString() : 'TBA'}</strong></div>
                <div><span>LATE REGISTRATION</span><strong>{event.lateReg || 'TBA'}</strong></div>
              </div>

              <div className="registration-notice">
                <span className="section-label">ENTRY STATUS</span>
                <h3>Event entry information</h3>
                <p>공식 참가 링크가 확정되기 전까지 이벤트 정보 확인 페이지로 운영됩니다. 확정되지 않은 결제·참가 링크는 노출하지 않습니다.</p>
              </div>

              <div className="detail-actions">
                <Link className="primary-cta" href={`/events/${event.id}`}>VIEW EVENT</Link>
                <Link className="ghost-button" href="/events">ALL EVENTS</Link>
              </div>
            </div>
          </GlassCard>
        </section>
      </SiteShell>
    </SiteProvider>
  )
}
