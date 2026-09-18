import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { createAdminClient } from '@/lib/supabase-server'
import { isAdminAuthenticated } from '@/lib/auth'

/** Shared server-side CMS media upload logic. Service role never leaves the server. */
export const MEDIA_BUCKET = 'media'
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
] as const

const EXT_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'application/pdf': 'pdf',
}

/** Storage folders addressable through the upload API (object path prefix). */
export const MEDIA_FOLDERS = [
  'home',
  'schedule',
  'news',
  'events',
  'events/posters',
  'events/banners',
  'events/thumbnails',
  'logos',
  'players',
  'media',
  'misc',
] as const

function sanitizeFileName(raw: string, mime: string): string {
  const base = (raw.split(/[\\/]/).pop() || 'image').trim()
  const withoutExt = base.replace(/\.[a-zA-Z0-9]{1,5}$/, '')
  const clean = withoutExt.toLowerCase().replace(/[^a-z0-9-_]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 80) || 'image'
  return `${clean}.${EXT_BY_TYPE[mime] || 'png'}`
}

function folderFor(input: FormDataEntryValue | null): string {
  const raw = typeof input === 'string' ? input.trim().toLowerCase() : ''
  if ((MEDIA_FOLDERS as readonly string[]).includes(raw)) return raw
  return 'misc'
}

export async function handleMediaUpload(request: Request) {
  try {
    const authed = await isAdminAuthenticated()
    if (!authed) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file || typeof file === 'string' || file.size === 0) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: JPG, PNG, WebP, GIF, PDF.' },
        { status: 400 },
      )
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: 'File too large (max 4MB)' }, { status: 400 })
    }

    const adminClient = createAdminClient()
    if (!adminClient) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })
    }

    const folder = folderFor(formData.get('folder'))
    const year = new Date().getUTCFullYear()
    const name = sanitizeFileName(file.name, file.type)
    const path = `${folder}/${year}/${Date.now()}-${randomUUID().slice(0, 8)}-${name}`

    const buffer = Buffer.from(await file.arrayBuffer())
    const { error } = await adminClient.storage.from(MEDIA_BUCKET).upload(path, buffer, {
      contentType: file.type,
      upsert: false,
    })

    if (error) {
      console.error('Media upload error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const { data: publicUrlData } = adminClient.storage.from(MEDIA_BUCKET).getPublicUrl(path)

    return NextResponse.json({
      url: publicUrlData.publicUrl,
      path,
      name,
      size: file.size,
    })
  } catch (e: any) {
    console.error('Media upload exception:', e?.message)
    return NextResponse.json({ error: e?.message || 'Upload failed' }, { status: 500 })
  }
}

export type MediaListItem = {
  name: string
  path: string
  url: string
  size: number | null
  mime: string | null
  createdAt: string | null
}

export async function handleMediaList(request:Request){
 if(!await isAdminAuthenticated())return NextResponse.json({error:'로그인이 필요합니다.'},{status:401});const c=createAdminClient();if(!c)return NextResponse.json({error:'DB 연결을 확인하세요.'},{status:503});const p=new URL(request.url).searchParams,page=Math.max(1,Math.min(100000,Math.floor(Number(p.get('page')))||1));const {data,error}=await c.rpc('ksop_media_page',{folder_prefix:'',page_number:page});if(error)return NextResponse.json({error:error.message},{status:500});return NextResponse.json({items:(data.items||[]).map((r:any)=>({name:r.name.split('/').pop(),path:r.name,url:c.storage.from(MEDIA_BUCKET).getPublicUrl(r.name).data.publicUrl,size:r.metadata?.size,mime:r.metadata?.mimetype,createdAt:r.created_at})),total:data.total,page},{headers:{'Cache-Control':'no-store'}})
}

export async function handleMediaDelete(request: Request) {
  const authed = await isAdminAuthenticated()
  if (!authed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const adminClient = createAdminClient()
  if (!adminClient) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })
  }

  let path = ''
  try {
    const body = await request.json()
    path = typeof body?.path === 'string' ? body.path.trim() : ''
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!path || path.includes('..') || path.startsWith('/') || /[^a-zA-Z0-9\-_./]/.test(path)) {
    return NextResponse.json({ error: 'Invalid storage path' }, { status: 400 })
  }

  const { error } = await adminClient.storage.from(MEDIA_BUCKET).remove([path])
  if (error) {
    console.error('Media delete error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, path })
}
