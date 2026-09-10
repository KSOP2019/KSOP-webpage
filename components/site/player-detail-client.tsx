'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSite } from '@/components/site/site-provider'
import { Reveal } from '@/components/site/reveal'
import { RankingFormula } from '@/components/site/ranking-formula'
import { PlayerAvatar } from '@/components/site/player-avatar'
import type { RankedPlayer, PlayerResultItem, PlayerScoreRow } from '@/lib/types'

interface TournamentRecord {
  eventDate: string
  eventName: string
  eventSlug?: string
  position: number
  fieldSize: number
  buyIn: number
  earnings?: number
  eventScore: number
  counted: boolean
  finishFactor: number
  fieldFactor: number
  buyInFactor: number
  recencyFactor: number
}

function formatFinish(position: number): string {
  const p = position || 1
  const suffix =
    p % 100 >= 11 && p % 100 <= 13
      ? 'th'
      : p % 10 === 1
        ? 'st'
        : p % 10 === 2
          ? 'nd'
          : p % 10 === 3
            ? 'rd'
            : 'th'
  return `${p}${suffix}`
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return dateStr
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}.${m}.${day}`
}

function dateValue(dateStr?: string): number {
  if (!dateStr) return 0
  const t = new Date(dateStr).getTime()
  return Number.isNaN(t) ? 0 : t
}

function formatWon(value?: number): string {
  if (value == null || !Number.isFinite(value)) return '—'
  return `₩${Math.round(value).toLocaleString('en-US')}`
}

function formatPoints(value?: number): string {
  if (value == null || !Number.isFinite(value)) return '—'
  return `${value.toFixed(2)} PTS`
}

function formatField(size?: number): string {
  if (size == null || !Number.isFinite(size)) return '—'
  return `${Math.round(size).toLocaleString('en-US')} PLAYERS`
}

function safeEventLink(eventSlug?: string | null) {
  if (eventSlug && eventSlug.trim().length > 0) {
    return `/events/${eventSlug}`
  }
  return null
}

// Merge results + scoreBreakdown into one record per tournament.
// Match by eventId when available, otherwise eventName + eventDate + position.
function mergeRecords(ranked: RankedPlayer): TournamentRecord[] {
  const results: PlayerResultItem[] = ranked.results || []
  const breakdown: PlayerScoreRow[] = ranked.scoreBreakdown || []
  if (results.length === 0 && breakdown.length === 0) return []

  // Index breakdown rows for matching. Keyed on both id and composite identity.
  const byEventId = new Map<string, PlayerScoreRow>()
  const byIdentity = new Map<string, PlayerScoreRow>()
  for (const row of breakdown) {
    if (row.eventId) {
      if (!byEventId.has(row.eventId)) byEventId.set(row.eventId, row)
    }
    const key = `${row.eventName}|${row.eventDate}|${row.position}`
    if (!byIdentity.has(key)) byIdentity.set(key, row)
  }

  const records = new Map<string, TournamentRecord>()
  const usedBreakdown = new Set<PlayerScoreRow>()

  for (const res of results) {
    const row =
      (res.eventId ? byEventId.get(res.eventId) : undefined) ||
      byIdentity.get(`${res.eventName}|${res.eventDate}|${res.position}`)
    if (row) usedBreakdown.add(row)
    records.set(`${res.eventName}|${res.eventDate}|${res.position}`, {
      eventDate: res.eventDate,
      eventName: res.eventName,
      eventSlug: res.eventSlug || undefined,
      position: res.position,
      fieldSize: res.fieldSize,
      buyIn: res.buyIn,
      earnings: res.earnings,
      eventScore: row ? row.eventScore : (res.eventScore ?? 0),
      // COUNTED comes only from the breakdown; a result without a matched
      // breakdown row was never part of the Best 10 calculation.
      counted: row ? row.counted : false,
      finishFactor: row ? row.finishFactor : 0,
      fieldFactor: row ? row.fieldFactor : 0,
      buyInFactor: row ? row.buyInFactor : 0,
      recencyFactor: row ? row.recencyFactor : 0,
    })
  }

  // Breakdown rows without a matching result still count toward Best 10
  // traceability; append them so the visitor sees every scoring record.
  for (const row of breakdown) {
    if (usedBreakdown.has(row)) continue
    if (records.has(`${row.eventName}|${row.eventDate}|${row.position}`)) continue
    records.set(`${row.eventName}|${row.eventDate}|${row.position}`, {
      eventDate: row.eventDate,
      eventName: row.eventName,
      eventSlug: undefined,
      position: row.position,
      fieldSize: row.fieldSize,
      buyIn: row.buyIn,
      earnings: row.earnings,
      eventScore: row.eventScore,
      counted: row.counted,
      finishFactor: row.finishFactor,
      fieldFactor: row.fieldFactor,
      buyInFactor: row.buyInFactor,
      recencyFactor: row.recencyFactor,
    })
  }

  return [...records.values()]
}

export function PlayerDetailClient({ ranked }: { ranked: RankedPlayer }) {
  const { t } = useSite()
  const [sortMode, setSortMode] = useState<'latest' | 'highest-score'>('latest')
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  // Derived merged records — never mutate ranked.results/scoreBreakdown.
  const records = useMemo(() => mergeRecords(ranked), [ranked])

  const sortedRecords = useMemo(() => {
    const copy = [...records]
    if (sortMode === 'latest') {
      // Sort by normalized valid date values; invalid dates sink to the end.
      copy.sort((a, b) => dateValue(b.eventDate) - dateValue(a.eventDate))
    } else {
      copy.sort((a, b) => b.eventScore - a.eventScore)
    }
    return copy
  }, [records, sortMode])

  const toggleRow = (idx: number) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  const stats = {
    eventsPlayed: records.length,
    titles: ranked.titles ?? 0,
    finalTables: ranked.finalTables ?? 0,
    recordedEarnings: records.reduce((sum, r) => sum + (r.earnings || 0), 0),
  }

  const countedCount = records.filter((r) => r.counted).length
  const excludedCount = records.length - countedCount
  const bestEventScore = records.length ? Math.max(...records.map((r) => r.eventScore)) : 0
  const latestEventScore = records.length
    ? [...records].sort((a, b) => dateValue(b.eventDate) - dateValue(a.eventDate))[0].eventScore
    : 0

  const sortButtonStyle = (active: boolean): React.CSSProperties => ({
    padding: '4px 10px',
    borderRadius: '4px',
    border: 0,
    background: active ? '#c5202d' : '#ddd',
    color: active ? '#fff' : '#333',
    fontSize: '11px',
    fontWeight: 700,
    cursor: 'pointer',
  })

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
          <span>{ranked.score} PTS</span>
        </div>
      </div>

      <Reveal className="event-detail">
        <PlayerAvatar player={ranked} />

        <div className="detail-facts" style={{ marginTop: '24px', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          <div>
            <span>CURRENT RANK</span>
            <strong>#{ranked.rank}</strong>
          </div>
          <div>
            <span>TOTAL KSOP SCORE</span>
            <strong>{ranked.score} PTS</strong>
          </div>
          <div>
            <span>EVENTS PLAYED</span>
            <strong>{stats.eventsPlayed}</strong>
          </div>
          <div>
            <span>TITLES</span>
            <strong>{stats.titles}</strong>
          </div>
          <div>
            <span>FINAL TABLES</span>
            <strong>{stats.finalTables}</strong>
          </div>
          <div>
            <span>RECORDED EARNINGS</span>
            <strong>{formatWon(stats.recordedEarnings)}</strong>
          </div>
        </div>

        <div style={{ marginTop: '24px' }}>
          <h3 style={{ marginBottom: '12px', fontSize: '18px' }}>BEST 10 SUMMARY</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
            <div className="summary-card"><span>BEST 10 SCORE</span><strong>{ranked.score} PTS</strong></div>
            <div className="summary-card"><span>COUNTED EVENTS</span><strong>{countedCount}</strong></div>
            <div className="summary-card"><span>EXCLUDED EVENTS</span><strong>{excludedCount}</strong></div>
            <div className="summary-card"><span>BEST EVENT SCORE</span><strong>{bestEventScore} PTS</strong></div>
            <div className="summary-card"><span>LATEST EVENT SCORE</span><strong>{latestEventScore} PTS</strong></div>
          </div>
        </div>

        <p className="large-copy" style={{ marginTop: '24px' }}>
          {ranked.bio ?? (t.bioPending ?? 'Player profile details will be managed from the admin panel.')}
        </p>

        <div className="blind-label" style={{ marginTop: '32px' }}>{t.resultHistory ?? 'RESULT / TOURNAMENT HISTORY'}</div>

        <div className="tournament-controls">
          <button type="button" onClick={() => setSortMode('latest')} style={sortButtonStyle(sortMode === 'latest')}>LATEST</button>
          <button type="button" onClick={() => setSortMode('highest-score')} style={sortButtonStyle(sortMode === 'highest-score')}>HIGHEST SCORE</button>
        </div>

        {records.length > 0 ? (
          <div className="tournament-history">
            <div className="tournament-head" aria-hidden="true">
              <span>DATE</span>
              <span>EVENT</span>
              <span>FINISH</span>
              <span>FIELD</span>
              <span>BUY-IN</span>
              <span>EARNINGS</span>
              <span>KSOP POINTS</span>
              <span>STATUS</span>
            </div>
            {sortedRecords.map((rec, idx) => {
              const link = safeEventLink(rec.eventSlug)
              const isOpen = expanded.has(idx)
              return (
                <div key={`${rec.eventName}-${rec.eventDate}-${rec.position}`} className={`tournament-record ${rec.counted ? 'is-counted' : 'is-excluded'}`}>
                  <button
                    type="button"
                    className="tournament-row"
                    onClick={() => toggleRow(idx)}
                    aria-expanded={isOpen}
                    aria-label={`${rec.eventName} result details`}
                  >
                    <span className="t-date">{formatDate(rec.eventDate)}</span>
                    <span className="t-event">
                      {link ? <Link href={link} onClick={(e) => e.stopPropagation()}>{rec.eventName}</Link> : rec.eventName}
                    </span>
                    <span className="t-finish">{formatFinish(rec.position)}</span>
                    <span className="t-field">{formatField(rec.fieldSize)}</span>
                    <span className="t-buyin">{formatWon(rec.buyIn)}</span>
                    <span className="t-earnings">{formatWon(rec.earnings)}</span>
                    <span className="t-points">{formatPoints(rec.eventScore)}</span>
                    <span className="t-status">
                      {rec.counted ? (
                        <span className="status-counted">COUNTED</span>
                      ) : (
                        <span className="status-excluded">NOT COUNTED</span>
                      )}
                    </span>
                  </button>
                  <div className={`tournament-factors ${isOpen ? 'is-open' : ''}`}>
                    <div className="factor-grid">
                      <span><em>FINISH FACTOR</em><b>{rec.finishFactor.toFixed(2)}</b></span>
                      <span><em>FIELD FACTOR</em><b>{rec.fieldFactor.toFixed(2)}</b></span>
                      <span><em>BUY-IN FACTOR</em><b>{rec.buyInFactor.toFixed(2)}</b></span>
                      <span><em>RECENCY FACTOR</em><b>{rec.recencyFactor.toFixed(2)}</b></span>
                      <span><em>EVENT SCORE</em><b>{formatPoints(rec.eventScore)}</b></span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="muted-copy" style={{ marginTop: '12px' }}>
            DATA PENDING
          </p>
        )}

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
