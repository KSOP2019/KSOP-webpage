import { NextResponse } from 'next/server'
import { bulkUpsertEvents } from '@/lib/data'
import { isAdminAuthenticated } from '@/lib/auth'

const VALID_EVENT_TYPES = ['NLH', 'PLO', 'SATELLITE', 'MAIN EVENT', 'HIGH ROLLER'] as const
const MAX_ROWS = 1000

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const parsed = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
}

export async function POST(request: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { rows, mode }: { rows: any[]; mode: 'draft' | 'publish' } = await request.json()
    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'No valid rows' }, { status: 400 })
    }
    if (rows.length > MAX_ROWS) {
      return NextResponse.json({ error: 'Too many rows (max 1000)' }, { status: 400 })
    }
    if (mode !== 'draft' && mode !== 'publish') {
      return NextResponse.json({ error: 'Invalid import mode' }, { status: 400 })
    }

    const eventsToUpsert: any[] = []
    const seen = new Set<string>()

    for (const row of rows) {
      const name = String(row.name || '').trim()
      const slug = String(row.slug || '').trim()
      const date = String(row.date || '').trim()
      const type = String(row.type || '').trim()

      if (!name) return NextResponse.json({ error: 'Invalid row: missing name' }, { status: 400 })
      if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
        return NextResponse.json({ error: `Invalid row for "${name}": invalid slug` }, { status: 400 })
      }
      if (seen.has(slug)) {
        return NextResponse.json({ error: `Duplicate slug in commit payload: ${slug}` }, { status: 400 })
      }
      seen.add(slug)

      if (!isValidDate(date)) {
        return NextResponse.json({ error: `Invalid row for "${name}": date must be a real YYYY-MM-DD calendar date` }, { status: 400 })
      }
      if (!VALID_EVENT_TYPES.includes(type as (typeof VALID_EVENT_TYPES)[number])) {
        return NextResponse.json({ error: `Invalid row for "${name}": invalid event type (${type || 'empty'})` }, { status: 400 })
      }

      const startingChips = row.startingChips === '' || row.startingChips === null || row.startingChips === undefined
        ? 0
        : Number(row.startingChips)
      if (!Number.isFinite(startingChips) || startingChips < 0) {
        return NextResponse.json({ error: `Invalid row for "${name}": startingChips must be a number >= 0` }, { status: 400 })
      }

      eventsToUpsert.push({
        id: slug,
        date,
        dayLabel: String(row.dayLabel || ''),
        name,
        type,
        buyInType: String(row.buyInType || ''),
        buyIn: String(row.buyIn || ''),
        gtd: String(row.gtd || ''),
        startingChips,
        lateReg: String(row.lateReg || ''),
        levelTime: String(row.levelTime || ''),
        blindStructure: [],
        published: mode === 'publish',
      })
    }

    const importedCount = await bulkUpsertEvents(eventsToUpsert)
    const { revalidateEventPages } = await import('@/lib/revalidate')
    revalidateEventPages()
    return NextResponse.json({ imported: importedCount, mode })
  } catch (e: any) {
    console.error('Batch import commit error:', e.message)
    return NextResponse.json({ error: e.message || 'Import failed' }, { status: 500 })
  }
}
