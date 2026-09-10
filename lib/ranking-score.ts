export interface RankingResultInput {
  eventId?: string
  eventName: string
  eventDate: string
  position: number
  fieldSize: number
  buyIn: number
  earnings?: number
}

export interface RankingFormulaParams {
  finishFactorMax?: number
  fieldFactorMax?: number
  buyInFactorMax?: number
  recencyFactorMax?: number
  bestResultsCount?: number
}

function defaultFormula(): Required<RankingFormulaParams> {
  return {
    bestResultsCount: 10,
    finishFactorMax: 100,
    fieldFactorMax: 50,
    buyInFactorMax: 20,
    recencyFactorMax: 10,
  }
}

function safeClampNumber(value: number | undefined | null, min: number, max: number): number {
  const v = Number(value)
  if (Number.isNaN(v) || !Number.isFinite(v)) return min
  return Math.max(min, Math.min(max, v))
}

/**
 * Recency factor policy (normalized 0..1):
 * 0-6 months = 1.00; 6-12 = 0.90; 12-18 = 0.75; 18-24 = 0.60; >24 = 0
 * Invalid/missing date = 0 (explicit safe neutral, not full weight).
 */
function recencyValue(dateStr?: string): number {
  if (!dateStr || typeof dateStr !== 'string') return 0
  const trimmed = dateStr.trim()
  if (trimmed.length === 0) return 0
  const d = new Date(trimmed)
  if (Number.isNaN(d.getTime()) || !Number.isFinite(d.getTime())) return 0
  const now = new Date()
  const months = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth())
  if (months < 0) return 0
  if (months <= 6) return 1.0
  if (months <= 12) return 0.9
  if (months <= 18) return 0.75
  if (months <= 24) return 0.6
  return 0
}

export interface ScoreBreakdownRow {
  eventId?: string
  eventName: string
  eventDate: string
  position: number
  fieldSize: number
  buyIn: number
  earnings?: number
  eventScore: number
  finishFactor: number
  fieldFactor: number
  buyInFactor: number
  recencyFactor: number
  counted: boolean
}

export interface PlayerScoreBreakdown {
  playerId: string
  totalScore: number
  bestN: number
  rows: ScoreBreakdownRow[]
}

export function calculateEventScore(
  result: RankingResultInput,
  cfg?: Partial<RankingFormulaParams>,
): { eventScore: number; finishFactor: number; fieldFactor: number; buyInFactor: number; recencyFactor: number } {
  const params = { ...defaultFormula(), ...cfg }

  const position = safeClampNumber(result.position, 1, 10000)
  const fieldSize = safeClampNumber(result.fieldSize, 1, 10000)
  const buyIn = safeClampNumber(result.buyIn, 0, 100000000)

  // Finish factor: clamp base BEFORE Math.pow to avoid NaN/Infinity
  const rawFinishBase = Math.max(0, 1 - (position - 1) / 10)
  const finishBase = Math.min(1, Math.max(0, rawFinishBase))
  const finishFactor = params.finishFactorMax * Math.pow(finishBase, 1.4)

  // Field factor derived from fieldSize (not points)
  const fieldFactor = params.fieldFactorMax * Math.min(1, Math.max(0, fieldSize / 500))

  // Buy-in factor derived from buyIn (not points)
  const buyInFactor = params.buyInFactorMax * Math.min(1, Math.max(0, buyIn / 50000))

  // Recency factor normalized 0..1, scaled by max
  const recencyRaw = recencyValue(result.eventDate)
  const recencyFactor = params.recencyFactorMax * recencyRaw

  const eventScore = Math.round(finishFactor + fieldFactor + buyInFactor + recencyFactor)
  return {
    eventScore: Number.isFinite(eventScore) ? Math.max(0, eventScore) : 0,
    finishFactor: Number.isFinite(finishFactor) ? Math.max(0, finishFactor) : 0,
    fieldFactor: Number.isFinite(fieldFactor) ? Math.max(0, fieldFactor) : 0,
    buyInFactor: Number.isFinite(buyInFactor) ? Math.max(0, buyInFactor) : 0,
    recencyFactor: Number.isFinite(recencyFactor) ? Math.max(0, recencyFactor) : 0,
  }
}

export function calculateRankingScore(
  results: RankingResultInput[],
  params?: Partial<RankingFormulaParams>,
): number {
  const cfg = { ...defaultFormula(), ...params }
  if (!Array.isArray(results) || results.length === 0) return 0

  const rows: ScoreBreakdownRow[] = []

  for (const r of results) {
    const computed = calculateEventScore(r, cfg)
    rows.push({
      eventId: r.eventId,
      eventName: r.eventName || '',
      eventDate: r.eventDate || '',
      position: safeClampNumber(r.position, 1, 10000),
      fieldSize: safeClampNumber(r.fieldSize, 1, 10000),
      buyIn: safeClampNumber(r.buyIn, 0, 100000000),
      earnings: r.earnings != null ? safeClampNumber(r.earnings, 0, 1000000000) : undefined,
      eventScore: computed.eventScore,
      finishFactor: computed.finishFactor,
      fieldFactor: computed.fieldFactor,
      buyInFactor: computed.buyInFactor,
      recencyFactor: computed.recencyFactor,
      counted: false,
    })
  }

  // Best N: sort DESC by event score BEFORE slice
  const sorted = [...rows].sort((a, b) => b.eventScore - a.eventScore)
  const bestNCount = Math.max(0, Math.min(cfg.bestResultsCount, sorted.length))
  const bestRows = sorted.slice(0, bestNCount)
  for (const row of bestRows) {
    (row as ScoreBreakdownRow).counted = true
  }

  const totalScore = bestRows.reduce((sum, row) => sum + row.eventScore, 0)
  return Number.isFinite(totalScore) ? Math.max(0, totalScore) : 0
}

export function buildPlayerScoreBreakdown(
  playerId: string,
  results: RankingResultInput[],
  params?: Partial<RankingFormulaParams>,
): PlayerScoreBreakdown {
  const cfg = { ...defaultFormula(), ...params }
  const rows: ScoreBreakdownRow[] = []

  for (const r of results) {
    const computed = calculateEventScore(r, cfg)
    rows.push({
      eventId: r.eventId,
      eventName: r.eventName || '',
      eventDate: r.eventDate || '',
      position: safeClampNumber(r.position, 1, 10000),
      fieldSize: safeClampNumber(r.fieldSize, 1, 10000),
      buyIn: safeClampNumber(r.buyIn, 0, 100000000),
      earnings: r.earnings != null ? safeClampNumber(r.earnings, 0, 1000000000) : undefined,
      eventScore: computed.eventScore,
      finishFactor: computed.finishFactor,
      fieldFactor: computed.fieldFactor,
      buyInFactor: computed.buyInFactor,
      recencyFactor: computed.recencyFactor,
      counted: false,
    })
  }

  const sorted = [...rows].sort((a, b) => b.eventScore - a.eventScore)
  const bestNCount = Math.max(0, Math.min(cfg.bestResultsCount, sorted.length))
  const bestRows = sorted.slice(0, bestNCount)
  for (const row of bestRows) {
    (row as ScoreBreakdownRow).counted = true
  }

  const totalScore = bestRows.reduce((sum, row) => sum + row.eventScore, 0)
  return {
    playerId,
    totalScore: Number.isFinite(totalScore) ? Math.max(0, Math.round(totalScore)) : 0,
    bestN: bestNCount,
    rows: sorted,
  }
}
