import { NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/auth'
import { getHeroLayout, saveHeroLayout } from '@/lib/hero-layout-admin'

export async function GET() {
  return NextResponse.json(await getHeroLayout())
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const saved = await saveHeroLayout(body)
    return NextResponse.json(saved)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Hero layout save failed' },
      { status: 500 },
    )
  }
}
