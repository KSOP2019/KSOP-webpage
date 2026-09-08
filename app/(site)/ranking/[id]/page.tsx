import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowUpRight } from 'lucide-react'
import { Reveal } from '@/components/site/reveal'
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

      <Reveal className="event-detail">
        {player.portrait ? (
          <img src={player.portrait} alt={`${player.name} portrait`} style={{ width: '220px', borderRadius: '16px' }} />
        ) : null}
        <div className="detail-facts" style={{ marginTop: '24px' }}>
          <div>
            <span>RANK</span>
            <strong>#{player.rank}</strong>
          </div>
          <div>
            <span>COUNTRY</span>
            <strong>{player.country}</strong>
          </div>
          <div>
            <span>EARNINGS</span>
            <strong>{player.earnings}</strong>
          </div>
        </div>
        <p className="large-copy" style={{ marginTop: '24px' }}>
          {player.bio ?? 'Player profile details will be managed from the admin panel.'}
        </p>
        <div className="blind-label">RESULT / TOURNAMENT HISTORY</div>
        <p className="muted-copy" style={{ marginTop: '12px' }}>
          RESULT DATA PENDING
        </p>
        <div className="detail-actions">
          <Link className="ghost-button" href="/ranking">
            Back to ranking
          </Link>
          <Link className="text-link" href="/events">
            View events <ArrowUpRight />
          </Link>
        </div>
      </Reveal>
    </section>
  )
}
