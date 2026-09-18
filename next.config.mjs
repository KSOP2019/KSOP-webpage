/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  async redirects(){return ['arena.webp','arena-poster.webp','sculpture.webp','ksop-logo.png','ksop-logo-black.png','media/0nJaWopMjwo.jpg','media/F-Kb9Iz0Z2g.jpg','media/YSPq5RWK3dU.jpg','partners/cpg.webp','partners/gpi.jpg','partners/jopt.png'].map(path=>({source:'/motion/assets/'+path,destination:'https://srkxcezthuzldxndcpkt.supabase.co/storage/v1/object/public/media/motion/approved-20260918/'+path,permanent:false}))},
  async rewrites(){return {beforeFiles:['/','/home','/schedule/:path*','/events/:path*','/ranking/:path*','/players/:path*','/news/:path*','/media','/about/:path*','/partners','/contact'].map(source=>({source,destination:'/motion/index.html'})),afterFiles:[],fallback:[]}},
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        {
          key: 'Content-Security-Policy',
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' https://vercel.live https://*.vercel-insights.com",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "img-src 'self' data: blob: https:",
            "font-src 'self' data: https://fonts.gstatic.com",
            "connect-src 'self' https://*.supabase.co https://*.vercel-insights.com",
            "media-src 'self' blob: https:",
            "frame-ancestors 'self'",
            "form-action 'self'",
            "object-src 'none'",
            "base-uri 'self'",
          ].join('; '),
        },
      ],
    }]
  },
}
export default nextConfig
