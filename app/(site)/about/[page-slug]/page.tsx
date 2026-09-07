import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSiteContent } from '@/lib/data'

const ABOUT_TOPICS = [
  { slug: 'series', title: 'THE SERIES' },
  { slug: 'venue', title: 'THE VENUE' },
] as const

type PageProps = { params: Promise<{ 'page-slug': string }> }

export function generateStaticParams() {
  return ABOUT_TOPICS.map((topic) => ({ 'page-slug': topic.slug }))
}

export async function generateMetadata({ params }: PageProps) {
  const { 'page-slug': slug } = await params
  const topic = ABOUT_TOPICS.find((item) => item.slug === slug)
  if (!topic) return { title: 'About · KSOP' }
  return { title: `${topic.title} · KSOP About` }
}

export default async function AboutDetailPage({ params }: PageProps) {
  const { 'page-slug': slug } = await params
  const topic = ABOUT_TOPICS.find((item) => item.slug === slug)
  if (!topic) notFound()

  const content = await getSiteContent()
  const isVenue = topic.slug === 'venue'

  return (
    <section className="intro section-pad">
      <div className="section-label">01 / THE SERIES · DETAIL</div>
      <div className="intro-content">
        <h2>{topic.title}</h2>
        <p className="large-copy">{content.introBody}</p>
        <div className="detail-facts" style={{ marginTop: '24px' }}>
          {isVenue ? (
            <>
              <div>
                <span>VENUE</span>
                <strong>{content.seriesVenue}</strong>
              </div>
              <div>
                <span>DATE</span>
                <strong>{content.seriesDate}</strong>
              </div>
            </>
          ) : (
            <>
              <div>
                <span>DATE</span>
                <strong>{content.seriesDate}</strong>
              </div>
              <div>
                <span>VENUE</span>
                <strong>{content.seriesVenue}</strong>
              </div>
              <div>
                <span>GUARANTEED</span>
                <strong>{content.seriesGtd}</strong>
              </div>
            </>
          )}
        </div>
        {isVenue ? (
          <p className="muted-copy" style={{ marginTop: '24px' }}>
            CONTENT PENDING
          </p>
        ) : null}
        <div className="detail-actions" style={{ marginTop: '32px' }}>
          <Link className="ghost-button" href="/about">
            Back to about
          </Link>
          <Link className="text-link" href="/events">
            Explore the schedule
          </Link>
        </div>
      </div>
    </section>
  )
}
