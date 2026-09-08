import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-server'
import { isAdminAuthenticated } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const authed = await isAdminAuthenticated()
    if (!authed) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminClient = createAdminClient()
    if (!adminClient) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const filename = `media/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '-')}`

    const { data, error } = await adminClient.storage.from('media').upload(filename, buffer, {
      contentType: file.type,
      upsert: false,
    })

    if (error) {
      console.error('Upload error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const { data: publicUrlData } = adminClient.storage.from('media').getPublicUrl(filename)

    return NextResponse.json({ url: publicUrlData.publicUrl })
  } catch (e: any) {
    console.error('Upload exception:', e.message)
    return NextResponse.json({ error: e.message || 'Upload failed' }, { status: 500 })
  }
}
