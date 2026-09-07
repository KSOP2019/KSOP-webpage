import { HomeView } from '@/components/site/home-view'
import { getEvents, getNews, getPlayers } from '@/lib/data'

export default async function HomePage() {
  const [events, players, news] = await Promise.all([getEvents(), getPlayers(), getNews()])

  return <HomeView events={events} players={players} news={news.filter((item) => item.published)} />
}
