import { notFound } from 'next/navigation'
import { PlayerDetailClient } from '@/components/site/player-detail-client'
import { getPlayer } from '@/lib/data'

type PageProps = { params: Promise<{ id: string }> }

export default async function PlayerDetailPage({ params }: PageProps) {
  const { id } = await params
  const player = await getPlayer(id)
  if (!player || !player.published) notFound()

  return <PlayerDetailClient player={player} />
}
