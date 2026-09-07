import { NextResponse } from 'next/server'
import { ADMIN_COOKIE, isValidAdminPassword } from '@/lib/auth'

export async function POST(request: Request) {
  const { password } = await request.json()

  if (!isValidAdminPassword(password)) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set(ADMIN_COOKIE, 'authenticated', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
  return response
}
