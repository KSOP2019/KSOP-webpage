'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Globe2, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useSite } from '@/components/site/site-provider'
import { NAV_ROUTES } from '@/lib/nav'
import type { Language } from '@/lib/types'

const LEGACY_LIGHT_LOGOS = new Set([
  '/images/ksop-logo-black.png',
  '/images/ksop-dark-logo.png',
  '/images/ksop-light-logo.svg',
])
const LEGACY_DARK_LOGOS = new Set([
  '/images/ksop-logo-white.png',
  '/images/ksop-dark-logo.svg',
])

export function SiteHeader() {
  const { language, setLanguage, darkMode, setDarkMode, content, t } = useSite()
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  const lightLogo = !content.logoBlack || LEGACY_LIGHT_LOGOS.has(content.logoBlack)
    ? '/images/ksop-light-logo.png'
    : content.logoBlack
  const darkLogo = !content.logoWhite || LEGACY_DARK_LOGOS.has(content.logoWhite)
    ? '/images/ksop-dark-logo.png'
    : content.logoWhite
  const logo = darkMode ? darkLogo : lightLogo

  return (
    <header className="site-header">
      <Link href="/" className="brand">
        <img src={logo} alt="KSOP Korea Series of Poker" />
      </Link>

      <nav className={menuOpen ? 'nav-links is-open' : 'nav-links'}>
        {t.nav.map((item, index) => {
          const href = NAV_ROUTES[index]
          const active = pathname === href || ((href as string) !== '/' && pathname.startsWith(href))
          return (
            <Link
              key={`${href}-${index}`}
              href={href}
              className={active ? 'is-active' : undefined}
              onClick={() => setMenuOpen(false)}
            >
              {item}
            </Link>
          )
        })}
      </nav>

      <div className="header-socials">
        {[['FLOPIN', 'F'], ['Instagram', '◎'], ['X', '𝕏'], ['Discord', '◌'], ['Facebook', 'f'], ['YouTube', '▶']].map(
          ([name, symbol]) => (
            <a className="social-icon social-text" key={name} href="/#social" aria-label={name}>
              <span aria-hidden="true">{symbol}</span>
              <span className="social-tooltip">
                {name === 'X' ? 'X SPACE' : name === 'Instagram' ? 'INSTAR GRAM' : name.toUpperCase()}
              </span>
            </a>
          ),
        )}
      </div>

      <div className="header-actions">
        <details className="language-menu">
          <summary className="language">
            <Globe2 /> {language}
          </summary>
          <div className="language-options">
            {(['EN', 'KR', 'JP', 'CN'] as Language[]).map((code) => (
              <button key={code} type="button" onClick={() => setLanguage(code)}>
                {code}
              </button>
            ))}
          </div>
        </details>

        <button
          className={darkMode ? 'theme-switch is-dark' : 'theme-switch'}
          type="button"
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-pressed={darkMode}
          onClick={() => setDarkMode(!darkMode)}
        >
          <span className="theme-sun" aria-hidden="true">☀</span>
          <span className="theme-track"><span /></span>
          <span className="theme-moon" aria-hidden="true">☾</span>
        </button>

        <button className="menu-toggle" aria-label="Toggle menu" type="button" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  )
}
