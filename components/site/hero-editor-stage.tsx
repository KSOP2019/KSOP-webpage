'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { HeroLayoutSettings } from '@/lib/hero-layout'
import { normalizeHeroLayout } from '@/lib/hero-layout'

const HERO_W = 1920
const HERO_H = 998

type EditorMessage = {
  type?: string
  layout?: HeroLayoutSettings
}

function cssString(value: string) {
  return JSON.stringify(value)
}

function cssUrl(value: string) {
  return value ? `url(${JSON.stringify(value)})` : 'none'
}

export function HeroEditorStage() {
  const frameRef = useRef<HTMLIFrameElement>(null)
  const latestLayout = useRef<HeroLayoutSettings | null>(null)
  const [heroTop, setHeroTop] = useState(82)

  const applyLayout = useCallback((input: HeroLayoutSettings) => {
    const frame = frameRef.current
    const doc = frame?.contentDocument
    if (!doc) return

    const hero = doc.querySelector<HTMLElement>('.premium-hero')
    if (!hero) return

    const layout = normalizeHeroLayout(input)
    hero.style.setProperty('--hero-brand-x', `${layout.brandX}px`)
    hero.style.setProperty('--hero-brand-y', `${layout.brandY}px`)
    hero.style.setProperty('--hero-brand-width', `${layout.brandWidth}px`)
    hero.style.setProperty('--hero-brand-font-size', `${layout.brandFontSize}px`)
    hero.style.setProperty('--hero-card-x', `${layout.cardX}px`)
    hero.style.setProperty('--hero-card-y', `${layout.cardY}px`)
    hero.style.setProperty('--hero-card-width', `${layout.cardWidth}px`)
    hero.style.setProperty('--hero-symbol-x', `${layout.symbolX}px`)
    hero.style.setProperty('--hero-symbol-y', `${layout.symbolY}px`)
    hero.style.setProperty('--hero-symbol-size', `${layout.symbolSize}px`)
    hero.style.setProperty('--hero-symbol-opacity', String(layout.symbolOpacity))
    hero.style.setProperty('--hero-symbol-display', layout.symbolEnabled && layout.symbolImageUrl ? 'block' : 'none')
    hero.style.setProperty('--hero-symbol-image', cssUrl(layout.symbolImageUrl))
    hero.style.setProperty('--hero-rail-bottom', `${layout.railBottom}px`)
    hero.style.setProperty('--hero-rail-height', `${layout.railHeight}px`)
    hero.style.setProperty('--hero-card-intro', cssString(layout.cardIntro))
    hero.style.setProperty('--hero-card-kicker', cssString(layout.cardKicker))
    hero.style.setProperty('--hero-card-primary-text', cssString(layout.cardPrimaryText))
    hero.style.setProperty('--hero-card-secondary-text', cssString(layout.cardSecondaryText))
    hero.style.setProperty('--hero-card-image', cssUrl(layout.cardImageUrl))

    let titleStyle = doc.getElementById('ksop-hero-editor-card-title') as HTMLStyleElement | null
    if (!titleStyle) {
      titleStyle = doc.createElement('style')
      titleStyle.id = 'ksop-hero-editor-card-title'
      doc.head.appendChild(titleStyle)
    }
    titleStyle.textContent = layout.cardTitleText
      ? `main:has(> .premium-hero) > .premium-hero .hero-next-series > strong{font-size:0!important}main:has(> .premium-hero) > .premium-hero .hero-next-series > strong::before{content:${cssString(layout.cardTitleText)}!important;font-size:19px!important;line-height:1.2!important;font-weight:700!important;letter-spacing:-.02em!important}`
      : ''
  }, [])

  const syncFrame = useCallback(() => {
    const frame = frameRef.current
    const win = frame?.contentWindow
    const doc = frame?.contentDocument
    if (!win || !doc) return

    const hero = doc.querySelector<HTMLElement>('.premium-hero')
    if (!hero) {
      window.setTimeout(syncFrame, 80)
      return
    }

    const top = Math.max(0, Math.round(hero.getBoundingClientRect().top + win.scrollY))
    setHeroTop(top)
    if (latestLayout.current) applyLayout(latestLayout.current)
  }, [applyLayout])

  useEffect(() => {
    function onMessage(event: MessageEvent<EditorMessage>) {
      if (!event.data || event.data.type !== 'KSOP_HERO_EDITOR_LAYOUT' || !event.data.layout) return
      const next = normalizeHeroLayout(event.data.layout)
      latestLayout.current = next
      applyLayout(next)
    }

    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [applyLayout])

  return (
    <div style={{ position: 'fixed', inset: 0, width: HERO_W, height: HERO_H, overflow: 'hidden', background: '#07111f' }}>
      <iframe
        ref={frameRef}
        src="/?hero-editor-stage=1"
        title="KSOP HERO exact preview stage"
        onLoad={syncFrame}
        tabIndex={-1}
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: 0,
          top: -heroTop,
          width: HERO_W,
          height: HERO_H + heroTop + 120,
          border: 0,
          margin: 0,
          padding: 0,
          pointerEvents: 'none',
          background: '#07111f',
        }}
      />
    </div>
  )
}
