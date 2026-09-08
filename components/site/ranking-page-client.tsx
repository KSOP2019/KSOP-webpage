'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { ArrowUpRight, Search } from 'lucide-react'
import { useSite } from '@/components/site/site-provider'
import { Reveal } from '@/components/site/reveal'
import type { PlayerItem } from '@/lib/types'

export function RankingPageClient({ players }: { players: PlayerItem[] }) {
  const { t } = useSite()
  const [query, setQuery] = useState('')
  const filtered = useMemo(
    () => players.filter((player) => player.name.includes(query.toUpperCase())),
    [players, query],
  )

  return (
    <section className="ranking-section section-pad">
      <div className="section-top">
        <div>
          <div className="section-label">03 / PLAYER RANKING</div>
          <h2>{t.ranking}</h2>
        </div>
        <div className="search-box">
          <Search />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search player"
            aria-label="Search player ranking"
          />
        </div>
      </div>

      <Reveal className="podium-grid">
        {filtered.slice(0, 3).map((player) => (
          <Link href={`/ranking/${player.id}`} className={`podium-card place-0${player.rank}`} key={player.id}>
            <div className="podium-glow" />
            <span className="podium-rank">{player.rank}</span>
            <div className="podium-medal">
              <span>{player.rank}</span>
            </div>
            {player.portrait ? <img className="podium-portrait" src={player.portrait} alt={`${player.name} portrait`} /> : null}
            <strong className="player-name">{player.name}</strong>
            <span className="podium-country">{player.country} · KSOP RANKING</span>
            <b>{player.earnings}</b>
            <span className="text-link">View profile <ArrowUpRight /></span>
          </Link>
        ))}
      </Reveal>

      <Reveal className="ranking-table">
        {filtered.slice(3).map((player) => (
          <Link className="player-row" href={`/ranking/${player.id}`} key={player.id}>
            <span className="rank">{player.rank}</span>
            <strong className="player-name">{player.name}</strong>
            <span>{player.country}</span>
            <span>{player.earnings}</span>
          </Link>
        ))}
      </Reveal>
    </section>
  )
}
