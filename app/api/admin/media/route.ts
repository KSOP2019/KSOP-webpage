import { handleMediaDelete, handleMediaList } from '@/lib/media-upload'

/** Admin-only media library listing (newest first). */
export async function GET() {
  return handleMediaList()
}

/** Admin-only media delete. Body: { path }. Paths are validated server-side. */
export async function DELETE(request: Request) {
  return handleMediaDelete(request)
}
