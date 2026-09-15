import { NextResponse } from 'next/server'
import { getSiteContent, saveSiteContent } from '@/lib/data'
import { getHeroLayout, saveHeroLayout } from '@/lib/hero-layout-store'
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
  const [current, heroLayout] = await Promise.all([
    getSiteContent(),
    getHeroLayout(),
  ])
  const nextContent = { ...current, ...body, copy: { ...current.copy, ...body.copy } }
  await saveSiteContent(nextContent)
  // saveSiteContent rewrites the global settings payload, so immediately restore
  // the independently managed HERO layout block rather than letting a content save erase it.
  await saveHeroLayout(heroLayout)
  const { revalidateContentPages } = await import('@/lib/revalidate')
  revalidateContentPages()
  return NextResponse.json(nextContent)
}
