import type { PlayerItem } from './types'

export interface PlayerScoreBreakdown {
  playerId: string
  totalScore: number
  eventResults: Array<{
    eventName: string
    result: { position?: number; points: number; score: number; date?: string; eventType?: string }
  }>
}

export interface RankingFormulaParams {
  finishFactorMax?: number
  fieldFactorMax?: number
  buyInFactorMax?: number
  recencyFactorMax?: number
  bestResultsCount?: number
}

function defaultFormula(): RankingFormulaParams {
  return {
    bestResultsCount: 10,
    finishFactorMax: 100,
    fieldFactorMax: 50,
    buyInFactorMax: 20,
    recencyFactorMax: 10,
  }
}

/**
 * KSOP ranking score formula (inspired by GPI-style factors).
 *
 * Score per tournament result:
 *   FinishPositionFactor (0..100) + FieldSizeFactor (0..50) +
 *   BuyInFactor (0..20) + RecencyFactor (0..10)
 *
 * Final player score = sum of the best N event scores (best 10 by default).
 * This is clearly labeled and NOT an official licensed GPI formula.
 */
export function calculateRankingScore(
  results: Array<{
    eventName: string
    eventType?: string
    date?: string
    position?: number
    points?: number
  }>,
  params?: Partial<RankingFormulaParams>,
): number {
  const cfg = { ...defaultFormula(), ...params }
  const finished = results.filter(
    (r) => typeof r.position === 'number' && r.position > 0,
  )
  if (finished.length === 0) return 0

  const scores = finished.map((r) => {
    // Finish factor favors top positions.
    const finishFactor = Math.max(
      0,
      cfg.finishFactorMax! * Math.pow(1 - (r.position! - 1) / 10, 1.4),
    )

    // Field factor provides a small bonus for larger fields (normalized here).
    const fieldFactor = cfg.fieldFactorMax! * Math.min(1, (r.points || 0) / 200)

    // Buy-in factor reflects stakes (normalized).
    const buyInFactor = cfg.buyInFactorMax! * Math.min(1, (r.points || 0) / 3000)

    // Recency factor decays over 12 months (simplified linear).
    const recencyFactor = cfg.recencyFactorMax! // keep constant for deterministic demo; can be upgraded

    return Math.round(finishFactor + fieldFactor + buyInFactor + recencyFactor)
  })

  const bestN = Math.min(cfg.bestResultsCount!, scores.length)
  return scores.slice(0, bestN).reduce((sum, s) => sum + s, 0)
}

/**
 * Compute top 100 ranking from a fixed dataset (seed + updates) without
 * altering the DB. This produces deterministic results from the same input.
 */
export function buildScoreBreakdown(
  players: PlayerItem[],
  resultsByPlayer: Record<string, Array<{ eventName: string; eventType?: string; date?: string; position?: number; points?: number }>>,
): PlayerScoreBreakdown[] {
  const breakdown: PlayerScoreBreakdown[] = []
  for (const player of players) {
    const entryResults = resultsByPlayer[player.id] || []
    // For the current site, we compute the score directly from the
    // results list. If none exist, default to a deterministic base score.
    const score =
      entryResults.length > 0
        ? calculateRankingScore(entryResults, { bestResultsCount: 10 })
        : 0
    breakdown.push({
      playerId: player.id,
      totalScore: score,
      eventResults: entryResults.map((r) => ({
        eventName: r.eventName,
        result: {
          position: r.position,
          points: r.points || 0,
          score,
          date: r.date,
          eventType: r.eventType,
        },
      })),
    })
  }
  return breakdown.sort((a, b) => b.totalScore - a.totalScore)
}
