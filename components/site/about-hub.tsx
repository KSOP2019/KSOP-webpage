'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { useSite } from '@/components/site/site-provider'
import { Reveal } from '@/components/site/reveal'
import { GlassCard } from '@/components/ui/glass-card'
import { seedContent } from '@/lib/seed'
import {
  COOPERATION_HREFS,
  COOPERATION_IDS,
  companyMilestones,
  partners,
} from '@/lib/about-data'
import type { AboutCopy } from '@/lib/types'
import './about-hub.css'

function resolveAboutCopy(tAbout: AboutCopy | undefined, language: 'EN' | 'KR' | 'JP' | 'CN'): AboutCopy | undefined {
  return tAbout ?? seedContent.copy[language].about ?? seedContent.copy.EN.about
}

export function AboutHub() {
  const { t, language } = useSite()
  const a = resolveAboutCopy(t.about, language)
  if (!a) return null

  const milestones = a.milestones.length === companyMilestones.length ? a.milestones : companyMilestones
  const cooperations =
    a.cooperations.length === COOPERATION_IDS.length
      ? COOPERATION_IDS.map((id, index) => ({ id, ...a.cooperations[index], href: COOPERATION_HREFS[id] }))
      : COOPERATION_IDS.map((id) => ({ id, title: id, description: '', cta: '', href: COOPERATION_HREFS[id] }))

  return (
    <>
      {/* A. COMPANY INTRO */}
      <section className="section-pad about-hub">
        <Reveal>
          <div className="section-top">
            <div>
              <div className="section-label">{a.companyLabel}</div>
              <h2>{a.companyHeadline}</h2>
            </div>
          </div>
          <div className="about-hub-body">
            {a.companyBody.map((paragraph) => (
              <p key={paragraph.slice(0, 24)} className="large-copy">
                {paragraph}
              </p>
            ))}
          </div>
        </Reveal>
      </section>

      {/* B. HISTORY */}
      <section className="section-pad about-hub">
        <Reveal>
          <div className="section-top">
            <div>
              <div className="section-label">{a.historyLabel}</div>
              <h2>{a.historyLabel.replace(/^\d+\s*\/\s*/, '')}</h2>
            </div>
          </div>
          <div className="about-hub-timeline">
            {milestones.map((milestone) => (
              <div key={milestone.label} className="about-hub-milestone">
                <span className="about-hub-milestone-label">{milestone.label}</span>
                <h3>{milestone.title}</h3>
                <p>{milestone.description}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* C. WHAT WE DO */}
      <section className="section-pad about-hub">
        <Reveal>
          <div className="section-top">
            <div>
              <div className="section-label">{a.whatWeDoLabel}</div>
              <h2>{a.whatWeDoLabel.replace(/^\d+\s*\/\s*/, '')}</h2>
            </div>
          </div>
          <div className="detail-facts">
            {a.whatWeDoGroups.map((group) => (
              <GlassCard key={group.title} asChild>
                <div>
                  <span>{group.title}</span>
                  <ul className="about-hub-worklist">
                    {group.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </GlassCard>
            ))}
          </div>
        </Reveal>
      </section>

      {/* D. VISION / FUTURE */}
      <section className="section-pad about-hub">
        <Reveal>
          <div className="section-top">
            <div>
              <div className="section-label">{a.visionLabel}</div>
              <h2>{a.visionHeadline}</h2>
            </div>
          </div>
          <p className="large-copy" style={{ maxWidth: '68ch' }}>
            {a.visionBody}
          </p>
          <div className="detail-facts" style={{ marginTop: '28px' }}>
            {a.visionBullets.map((bullet) => (
              <div key={bullet}>
                <strong style={{ fontSize: '14px', fontWeight: 400 }}>{bullet}</strong>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* E. WORK WITH KSOP */}
      <section className="section-pad about-hub">
        <Reveal>
          <div className="section-top">
            <div>
              <div className="section-label">{a.workLabel}</div>
              <h2>{a.workHeadline}</h2>
            </div>
          </div>
          <div className="detail-facts">
            {cooperations.map((cooperation) => (
              <GlassCard key={cooperation.id}>
                <span>{cooperation.title}</span>
                <strong style={{ fontSize: '14px', fontWeight: 400, lineHeight: 1.6 }}>{cooperation.description}</strong>
                <Link className="text-link" href={cooperation.href} style={{ marginTop: 'auto', paddingTop: '12px' }}>
                  {cooperation.cta} <ArrowUpRight />
                </Link>
              </GlassCard>
            ))}
          </div>
        </Reveal>
      </section>

      {/* F. PARTNERS / SPONSORS */}
      <section className="section-pad about-hub">
        <Reveal>
          <div className="section-top">
            <div>
              <div className="section-label">{a.partnersLabel}</div>
              <h2>{a.partnersHeadline}</h2>
            </div>
            <p>{a.partnersPending}</p>
          </div>
          <div className="about-hub-partners">
            {partners.map((partner) => (
              <div key={partner.id} className="about-hub-partner">
                {partner.name}
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* G. CONTACT / APPLY CTA */}
      <section className="section-pad about-hub">
        <Reveal>
          <div className="section-top">
            <div>
              <div className="section-label">{a.contactLabel}</div>
              <h2>{a.contactHeadline}</h2>
            </div>
          </div>
          <p className="large-copy" style={{ maxWidth: '62ch' }}>
            {a.contactBody}
          </p>
          <div className="about-hub-cta-row">
            <Link className="primary-cta" href={COOPERATION_HREFS.sponsor}>
              {a.contactCta} <ArrowUpRight />
            </Link>
          </div>
          <p className="muted-copy" style={{ marginTop: '40px' }}>
            {a.seriesLinkNote}
          </p>
          <div className="about-hub-cta-row" style={{ marginTop: '14px' }}>
            <Link className="ghost-button" href="/about/series">
              KSOP SERIES
            </Link>
            <Link className="ghost-button" href="/about/venue">
              VENUE
            </Link>
          </div>
        </Reveal>
      </section>
    </>
  )
}
