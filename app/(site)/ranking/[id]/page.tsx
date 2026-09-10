import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PlayerDetailClient } from '@/components/site/player-detail-client'
import { getPlayerRankingDetail } from '@/lib/data'

type PageProps = { params: Promise<{ id: string }> }

// Player CMS edits refresh without redeploy.
export const revalidate = 120

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const detail = await getPlayerRankingDetail(id)
  if (!detail) return {}
  return {
    title: detail.name,
    description: `${detail.name} — KSOP rank #${detail.rank}.`,
    alternates: { canonical: `/ranking/${detail.playerId}` },
  }
}

export default async function PlayerDetailPage({ params }: PageProps) {
  const { id } = await params
  const detail = await getPlayerRankingDetail(id)
  if (!detail) notFound()

  return <PlayerDetailClient ranked={detail} />
}
