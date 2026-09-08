import { Analytics } from '@vercel/analytics/next'
import { Noto_Sans_KR } from 'next/font/google'
import type { Metadata, Viewport } from 'next'

const notoSansKr = Noto_Sans_KR({ subsets: ['latin'], variable: '--font-korean', display: 'swap' })
import './globals.css'
import './header-stability.css'

export const metadata: Metadata = {
  title: 'KSOP — Korea Series of Poker',
  description: 'The Korea Series of Poker. Discipline meets instinct in Seoul.',
  generator: 'KSOP',
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" className={`bg-background ${notoSansKr.variable}`}>
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
