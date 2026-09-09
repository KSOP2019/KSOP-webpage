import type { Metadata } from 'next'
import { AboutPageClient } from '@/components/site/about-page-client'
import { getSiteContent } from '@/lib/data'

export const revalidate = 120

export const metadata: Metadata = {
  title: 'KSOP 소개',
  description: 'KSOP 소개 — 토너먼트를 넘어서. About the Korea Series of Poker.',
  alternates: { canonical: '/about' },
}

export default async function AboutPage() {
  const content = await getSiteContent()

  return <AboutPageClient content={content} />
}
