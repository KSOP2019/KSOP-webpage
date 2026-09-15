'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { ArrowUpRight, Search, Trophy } from 'lucide-react'
import { useSite } from '@/components/site/site-provider'
import { Reveal } from '@/components/site/reveal'
import { realPhotoOrBlank } from '@/lib/event-images'
import { buildRankingTrendSnapshot, type RankingTrend } from '@/lib/ranking-trend'
import type { Language, RankedPlayer } from '@/lib/types'

function normalizeSearch(text: string): string {
  return text.normalize('NFKC').toLocaleLowerCase('en')
}

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function formatScore(score: number): string {
  return Number(score || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })
}

function movementText(trend?: RankingTrend): string {
  if (!trend || trend.previousRank == null || trend.direction === 'same') return '—'
  if (trend.direction === 'new') return 'NEW'
  return trend.change > 0 ? `▲${trend.change}` : `▼${Math.abs(trend.change)}`
}

function movementClass(trend?: RankingTrend): string {
  if (!trend) return 'is-same'
  if (trend.direction === 'up') return 'is-up'
  if (trend.direction === 'down') return 'is-down'
  if (trend.direction === 'new') return 'is-new'
  return 'is-same'
}

const UI: Record<Language, {
  kicker: string
  title: string
  description: string
  updated: string
  players: string
  search: string
  rank: string
  change: string
  player: string
  results: string
  points: string
  view: string
  flopinTitle: string
  flopinBody: string
  pending: string
  empty: string
}> = {
  KR: {
    kicker: 'KSOP PLAYER RANKING',
    title: '플레이어 랭킹',
    description: 'KSOP 공식 경기 결과와 Best 10 스코어를 기준으로 선수의 현재 순위와 최근 변동을 확인합니다.',
    updated: '최근 반영',
    players: '등록 선수',
    search: '선수명 또는 국가 검색',
    rank: '순위',
    change: '변동',
    player: '플레이어',
    results: '결과',
    points: '포인트',
    view: '프로필 보기',
    flopinTitle: 'FLOPIN PLAYER ID',
    flopinBody: '향후 선수 인증 후 FLOPIN 계정과 KSOP 랭킹 프로필을 우선 연결합니다.',
    pending: 'FLOPIN 연결 예정',
    empty: '검색 결과가 없습니다.',
  },
  EN: {
    kicker: 'KSOP PLAYER RANKING',
    title: 'Player Ranking',
    description: 'Official KSOP results and Best 10 scores show each player’s current position and latest movement.',
    updated: 'Latest update',
    players: 'Players',
    search: 'Search player or country',
    rank: 'Rank',
    change: 'Move',
    player: 'Player',
    results: 'Results',
    points: 'Points',
    view: 'View profile',
    flopinTitle: 'FLOPIN PLAYER ID',
    flopinBody: 'Verified players will be able to connect their FLOPIN account to the KSOP ranking profile.',
    pending: 'FLOPIN connect planned',
    empty: 'No matching players.',
  },
  JP: {
    kicker: 'KSOP PLAYER RANKING',
    title: 'プレイヤーランキング',
    description: 'KSOP公式大会結果とBest 10スコアを基準に、現在順位と直近の変動を表示します。',
    updated: '最終反映',
    players: '登録選手',
    search: '選手名・国で検索',
    rank: '順位',
    change: '変動',
    player: 'プレイヤー',
    results: '結果',
    points: 'ポイント',
    view: 'プロフィール',
    flopinTitle: 'FLOPIN PLAYER ID',
    flopinBody: '今後、本人確認後にFLOPINアカウントとKSOPランキングプロフィールを連携します。',
    pending: 'FLOPIN連携予定',
    empty: '該当する選手がいません。',
  },
  CN: {
    kicker: 'KSOP PLAYER RANKING',
    title: '选手排名',
    description: '根据KSOP官方赛事结果与Best 10积分，显示当前排名及最近变动。',
    updated: '最近更新',
    players: '选手',
    search: '搜索选手或国家',
    rank: '排名',
    change: '变动',
    player: '选手',
    results: '成绩',
    points: '积分',
    view: '查看资料',
    flopinTitle: 'FLOPIN PLAYER ID',
    flopinBody: '未来完成选手认证后，可优先连接FLOPIN账号与KSOP排名资料。',
    pending: 'FLOPIN连接计划中',
    empty: '没有匹配的选手。',
  },
}

function PlayerPortrait({ player, featured = false }: { player: RankedPlayer; featured?: boolean }) {
  const portrait = realPhotoOrBlank(player.portrait)
  if (portrait) {
    return <img className={featured ? 'ksop-rank-portrait is-featured' : 'ksop-rank-portrait'} src={portrait} alt={`${player.name} portrait`} loading="lazy" />
  }

  return (
    <div className={featured ? 'ksop-rank-portrait is-featured is-fallback' : 'ksop-rank-portrait is-fallback'} aria-label={`${player.name} avatar`}>
      <span>{initials(player.name) || String(player.rank)}</span>
    </div>
  )
}

export function RankingPageClient({ ranked }: { ranked: RankedPlayer[] }) {
  const { t, language } = useSite()
  const [query, setQuery] = useState('')
  const [range, setRange] = useState<'1-50' | '51-100'>('1-50')
  const ui = UI[language]

  const snapshot = useMemo(() => buildRankingTrendSnapshot(ranked), [ranked])
  const normalizedQuery = normalizeSearch(query)

  const visible = useMemo(() => {
    if (normalizedQuery) {
      return ranked.filter((player) => {
        const haystack = normalizeSearch(`${player.name} ${player.country}`)
        return haystack.includes(normalizedQuery)
      })
    }

    const [start, end] = range === '1-50' ? [1, 50] : [51, 100]
    return ranked.filter((player) => player.rank >= start && player.rank <= end)
  }, [ranked, normalizedQuery, range])

  const top3 = ranked.slice(0, 3)
  const top3Visual = top3.length === 3 ? [top3[1], top3[0], top3[2]] : top3
  const updatedLabel = snapshot.updatedAt
    ? new Date(snapshot.updatedAt).toLocaleDateString(language === 'KR' ? 'ko-KR' : language === 'JP' ? 'ja-JP' : language === 'CN' ? 'zh-CN' : 'en-US')
    : '—'

  if (ranked.length === 0) {
    return (
      <section className="ranking-section section-pad ksop-ranking-page">
        <div className="ksop-ranking-hero">
          <div>
            <div className="section-label">{ui.kicker}</div>
            <h1>{ui.title}</h1>
            <p>{t.rankingPreparing}</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="ranking-section section-pad ksop-ranking-page">
      <div className="ksop-ranking-hero">
        <div className="ksop-ranking-hero-copy">
          <div className="section-label">{ui.kicker}</div>
          <h1>{ui.title}</h1>
          <p>{ui.description}</p>
        </div>
        <div className="ksop-ranking-meta">
          <div><span>{ui.updated}</span><strong>{updatedLabel}</strong></div>
          <div><span>{ui.players}</span><strong>{ranked.length}</strong></div>
        </div>
      </div>

      <Reveal className="ksop-ranking-top3">
        {top3Visual.map((player) => {
          const trend = snapshot.trends.get(player.playerId)
          const isChampion = player.rank === 1
          return (
            <Link
              href={`/ranking/${player.playerId}`}
              className={`ksop-top3-card rank-${player.rank}${isChampion ? ' is-champion' : ''}`}
              key={player.playerId}
            >
              <div className="ksop-top3-rank"><Trophy /><span>#{player.rank}</span></div>
              <PlayerPortrait player={player} featured={isChampion} />
              <div className="ksop-top3-copy">
                <div className={`ksop-rank-movement ${movementClass(trend)}`}>{movementText(trend)}</div>
                <strong>{player.name}</strong>
                <span>{player.country} · {player.results.length} RESULTS</span>
                <b>{formatScore(player.score)} <small>PTS</small></b>
                <div className="ksop-top3-stats">
                  <span>{player.titles ?? 0}<small>TITLES</small></span>
                  <span>{player.finalTables ?? 0}<small>FINAL TABLES</small></span>
                </div>
                <span className="ksop-profile-link">{ui.view} <ArrowUpRight /></span>
              </div>
            </Link>
          )
        })}
      </Reveal>

      <div className="ksop-flopin-ranking-banner">
        <div>
          <span>{ui.flopinTitle}</span>
          <strong>{ui.flopinBody}</strong>
        </div>
        <span className="ksop-flopin-pending">{ui.pending}</span>
      </div>

      <div className="ksop-ranking-controls">
        <label className="ksop-ranking-search">
          <Search aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={ui.search}
            aria-label={ui.search}
          />
          {query ? <button type="button" onClick={() => setQuery('')} aria-label="Clear search">×</button> : null}
        </label>
        <div className="ksop-ranking-range" aria-label="Ranking range">
          {(['1-50', '51-100'] as const).map((item) => (
            <button
              type="button"
              className={range === item && !query ? 'is-active' : ''}
              onClick={() => { setRange(item); setQuery('') }}
              key={item}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <Reveal className="ksop-ranking-list" role="table" aria-label="KSOP player ranking">
        <div className="ksop-ranking-list-head" role="row">
          <span role="columnheader">{ui.rank}</span>
          <span role="columnheader">{ui.change}</span>
          <span role="columnheader">{ui.player}</span>
          <span role="columnheader">{ui.results}</span>
          <span role="columnheader">{ui.points}</span>
          <span aria-hidden="true" />
        </div>

        {visible.length > 0 ? visible.map((player) => {
          const trend = snapshot.trends.get(player.playerId)
          return (
            <Link className="ksop-ranking-row" href={`/ranking/${player.playerId}`} key={player.playerId} role="row">
              <span className="ksop-list-rank" role="cell">{player.rank}</span>
              <span className={`ksop-rank-movement ${movementClass(trend)}`} role="cell">{movementText(trend)}</span>
              <span className="ksop-list-player" role="cell">
                <PlayerPortrait player={player} />
                <span><strong>{player.name}</strong><small>{player.country}</small></span>
              </span>
              <span role="cell">{player.results.length}</span>
              <strong className="ksop-list-score" role="cell">{formatScore(player.score)} <small>PTS</small></strong>
              <span className="ksop-list-open" aria-hidden="true"><ArrowUpRight /></span>
            </Link>
          )
        }) : <div className="ksop-ranking-empty" role="row"><span role="cell">{ui.empty}</span></div>}
      </Reveal>
    </section>
  )
}
