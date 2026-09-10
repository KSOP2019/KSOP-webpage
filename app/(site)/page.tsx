import type { Metadata } from 'next'
import { HomeView } from '@/components/site/home-view'
import { getEvents, getNews, getPlayers, getRankedPlayers } from '@/lib/data'
import { SITE_DESCRIPTION } from '@/lib/site-url'

// CMS images (hero/logos) refresh without redeploy.
export const revalidate = 120

export const metadata: Metadata = {
  description: SITE_DESCRIPTION,
  alternates: { canonical: '/' },
}

export default async function HomePage() {
  const [events, players, news, ranked] = await Promise.all([getEvents(), getPlayers(), getNews(), getRankedPlayers(10)])

  return <HomeView events={events} players={players} news={news.filter((item) => item.published)} ranked={ranked} />
}
