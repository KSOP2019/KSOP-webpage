import type { Metadata } from 'next'
import { PartnersPageClient } from '@/components/site/partners-page-client'

export const revalidate = 120

export const metadata: Metadata = {
  title: '파트너',
  description: 'KSOP 공식 파트너 — KSOP와 함께하는 기업과 기관을 확인합니다.',
  alternates: { canonical: '/partners' },
}

export default function PartnersPage() {
  return <PartnersPageClient />
}
