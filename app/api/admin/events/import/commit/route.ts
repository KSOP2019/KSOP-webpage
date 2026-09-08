import { NextResponse } from 'next/server'
import { bulkUpsertEvents } from '@/lib/data';
import { isAdminAuthenticated } from '@/lib/auth';

const VALID_EVENT_TYPES = ['NLH', 'PLO', 'SATELLITE', 'MAIN EVENT', 'HIGH ROLLER'];

export async function POST(request: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { rows, publish } = await request.json();
    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'No valid rows' }, { status: 400 })
    }
    if (rows.length > 1000) {
      return NextResponse.json({ error: 'Too many rows (max 1000)' }, { status: 400 })
    }

    const eventsToUpsert: any[] = [];
    for (const row of rows) {
      const name = String(row.name || '').trim();
      const dateStr = String(row.date || '').trim();
      const typeVal = String(row.type || '').trim();

      if (!name || name.length === 0) {
        return NextResponse.json({ error: `Invalid row: missing name` }, { status: 400 });
      }
      if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return NextResponse.json({ error: `Invalid row for "${name}": date must be YYYY-MM-DD` }, { status: 400 });
      }
      try {
        const parsed = new Date(dateStr);
        if (isNaN(parsed.getTime()) || parsed.getFullYear() < 1970) {
          return NextResponse.json({ error: `Invalid row for "${name}": invalid calendar date (${dateStr})` }, { status: 400 });
        }
      } catch {
        return NextResponse.json({ error: `Invalid row for "${name}": invalid date format (${dateStr})` }, { status: 400 });
      }
      if (!VALID_EVENT_TYPES.includes(typeVal)) {
        return NextResponse.json({ error: `Invalid row for "${name}": invalid event type (${typeVal || 'empty'})` }, { status: 400 });
      }

      const slug = row.slug || String(name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-') || '';
      if (!slug) {
        return NextResponse.json({ error: `Invalid row for "${name}": derived slug is empty` }, { status: 400 });
      }

      eventsToUpsert.push({
        id: slug,
        date: dateStr,
        dayLabel: String(row.dayLabel || ''),
        name: name,
        type: typeVal,
        buyInType: String(row.buyInType || 'INVITATION'),
        buyIn: String(row.buyIn || ''),
        gtd: String(row.gtd || ''),
        startingChips: Number(row.startingChips) || 0,
        lateReg: String(row.lateReg || ''),
        levelTime: String(row.levelTime || ''),
        blindStructure: [],
        published: publish === true,
      });
    }

    const importedCount = await bulkUpsertEvents(eventsToUpsert);
    return NextResponse.json({ imported: importedCount, mode: publish ? 'publish' : 'draft' });
  } catch (e: any) {
    console.error('Batch import commit error:', e.message);
    return NextResponse.json({ error: e.message || 'Import failed' }, { status: 500 });
  }
}
