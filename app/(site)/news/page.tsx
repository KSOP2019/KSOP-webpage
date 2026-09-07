import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { getNews } from '@/lib/data'

export default async function NewsPage() {
  const news = await getNews()
  const publishedNews = news.filter((item) => item.published)

  return (
    <section className="news-section section-pad">
      <div className="section-top">
        <div>
          <div className="section-label">04 / FROM THE SERIES</div>
          <h2>NEWS</h2>
        </div>
        <p>NEWS · NOTES · PORTRAITS</p>
      </div>

      {publishedNews.length === 0 ? (
        <p className="muted-copy">NO PUBLISHED NEWS</p>
      ) : (
        <div className="news-grid">
          {publishedNews.map((item) => (
            <article key={item.slug}>
              <span>
                {item.date} · {item.category}
              </span>
              <h3 style={{ overflowWrap: 'anywhere' }}>{item.title}</h3>
              <p className="muted-copy" style={{ overflowWrap: 'anywhere' }}>
                {item.excerpt}
              </p>
              <Link className="text-link" href={`/news/${item.slug}`}>
                Read the story <ArrowUpRight />
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
