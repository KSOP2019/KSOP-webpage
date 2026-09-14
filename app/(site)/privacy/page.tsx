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
        KSOP는 제휴·문의 응대를 위해 최소한의 개인정보(이름, 연락처, 이메일, 문의 내용)만을 수집하며,
        수집 목적 외 이용·제3자 제공을 하지 않습니다. 보관 기간 경과 시 지체 없이 파기합니다.
        개인정보 관련 문의는 공식 채널을 통해 접수해 주세요.
      </p>
      <p className="muted-copy" role="status" style={{ marginTop: '16px' }}>
        상세 처리방침은 운영 확정 시 공개됩니다. PII는 URL에 포함하지 않으며 로그에 원문을 기록하지 않습니다.
      </p>
    </section>
  )
}
