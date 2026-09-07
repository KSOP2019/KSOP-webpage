'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const links = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/content', label: 'Site Content' },
  { href: '/admin/events', label: 'Events' },
  { href: '/admin/players', label: 'Players' },
  { href: '/admin/news', label: 'News' },
]

export function AdminNav() {
  const pathname = usePathname()
  const router = useRouter()

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <aside className="admin-sidebar">
      <h1>KSOP ADMIN</h1>
      <nav className="admin-nav">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className={pathname === link.href ? 'is-active' : undefined}>
            {link.label}
          </Link>
        ))}
        <Link href="/">View site</Link>
        <button type="button" onClick={logout}>
          Logout
        </button>
      </nav>
    </aside>
  )
}
