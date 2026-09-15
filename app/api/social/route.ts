import { NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/auth'
import { createAdminClient, createPublicClient } from '@/lib/supabase-server'

const SOCIAL_KEYS = ['flopin', 'instagram', 'x', 'discord', 'facebook', 'youtube'] as const

type SocialKey = (typeof SOCIAL_KEYS)[number]
type SocialLinks = Record<SocialKey, string>

const EMPTY_SOCIALS: SocialLinks = {
  flopin: '',
  instagram: '',
  x: '',
  discord: '',
  facebook: '',
  youtube: '',
}

function normalize(value: unknown): SocialLinks {
  const source = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
  return SOCIAL_KEYS.reduce((acc, key) => {
    const raw = typeof source[key] === 'string' ? String(source[key]).trim() : ''
    acc[key] = raw === '#' ? '' : raw
    return acc
  }, { ...EMPTY_SOCIALS })
}

export async function GET() {
  const client = createPublicClient()
  if (!client) return NextResponse.json(EMPTY_SOCIALS)

  const { data, error } = await client.from('site_settings').select('value').eq('key', 'global').maybeSingle()
  if (error || !data?.value) return NextResponse.json(EMPTY_SOCIALS)

  const value = data.value as Record<string, unknown>
  const nested = normalize(value.social)
  return NextResponse.json({
    flopin: nested.flopin,
    instagram: nested.instagram || normalize({ instagram: value.instagram_url }).instagram,
    x: nested.x || normalize({ x: value.x_url }).x,
    discord: nested.discord,
    facebook: nested.facebook || normalize({ facebook: value.facebook_url }).facebook,
    youtube: nested.youtube || normalize({ youtube: value.youtube_url }).youtube,
  })
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  if (!admin) {
    return NextResponse.json({ error: 'Admin service role not configured' }, { status: 503 })
  }

  const social = normalize(await request.json())
  const { data: current, error: readError } = await admin.from('site_settings').select('value').eq('key', 'global').maybeSingle()
  if (readError) return NextResponse.json({ error: readError.message }, { status: 500 })

  const currentValue = current?.value && typeof current.value === 'object' ? current.value as Record<string, unknown> : {}
  const value = {
    ...currentValue,
    social,
    instagram_url: social.instagram,
    x_url: social.x,
    facebook_url: social.facebook,
    youtube_url: social.youtube,
  }

  const { error } = await admin.from('site_settings').upsert({ key: 'global', value }, { onConflict: 'key' })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { revalidateContentPages } = await import('@/lib/revalidate')
  revalidateContentPages()
  return NextResponse.json(social)
}
