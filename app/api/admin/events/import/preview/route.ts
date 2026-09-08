import { NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/auth'

const VALID_EVENT_TYPES = ['NLH', 'PLO', 'SATELLITE', 'MAIN EVENT', 'HIGH ROLLER']

export async function POST(request: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!file.name.endsWith('.xlsx')) {
      return NextResponse.json({ error: 'Only .xlsx files allowed' }, { status: 400 })
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })
    }

    const { read, utils } = await import('xlsx')
    const data = await file.arrayBuffer()
    const workbook = read(new Uint8Array(data), { type: 'array' })
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const rows: any[] = utils.sheet_to_json(sheet) || []

    if (rows.length > 1000) {
      return NextResponse.json({ error: 'Too many rows (max 1000)' }, { status: 400 })
    }

    const preview: any[] = []
    const errors: string[] = []

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i]
      const rowErrors: string[] = []
      if (!r.name || String(r.name || '').trim() === '') rowErrors.push(`Row ${i + 1}: missing name`)

      // Strict date validation: must contain explicit 4-digit year and be valid calendar date
      if (!r.date) {
        rowErrors.push(`Row ${i + 1}: missing date`)
      } else {
        const dateStr = String(r.date || '').trim()
        if (!/\b(19|20)\d{2}\b/.test(dateStr)) {
          rowErrors.push(`Row ${i + 1}: date missing explicit year (${dateStr})`)
        } else {
          // Validate real calendar date
          try {
            const parsed = new Date(dateStr)
            if (isNaN(parsed.getTime()) || parsed.getFullYear() < 1970) {
              rowErrors.push(`Row ${i + 1}: invalid calendar date (${dateStr})`)
            }
          } catch {
            rowErrors.push(`Row ${i + 1}: invalid date format (${dateStr})`)
          }
        }
      }

      const typeVal = r.type || ''
      const safeType = VALID_EVENT_TYPES.includes(typeVal) ? typeVal : 'NLH'
      if (!VALID_EVENT_TYPES.includes(typeVal)) {
        rowErrors.push(`Row ${i + 1}: invalid event type (${typeVal || 'empty'})`)
      }

      const slugSafe = r.slug || String(r.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-') || `event-${Date.now()}-${i}`

      preview.push({
        rowIndex: i + 1,
        slug: slugSafe,
        name: String(r.name || ''),
        date: String(r.date || ''),
        type: safeType,
        buyIn: r.buyIn || '',
        buyInType: r.buyInType || 'INVITATION',
        gtd: r.gtd || '',
        startingChips: Number(r.startingChips) || 0,
        lateReg: r.lateReg || '',
        levelTime: r.levelTime || '',
        published: r.published === true || r.published === 'true' || r.published === 1,
        errors: rowErrors,
      })
      errors.push(...rowErrors)
    }

    return NextResponse.json({
      preview,
      errors,
      fileName: file.name,
      totalRows: rows.length,
      validRows: preview.length,
      invalidRows: preview.filter((r) => r.errors && r.errors.length > 0).length,
      newRows: preview.filter((r) => !r.slug || (r.slug.length > 0 && r.errors && r.errors.length === 0)).length,
      updateRows: preview.filter((r) => r.errors && r.errors.length > 0 ? false : r.slug).length,
      duplicateInFile: false,
    })
  } catch (e: any) {
    console.error('Import preview error:', e.message)
    return NextResponse.json({ error: e.message || 'Preview failed' }, { status: 500 })
  }
}
