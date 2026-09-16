'use client'

import { useEffect, useState } from 'react'
import { HeroCanvas } from '@/components/site/hero-canvas'
import { useSite } from '@/components/site/site-provider'
import type { HeroLayoutSettings } from '@/lib/hero-layout'
import { normalizeHeroLayout } from '@/lib/hero-layout'

export function HeroCanvasRuntime({
  initialLayout,
  seriesCount,
  seriesLabel,
  seriesDate,
  seriesLocation,
  seriesHref,
}: {
  initialLayout: HeroLayoutSettings
  seriesCount: number
  seriesLabel: string
  seriesDate: string
  seriesLocation: string
  seriesHref: string
}) {
  const { content } = useSite()
  const [layout, setLayout] = useState(() => normalizeHeroLayout(initialLayout))

  useEffect(() => {
    let cancelled = false

    async function refresh() {
      try {
        const response = await fetch(`/api/hero-layout?ts=${Date.now()}`, {
          cache: 'no-store',
          headers: { 'cache-control': 'no-cache' },
        })
        if (!response.ok) return
        const next = normalizeHeroLayout(await response.json())
        if (!cancelled) setLayout(next)
      } catch {
        // Keep server value if refresh is temporarily unavailable.
      }
    }

    void refresh()
    const onFocus = () => void refresh()
    const onVisible = () => {
      if (document.visibilityState === 'visible') void refresh()
    }
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      cancelled = true
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  return (
    <>
      <style>{`
        main:has(> .ksop-shared-hero) > .premium-hero:not(.ksop-shared-hero) { display: none !important; }
        main:has(> .ksop-shared-hero) > .ksop-shared-hero { display: block !important; }
      `}</style>
      <HeroCanvas
        layout={layout}
        heroImage={content.heroImage || '/images/ksop-hero-arena.png'}
        seriesCount={seriesCount}
        seriesLabel={seriesLabel}
        seriesDate={seriesDate}
        seriesLocation={seriesLocation}
        seriesHref={seriesHref}
        interactive
      />
    </>
  )
}
