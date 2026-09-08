import { NextResponse } from 'next/server'
import { bulkUpsertEvents } from '@/lib/data'
import { isAdminAuthenticated } from '@/lib/auth'

const VALID_EVENT_TYPES = ['NLH', 'PLO', 'SATELLITE', 'MAIN EVENT', 'HIGH ROLLER']

export async function POST(request: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { rows, publish }: { rows: any[]; publish: boolean } = await request.json()
    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'No valid rows' }, { status: 400 })
    }

    const newEvents: any[] = []
    for (const row of rows) {
      const typeVal = row.type || ''
      const safeType = VALID_EVENT_TYPES.includes(typeVal) ? typeVal : 'NLH'
      const slugSafe = row.slug || String(row.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-') || `event-${Date.now()}-${Math.random()}`
      newEvents.push({
        id: slugSafe,
        date: row.date,
        dayLabel: row.dayLabel || '',
        name: row.name || '',
        type: safeType,
        buyInType: row.buyInType || '',
        buyIn: row.buyIn || '',
        gtd: row.gtd || '',
        startingChips: Number(row.startingChips) || 0,
        lateReg: row.lateReg || '',
        levelTime: row.levelTime || '',
        blindStructure: [],
        published: publish,
      })
    }

    const importedCount = await bulkUpsertEvents(newEvents)
    return NextResponse.json({ imported: importedCount })
  } catch (e: any) {
    console.error('Bulk import error:', e.message)
    return NextResponse.json({ error: e.message || 'Import failed' }, { status: 500 })
  }
}
