import { NextResponse } from 'next/server'
import { getNews, getNewsItem, saveNews } from '@/lib/data'
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
  const news = await getNews()
  const index = news.findIndex((item) => item.slug === slug)
  if (index === -1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  news[index] = { ...news[index], ...body, slug: news[index].slug }
  await saveNews(news)
  return NextResponse.json(news[index])
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { slug } = await context.params
  const news = await getNews()
  const nextNews = news.filter((item) => item.slug !== slug)
  if (nextNews.length === news.length) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await saveNews(nextNews)
  return NextResponse.json({ ok: true })
}
