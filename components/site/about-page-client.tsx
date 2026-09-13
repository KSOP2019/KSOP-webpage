'use client'

import Link from 'next/link'
import { useSite } from '@/components/site/site-provider'
import { Reveal } from '@/components/site/reveal'
import type { SiteContent } from '@/lib/types'

export function AboutTopicClient({
  content,
  slug,
}: {
  content: SiteContent
  slug: 'series' | 'venue'
}) {
  const { t } = useSite()
  const isVenue = slug === 'venue'
  const title = isVenue ? (t.theVenue ?? 'THE VENUE') : (t.theSeries ?? 'THE SERIES')

  return (
    <section className="intro section-pad">
      <div className="section-label">{t.seriesDetail ?? '01 / THE SERIES · DETAIL'}</div>
      <Reveal className="intro-content">
        <h2>{title}</h2>
        <p className="large-copy">{content.introBody}</p>
        <div className="detail-facts" style={{ marginTop: '24px' }}>
          {isVenue ? (
            <>
              <div>
                <span>{t.venueLabel ?? 'VENUE'}</span>
                <strong>{content.seriesVenue}</strong>
              </div>
              <div>
                <span>{t.dateLabel ?? 'DATE'}</span>
                <strong>{content.seriesDate}</strong>
              </div>
            </>
          ) : (
            <>
              <div>
                <span>{t.dateLabel ?? 'DATE'}</span>
                <strong>{content.seriesDate}</strong>
              </div>
              <div>
                <span>{t.venueLabel ?? 'VENUE'}</span>
                <strong>{content.seriesVenue}</strong>
              </div>
              <div>
                <span>{t.guaranteedLabel ?? 'GUARANTEED'}</span>
                <strong>{content.seriesGtd}</strong>
              </div>
            </>
          )}
        </div>
        {isVenue ? (
          <p className="muted-copy" style={{ marginTop: '24px' }}>
            {t.contentPending ?? 'CONTENT PENDING'}
          </p>
        ) : null}
        <div className="detail-actions" style={{ marginTop: '32px' }}>
          <Link className="ghost-button" href="/about">
            {t.backToAbout ?? 'Back to about'}
          </Link>
          <Link className="text-link" href="/events">
            {t.exploreSchedule ?? 'Explore the schedule'}
          </Link>
        </div>
      </Reveal>
    </section>
  )
}
