/**
 * About hub static data — preview only, no Supabase.
 *
 * Partners are neutral placeholders until real sponsors are confirmed;
 * swap `partners` with CMS rows later without touching components.
 * Form field *structure* (names, input kinds, required flags) lives here;
 * display labels/options are localized in `LocaleCopy.about.forms`.
 */

export type Partner = {
  id: string
  name: string
  logoUrl?: string
  website?: string
  category?: string
}

export type CompanyMilestone = {
  label: string
  title: string
  description: string
}

export type CooperationType = {
  id: 'mice' | 'corporate' | 'media' | 'sponsor'
  title: string
  description: string
  href: string
}

export type CooperationId = CooperationType['id']

export const COOPERATION_HREFS: Record<CooperationId, string> = {
  mice: '/about/apply/mice',
  corporate: '/about/apply/corporate',
  media: '/about/apply/media',
  sponsor: '/about/apply/sponsor',
}

export const COOPERATION_IDS: CooperationId[] = ['mice', 'corporate', 'media', 'sponsor']

/** Neutral placeholders — no fake company names or logos. */
export const partners: Partner[] = [
  { id: 'partner-01', name: 'PARTNER 01' },
  { id: 'partner-02', name: 'PARTNER 02' },
  { id: 'partner-03', name: 'PARTNER 03' },
  { id: 'partner-04', name: 'PARTNER 04' },
  { id: 'partner-05', name: 'PARTNER 05' },
  { id: 'partner-06', name: 'PARTNER 06' },
]

/** Fallback milestones (KR canonical). Localized copies come from locale `about`. */
export const companyMilestones: CompanyMilestone[] = [
  { label: 'BEGINNING', title: '시작', description: '포커 대회를 더 체계적이고 신뢰도 높은 방식으로 운영하기 위한 프로젝트에서 시작.' },
  { label: 'BUILD', title: '구축', description: '대회 운영 시스템, 선수 데이터, 라이브 타이머, 랭킹 구조를 단계적으로 구축.' },
  { label: 'EXPANSION', title: '확장', description: 'FLOPIN, PLAYPLACE, KSOP STUDIO, PLAYSOFT와 연결되는 포커 엔터테인먼트 구조로 확장.' },
  { label: 'NOW', title: '현재', description: '오프라인 대회와 디지털 플랫폼, 콘텐츠 제작, 파트너 비즈니스를 하나의 체계로 연결하는 단계.' },
  { label: 'NEXT', title: '다음', description: '국내를 넘어 아시아권 포커 이벤트·미디어·선수 생태계로 확장.' },
]

export type ApplyFieldKind = 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'date'

export interface ApplyFieldSpec {
  name: string
  kind: ApplyFieldKind
  required: boolean
  /** When true the field spans the full form width. */
  fullWidth?: boolean
  /** Key into the localized `options` map when kind is 'select'. */
  optionKey?: string
}

/**
 * Neutral form specs. Order matches `AboutFormCopy.fields` per locale;
 * labels/options are zipped by index with KR-seed fallback on mismatch.
 */
export const APPLY_FORM_SPECS: Record<CooperationId, ApplyFieldSpec[]> = {
  mice: [
    { name: 'organization', kind: 'text', required: true },
    { name: 'contactName', kind: 'text', required: true },
    { name: 'email', kind: 'email', required: true },
    { name: 'phone', kind: 'tel', required: true },
    { name: 'region', kind: 'text', required: false },
    { name: 'eventType', kind: 'select', required: false, optionKey: 'eventType' },
    { name: 'schedule', kind: 'text', required: false },
    { name: 'scale', kind: 'select', required: false, optionKey: 'scale' },
    { name: 'message', kind: 'textarea', required: true, fullWidth: true },
  ],
  corporate: [
    { name: 'company', kind: 'text', required: true },
    { name: 'brand', kind: 'text', required: false },
    { name: 'contactName', kind: 'text', required: true },
    { name: 'email', kind: 'email', required: true },
    { name: 'phone', kind: 'tel', required: true },
    { name: 'goal', kind: 'text', required: false },
    { name: 'channels', kind: 'select', required: false, optionKey: 'channels' },
    { name: 'period', kind: 'text', required: false },
    { name: 'budget', kind: 'select', required: false, optionKey: 'budget' },
    { name: 'message', kind: 'textarea', required: true, fullWidth: true },
  ],
  media: [
    { name: 'outlet', kind: 'text', required: true },
    { name: 'contactName', kind: 'text', required: true },
    { name: 'email', kind: 'email', required: true },
    { name: 'phone', kind: 'tel', required: true },
    { name: 'mediaType', kind: 'select', required: false, optionKey: 'mediaType' },
    { name: 'purpose', kind: 'text', required: false },
    { name: 'filming', kind: 'select', required: false, optionKey: 'filming' },
    { name: 'event', kind: 'text', required: false },
    { name: 'message', kind: 'textarea', required: true, fullWidth: true },
  ],
  sponsor: [
    { name: 'company', kind: 'text', required: true },
    { name: 'brand', kind: 'text', required: false },
    { name: 'contactName', kind: 'text', required: true },
    { name: 'email', kind: 'email', required: true },
    { name: 'phone', kind: 'tel', required: true },
    { name: 'kind', kind: 'select', required: false, optionKey: 'kind' },
    { name: 'mix', kind: 'text', required: false },
    { name: 'event', kind: 'text', required: false },
    { name: 'message', kind: 'textarea', required: true, fullWidth: true },
  ],
}

export function isCooperationId(value: string): value is CooperationId {
  return (COOPERATION_IDS as string[]).includes(value)
}
