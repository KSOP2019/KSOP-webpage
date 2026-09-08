import { cookies } from 'next/headers'

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

export async function isAdminAuthenticated() {
  const cookieStore = await cookies()
  return cookieStore.get(ADMIN_COOKIE)?.value === 'authenticated'
}
