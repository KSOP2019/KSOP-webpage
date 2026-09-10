import type { Metadata } from 'next'
import { RankingPageClient } from '@/components/site/ranking-page-client'
import { getRankedPlayers } from '@/lib/data'

export const revalidate = 120

export const metadata: Metadata = {
  title: '랭킹',
  description: 'KSOP 선수 랭킹 — 탑 플레이어. KSOP player rankings and top players.',
  alternates: { canonical: '/ranking' },
}

export default async function RankingPage() {
  const ranked = await getRankedPlayers(100)
  return <RankingPageClient ranked={ranked} />
}
