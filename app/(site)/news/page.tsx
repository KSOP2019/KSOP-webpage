import type { Metadata } from 'next'
import { NewsPageClient } from '@/components/site/news-page-client'
import { getNews } from '@/lib/data'
import { seedNews } from '@/lib/seed'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: '뉴스',
  description: 'KSOP 뉴스 — 시리즈 소식과 이야기. News and stories from the Korea Series of Poker.',
  alternates: { canonical: '/news' },
}

export default async function NewsPage() {
  let news
  try {
    news = await getNews()
  } catch (error) {
    if (process.env.VERCEL_ENV !== 'preview') throw error
    news = seedNews
  }
  const publishedNews = news.filter((item) => item.published)

  return <NewsPageClient news={publishedNews} />
}
