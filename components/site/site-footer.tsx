'use client'

import Link from 'next/link'
import { useSite } from '@/components/site/site-provider'
import { SnsDock } from '@/components/effects/sns-dock'
import { NAV_ROUTES, socials } from '@/lib/nav'

function SocialIcon({ name, src }: { name: string; src: string }) {
  return (
    <SnsDock name={name} ariaLabel={name}>
      <img src={src} alt="" />
    </SnsDock>
  )
}

export function SiteFooter() {
  const { t, darkMode } = useSite()
  const logo = darkMode ? '/images/ksop-dark-approved.png' : '/images/ksop-light-approved.png'

  return (
    <footer className="site-footer" id="social">
      <div>
        <img className="footer-logo" src={logo} alt="KSOP Korea Series of Poker" width={160} height={54} />
        <p className="footer-note">
          {t.footerLine1 ?? "Korea's premier live poker series."}
          <br />
          {t.footerLine2 ?? 'Designed for the game.'}
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
