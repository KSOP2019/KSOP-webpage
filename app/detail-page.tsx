'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Globe2, Menu, X } from 'lucide-react'

const nav = [
  ['SCHEDULE', '/schedule'],
  ['EVENT', '/event'],
  ['RANKING', '/ranking'],
  ['NEWS', '/news'],
  ['ABOUT', '/about'],
] as const

const content = {
  schedule: { kicker: '01 / SCHEDULE', title: 'SCHEDULE', intro: 'A considered calendar of live poker, from opening tables to championship nights.', items: [{ label: 'KSOP NAVER ENDING         ', image: '/images/schedule-warmup.png' }, { label: 'CROWN SERIES  11.22~28 ', image: '/images/schedule-plo.png' }, { label: 'YEAR FOR LAST 12.18~23', image: '/images/schedule-main-event.png' }, { label: 'CHAMPIONSHIP 12.27~30', image: '/images/schedule-high-roller.png' }] },
  event: { kicker: 'EVENT / THE PROGRAM', title: 'THE TABLE IS SET', intro: 'Every event is built around momentum, precision, and the players who shape the room.', items: ['INVITATION', 'NLH POKER PLAYERS CHAMPIONSHIP', 'PLO NIGHT', 'MAIN EVENT'] },
  ranking: { kicker: '03 / PLAYER RANKING', title: 'TOP PLAYERS', intro: 'The season belongs to the players who make every decision count.', items: ['01  JUN-HYUK LEE — ₩ 218,400,000', '02  DANIEL LIM — ₩ 164,800,000', '03  MIN-SEOK KIM — ₩ 129,500,000', '04  ALEX PARK — ₩ 98,200,000'] },
  news: { kicker: '04 / FROM THE SERIES', title: 'INSIDE THE STORY.', intro: 'Reports, portraits, and moments from the Korea Series of Poker.', items: ['THE TABLE IS SET', 'A NEW STANDARD FOR LIVE POKER', 'SEOUL GRAND PRIX RECAP', 'THE PLAYERS TO WATCH'] },
  about: { kicker: '01 / THE SERIES', title: 'MORE THAN A TOURNAMENT.', intro: "KSOP is a meeting place for Korea's sharpest minds, boldest plays, and most unforgettable stories.", items: ['DISCIPLINE MEETS INSTINCT', 'LIVE POKER IN KOREA', 'THE SERIES CONTINUES'] },
} as const

type Section = keyof typeof content

export default function DetailPage({ section }: { section: Section }) {
  const [language, setLanguage] = useState('KR')
  const [dark, setDark] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const page = content[section]
  useEffect(() => { document.documentElement.lang = language.toLowerCase() }, [language])
  return <main className={`detail-page ${section === 'schedule' ? 'schedule-detail' : ''} ${dark ? 'theme-dark' : ''}`}>
    <header className="site-header detail-header">
      <Link href="/" className="brand"><img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%EB%88%84%EB%81%BC%EB%A1%9C%EA%B3%A02-OT3NlxHk30TAmPPpNIcNvNtvTVM74n.png" alt="KSOP Korea Series of Poker" /></Link>
      <nav className={menuOpen ? 'nav-links is-open' : 'nav-links'}>{nav.map(([label, href]) => <Link key={href} href={href} className={href === `/${section}` ? 'active' : ''} onClick={() => setMenuOpen(false)}>{label}</Link>)}</nav>
      <div className="detail-actions"><details className="language-menu"><summary className="language" aria-label={`Current language: ${language}`}><Globe2 /></summary><div className="language-options">{['EN', 'KR', 'JP', 'CN'].filter(code => code !== language).map(code => <button key={code} onClick={() => setLanguage(code)}>{code}</button>)}</div></details><button className="theme-switch" onClick={() => setDark(value => !value)} aria-label="Toggle theme">☼ <span className="theme-track"><span /></span> ☾</button><button className="menu-toggle" onClick={() => setMenuOpen(value => !value)} aria-label="Toggle menu">{menuOpen ? <X /> : <Menu />}</button></div>
    </header>
    <section className="detail-hero"><div className="detail-kicker">{page.kicker}</div><div className="detail-hero-grid"><h1>{page.title}</h1><p>{page.intro}</p></div></section>
    <section className="detail-list" aria-label={`${page.title} details`}>{page.items.map((item, index) => { const label = typeof item === 'string' ? item : item.label; return <article className="detail-row" key={label} style={section === 'schedule' && typeof item !== 'string' ? { backgroundImage: `linear-gradient(90deg, rgba(7, 12, 22, .92) 0%, rgba(7, 12, 22, .58) 48%, rgba(7, 12, 22, .18) 100%), url(${item.image})` } : undefined}>{section !== 'schedule' && <span>{String(index + 1).padStart(2, '0')}</span>}<h2>{label}</h2>{section !== 'schedule' && <span className="detail-arrow">↗</span>}</article> })}</section>
    <footer className="detail-footer"><span>THE KOREA SERIES OF POKER · 2026</span><Link href="/">BACK TO HOME ↗</Link></footer>
  </main>
}
