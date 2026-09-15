'use client'

import type { HeroLayoutSettings } from '@/lib/types'
import { normalizeHeroLayout } from '@/lib/hero-layout'

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
  --hero-rail-bottom: ${layout.railBottom}px;
  --hero-rail-height: ${layout.railHeight}px;
}`

  return <style dangerouslySetInnerHTML={{ __html: css }} />
}
