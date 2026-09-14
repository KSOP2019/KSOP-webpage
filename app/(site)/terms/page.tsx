import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '이용약관',
  description: 'KSOP 이용약관. KSOP terms of service.',
  alternates: { canonical: '/terms' },
}

export default function TermsPage() {
  return (
    <section className="section-pad">
      <div className="section-top">
        <div>
          <div className="section-label">TERMS</div>
          <h1>이용약관</h1>
        </div>
      </div>
      <p className="large-copy" style={{ maxWidth: '68ch' }}>
        KSOP 웹사이트는 대회·일정·랭킹·뉴스·소개 정보를 제공하며, 모든 일정·상금·결과는
        확정된 공식 공지에 한해 게시됩니다. 미확정 정보는 게시하지 않습니다.
      </p>
    </section>
  )
}
