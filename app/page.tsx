'use client'

import { useMemo, useState } from 'react'
import { ArrowUpRight, ChevronDown, Menu, Search, X } from 'lucide-react'

const heroImage = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ksop-hero-arena-JQ0pjfsDhRQgTNBanhgv2w8v4z3X2n.webp'
const colorLogo = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%EB%88%84%EB%81%BC%EB%A1%9C%EA%B3%A02-OT3NlxHk30TAmPPpNIcNvNtvTVM74n.png'
const blackLogo = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%EB%88%84%EB%81%BC%EB%A1%9C%EA%B3%A02WR-tgy4izavY9FV1g1OzclHFxFk3YlgKR.png'
const instagram = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Instagram_logo_2016.svg-NBMO0lmv2K7K473c9FrC4lkjBON4CP.xml'
const youtube = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/YouTube_full-color_icon_%282017%29-lzM6xIHSSDTpUc58zCv1DnznwW1NMZ.svg'
const facebook = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/2021_Facebook_icon-eAvML39Egb3WwCxlfdN5V470AtOd9g.svg'
const xLogo = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/X_logo_2023.svg-SAy6Q2okZ356D0qB9EQkubVclIK1Bk.xml'

const schedule = [
  { date: 'OCT 03', day: 'FRI', title: 'Opening Event', detail: 'Welcome Reception · 18:00', type: 'SPECIAL' },
  { date: 'OCT 04', day: 'SAT', title: 'Main Event Day 1', detail: 'Flight A · 12:00 / Flight B · 18:00', type: 'MAIN' },
  { date: 'OCT 05', day: 'SUN', title: 'Main Event Day 2', detail: 'Day 1 survivors · 12:00', type: 'MAIN' },
  { date: 'OCT 06', day: 'MON', title: 'Final Table', detail: 'Final 9 · 14:00', type: 'FINAL' },
]

const players = [
  ['01', 'JUN-HYUK LEE', 'KR', '₩ 218,400,000'],
  ['02', 'DANIEL LIM', 'KR', '₩ 164,800,000'],
  ['03', 'MIN-SEOK KIM', 'KR', '₩ 129,500,000'],
  ['04', 'ALEX PARK', 'US', '₩ 98,200,000'],
]

function SocialIcon({ src, label }: { src: string; label: string }) {
  return <a className="social-icon" href="#social" aria-label={label}><img src={src} alt="" /></a>
}

export default function Page() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState('ALL')
  const [query, setQuery] = useState('')
  const [openDay, setOpenDay] = useState(1)

  const filteredPlayers = useMemo(() => players.filter(([_, name]) => name.toLowerCase().includes(query.toLowerCase())), [query])
  const visibleSchedule = activeFilter === 'ALL' ? schedule : schedule.filter((item) => item.type === activeFilter)

  return (
    <main>
      <header className="site-header">
        <a href="#top" className="brand"><img src={colorLogo} alt="KSOP Korea Series of Poker" /></a>
        <nav className={menuOpen ? 'nav-links is-open' : 'nav-links'} aria-label="Primary navigation">
          <a href="#series" onClick={() => setMenuOpen(false)}>SERIES</a>
          <a href="#schedule" onClick={() => setMenuOpen(false)}>SCHEDULE</a>
          <a href="#ranking" onClick={() => setMenuOpen(false)}>RANKING</a>
          <a href="#about" onClick={() => setMenuOpen(false)}>ABOUT KSOP</a>
        </nav>
        <div className="header-actions">
          <a className="live-link" href="#live"><span className="live-dot" /> LIVE</a>
          <button className="menu-toggle" aria-label={menuOpen ? 'Close menu' : 'Open menu'} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</button>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">THE KOREA SERIES OF POKER · 2025</p>
          <h1>The art<br />of the <em>game.</em></h1>
          <p className="hero-intro">Where discipline meets instinct.<br />A new standard for live poker in Korea.</p>
          <a className="text-link" href="#schedule">Explore the series <ArrowUpRight /></a>
        </div>
        <div className="hero-visual"><img src={heroImage} alt="KSOP arena prepared for the tournament" /><div className="hero-stamp">SEOUL<br /><strong>25</strong><br />OCTOBER</div></div>
        <div className="hero-foot"><span>SCROLL TO DISCOVER</span><span className="line" /><span>37° 33′ N / 126° 59′ E</span></div>
      </section>

      <section className="intro section-pad" id="about">
        <div className="section-label">01 / THE SERIES</div>
        <div className="intro-content"><h2>More than<br /><em>a tournament.</em></h2><div><p className="large-copy">KSOP is a meeting place for Korea&apos;s sharpest minds, boldest plays, and most unforgettable stories.</p><p className="muted-copy">Built for the modern player. Curated for the people who care about every detail. From the felt to the final hand, this is poker as it should be.</p><a className="circle-link" href="#ranking" aria-label="Discover the series"><ArrowUpRight /></a></div></div>
      </section>

      <section className="schedule-section section-pad" id="schedule"><div className="section-top"><div className="section-label">02 / UPCOMING SERIES</div><p>SEOUL · GRAND HYATT<br />03—06 OCT 2025</p></div><div className="filter-row">{['ALL', 'MAIN', 'FINAL', 'SPECIAL'].map((filter) => <button key={filter} className={activeFilter === filter ? 'filter active' : 'filter'} onClick={() => setActiveFilter(filter)}>{filter}</button>)}</div><div className="schedule-list">{visibleSchedule.map((item, index) => <article className={openDay === index ? 'schedule-item open' : 'schedule-item'} key={item.date} onClick={() => setOpenDay(openDay === index ? -1 : index)}><div className="date"><strong>{item.date}</strong><span>{item.day}</span></div><div className="event-title"><h3>{item.title}</h3><p>{item.detail}</p></div><span className="event-type">{item.type}</span><ChevronDown className="chevron" />{openDay === index && <div className="event-note">Doors open one hour before play. All times are local to Seoul. <a href="#register">Register your seat <ArrowUpRight /></a></div>}</article>)}</div></section>

      <section className="ranking-section section-pad" id="ranking"><div className="section-top"><div className="section-label">03 / PLAYER RANKING</div><div className="search-box"><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search player" aria-label="Search player ranking" /></div></div><div className="ranking-table"><div className="table-head"><span>RANK</span><span>PLAYER</span><span>COUNTRY</span><span>EARNINGS</span></div>{filteredPlayers.map(([rank, name, country, earnings]) => <div className="player-row" key={name}><span className="rank">{rank}</span><strong>{name}</strong><span>{country}</span><span>{earnings}</span></div>)}</div></section>

      <section className="image-break"><img src={heroImage} alt="Poker tables inside the KSOP arena" /><div className="image-break-copy"><span>THE TABLE IS SET</span><h2>See you<br /><em>at the felt.</em></h2><a className="button-link" href="#register">Register now <ArrowUpRight /></a></div></section>

      <footer className="site-footer" id="social"><div><img className="footer-logo" src={colorLogo} alt="KSOP Korea Series of Poker" /><p className="footer-note">Korea&apos;s premier live poker series.<br />Designed for the game.</p></div><div className="footer-nav"><a href="#series">Series</a><a href="#schedule">Schedule</a><a href="#ranking">Ranking</a><a href="#about">About</a></div><div className="socials"><span>FOLLOW THE SERIES</span><div><SocialIcon src={instagram} label="Instagram" /><SocialIcon src={youtube} label="YouTube" /><SocialIcon src={facebook} label="Facebook" /><SocialIcon src={xLogo} label="X" /></div></div><div className="copyright">© 2025 KSOP · ALL RIGHTS RESERVED</div></footer>
    </main>
  )
}
