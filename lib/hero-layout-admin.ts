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
  symbolEnabled: boolean
  symbolImageUrl: string
  railBottom: number
  railHeight: number
  cardIntro: string
  cardKicker: string
  cardPrimaryText: string
  cardSecondaryText: string
  cardImageUrl: string
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
  symbolEnabled: true,
  symbolImageUrl: '/images/ksop-symbol-dark.svg',
  railBottom: 46,
  railHeight: 86,
  cardIntro: '확정된 일정과 결과를 안내합니다.',
  cardKicker: 'NEXT SERIES · 다음 일정',
  cardPrimaryText: '이벤트 확인',
  cardSecondaryText: '일정',
  cardImageUrl: '',
}

function num(value: unknown, fallback: number) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function text(value: unknown, fallback: string, max = 120) {
  if (typeof value !== 'string') return fallback
  return value.trim().slice(0, max)
}

function url(value: unknown, fallback = '') {
  if (typeof value !== 'string') return fallback
  const trimmed = value.trim().slice(0, 2000)
  if (!trimmed) return ''
  if (trimmed.startsWith('/') || /^https?:\/\//i.test(trimmed)) return trimmed
  return fallback
}

export function normalizeHeroLayout(input?: Partial<HeroLayoutSettings> | null): HeroLayoutSettings {
  const value = input || {}
  return {
    brandX: clamp(num(value.brandX, DEFAULT_HERO_LAYOUT.brandX), 0, 1700),
    brandY: clamp(num(value.brandY, DEFAULT_HERO_LAYOUT.brandY), 0, 900),
    brandWidth: clamp(num(value.brandWidth, DEFAULT_HERO_LAYOUT.brandWidth), 240, 1700),
    brandFontSize: clamp(num(value.brandFontSize, DEFAULT_HERO_LAYOUT.brandFontSize), 28, 300),
    cardX: clamp(num(value.cardX, DEFAULT_HERO_LAYOUT.cardX), 0, 1550),
    cardY: clamp(num(value.cardY, DEFAULT_HERO_LAYOUT.cardY), 0, 820),
    cardWidth: clamp(num(value.cardWidth, DEFAULT_HERO_LAYOUT.cardWidth), 320, 1000),
    symbolX: clamp(num(value.symbolX, DEFAULT_HERO_LAYOUT.symbolX), 0, 1700),
    symbolY: clamp(num(value.symbolY, DEFAULT_HERO_LAYOUT.symbolY), 0, 820),
    symbolSize: clamp(num(value.symbolSize, DEFAULT_HERO_LAYOUT.symbolSize), 80, 900),
    symbolOpacity: clamp(num(value.symbolOpacity, DEFAULT_HERO_LAYOUT.symbolOpacity), 0.01, 0.5),
    symbolEnabled: typeof value.symbolEnabled === 'boolean' ? value.symbolEnabled : DEFAULT_HERO_LAYOUT.symbolEnabled,
    symbolImageUrl: url(value.symbolImageUrl, DEFAULT_HERO_LAYOUT.symbolImageUrl),
    railBottom: clamp(num(value.railBottom, DEFAULT_HERO_LAYOUT.railBottom), 0, 220),
    railHeight: clamp(num(value.railHeight, DEFAULT_HERO_LAYOUT.railHeight), 54, 180),
    cardIntro: text(value.cardIntro, DEFAULT_HERO_LAYOUT.cardIntro, 180),
    cardKicker: text(value.cardKicker, DEFAULT_HERO_LAYOUT.cardKicker, 80),
    cardPrimaryText: text(value.cardPrimaryText, DEFAULT_HERO_LAYOUT.cardPrimaryText, 40),
    cardSecondaryText: text(value.cardSecondaryText, DEFAULT_HERO_LAYOUT.cardSecondaryText, 40),
    cardImageUrl: url(value.cardImageUrl, DEFAULT_HERO_LAYOUT.cardImageUrl),
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
