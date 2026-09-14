'use client'

import Link from 'next/link'
import { SiteProvider, useSite } from '@/components/site/site-provider'

function NotFoundBody() {
  const { t } = useSite()
  return (
    <section className="section-pad">
      <div className="section-top">
        <div>
          <div className="section-label">404</div>
          <h1>{t.notFound.title}</h1>
        </div>
      </div>
      <p className="large-copy">{t.notFound.body}</p>
      <div style={{ marginTop: '20px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <Link className="text-link" href="/">
          {t.notFound.home}
        </Link>
        <Link className="text-link" href="/events">
          {t.notFound.events}
        </Link>
      </div>
    </section>
  )
}

export default function NotFound() {
  return (
    <SiteProvider>
      <NotFoundBody />
    </SiteProvider>
  )
}
