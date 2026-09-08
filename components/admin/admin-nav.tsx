'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const links = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/content', label: 'Home' },
  { href: '/admin/schedule', label: 'Schedule' },
  { href: '/admin/events', label: 'Events' },
  { href: '/admin/news', label: 'News' },
  { href: '/admin/players', label: 'Players' },
  { href: '/admin/media', label: 'Media' },
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
          <Link
            key={link.href}
            href={link.href}
            className={pathname === link.href || (link.href !== '/admin' && pathname.startsWith(`${link.href}/`)) ? 'is-active' : undefined}
          >
            {link.label}
          </Link>
        ))}
        <Link href="/">Preview Site</Link>
        <button type="button" onClick={logout}>Logout</button>
      </nav>
    </aside>
  )
}
