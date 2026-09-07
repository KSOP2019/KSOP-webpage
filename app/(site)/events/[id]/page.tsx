import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowUpRight } from 'lucide-react'
import { getEvent, getSiteContent } from '@/lib/data'

type PageProps = { params: Promise<{ id: string }> }

export default async function EventDetailPage({ params }: PageProps) {
  const { id } = await params
  const [event, content] = await Promise.all([getEvent(id), getSiteContent()])

  if (!event || !event.published) notFound()

  return (
    <section className="section-pad">
      <div className="section-top">
        <div>
          <div className="section-label">EVENT DETAIL</div>
          <h2>{event.name}</h2>
        </div>
        <div className="series-meta">
          <strong>{event.date}</strong>
          <span>{event.dayLabel}</span>
          <span>{event.type}</span>
        </div>
      </div>

      <div className="event-detail" style={{ marginTop: 0 }}>
        <div className="detail-facts">
          <div>
            <span>BUY-IN</span>
            <strong>{event.buyIn}</strong>
          </div>
          <div>
            <span>GTD</span>
            <strong>{event.gtd}</strong>
          </div>
          <div>
            <span>STARTING CHIPS</span>
            <strong>{event.startingChips.toLocaleString()}</strong>
          </div>
          <div>
            <span>LATE REG.</span>
            <strong>{event.lateReg}</strong>
          </div>
        </div>

        <div className="blind-label">BLIND STRUCTURE</div>
        <div className="blind-table">
          <div>
            <span>LEVEL</span>
            <span>SMALL / BIG</span>
            <span>ANTE</span>
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

        <div className="detail-actions">
          <button className="primary-cta" type="button">
            Register <ArrowUpRight />
          </button>
          <Link className="ghost-button" href="/events">
            Back to schedule
          </Link>
        </div>
      </div>

      <p className="muted-copy" style={{ marginTop: '24px' }}>
        {content.seriesVenue} · {content.seriesDate}
      </p>
    </section>
  )
}
