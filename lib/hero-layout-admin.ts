import { createAdminClient, createPublicClient } from './supabase-server'

export type HeroLayoutSettings = {
  brandX: number
  brandY: number
  brandWidth: number
  brandFontSize: number
  cardX: number
  cardY: number
  cardWidth: number
  symbolX: number
  symbolY: number
  symbolSize: number
  symbolOpacity: number
  railBottom: number
  railHeight: number
}

export const DEFAULT_HERO_LAYOUT: HeroLayoutSettings = {
  brandX: 295,
  brandY: 138,
  brandWidth: 780,
  brandFontSize: 76,
  cardX: 135,
  cardY: 430,
  cardWidth: 570,
  symbolX: 112,
  symbolY: 122,
  symbolSize: 384,
  symbolOpacity: 0.08,
  railBottom: 46,
  railHeight: 86,
}

function num(value: unknown, fallback: number) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function normalizeHeroLayout(input?: Partial<HeroLayoutSettings> | null): HeroLayoutSettings {
  const value = input || {}
  return {
    brandX: clamp(num(value.brandX, DEFAULT_HERO_LAYOUT.brandX), 0, 1600),
    brandY: clamp(num(value.brandY, DEFAULT_HERO_LAYOUT.brandY), 0, 820),
    brandWidth: clamp(num(value.brandWidth, DEFAULT_HERO_LAYOUT.brandWidth), 320, 1200),
    brandFontSize: clamp(num(value.brandFontSize, DEFAULT_HERO_LAYOUT.brandFontSize), 28, 140),
    cardX: clamp(num(value.cardX, DEFAULT_HERO_LAYOUT.cardX), 0, 1500),
    cardY: clamp(num(value.cardY, DEFAULT_HERO_LAYOUT.cardY), 0, 760),
    cardWidth: clamp(num(value.cardWidth, DEFAULT_HERO_LAYOUT.cardWidth), 360, 900),
    symbolX: clamp(num(value.symbolX, DEFAULT_HERO_LAYOUT.symbolX), 0, 1600),
    symbolY: clamp(num(value.symbolY, DEFAULT_HERO_LAYOUT.symbolY), 0, 760),
    symbolSize: clamp(num(value.symbolSize, DEFAULT_HERO_LAYOUT.symbolSize), 120, 700),
    symbolOpacity: clamp(num(value.symbolOpacity, DEFAULT_HERO_LAYOUT.symbolOpacity), 0.01, 0.35),
    railBottom: clamp(num(value.railBottom, DEFAULT_HERO_LAYOUT.railBottom), 16, 180),
    railHeight: clamp(num(value.railHeight, DEFAULT_HERO_LAYOUT.railHeight), 64, 150),
  }
}

export async function getHeroLayout(): Promise<HeroLayoutSettings> {
  const client = createPublicClient()
  if (!client) return DEFAULT_HERO_LAYOUT
  const { data, error } = await client.from('site_settings').select('value').eq('key', 'global').single()
  if (error || !data?.value || typeof data.value !== 'object') return DEFAULT_HERO_LAYOUT
  const value = data.value as Record<string, unknown>
  return normalizeHeroLayout(value.hero_layout as Partial<HeroLayoutSettings> | undefined)
}

export async function saveHeroLayout(input: Partial<HeroLayoutSettings>): Promise<HeroLayoutSettings> {
  const layout = normalizeHeroLayout(input)
  const admin = createAdminClient()
  if (!admin) throw new Error('Supabase admin service role is required to save HERO layout.')

  const { data, error: readError } = await admin.from('site_settings').select('value').eq('key', 'global').single()
  if (readError && readError.code !== 'PGRST116') throw new Error(`Hero layout read failed: ${readError.message}`)

  const currentValue = data?.value && typeof data.value === 'object' ? data.value as Record<string, unknown> : {}
  const { error } = await admin.from('site_settings').upsert({
    key: 'global',
    value: { ...currentValue, hero_layout: layout },
  }, { onConflict: 'key' })

  if (error) throw new Error(`Hero layout save failed: ${error.message}`)
  return layout
}
