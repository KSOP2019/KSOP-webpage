import { NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/auth'

export async function GET() {
  try {
    if (!(await isAdminAuthenticated())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { utils, write } = await import('xlsx')
    const templateData = [[
      'slug',
      'date',
      'day_label',
      'name',
      'type',
      'buy_in',
      'gtd',
      'starting_chips',
      'late_reg',
      'level_time',
      'published',
    ]]
    const worksheet = utils.aoa_to_sheet(templateData)
    const workbook = { Sheets: { Events: worksheet }, SheetNames: ['Events'] }
    const buffer = write(workbook, { bookType: 'xlsx', type: 'buffer' })

    return new NextResponse(Buffer.from(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="ksop-events-template.xlsx"',
        'Content-Length': String((buffer as any).byteLength || 0),
      },
    })
  } catch (e: any) {
    console.error('Template download error:', e.message)
    return NextResponse.json({ error: 'Template generation failed' }, { status: 500 })
  }
}
