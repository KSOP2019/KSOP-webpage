import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getEvents, getSiteContent } from '@/lib/data'
import { getAllSeries, getSeries, getSeriesDateRange, getSeriesEvents } from '@/lib/series'

type PageProps = { params: Promise<{ 'series-slug': string }> }

const nav = [
  ['SCHEDULE', '/schedule'],
  ['EVENT', '/events'],
  ['RANKING', '/ranking'],
  ['NEWS', '/news'],
  ['ABOUT', '/about'],
] as const

export function generateStaticParams() {
  return getAllSeries().map((series) => ({ 'series-slug': series.slug }))
}

export async function generateMetadata({ params }: PageProps) {
  const { 'series-slug': slug } = await params
  const series = getSeries(slug)
  if (!series) return { title: 'Series not found · KSOP' }
  return { title: `${series.title.trim()} · KSOP Schedule` }
}

export default async function SeriesDetailPage({ params }: PageProps) {
  const { 'series-slug': slug } = await params
  const series = getSeries(slug)

  if (!series) notFound()

  const [events, content] = await Promise.all([getEvents(), getSiteContent()])
  const seriesEvents = getSeriesEvents(series, events)
  const dateRange = getSeriesDateRange(seriesEvents) ?? series.periodHint

  return (
    <main className="detail-page series-detail">
      <header className="site-header detail-header">
        <Link href="/" className="brand"><img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%EB%88%84%EB%81%BC%EB%A1%9C%EA%B3%A02-OT3NlxHk30TAmPPpNIcNvNtvTVM74n.png" alt="KSOP Korea Series of Poker" /></Link>
        <nav className="nav-links">{nav.map(([label, href]) => <Link key={href} href={href} className={href === '/schedule' ? 'active' : ''}>{label}</Link>)}</nav>
      </header>

      <section className="detail-hero">
        <div className="detail-kicker">01 / SCHEDULE · SERIES</div>
        <div className="detail-hero-grid">
          <h1>{series.title}</h1>
          <div>
            {dateRange ? <p>{dateRange}</p> : null}
            <p className="muted-copy" style={{ marginTop: '12px' }}>
              {seriesEvents.length} EVENTS{content.seriesVenue ? ` · ${content.seriesVenue}` : ''}
            </p>
          </div>
        </div>
      </section>

      <section className="detail-list" aria-label={`${series.title.trim()} series details`}>
        <div className="detail-facts series-facts">
          <div>
            <span>SERIES</span>
            <strong>{series.title.trim()}</strong>
          </div>
          <div>
            <span>DATE RANGE</span>
            <strong>{dateRange ?? 'TBA'}</strong>
          </div>
          <div>
            <span>EVENTS</span>
            <strong>{seriesEvents.length}</strong>
          </div>
          {content.seriesVenue ? (
            <div>
              <span>VENUE</span>
              <strong>{content.seriesVenue}</strong>
            </div>
          ) : null}
        </div>

        <div className="section-label" style={{ marginTop: '48px' }}>EVENT LIST</div>

        {seriesEvents.length === 0 ? (
          <p className="muted-copy" style={{ marginTop: '24px' }}>EVENT SCHEDULE PENDING</p>
        ) : (
          <div style={{ marginTop: '12px' }}>
            {seriesEvents.map((event, index) => (
              <Link
                key={event.id}
                className="detail-row series-event"
                href={`/events/${event.id}`}
                aria-label={`${event.name} event detail`}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                <span className="series-event-body">
                  <h2>{event.name}</h2>
                  <span className="series-event-meta muted-copy">
                    <span>{event.date}</span>
                    <span>{event.dayLabel}</span>
                    <span>{event.type}</span>
                    <span>Buy-in {event.buyIn}</span>
                    <span>{event.gtd} GTD</span>
                  </span>
                </span>
                <span className="detail-arrow">↗</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <footer className="detail-footer">
        <span>THE KOREA SERIES OF POKER · 2026</span>
        <span style={{ display: 'flex', gap: '24px' }}>
          <Link href="/schedule">BACK TO SCHEDULE ↗</Link>
          <Link href="/">BACK TO HOME ↗</Link>
        </span>
      </footer>
    </main>
  )
}
