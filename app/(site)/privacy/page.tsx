import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '개인정보처리방침',
  description: 'KSOP 개인정보처리방침. KSOP privacy policy.',
  alternates: { canonical: '/privacy' },
}

export default function PrivacyPage() {
  return (
    <section className="section-pad">
      <div className="section-top">
        <div>
          <div className="section-label">PRIVACY</div>
          <h1>개인정보처리방침</h1>
        </div>
      </div>
      <p className="large-copy" style={{ maxWidth: '68ch' }}>
        KSOP는 제휴 및 문의 응대를 위해 필요한 최소한의 개인정보를 처리합니다.
        수집 항목은 이름, 연락처, 이메일, 문의 내용이며, 수집 목적은 제휴 및 문의 응대입니다.
        서비스 운영을 위해 호스팅, 데이터베이스 등 외부 서비스 제공업체가
        KSOP를 대신하여 정보를 처리할 수 있으며,
        구체적인 처리위탁 업체와 범위는 운영 확정 후 개인정보처리방침에 명시합니다.
      </p>
      <p className="large-copy" style={{ maxWidth: '68ch', marginTop: '16px' }}>
        개인정보는 수집 목적 달성 및 관련 법령상 필요한 범위에서만 보관하며,
        구체적인 보관 기간은 운영 정책 확정 후 공개합니다.
      </p>
      <p className="large-copy" style={{ maxWidth: '68ch', marginTop: '16px' }}>
        개인정보 관련 문의 채널은 운영 확정 후 본 페이지에 안내합니다.
      </p>
      <p className="muted-copy" role="status" style={{ marginTop: '16px' }}>
        본 페이지의 세부 처리방침은 운영 정책 및 개인정보 처리 구조 확정 후 업데이트됩니다.
      </p>
    </section>
  )
}
