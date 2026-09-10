'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ArrowUpRight, Check, ChevronDown, MapPin } from 'lucide-react'
import { useSite } from '@/components/site/site-provider'
import { Reveal } from '@/components/site/reveal'
import { EVENT_CATEGORIES } from '@/lib/nav'
import { eventCardImage } from '@/lib/event-images'
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
  const [countdown, setCountdown] = useState({
    days: content.countdownDays,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
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

  const countdownText = `${String(countdown.days).padStart(2, '0')}D : ${String(countdown.hours).padStart(2, '0')}H : ${String(countdown.minutes).padStart(2, '0')}M : ${String(countdown.seconds).padStart(2, '0')}S`
  const dates = Array.from(new Set(events.map((event) => event.date)))
  const visibleEvents = useMemo(
    () => filterEvents(events, selectedCategory, selectedDate).slice(0, 12),
    [events, selectedCategory, selectedDate],
  )

  return (
    <>
      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">{t.eyebrow}</p>
          <h1>{t.hero}</h1>
          <p className="hero-intro">{t.intro}</p>
        </div>

        <div className="hero-visual">
          <img src={content.heroImage} alt="KSOP tournament arena" />
          <div className="hero-stamp">
            <span>SEOUL</span>
            <strong>17</strong>
            <span>{t.posterMonth ?? 'NOVEMBER'}</span>
            <div className="poster-details">
              <a
                className="poster-location"
                href="https://www.google.com/maps/search/?api=1&query=Seoul+Grand+Hyatt"
                target="_blank"
                rel="noreferrer"
              >
                <MapPin /> SEOUL · GRAND HYATT
              </a>
              <small>{t.countdown ?? 'COUNTDOWN'} {countdownText}</small>
            </div>
          </div>
        </div>

        <div className="hero-bottom-stack">
          <div className="telemetry-grid">
            <div>
              <strong>₩1,500,000,000</strong>
              <span>{t.guaranteed}</span>
            </div>
            <div>
              <strong>{t.invitation}</strong>
              <span>{t.invitation}</span>
            </div>
            <div>
              <strong>50,000</strong>
              <span>{t.stack}</span>
            </div>
          </div>

          <div className="hero-actions">
            <button className="primary-cta" type="button" onClick={() => setRegistered(true)}>
              {registered ? (
                <>
                  <Check /> {t.seatReserved ?? 'SEAT RESERVED'}
                </>
              ) : (
                <>
                  {t.register} <ArrowUpRight />
                </>
              )}
            </button>
            <Link className="text-link" href="/events">
              {t.explore} <ArrowUpRight />
            </Link>
          </div>
        </div>
      </section>

      <section className="intro section-pad" id="about">
        <div className="section-label">{t.seriesLabel ?? '01 / THE SERIES'}</div>
        <Reveal className="intro-content">
          <h2>
            {t.introTitle ?? 'More than'}
            <br />
            <em>{t.introEmphasis ?? 'a tournament.'}</em>
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
            <div className="section-label">{t.scheduleLabel ?? '02 / UPCOMING SERIES'}</div>
            <h2>{t.schedule}</h2>
          </div>
          <div className="series-meta">
            <strong>{content.seriesDate}</strong>
            <span>{content.seriesVenue}</span>
            <span>{content.seriesGtd}</span>
          </div>
        </div>

        <div className="schedule-list">
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
                    {event.type} · {t.buyin ?? 'BUY-IN'} {event.buyInType} · {event.gtd} GTD
                  </small>
                </span>
                <span className="event-type">{event.type}</span>
                <ChevronDown className="chevron" />
              </button>
              {open === index && (
                <div className="event-detail">
                  <div className="detail-facts">
                    <div>
                      <span>{t.factChips ?? 'STARTING CHIPS'}</span>
                      <strong>{event.startingChips.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span>{t.factLate ?? 'LATE REG.'}</span>
                      <strong>{event.lateReg}</strong>
                    </div>
                    <div>
                      <span>{t.factLevel ?? 'LEVEL TIME'}</span>
                      <strong>{event.levelTime}</strong>
                    </div>
                    <div>
                      <span>{t.factType ?? 'TYPE'}</span>
                      <strong>{event.type}</strong>
                    </div>
                  </div>
                  <div className="detail-actions">
                    <Link className="primary-cta" href={`/events/${event.id}`}>
                      {t.viewEvent ?? 'View event'} <ArrowUpRight />
                    </Link>
                    <button className="ghost-button" type="button" onClick={() => setRegistered(true)}>
                      {t.registerShort ?? 'Register'}
                    </button>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>

        <div style={{ marginTop: '24px' }}>
          <Link className="text-link" href="/events">
            {t.viewAllEvents ?? 'View all events'} <ArrowUpRight />
          </Link>
        </div>
      </section>

      <section className="ranking-section section-pad" id="ranking">
        <div className="section-top">
          <div>
            <div className="section-label">{t.rankingLabel ?? '03 / PLAYER RANKING'}</div>
            <h2>{t.ranking}</h2>
          </div>
          <Link className="text-link" href="/ranking">
            {t.fullRanking ?? 'Full ranking'} <ArrowUpRight />
          </Link>
        </div>

        <Reveal className="podium-grid">
          {ranked.slice(0, 3).map((player) => (
            <Link href={`/ranking/${player.playerId}`} className={`podium-card place-0${player.rank}`} key={player.playerId}>
              <div className="podium-glow" />
              <span className="podium-rank">{player.rank}</span>
              <div className="podium-medal">
                <span>{player.rank}</span>
              </div>
              {player.portrait ? (
                <img className="podium-portrait" src={player.portrait} alt={`${player.name} portrait`} />
              ) : null}
              <strong className="player-name">{player.name}</strong>
              <span className="podium-country">{player.country} · KSOP RANKING</span>
              <b>{player.score}</b>
              <span className="text-link">{t.viewProfile ?? 'View profile'} <ArrowUpRight /></span>
            </Link>
          ))}
        </Reveal>

        <div className="ranking-table" style={{ marginTop: '24px' }}>
          {ranked.slice(3, 10).map((player) => (
            <Link className="player-row" href={`/ranking/${player.playerId}`} key={player.playerId}>
              <span className="rank">#{player.rank}</span>
              <strong className="player-name">{player.name}</strong>
              <span>{player.country}</span>
              <span>{player.score}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="news-section section-pad" id="news">
        <div className="section-top">
          <div>
            <div className="section-label">{t.newsLabel ?? '04 / FROM THE SERIES'}</div>
            <h2>{t.news}</h2>
          </div>
          <Link className="text-link" href="/news">
            {t.allNews ?? 'All news'} <ArrowUpRight />
          </Link>
        </div>
        <Reveal className="news-grid">
          {news.slice(0, 3).map((item) => (
            <article key={item.slug}>
              <span>
                {item.date} · {item.category}
              </span>
              <h3>{item.title}</h3>
              <Link className="text-link" href={`/news/${item.slug}`}>
                {t.readStory ?? 'Read the story'} <ArrowUpRight />
              </Link>
            </article>
          ))}
        </Reveal>
      </section>

      <section className="image-break">
        <img src={content.heroImage} alt="Poker tables inside the KSOP arena" />
        <div className="image-break-copy">
          <span>{content.imageBreakLabel}</span>
          <h2>
            {content.imageBreakTitle}
            <br />
            <em>{content.imageBreakEmphasis}</em>
          </h2>
          <button className="button-link" type="button" onClick={() => setRegistered(true)}>
            {registered ? (t.seatReserved ?? 'SEAT RESERVED') : t.register} <ArrowUpRight />
          </button>
        </div>
      </section>
    </>
  )
}
