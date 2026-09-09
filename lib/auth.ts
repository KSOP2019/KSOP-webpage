import { cookies, headers } from 'next/headers'
import { createHash, createHmac, timingSafeEqual } from 'crypto'

export const ADMIN_COOKIE = 'ksop_admin_session'

export function getAdminPassword() {
  const pw = process.env.ADMIN_PASSWORD
  if (!pw) return null
  return pw
}

function sha256Hex(value: string): Buffer {
  return createHash('sha256').update(value, 'utf8').digest()
}

export function isValidAdminPassword(password: string) {
  const pw = getAdminPassword()
  if (!pw || typeof password !== 'string') return false
  try {
    // Fixed-length digests keep the comparison timing-safe for any input length.
    return timingSafeEqual(sha256Hex(password), sha256Hex(pw))
  } catch {
    return false
  }
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

// --- Login rate limiting -------------------------------------------------
// Best-effort, in-process protection: 5 failed attempts per 15 minutes per
// client (IP + user-agent hash). Serverless memory is not globally shared,
// so this is one layer only, not a distributed guarantee. No Redis/KV
// exists in this project; if one is added later, move this state there.

const LOGIN_RATE_WINDOW_MS = 15 * 60 * 1000
const LOGIN_RATE_MAX_FAILURES = 5
const LOGIN_RATE_MAP_CAP = 1000

type LoginAttempt = { failures: number; resetAt: number }

const loginAttempts = new Map<string, LoginAttempt>()

function pruneLoginAttempts(now: number) {
  for (const [key, entry] of loginAttempts) {
    if (entry.resetAt <= now) loginAttempts.delete(key)
  }
  while (loginAttempts.size > LOGIN_RATE_MAP_CAP) {
    const oldest = loginAttempts.keys().next()
    if (oldest.done) break
    loginAttempts.delete(oldest.value)
  }
}

export async function getLoginRateLimitKey(): Promise<string> {
  let ip = 'unknown'
  let userAgent = ''
  try {
    const headerStore = await headers()
    const forwarded = headerStore.get('x-forwarded-for')
    ip = (forwarded ? forwarded.split(',')[0].trim() : headerStore.get('x-real-ip') || 'unknown') || 'unknown'
    userAgent = headerStore.get('user-agent') || ''
  } catch {
    // Headers unavailable (e.g. unit context): fall back to a shared bucket.
  }
  const agentHash = createHash('sha256').update(userAgent, 'utf8').digest('hex').slice(0, 16)
  return `${ip}#${agentHash}`
}

export function loginRateLimitStatus(key: string): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now()
  pruneLoginAttempts(now)
  const entry = loginAttempts.get(key)
  if (entry && entry.failures >= LOGIN_RATE_MAX_FAILURES && entry.resetAt > now) {
    return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)) }
  }
  return { allowed: true, retryAfterSeconds: 0 }
}

export function loginRateLimitFail(key: string) {
  const now = Date.now()
  pruneLoginAttempts(now)
  const entry = loginAttempts.get(key)
  if (!entry || entry.resetAt <= now) {
    loginAttempts.set(key, { failures: 1, resetAt: now + LOGIN_RATE_WINDOW_MS })
    return
  }
  entry.failures += 1
}

export function loginRateLimitSuccess(key: string) {
  loginAttempts.delete(key)
}
