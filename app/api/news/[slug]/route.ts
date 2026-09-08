import { NextResponse } from 'next/server'
import { getNewsItem } from '@/lib/data'
import { deleteAdminNews, getAdminNewsItem, updateAdminNews } from '@/lib/admin-news-data'
import { isAdminAuthenticated } from '@/lib/auth'

type RouteContext = { params: Promise<{ slug: string }> }

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params
  const item = await getNewsItem(slug)
  if (!item || !item.published) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json(item)
}

export async function PUT(request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { slug } = await context.params
  const body = await request.json()
  const current = await getAdminNewsItem(slug)
  if (!current) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const updated = await updateAdminNews(slug, { ...current, ...body, slug })
  return NextResponse.json(updated)
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { slug } = await context.params
  const current = await getAdminNewsItem(slug)
  if (!current) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await deleteAdminNews(slug)
  return NextResponse.json({ ok: true })
}
