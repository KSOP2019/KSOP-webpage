'use client'

import Link from 'next/link'
import { useMemo, useRef } from 'react'
import { ArrowUpRight, CalendarDays, Trophy } from 'lucide-react'
import { useSite } from '@/components/site/site-provider'
import { Reveal } from '@/components/site/reveal'
import { GlassCard } from '@/components/ui/glass-card'
import { Spotlight } from '@/components/effects/spotlight'
import { eventCardImage, realPhotoOrBlank } from '@/lib/event-images'
import { getNavItems } from '@/lib/nav'
import { slugifySeriesLabel } from '@/lib/series'
import { buildRankingTrendSnapshot, type RankingTrend } from '@/lib/ranking-trend'
import type { ScheduleContent } from '@/lib/schedule-content'
import type { EventItem, NewsItem, RankedPlayer } from '@/lib/types'

type HomeViewV2Props = {
  events: EventItem[]
  news: NewsItem[]
  ranked: RankedPlayer[]
  scheduleContent: ScheduleContent
}

function playerInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function movementText(trend?: RankingTrend): string {
  if (!trend || trend.previousRank == null || trend.direction === 'same') return '—'
  if (trend.direction === 'new') return 'NEW'
  return trend.change > 0 ? `▲${trend.change}` : `▼${Math.abs(trend.change)}`
}

function movementClass(trend?: RankingTrend): string {
  if (!trend) return 'is-same'
  if (trend.direction === 'up') return 'is-up'
  if (trend.direction === 'down') return 'is-down'
  if (trend.direction === 'new') return 'is-new'
  return 'is-same'
}

function HomeSectionDivider() {
  return (
    <div
      aria-hidden="true"
      style={{
        height: 1,
        margin: '0 154px',
        background: 'var(--border)',
        opacity: 0.82,
      }}
    />
  )
}

export function HomeViewV2({ events, news, ranked, scheduleContent }: HomeViewV2Props) {
  const { content, t, copy, language } = useSite()
  const heroRef = useRef<HTMLElement | null>(null)
  const nav = getNavItems(t.nav, language)
  const label = (href: string) => nav.find((item) => item.href === href)?.label ?? href.replace('/', '').toUpperCase()
  const heroPhoto = realPhotoOrBlank(content.heroImage) || '/images/ksop-hero-arena.png'
  const about = copy.about
  const heroWords = t.hero.trim().split(/\s+/).filter(Boolean)
  const heroTitleParts = language === 'KR' && heroWords.length > 1
    ? [heroWords[0], heroWords.slice(1).join(' ')]
    : [t.hero]
  const heroPrimaryLabel = language === 'KR' && t.explore === '이벤트 보기' ? '이벤트 확인' : t.explore
  const rankingSnapshot = useMemo(() => buildRankingTrendSnapshot(ranked), [ranked])
  const homeTop3 = ranked.slice(0, 3)
  const homeTop3Visual = homeTop3.length === 3 ? [homeTop3[1], homeTop3[0], homeTop3[2]] : homeTop3
  const upcomingSeries = scheduleContent.items.filter((item) => item.status !== 'past').slice(0, 6)
  const importantEvents = events
    .filter((event) => event.type === 'MAIN EVENT' || event.type === 'HIGH ROLLER')
    .slice(0, 6)
  const latestNews = useMemo(
    () => [...news].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3),
    [news],
  )

  return (
    <>
      <section className="hero premium-hero" id="top" ref={heroRef}>
        <Spotlight containerRef={heroRef} />

        <div className="hero-visual premium-poster">
          <img src={heroPhoto} alt="KSOP tournament arena" fetchPriority="high" decoding="async" width={1920} height={1080} />
          <div className="hero-stamp glass" data-glass="popover">
            <span>{content.seriesDate}</span>
            <strong>{content.seriesVenue}</strong>
            <small>{content.seriesGtd}</small>
          </div>
        </div>

        <div className="hero-copy">
          <div className="hero-title-box premium-depth-card">
            <p className="eyebrow">{t.eyebrow}</p>
            <h1 aria-label={t.hero}>
              {heroTitleParts.map((part, index) => (
                <span className="hero-title-line" key={`${part}-${index}`}>{part}</span>
              ))}
            </h1>
            <p className="hero-intro">{t.intro}</p>
            <div className="hero-actions">
              <Link className="primary-cta" href="/events">{heroPrimaryLabel} <ArrowUpRight /></Link>
              <Link className="hero-secondary-cta" href="/schedule">{label('/schedule')} <CalendarDays /></Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad home-section" id="schedule">
        <div className="section-top">
          <div>
            <div className="section-label">01 · {label('/schedule')}</div>
          </div>
          <Link className="text-link" href="/schedule">{t.exploreSchedule} <ArrowUpRight /></Link>
        </div>

        {upcomingSeries.length === 0 ? (
          <GlassCard asChild>
            <div className="premium-empty-state" role="status">
              <strong>{t.schedulePending}</strong>
            </div>
          </GlassCard>
        ) : (
          <Reveal className="home-event-grid">
            {upcomingSeries.map((series) => (
              <Link
                href={`/schedule/${slugifySeriesLabel(series.label)}`}
                className="home-event-card premium-depth-card"
                key={series.label}
              >
                <div
                  className="home-event-media"
                  style={{
                    height: 210,
                    minHeight: 210,
                    maxHeight: 210,
                    display: 'grid',
                    placeItems: 'center',
                    overflow: 'hidden',
                    padding: series.image ? 12 : 0,
                    background: series.image ? 'rgba(10, 10, 12, 0.035)' : '#0a0a0c',
                  }}
                >
                  {series.image ? (
                    <img
                      src={series.image}
                      alt=""
                      loading="lazy"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        objectPosition: 'center',
                      }}
                    />
                  ) : (
                    <span>KSOP SERIES</span>
                  )}
                </div>
                <div className="home-event-copy">
                  <span>{language === 'KR' ? 'UPCOMING SERIES · 일정' : 'UPCOMING SERIES'}</span>
                  <h3>{series.label}</h3>
                  {(series.dateRange || series.venue) ? (
                    <div className="home-event-meta">
                      {series.dateRange ? <span>{series.dateRange}</span> : null}
                      {series.venue ? <span>{series.venue}</span> : null}
                    </div>
                  ) : null}
                  <span className="text-link">{t.exploreSchedule} <ArrowUpRight /></span>
                </div>
              </Link>
            ))}
          </Reveal>
        )}
      </section>

      <HomeSectionDivider />

      <section className="section-pad home-section" id="events">
        <div className="section-top">
          <div>
            <div className="section-label">02 · {label('/events')}</div>
          </div>
          <Link className="text-link" href="/events">{t.viewAllEvents} <ArrowUpRight /></Link>
        </div>

        {importantEvents.length === 0 ? (
          <GlassCard asChild>
            <div className="premium-empty-state" role="status">
              <span className="section-label">MAIN EVENT · HIGH ROLLER</span>
              <strong>{t.eventsEmptyBody}</strong>
              <Link className="text-link" href="/events">{t.viewAllEvents} <ArrowUpRight /></Link>
            </div>
          </GlassCard>
        ) : (
          <Reveal className="schedule-list">
            {importantEvents.map((event) => {
              const image = eventCardImage(event)
              return (
                <Link
                  href={`/events/${event.id}`}
                  className="premium-depth-card"
                  key={event.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 18,
                    width: '100%',
                    padding: '18px 20px',
                    marginBottom: 12,
                    borderRadius: 18,
                    border: '1px solid var(--border)',
                    background: 'var(--glass-surface, rgba(255,255,255,.62))',
                    overflow: 'hidden',
                  }}
                >
                  {image ? (
                    <img src={image} alt="" loading="lazy" style={{ width: 72, height: 72, borderRadius: 14, objectFit: 'cover', flex: '0 0 72px' }} />
                  ) : (
                    <span style={{ width: 72, height: 72, borderRadius: 14, display: 'grid', placeItems: 'center', flex: '0 0 72px', background: '#0a0a0c', color: '#fff', fontSize: 10, letterSpacing: '.08em' }}>
                      {event.type}
                    </span>
                  )}
                  <span className="event-title" style={{ flex: '1 1 auto', minWidth: 0 }}>
                    <b>{event.name}</b>
                    <small>{event.date} · {event.dayLabel} · {event.type} · {t.buyin} {event.buyIn} · {event.gtd} GTD</small>
                  </span>
                  <ArrowUpRight className="chevron" aria-hidden="true" />
                </Link>
              )
            })}
          </Reveal>
        )}
      </section>

      <HomeSectionDivider />

      <section className="section-pad home-section" id="ranking">
        <div className="section-top">
          <div>
            <div className="section-label">03 · {label('/ranking')}</div>
          </div>
          <Link className="text-link" href="/ranking">{t.fullRanking} <ArrowUpRight /></Link>
        </div>

        {ranked.length === 0 ? (
          <GlassCard asChild><div className="premium-empty-state"><strong>{t.rankingEmptyBody}</strong></div></GlassCard>
        ) : (
          <Reveal className="ksop-home-ranking-grid">
            {homeTop3Visual.map((player) => {
              const portrait = realPhotoOrBlank(player.portrait)
              const trend = rankingSnapshot.trends.get(player.playerId)
              return (
                <Link
                  href={`/ranking/${player.playerId}`}
                  className={`ksop-home-rank-card rank-${player.rank}${player.rank === 1 ? ' is-champion' : ''}`}
                  key={player.playerId}
                >
                  <div className="ksop-home-rank-head">
                    <span className="ksop-home-rank-number"><Trophy />#{player.rank}</span>
                    <span className={`ksop-rank-movement ${movementClass(trend)}`}>{movementText(trend)}</span>
                  </div>
                  {portrait ? (
                    <img className="ksop-home-rank-portrait" src={portrait} alt={`${player.name} portrait`} loading="lazy" />
                  ) : (
                    <div className="ksop-home-rank-portrait is-fallback" aria-label={`${player.name} avatar`}>
                      <span>{playerInitials(player.name) || String(player.rank)}</span>
                    </div>
                  )}
                  <div className="ksop-home-rank-copy">
                    <span>{player.country} · KSOP PLAYER</span>
                    <strong>{player.name}</strong>
                    <b>{Number(player.score || 0).toLocaleString('en-US', { maximumFractionDigits: 2 })}<small> PTS</small></b>
                    <div className="ksop-home-rank-meta">
                      <span>{player.titles ?? 0}<small>TITLES</small></span>
                      <span>{player.finalTables ?? 0}<small>FINAL TABLES</small></span>
                    </div>
                    <span className="text-link">{t.viewProfile} <ArrowUpRight /></span>
                  </div>
                </Link>
              )
            })}
          </Reveal>
        )}
      </section>

      <HomeSectionDivider />

      <section className="section-pad home-section" id="news">
        <div className="section-top">
          <div>
            <div className="section-label">04 · {label('/news')}</div>
          </div>
          <Link className="text-link" href="/news">{t.allNews} <ArrowUpRight /></Link>
        </div>

        {latestNews.length === 0 ? (
          <GlassCard asChild><div className="premium-empty-state"><strong>{t.newsEmptyBody}</strong></div></GlassCard>
        ) : (
          <Reveal className="premium-news-grid">
            {latestNews.map((item, index) => {
              const isPreviewOnly = item.slug.startsWith('preview-home-news-')
              const newsHref = isPreviewOnly ? '/news' : `/news/${item.slug}`
              return (
                <Link href={newsHref} className={`premium-news-card premium-depth-card${index === 0 ? ' is-featured' : ''}`} key={item.slug}>
                  <span>{isPreviewOnly ? 'PREVIEW · ' : ''}{item.date} · {item.category}</span>
                  <h3>{item.title}</h3>
                  <p>{item.excerpt}</p>
                  <span className="text-link">{t.readStory} <ArrowUpRight /></span>
                </Link>
              )
            })}
          </Reveal>
        )}
      </section>

      <HomeSectionDivider />

      <section className="section-pad home-section" id="about">
        <div className="section-top">
          <div>
            <div className="section-label">05 · {label('/about')}</div>
          </div>
          <Link className="text-link" href="/about">{t.backToAbout || label('/about')} <ArrowUpRight /></Link>
        </div>

        <Reveal className="home-about-grid">
          <Link href="/about" className="home-about-card premium-depth-card">
            <span className="section-label">KSOP</span>
            <h3>{about?.companyHeadline || content.introTitle}</h3>
            <p>{about?.companyBody?.[0] || content.introBody}</p>
          </Link>
          <Link href="/about" className="home-about-card premium-depth-card">
            <span className="section-label">VISION</span>
            <h3>{about?.visionHeadline || content.imageBreakTitle}</h3>
            <p>{about?.visionBody || content.introBody}</p>
          </Link>
          <Link href="/about" className="home-about-card premium-depth-card">
            <span className="section-label">PARTNERS</span>
            <h3>{about?.partnersHeadline || 'Partnership & collaboration'}</h3>
            <p>{about?.contactBody || content.introBody}</p>
          </Link>
        </Reveal>
      </section>

      <HomeSectionDivider />

      <section className="image-break premium-brand-strip">
        <div className="image-break-copy">
          <span>{content.imageBreakLabel}</span>
          <h2>{content.imageBreakTitle}<br />{content.imageBreakEmphasis}</h2>
          <Link className="button-link" href="/about">{label('/about')} <ArrowUpRight /></Link>
        </div>
      </section>
    </>
  )
}
