'use client'

import Link from 'next/link'
import { useRef } from 'react'
import { ArrowUpRight, CalendarDays } from 'lucide-react'
import { useSite } from '@/components/site/site-provider'
import { Reveal } from '@/components/site/reveal'
import { GlassCard } from '@/components/ui/glass-card'
import { Spotlight } from '@/components/effects/spotlight'
import { eventCardImage, realPhotoOrBlank } from '@/lib/event-images'
import { getNavItems } from '@/lib/nav'
import type { EventItem, NewsItem, RankedPlayer } from '@/lib/types'

type HomeViewV2Props = {
  events: EventItem[]
  news: NewsItem[]
  ranked: RankedPlayer[]
}

export function HomeViewV2({ events, news, ranked }: HomeViewV2Props) {
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
            <h2>{label('/schedule')}</h2>
          </div>
          <Link className="text-link" href="/schedule">{t.exploreSchedule} <ArrowUpRight /></Link>
        </div>
        <Reveal className="home-series-panel premium-depth-card">
          <div className="home-series-copy">
            <span className="section-label">{t.seriesLabel}</span>
            <h3>{content.introTitle}</h3>
            <p className="large-copy">{content.introBody}</p>
          </div>
          <div className="home-fact-grid">
            <GlassCard asChild><div><span>{t.dateLabel}</span><strong>{content.seriesDate}</strong></div></GlassCard>
            <GlassCard asChild><div><span>{t.venueLabel}</span><strong>{content.seriesVenue}</strong></div></GlassCard>
            <GlassCard asChild><div><span>GTD</span><strong>{content.seriesGtd}</strong></div></GlassCard>
          </div>
        </Reveal>
      </section>

      <section className="section-pad home-section" id="events">
        <div className="section-top">
          <div>
            <div className="section-label">02 · {label('/events')}</div>
            <h2>{label('/events')}</h2>
          </div>
          <Link className="text-link" href="/events">{t.viewAllEvents} <ArrowUpRight /></Link>
        </div>

        {events.length === 0 ? (
          <GlassCard asChild>
            <div className="premium-empty-state" role="status">
              <span className="section-label">{t.eventsEmptyTitle}</span>
              <strong>{t.eventsEmptyBody}</strong>
              <Link className="text-link" href="/events">{t.viewAllEvents} <ArrowUpRight /></Link>
            </div>
          </GlassCard>
        ) : (
          <Reveal className="home-event-grid">
            {events.slice(0, 6).map((event) => {
              const image = eventCardImage(event)
              return (
                <Link href={`/events/${event.id}`} className="home-event-card premium-depth-card" key={event.id}>
                  <div className="home-event-media" style={image ? undefined : { background: '#0a0a0c' }}>
                    {image ? <img src={image} alt="" loading="lazy" /> : <span>{event.type}</span>}
                  </div>
                  <div className="home-event-copy">
                    <span>{event.date} · {event.dayLabel}</span>
                    <h3>{event.name}</h3>
                    <div className="home-event-meta"><span>{event.buyIn}</span><span>{event.gtd} GTD</span></div>
                    <span className="text-link">{t.viewEvent} <ArrowUpRight /></span>
                  </div>
                </Link>
              )
            })}
          </Reveal>
        )}
      </section>

      <section className="section-pad home-section" id="ranking">
        <div className="section-top">
          <div>
            <div className="section-label">03 · {label('/ranking')}</div>
            <h2>{label('/ranking')}</h2>
          </div>
          <Link className="text-link" href="/ranking">{t.fullRanking} <ArrowUpRight /></Link>
        </div>

        {ranked.length === 0 ? (
          <GlassCard asChild><div className="premium-empty-state"><strong>{t.rankingEmptyBody}</strong></div></GlassCard>
        ) : (
          <Reveal className="podium-grid">
            {ranked.slice(0, 3).map((player) => (
              <Link href={`/ranking/${player.playerId}`} className={`podium-card premium-depth-card place-0${player.rank}`} key={player.playerId}>
                <span className="podium-rank">{player.rank}</span>
                {realPhotoOrBlank(player.portrait) ? <img className="podium-portrait" src={realPhotoOrBlank(player.portrait)} alt={`${player.name} portrait`} /> : null}
                <strong className="player-name">{player.name}</strong>
                <span>{player.country}</span>
                <b>{player.score}</b>
                <span className="text-link">{t.viewProfile} <ArrowUpRight /></span>
              </Link>
            ))}
          </Reveal>
        )}
      </section>

      <section className="section-pad home-section" id="news">
        <div className="section-top">
          <div>
            <div className="section-label">04 · {label('/news')}</div>
            <h2>{label('/news')}</h2>
          </div>
          <Link className="text-link" href="/news">{t.allNews} <ArrowUpRight /></Link>
        </div>

        {news.length === 0 ? (
          <GlassCard asChild><div className="premium-empty-state"><strong>{t.newsEmptyBody}</strong></div></GlassCard>
        ) : (
          <Reveal className="premium-news-grid">
            {news.slice(0, 3).map((item, index) => (
              <Link href={`/news/${item.slug}`} className={`premium-news-card premium-depth-card${index === 0 ? ' is-featured' : ''}`} key={item.slug}>
                <span>{item.date} · {item.category}</span>
                <h3>{item.title}</h3>
                <p>{item.excerpt}</p>
                <span className="text-link">{t.readStory} <ArrowUpRight /></span>
              </Link>
            ))}
          </Reveal>
        )}
      </section>

      <section className="section-pad home-section" id="about">
        <div className="section-top">
          <div>
            <div className="section-label">05 · {label('/about')}</div>
            <h2>{label('/about')}</h2>
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
