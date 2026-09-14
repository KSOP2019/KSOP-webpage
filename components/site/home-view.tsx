'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUpRight, Check, ChevronDown } from 'lucide-react'
import { useSite } from '@/components/site/site-provider'
import { Reveal } from '@/components/site/reveal'
import { GlassCard } from '@/components/ui/glass-card'
import { KineticText } from '@/components/effects/kinetic-text'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { ParallaxImage } from '@/components/effects/parallax-image'
import { Spotlight } from '@/components/effects/spotlight'
import { EVENT_CATEGORIES } from '@/lib/nav'
import { eventCardImage, realPhotoOrBlank } from '@/lib/event-images'
import { filterEvents } from '@/lib/event-filters'
import type { EventItem, NewsItem, PlayerItem, RankedPlayer } from '@/lib/types'

type HomeViewProps = {
  events: EventItem[]
  players: PlayerItem[]
  news: NewsItem[]
  ranked: RankedPlayer[]
}

export function HomeView({ events, players, news, ranked }: HomeViewProps) {
  const { content, t } = useSite()
  const [open, setOpen] = useState(-1)
  const [selectedDate, setSelectedDate] = useState('ALL')
  const [selectedCategory, setSelectedCategory] = useState('ALL EVENT')
  const [registered, setRegistered] = useState(false)
  const heroRef = useRef<HTMLElement | null>(null)
  const [mounted, setMounted] = useState(false)
  const [countdown, setCountdown] = useState({
    days: content.countdownDays,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Countdown uses confirmed series timing only; respects reduced-motion and hydration.
    if (typeof window === 'undefined') return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (reduced.matches) return
    const timer = window.setInterval(() => {
      setCountdown((current) => {
        const total = ((current.days * 24 + current.hours) * 60 + current.minutes) * 60 + current.seconds - 1
        const safe = Math.max(total, 0)
        return {
          days: Math.floor(safe / 86400),
          hours: Math.floor((safe % 86400) / 3600),
          minutes: Math.floor((safe % 3600) / 60),
          seconds: safe % 60,
        }
      })
    }, 1000)
    return () => window.clearInterval(timer)
  }, [])

  const countdownText = mounted
    ? `${String(countdown.days).padStart(2, '0')}D : ${String(countdown.hours).padStart(2, '0')}H : ${String(countdown.minutes).padStart(2, '0')}M : ${String(countdown.seconds).padStart(2, '0')}S`
    : `${String(content.countdownDays).padStart(2, '0')}D : 00H : 00M : 00S`
  const dates = Array.from(new Set(events.map((event) => event.date)))
  const visibleEvents = useMemo(
    () => filterEvents(events, selectedCategory, selectedDate).slice(0, 12),
    [events, selectedCategory, selectedDate],
  )

  // Documentary imagery: real KSOP photos only (/images/real/).
  // Anything else falls back to solid black + typography — never AI filler.
  const heroPhoto = realPhotoOrBlank(content.heroImage)
  const venueLine = content.seriesVenue && content.seriesVenue !== 'TBA' ? content.seriesVenue : ''
  const dateLine = content.seriesDate && content.seriesDate !== 'TBA' ? content.seriesDate : ''
  const gtdLine = content.seriesGtd && content.seriesGtd !== 'TBA' ? content.seriesGtd : t.tba

  return (
    <>
      <section className="hero" id="top" ref={heroRef}>
        <Spotlight containerRef={heroRef} />
        <div className="hero-copy">
          <div className="hero-title-box">
            <p className="eyebrow">{t.eyebrow}</p>
            <h1>
              <KineticText text={t.hero} />
            </h1>
          </div>
        </div>

        <div className="hero-visual" style={heroPhoto ? undefined : { background: '#000' }}>
          {heroPhoto ? (
            <ParallaxImage>
              <img
                src={heroPhoto}
                alt="KSOP tournament arena"
                fetchPriority="high"
                decoding="async"
                width={1600}
                height={900}
                style={{ width: '100%', height: 'auto', aspectRatio: '16 / 9' }}
              />
            </ParallaxImage>
          ) : null}
          <div className="hero-stamp">
            {dateLine ? <span>{dateLine}</span> : null}
            <span>{t.posterMonth}</span>
            <div className="poster-details">
              {venueLine ? <span className="poster-location">{venueLine}</span> : null}
              <small>{t.countdown} {countdownText}</small>
            </div>
          </div>
        </div>

        <div className="hero-lower-copy-row">
          <p className="hero-intro">{t.intro}</p>
          <div className="hero-actions">
            <MagneticButton>
              <button className="primary-cta" type="button" onClick={() => setRegistered(true)}>
                {registered ? (
                  <>
                    <Check /> {t.seatReserved}
                  </>
                ) : (
                  <>
                    {t.register} <ArrowUpRight />
                  </>
                )}
              </button>
            </MagneticButton>
            <Link className="text-link" href="/events">
              {t.explore} <ArrowUpRight />
            </Link>
          </div>
        </div>

        <div className="telemetry-grid">
          <GlassCard asChild>
            <div>
              <strong>{gtdLine}</strong>
              <span>{t.guaranteed}</span>
            </div>
          </GlassCard>
          <GlassCard asChild>
            <div>
              <strong>{t.invitation}</strong>
              <span>{t.buyin}</span>
            </div>
          </GlassCard>
          <GlassCard asChild>
            <div>
              <strong>{t.tba}</strong>
              <span>{t.stack}</span>
            </div>
          </GlassCard>
        </div>
      </section>

      <section className="intro section-pad" id="about">
        <div className="section-label">{t.seriesLabel}</div>
        <Reveal className="intro-content">
          <h2>
            {t.introTitle}
            <br />
            {t.introEmphasis}
          </h2>
          <p className="large-copy">{content.introBody}</p>
        </Reveal>
      </section>

      <section className="schedule-section section-pad" id="schedule">
        <div className="event-filters" role="tablist" aria-label="Event filters">
          {EVENT_CATEGORIES.map((category) => (
            <Link
              key={category}
              href={`/events?category=${encodeURIComponent(category)}`}
              className={selectedCategory === category ? 'is-active' : ''}
              onClick={() => {
                setSelectedCategory(category)
                setSelectedDate('ALL')
              }}
            >
              {category}
            </Link>
          ))}
        </div>

        <div className="section-top">
          <div>
            <div className="section-label">{t.scheduleLabel}</div>
            <h2>{t.schedule}</h2>
          </div>
          <div className="series-meta">
            <strong>{content.seriesDate}</strong>
            <span>{content.seriesVenue}</span>
            <span>{content.seriesGtd}</span>
          </div>
        </div>

        <div className="schedule-list">
          {visibleEvents.length === 0 ? (
            <p className="muted-copy" role="status">
              {t.noEvents}
            </p>
          ) : null}
          {visibleEvents.map((event, index) => (
            <article className={open === index ? 'schedule-item open' : 'schedule-item'} key={event.id}>
              <button className="schedule-trigger" type="button" onClick={() => setOpen(open === index ? -1 : index)}>
                <span className="date">
                  <strong>{event.date}</strong>
                  <span>{event.dayLabel}</span>
                </span>
                {eventCardImage(event) ? (
                  <img
                    src={eventCardImage(event)}
                    alt=""
                    loading="lazy"
                    style={{ width: 56, height: 56, borderRadius: 10, objectFit: 'cover', flex: '0 0 56px' }}
                  />
                ) : null}
                <span className="event-title">
                  <b>{event.name}</b>
                  <small>
                    {event.type} · {t.buyin} {event.buyInType} · {event.gtd} GTD
                  </small>
                </span>
                <span className="event-type">{event.type}</span>
                <ChevronDown className="chevron" />
                <span className="glass event-buyin-tip" data-glass="popover" aria-hidden="true">
                  {t.buyin} {event.buyInType}
                </span>
              </button>
              {open === index && (
                <div className="event-detail">
                  <div className="detail-facts">
                    <div>
                      <span>{t.factChips}</span>
                      <strong>{event.startingChips.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span>{t.factLate}</span>
                      <strong>{event.lateReg}</strong>
                    </div>
                    <div>
                      <span>{t.factLevel}</span>
                      <strong>{event.levelTime}</strong>
                    </div>
                    <div>
                      <span>{t.factType}</span>
                      <strong>{event.type}</strong>
                    </div>
                  </div>
                  <div className="detail-actions">
                    <Link className="primary-cta" href={`/events/${event.id}`}>
                      {t.viewEvent} <ArrowUpRight />
                    </Link>
                    <button className="ghost-button" type="button" onClick={() => setRegistered(true)}>
                      {t.registerShort}
                    </button>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>

        <div style={{ marginTop: '24px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <Link className="text-link" href="/events">
            {t.viewAllEvents} <ArrowUpRight />
          </Link>
          <Link className="text-link" href="/schedule">
            {t.exploreSchedule} <ArrowUpRight />
          </Link>
        </div>
      </section>

      <section className="ranking-section section-pad" id="ranking">
        <div className="section-top">
          <div>
            <div className="section-label">{t.rankingLabel}</div>
            <h2>{t.ranking}</h2>
          </div>
          <Link className="text-link" href="/ranking">
            {t.fullRanking} <ArrowUpRight />
          </Link>
        </div>

        {ranked.length === 0 ? (
          <p className="muted-copy" role="status">
            {t.rankingPreparing}
          </p>
        ) : (
          <>
            <Reveal className="podium-grid">
              {ranked.slice(0, 3).map((player) => (
                <Link href={`/ranking/${player.playerId}`} className={`podium-card place-0${player.rank}`} key={player.playerId}>
                  <div className="podium-glow" />
                  <span className="podium-rank">{player.rank}</span>
                  <div className="podium-medal">
                    <span>{player.rank}</span>
                  </div>
                  {realPhotoOrBlank(player.portrait) ? (
                    <img className="podium-portrait" src={realPhotoOrBlank(player.portrait)} alt={`${player.name} portrait`} />
                  ) : null}
                  <strong className="player-name">{player.name}</strong>
                  <span className="podium-country">{player.country} · KSOP RANKING</span>
                  <b>{player.score}</b>
                  <span className="text-link">{t.viewProfile} <ArrowUpRight /></span>
                </Link>
              ))}
            </Reveal>

            <div className="ranking-table" style={{ marginTop: '24px' }}>
              {ranked.slice(3, 4).map((player) => (
                <Link className="player-row" href={`/ranking/${player.playerId}`} key={player.playerId}>
                  <span className="rank">#{player.rank}</span>
                  <strong className="player-name">{player.name}</strong>
                  <span>{player.country}</span>
                  <span>{player.score}</span>
                </Link>
              ))}
            </div>
          </>
        )}
      </section>

      <section className="news-section section-pad" id="news">
        <div className="section-top">
          <div>
            <div className="section-label">{t.newsLabel}</div>
            <h2>{t.news}</h2>
          </div>
          <Link className="text-link" href="/news">
            {t.allNews} <ArrowUpRight />
          </Link>
        </div>
        <Reveal className="news-grid">
          {news.length === 0 ? (
            <p className="muted-copy" role="status">
              {t.newsPreparing}
            </p>
          ) : (
            news.slice(0, 3).map((item) => (
              <article key={item.slug}>
                <span>
                  {item.date} · {item.category}
                </span>
                <h3>{item.title}</h3>
                <Link className="text-link" href={`/news/${item.slug}`}>
                  {t.readStory} <ArrowUpRight />
                </Link>
              </article>
            ))
          )}
        </Reveal>
      </section>

      <section className="image-break" style={{ background: '#000' }}>
        <div className="image-break-copy">
          <span>{t.seriesLabel}</span>
          <h2>
            {t.introTitle}
            <br />
            {t.introEmphasis}
          </h2>
          <button className="button-link" type="button" onClick={() => setRegistered(true)}>
            {registered ? t.seatReserved : t.register} <ArrowUpRight />
          </button>
        </div>
      </section>
    </>
  )
}
