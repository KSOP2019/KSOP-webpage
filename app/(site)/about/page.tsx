import Link from 'next/link'
import { Reveal } from '@/components/site/reveal'
import { getSiteContent } from '@/lib/data'

export default async function AboutPage() {
  const content = await getSiteContent()

  return (
    <section className="intro section-pad">
      <div className="section-label">01 / THE SERIES</div>
      <Reveal className="intro-content">
        <h2>
          More than
          <br />
          <em>a tournament.</em>
        </h2>
        <p className="large-copy">{content.introBody}</p>
        <p className="muted-copy" style={{ marginTop: '24px' }}>
          {content.seriesDate} · {content.seriesVenue}
          <br />
          {content.seriesGtd}
        </p>
        <Link className="text-link" href="/events" style={{ marginTop: '32px', display: 'inline-flex' }}>
          Explore the schedule
        </Link>
        <div className="detail-actions" style={{ marginTop: '32px' }}>
          <Link className="ghost-button" href="/about/series">
            THE SERIES
          </Link>
          <Link className="ghost-button" href="/about/venue">
            THE VENUE
          </Link>
        </div>
      </Reveal>
    </section>
  )
}
