import { getNews, getNewsItem } from './data'
import { syntheticNews } from './synthetic-news'
import type { NewsItem } from './types'

/**
 * Environment-aware preview switch (single source of truth for News).
 * - preview (VERCEL_ENV === 'preview') or local development: serve the local
 *   synthetic 20-article dataset (lib/synthetic-news.ts). No Supabase reads/writes.
 * - production: real CMS news only via getNews()/getNewsItem(). Never synthetic.
 * This replaces the previous hardcoded `true` so a future merge to main can
 * never leak synthetic articles into production or /api/news production.
 */
export const NEWS_TEST_MODE =
  process.env.VERCEL_ENV === 'preview' ||
  process.env.NODE_ENV === 'development'

const SYNTHETIC_PREFIX = 'ksop-news-'

export function isSyntheticSlug(slug: string): boolean {
  return slug.startsWith(SYNTHETIC_PREFIX)
}

export function getSyntheticNewsItem(slug: string): NewsItem | undefined {
  return syntheticNews.find((item) => item.slug === slug)
}

/** Preview list: synthetic dataset in TEST_MODE, otherwise production data. */
export async function getNewsForPreview(): Promise<NewsItem[]> {
  if (NEWS_TEST_MODE) {
    return syntheticNews.filter((item) => item.published)
  }
  const news = await getNews()
  return news.filter((item) => item.published)
}

/**
 * Preview detail: synthetic lookup for ksop-news-* slugs in TEST_MODE,
 * otherwise (and for every non-synthetic slug) the existing CMS lookup,
 * so current production news detail behavior is fully preserved.
 */
export async function getNewsItemForPreview(slug: string): Promise<NewsItem | undefined> {
  if (NEWS_TEST_MODE && isSyntheticSlug(slug)) {
    const item = getSyntheticNewsItem(slug)
    return item && item.published ? item : undefined
  }
  return getNewsItem(slug)
}
