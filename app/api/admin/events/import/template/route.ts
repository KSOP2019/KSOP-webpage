import { NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Generate basic Excel template using xlsx module
    const { utils, write } = await import('xlsx')

    const templateData = [
      ['slug', 'date', 'day_label', 'name', 'type', 'buy_in', 'gtd', 'starting_chips', 'late_reg', 'level_time', 'published'],
      [
        'new-event-1',
        '2026-11-17',
        'DAY 1',
        'Sample Event',
        'NLH',
        '₩10,000',
        '₩10,000',
        15000,
        'LEVEL 8',
        '15 MIN',
        'false',
      ],
    ]
    const ws = utils.aoa_to_sheet(templateData)
    const wb = { Sheets: { 'Events': ws }, SheetNames: ['Events'] }
    const buffer = write(wb, { bookType: 'xlsx', type: 'buffer' })

    return new NextResponse(Buffer.from(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="ksop-events-template.xlsx"',
        'Content-Length': String((buffer as any).byteLength || (buffer as ArrayBuffer).byteLength || 0),
      },
    })
  } catch (e: any) {
    console.error('Template download error:', e.message)
    return NextResponse.json({ error: 'Template generation failed. Ensure xlsx module is installed.' }, { status: 500 })
  }
}
