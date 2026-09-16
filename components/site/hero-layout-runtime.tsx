'use client'

import { useEffect, useState } from 'react'
import type { HeroLayoutSettings } from '@/lib/hero-layout'
import { normalizeHeroLayout } from '@/lib/hero-layout'

function cssString(value: string) {
  return JSON.stringify(value)
}

function cssUrl(value: string) {
  return value ? `url(${JSON.stringify(value)})` : 'none'
}

export function HeroLayoutRuntime({ initialLayout }: { initialLayout: HeroLayoutSettings }) {
  const [liveLayout, setLiveLayout] = useState(() => normalizeHeroLayout(initialLayout))

  useEffect(() => {
    let cancelled = false

    async function refreshLayout() {
      try {
        const response = await fetch(`/api/hero-layout?ts=${Date.now()}`, {
          cache: 'no-store',
          headers: { 'cache-control': 'no-cache' },
        })
        if (!response.ok) return
        const next = normalizeHeroLayout(await response.json())
        if (!cancelled) setLiveLayout(next)
      } catch {
        // Keep the server-rendered layout if the live refresh is temporarily unavailable.
      }
    }

    void refreshLayout()
    const onFocus = () => void refreshLayout()
    const onVisibility = () => {
      if (document.visibilityState === 'visible') void refreshLayout()
    }

    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      cancelled = true
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  const layout = liveLayout
  const titleOverride = layout.cardTitleText
    ? `
main:has(> .premium-hero) > .premium-hero .hero-next-series > strong {
  font-size: 0 !important;
}
main:has(> .premium-hero) > .premium-hero .hero-next-series > strong::before {
  content: ${cssString(layout.cardTitleText)} !important;
  font-size: 19px !important;
  line-height: 1.2 !important;
  font-weight: 700 !important;
  letter-spacing: -.02em !important;
}
`
    : ''

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
}
${titleOverride}`

  return <style dangerouslySetInnerHTML={{ __html: css }} />
}
