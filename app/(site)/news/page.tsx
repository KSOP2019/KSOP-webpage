import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { getNews } from '@/lib/data'

export default async function NewsPage() {
  const news = await getNews()

  return (
    <section className="news-section section-pad">
      <div className="section-top">
        <div>
          <div className="section-label">04 / FROM THE SERIES</div>
          <h2>NEWS</h2>
        </div>
        <p>NEWS · NOTES · PORTRAITS</p>
      </div>

      <div className="news-grid" style={{ display: 'flex', flexDirection: 'column' }}>
        {news
          .filter((item) => item.published)
          .map((item) => (
            <article key={item.slug} style={{ borderBottom: '1px solid var(--border)', padding: '24px 0' }}>
              <span>
                {item.date} · {item.category}
              </span>
              <h3>{item.title}</h3>
              <p className="muted-copy">{item.excerpt}</p>
              <Link className="text-link" href={`/news/${item.slug}`}>
                Read the story <ArrowUpRight />
              </Link>
            </article>
          ))}
      </div>
    </section>
  )
}
