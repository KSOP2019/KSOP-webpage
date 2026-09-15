import type { Metadata } from 'next'
import { HomeViewV2 } from '@/components/site/home-view-v2'
import { getEvents, getNews, getRankedPlayers } from '@/lib/data'
import { getScheduleContent } from '@/lib/schedule-content'
import { SITE_DESCRIPTION } from '@/lib/site-url'
import type { NewsItem } from '@/lib/types'

export const revalidate = 120

export const metadata: Metadata = {
  description: SITE_DESCRIPTION,
  alternates: { canonical: '/' },
}

const previewFallbackNews: NewsItem[] = [
  {
    slug: 'preview-home-news-001',
    category: 'KSOP JOURNAL',
    date: '2026-11-02',
    title: 'KSOP 2026 SEOUL SERIES 일정 공개',
    excerpt: '2026 SEOUL SERIES의 전체 운영 방향과 데일리 프로그램 구성안을 미리 살펴보는 디자인 검토용 안내로, 확정 전 예시 내용을 담고 있습니다.',
    body: '',
    coverUrl: '/images/ksop-hero-arena.png',
    published: true,
  },
  {
    slug: 'preview-home-news-002',
    category: 'FIELD NOTES',
    date: '2026-10-28',
    title: 'MAIN EVENT 운영 가이드 발표',
    excerpt: 'MAIN EVENT 참가자가 알아야 할 등록 절차와 현장 운영 가이드를 단계별로 정리한 디자인 검토용 예시 문서로, 확정 전 내용을 담고 있습니다.',
    body: '',
    coverUrl: '/images/schedule-main-event.png',
    published: true,
  },
  {
    slug: 'preview-home-news-003',
    category: 'FIELD NOTES',
    date: '2026-10-24',
    title: 'KSOP 선수 등록 시스템 업데이트',
    excerpt: '선수 등록 흐름을 다듬은 시스템 업데이트의 변경점과 이용 방법을 소개하는 디자인 검토용 소식으로, 릴리스 전 예시 화면을 기준으로 합니다.',
    body: '',
    coverUrl: '/images/schedule-warmup.png',
    published: true,
  },
]

export default async function HomePage() {
  const [events, news, ranked, scheduleContent] = await Promise.all([
    getEvents(),
    getNews(),
    getRankedPlayers(10),
    getScheduleContent(),
  ])

  const publishedNews = news.filter((item) => item.published)
  const homeNews = process.env.VERCEL_ENV === 'preview' && publishedNews.length === 0
    ? previewFallbackNews
    : publishedNews

  return (
    <HomeViewV2
      events={events}
      news={homeNews}
      ranked={ranked}
      scheduleContent={scheduleContent}
    />
  )
}