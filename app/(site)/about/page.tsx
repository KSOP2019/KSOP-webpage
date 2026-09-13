import type { Metadata } from 'next'
import { AboutHub } from '@/components/site/about-hub'

export const revalidate = 120

export const metadata: Metadata = {
  title: '소개',
  description: 'KSOP 회사 소개, 연혁, 비전, 파트너십 및 MICE·기업홍보·미디어·협찬 신청 안내.',
  alternates: { canonical: '/about' },
}

export default function AboutPage() {
  return <AboutHub />
}
