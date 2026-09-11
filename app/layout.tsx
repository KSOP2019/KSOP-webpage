import { Analytics } from '@vercel/analytics/next'
import { Noto_Sans_KR } from 'next/font/google'
import type { Metadata, Viewport } from 'next'
import { SITE_DESCRIPTION, SITE_LOCALE, SITE_NAME, SITE_OG_IMAGE, SITE_URL } from '@/lib/site-url'
import { ThemeProvider } from '@/providers/theme-provider'
import { SmoothScroll } from '@/providers/smooth-scroll'

const notoSansKr = Noto_Sans_KR({ subsets: ['latin'], variable: '--font-korean', display: 'swap' })
import './globals.css'
import './header-stability.css'
import '@/components/design-system/glass.css'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: '%s · KSOP',
  },
  description: SITE_DESCRIPTION,
  generator: 'KSOP',
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    siteName: 'KSOP',
    locale: SITE_LOCALE,
    alternateLocale: ['en_US', 'ja_JP', 'zh_CN'],
    url: '/',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: SITE_OG_IMAGE,
        width: 1024,
        height: 576,
        alt: 'KSOP tournament arena',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [SITE_OG_IMAGE],
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#fafdff',
}

function OrganizationJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: 'KSOP',
        alternateName: 'Korea Series of Poker',
        url: SITE_URL,
        logo: `${SITE_URL}/images/ksop-light-approved.png`,
      },
      {
        '@type': 'WebSite',
        name: SITE_NAME,
        url: SITE_URL,
        inLanguage: ['ko', 'en', 'ja', 'zh'],
      },
    ],
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className={`bg-background ${notoSansKr.variable}`} suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          <SmoothScroll>{children}</SmoothScroll>
        </ThemeProvider>
        <OrganizationJsonLd />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
