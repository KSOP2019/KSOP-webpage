import { getNews, getNewsItem } from './data'
import { syntheticNews } from './synthetic-news'
import type { NewsItem } from './types'

/**
 * Design-review switch for the design/glass-patch preview.
 * - true: /news list and /news/[slug] detail serve the local synthetic
 *   dataset (lib/synthetic-news.ts). No Supabase reads/writes, no CMS change.
 * - false: production behavior — existing getNews / getNewsItem only.
 * Revert to false before launch; then delete lib/synthetic-news.ts.
 */
export const NEWS_TEST_MODE = true

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
