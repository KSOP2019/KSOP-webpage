import { NewsPageClient } from '@/components/site/news-page-client'
import { getNews } from '@/lib/data'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function NewsPage() {
  const news = await getNews()
  const publishedNews = news.filter((item) => item.published)

  return <NewsPageClient news={publishedNews} />
}
