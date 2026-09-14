'use client'

import Link from 'next/link'
import { slugifySeriesLabel } from '@/lib/series'
import type { ScheduleContent } from '@/lib/schedule-content'
import { SiteProvider, useSite } from '@/components/site/site-provider'
import { DetailHeader } from '@/components/site/detail-header'

type DetailSection = 'schedule' | 'event' | 'ranking' | 'news' | 'about'

type DetailPageProps = {
  section: DetailSection
  scheduleContent?: ScheduleContent
}

export default function DetailPage(props: DetailPageProps) {
  return (
    <SiteProvider>
      <DetailInner {...props} />
    </SiteProvider>
  )
}

function DetailInner({ section, scheduleContent }: DetailPageProps) {
  const { darkMode, t } = useSite()
  const locale = t.detail[section]
  const activeHref = section === 'event' ? '/events' : `/${section}`

  // Schedule with CMS content renders real series rows.
  // All other legacy sections render a factual pending state — never invented names or figures.
  if (section === 'schedule' && scheduleContent) {
    return (
      <main className={`detail-page schedule-detail ${darkMode ? 'theme-dark' : ''}`}>
        <DetailHeader activeHref={activeHref} />
        <section className="detail-hero">
          <div className="detail-kicker">{locale.kicker}</div>
          <div className="detail-hero-grid"><h1>{locale.title}</h1><p>{locale.intro}</p></div>
        </section>
        <section className="detail-list" aria-label={`${locale.title} details`}>
          {scheduleContent.items.map((item, index) => (
            <Link
              className="detail-row"
              key={`${item.label}-${index}`}
              style={item.image ? { backgroundImage: `linear-gradient(90deg, rgba(7, 12, 22, .92) 0%, rgba(7, 12, 22, .58) 48%, rgba(7, 12, 22, .18) 100%), url(${item.image})` } : undefined}
              href={`/schedule/${slugifySeriesLabel(item.label)}`}
              aria-label={`${item.label.trim()} series detail`}
            >
              <h2>{item.label}</h2>
            </Link>
          ))}
        </section>
        <footer className="detail-footer"><span>THE KOREA SERIES OF POKER · 2026</span><Link href="/">{t.detail.backHome}</Link></footer>
      </main>
    )
  }

  return (
    <main className={`detail-page ${darkMode ? 'theme-dark' : ''}`}>
      <DetailHeader activeHref={activeHref} />
      <section className="detail-hero">
        <div className="detail-kicker">{locale.kicker}</div>
        <div className="detail-hero-grid"><h1>{locale.title}</h1><p>{locale.intro}</p></div>
      </section>
      <section className="detail-list" aria-label={`${locale.title} details`}>
        <p className="muted-copy" role="status">{t.detail.pending}</p>
      </section>
      <footer className="detail-footer"><span>THE KOREA SERIES OF POKER · 2026</span><Link href="/">{t.detail.backHome}</Link></footer>
    </main>
  )
}
