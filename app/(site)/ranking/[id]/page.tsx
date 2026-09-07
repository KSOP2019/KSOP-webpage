import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowUpRight } from 'lucide-react'
import { getPlayer } from '@/lib/data'

type PageProps = { params: Promise<{ id: string }> }

export default async function PlayerDetailPage({ params }: PageProps) {
  const { id } = await params
  const player = await getPlayer(id)
  if (!player || !player.published) notFound()

  return (
    <section className="ranking-section section-pad">
      <div className="section-top">
        <div>
          <div className="section-label">PLAYER PROFILE</div>
          <h2>{player.name}</h2>
        </div>
        <div className="series-meta">
          <strong>#{player.rank}</strong>
          <span>{player.country}</span>
          <span>{player.earnings}</span>
        </div>
      </div>

      <div className="event-detail">
        {player.portrait ? (
          <img src={player.portrait} alt={`${player.name} portrait`} style={{ width: '220px', borderRadius: '16px' }} />
        ) : null}
        <p className="large-copy" style={{ marginTop: '24px' }}>
          {player.bio ?? 'Player profile details will be managed from the admin panel.'}
        </p>
        <div className="detail-actions">
          <Link className="ghost-button" href="/ranking">
            Back to ranking
          </Link>
          <Link className="text-link" href="/events">
            View events <ArrowUpRight />
          </Link>
        </div>
      </div>
    </section>
  )
}
