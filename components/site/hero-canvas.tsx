import Link from 'next/link'
import type { CSSProperties, ReactNode } from 'react'

export type HeroCanvasLayout = {
  brandX: number
  brandY: number
  brandWidth: number
  brandFontSize: number
  cardX: number
  cardY: number
  cardWidth: number
  symbolX: number
  symbolY: number
  symbolSize: number
  symbolOpacity: number
  symbolEnabled: boolean
  symbolImageUrl: string
  railBottom: number
  railHeight: number
  cardIntro: string
  cardKicker: string
  cardTitleText: string
  cardPrimaryText: string
  cardSecondaryText: string
  cardImageUrl: string
}

type HeroCanvasProps = {
  layout: HeroCanvasLayout
  heroImage: string
  seriesCount?: number
  seriesLabel?: string
  seriesDate?: string
  seriesLocation?: string
  seriesHref?: string
  interactive?: boolean
  className?: string
  children?: ReactNode
}

const HERO_W = 1920
const HERO_H = 998

function ArrowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 17 17 7" />
      <path d="M7 7h10v10" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 2v4M16 2v4M3 10h18" />
      <rect x="3" y="4" width="18" height="18" rx="2" />
    </svg>
  )
}

function RailCell({ label, value, count }: { label: string; value: string; count?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0, padding: '16px 24px', boxSizing: 'border-box' }}>
      <span style={{ color: 'rgba(255,255,255,.48)', fontSize: 10, fontWeight: 700, letterSpacing: '.15em' }}>{label}</span>
      <strong style={{ marginTop: 9, overflow: 'hidden', color: 'rgba(255,255,255,.92)', fontSize: count ? 24 : 14, lineHeight: count ? .9 : 1.15, fontWeight: count ? 760 : 650, textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</strong>
    </div>
  )
}

export function HeroCanvas({
  layout,
  heroImage,
  seriesCount = 0,
  seriesLabel = 'KSOP SERIES',
  seriesDate = '일정 추후 공개',
  seriesLocation = '장소 추후 공개',
  seriesHref = '/schedule',
  interactive = true,
  className = '',
  children,
}: HeroCanvasProps) {
  const title = layout.cardTitleText || seriesLabel || 'KSOP SERIES'
  const image = heroImage || '/images/ksop-hero-arena.png'
  const sharedButtonStyle: CSSProperties = {
    flex: '1 1 0',
    width: 0,
    minWidth: 0,
    height: 56,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    boxSizing: 'border-box',
    borderRadius: 999,
    fontSize: 15,
    fontWeight: 700,
    lineHeight: 1,
    whiteSpace: 'nowrap',
    textDecoration: 'none',
  }

  const nextSeriesStyle: CSSProperties = {
    position: 'relative',
    display: 'grid',
    gridTemplateColumns: 'minmax(0,1fr) auto',
    gridTemplateRows: 'auto auto auto',
    width: '100%',
    minHeight: 100,
    marginTop: 16,
    padding: '14px 17px 13px',
    boxSizing: 'border-box',
    overflow: 'hidden',
    color: '#fff',
    textDecoration: 'none',
    border: '1px solid rgba(255,255,255,.15)',
    borderRadius: 17,
    background: 'linear-gradient(135deg, rgba(255,255,255,.10), rgba(255,255,255,.03))',
    boxShadow: 'inset 0 1px rgba(255,255,255,.09), 0 10px 28px rgba(0,0,0,.11)',
  }

  const nextInner = (
    <>
      <span style={{ gridColumn: '1 / 2', color: 'rgba(150,194,255,.94)', fontSize: 10, lineHeight: 1, fontWeight: 750, letterSpacing: '.13em' }}>{layout.cardKicker}</span>
      <strong style={{ gridColumn: '1 / 2', marginTop: 8, overflow: 'hidden', color: '#fff', fontSize: 19, lineHeight: 1.2, fontWeight: 700, letterSpacing: '-.02em', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</strong>
      <span style={{ gridColumn: '1 / 2', display: 'flex', alignItems: 'center', gap: 14, marginTop: 8, color: 'rgba(255,255,255,.58)', fontSize: 11, lineHeight: 1, letterSpacing: '.035em' }}>
        <span>DATE</span><span>·</span><span>LOCATION</span>
      </span>
      <span style={{ gridColumn: '2 / 3', gridRow: '1 / 4', alignSelf: 'center', marginLeft: 18, color: 'rgba(255,255,255,.78)', display: 'grid', placeItems: 'center' }}><ArrowIcon /></span>
    </>
  )

  return (
    <section
      className={`hero premium-hero ksop-shared-hero ${className}`.trim()}
      id="top"
      data-hero-canvas="shared-v1"
      style={{
        position: 'relative',
        width: HERO_W,
        minWidth: HERO_W,
        maxWidth: HERO_W,
        height: HERO_H,
        minHeight: HERO_H,
        maxHeight: HERO_H,
        padding: 0,
        overflow: 'hidden',
        isolation: 'isolate',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ position: 'absolute', left: 40, right: 40, top: 22, bottom: 20, overflow: 'hidden', borderRadius: 30, background: '#06111f', boxShadow: '0 28px 76px rgba(5,17,35,.24), 0 7px 22px rgba(5,17,35,.12)' }}>
        <img src={image} alt="KSOP tournament arena" fetchPriority="high" decoding="async" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center center', display: 'block', filter: 'saturate(.96) contrast(1.03)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(3,14,29,.91) 0%, rgba(3,14,29,.76) 20%, rgba(3,14,29,.44) 36%, rgba(3,14,29,.12) 55%, rgba(3,14,29,.02) 75%), linear-gradient(0deg, rgba(2,10,21,.24), transparent 44%)' }} />
        <div style={{ position: 'absolute', inset: 0, borderRadius: 'inherit', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.09), inset 0 1px rgba(255,255,255,.13)' }} />
      </div>

      <div style={{ position: 'absolute', top: 52, right: 54, zIndex: 5, display: 'flex', alignItems: 'center', gap: 12, minHeight: 38, padding: '0 14px', color: 'rgba(255,255,255,.82)', border: '1px solid rgba(255,255,255,.14)', borderRadius: 999, background: 'rgba(5,16,30,.24)', boxShadow: 'inset 0 1px rgba(255,255,255,.07)', backdropFilter: 'blur(12px)' }}>
        <span style={{ color: '#fff', fontSize: 12, fontWeight: 850, letterSpacing: '.10em' }}>KSOP</span>
        <strong style={{ paddingLeft: 12, borderLeft: '1px solid rgba(255,255,255,.18)', color: 'rgba(255,255,255,.64)', fontSize: 10, fontWeight: 700, letterSpacing: '.14em' }}>OFFICIAL SERIES</strong>
      </div>

      {layout.symbolEnabled && layout.symbolImageUrl ? (
        <img src={layout.symbolImageUrl} alt="" aria-hidden="true" style={{ position: 'absolute', left: layout.symbolX, top: layout.symbolY, width: layout.symbolSize, height: layout.symbolSize, objectFit: 'contain', objectPosition: 'center', opacity: layout.symbolOpacity, filter: 'grayscale(1) brightness(1.25)', zIndex: 4, pointerEvents: 'none', userSelect: 'none' }} />
      ) : null}

      <div style={{ position: 'absolute', left: layout.brandX, top: layout.brandY, width: layout.brandWidth, minWidth: layout.brandWidth, maxWidth: layout.brandWidth, zIndex: 6, boxSizing: 'border-box', color: 'rgba(255,255,255,.90)', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: layout.brandFontSize, fontWeight: 760, lineHeight: .88, letterSpacing: '-.055em', whiteSpace: 'normal', wordBreak: 'keep-all', overflowWrap: 'normal', textShadow: '0 14px 40px rgba(0,0,0,.34)', pointerEvents: 'none', userSelect: 'none' }}>
        KOREA SERIES OF POKER
      </div>

      <div style={{ position: 'absolute', left: layout.cardX, top: layout.cardY, width: layout.cardWidth, minWidth: layout.cardWidth, maxWidth: layout.cardWidth, minHeight: 316, padding: '30px 34px 26px', boxSizing: 'border-box', overflow: 'hidden', color: '#fff', border: '1px solid rgba(255,255,255,.20)', borderRadius: 24, background: 'linear-gradient(145deg, rgba(20,35,55,.76), rgba(8,20,37,.60))', boxShadow: '0 28px 72px rgba(0,0,0,.30), inset 0 1px rgba(255,255,255,.15), inset 0 0 34px rgba(255,255,255,.022)', backdropFilter: 'blur(24px) saturate(120%)', zIndex: 6 }}>
        {layout.cardImageUrl ? <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(90deg, rgba(6,18,34,.92), rgba(6,18,34,.50)), url(${JSON.stringify(layout.cardImageUrl)})`, backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundSize: 'cover', zIndex: 0 }} /> : null}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <p style={{ width: '100%', maxWidth: 500, margin: 0, color: 'rgba(255,255,255,.68)', fontSize: 15, lineHeight: 1.5 }}>{layout.cardIntro}</p>
          {interactive ? <Link href={seriesHref} style={nextSeriesStyle}>{nextInner}</Link> : <div style={nextSeriesStyle}>{nextInner}</div>}
          <div style={{ display: 'flex', alignItems: 'center', width: '100%', minHeight: 56, marginTop: 16, gap: 10 }}>
            {interactive ? (
              <>
                <Link href="/events" style={{ ...sharedButtonStyle, color: '#fff', border: '1px solid rgba(113,178,255,.9)', background: 'linear-gradient(135deg,#4d9cff 0%,#1677ff 55%,#0b63e8 100%)', boxShadow: '0 12px 30px rgba(22,119,255,.36)' }}>{layout.cardPrimaryText}<ArrowIcon /></Link>
                <Link href="/schedule" style={{ ...sharedButtonStyle, color: 'rgba(255,255,255,.92)', border: '1px solid rgba(255,255,255,.28)', background: 'rgba(10,23,40,.34)' }}>{layout.cardSecondaryText}<CalendarIcon /></Link>
              </>
            ) : (
              <>
                <span style={{ ...sharedButtonStyle, color: '#fff', border: '1px solid rgba(113,178,255,.9)', background: 'linear-gradient(135deg,#4d9cff 0%,#1677ff 55%,#0b63e8 100%)', boxShadow: '0 12px 30px rgba(22,119,255,.36)' }}>{layout.cardPrimaryText}<ArrowIcon /></span>
                <span style={{ ...sharedButtonStyle, color: 'rgba(255,255,255,.92)', border: '1px solid rgba(255,255,255,.28)', background: 'rgba(10,23,40,.34)' }}>{layout.cardSecondaryText}<CalendarIcon /></span>
              </>
            )}
          </div>
        </div>
      </div>

      <div aria-label="KSOP series overview" style={{ position: 'absolute', left: 92, right: 92, bottom: layout.railBottom, height: layout.railHeight, minHeight: layout.railHeight, zIndex: 7, display: 'grid', gridTemplateColumns: '.72fr 1.65fr 1fr 1fr', overflow: 'hidden', color: '#fff', border: '1px solid rgba(255,255,255,.14)', borderRadius: 20, background: 'linear-gradient(90deg, rgba(7,19,35,.74), rgba(7,19,35,.46))', boxShadow: '0 18px 48px rgba(0,0,0,.20), inset 0 1px rgba(255,255,255,.08)', backdropFilter: 'blur(18px) saturate(115%)' }}>
        <RailCell label="UPCOMING SERIES" value={String(seriesCount).padStart(2, '0')} count />
        <div style={{ borderLeft: '1px solid rgba(255,255,255,.12)' }}>{interactive ? <Link href={seriesHref} style={{ color: 'inherit', textDecoration: 'none' }}><RailCell label="NEXT SERIES" value={seriesLabel || 'KSOP SERIES'} /></Link> : <RailCell label="NEXT SERIES" value={seriesLabel || 'KSOP SERIES'} />}</div>
        <div style={{ borderLeft: '1px solid rgba(255,255,255,.12)' }}><RailCell label="DATE" value={seriesDate || '일정 추후 공개'} /></div>
        <div style={{ borderLeft: '1px solid rgba(255,255,255,.12)' }}><RailCell label="LOCATION" value={seriesLocation || '장소 추후 공개'} /></div>
      </div>

      {children}
    </section>
  )
}
