import { HomeView } from '@/components/site/home-view'
import { getEvents, getNews, getPlayers } from '@/lib/data'

// CMS images (hero/logos) refresh without redeploy.
export const revalidate = 120

export default async function HomePage() {
  const [events, players, news] = await Promise.all([getEvents(), getPlayers(), getNews()])

  return <HomeView events={events} players={players} news={news.filter((item) => item.published)} />
}
