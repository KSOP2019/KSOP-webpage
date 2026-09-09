import { NextResponse } from 'next/server'
import {
  ADMIN_COOKIE,
  getLoginRateLimitKey,
  isValidAdminPassword,
  loginRateLimitFail,
  loginRateLimitStatus,
  loginRateLimitSuccess,
  signToken,
} from '@/lib/auth'

export async function POST(request: Request) {
  const rateKey = await getLoginRateLimitKey()
  const limit = loginRateLimitStatus(rateKey)
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many login attempts. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
    )
  }

  let password: unknown = ''
  try {
    const body = await request.json()
    password = typeof body?.password === 'string' ? body.password : ''
  } catch {
    password = ''
  }

  if (!isValidAdminPassword(password as string)) {
    loginRateLimitFail(rateKey)
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  loginRateLimitSuccess(rateKey)
  const response = NextResponse.json({ ok: true })
  response.cookies.set(ADMIN_COOKIE, signToken('authenticated'), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
  return response
}
