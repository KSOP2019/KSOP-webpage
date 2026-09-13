'use client'

import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useSite } from '@/components/site/site-provider'
import { LanguageMenu, ThemeSwitch } from '@/components/site/header-controls'
import { getNavItems } from '@/lib/nav'

const LIGHT_LOGO = '/images/ksop-light-approved.png'
const DARK_LOGO = '/images/ksop-dark-approved.png'

/** Shared fixed-geometry detail header (Schedule/Events/Ranking/News/About + series pages). */
export function DetailHeader({ activeHref }: { activeHref?: string }) {
  const { t, darkMode } = useSite()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="site-header detail-header">
      <Link href="/" className="brand">
        <img
          src={darkMode ? DARK_LOGO : LIGHT_LOGO}
          alt="KSOP Korea Series of Poker"
          width={170}
          height={54}
        />
      </Link>
      <nav className={menuOpen ? 'nav-links is-open' : 'nav-links'}>
        {getNavItems(t.nav).map(({ href, label }) => {
          return (
            <Link
              key={href}
              href={href}
              className={activeHref === href ? 'active' : undefined}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          )
        })}
      </nav>
      <div className="header-right">
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
        <div className="detail-actions header-actions">
          <LanguageMenu />
          <ThemeSwitch />
          <button
            className="menu-toggle"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label="Toggle menu"
            type="button"
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  )
}
