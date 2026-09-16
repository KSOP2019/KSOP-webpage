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
  cardTitleText: string
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
  cardTitleText: '',
  cardPrimaryText: '이벤트 확인',
  cardSecondaryText: '일정',
  cardImageUrl: '',
}

function numberOr(value: unknown, fallback: number) {
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

export function normalizeHeroLayout(value?: Partial<HeroLayoutSettings> | null): HeroLayoutSettings {
  const input = value || {}
  return {
    brandX: clamp(numberOr(input.brandX, DEFAULT_HERO_LAYOUT.brandX), 0, 1700),
    brandY: clamp(numberOr(input.brandY, DEFAULT_HERO_LAYOUT.brandY), 0, 900),
    brandWidth: clamp(numberOr(input.brandWidth, DEFAULT_HERO_LAYOUT.brandWidth), 180, 1800),
    brandFontSize: clamp(numberOr(input.brandFontSize, DEFAULT_HERO_LAYOUT.brandFontSize), 28, 300),
    cardX: clamp(numberOr(input.cardX, DEFAULT_HERO_LAYOUT.cardX), 0, 1550),
    cardY: clamp(numberOr(input.cardY, DEFAULT_HERO_LAYOUT.cardY), 0, 820),
    cardWidth: clamp(numberOr(input.cardWidth, DEFAULT_HERO_LAYOUT.cardWidth), 320, 1000),
    symbolX: clamp(numberOr(input.symbolX, DEFAULT_HERO_LAYOUT.symbolX), 0, 1700),
    symbolY: clamp(numberOr(input.symbolY, DEFAULT_HERO_LAYOUT.symbolY), 0, 820),
    symbolSize: clamp(numberOr(input.symbolSize, DEFAULT_HERO_LAYOUT.symbolSize), 80, 900),
    symbolOpacity: clamp(numberOr(input.symbolOpacity, DEFAULT_HERO_LAYOUT.symbolOpacity), 0.01, 0.5),
    symbolEnabled: typeof input.symbolEnabled === 'boolean' ? input.symbolEnabled : DEFAULT_HERO_LAYOUT.symbolEnabled,
    symbolImageUrl: url(input.symbolImageUrl, DEFAULT_HERO_LAYOUT.symbolImageUrl),
    railBottom: clamp(numberOr(input.railBottom, DEFAULT_HERO_LAYOUT.railBottom), 0, 220),
    railHeight: clamp(numberOr(input.railHeight, DEFAULT_HERO_LAYOUT.railHeight), 54, 180),
    cardIntro: text(input.cardIntro, DEFAULT_HERO_LAYOUT.cardIntro, 180),
    cardKicker: text(input.cardKicker, DEFAULT_HERO_LAYOUT.cardKicker, 80),
    cardTitleText: text(input.cardTitleText, DEFAULT_HERO_LAYOUT.cardTitleText, 100),
    cardPrimaryText: text(input.cardPrimaryText, DEFAULT_HERO_LAYOUT.cardPrimaryText, 40),
    cardSecondaryText: text(input.cardSecondaryText, DEFAULT_HERO_LAYOUT.cardSecondaryText, 40),
    cardImageUrl: url(input.cardImageUrl, DEFAULT_HERO_LAYOUT.cardImageUrl),
  }
}
