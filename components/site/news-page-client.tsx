'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { useSite } from '@/components/site/site-provider'
import { Reveal } from '@/components/site/reveal'
import type { NewsItem } from '@/lib/types'

export function NewsPageClient({ news }: { news: NewsItem[] }) {
  const { t } = useSite()

  return (
    <section className="news-section section-pad">
      <div className="section-top">
        <div>
          <div className="section-label">{t.newsLabel ?? '04 / FROM THE SERIES'}</div>
          <h2>{t.news}</h2>
        </div>
        <p>{t.newsNotes ?? 'NEWS · NOTES · PORTRAITS'}</p>
      </div>

      {news.length === 0 ? (
        <p className="muted-copy">{t.noNews ?? 'NO PUBLISHED NEWS'}</p>
      ) : (
        <div className="news-grid">
          {news.map((item, index) => (
            <Reveal as="article" key={item.slug} delay={Math.min(index * 70, 210)}>
              {item.coverUrl ? (
                <img
                  src={item.coverUrl}
                  alt=""
                  loading="lazy"
                  style={{ width: '100%', aspectRatio: '16 / 10', objectFit: 'cover', borderRadius: 12, marginBottom: 18 }}
                />
              ) : null}
              <span>
                {item.date} · {item.category}
              </span>
              <h3 style={{ overflowWrap: 'anywhere' }}>{item.title}</h3>
              <p className="muted-copy" style={{ overflowWrap: 'anywhere' }}>
                {item.excerpt}
              </p>
              <Link className="text-link" href={`/news/${item.slug}`}>
                {t.readStory ?? 'Read the story'} <ArrowUpRight />
              </Link>
            </Reveal>
          ))}
        </div>
      )}
    </section>
  )
}
