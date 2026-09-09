'use client'

import Link from 'next/link'
import { Globe2, Menu, X } from 'lucide-react'
import { useState } from 'react'

const LIGHT_LOGO = '/images/ksop-light-approved.png'
const DARK_LOGO = '/images/ksop-dark-approved.png'

const nav = [
  ['SCHEDULE', '/schedule'],
  ['EVENT', '/events'],
  ['RANKING', '/ranking'],
  ['NEWS', '/news'],
  ['ABOUT', '/about'],
] as const

export function StandaloneDetailHeader({ activeHref }: { activeHref?: string }) {
  const [language, setLanguage] = useState('KR')
  const [dark, setDark] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="site-header detail-header">
      <Link href="/" className="brand">
        <img
          src={dark ? DARK_LOGO : LIGHT_LOGO}
          alt="KSOP Korea Series of Poker"
          width={180}
          height={60}
        />
      </Link>
      <nav className={menuOpen ? 'nav-links is-open' : 'nav-links'}>
        {nav.map(([label, href]) => (
          <Link
            key={href}
            href={href}
            className={activeHref === href ? 'active' : ''}
            onClick={() => setMenuOpen(false)}
          >
            {label}
          </Link>
        ))}
      </nav>
      <div className="header-socials header-socials--placeholder" aria-hidden="true" />
      <div className="detail-actions header-actions">
        <details className="language-menu">
          <summary className="language" aria-label={`Current language: ${language}`}>
            <Globe2 aria-hidden="true" />
            <span className="language-code">{language}</span>
          </summary>
          <div className="language-options">
            {['EN', 'KR', 'JP', 'CN'].map((code) => (
              <button key={code} type="button" onClick={() => setLanguage(code)}>
                {code}
              </button>
            ))}
          </div>
        </details>
        <button
          className={dark ? 'theme-switch is-dark' : 'theme-switch'}
          onClick={() => setDark((value) => !value)}
          aria-label="Toggle theme"
          aria-pressed={dark}
          type="button"
        >
          <span className="theme-sun" aria-hidden="true">☀</span>
          <span className="theme-track">
            <span />
          </span>
          <span className="theme-moon" aria-hidden="true">☾</span>
        </button>
        <button
          className="menu-toggle"
          onClick={() => setMenuOpen((value) => !value)}
          aria-label="Toggle menu"
          type="button"
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  )
}
