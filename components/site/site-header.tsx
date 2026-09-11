'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useSite } from '@/components/site/site-provider'
import { LanguageMenu, ThemeSwitch } from '@/components/site/header-controls'
import { SnsDock } from '@/components/effects/sns-dock'
import { NAV_ROUTES } from '@/lib/nav'

const LIGHT_LOGO = '/images/ksop-light-approved.png'
const DARK_LOGO = '/images/ksop-dark-approved.png'

export function SiteHeader() {
  const { darkMode, t } = useSite()
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const logo = darkMode ? DARK_LOGO : LIGHT_LOGO

  return (
    <header className="site-header glass" data-glass="header">
      <Link href="/" className="brand">
        <img src={logo} alt="KSOP Korea Series of Poker" width={170} height={54} />
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

      <div className="header-right">
        <div className="header-socials">
          {[['FLOPIN', 'F'], ['Instagram', '◎'], ['X', '𝕏'], ['Discord', '◌'], ['Facebook', 'f'], ['YouTube', '▶']].map(
            ([name, symbol]) => (
              <SnsDock key={name} name={name} ariaLabel={name} className="social-text">
                <span aria-hidden="true">{symbol}</span>
                <span className="social-tooltip">
                  {name === 'X' ? 'X SPACE' : name === 'Instagram' ? 'INSTAR GRAM' : name.toUpperCase()}
                </span>
              </SnsDock>
            ),
          )}
        </div>

        <div className="header-actions">
          <LanguageMenu />
          <ThemeSwitch />

          <button className="menu-toggle" aria-label="Toggle menu" type="button" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </header>
  )
}
