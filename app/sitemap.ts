import type { MetadataRoute } from 'next'
import { getEvents, getNews } from '@/lib/data'
import { getAllSeries } from '@/lib/series'
import { SITE_URL } from '@/lib/site-url'

const STATIC_ROUTES = ['', '/schedule', '/events', '/ranking', '/news', '/about']

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route || '/'}`,
    lastModified: now,
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1 : 0.8,
  }))

  try {
    const [events, news] = await Promise.all([getEvents(), getNews()])
    for (const event of events.filter((item) => item.published)) {
      entries.push({
        url: `${SITE_URL}/events/${event.id}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.6,
      })
    }
    for (const item of news.filter((entry) => entry.published)) {
      entries.push({
        url: `${SITE_URL}/news/${item.slug}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.6,
      })
    }
  } catch {
    // Sitemap still serves static routes when data reads fail.
  }

  for (const series of getAllSeries()) {
    entries.push({
      url: `${SITE_URL}/schedule/${series.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6,
    })
  }

  return entries
}
