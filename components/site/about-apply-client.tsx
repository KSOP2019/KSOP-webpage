'use client'

import Link from 'next/link'
import { useSite } from '@/components/site/site-provider'
import { Reveal } from '@/components/site/reveal'
import { seedContent } from '@/lib/seed'
import { APPLY_FORM_SPECS } from '@/lib/about-data'
import type { CooperationId } from '@/lib/about-data'
import { AboutApplicationForm } from '@/components/site/about-application-form'
import './about-hub.css'

/** Resolves the localized form copy with KR-seed fallback on shape drift. */
export function AboutApplyClient({ type }: { type: CooperationId }) {
  const { t, language } = useSite()
  const seedForms = seedContent.copy[language].about?.forms ?? seedContent.copy.KR.about?.forms
  const copy = t.about?.forms[type] ?? seedForms?.[type]
  const fallback = seedContent.copy.KR.about?.forms[type]
  const resolved = copy ?? fallback
  if (!resolved) return null

  const spec = APPLY_FORM_SPECS[type]
  const fields =
    resolved.fields.length === spec.length
      ? resolved.fields
      : (fallback?.fields ?? []).length === spec.length
        ? (fallback?.fields ?? [])
        : spec.map((field) => ({ label: field.name }))

  return (
    <>
      <section className="section-pad about-hub">
        <Reveal>
          <div className="section-top">
            <div>
              <div className="section-label">{resolved.title}</div>
              <h2>{resolved.title}</h2>
            </div>
          </div>
          <p className="large-copy" style={{ maxWidth: '64ch' }}>
            {resolved.description}
          </p>
          <AboutApplicationForm spec={spec} copy={resolved} fields={fields} />
        </Reveal>
      </section>
      <section className="section-pad about-hub">
        <Link className="text-link" href="/about">
          ← /about
        </Link>
      </section>
    </>
  )
}
