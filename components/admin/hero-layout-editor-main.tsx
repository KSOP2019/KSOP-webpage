'use client'

import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import type { HeroLayoutSettings } from '@/lib/hero-layout-admin'
import { DEFAULT_HERO_LAYOUT, normalizeHeroLayout } from '@/lib/hero-layout-admin'

const HERO_W = 1920
const HERO_H = 998

type DragTarget = 'brand' | 'card' | 'symbol' | null

export function HeroLayoutEditorMain({
  initialLayout,
  heroImage,
  darkLogo,
}: {
  initialLayout: HeroLayoutSettings
  heroImage: string
  darkLogo: string
}) {
  const [layout, setLayout] = useState(() => normalizeHeroLayout(initialLayout))
  const [dragTarget, setDragTarget] = useState<DragTarget>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const previewRef = useRef<HTMLDivElement>(null)

  function setValue<K extends keyof HeroLayoutSettings>(key: K, value: number) {
    setLayout((current) => normalizeHeroLayout({ ...current, [key]: value }))
    setMessage('')
  }

  function beginDrag(event: ReactPointerEvent<HTMLElement>, target: Exclude<DragTarget, null>) {
    event.currentTarget.setPointerCapture(event.pointerId)
    setDragTarget(target)
  }

  function onMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragTarget || !previewRef.current) return
    const rect = previewRef.current.getBoundingClientRect()
    const x = Math.round(((event.clientX - rect.left) / rect.width) * HERO_W)
    const y = Math.round(((event.clientY - rect.top) / rect.height) * HERO_H)

    if (dragTarget === 'brand') setLayout((v) => normalizeHeroLayout({ ...v, brandX: x, brandY: y }))
    if (dragTarget === 'card') setLayout((v) => normalizeHeroLayout({ ...v, cardX: x, cardY: y }))
    if (dragTarget === 'symbol') setLayout((v) => normalizeHeroLayout({ ...v, symbolX: x, symbolY: y }))
  }

  async function save() {
    setSaving(true)
    setMessage('')
    try {
      const response = await fetch('/api/hero-layout', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(layout),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.error || 'Save failed')
      setLayout(normalizeHeroLayout(payload))
      setMessage('저장 완료. Preview 홈을 새로고침하면 반영됩니다.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '저장 실패')
    } finally {
      setSaving(false)
    }
  }

  const controls: Array<[keyof HeroLayoutSettings, string, number, number, number]> = [
    ['brandX', '대형 타이틀 X', 0, 1400, 1],
    ['brandY', '대형 타이틀 Y', 0, 700, 1],
    ['brandWidth', '대형 타이틀 폭', 320, 1200, 1],
    ['brandFontSize', '대형 타이틀 글자 크기', 28, 140, 1],
    ['cardX', '액션 카드 X', 0, 1300, 1],
    ['cardY', '액션 카드 Y', 0, 680, 1],
    ['cardWidth', '액션 카드 폭', 360, 900, 1],
    ['symbolX', 'KSOP 심볼 X', 0, 1400, 1],
    ['symbolY', 'KSOP 심볼 Y', 0, 650, 1],
    ['symbolSize', 'KSOP 심볼 크기', 120, 700, 1],
    ['symbolOpacity', 'KSOP 심볼 투명도', 0.01, 0.35, 0.01],
    ['railBottom', '하단 정보 띠 아래 여백', 16, 180, 1],
    ['railHeight', '하단 정보 띠 높이', 64, 150, 1],
  ]

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      <div
        ref={previewRef}
        onPointerMove={onMove}
        onPointerUp={() => setDragTarget(null)}
        onPointerCancel={() => setDragTarget(null)}
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: `${HERO_W} / ${HERO_H}`,
          overflow: 'hidden',
          borderRadius: 18,
          background: '#07111f',
          border: '1px solid #d8dde5',
          touchAction: 'none',
        }}
      >
        <img src={heroImage} alt="HERO preview" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(3,10,20,.78) 0%, rgba(3,10,20,.35) 45%, rgba(3,10,20,.05) 75%)' }} />

        <div
          onPointerDown={(event) => beginDrag(event, 'symbol')}
          style={{
            position: 'absolute',
            left: `${(layout.symbolX / HERO_W) * 100}%`,
            top: `${(layout.symbolY / HERO_H) * 100}%`,
            width: `${(layout.symbolSize / HERO_W) * 100}%`,
            aspectRatio: '1 / 1',
            overflow: 'hidden',
            opacity: layout.symbolOpacity,
            cursor: 'move',
          }}
          title="KSOP 심볼 드래그"
        >
          <img
            src={darkLogo}
            alt="KSOP symbol"
            style={{ height: '100%', width: 'auto', maxWidth: 'none', filter: 'grayscale(1) brightness(1.25)' }}
          />
        </div>

        <div
          onPointerDown={(event) => beginDrag(event, 'brand')}
          style={{
            position: 'absolute',
            left: `${(layout.brandX / HERO_W) * 100}%`,
            top: `${(layout.brandY / HERO_H) * 100}%`,
            width: `${(layout.brandWidth / HERO_W) * 100}%`,
            color: 'white',
            fontSize: `${Math.max(18, layout.brandFontSize * 0.42)}px`,
            fontWeight: 800,
            lineHeight: .92,
            letterSpacing: '-.05em',
            cursor: 'move',
            textShadow: '0 8px 28px rgba(0,0,0,.45)',
          }}
          title="대형 타이틀 드래그"
        >
          KOREA SERIES<br />OF POKER
        </div>

        <div
          onPointerDown={(event) => beginDrag(event, 'card')}
          style={{
            position: 'absolute',
            left: `${(layout.cardX / HERO_W) * 100}%`,
            top: `${(layout.cardY / HERO_H) * 100}%`,
            width: `${(layout.cardWidth / HERO_W) * 100}%`,
            minHeight: 120,
            padding: 18,
            border: '1px solid rgba(255,255,255,.22)',
            borderRadius: 18,
            background: 'rgba(8,20,37,.72)',
            color: 'white',
            backdropFilter: 'blur(14px)',
            cursor: 'move',
            boxShadow: '0 20px 50px rgba(0,0,0,.28)',
          }}
          title="액션 카드 드래그"
        >
          <div style={{ fontSize: 10, letterSpacing: '.14em', opacity: .75 }}>NEXT SERIES</div>
          <strong style={{ display: 'block', marginTop: 8, fontSize: 18 }}>KSOP SERIES</strong>
          <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
            <span style={{ padding: '10px 16px', borderRadius: 999, background: '#1687ff', fontWeight: 700 }}>이벤트 확인</span>
            <span style={{ padding: '10px 16px', borderRadius: 999, border: '1px solid rgba(255,255,255,.35)', fontWeight: 700 }}>일정</span>
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            left: '3%',
            right: '3%',
            bottom: `${(layout.railBottom / HERO_H) * 100}%`,
            height: `${(layout.railHeight / HERO_H) * 100}%`,
            minHeight: 34,
            borderRadius: 14,
            border: '1px solid rgba(255,255,255,.18)',
            background: 'rgba(6,18,34,.60)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            padding: '0 18px',
            fontSize: 11,
            letterSpacing: '.08em',
          }}
        >
          UPCOMING SERIES · NEXT SERIES · DATE · LOCATION
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 }}>
        {controls.map(([key, label, min, max, step]) => (
          <label key={key} style={{ display: 'grid', gap: 6 }}>
            <span style={{ fontWeight: 700 }}>{label}: {layout[key]}</span>
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={layout[key]}
              onChange={(event) => setValue(key, Number(event.target.value))}
            />
            <input
              type="number"
              min={min}
              max={max}
              step={step}
              value={layout[key]}
              onChange={(event) => setValue(key, Number(event.target.value))}
            />
          </label>
        ))}
      </div>

      <div className="admin-actions">
        <button type="button" className="admin-button" onClick={save} disabled={saving}>
          {saving ? '저장 중…' : 'HERO 위치 저장'}
        </button>
        <button type="button" className="admin-button secondary" onClick={() => { setLayout(DEFAULT_HERO_LAYOUT); setMessage('기본값으로 복원했습니다. 저장 버튼을 눌러 확정하세요.') }}>
          기본값
        </button>
        {message ? <span>{message}</span> : null}
      </div>
    </div>
  )
}
