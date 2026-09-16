'use client'

import type { HeroLayoutSettings } from '@/lib/hero-layout'
import { normalizeHeroLayout } from '@/lib/hero-layout'

function cssString(value: string) {
  return JSON.stringify(value)
}

function cssUrl(value: string) {
  return value ? `url(${JSON.stringify(value)})` : 'none'
}

export function HeroLayoutRuntime({ initialLayout }: { initialLayout: HeroLayoutSettings }) {
  const layout = normalizeHeroLayout(initialLayout)
  const css = `
main:has(> .premium-hero) > .premium-hero {
  --hero-brand-x: ${layout.brandX}px;
  --hero-brand-y: ${layout.brandY}px;
  --hero-brand-width: ${layout.brandWidth}px;
  --hero-brand-font-size: ${layout.brandFontSize}px;
  --hero-card-x: ${layout.cardX}px;
  --hero-card-y: ${layout.cardY}px;
  --hero-card-width: ${layout.cardWidth}px;
  --hero-symbol-x: ${layout.symbolX}px;
  --hero-symbol-y: ${layout.symbolY}px;
  --hero-symbol-size: ${layout.symbolSize}px;
  --hero-symbol-opacity: ${layout.symbolOpacity};
  --hero-symbol-display: ${layout.symbolEnabled && layout.symbolImageUrl ? 'block' : 'none'};
  --hero-symbol-image: ${cssUrl(layout.symbolImageUrl)};
  --hero-rail-bottom: ${layout.railBottom}px;
  --hero-rail-height: ${layout.railHeight}px;
  --hero-card-intro: ${cssString(layout.cardIntro)};
  --hero-card-kicker: ${cssString(layout.cardKicker)};
  --hero-card-primary-text: ${cssString(layout.cardPrimaryText)};
  --hero-card-secondary-text: ${cssString(layout.cardSecondaryText)};
  --hero-card-image: ${cssUrl(layout.cardImageUrl)};
}`

  return <style dangerouslySetInnerHTML={{ __html: css }} />
}
