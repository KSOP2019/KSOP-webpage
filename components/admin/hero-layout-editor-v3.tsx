'use client'

import { useCallback, useEffect, useRef, useState, type ChangeEvent, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import { HeroCanvas } from '@/components/site/hero-canvas'
import type { HeroLayoutSettings } from '@/lib/hero-layout-admin'
import { DEFAULT_HERO_LAYOUT, normalizeHeroLayout } from '@/lib/hero-layout-admin'

const HERO_W = 1920
const HERO_H = 998

type DragTarget = 'brand' | 'card' | 'symbol' | null
type NumberControl = [keyof HeroLayoutSettings, string, number, number, number]

const panelStyle: CSSProperties = { border: '1px solid #dfe4eb', borderRadius: 14, background: '#fff', padding: 14 }
const labelStyle: CSSProperties = { display: 'grid', gap: 5, marginTop: 9 }
const inputStyle: CSSProperties = { width: '100%', minHeight: 36, padding: '7px 9px', border: '1px solid #d8dee7', borderRadius: 8 }

export function HeroLayoutEditorV3({
  initialLayout,
  heroImage,
  seriesCount,
  seriesLabel,
}: {
  initialLayout: HeroLayoutSettings
  heroImage: string
  seriesCount: number
  seriesLabel: string
}) {
  const [layout, setLayout] = useState(() => normalizeHeroLayout(initialLayout))
  const [dragTarget, setDragTarget] = useState<DragTarget>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [previewScale, setPreviewScale] = useState(0.4)
  const [uploading, setUploading] = useState<'symbol' | 'card' | null>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const stageHostRef = useRef<HTMLDivElement>(null)
  const dragOffsetRef = useRef({ x: 0, y: 0 })

  const fitPreview = useCallback(() => {
    const host = stageHostRef.current
    if (!host) return
    const availableWidth = Math.max(360, host.clientWidth - 24)
    const availableHeight = Math.max(260, window.innerHeight - 235)
    const next = Math.min(0.6, Math.max(0.2, Math.min(availableWidth / HERO_W, availableHeight / HERO_H)))
    setPreviewScale(Number(next.toFixed(3)))
  }, [])

  useEffect(() => {
    fitPreview()
    window.addEventListener('resize', fitPreview)
    return () => window.removeEventListener('resize', fitPreview)
  }, [fitPreview])

  function setField<K extends keyof HeroLayoutSettings>(key: K, value: HeroLayoutSettings[K]) {
    setLayout((current) => normalizeHeroLayout({ ...current, [key]: value }))
    setMessage('')
  }

  function setNumber(key: keyof HeroLayoutSettings, value: number) {
    setLayout((current) => normalizeHeroLayout({ ...current, [key]: value }))
    setMessage('')
  }

  function targetPosition(target: Exclude<DragTarget, null>) {
    if (target === 'brand') return { x: layout.brandX, y: layout.brandY }
    if (target === 'card') return { x: layout.cardX, y: layout.cardY }
    return { x: layout.symbolX, y: layout.symbolY }
  }

  function pointerPosition(event: ReactPointerEvent<HTMLElement>) {
    const rect = previewRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    return {
      x: ((event.clientX - rect.left) / rect.width) * HERO_W,
      y: ((event.clientY - rect.top) / rect.height) * HERO_H,
    }
  }

  function beginDrag(event: ReactPointerEvent<HTMLElement>, target: Exclude<DragTarget, null>) {
    event.preventDefault()
    const pointer = pointerPosition(event)
    const current = targetPosition(target)
    dragOffsetRef.current = { x: pointer.x - current.x, y: pointer.y - current.y }
    event.currentTarget.setPointerCapture(event.pointerId)
    setDragTarget(target)
  }

  function onMove(event: ReactPointerEvent<HTMLElement>) {
    if (!dragTarget) return
    const pointer = pointerPosition(event)
    const x = Math.round(pointer.x - dragOffsetRef.current.x)
    const y = Math.round(pointer.y - dragOffsetRef.current.y)
    if (dragTarget === 'brand') setLayout((v) => normalizeHeroLayout({ ...v, brandX: x, brandY: y }))
    if (dragTarget === 'card') setLayout((v) => normalizeHeroLayout({ ...v, cardX: x, cardY: y }))
    if (dragTarget === 'symbol') setLayout((v) => normalizeHeroLayout({ ...v, symbolX: x, symbolY: y }))
  }

  function endDrag() {
    setDragTarget(null)
  }

  async function uploadImage(event: ChangeEvent<HTMLInputElement>, target: 'symbol' | 'card') {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setUploading(target)
    setMessage('')
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('folder', 'home')
      const response = await fetch('/api/admin/upload', { method: 'POST', body: form })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok || !payload.url) throw new Error(payload.error || '업로드 실패')
      if (target === 'symbol') setLayout((v) => normalizeHeroLayout({ ...v, symbolEnabled: true, symbolImageUrl: payload.url }))
      else setLayout((v) => normalizeHeroLayout({ ...v, cardImageUrl: payload.url }))
      setMessage('이미지 업로드 완료. HERO 위치 저장을 눌러 확정하세요.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '업로드 실패')
    } finally {
      setUploading(null)
    }
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
      setMessage('저장 완료. Preview 홈은 이 화면과 동일한 HeroCanvas를 사용합니다. Preview를 새로고침하세요.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '저장 실패')
    } finally {
      setSaving(false)
    }
  }

  const titleControls: NumberControl[] = [
    ['brandX', 'X 위치', 0, 1700, 1], ['brandY', 'Y 위치', 0, 900, 1], ['brandWidth', '타이틀 폭', 180, 1800, 1], ['brandFontSize', '글자 크기', 28, 300, 1],
  ]
  const cardControls: NumberControl[] = [
    ['cardX', 'X 위치', 0, 1550, 1], ['cardY', 'Y 위치', 0, 820, 1], ['cardWidth', '카드 폭', 320, 1000, 1],
  ]
  const symbolControls: NumberControl[] = [
    ['symbolX', 'X 위치', 0, 1700, 1], ['symbolY', 'Y 위치', 0, 820, 1], ['symbolSize', '크기', 80, 900, 1], ['symbolOpacity', '투명도', 0.01, 0.5, 0.01],
  ]
  const railControls: NumberControl[] = [
    ['railBottom', '아래 여백', 0, 220, 1], ['railHeight', '높이', 54, 180, 1],
  ]

  function renderNumberControls(items: NumberControl[]) {
    return items.map(([key, label, min, max, step]) => (
      <label key={key} style={labelStyle}>
        <span style={{ fontSize: 12, fontWeight: 700 }}>{label}: {String(layout[key])}</span>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 78px', gap: 8, alignItems: 'center' }}>
          <input type="range" min={min} max={max} step={step} value={Number(layout[key])} onChange={(e) => setNumber(key, Number(e.target.value))} />
          <input style={{ ...inputStyle, minHeight: 32, padding: '4px 6px' }} type="number" min={min} max={max} step={step} value={Number(layout[key])} onChange={(e) => setNumber(key, Number(e.target.value))} />
        </div>
      </label>
    ))
  }

  const titleHandleHeight = Math.max(72, Math.min(460, layout.brandFontSize * 2.05))

  return (
    <div style={{ display: 'grid', gap: 10, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', minHeight: 40 }}>
        <button type="button" className="admin-button secondary" onClick={fitPreview}>화면 맞춤</button>
        <strong style={{ fontSize: 13 }}>실제 홈과 동일한 HeroCanvas · 1920×998</strong>
        <input aria-label="HERO 미리보기 축소" type="range" min={0.2} max={0.6} step={0.01} value={previewScale} onChange={(e) => setPreviewScale(Number(e.target.value))} style={{ width: 180 }} />
        <span style={{ minWidth: 42, fontSize: 12, fontWeight: 700 }}>{Math.round(previewScale * 100)}%</span>
        <span style={{ color: '#687386', fontSize: 12 }}>관리자와 Preview 홈이 같은 컴포넌트를 직접 렌더링합니다.</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 370px', gap: 14, height: 'calc(100vh - 205px)', minHeight: 560, maxHeight: 860, alignItems: 'stretch', minWidth: 0 }}>
        <div ref={stageHostRef} style={{ minWidth: 0, minHeight: 0, overflow: 'auto', border: '1px solid #dfe4eb', borderRadius: 16, background: '#eef2f6', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: 10 }}>
          <div style={{ width: HERO_W * previewScale, height: HERO_H * previewScale, position: 'relative', flex: '0 0 auto' }}>
            <div ref={previewRef} style={{ position: 'absolute', left: 0, top: 0, width: HERO_W, height: HERO_H, transform: `scale(${previewScale})`, transformOrigin: 'top left', touchAction: 'none' }}>
              <HeroCanvas layout={layout} heroImage={heroImage} seriesCount={seriesCount} seriesLabel={seriesLabel} interactive={false}>
                <div onPointerDown={(e) => beginDrag(e, 'brand')} onPointerMove={onMove} onPointerUp={endDrag} onPointerCancel={endDrag} title="대형 타이틀 드래그" style={{ position: 'absolute', left: layout.brandX, top: layout.brandY, width: layout.brandWidth, height: titleHandleHeight, boxSizing: 'border-box', cursor: 'move', border: '2px dashed rgba(72,164,255,.82)', background: 'rgba(72,164,255,.018)', zIndex: 20 }} />
                <div onPointerDown={(e) => beginDrag(e, 'card')} onPointerMove={onMove} onPointerUp={endDrag} onPointerCancel={endDrag} title="액션 카드 드래그" style={{ position: 'absolute', left: layout.cardX, top: layout.cardY, width: layout.cardWidth, height: 316, boxSizing: 'border-box', cursor: 'move', border: '2px dashed rgba(255,193,79,.82)', background: 'rgba(255,193,79,.012)', zIndex: 21 }} />
                {layout.symbolEnabled && layout.symbolImageUrl ? <div onPointerDown={(e) => beginDrag(e, 'symbol')} onPointerMove={onMove} onPointerUp={endDrag} onPointerCancel={endDrag} title="KSOP 심볼 드래그" style={{ position: 'absolute', left: layout.symbolX, top: layout.symbolY, width: layout.symbolSize, height: layout.symbolSize, boxSizing: 'border-box', cursor: 'move', border: '2px dashed rgba(110,222,170,.82)', background: 'rgba(110,222,170,.01)', zIndex: 19 }} /> : null}
              </HeroCanvas>
            </div>
          </div>
        </div>

        <aside style={{ minHeight: 0, overflowY: 'auto', display: 'grid', alignContent: 'start', gap: 10, paddingRight: 3 }}>
          <div style={panelStyle}><h3 style={{ margin: '0 0 4px', fontSize: 16 }}>대형 타이틀</h3>{renderNumberControls(titleControls)}</div>
          <div style={panelStyle}>
            <h3 style={{ margin: '0 0 4px', fontSize: 16 }}>액션 카드</h3>{renderNumberControls(cardControls)}
            <label style={labelStyle}><span style={{ fontSize: 12, fontWeight: 700 }}>설명 문구</span><input style={inputStyle} value={layout.cardIntro} onChange={(e) => setField('cardIntro', e.target.value)} /></label>
            <label style={labelStyle}><span style={{ fontSize: 12, fontWeight: 700 }}>상단 문구</span><input style={inputStyle} value={layout.cardKicker} onChange={(e) => setField('cardKicker', e.target.value)} /></label>
            <label style={labelStyle}><span style={{ fontSize: 12, fontWeight: 700 }}>대표 제목</span><input style={inputStyle} value={layout.cardTitleText} onChange={(e) => setField('cardTitleText', e.target.value)} placeholder="비우면 실제 다음 시리즈명" /></label>
            <label style={labelStyle}><span style={{ fontSize: 12, fontWeight: 700 }}>메인 버튼 문구</span><input style={inputStyle} value={layout.cardPrimaryText} onChange={(e) => setField('cardPrimaryText', e.target.value)} /></label>
            <label style={labelStyle}><span style={{ fontSize: 12, fontWeight: 700 }}>보조 버튼 문구</span><input style={inputStyle} value={layout.cardSecondaryText} onChange={(e) => setField('cardSecondaryText', e.target.value)} /></label>
            <div style={{ marginTop: 11, display: 'flex', gap: 7, flexWrap: 'wrap' }}><label className="admin-button secondary" style={{ cursor: 'pointer' }}>{uploading === 'card' ? '업로드 중…' : '카드 배경 넣기'}<input type="file" accept="image/*" hidden onChange={(e) => uploadImage(e, 'card')} /></label><button type="button" className="admin-button secondary" onClick={() => setField('cardImageUrl', '')}>카드 배경 제거</button></div>
          </div>
          <div style={panelStyle}>
            <h3 style={{ margin: '0 0 4px', fontSize: 16 }}>KSOP 심볼</h3>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}><input type="checkbox" checked={layout.symbolEnabled} onChange={(e) => setField('symbolEnabled', e.target.checked)} /><span style={{ fontSize: 12, fontWeight: 700 }}>심볼 표시</span></label>
            {renderNumberControls(symbolControls)}
            <div style={{ marginTop: 11, display: 'flex', gap: 7, flexWrap: 'wrap' }}><label className="admin-button secondary" style={{ cursor: 'pointer' }}>{uploading === 'symbol' ? '업로드 중…' : '심볼 파일 넣기'}<input type="file" accept="image/*" hidden onChange={(e) => uploadImage(e, 'symbol')} /></label><button type="button" className="admin-button secondary" onClick={() => setLayout((v) => normalizeHeroLayout({ ...v, symbolEnabled: true, symbolImageUrl: '/images/ksop-symbol-dark.svg' }))}>기본 심볼</button></div>
          </div>
          <div style={panelStyle}><h3 style={{ margin: '0 0 4px', fontSize: 16 }}>하단 정보 띠</h3>{renderNumberControls(railControls)}</div>
          <div style={{ ...panelStyle, position: 'sticky', bottom: 0, boxShadow: '0 -8px 28px rgba(16,24,40,.08)' }}><div style={{ display: 'flex', gap: 8 }}><button type="button" className="admin-button" onClick={save} disabled={saving}>{saving ? '저장 중…' : 'HERO 위치 저장'}</button><button type="button" className="admin-button secondary" onClick={() => { setLayout(DEFAULT_HERO_LAYOUT); setMessage('기본값을 불러왔습니다. 저장 전까지 홈에는 적용되지 않습니다.') }}>기본값</button></div>{message ? <p style={{ margin: '10px 0 0', fontSize: 12, fontWeight: 700, color: message.includes('완료') ? '#087443' : '#667085' }}>{message}</p> : null}</div>
        </aside>
      </div>
    </div>
  )
}
