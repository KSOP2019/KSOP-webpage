'use client'

import { useEffect, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { DEFAULT_KSOP_PARTNERS, normalizePartners, type KsopPartner } from '@/lib/partners'

export function PartnerLogoWall() {
  const [partners, setPartners] = useState<KsopPartner[]>(DEFAULT_KSOP_PARTNERS)

  useEffect(() => {
    let cancelled = false

    fetch('/api/partners', { cache: 'no-store' })
      .then((response) => response.ok ? response.json() : DEFAULT_KSOP_PARTNERS)
      .then((value) => {
        if (!cancelled) setPartners(normalizePartners(value))
      })
      .catch(() => undefined)

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="ksop-partners-section" aria-labelledby="ksop-partners-title">
      <div className="ksop-partners-heading">
        <span>OFFICIAL PARTNERS</span>
        <h2 id="ksop-partners-title">KSOP와 함께하는 파트너십</h2>
        <p>KSOP와 공식 협력 관계에 있는 파트너를 소개합니다.</p>
      </div>
      <div className="ksop-partners-grid">
        {partners.map((partner) => (
          <a
            className="ksop-partner-link"
            href={partner.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${partner.name} 공식 사이트로 이동`}
            key={`${partner.name}-${partner.url}`}
          >
            <span className="ksop-partner-logo-wrap">
              <img
                className="ksop-partner-logo"
                src={partner.logoUrl}
                alt={partner.logoAlt || partner.name}
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </span>
            <span className="ksop-partner-name">{partner.name}</span>
            <ArrowUpRight aria-hidden="true" />
          </a>
        ))}
      </div>
    </section>
  )
}
