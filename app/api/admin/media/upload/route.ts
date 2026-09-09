import { handleMediaUpload } from '@/lib/media-upload'

/** Preferred CMS image upload path (same implementation as /api/admin/upload). */
export async function POST(request: Request) {
  return handleMediaUpload(request)
}
