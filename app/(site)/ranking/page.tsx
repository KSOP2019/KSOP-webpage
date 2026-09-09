import type { Metadata } from 'next'
import { RankingPageClient } from '@/components/site/ranking-page-client'
import { getPlayers } from '@/lib/data'

export const revalidate = 120

export const metadata: Metadata = {
  title: '랭킹',
  description: 'KSOP 선수 랭킹 — 탑 플레이어. KSOP player rankings and top players.',
  alternates: { canonical: '/ranking' },
}

export default async function RankingPage() {
  const players = await getPlayers()
  return <RankingPageClient players={players.filter((player) => player.published)} />
}
