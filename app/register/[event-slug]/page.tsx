import Link from 'next/link'

export default function RegisterPage() {
  return <main className="detail-page"><section className="detail-hero"><div className="detail-kicker">REGISTRATION</div><div className="detail-hero-grid"><h1>REGISTER</h1><p>Reserve your place at the next KSOP event.</p></div></section><footer className="detail-footer"><span>THE KOREA SERIES OF POKER · 2026</span><Link href="/events">VIEW EVENTS ↗</Link></footer></main>
}
