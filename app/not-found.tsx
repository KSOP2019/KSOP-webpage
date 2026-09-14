import Link from 'next/link'

export default function NotFound() {
  return (
    <section className="section-pad">
      <div className="section-top">
        <div>
          <div className="section-label">404</div>
          <h1>페이지를 찾을 수 없습니다</h1>
        </div>
      </div>
      <p className="large-copy">요청하신 주소가 존재하지 않거나 이동되었습니다.</p>
      <div style={{ marginTop: '20px', display: 'flex', gap: '16px' }}>
        <Link className="text-link" href="/">
          홈으로 돌아가기
        </Link>
        <Link className="text-link" href="/events">
          이벤트 목록으로 이동
        </Link>
      </div>
    </section>
  )
}
