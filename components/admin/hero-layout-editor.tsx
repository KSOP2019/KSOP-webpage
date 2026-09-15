'use client'

import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { DEFAULT_HERO_LAYOUT, normalizeHeroLayout } from '@/lib/hero-layout'
import type { HeroLayoutSettings } from '@/lib/types'

type AxisKey = 'brandX' | 'brandY' | 'cardX' | 'cardY' | 'symbolX' | 'symbolY'
type LayoutKey = keyof HeroLayoutSettings

type DragState = {
  xKey: AxisKey
  yKey: AxisKey
  pointerId: number
  startClientX: number
  startClientY: number
  startX: number
  startY: number
} | null

const HERO_W = 1920
const HERO_H = 998

function fieldLabel(key: LayoutKey) {
  const labels: Record<LayoutKey, string> = {
    brandX: '대형 타이틀 X',
    brandY: '대형 타이틀 Y',
    brandWidth: '대형 타이틀 폭',
    brandFontSize: '대형 타이틀 글자 크기',
    cardX: '액션 카드 X',
    cardY: '액션 카드 Y',
    cardWidth: '액션 카드 폭',
    symbolX: 'KSOP 심볼 X',
    symbolY: 'KSOP 심볼 Y',
    symbolSize: 'KSOP 심볼 크기',
    symbolOpacity: 'KSOP 심볼 투명도',
    railBottom: '하단 정보 띠 아래 여백',
    railHeight: '하단 정보 띠 높이',
  }
  return labels[key]
}

const ranges: Record<LayoutKey, { min: number; max: number; step: number }> = {
  brandX: { min: 0, max: 1400, step: 1 },
  brandY: { min: 0, max: 700, step: 1 },
  brandWidth: { min: 320, max: 1200, step: 1 },
  brandFontSize: { min: 28, max: 140, step: 1 },
  cardX: { min: 0, max: 1300, step: 1 },
  cardY: { min: 0, max: 680, step: 1 },
  cardWidth: { min: 360, max: 900, step: 1 },
  symbolX: { min: 0, max: 1400, step: 1 },
  symbolY: { min: 0, max: 650, step: 1 },
  symbolSize: { min: 120, max: 700, step: 1 },
  symbolOpacity: { min: 0.01, max: 0.35, step: 0.01 },
  railBottom: { min: 16, max: 180, step: 1 },
  railHeight: { min: 64, max: 150, step: 1 },
}

export function HeroLayoutEditor({
  initialLayout,
  heroImage,
  darkLogo,
}: {
  initialLayout: HeroLayoutSettings
  heroImage: string
  darkLogo: string
}) {
  const [layout, setLayout] = useState(() => normalizeHeroLayout(initialLayout))
  const [drag, setDrag] = useState<DragState>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const previewRef = useRef<HTMLDivElement>(null)

  const update = (key: LayoutKey, value: number) => {
    setSaved(false)
    setLayout((current) => normalizeHeroLayout({ ...current, [key]: value }))
  }

  const startDrag = (
    event: ReactPointerEvent<HTMLElement>,
    xKey: AxisKey,
    yKey: AxisKey,
  ) => {
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    setDrag({
      xKey,
      yKey,
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: layout[xKey],
      startY: layout[yKey],
    })
  }

  const moveDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag || !previewRef.current) return
    const rect = previewRef.current.getBoundingClientRect()
    if (!rect.width || !rect.height) return
    const dx = (event.clientX - drag.startClientX) * (HERO_W / rect.width)
    const dy = (event.clientY - drag.startClientY) * (HERO_H / rect.height)
    setSaved(false)
    setLayout((current) => normalizeHeroLayout({
      ...current,
      [drag.xKey]: drag.startX + dx,
      [drag.yKey]: drag.startY + dy,
    }))
  }

  const stopDrag = () => setDrag(null)

  async function save() {
    setSaving(true)
    setSaved(false)
    setError('')
    try {
      const response = await fetch('/api/hero-layout', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(layout),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.error || 'HERO layout save failed')
      setLayout(normalizeHeroLayout(payload))
      setSaved(true)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const positionStyle = (x: number, y: number) => ({
    left: `${(x / HERO_W) * 100}%`,
    top: `${(y / HERO_H) * 100}%`,
  })

  return (
    <section style={{ margin: '28px 0 36px', padding: 20, border: '1px solid #d8dde5', borderRadius: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', marginBottom: 14 }}>
        <div>
          <h3 style={{ margin: 0 }}>HERO LAYOUT EDITOR</h3>
          <p style={{ margin: '6px 0 0', color: '#667085' }}>미리보기의 타이틀·카드·심볼을 직접 드래그하세요. 크기는 아래 슬라이더/숫자로 조정합니다.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="admin-button" onClick={() => { setLayout(DEFAULT_HERO_LAYOUT); setSaved(false) }}>기본값</button>
          <button type="button" className="admin-button" onClick={save} disabled={saving}>{saving ? '저장 중…' : 'HERO 위치 저장'}</button>
        </div>
      </div>

      <div
        ref={previewRef}
        onPointerMove={moveDrag}
        onPointerUp={stopDrag}
        onPointerCancel={stopDrag}
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: `${HERO_W} / ${HERO_H}`,
          overflow: 'hidden',
          borderRadius: 16,
          background: '#08111f',
          touchAction: 'none',
          containerType: 'inline-size',
          userSelect: 'none',
        }}
      >
        <img src={heroImage} alt="HERO layout preview" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(2,12,24,.9) 0%, rgba(2,12,24,.58) 35%, rgba(2,12,24,.08) 72%)' }} />

        <div
          onPointerDown={(event) => startDrag(event, 'symbolX', 'symbolY')}
          title="드래그: KSOP 심볼"
          style={{
            position: 'absolute',
            ...positionStyle(layout.symbolX, layout.symbolY),
            width: `${(layout.symbolSize / HERO_W) * 100}%`,
            aspectRatio: '1 / 1',
            overflow: 'hidden',
            opacity: layout.symbolOpacity,
            cursor: 'move',
          }}
        >
          <img
            src={darkLogo}
            alt=""
            style={{ display: 'block', height: '100%', width: 'auto', maxWidth: 'none', filter: 'grayscale(1) brightness(2.2)' }}
          />
        </div>

        <div
          onPointerDown={(event) => startDrag(event, 'brandX', 'brandY')}
          title="드래그: KOREA SERIES OF POKER"
          style={{
            position: 'absolute',
            ...positionStyle(layout.brandX, layout.brandY),
            width: `${(layout.brandWidth / HERO_W) * 100}%`,
            color: 'rgba(255,255,255,.92)',
            fontSize: `${layout.brandFontSize / 19.2}cqw`,
            fontWeight: 800,
            lineHeight: .9,
            letterSpacing: '-.055em',
            whiteSpace: 'pre-line',
            cursor: 'move',
            textShadow: '0 10px 28px rgba(0,0,0,.34)',
          }}
        >KOREA SERIES{`\n`}OF POKER</div>

        <div
          onPointerDown={(event) => startDrag(event, 'cardX', 'cardY')}
          title="드래그: 액션 카드"
          style={{
            position: 'absolute',
            ...positionStyle(layout.cardX, layout.cardY),
            width: `${(layout.cardWidth / HERO_W) * 100}%`,
            minHeight: '28%',
            padding: '2.2% 2.4%',
            color: '#fff',
            border: '1px solid rgba(255,255,255,.24)',
            borderRadius: 18,
            background: 'linear-gradient(145deg, rgba(20,35,55,.78), rgba(8,20,37,.62))',
            boxShadow: '0 20px 50px rgba(0,0,0,.28)',
            cursor: 'move',
          }}
        >
          <div style={{ fontSize: '1.05cqw', color: 'rgba(255,255,255,.65)', marginBottom: '1.1cqw' }}>확정된 일정과 결과를 안내합니다.</div>
          <div style={{ padding: '1.05cqw', borderRadius: 12, border: '1px solid rgba(255,255,255,.15)', background: 'rgba(255,255,255,.06)' }}>
            <small style={{ color: '#9ac2ff', fontWeight: 700 }}>NEXT SERIES · 다음 일정</small>
            <div style={{ marginTop: 6, fontSize: '1.25cqw', fontWeight: 800 }}>KSOP NEXT SERIES</div>
          </div>
          <div style={{ display: 'flex', gap: '1cqw', marginTop: '1.2cqw' }}>
            <span style={{ flex: 1, padding: '.8cqw', textAlign: 'center', borderRadius: 999, background: '#1686ff', fontWeight: 700 }}>이벤트 확인</span>
            <span style={{ flex: .8, padding: '.8cqw', textAlign: 'center', borderRadius: 999, border: '1px solid rgba(255,255,255,.28)', fontWeight: 700 }}>일정</span>
          </div>
        </div>

        <div style={{
          position: 'absolute',
          left: '4.8%',
          right: '4.8%',
          bottom: `${(layout.railBottom / HERO_H) * 100}%`,
          height: `${(layout.railHeight / HERO_H) * 100}%`,
          minHeight: 32,
          border: '1px solid rgba(255,255,255,.16)',
          borderRadius: 14,
          background: 'rgba(7,19,35,.62)',
        }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px 22px', marginTop: 18 }}>
        {(Object.keys(ranges) as LayoutKey[]).map((key) => {
          const range = ranges[key]
          return (
            <label key={key} style={{ display: 'grid', gridTemplateColumns: '160px minmax(0,1fr) 88px', gap: 10, alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 650 }}>{fieldLabel(key)}</span>
              <input
                type="range"
                min={range.min}
                max={range.max}
                step={range.step}
                value={layout[key]}
                onChange={(event) => update(key, Number(event.target.value))}
              />
              <input
                type="number"
                min={range.min}
                max={range.max}
                step={range.step}
                value={layout[key]}
                onChange={(event) => update(key, Number(event.target.value))}
                style={{ width: '100%' }}
              />
            </label>
          )
        })}
      </div>

      <p style={{ margin: '14px 0 0', color: saved ? '#087443' : error ? '#b42318' : '#667085', fontWeight: saved || error ? 700 : 400 }}>
        {saved ? '저장 완료. 홈을 새로고침하면 위치가 반영됩니다.' : error || '좌표 기준은 1920×998 HERO입니다. 브라우저 확대/축소와 무관하게 같은 구도를 유지합니다.'}
      </p>
    </section>
  )
}
