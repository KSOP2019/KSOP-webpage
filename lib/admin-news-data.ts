import type { NewsItem, NewsCategory } from './types'
import { createAdminClient } from './supabase-server'

const ARTICLE_SELECT = 'id,slug,category,title,excerpt,body,cover_url,author,status,sort_order,published_at,created_at,updated_at,updated_by'
const VALID_NEWS_CATEGORIES: NewsCategory[] = ['FIELD NOTES', 'PLAYER PORTRAIT', 'KSOP JOURNAL']

export type AdminNewsItem = NewsItem & { adminId: string }

function safeCategory(value: string | null | undefined): NewsCategory {
  return VALID_NEWS_CATEGORIES.includes(value as NewsCategory)
    ? (value as NewsCategory)
    : 'FIELD NOTES'
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

function mapAdminNews(row: any): AdminNewsItem {
  return {
    adminId: String(row.id),
    slug: row.slug || '',
    category: safeCategory(row.category),
    date: row.published_at ? new Date(row.published_at).toISOString().split('T')[0] : 'DATE PENDING',
    title: row.title || '',
    excerpt: row.excerpt || '',
    body: row.body || '',
    coverUrl: row.cover_url || '',
    published: row.status === 'published',
  } as AdminNewsItem
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

export async function getAdminNews(): Promise<AdminNewsItem[]> {
  const client = createAdminClient()
  if (!client) throw new Error('ADMIN_NEWS_READ_BLOCKED: Supabase admin service role not configured.')

  const { data, error } = await client
    .from('articles')
    .select(ARTICLE_SELECT)
    .order('created_at', { ascending: false })

  if (error) throw new Error(`Supabase admin news read failed: ${error.message}`)
  return (data || []).map(mapAdminNews)
}

export async function getAdminNewsItem(locator: string): Promise<AdminNewsItem | undefined> {
  const client = createAdminClient()
  if (!client) throw new Error('ADMIN_NEWS_READ_BLOCKED: Supabase admin service role not configured.')

  let query = client.from('articles').select(ARTICLE_SELECT)
  query = isUuid(locator) ? query.eq('id', locator) : query.eq('slug', locator)
  const { data, error } = await query.maybeSingle()

  if (error) throw new Error(`Supabase admin news read failed: ${error.message}`)
  return data ? mapAdminNews(data) : undefined
}

export async function createAdminNews(item: NewsItem): Promise<AdminNewsItem> {
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

export async function updateAdminNews(locator: string, item: NewsItem): Promise<AdminNewsItem> {
  const client = createAdminClient()
  if (!client) throw new Error('ADMIN_NEWS_UPDATE_BLOCKED: Supabase admin service role not configured.')

  let readQuery = client.from('articles').select('id,slug,published_at')
  readQuery = isUuid(locator) ? readQuery.eq('id', locator) : readQuery.eq('slug', locator)
  const { data: current, error: readError } = await readQuery.single()
  if (readError) throw new Error(`Supabase admin news update lookup failed: ${readError.message}`)

  let updateQuery = client.from('articles').update(toArticlePayload(item, current?.published_at || null))
  updateQuery = isUuid(locator) ? updateQuery.eq('id', locator) : updateQuery.eq('slug', locator)
  const { data, error } = await updateQuery.select(ARTICLE_SELECT).single()

  if (error) throw new Error(`Supabase admin news update failed: ${error.message}`)
  return mapAdminNews(data)
}

export async function deleteAdminNews(locator: string): Promise<void> {
  const client = createAdminClient()
  if (!client) throw new Error('ADMIN_NEWS_DELETE_BLOCKED: Supabase admin service role not configured.')

  let query = client.from('articles').delete()
  query = isUuid(locator) ? query.eq('id', locator) : query.eq('slug', locator)
  const { error } = await query
  if (error) throw new Error(`Supabase admin news delete failed: ${error.message}`)
}
