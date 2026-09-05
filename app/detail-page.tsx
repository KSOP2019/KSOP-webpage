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
  schedule: { kicker: '02 / UPCOMING SERIES', title: 'EVENTS', intro: 'A considered calendar of live poker, from opening tables to championship nights.', items: ['NOV 17 — NLH WARM-UP', 'NOV 18 — PLO KICK-OFF', 'NOV 20 — MAIN EVENT DAY 1', 'NOV 22 — HIGH ROLLER CHAMPIONSHIP'] },
  event: { kicker: 'EVENT / THE PROGRAM', title: 'THE TABLE IS SET', intro: 'Every event is built around momentum, precision, and the players who shape the room.', items: ['INVITATION', 'NLH POKER PLAYERS CHAMPIONSHIP', 'PLO NIGHT', 'MAIN EVENT'] },
  ranking: { kicker: '03 / PLAYER RANKING', title: 'TOP PLAYERS', intro: 'The season belongs to the players who make every decision count.', items: ['01  JUN-HYUK LEE — ₩ 218,400,000', '02  DANIEL LIM — ₩ 164,800,000', '03  MIN-SEOK KIM — ₩ 129,500,000', '04  ALEX PARK — ₩ 98,200,000'] },
  news: { kicker: '04 / FROM THE SERIES', title: 'INSIDE THE STORY.', intro: 'Reports, portraits, and moments from the Korea Series of Poker.', items: ['THE TABLE IS SET', 'A NEW STANDARD FOR LIVE POKER', 'SEOUL GRAND PRIX RECAP', 'THE PLAYERS TO WATCH'] },
  about: { kicker: '01 / THE SERIES', title: 'MORE THAN A TOURNAMENT.', intro: "KSOP is a meeting place for Korea's sharpest minds, boldest plays, and most unforgettable stories.", items: ['DISCIPLINE MEETS INSTINCT', 'LIVE POKER IN KOREA', 'THE SERIES CONTINUES'] },
} as const

type Section = keyof typeof content

export default function DetailPage({ section }: { section: Section }) {
  const [language, setLanguage] = useState('EN')
  const [dark, setDark] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const page = content[section]
  useEffect(() => { document.documentElement.lang = language.toLowerCase() }, [language])
  return <main className={`detail-page ${dark ? 'theme-dark' : ''}`}>
    <header className="site-header detail-header">
      <Link href="/" className="brand"><img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%EB%88%84%EB%81%BC%EB%A1%9C%EA%B3%A02-OT3NlxHk30TAmPPpNIcNvNtvTVM74n.png" alt="KSOP Korea Series of Poker" /></Link>
      <nav className={menuOpen ? 'nav-links is-open' : 'nav-links'}>{nav.map(([label, href]) => <Link key={href} href={href} className={href === `/${section}` ? 'active' : ''} onClick={() => setMenuOpen(false)}>{label}</Link>)}</nav>
      <div className="detail-actions"><details className="language-menu"><summary className="language"><Globe2 /> {language}</summary><div className="language-options">{['EN', 'KR', 'JP', 'CN'].map(code => <button key={code} onClick={() => setLanguage(code)}>{code}</button>)}</div></details><button className="theme-switch" onClick={() => setDark(value => !value)} aria-label="Toggle theme">☼ <span className="theme-track"><span /></span> ☾</button><button className="menu-toggle" onClick={() => setMenuOpen(value => !value)} aria-label="Toggle menu">{menuOpen ? <X /> : <Menu />}</button></div>
    </header>
    <section className="detail-hero"><div className="detail-kicker">{page.kicker}</div><div className="detail-hero-grid"><h1>{page.title}</h1><p>{page.intro}</p></div></section>
    <section className="detail-list" aria-label={`${page.title} details`}>{page.items.map((item, index) => <article className="detail-row" key={item}><span>{String(index + 1).padStart(2, '0')}</span><h2>{item}</h2><span className="detail-arrow">↗</span></article>)}</section>
    <footer className="detail-footer"><span>THE KOREA SERIES OF POKER · 2026</span><Link href="/">BACK TO HOME ↗</Link></footer>
  </main>
}
