import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site-url'

export default function robots(): MetadataRoute.Robots {
  // Preview deployments must never be indexed.
  if (process.env.VERCEL_ENV === 'preview') {
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
      sitemap: `${SITE_URL}/sitemap.xml`,
    }
  }
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
