'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Globe2, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useSite } from '@/components/site/site-provider'
import { NAV_ROUTES } from '@/lib/nav'
import type { Language } from '@/lib/types'

const LIGHT_LOGO = '/images/ksop-light-approved.png'
const DARK_LOGO = '/images/ksop-dark-approved.png'

export function SiteHeader() {
  const { language, setLanguage, darkMode, setDarkMode, t } = useSite()
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const logo = darkMode ? DARK_LOGO : LIGHT_LOGO

  return (
    <header className="site-header">
      <Link href="/" className="brand">
        <img src={logo} alt="KSOP Korea Series of Poker" width={180} height={60} />
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
          <summary className="language" aria-label={`Language ${language}`}>
            <Globe2 aria-hidden="true" />
            <span className="language-code">{language}</span>
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
