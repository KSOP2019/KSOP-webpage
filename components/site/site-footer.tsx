'use client'

import Link from 'next/link'
import { useSite } from '@/components/site/site-provider'
import { NAV_ROUTES, socials } from '@/lib/nav'

function SocialIcon({ name, src }: { name: string; src: string }) {
  return (
    <a className="social-icon" href="/#social" aria-label={name}>
      <img src={src} alt="" />
    </a>
  )
}

export function SiteFooter() {
  const { t, darkMode } = useSite()
  const logo = darkMode ? '/images/ksop-dark-logo.png' : '/images/ksop-light-logo.png'

  return (
    <footer className="site-footer" id="social">
      <div>
        <img className="footer-logo" src={logo} alt="KSOP Korea Series of Poker" />
        <p className="footer-note">
          Korea&apos;s premier live poker series.
          <br />
          Designed for the game.
        </p>
      </div>
      <div className="footer-nav">
        {t.nav.slice(0, 4).map((item, index) => (
          <Link href={NAV_ROUTES[index]} key={`${NAV_ROUTES[index]}-${index}`}>
            {item}
          </Link>
        ))}
      </div>
      <div className="socials">
        <span>{t.follow}</span>
        <div>
          {Object.entries(socials).map(([name, src]) => (
            <SocialIcon key={name} name={name} src={src} />
          ))}
        </div>
      </div>
      <div className="copyright">© 2026 KSOP · ALL RIGHTS RESERVED</div>
    </footer>
  )
}
