import { NextResponse } from 'next/server'
import { getSiteContent, saveSiteContent } from '@/lib/data'
import { isAdminAuthenticated } from '@/lib/auth'

export async function GET() {
  const content = await getSiteContent()
  return NextResponse.json(content)
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const current = await getSiteContent()
  const nextContent = { ...current, ...body, copy: { ...current.copy, ...body.copy } }
  await saveSiteContent(nextContent)
  const { revalidateContentPages } = await import('@/lib/revalidate')
  revalidateContentPages()
  return NextResponse.json(nextContent)
}
