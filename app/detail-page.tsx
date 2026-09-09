'use client'

import Link from 'next/link'
import { slugifySeriesLabel } from '@/lib/series'
import type { ScheduleContent } from '@/lib/schedule-content'
import { SiteProvider, useSite } from '@/components/site/site-provider'
import { DetailHeader } from '@/components/site/detail-header'
import { detailCopy, type DetailSection } from '@/lib/seed'

const items = {
  schedule: [{ label: 'KSOP NAVER ENDING', image: '/images/schedule-warmup.png' }, { label: 'CROWN SERIES 11.22~28', image: '/images/schedule-plo.png' }, { label: 'YEAR FOR LAST 12.18~23', image: '/images/schedule-main-event.png' }, { label: 'CHAMPIONSHIP 12.27~30', image: '/images/schedule-high-roller.png' }],
  event: ['INVITATION', 'NLH POKER PLAYERS CHAMPIONSHIP', 'PLO NIGHT', 'MAIN EVENT'],
  ranking: ['01  JUN-HYUK LEE — ₩ 218,400,000', '02  DANIEL LIM — ₩ 164,800,000', '03  MIN-SEOK KIM — ₩ 129,500,000', '04  ALEX PARK — ₩ 98,200,000'],
  news: ['THE TABLE IS SET', 'A NEW STANDARD FOR LIVE POKER', 'SEOUL GRAND PRIX RECAP', 'THE PLAYERS TO WATCH'],
  about: ['DISCIPLINE MEETS INSTINCT', 'LIVE POKER IN KOREA', 'THE SERIES CONTINUES'],
} as const

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
  const { language, darkMode, t } = useSite()
  const locale = detailCopy[language][section]
  const page = section === 'schedule' && scheduleContent
    ? scheduleContent
    : { ...locale, items: items[section] }
  const activeHref = section === 'event' ? '/events' : `/${section}`

  return <main className={`detail-page ${section === 'schedule' ? 'schedule-detail' : ''} ${darkMode ? 'theme-dark' : ''}`}>
    <DetailHeader activeHref={activeHref} />
    <section className="detail-hero">
      <div className="detail-kicker">{page.kicker}</div>
      <div className="detail-hero-grid"><h1>{page.title}</h1><p>{page.intro}</p></div>
    </section>
    <section className="detail-list" aria-label={`${page.title} details`}>
      {page.items.map((item, index) => {
        const label = typeof item === 'string' ? item : item.label
        if (section === 'schedule' && typeof item !== 'string') {
          return <Link className="detail-row" key={`${label}-${index}`} style={{ backgroundImage: `linear-gradient(90deg, rgba(7, 12, 22, .92) 0%, rgba(7, 12, 22, .58) 48%, rgba(7, 12, 22, .18) 100%), url(${item.image})` }} href={`/schedule/${slugifySeriesLabel(item.label)}`} aria-label={`${label.trim()} series detail`}><h2>{label}</h2></Link>
        }
        return <article className="detail-row" key={`${label}-${index}`}>{section !== 'schedule' && <span>{String(index + 1).padStart(2, '0')}</span>}<h2>{label}</h2>{section !== 'schedule' && <span className="detail-arrow">↗</span>}</article>
      })}
    </section>
    <footer className="detail-footer"><span>THE KOREA SERIES OF POKER · 2026</span><Link href="/">{t.backHome ?? 'BACK TO HOME ↗'}</Link></footer>
  </main>
}
