import type { Metadata } from 'next'
import { NewsPageClient } from '@/components/site/news-page-client'
import { getNewsForPreview } from '@/lib/news-preview'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: '뉴스',
  description: 'KSOP 뉴스 — 시리즈 소식과 이야기. News and stories from the Korea Series of Poker.',
  alternates: { canonical: '/news' },
}

export default async function NewsPage() {
  const publishedNews = await getNewsForPreview()

  return <NewsPageClient news={publishedNews} />
}
