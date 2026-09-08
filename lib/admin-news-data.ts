import type { NewsItem, NewsCategory } from './types'
import { createAdminClient } from './supabase-server'

const ARTICLE_SELECT = 'id,slug,category,title,excerpt,body,cover_url,author,status,sort_order,published_at,created_at,updated_at,updated_by'
const VALID_NEWS_CATEGORIES: NewsCategory[] = ['FIELD NOTES', 'PLAYER PORTRAIT', 'KSOP JOURNAL']

function safeCategory(value: string | null | undefined): NewsCategory {
  return VALID_NEWS_CATEGORIES.includes(value as NewsCategory)
    ? (value as NewsCategory)
    : 'FIELD NOTES'
}

function mapAdminNews(row: any): NewsItem {
  return {
    slug: row.slug || String(row.id),
    category: safeCategory(row.category),
    date: row.published_at ? new Date(row.published_at).toISOString().split('T')[0] : 'DATE PENDING',
    title: row.title || '',
    excerpt: row.excerpt || '',
    body: row.body || '',
    coverUrl: row.cover_url || '',
    published: row.status === 'published',
  } as NewsItem
}

function toArticlePayload(item: NewsItem, currentPublishedAt?: string | null) {
  const nowPublishedAt = item.published
    ? (currentPublishedAt || new Date().toISOString())
    : currentPublishedAt || null

  return {
    category: safeCategory(item.category),
    title: item.title,
    excerpt: item.excerpt || '',
    body: item.body || '',
    cover_url: (item as any).coverUrl || '',
    status: item.published ? 'published' : 'draft',
    published_at: nowPublishedAt,
  }
}

export async function getAdminNews(): Promise<NewsItem[]> {
  const client = createAdminClient()
  if (!client) throw new Error('ADMIN_NEWS_READ_BLOCKED: Supabase admin service role not configured.')

  const { data, error } = await client
    .from('articles')
    .select(ARTICLE_SELECT)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Supabase admin news read failed: ${error.message}`)
  return (data || []).map(mapAdminNews)
}

export async function getAdminNewsItem(slug: string): Promise<NewsItem | undefined> {
  const client = createAdminClient()
  if (!client) throw new Error('ADMIN_NEWS_READ_BLOCKED: Supabase admin service role not configured.')

  const { data, error } = await client
    .from('articles')
    .select(ARTICLE_SELECT)
    .eq('slug', slug)
    .maybeSingle()

  if (error) throw new Error(`Supabase admin news read failed: ${error.message}`)
  return data ? mapAdminNews(data) : undefined
}

export async function createAdminNews(item: NewsItem): Promise<NewsItem> {
  const client = createAdminClient()
  if (!client) throw new Error('ADMIN_NEWS_CREATE_BLOCKED: Supabase admin service role not configured.')

  const slug = String(item.slug || '').trim()
  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error('ADMIN_NEWS_CREATE_BLOCKED: invalid slug')
  }

  const payload = {
    slug,
    ...toArticlePayload(item),
    author: 'KSOP',
    sort_order: 0,
  }

  const { data, error } = await client
    .from('articles')
    .insert(payload)
    .select(ARTICLE_SELECT)
    .single()

  if (error) throw new Error(`Supabase admin news create failed: ${error.message}`)
  return mapAdminNews(data)
}

export async function updateAdminNews(slug: string, item: NewsItem): Promise<NewsItem> {
  const client = createAdminClient()
  if (!client) throw new Error('ADMIN_NEWS_UPDATE_BLOCKED: Supabase admin service role not configured.')

  const { data: current, error: readError } = await client
    .from('articles')
    .select('published_at')
    .eq('slug', slug)
    .single()
  if (readError) throw new Error(`Supabase admin news update lookup failed: ${readError.message}`)

  const { data, error } = await client
    .from('articles')
    .update(toArticlePayload(item, current?.published_at || null))
    .eq('slug', slug)
    .select(ARTICLE_SELECT)
    .single()

  if (error) throw new Error(`Supabase admin news update failed: ${error.message}`)
  return mapAdminNews(data)
}

export async function deleteAdminNews(slug: string): Promise<void> {
  const client = createAdminClient()
  if (!client) throw new Error('ADMIN_NEWS_DELETE_BLOCKED: Supabase admin service role not configured.')

  const { error } = await client.from('articles').delete().eq('slug', slug)
  if (error) throw new Error(`Supabase admin news delete failed: ${error.message}`)
}
