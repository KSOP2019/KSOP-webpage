import { cookies } from 'next/headers'

export const ADMIN_COOKIE = 'ksop_admin_session'

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD ?? 'ksop-admin'
}

export function isValidAdminPassword(password: string) {
  return password === getAdminPassword()
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies()
  return cookieStore.get(ADMIN_COOKIE)?.value === 'authenticated'
}
