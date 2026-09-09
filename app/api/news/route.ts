import { NextResponse } from 'next/server'
import { getNews } from '@/lib/data'

export async function GET() {
  const news = await getNews()
  return NextResponse.json(news.filter((item) => item.published))
}

export async function POST(request: Request) {
  const { isAdminAuthenticated } = await import('@/lib/auth')
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { createAdminNews } = await import('@/lib/admin-news-data')
  const slug = String(body.slug || body.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || '').trim()
  const nextItem = await createAdminNews({
    ...body,
    slug,
    published: body.published ?? false,
  })
  const { revalidateNewsPages } = await import('@/lib/revalidate')
  revalidateNewsPages(nextItem.slug)
  return NextResponse.json(nextItem, { status: 201 })
}
