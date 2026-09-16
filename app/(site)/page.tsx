import type { Metadata } from 'next'
import { HomeViewV2 } from '@/components/site/home-view-v2'
import { HeroCanvasRuntime } from '@/components/site/hero-canvas-runtime'
import { getEvents, getRankedPlayers } from '@/lib/data'
import { getHeroLayout } from '@/lib/hero-layout-store'
import { getNewsForPreview } from '@/lib/news-preview'
import { getScheduleContent } from '@/lib/schedule-content'
import { slugifySeriesLabel } from '@/lib/series'
import { SITE_DESCRIPTION } from '@/lib/site-url'

export const revalidate = 120

export const metadata: Metadata = {
  description: SITE_DESCRIPTION,
  alternates: { canonical: '/' },
}

export default async function HomePage() {
  const [events, news, ranked, scheduleContent, heroLayout] = await Promise.all([
    getEvents(),
    getNewsForPreview(),
    getRankedPlayers(10),
    getScheduleContent(),
    getHeroLayout(),
  ])

  const homeNews = news.filter((item) => item.published)
  const upcomingSeries = scheduleContent.items.filter((item) => item.status !== 'past')
  const heroSeries = upcomingSeries[0]
  const heroSeriesHref = heroSeries ? `/schedule/${slugifySeriesLabel(heroSeries.label)}` : '/schedule'

  return (
    <>
      <HeroCanvasRuntime
        initialLayout={heroLayout}
        seriesCount={upcomingSeries.length}
        seriesLabel={heroSeries?.label || 'KSOP SERIES'}
        seriesDate={heroSeries?.dateRange || '일정 추후 공개'}
        seriesLocation={heroSeries?.venue || '장소 추후 공개'}
        seriesHref={heroSeriesHref}
      />
      <HomeViewV2
        events={events}
        news={homeNews}
        ranked={ranked}
        scheduleContent={scheduleContent}
      />
    </>
  )
}
