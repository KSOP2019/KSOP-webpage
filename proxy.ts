import { NextResponse, type NextRequest } from 'next/server'

const HERO_STAGE_CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://vercel.live https://*.vercel-insights.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co https://*.vercel-insights.com",
  "frame-src 'self'",
  "frame-ancestors 'self' https://ksophomepage.vercel.app",
  "form-action 'self'",
  "object-src 'none'",
  "base-uri 'self'",
].join('; ')

export function proxy(_request: NextRequest) {
  const response = NextResponse.next()
  response.headers.delete('X-Frame-Options')
  response.headers.set('Content-Security-Policy', HERO_STAGE_CSP)
  response.headers.set('Cache-Control', 'private, no-store, max-age=0')
  return response
}

export const config = {
  matcher: ['/hero-stage'],
}
