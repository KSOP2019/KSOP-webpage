'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { useSite } from '@/components/site/site-provider'
import { Reveal } from '@/components/site/reveal'
import type { PlayerItem } from '@/lib/types'

export function PlayerDetailClient({ player }: { player: PlayerItem }) {
  const { t } = useSite()

  return (
    <section className="ranking-section section-pad">
      <div className="section-top">
        <div>
          <div className="section-label">{t.playerProfile ?? 'PLAYER PROFILE'}</div>
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
            <span>{t.rankLabel ?? 'RANK'}</span>
            <strong>#{player.rank}</strong>
          </div>
          <div>
            <span>{t.countryLabel ?? 'COUNTRY'}</span>
            <strong>{player.country}</strong>
          </div>
          <div>
            <span>{t.earningsLabel ?? 'EARNINGS'}</span>
            <strong>{player.earnings}</strong>
          </div>
        </div>
        <p className="large-copy" style={{ marginTop: '24px' }}>
          {player.bio ?? (t.bioPending ?? 'Player profile details will be managed from the admin panel.')}
        </p>
        <div className="blind-label">{t.resultHistory ?? 'RESULT / TOURNAMENT HISTORY'}</div>
        <p className="muted-copy" style={{ marginTop: '12px' }}>
          {t.resultPending ?? 'RESULT DATA PENDING'}
        </p>
        <div className="detail-actions">
          <Link className="ghost-button" href="/ranking">
            {t.backToRanking ?? 'Back to ranking'}
          </Link>
          <Link className="text-link" href="/events">
            {t.viewEvents ?? 'View events'} <ArrowUpRight />
          </Link>
        </div>
      </Reveal>
    </section>
  )
}
