import { redirect } from 'next/navigation'

export default async function PlayerDetailPage({ params }: { params: Promise<{ 'player-slug': string }> }) {
  const { 'player-slug': slug } = await params
  redirect(`/ranking/${slug}`)
}
