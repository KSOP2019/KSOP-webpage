import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getNewsItem } from '@/lib/data'

type PageProps = { params: Promise<{ slug: string }> }

export default async function NewsDetailPage({ params }: PageProps) {
  const { slug } = await params
  const item = await getNewsItem(slug)
  if (!item || !item.published) notFound()

  return (
    <section className="news-section section-pad">
      <div className="section-top">
        <div>
          <div className="section-label">{item.category}</div>
          <h2>{item.title}</h2>
        </div>
        <p>{item.date}</p>
      </div>

      <article className="event-detail">
        <p className="large-copy">{item.body}</p>
        <Link className="text-link" href="/news" style={{ marginTop: '24px', display: 'inline-flex' }}>
          Back to news
        </Link>
      </article>
    </section>
  )
}
