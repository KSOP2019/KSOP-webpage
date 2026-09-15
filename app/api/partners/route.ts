import { NextResponse } from 'next/server'
import { isAdminAuthenticated } from '@/lib/auth'
import { createAdminClient, createPublicClient } from '@/lib/supabase-server'
import { DEFAULT_KSOP_PARTNERS, normalizePartners } from '@/lib/partners'

function isAllowedUrl(value: string) {
  if (!value) return true
  if (value.startsWith('/')) return true
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

async function readGlobalValue(client: ReturnType<typeof createPublicClient> | ReturnType<typeof createAdminClient>) {
  if (!client) return null
  const { data, error } = await client.from('site_settings').select('value').eq('key', 'global').single()
  if (error || !data?.value || typeof data.value !== 'object') return null
  return data.value as Record<string, unknown>
}

export async function GET() {
  const value = await readGlobalValue(createPublicClient())
  return NextResponse.json(normalizePartners(value?.partners ?? DEFAULT_KSOP_PARTNERS))
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  if (!admin) {
    return NextResponse.json({ error: 'Admin persistence unavailable' }, { status: 503 })
  }

  const partners = normalizePartners(await request.json())
  const invalid = partners.find((partner) => !isAllowedUrl(partner.url) || !isAllowedUrl(partner.logoUrl))
  if (invalid) {
    return NextResponse.json({ error: `Invalid partner URL: ${invalid.name}` }, { status: 400 })
  }

  const current = (await readGlobalValue(admin)) ?? {}
  const { error } = await admin.from('site_settings').upsert(
    { key: 'global', value: { ...current, partners } },
    { onConflict: 'key' },
  )

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { revalidateContentPages } = await import('@/lib/revalidate')
  revalidateContentPages()
  return NextResponse.json(partners)
}
