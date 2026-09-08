import { cookies } from 'next/headers'
import { createHmac, timingSafeEqual } from 'crypto'

export const ADMIN_COOKIE = 'ksop_admin_session'

export function getAdminPassword() {
  const pw = process.env.ADMIN_PASSWORD
  if (!pw) return null
  return pw
}

export function isValidAdminPassword(password: string) {
  const pw = getAdminPassword()
  if (!pw) return false
  return password === pw
}

export function signToken(value: string): string {
  const secret = getAdminPassword()
  if (!secret) return ''
  const hmac = createHmac('sha256', secret)
  hmac.update(value)
  const signature = hmac.digest('hex')
  return `${value}:${signature}`
}

function verifyToken(token: string): boolean {
  const secret = getAdminPassword()
  if (!secret || !token || !token.includes(':')) return false
  const [value, signature] = token.split(':', 2)
  const expected = signToken(value).split(':', 2)[1]
  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  } catch {
    return false
  }
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies()
  const cookie = cookieStore.get(ADMIN_COOKIE)
  if (!cookie || !cookie.value) return false
  return verifyToken(cookie.value)
}
