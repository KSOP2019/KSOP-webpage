'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { ArrowUpRight, Search } from 'lucide-react'
import { useSite } from '@/components/site/site-provider'
import { Reveal } from '@/components/site/reveal'
import type { RankedPlayer } from '@/lib/types'

function normalizeSearch(text: string): string {
  return text.normalize('NFKC').toLocaleLowerCase('en')
}

export function RankingPageClient({ ranked }: { ranked: RankedPlayer[] }) {
  const { t } = useSite()
  const [query, setQuery] = useState('')

  const normalizedQuery = normalizeSearch(query)

  const filtered = useMemo(() => {
    if (!normalizedQuery) return ranked
    return ranked.filter((p) => normalizeSearch(p.name).includes(normalizedQuery))
  }, [ranked, normalizedQuery])

  const top3 = filtered.slice(0, 3)
  const rest = filtered.slice(3)

  return (
    <section className="ranking-section section-pad">
      <div className="section-top">
        <div>
          <div className="section-label">{t.rankingLabel ?? '03 / PLAYER RANKING'}</div>
          <h2>TOP 100</h2>
        </div>
        <div className="search-box">
          <Search />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t.searchPlayer ?? 'Search player'}
            aria-label={t.searchPlayer ?? 'Search player ranking'}
          />
        </div>
      </div>

      <Reveal className="podium-grid">
        {top3.map((player) => (
          <Link href={`/ranking/${player.playerId}`} className={`podium-card place-0${player.rank}`} key={player.playerId}>
            <div className="podium-glow" />
            <span className="podium-rank">{player.rank}</span>
            <div className="podium-medal">
              <span>{player.rank}</span>
            </div>
            {player.portrait ? <img className="podium-portrait" src={player.portrait} alt={`${player.name} portrait`} /> : null}
            <strong className="player-name">{player.name}</strong>
            <span className="podium-country">{player.country} · KSOP RANKING</span>
            <b>{player.score}</b>
            <span className="text-link">{t.viewProfile ?? 'View profile'} <ArrowUpRight /></span>
          </Link>
        ))}
      </Reveal>

      <Reveal className="ranking-table">
        {rest.map((player) => (
          <Link className="player-row" href={`/ranking/${player.playerId}`} key={player.playerId}>
            <span className="rank">{player.rank}</span>
            <strong className="player-name">{player.name}</strong>
            <span>{player.country}</span>
            <span>{player.score}</span>
          </Link>
        ))}
      </Reveal>
    </section>
  )
}
