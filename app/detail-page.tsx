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
  const { darkMode, t, language } = useSite()
  const locale = t.detail[section]
  const activeHref = section === 'event' ? '/events' : `/${section}`

  if (section === 'schedule' && scheduleContent) {
    const upcoming = scheduleContent.items.filter((item) => item.status !== 'past')
    const past = scheduleContent.items.filter((item) => item.status === 'past')
    const labels = {
      KR: { upcoming: '예정된 시리즈', past: '지난 시리즈', open: '시리즈 상세 보기' },
      EN: { upcoming: 'UPCOMING SERIES', past: 'PREVIOUS SERIES', open: 'View series' },
      JP: { upcoming: '開催予定シリーズ', past: '過去のシリーズ', open: 'シリーズ詳細' },
      CN: { upcoming: '即将举行的系列赛', past: '往期系列赛', open: '查看系列赛' },
    }[language]

    const renderCards = (items: ScheduleContent['items']) => (
      <div className="home-event-grid" style={{ marginTop: 18 }}>
        {items.map((item) => (
          <Link
            className="home-event-card premium-depth-card"
            key={item.label}
            href={`/schedule/${slugifySeriesLabel(item.label)}`}
            aria-label={`${item.label.trim()} series detail`}
          >
            <div className="home-event-media" style={item.image ? undefined : { background: '#0a0a0c' }}>
              {item.image ? <img src={item.image} alt="" loading="lazy" /> : <span>KSOP SERIES</span>}
            </div>
            <div className="home-event-copy">
              <span>{item.status === 'past' ? labels.past : labels.upcoming}</span>
              <h3>{item.label}</h3>
              {(item.dateRange || item.venue) ? (
                <div className="home-event-meta">
                  {item.dateRange ? <span>{item.dateRange}</span> : null}
                  {item.venue ? <span>{item.venue}</span> : null}
                </div>
              ) : null}
              <span className="text-link">{labels.open} ↗</span>
            </div>
          </Link>
        ))}
      </div>
    )

    return (
      <main className={`detail-page schedule-detail ${darkMode ? 'theme-dark' : ''}`}>
        <DetailHeader activeHref={activeHref} />
        <section className="detail-hero">
          <div className="detail-kicker">{scheduleContent.kicker || t.scheduleKicker || locale.kicker}</div>
          <div className="detail-hero-grid">
            <h1>{scheduleContent.title || locale.title}</h1>
            <p>{scheduleContent.intro || locale.intro}</p>
          </div>
        </section>

        <section className="detail-list" aria-label={`${locale.title} series`}>
          <div className="section-label">{labels.upcoming}</div>
          {upcoming.length > 0 ? renderCards(upcoming) : <p className="muted-copy" style={{ marginTop: 20 }}>{t.schedulePending}</p>}

          {past.length > 0 ? (
            <div style={{ marginTop: 64 }}>
              <div className="section-label">{labels.past}</div>
              {renderCards(past)}
            </div>
          ) : null}
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
