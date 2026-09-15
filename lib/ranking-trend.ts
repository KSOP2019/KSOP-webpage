import type { RankedPlayer } from './types'

export type RankingTrendDirection = 'up' | 'down' | 'same' | 'new'

export interface RankingTrend {
  currentRank: number
  previousRank: number | null
  change: number
  direction: RankingTrendDirection
}

export interface RankingTrendSnapshot {
  updatedAt: string | null
  trends: Map<string, RankingTrend>
}

type ScoredRow = {
  eventDate?: string
  eventScore?: number
}

function dateValue(value?: string): number {
  if (!value) return 0
  const time = new Date(value).getTime()
  return Number.isNaN(time) ? 0 : time
}

function scoringRows(player: RankedPlayer): ScoredRow[] {
  if (player.scoreBreakdown.length > 0) {
    return player.scoreBreakdown.map((row) => ({
      eventDate: row.eventDate,
      eventScore: row.eventScore,
    }))
  }

  return player.results.map((row) => ({
    eventDate: row.eventDate,
    eventScore: row.eventScore,
  }))
}

function scoreBeforeSnapshot(player: RankedPlayer, snapshotTime: number): number {
  if (player.scoreSource === 'legacy') return player.score

  const scores = scoringRows(player)
    .filter((row) => dateValue(row.eventDate) > 0 && dateValue(row.eventDate) < snapshotTime)
    .map((row) => Number(row.eventScore) || 0)
    .filter((score) => score > 0)
    .sort((a, b) => b - a)
    .slice(0, 10)

  return Number(scores.reduce((sum, score) => sum + score, 0).toFixed(2))
}

/**
 * Reconstructs the ranking immediately before the latest event-date snapshot.
 * This is intentionally derived from existing public tournament history so the
 * UI can show rank movement without adding or mutating production DB columns.
 */
export function buildRankingTrendSnapshot(players: RankedPlayer[]): RankingTrendSnapshot {
  const eventTimes = players.flatMap((player) =>
    scoringRows(player)
      .map((row) => dateValue(row.eventDate))
      .filter((time) => time > 0),
  )

  const latestTime = eventTimes.length > 0 ? Math.max(...eventTimes) : 0
  const updatedAt = latestTime > 0 ? new Date(latestTime).toISOString() : null

  const neutral = new Map<string, RankingTrend>()
  for (const player of players) {
    neutral.set(player.playerId, {
      currentRank: player.rank,
      previousRank: null,
      change: 0,
      direction: 'same',
    })
  }

  if (!latestTime) return { updatedAt, trends: neutral }

  const previous = players.map((player) => ({
    player,
    score: scoreBeforeSnapshot(player, latestTime),
  }))

  const hasHistoricalScores = previous.some(({ player, score }) => player.scoreSource === 'legacy' || score > 0)
  if (!hasHistoricalScores) return { updatedAt, trends: neutral }

  previous.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return a.player.rank - b.player.rank
  })

  const previousRanks = new Map<string, number>()
  previous.forEach(({ player }, index) => previousRanks.set(player.playerId, index + 1))

  const trends = new Map<string, RankingTrend>()
  for (const player of players) {
    const previousRank = previousRanks.get(player.playerId) ?? null
    const change = previousRank == null ? 0 : previousRank - player.rank
    const direction: RankingTrendDirection =
      previousRank == null
        ? 'new'
        : change > 0
          ? 'up'
          : change < 0
            ? 'down'
            : 'same'

    trends.set(player.playerId, {
      currentRank: player.rank,
      previousRank,
      change,
      direction,
    })
  }

  return { updatedAt, trends }
}
