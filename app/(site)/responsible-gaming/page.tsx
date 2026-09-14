import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '책임 있는 게임',
  description: 'KSOP 책임 있는 게임 안내. Responsible gaming.',
  alternates: { canonical: '/responsible-gaming' },
}

export default function ResponsibleGamingPage() {
  return (
    <section className="section-pad">
      <div className="section-top">
        <div>
          <div className="section-label">RESPONSIBLE GAMING</div>
          <h1>책임 있는 게임</h1>
        </div>
      </div>
      <p className="large-copy" style={{ maxWidth: '68ch' }}>
        KSOP는 책임 있는 참여를 권장합니다. 본인의 한도 내에서 참여하고,
        도움이 필요하면 공인 상담 기관에 문의해 주세요.
      </p>
      <p className="large-copy" style={{ maxWidth: '68ch', marginTop: '16px' }}>
        연령을 포함한 참가 자격 기준은 각 이벤트의 공식 공지와 운영 규정에 따라 안내됩니다.
      </p>
    </section>
  )
}
