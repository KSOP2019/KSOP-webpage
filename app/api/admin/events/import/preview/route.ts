import { NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase-server'
import { getEvents } from '@/lib/data'

const VALID_EVENT_TYPES = ['NLH', 'PLO', 'SATELLITE', 'MAIN EVENT', 'HIGH ROLLER'] as const
const MAX_FILE_SIZE = 10 * 1024 * 1024
const MAX_ROWS = 1000

function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const parsed = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value
}

function normalizeExcelDate(value: unknown): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10)
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    const excelEpoch = Date.UTC(1899, 11, 30)
    const millis = excelEpoch + Math.round(value * 86400000)
    const parsed = new Date(millis)
    return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toISOString().slice(0, 10)
  }

  const text = String(value ?? '').trim()
  if (/^\d+(?:\.\d+)?$/.test(text)) {
    const serial = Number(text)
    if (Number.isFinite(serial) && serial > 0) {
      const excelEpoch = Date.UTC(1899, 11, 30)
      const parsed = new Date(excelEpoch + Math.round(serial * 86400000))
      if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10)
    }
  }

  return text
}

function deriveSlug(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function POST(request: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      return NextResponse.json({ error: 'Only .xlsx files allowed' }, { status: 400 })
    }
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })
    }

    const { read, utils } = await import('xlsx')
    const data = await file.arrayBuffer()
    const workbook = read(new Uint8Array(data), { type: 'array', cellDates: true })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const rows: any[] = utils.sheet_to_json(sheet, { defval: '', raw: true }) || []

    if (rows.length === 0) return NextResponse.json({ error: 'No data rows found' }, { status: 400 })
    if (rows.length > MAX_ROWS) {
      return NextResponse.json({ error: 'Too many rows (max 1000)' }, { status: 400 })
    }

    const existingSlugs = new Set<string>()
    const adminClient = createAdminClient()
    if (adminClient) {
      const { data: existing, error } = await adminClient.from('events').select('slug')
      if (error) return NextResponse.json({ error: `Existing event lookup failed: ${error.message}` }, { status: 500 })
      for (const row of existing || []) if (row.slug) existingSlugs.add(String(row.slug))
    } else {
      const events = await getEvents()
      for (const event of events) existingSlugs.add(event.id)
    }

    const seen = new Set<string>()
    const preview: any[] = []

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i]
      const rowErrors: string[] = []
      const name = String(r.name || '').trim()
      const date = normalizeExcelDate(r.date)
      const type = String(r.type || '').trim()
      const providedSlug = String(r.slug || '').trim()
      const slug = providedSlug || deriveSlug(name)

      if (!name) rowErrors.push('missing name')
      if (!date) rowErrors.push('missing date')
      else if (!isValidDate(date)) rowErrors.push('date must be a real YYYY-MM-DD calendar date')
      if (!VALID_EVENT_TYPES.includes(type as (typeof VALID_EVENT_TYPES)[number])) rowErrors.push(`invalid event type (${type || 'empty'})`)

      if (!slug) rowErrors.push('slug is empty and could not be derived from name')
      else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) rowErrors.push('slug must contain only lowercase letters, numbers, and hyphens')

      const chipsRaw = r.starting_chips
      let startingChips = 0
      if (chipsRaw !== '' && chipsRaw !== null && chipsRaw !== undefined) {
        const parsedChips = Number(chipsRaw)
        if (!Number.isFinite(parsedChips) || parsedChips < 0) rowErrors.push('starting_chips must be a number >= 0')
        else startingChips = parsedChips
      }

      let duplicateInFile = false
      if (slug) {
        if (seen.has(slug)) duplicateInFile = true
        else seen.add(slug)
      }

      let classification: 'NEW' | 'UPDATE_EXISTING' | 'INVALID' | 'DUPLICATE_IN_FILE'
      if (duplicateInFile) classification = 'DUPLICATE_IN_FILE'
      else if (rowErrors.length > 0) classification = 'INVALID'
      else if (existingSlugs.has(slug)) classification = 'UPDATE_EXISTING'
      else classification = 'NEW'

      preview.push({
        rowIndex: i + 1,
        slug,
        date,
        dayLabel: String(r.day_label || '').trim(),
        name,
        type,
        buyInType: '',
        buyIn: String(r.buy_in || '').trim(),
        gtd: String(r.gtd || '').trim(),
        startingChips,
        lateReg: String(r.late_reg || '').trim(),
        levelTime: String(r.level_time || '').trim(),
        blindStructure: [],
        classification,
        errors: duplicateInFile ? [...rowErrors, 'duplicate slug in file'] : rowErrors,
      })
    }

    const validRows = preview.filter((r) => r.classification === 'NEW' || r.classification === 'UPDATE_EXISTING')
    const invalidRows = preview.filter((r) => r.classification === 'INVALID')
    const duplicateRows = preview.filter((r) => r.classification === 'DUPLICATE_IN_FILE')

    return NextResponse.json({
      fileName: file.name,
      preview,
      totalRows: rows.length,
      validRows: validRows.length,
      invalidRows: invalidRows.length,
      newRows: validRows.filter((r) => r.classification === 'NEW').length,
      updateRows: validRows.filter((r) => r.classification === 'UPDATE_EXISTING').length,
      duplicateInFile: duplicateRows.length,
    })
  } catch (e: any) {
    console.error('Import preview error:', e.message)
    return NextResponse.json({ error: e.message || 'Preview failed' }, { status: 500 })
  }
}
