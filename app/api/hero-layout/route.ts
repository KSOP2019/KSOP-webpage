import { NextResponse } from 'next/server'
import { getHeroLayout, saveHeroLayout } from '@/lib/hero-layout-store'
import { isAdminAuthenticated } from '@/lib/auth'

const PRODUCTION_HERO_LAYOUT_URL = 'https://ksophomepage.vercel.app/api/hero-layout'

function noStoreJson(value: unknown) {
  const response = NextResponse.json(value)
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
  return response
}

export async function GET() {
  // Preview is the visual approval surface, while /admin/hero runs on Production.
  // Read the public Production HERO settings so a saved Admin layout is visible
  // on Preview immediately after a normal refresh, without another deployment.
  if (process.env.VERCEL_ENV === 'preview') {
    try {
      const response = await fetch(PRODUCTION_HERO_LAYOUT_URL, { cache: 'no-store' })
      if (response.ok) return noStoreJson(await response.json())
    } catch {
      // Fall back to the Preview store when Production is temporarily unreachable.
    }
  }

  return noStoreJson(await getHeroLayout())
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const saved = await saveHeroLayout(body)
    const { revalidateContentPages } = await import('@/lib/revalidate')
    revalidateContentPages()
    return noStoreJson(saved)
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Hero layout save failed',
    }, { status: 500 })
  }
}
