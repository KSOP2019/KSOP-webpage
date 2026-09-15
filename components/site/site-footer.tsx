'use client'

import Link from 'next/link'
import { useSite } from '@/components/site/site-provider'
import { SnsDock } from '@/components/effects/sns-dock'
import { getNavItems } from '@/lib/nav'
import { useSocialLinks } from '@/components/site/use-social-links'

const SOCIAL_ORDER = [
  ['FLOPIN', 'F'],
  ['Instagram', '◎'],
  ['X', '𝕏'],
  ['Discord', '◌'],
  ['Facebook', 'f'],
  ['YouTube', '▶'],
] as const

export function SiteFooter() {
  const { t, darkMode, language } = useSite()
  const socialLinks = useSocialLinks()
  const logo = darkMode ? '/images/ksop-dark-approved.png' : '/images/ksop-light-approved.png'

  return (
    <footer className="site-footer" id="social">
      <div>
        <img className="footer-logo" src={logo} alt="KSOP Korea Series of Poker" width={160} height={54} />
        <p className="footer-note">
          {t.footerLine1}
          <br />
          {t.footerLine2}
        </p>
      </div>
      <div className="footer-nav">
        {getNavItems(t.nav, language).map(({ href, label }) => (
          <Link href={href} key={href}>
            {label}
          </Link>
        ))}
      </div>
      <div className="socials">
        <span>{t.follow}</span>
        <div aria-label="KSOP social channels">
          {SOCIAL_ORDER.map(([name, symbol]) => {
            const href = socialLinks[name]
            if (!href) {
              return <span key={name} className="social-text is-disabled" aria-label={`${name} link not configured`} aria-disabled="true">{symbol}</span>
            }
            return (
              <SnsDock key={name} name={name} ariaLabel={name} href={href} className="social-text">
                <span aria-hidden="true">{symbol}</span>
              </SnsDock>
            )
          })}
        </div>
      </div>
      <div className="copyright">© 2026 KSOP · ALL RIGHTS RESERVED</div>
    </footer>
  )
}
