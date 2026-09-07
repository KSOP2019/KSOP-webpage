import { RankingPageClient } from '@/components/site/ranking-page-client'
import { getPlayers } from '@/lib/data'

export default async function RankingPage() {
  const players = await getPlayers()
  return <RankingPageClient players={players.filter((player) => player.published)} />
}
