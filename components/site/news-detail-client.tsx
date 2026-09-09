'use client'

import Link from 'next/link'
import { useSite } from '@/components/site/site-provider'
import type { NewsItem } from '@/lib/types'

export function NewsDetailClient({ item }: { item: NewsItem }) {
  const { t } = useSite()

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
        {item.coverUrl ? (
          <img
            src={item.coverUrl}
            alt=""
            loading="lazy"
            style={{ width: '100%', aspectRatio: '16 / 10', objectFit: 'cover', borderRadius: 12, marginBottom: 18 }}
          />
        ) : null}
        <p className="large-copy">{item.body}</p>
        <Link className="text-link" href="/news" style={{ marginTop: '24px', display: 'inline-flex' }}>
          {t.backToNews ?? 'Back to news'}
        </Link>
      </article>
    </section>
  )
}
