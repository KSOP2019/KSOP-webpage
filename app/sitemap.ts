import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/site-url'
import { getEvents, getPlayers, getNews } from '@/lib/data'
import { getAllSeries } from '@/lib/series'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl

  // Static public routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: new Date() },
    { url: `${base}/schedule`, lastModified: new Date() },
    { url: `${base}/events`, lastModified: new Date() },
    { url: `${base}/ranking`, lastModified: new Date() },
    { url: `${base}/news`, lastModified: new Date() },
    { url: `${base}/about`, lastModified: new Date() },
  ]

  // Schedule series routes (derived from existing SERIES data, no fabrication)
  const series = getAllSeries()
  const seriesRoutes = series.map((s) => ({
    url: `${base}/schedule/${s.slug}`,
    lastModified: new Date(),
  }))

  // Published events (real data only)
  const events = await getEvents()
  const eventRoutes = events
    .filter((e) => e.published)
    .map((e) => ({
      url: `${base}/events/${e.id}`,
      lastModified: new Date(),
    }))

  // Published players (real data only)
  const players = await getPlayers()
  const playerRoutes = players
    .filter((p) => p.published)
    .map((p) => ({
      url: `${base}/ranking/${p.id}`,
      lastModified: new Date(),
    }))

  // Published news (real data only)
  const news = await getNews()
  const newsRoutes = news
    .filter((n) => n.published)
    .map((n) => ({
      url: `${base}/news/${n.slug}`,
      lastModified: new Date(),
    }))

  // Valid about detail routes (from existing ABOUT_TOPICS definition)
  const aboutRoutes = [
    { url: `${base}/about/series`, lastModified: new Date() },
    { url: `${base}/about/venue`, lastModified: new Date() },
  ]

  return [...staticRoutes, ...seriesRoutes, ...eventRoutes, ...playerRoutes, ...newsRoutes, ...aboutRoutes]
}
