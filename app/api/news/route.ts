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
  const { getNews: readNews, saveNews } = await import('@/lib/data')
  const news = await readNews()
  const nextItem = {
    ...body,
    slug: body.slug ?? body.title.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-'),
    published: body.published ?? true,
  }
  news.unshift(nextItem)
  await saveNews(news)
  return NextResponse.json(nextItem, { status: 201 })
}
