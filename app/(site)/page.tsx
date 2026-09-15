import type { Metadata } from 'next'
import { HomeViewV2 } from '@/components/site/home-view-v2'
import { getEvents, getNews, getRankedPlayers } from '@/lib/data'
import { getScheduleContent } from '@/lib/schedule-content'
import { SITE_DESCRIPTION } from '@/lib/site-url'

export const revalidate = 120

export const metadata: Metadata = {
  description: SITE_DESCRIPTION,
  alternates: { canonical: '/' },
}

export default async function HomePage() {
  const [events, news, ranked, scheduleContent] = await Promise.all([
    getEvents(),
    getNews(),
    getRankedPlayers(10),
    getScheduleContent(),
  ])

  return (
    <HomeViewV2
      events={events}
      news={news.filter((item) => item.published)}
      ranked={ranked}
      scheduleContent={scheduleContent}
    />
  )
}
