'use client'

import { useCallback, useEffect, useRef, useState, type ChangeEvent, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import type { HeroLayoutSettings } from '@/lib/hero-layout-admin'
import { DEFAULT_HERO_LAYOUT, normalizeHeroLayout } from '@/lib/hero-layout-admin'

const HERO_W = 1920
const HERO_H = 998
const PREVIEW_ORIGIN = 'https://ksophomepage-git-preview-premium-glass-cms-20260915-ksop.vercel.app'
const HERO_STAGE_URL = `${PREVIEW_ORIGIN}/hero-stage`

type DragTarget = 'brand' | 'card' | 'symbol' | null
type NumberControl = [keyof HeroLayoutSettings, string, number, number, number]

const panelStyle: CSSProperties = {
  border: '1px solid #dfe4eb',
  borderRadius: 14,
  background: '#fff',
  padding: 14,
}

const labelStyle: CSSProperties = { display: 'grid', gap: 5, marginTop: 9 }
const inputStyle: CSSProperties = { width: '100%', minHeight: 36, padding: '7px 9px', border: '1px solid #d8dee7', borderRadius: 8 }

export function HeroLayoutEditorV2({
  initialLayout,
  heroImage,
}: {
  initialLayout: HeroLayoutSettings
  heroImage: string
}) {
  void heroImage

  const [layout, setLayout] = useState(() => normalizeHeroLayout(initialLayout))
  const [dragTarget, setDragTarget] = useState<DragTarget>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [previewScale, setPreviewScale] = useState(0.4)
  const [uploading, setUploading] = useState<'symbol' | 'card' | null>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const stageHostRef = useRef<HTMLDivElement>(null)
  const stageFrameRef = useRef<HTMLIFrameElement>(null)
  const dragOffsetRef = useRef({ x: 0, y: 0 })

  const fitPreview = useCallback(() => {
    const host = stageHostRef.current
    if (!host) return
    const availableWidth = Math.max(360, host.clientWidth - 24)
    const availableHeight = Math.max(260, window.innerHeight - 235)
    const next = Math.min(0.6, Math.max(0.2, Math.min(availableWidth / HERO_W, availableHeight / HERO_H)))
    setPreviewScale(Number(next.toFixed(3)))
  }, [])

  const postLayoutToStage = useCallback((next: HeroLayoutSettings) => {
    stageFrameRef.current?.contentWindow?.postMessage(
      { type: 'KSOP_HERO_EDITOR_LAYOUT', layout: normalizeHeroLayout(next) },
      PREVIEW_ORIGIN,
    )
  }, [])

  useEffect(() => {
    fitPreview()
    window.addEventListener('resize', fitPreview)
    return () => window.removeEventListener('resize', fitPreview)
  }, [fitPreview])

  useEffect(() => {
    postLayoutToStage(layout)
  }, [layout, postLayoutToStage])

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
    if (!dragTarget || !previewRef.current) return
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
      if (target === 'symbol') {
        setLayout((v) => normalizeHeroLayout({ ...v, symbolEnabled: true, symbolImageUrl: payload.url }))
      } else {
        setLayout((v) => normalizeHeroLayout({ ...v, cardImageUrl: payload.url }))
      }
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
      const saved = normalizeHeroLayout(payload)
      setLayout(saved)
      postLayoutToStage(saved)
      setMessage('저장 완료. 이 미리보기와 Preview 홈페이지는 동일한 HERO를 사용합니다.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '저장 실패')
    } finally {
      setSaving(false)
    }
  }

  const titleControls: NumberControl[] = [
    ['brandX', 'X 위치', 0, 1700, 1],
    ['brandY', 'Y 위치', 0, 900, 1],
    ['brandWidth', '타이틀 폭', 180, 1800, 1],
    ['brandFontSize', '글자 크기', 28, 300, 1],
  ]
  const cardControls: NumberControl[] = [
    ['cardX', 'X 위치', 0, 1550, 1],
    ['cardY', 'Y 위치', 0, 820, 1],
    ['cardWidth', '카드 폭', 320, 1000, 1],
  ]
  const symbolControls: NumberControl[] = [
    ['symbolX', 'X 위치', 0, 1700, 1],
    ['symbolY', 'Y 위치', 0, 820, 1],
    ['symbolSize', '크기', 80, 900, 1],
    ['symbolOpacity', '투명도', 0.01, 0.5, 0.01],
  ]
  const railControls: NumberControl[] = [
    ['railBottom', '아래 여백', 0, 220, 1],
    ['railHeight', '높이', 54, 180, 1],
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

  const titleHandleHeight = Math.max(72, Math.min(420, layout.brandFontSize * 2.05))

  return (
    <div style={{ display: 'grid', gap: 10, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', minHeight: 40 }}>
        <button type="button" className="admin-button secondary" onClick={fitPreview}>화면 맞춤</button>
        <strong style={{ fontSize: 13 }}>실제 Preview HERO · 1:1 좌표</strong>
        <input
          aria-label="HERO 미리보기 축소"
          type="range"
          min={0.2}
          max={0.6}
          step={0.01}
          value={previewScale}
          onChange={(event) => setPreviewScale(Number(event.target.value))}
          style={{ width: 180 }}
        />
        <span style={{ minWidth: 42, fontSize: 12, fontWeight: 700 }}>{Math.round(previewScale * 100)}%</span>
        <span style={{ color: '#687386', fontSize: 12 }}>가짜 재현 화면이 아니라 실제 Preview HERO 위에서 조정합니다. 점선은 드래그 가이드입니다.</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 370px', gap: 14, height: 'calc(100vh - 205px)', minHeight: 560, maxHeight: 860, alignItems: 'stretch', minWidth: 0 }}>
        <div ref={stageHostRef} style={{ minWidth: 0, minHeight: 0, overflow: 'auto', border: '1px solid #dfe4eb', borderRadius: 16, background: '#eef2f6', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: 10 }}>
          <div style={{ width: HERO_W * previewScale, height: HERO_H * previewScale, position: 'relative', flex: '0 0 auto' }}>
            <div
              ref={previewRef}
              style={{ position: 'absolute', left: 0, top: 0, width: HERO_W, height: HERO_H, overflow: 'hidden', borderRadius: 24, background: '#07111f', border: '2px solid #cfd6df', touchAction: 'none', transform: `scale(${previewScale})`, transformOrigin: 'top left' }}
            >
              <iframe
                ref={stageFrameRef}
                src={HERO_STAGE_URL}
                title="실제 KSOP Preview HERO"
                onLoad={() => postLayoutToStage(layout)}
                style={{ position: 'absolute', inset: 0, width: HERO_W, height: HERO_H, border: 0, pointerEvents: 'none', background: '#07111f' }}
              />

              <div
                onPointerDown={(event) => beginDrag(event, 'brand')}
                onPointerMove={onMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                title="대형 타이틀 드래그"
                style={{ position: 'absolute', left: layout.brandX, top: layout.brandY, width: layout.brandWidth, height: titleHandleHeight, boxSizing: 'border-box', cursor: 'move', border: '2px dashed rgba(72,164,255,.82)', background: 'rgba(72,164,255,.025)', zIndex: 20 }}
              />

              <div
                onPointerDown={(event) => beginDrag(event, 'card')}
                onPointerMove={onMove}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
                title="액션 카드 드래그"
                style={{ position: 'absolute', left: layout.cardX, top: layout.cardY, width: layout.cardWidth, height: 316, boxSizing: 'border-box', cursor: 'move', border: '2px dashed rgba(255,193,79,.82)', background: 'rgba(255,193,79,.018)', zIndex: 21 }}
              />

              {layout.symbolEnabled && layout.symbolImageUrl ? (
                <div
                  onPointerDown={(event) => beginDrag(event, 'symbol')}
                  onPointerMove={onMove}
                  onPointerUp={endDrag}
                  onPointerCancel={endDrag}
                  title="KSOP 심볼 드래그"
                  style={{ position: 'absolute', left: layout.symbolX, top: layout.symbolY, width: layout.symbolSize, height: layout.symbolSize, boxSizing: 'border-box', cursor: 'move', border: '2px dashed rgba(110,222,170,.82)', background: 'rgba(110,222,170,.015)', zIndex: 19 }}
                />
              ) : null}
            </div>
          </div>
        </div>

        <aside style={{ minHeight: 0, overflowY: 'auto', display: 'grid', alignContent: 'start', gap: 10, paddingRight: 3 }}>
          <div style={panelStyle}>
            <h3 style={{ margin: '0 0 4px', fontSize: 16 }}>대형 타이틀</h3>
            {renderNumberControls(titleControls)}
            <small style={{ display: 'block', marginTop: 8, color: '#687386' }}>파란 점선은 실제 HERO 좌표입니다. 글자 렌더링과 줄바꿈은 iframe 안의 실제 홈페이지 CSS가 담당합니다.</small>
          </div>

          <div style={panelStyle}>
            <h3 style={{ margin: '0 0 4px', fontSize: 16 }}>액션 카드</h3>
            {renderNumberControls(cardControls)}
            <label style={labelStyle}><span style={{ fontSize: 12, fontWeight: 700 }}>설명 문구</span><input style={inputStyle} value={layout.cardIntro} onChange={(e) => setField('cardIntro', e.target.value)} /></label>
            <label style={labelStyle}><span style={{ fontSize: 12, fontWeight: 700 }}>상단 문구</span><input style={inputStyle} value={layout.cardKicker} onChange={(e) => setField('cardKicker', e.target.value)} /></label>
            <label style={labelStyle}><span style={{ fontSize: 12, fontWeight: 700 }}>대표 제목 <small style={{ fontWeight: 400 }}>(비우면 실제 다음 시리즈명)</small></span><input style={inputStyle} value={layout.cardTitleText} onChange={(e) => setField('cardTitleText', e.target.value)} placeholder="예: KSOP CROWN SERIES" /></label>
            <label style={labelStyle}><span style={{ fontSize: 12, fontWeight: 700 }}>메인 버튼 문구</span><input style={inputStyle} value={layout.cardPrimaryText} onChange={(e) => setField('cardPrimaryText', e.target.value)} /></label>
            <label style={labelStyle}><span style={{ fontSize: 12, fontWeight: 700 }}>보조 버튼 문구</span><input style={inputStyle} value={layout.cardSecondaryText} onChange={(e) => setField('cardSecondaryText', e.target.value)} /></label>
            <div style={{ marginTop: 11, display: 'flex', gap: 7, flexWrap: 'wrap' }}>
              <label className="admin-button secondary" style={{ cursor: 'pointer' }}>
                {uploading === 'card' ? '업로드 중…' : '카드 이미지 넣기'}
                <input type="file" accept="image/png,image/jpeg,image/webp,image/avif,image/gif" hidden onChange={(e) => uploadImage(e, 'card')} disabled={uploading !== null} />
              </label>
              <button type="button" className="admin-button secondary" onClick={() => setField('cardImageUrl', '')}>이미지 제거</button>
            </div>
            <small style={{ display: 'block', marginTop: 7, color: '#687386', wordBreak: 'break-all' }}>{layout.cardImageUrl || '등록된 카드 이미지 없음'}</small>
          </div>

          <div style={panelStyle}>
            <h3 style={{ margin: '0 0 8px', fontSize: 16 }}>KSOP 심볼</h3>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700 }}><input type="checkbox" checked={layout.symbolEnabled} onChange={(e) => setField('symbolEnabled', e.target.checked)} />심볼 표시</label>
            {renderNumberControls(symbolControls)}
            <div style={{ marginTop: 11, display: 'flex', gap: 7, flexWrap: 'wrap' }}>
              <label className="admin-button secondary" style={{ cursor: 'pointer' }}>
                {uploading === 'symbol' ? '업로드 중…' : '심볼 파일 넣기'}
                <input type="file" accept="image/png,image/jpeg,image/webp,image/avif,image/gif" hidden onChange={(e) => uploadImage(e, 'symbol')} disabled={uploading !== null} />
              </label>
              <button type="button" className="admin-button secondary" onClick={() => setLayout((v) => normalizeHeroLayout({ ...v, symbolEnabled: true, symbolImageUrl: '/images/ksop-symbol-dark.svg' }))}>기본 심볼(다크)</button>
              <button type="button" className="admin-button secondary" onClick={() => setLayout((v) => normalizeHeroLayout({ ...v, symbolEnabled: false, symbolImageUrl: '' }))}>심볼 제거</button>
            </div>
            <small style={{ display: 'block', marginTop: 7, color: '#687386', wordBreak: 'break-all' }}>{layout.symbolImageUrl || '등록된 심볼 파일 없음'}</small>
          </div>

          <div style={panelStyle}>
            <h3 style={{ margin: '0 0 4px', fontSize: 16 }}>하단 정보 띠</h3>
            {renderNumberControls(railControls)}
          </div>

          <div style={{ position: 'sticky', bottom: 0, zIndex: 10, display: 'flex', gap: 8, flexWrap: 'wrap', padding: '10px 0 2px', background: 'linear-gradient(180deg, rgba(246,248,251,0), #f6f8fb 24%)' }}>
            <button type="button" className="admin-button" onClick={save} disabled={saving}>{saving ? '저장 중…' : 'HERO 위치 저장'}</button>
            <button type="button" className="admin-button secondary" onClick={() => { setLayout(DEFAULT_HERO_LAYOUT); setMessage('기본값을 불러왔습니다. 저장해야 확정됩니다.') }}>기본값</button>
          </div>
          {message ? <p style={{ margin: 0, padding: 9, borderRadius: 8, background: '#eef4ff', fontSize: 12, fontWeight: 700 }}>{message}</p> : null}
        </aside>
      </div>
    </div>
  )
}
