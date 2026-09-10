'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { useState } from 'react'
import { useSite } from '@/components/site/site-provider'
import { Reveal } from '@/components/site/reveal'
import { RankingFormula } from '@/components/site/ranking-formula'
import { PlayerAvatar } from '@/components/site/player-avatar'
import type { RankedPlayer } from '@/lib/types'

function formatFinish(position: number): string {
  const p = position || 1
  const suffix = p % 100 >= 11 && p % 100 <= 13 ? 'th' : (p % 10 === 1 ? 'st' : p % 10 === 2 ? 'nd' : p % 10 === 3 ? 'rd' : 'th')
  return `${p}${suffix}`
}

function safeEventLink(eventSlug?: string | null, eventName?: string) {
  if (eventSlug && eventSlug.trim().length > 0) {
    return `/events/${eventSlug}`
  }
  return null
}

export function PlayerDetailClient({ ranked }: { ranked: RankedPlayer }) {
  const { t } = useSite()
  const [sortMode, setSortMode] = useState<'latest' | 'highest-score'>('latest')

  const sortedResults = ranked.results ? [...ranked.results].sort((a, b) => {
    if (sortMode === 'latest') {
      return (new Date(b.eventDate || '').getTime() || 0) - (new Date(a.eventDate || '').getTime() || 0)
    }
    return (b.eventScore || 0) - (a.eventScore || 0)
  }) : []

  const stats = {
    eventsPlayed: ranked.results?.length || 0,
    titles: ranked.titles ?? 0,
    finalTables: ranked.finalTables ?? 0,
    bestFinish: ranked.scoreBreakdown?.length ? Math.min(...ranked.scoreBreakdown.map((r) => r.position)) : 0,
    recordedEarnings: ranked.results?.reduce((sum, r) => sum + (r.earnings || 0), 0) || 0,
  }

  return (
    <section className="ranking-section section-pad">
      <div className="section-top">
        <div>
          <div className="section-label">{t.playerProfile ?? 'PLAYER PROFILE'}</div>
          <h2>{ranked.name}</h2>
        </div>
        <div className="series-meta">
          <strong>#{ranked.rank}</strong>
          <span>{ranked.country}</span>
          <span>{ranked.score}</span>
        </div>
      </div>

      <Reveal className="event-detail">
        <PlayerAvatar player={ranked} />

        <div className="detail-facts" style={{ marginTop: '24px', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div>
            <span>{t.rankLabel ?? 'RANK'}</span>
            <strong>#{ranked.rank}</strong>
          </div>
          <div>
            <span>{t.countryLabel ?? 'COUNTRY'}</span>
            <strong>{ranked.country}</strong>
          </div>
          <div>
            <span>KSOP SCORE</span>
            <strong>{ranked.score}</strong>
          </div>
        </div>

        <div style={{ marginTop: '24px' }}>
          <h3 style={{ marginBottom: '12px', fontSize: '18px' }}>STATS</h3>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div><span>Events played</span><strong>{stats.eventsPlayed}</strong></div>
            <div><span>Titles</span><strong>{stats.titles}</strong></div>
            <div><span>Final tables</span><strong>{stats.finalTables}</strong></div>
            <div><span>Best finish</span><strong>#{stats.bestFinish || '—'}</strong></div>
            <div><span>Recorded earnings</span><strong>₩{stats.recordedEarnings.toLocaleString()}</strong></div>
          </div>
        </div>

        <p className="large-copy" style={{ marginTop: '24px' }}>
          {ranked.bio ?? (t.bioPending ?? 'Player profile details will be managed from the admin panel.')}
        </p>

        <div className="blind-label" style={{ marginTop: '32px' }}>{t.resultHistory ?? 'RESULT / TOURNAMENT HISTORY'}</div>
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <button
            type="button"
            onClick={() => setSortMode('latest')}
            style={{ padding: '4px 10px', borderRadius: '4px', border: 0, background: sortMode === 'latest' ? '#c5202d' : '#ddd', color: sortMode === 'latest' ? '#fff' : '#333', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
          >LATEST</button>
          <button
            type="button"
            onClick={() => setSortMode('highest-score')}
            style={{ padding: '4px 10px', borderRadius: '4px', border: 0, background: sortMode === 'highest-score' ? '#c5202d' : '#ddd', color: sortMode === 'highest-score' ? '#fff' : '#333', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
          >HIGHEST SCORE</button>
        </div>
        {ranked.results && ranked.results.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '12px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #333' }}>
                <th style={{ textAlign: 'left', padding: '8px 4px' }}>DATE</th>
                <th style={{ textAlign: 'left', padding: '8px 4px' }}>EVENT</th>
                <th style={{ textAlign: 'center', padding: '8px 4px' }}>FINISH</th>
                <th style={{ textAlign: 'center', padding: '8px 4px' }}>FIELD</th>
                <th style={{ textAlign: 'center', padding: '8px 4px' }}>BUY-IN</th>
                <th style={{ textAlign: 'right', padding: '8px 4px' }}>EARNINGS</th>
                <th style={{ textAlign: 'right', padding: '8px 4px' }}>POINTS</th>
                <th style={{ textAlign: 'center', padding: '8px 4px' }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {sortedResults.map((res, idx) => (
                <tr key={`${res.eventName}-${idx}`} style={{ borderBottom: '1px solid #222' }}>
                  <td style={{ padding: '8px 4px' }}>{res.eventDate || '-'}</td>
                  <td style={{ padding: '8px 4px' }}>
                    {(() => {
                      const link = safeEventLink(res.eventSlug, res.eventName)
                      return link ? (<Link href={link} className="text-link">{res.eventName}</Link>) : <span>{res.eventName}</span>
                    })()}
                  </td>
                  <td style={{ padding: '8px 4px', textAlign: 'center' }}>{formatFinish(res.position)}</td>
                  <td style={{ padding: '8px 4px', textAlign: 'center' }}>{res.fieldSize}</td>
                  <td style={{ padding: '8px 4px', textAlign: 'center' }}>{res.buyIn}</td>
                  <td style={{ padding: '8px 4px', textAlign: 'right' }}>{res.earnings != null ? `₩${Number(res.earnings).toLocaleString()}` : '-'}</td>
                  <td style={{ padding: '8px 4px', textAlign: 'right' }}>{res.eventScore || '-'}</td>
                  <td style={{ padding: '8px 4px', textAlign: 'center' }}>
                    {res.counted ? (
                      <span style={{ background: '#c5202d', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.06em' }}>COUNTED</span>
                    ) : (
                      <span style={{ color: '#888', fontSize: '10px', letterSpacing: '0.06em' }}>NOT COUNTED</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="muted-copy" style={{ marginTop: '12px' }}>
            DATA PENDING
          </p>
        )}

        <div className="blind-label" style={{ marginTop: '32px' }}>SCORE CONTRIBUTION</div>
        {ranked.scoreBreakdown && ranked.scoreBreakdown.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '12px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #333' }}>
                <th style={{ textAlign: 'left', padding: '8px 4px' }}>EVENT</th>
                <th style={{ textAlign: 'center', padding: '8px 4px' }}>EVENT SCORE</th>
                <th style={{ textAlign: 'center', padding: '8px 4px' }}>FINISH FACTOR</th>
                <th style={{ textAlign: 'center', padding: '8px 4px' }}>FIELD FACTOR</th>
                <th style={{ textAlign: 'center', padding: '8px 4px' }}>BUY-IN FACTOR</th>
                <th style={{ textAlign: 'center', padding: '8px 4px' }}>RECENCY</th>
                <th style={{ textAlign: 'center', padding: '8px 4px' }}>COUNTED</th>
              </tr>
            </thead>
            <tbody>
              {ranked.scoreBreakdown.map((row, idx) => (
                <tr key={`${row.eventName}-${idx}`} style={{ borderBottom: '1px solid #222' }}>
                  <td style={{ padding: '8px 4px' }}>{row.eventName}</td>
                  <td style={{ padding: '8px 4px', textAlign: 'center' }}>{row.eventScore}</td>
                  <td style={{ padding: '8px 4px', textAlign: 'center' }}>{row.finishFactor.toFixed(2)}</td>
                  <td style={{ padding: '8px 4px', textAlign: 'center' }}>{row.fieldFactor.toFixed(2)}</td>
                  <td style={{ padding: '8px 4px', textAlign: 'center' }}>{row.buyInFactor.toFixed(2)}</td>
                  <td style={{ padding: '8px 4px', textAlign: 'center' }}>{row.recencyFactor.toFixed(2)}</td>
                  <td style={{ padding: '8px 4px', textAlign: 'center' }}>{row.counted ? '✓' : ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="muted-copy" style={{ marginTop: '12px' }}>
            DATA PENDING
          </p>
        )}

        <div style={{ marginTop: '24px', borderTop: '1px solid #333', paddingTop: '16px' }}>
          <h3 style={{ fontWeight: 700, fontSize: '14px', letterSpacing: '0.08em', marginBottom: '12px' }}>BEST 10 SUMMARY</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
            <div style={{ border: '1px solid #222', borderRadius: '10px', padding: '14px', background: '#0a0a0a' }}>
              <div style={{ fontSize: '10px', color: '#777', letterSpacing: '0.08em', marginBottom: '4px' }}>TOTAL KSOP SCORE</div>
              <div style={{ fontWeight: 700, fontSize: '20px', color: '#fff' }}>{ranked.score}</div>
            </div>
            <div style={{ border: '1px solid #222', borderRadius: '10px', padding: '14px', background: '#0a0a0a' }}>
              <div style={{ fontSize: '10px', color: '#777', letterSpacing: '0.08em', marginBottom: '4px' }}>COUNTED EVENTS</div>
              <div style={{ fontWeight: 700, fontSize: '20px', color: '#fff' }}>{ranked.scoreBreakdown?.filter((r) => r.counted).length || 0}</div>
            </div>
            <div style={{ border: '1px solid #222', borderRadius: '10px', padding: '14px', background: '#0a0a0a' }}>
              <div style={{ fontSize: '10px', color: '#777', letterSpacing: '0.08em', marginBottom: '4px' }}>EXCLUDED EVENTS</div>
              <div style={{ fontWeight: 700, fontSize: '20px', color: '#fff' }}>{(ranked.scoreBreakdown?.length || 0) - (ranked.scoreBreakdown?.filter((r) => r.counted).length || 0)}</div>
            </div>
            <div style={{ border: '1px solid #222', borderRadius: '10px', padding: '14px', background: '#0a0a0a' }}>
              <div style={{ fontSize: '10px', color: '#777', letterSpacing: '0.08em', marginBottom: '4px' }}>BEST EVENT SCORE</div>
              <div style={{ fontWeight: 700, fontSize: '20px', color: '#fff' }}>{ranked.scoreBreakdown?.length ? Math.max(...ranked.scoreBreakdown.map((r) => r.eventScore)) : 0}</div>
            </div>
            <div style={{ border: '1px solid #222', borderRadius: '10px', padding: '14px', background: '#0a0a0a' }}>
              <div style={{ fontSize: '10px', color: '#777', letterSpacing: '0.08em', marginBottom: '4px' }}>MOST RECENT EVENT SCORE</div>
              <div style={{ fontWeight: 700, fontSize: '20px', color: '#fff' }}>
                {ranked.scoreBreakdown && ranked.scoreBreakdown.length > 0 ? ranked.scoreBreakdown.sort((a, b) => new Date(b.eventDate || '').getTime() - new Date(a.eventDate || '').getTime())[0].eventScore : 0}
              </div>
            </div>
          </div>
        </div>

        <div className="detail-actions" style={{ marginTop: '32px' }}>
          <Link className="ghost-button" href="/ranking">
            {t.backToRanking ?? 'Back to ranking'}
          </Link>
          <Link className="text-link" href="/events">
            {t.viewEvents ?? 'View events'} <ArrowUpRight />
          </Link>
        </div>

        <RankingFormula />
      </Reveal>
    </section>
  )
}
