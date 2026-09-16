import { promises as fs } from 'fs'
import path from 'path'
import { createAdminClient, createPublicClient } from './supabase-server'
import { DEFAULT_HERO_LAYOUT, normalizeHeroLayout, type HeroLayoutSettings } from './hero-layout'

const fallbackPath = process.env.VERCEL_ENV === 'preview'
  ? path.join('/tmp', 'ksop-preview-data', 'hero-layout.json')
  : path.join(process.cwd(), 'data', 'hero-layout.json')

async function readFallback(): Promise<HeroLayoutSettings> {
  try {
    const raw = await fs.readFile(fallbackPath, 'utf8')
    return normalizeHeroLayout(JSON.parse(raw))
  } catch {
    return DEFAULT_HERO_LAYOUT
  }
}

async function writeFallback(layout: HeroLayoutSettings) {
  await fs.mkdir(path.dirname(fallbackPath), { recursive: true })
  await fs.writeFile(fallbackPath, JSON.stringify(layout, null, 2), 'utf8')
}

export async function getHeroLayout(): Promise<HeroLayoutSettings> {
  const client = createPublicClient()
  if (!client) return readFallback()

  try {
    const { data, error } = await client
      .from('site_settings')
      .select('value')
      .eq('key', 'global')
      .single()

    if (error || !data?.value || typeof data.value !== 'object') return readFallback()
    const value = data.value as Record<string, unknown>
    return normalizeHeroLayout(value.hero_layout as Partial<HeroLayoutSettings> | undefined)
  } catch {
    return readFallback()
  }
}

export async function saveHeroLayout(input: Partial<HeroLayoutSettings>): Promise<HeroLayoutSettings> {
  const layout = normalizeHeroLayout(input)
  const admin = createAdminClient()

  if (!admin) {
    if (process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV !== 'preview') {
      throw new Error('PRODUCTION_WRITE_BLOCKED: Supabase admin service role is required.')
    }
    await writeFallback(layout)
    return layout
  }

  const { data, error: readError } = await admin
    .from('site_settings')
    .select('value')
    .eq('key', 'global')
    .single()

  if (readError && readError.code !== 'PGRST116') {
    throw new Error(`Hero layout read failed: ${readError.message}`)
  }

  const currentValue = data?.value && typeof data.value === 'object'
    ? data.value as Record<string, unknown>
    : {}

  const { error } = await admin.from('site_settings').upsert({
    key: 'global',
    value: { ...currentValue, hero_layout: layout },
  }, { onConflict: 'key' })

  if (error) throw new Error(`Hero layout save failed: ${error.message}`)
  return layout
}
