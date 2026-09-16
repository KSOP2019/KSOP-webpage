'use client'

import { useCallback, useEffect, useRef, useState, type ChangeEvent, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react'
import type { HeroLayoutSettings } from '@/lib/hero-layout-admin'
import { DEFAULT_HERO_LAYOUT, normalizeHeroLayout } from '@/lib/hero-layout-admin'

const HERO_W = 1920
const HERO_H = 998

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
  const [layout, setLayout] = useState(() => normalizeHeroLayout(initialLayout))
  const [dragTarget, setDragTarget] = useState<DragTarget>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [previewScale, setPreviewScale] = useState(0.4)
  const [uploading, setUploading] = useState<'symbol' | 'card' | null>(null)
  const [heroSrc, setHeroSrc] = useState(heroImage || '/images/ksop-hero-arena.png')
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
      setLayout(normalizeHeroLayout(payload))
      setMessage('저장 완료. Preview 홈페이지를 새로고침하면 같은 좌표가 적용됩니다.')
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

  const titleHandleHeight = Math.max(72, Math.min(460, layout.brandFontSize * 2.05))
  const cardTitle = layout.cardTitleText || '실제 NEXT SERIES 제목'

  return (
    <div style={{ display: 'grid', gap: 10, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', minHeight: 40 }}>
        <button type="button" className="admin-button secondary" onClick={fitPreview}>화면 맞춤</button>
        <strong style={{ fontSize: 13 }}>HERO 1920×998 동일 좌표 미리보기</strong>
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
        <span style={{ color: '#687386', fontSize: 12 }}>외부 Preview iframe 없이 실제 HERO 좌표/크롭/카드 치수를 관리자 안에서 직접 렌더링합니다.</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 370px', gap: 14, height: 'calc(100vh - 205px)', minHeight: 560, maxHeight: 860, alignItems: 'stretch', minWidth: 0 }}>
        <div ref={stageHostRef} style={{ minWidth: 0, minHeight: 0, overflow: 'auto', border: '1px solid #dfe4eb', borderRadius: 16, background: '#eef2f6', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: 10 }}>
          <div style={{ width: HERO_W * previewScale, height: HERO_H * previewScale, position: 'relative', flex: '0 0 auto' }}>
            <div
              ref={previewRef}
              style={{ position: 'absolute', left: 0, top: 0, width: HERO_W, height: HERO_H, overflow: 'hidden', background: '#07111f', touchAction: 'none', transform: `scale(${previewScale})`, transformOrigin: 'top left' }}
            >
              <div style={{ position: 'absolute', left: 40, right: 40, top: 22, bottom: 20, overflow: 'hidden', borderRadius: 30, background: '#06111f', boxShadow: '0 28px 76px rgba(5,17,35,.24), 0 7px 22px rgba(5,17,35,.12)' }}>
                <img
                  src={heroSrc}
                  alt="KSOP HERO"
                  onError={() => setHeroSrc('/images/ksop-hero-arena.png')}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center center', display: 'block', filter: 'saturate(.96) contrast(1.03)' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(3,14,29,.91) 0%, rgba(3,14,29,.76) 20%, rgba(3,14,29,.44) 36%, rgba(3,14,29,.12) 55%, rgba(3,14,29,.02) 75%), linear-gradient(0deg, rgba(2,10,21,.24), transparent 44%)' }} />
                <div style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.09), inset 0 1px rgba(255,255,255,.13)' }} />
              </div>

              <div style={{ position: 'absolute', top: 52, right: 54, zIndex: 5, display: 'flex', alignItems: 'center', gap: 12, minHeight: 38, padding: '0 14px', color: 'rgba(255,255,255,.82)', border: '1px solid rgba(255,255,255,.14)', borderRadius: 999, background: 'rgba(5,16,30,.24)', backdropFilter: 'blur(12px)' }}>
                <span style={{ color: '#fff', fontSize: 12, fontWeight: 850, letterSpacing: '.10em' }}>KSOP</span>
                <strong style={{ paddingLeft: 12, borderLeft: '1px solid rgba(255,255,255,.18)', color: 'rgba(255,255,255,.64)', fontSize: 10, fontWeight: 700, letterSpacing: '.14em' }}>OFFICIAL SERIES</strong>
              </div>

              {layout.symbolEnabled && layout.symbolImageUrl ? (
                <img
                  src={layout.symbolImageUrl}
                  alt="KSOP symbol"
                  style={{ position: 'absolute', left: layout.symbolX, top: layout.symbolY, width: layout.symbolSize, height: layout.symbolSize, objectFit: 'contain', objectPosition: 'center', opacity: layout.symbolOpacity, filter: 'grayscale(1) brightness(1.25)', zIndex: 4, pointerEvents: 'none' }}
                />
              ) : null}

              <div style={{ position: 'absolute', left: layout.brandX, top: layout.brandY, width: layout.brandWidth, minWidth: layout.brandWidth, maxWidth: layout.brandWidth, zIndex: 6, boxSizing: 'border-box', color: 'rgba(255,255,255,.90)', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: layout.brandFontSize, fontWeight: 760, lineHeight: .88, letterSpacing: '-.055em', whiteSpace: 'normal', wordBreak: 'keep-all', overflowWrap: 'normal', textShadow: '0 14px 40px rgba(0,0,0,.34)', pointerEvents: 'none' }}>
                KOREA SERIES OF POKER
              </div>

              <div style={{ position: 'absolute', left: layout.cardX, top: layout.cardY, width: layout.cardWidth, minWidth: layout.cardWidth, maxWidth: layout.cardWidth, minHeight: 316, padding: '30px 34px 26px', boxSizing: 'border-box', overflow: 'hidden', color: '#fff', border: '1px solid rgba(255,255,255,.20)', borderRadius: 24, background: 'linear-gradient(145deg, rgba(20,35,55,.76), rgba(8,20,37,.60))', boxShadow: '0 28px 72px rgba(0,0,0,.30), inset 0 1px rgba(255,255,255,.15), inset 0 0 34px rgba(255,255,255,.022)', backdropFilter: 'blur(24px) saturate(120%)', zIndex: 6 }}>
                {layout.cardImageUrl ? <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(90deg, rgba(6,18,34,.92), rgba(6,18,34,.50)), url(${JSON.stringify(layout.cardImageUrl)})`, backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundSize: 'cover', zIndex: 0 }} /> : null}
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <p style={{ width: '100%', maxWidth: 500, margin: 0, color: 'rgba(255,255,255,.68)', fontSize: 15, lineHeight: 1.5 }}>{layout.cardIntro}</p>
                  <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gridTemplateRows: 'auto auto auto', width: '100%', minHeight: 100, marginTop: 16, padding: '14px 17px 13px', boxSizing: 'border-box', overflow: 'hidden', color: '#fff', border: '1px solid rgba(255,255,255,.15)', borderRadius: 17, background: 'linear-gradient(135deg, rgba(255,255,255,.10), rgba(255,255,255,.03))' }}>
                    <span style={{ gridColumn: '1 / 2', color: 'rgba(150,194,255,.94)', fontSize: 10, lineHeight: 1, fontWeight: 750, letterSpacing: '.13em' }}>{layout.cardKicker}</span>
                    <strong style={{ gridColumn: '1 / 2', marginTop: 8, overflow: 'hidden', color: '#fff', fontSize: 19, lineHeight: 1.2, fontWeight: 700, letterSpacing: '-.02em', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cardTitle}</strong>
                    <span style={{ gridColumn: '1 / 2', display: 'flex', alignItems: 'center', gap: 14, marginTop: 8, color: 'rgba(255,255,255,.58)', fontSize: 11, lineHeight: 1, letterSpacing: '.035em' }}><span>DATE</span><span>·</span><span>LOCATION</span></span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', width: '100%', minHeight: 56, marginTop: 16, gap: 10 }}>
                    <span style={{ width: 218, height: 56, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 999, color: '#fff', border: '1px solid rgba(113,178,255,.9)', background: 'linear-gradient(135deg,#4d9cff 0%,#1677ff 55%,#0b63e8 100%)', boxShadow: '0 12px 30px rgba(22,119,255,.36)', fontSize: 15, fontWeight: 700 }}>{layout.cardPrimaryText}</span>
                    <span style={{ width: 188, height: 56, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 999, color: 'rgba(255,255,255,.92)', border: '1px solid rgba(255,255,255,.28)', background: 'rgba(10,23,40,.34)', fontSize: 15, fontWeight: 700 }}>{layout.cardSecondaryText}</span>
                  </div>
                </div>
              </div>

              <div style={{ position: 'absolute', left: 92, right: 92, bottom: layout.railBottom, height: layout.railHeight, minHeight: layout.railHeight, zIndex: 7, display: 'grid', gridTemplateColumns: '.72fr 1.65fr 1fr 1fr', overflow: 'hidden', color: '#fff', border: '1px solid rgba(255,255,255,.14)', borderRadius: 20, background: 'linear-gradient(90deg, rgba(7,19,35,.74), rgba(7,19,35,.46))', boxShadow: '0 18px 48px rgba(0,0,0,.20), inset 0 1px rgba(255,255,255,.08)', backdropFilter: 'blur(18px) saturate(115%)' }}>
                {['UPCOMING SERIES|04', 'NEXT SERIES|KSOP SERIES', 'DATE|일정 추후 공개', 'LOCATION|장소 추후 공개'].map((value, index) => {
                  const [label, text] = value.split('|')
                  return <div key={label} style={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0, padding: '16px 24px', borderLeft: index ? '1px solid rgba(255,255,255,.12)' : 0 }}><span style={{ color: 'rgba(255,255,255,.48)', fontSize: 10, fontWeight: 700, letterSpacing: '.15em' }}>{label}</span><strong style={{ marginTop: 9, overflow: 'hidden', color: 'rgba(255,255,255,.92)', fontSize: index === 0 ? 24 : 14, lineHeight: index === 0 ? .9 : 1.15, fontWeight: index === 0 ? 760 : 650, textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{text}</strong></div>
                })}
              </div>

              <div onPointerDown={(event) => beginDrag(event, 'brand')} onPointerMove={onMove} onPointerUp={endDrag} onPointerCancel={endDrag} title="대형 타이틀 드래그" style={{ position: 'absolute', left: layout.brandX, top: layout.brandY, width: layout.brandWidth, height: titleHandleHeight, boxSizing: 'border-box', cursor: 'move', border: '2px dashed rgba(72,164,255,.82)', background: 'rgba(72,164,255,.018)', zIndex: 20 }} />
              <div onPointerDown={(event) => beginDrag(event, 'card')} onPointerMove={onMove} onPointerUp={endDrag} onPointerCancel={endDrag} title="액션 카드 드래그" style={{ position: 'absolute', left: layout.cardX, top: layout.cardY, width: layout.cardWidth, height: 316, boxSizing: 'border-box', cursor: 'move', border: '2px dashed rgba(255,193,79,.82)', background: 'rgba(255,193,79,.012)', zIndex: 21 }} />
              {layout.symbolEnabled && layout.symbolImageUrl ? <div onPointerDown={(event) => beginDrag(event, 'symbol')} onPointerMove={onMove} onPointerUp={endDrag} onPointerCancel={endDrag} title="KSOP 심볼 드래그" style={{ position: 'absolute', left: layout.symbolX, top: layout.symbolY, width: layout.symbolSize, height: layout.symbolSize, boxSizing: 'border-box', cursor: 'move', border: '2px dashed rgba(110,222,170,.82)', background: 'rgba(110,222,170,.01)', zIndex: 19 }} /> : null}
            </div>
          </div>
        </div>

        <aside style={{ minHeight: 0, overflowY: 'auto', display: 'grid', alignContent: 'start', gap: 10, paddingRight: 3 }}>
          <div style={panelStyle}>
            <h3 style={{ margin: '0 0 4px', fontSize: 16 }}>대형 타이틀</h3>
            {renderNumberControls(titleControls)}
            <small style={{ display: 'block', marginTop: 8, color: '#687386' }}>파란 점선이 저장되는 실제 HERO 좌표입니다. 글자 크기는 최대 300px입니다.</small>
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
              <label className="admin-button secondary" style={{ cursor: 'pointer' }}>{uploading === 'card' ? '업로드 중…' : '카드 이미지 넣기'}<input type="file" accept="image/png,image/jpeg,image/webp,image/avif,image/gif" hidden onChange={(e) => uploadImage(e, 'card')} disabled={uploading !== null} /></label>
              <button type="button" className="admin-button secondary" onClick={() => setField('cardImageUrl', '')}>이미지 제거</button>
            </div>
            <small style={{ display: 'block', marginTop: 7, color: '#687386', wordBreak: 'break-all' }}>{layout.cardImageUrl || '등록된 카드 이미지 없음'}</small>
          </div>

          <div style={panelStyle}>
            <h3 style={{ margin: '0 0 8px', fontSize: 16 }}>KSOP 심볼</h3>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700 }}><input type="checkbox" checked={layout.symbolEnabled} onChange={(e) => setField('symbolEnabled', e.target.checked)} />심볼 표시</label>
            {renderNumberControls(symbolControls)}
            <div style={{ marginTop: 11, display: 'flex', gap: 7, flexWrap: 'wrap' }}>
              <label className="admin-button secondary" style={{ cursor: 'pointer' }}>{uploading === 'symbol' ? '업로드 중…' : '심볼 파일 넣기'}<input type="file" accept="image/png,image/jpeg,image/webp,image/avif,image/gif" hidden onChange={(e) => uploadImage(e, 'symbol')} disabled={uploading !== null} /></label>
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
