'use client'

import { useRef, useState, type ChangeEvent, type PointerEvent as ReactPointerEvent } from 'react'
import type { HeroLayoutSettings } from '@/lib/hero-layout-admin'
import { DEFAULT_HERO_LAYOUT, normalizeHeroLayout } from '@/lib/hero-layout-admin'

const HERO_W = 1920
const HERO_H = 998

type DragTarget = 'brand' | 'card' | 'symbol' | null

type NumberControl = [keyof HeroLayoutSettings, string, number, number, number]

export function HeroLayoutEditorMain({
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
  const [previewScale, setPreviewScale] = useState(0.44)
  const [uploading, setUploading] = useState<'symbol' | 'card' | null>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  function setField<K extends keyof HeroLayoutSettings>(key: K, value: HeroLayoutSettings[K]) {
    setLayout((current) => normalizeHeroLayout({ ...current, [key]: value }))
    setMessage('')
  }

  function setNumber(key: keyof HeroLayoutSettings, value: number) {
    setLayout((current) => normalizeHeroLayout({ ...current, [key]: value }))
    setMessage('')
  }

  function beginDrag(event: ReactPointerEvent<HTMLElement>, target: Exclude<DragTarget, null>) {
    event.preventDefault()
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
      setMessage('이미지 업로드 완료. 저장 버튼을 눌러 확정하세요.')
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
      setMessage('저장 완료. HERO 화면을 새로고침하면 반영됩니다.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '저장 실패')
    } finally {
      setSaving(false)
    }
  }

  const controls: NumberControl[] = [
    ['brandX', '대형 타이틀 X', 0, 1700, 1],
    ['brandY', '대형 타이틀 Y', 0, 900, 1],
    ['brandWidth', '대형 타이틀 폭', 240, 1700, 1],
    ['brandFontSize', '대형 타이틀 글자 크기', 28, 300, 1],
    ['cardX', '액션 카드 X', 0, 1550, 1],
    ['cardY', '액션 카드 Y', 0, 820, 1],
    ['cardWidth', '액션 카드 폭', 320, 1000, 1],
    ['symbolX', 'KSOP 심볼 X', 0, 1700, 1],
    ['symbolY', 'KSOP 심볼 Y', 0, 820, 1],
    ['symbolSize', 'KSOP 심볼 크기', 80, 900, 1],
    ['symbolOpacity', 'KSOP 심볼 투명도', 0.01, 0.5, 0.01],
    ['railBottom', '하단 정보 띠 아래 여백', 0, 220, 1],
    ['railHeight', '하단 정보 띠 높이', 54, 180, 1],
  ]

  const controlStyle = { display: 'grid', gap: 5 } as const
  const panelStyle = {
    border: '1px solid #dfe4eb',
    borderRadius: 16,
    background: '#fff',
    padding: 16,
  } as const

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <strong>편집 화면 축소</strong>
        <input
          aria-label="편집 화면 축소"
          type="range"
          min={0.3}
          max={0.55}
          step={0.01}
          value={previewScale}
          onChange={(event) => setPreviewScale(Number(event.target.value))}
          style={{ width: 220 }}
        />
        <span>{Math.round(previewScale * 100)}%</span>
        <span style={{ color: '#687386' }}>왼쪽 미리보기와 오른쪽 컨트롤을 동시에 보면서 조정합니다.</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 430px', gap: 18, alignItems: 'start' }}>
        <div style={{ minWidth: 0, overflow: 'auto', paddingBottom: 8 }}>
          <div style={{ width: HERO_W * previewScale, height: HERO_H * previewScale, position: 'relative' }}>
            <div
              ref={previewRef}
              onPointerMove={onMove}
              onPointerUp={() => setDragTarget(null)}
              onPointerCancel={() => setDragTarget(null)}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: HERO_W,
                height: HERO_H,
                overflow: 'hidden',
                borderRadius: 24,
                background: '#07111f',
                border: '2px solid #d8dde5',
                touchAction: 'none',
                transform: `scale(${previewScale})`,
                transformOrigin: 'top left',
              }}
            >
              <img src={heroImage} alt="HERO preview" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(3,10,20,.78) 0%, rgba(3,10,20,.35) 45%, rgba(3,10,20,.05) 75%)' }} />

              {layout.symbolEnabled && layout.symbolImageUrl ? (
                <img
                  onPointerDown={(event) => beginDrag(event, 'symbol')}
                  src={layout.symbolImageUrl}
                  alt="KSOP symbol"
                  title="KSOP 심볼 드래그"
                  style={{
                    position: 'absolute',
                    left: layout.symbolX,
                    top: layout.symbolY,
                    width: layout.symbolSize,
                    height: layout.symbolSize,
                    objectFit: 'contain',
                    objectPosition: 'center',
                    opacity: layout.symbolOpacity,
                    cursor: 'move',
                    userSelect: 'none',
                  }}
                />
              ) : null}

              <div
                onPointerDown={(event) => beginDrag(event, 'brand')}
                style={{
                  position: 'absolute',
                  left: layout.brandX,
                  top: layout.brandY,
                  width: layout.brandWidth,
                  color: 'white',
                  fontSize: layout.brandFontSize,
                  fontWeight: 800,
                  lineHeight: .9,
                  letterSpacing: '-.055em',
                  cursor: 'move',
                  textShadow: '0 14px 40px rgba(0,0,0,.4)',
                  textWrap: 'balance',
                }}
                title="대형 타이틀 드래그"
              >
                KOREA SERIES OF POKER
              </div>

              <div
                onPointerDown={(event) => beginDrag(event, 'card')}
                style={{
                  position: 'absolute',
                  left: layout.cardX,
                  top: layout.cardY,
                  width: layout.cardWidth,
                  minHeight: 270,
                  padding: 30,
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,.22)',
                  borderRadius: 24,
                  background: 'rgba(8,20,37,.72)',
                  color: 'white',
                  backdropFilter: 'blur(14px)',
                  cursor: 'move',
                  boxShadow: '0 20px 50px rgba(0,0,0,.28)',
                }}
                title="액션 카드 드래그"
              >
                {layout.cardImageUrl ? (
                  <>
                    <img src={layout.cardImageUrl} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: .25, pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(6,18,34,.92), rgba(6,18,34,.48))', pointerEvents: 'none' }} />
                  </>
                ) : null}
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <p style={{ margin: 0, opacity: .72, fontSize: 15 }}>{layout.cardIntro}</p>
                  <div style={{ marginTop: 22, padding: 18, border: '1px solid rgba(255,255,255,.18)', borderRadius: 16, background: 'rgba(255,255,255,.06)' }}>
                    <div style={{ fontSize: 12, letterSpacing: '.14em', opacity: .75 }}>{layout.cardKicker}</div>
                    <strong style={{ display: 'block', marginTop: 10, fontSize: 22 }}>KSOP SERIES</strong>
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                    <span style={{ padding: '13px 22px', borderRadius: 999, background: '#1687ff', fontWeight: 700 }}>{layout.cardPrimaryText}</span>
                    <span style={{ padding: '13px 22px', borderRadius: 999, border: '1px solid rgba(255,255,255,.35)', fontWeight: 700 }}>{layout.cardSecondaryText}</span>
                  </div>
                </div>
              </div>

              <div
                style={{
                  position: 'absolute',
                  left: 92,
                  right: 92,
                  bottom: layout.railBottom,
                  height: layout.railHeight,
                  borderRadius: 20,
                  border: '1px solid rgba(255,255,255,.18)',
                  background: 'rgba(6,18,34,.60)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 24px',
                  fontSize: 13,
                  letterSpacing: '.08em',
                }}
              >
                UPCOMING SERIES · NEXT SERIES · DATE · LOCATION
              </div>
            </div>
          </div>
        </div>

        <aside style={{ position: 'sticky', top: 20, maxHeight: 'calc(100vh - 150px)', overflowY: 'auto', display: 'grid', gap: 12, paddingRight: 4 }}>
          <div style={panelStyle}>
            <h3 style={{ marginTop: 0 }}>대형 타이틀</h3>
            {controls.slice(0, 4).map(([key, label, min, max, step]) => (
              <label key={key} style={{ ...controlStyle, marginTop: 10 }}>
                <span style={{ fontWeight: 700 }}>{label}: {String(layout[key])}</span>
                <input type="range" min={min} max={max} step={step} value={Number(layout[key])} onChange={(e) => setNumber(key, Number(e.target.value))} />
                <input type="number" min={min} max={max} step={step} value={Number(layout[key])} onChange={(e) => setNumber(key, Number(e.target.value))} />
              </label>
            ))}
            <small style={{ display: 'block', marginTop: 8, color: '#687386' }}>폭을 줄이면 문장이 실제로 줄바꿈되고, 넓히면 다시 펼쳐집니다.</small>
          </div>

          <div style={panelStyle}>
            <h3 style={{ marginTop: 0 }}>액션 카드</h3>
            {controls.slice(4, 7).map(([key, label, min, max, step]) => (
              <label key={key} style={{ ...controlStyle, marginTop: 10 }}>
                <span style={{ fontWeight: 700 }}>{label}: {String(layout[key])}</span>
                <input type="range" min={min} max={max} step={step} value={Number(layout[key])} onChange={(e) => setNumber(key, Number(e.target.value))} />
                <input type="number" min={min} max={max} step={step} value={Number(layout[key])} onChange={(e) => setNumber(key, Number(e.target.value))} />
              </label>
            ))}
            <label style={{ ...controlStyle, marginTop: 12 }}><span>설명 문구</span><input value={layout.cardIntro} onChange={(e) => setField('cardIntro', e.target.value)} /></label>
            <label style={{ ...controlStyle, marginTop: 10 }}><span>NEXT SERIES 문구</span><input value={layout.cardKicker} onChange={(e) => setField('cardKicker', e.target.value)} /></label>
            <label style={{ ...controlStyle, marginTop: 10 }}><span>메인 버튼 문구</span><input value={layout.cardPrimaryText} onChange={(e) => setField('cardPrimaryText', e.target.value)} /></label>
            <label style={{ ...controlStyle, marginTop: 10 }}><span>보조 버튼 문구</span><input value={layout.cardSecondaryText} onChange={(e) => setField('cardSecondaryText', e.target.value)} /></label>
            <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <label className="admin-button secondary" style={{ cursor: 'pointer' }}>
                {uploading === 'card' ? '업로드 중…' : '카드 이미지 넣기'}
                <input type="file" accept="image/png,image/jpeg,image/webp,image/avif,image/gif" hidden onChange={(e) => uploadImage(e, 'card')} disabled={uploading !== null} />
              </label>
              <button type="button" className="admin-button secondary" onClick={() => setField('cardImageUrl', '')} disabled={!layout.cardImageUrl}>이미지 제거</button>
            </div>
          </div>

          <div style={panelStyle}>
            <h3 style={{ marginTop: 0 }}>KSOP 심볼</h3>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={layout.symbolEnabled} onChange={(e) => setField('symbolEnabled', e.target.checked)} />
              심볼 표시
            </label>
            {controls.slice(7, 11).map(([key, label, min, max, step]) => (
              <label key={key} style={{ ...controlStyle, marginTop: 10 }}>
                <span style={{ fontWeight: 700 }}>{label}: {String(layout[key])}</span>
                <input type="range" min={min} max={max} step={step} value={Number(layout[key])} onChange={(e) => setNumber(key, Number(e.target.value))} />
                <input type="number" min={min} max={max} step={step} value={Number(layout[key])} onChange={(e) => setNumber(key, Number(e.target.value))} />
              </label>
            ))}
            <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <label className="admin-button secondary" style={{ cursor: 'pointer' }}>
                {uploading === 'symbol' ? '업로드 중…' : '심볼 파일 넣기'}
                <input type="file" accept="image/png,image/jpeg,image/webp,image/avif,image/gif" hidden onChange={(e) => uploadImage(e, 'symbol')} disabled={uploading !== null} />
              </label>
              <button type="button" className="admin-button secondary" onClick={() => setLayout((v) => normalizeHeroLayout({ ...v, symbolEnabled: true, symbolImageUrl: '/images/ksop-symbol-dark.svg' }))}>기본 심볼</button>
              <button type="button" className="admin-button secondary" onClick={() => setLayout((v) => normalizeHeroLayout({ ...v, symbolEnabled: false, symbolImageUrl: '' }))}>심볼 제거</button>
            </div>
            <small style={{ display: 'block', marginTop: 8, color: '#687386', wordBreak: 'break-all' }}>{layout.symbolImageUrl || '등록된 심볼 파일 없음'}</small>
          </div>

          <div style={panelStyle}>
            <h3 style={{ marginTop: 0 }}>하단 정보 띠</h3>
            {controls.slice(11).map(([key, label, min, max, step]) => (
              <label key={key} style={{ ...controlStyle, marginTop: 10 }}>
                <span style={{ fontWeight: 700 }}>{label}: {String(layout[key])}</span>
                <input type="range" min={min} max={max} step={step} value={Number(layout[key])} onChange={(e) => setNumber(key, Number(e.target.value))} />
                <input type="number" min={min} max={max} step={step} value={Number(layout[key])} onChange={(e) => setNumber(key, Number(e.target.value))} />
              </label>
            ))}
          </div>
        </aside>
      </div>

      <div className="admin-actions" style={{ position: 'sticky', bottom: 12, zIndex: 20, padding: 12, border: '1px solid #dfe4eb', borderRadius: 14, background: 'rgba(255,255,255,.96)', boxShadow: '0 12px 30px rgba(20,30,50,.10)' }}>
        <button type="button" className="admin-button" onClick={save} disabled={saving}>{saving ? '저장 중…' : 'HERO 설정 저장'}</button>
        <button type="button" className="admin-button secondary" onClick={() => { setLayout(DEFAULT_HERO_LAYOUT); setMessage('기본값으로 복원했습니다. 저장 버튼을 눌러 확정하세요.') }}>기본값</button>
        {message ? <span>{message}</span> : null}
      </div>
    </div>
  )
}
