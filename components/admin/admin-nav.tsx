'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const links = [{href:'/admin',label:'관리 홈'},{href:'/admin/manage/settings',label:'홈 문구·이미지'},...Object.entries({series:'일정·시리즈',events:'이벤트',players:'선수·랭킹',results:'선수 경기 기록',news:'뉴스·인터뷰',videos:'영상·숏츠',about:'회사 소개·연혁',partners:'파트너'}).map(([k,v])=>({href:'/admin/manage/'+k,label:v})),{href:'/admin/media',label:'파일 관리'}]

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
        <Link href="/">홈페이지 보기</Link>
        <button type="button" onClick={logout}>로그아웃</button>
      </nav>
    </aside>
  )
}
