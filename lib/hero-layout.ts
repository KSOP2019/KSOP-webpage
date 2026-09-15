import type { HeroLayoutSettings } from './types'

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

function numberOr(value: unknown, fallback: number) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function normalizeHeroLayout(value?: Partial<HeroLayoutSettings> | null): HeroLayoutSettings {
  const input = value || {}
  return {
    brandX: clamp(numberOr(input.brandX, DEFAULT_HERO_LAYOUT.brandX), 0, 1600),
    brandY: clamp(numberOr(input.brandY, DEFAULT_HERO_LAYOUT.brandY), 0, 820),
    brandWidth: clamp(numberOr(input.brandWidth, DEFAULT_HERO_LAYOUT.brandWidth), 320, 1200),
    brandFontSize: clamp(numberOr(input.brandFontSize, DEFAULT_HERO_LAYOUT.brandFontSize), 28, 140),
    cardX: clamp(numberOr(input.cardX, DEFAULT_HERO_LAYOUT.cardX), 0, 1500),
    cardY: clamp(numberOr(input.cardY, DEFAULT_HERO_LAYOUT.cardY), 0, 760),
    cardWidth: clamp(numberOr(input.cardWidth, DEFAULT_HERO_LAYOUT.cardWidth), 360, 900),
    symbolX: clamp(numberOr(input.symbolX, DEFAULT_HERO_LAYOUT.symbolX), 0, 1600),
    symbolY: clamp(numberOr(input.symbolY, DEFAULT_HERO_LAYOUT.symbolY), 0, 760),
    symbolSize: clamp(numberOr(input.symbolSize, DEFAULT_HERO_LAYOUT.symbolSize), 120, 700),
    symbolOpacity: clamp(numberOr(input.symbolOpacity, DEFAULT_HERO_LAYOUT.symbolOpacity), 0.01, 0.35),
    railBottom: clamp(numberOr(input.railBottom, DEFAULT_HERO_LAYOUT.railBottom), 16, 180),
    railHeight: clamp(numberOr(input.railHeight, DEFAULT_HERO_LAYOUT.railHeight), 64, 150),
  }
}
