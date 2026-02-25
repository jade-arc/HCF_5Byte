import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/lib/contexts/theme-context'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f1419' },
  ],
}

export const metadata: Metadata = {
  title: 'Wealth Platform - Longevity Focused Retirement',
  description: 'AI-powered wealth management platform that converts transactions into an adaptive retirement portfolio optimized for longevity',
  generator: 'v0.app',
  applicationName: 'Wealth Platform',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Wealth Platform',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
        sizes: '32x32',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
        sizes: '32x32',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: [
      {
        url: '/apple-icon.png',
        sizes: '180x180',
      },
      {
        url: '/apple-icon-152x152.png',
        sizes: '152x152',
      },
    ],
  },
  manifest: '/manifest.json',
  keywords: [
    'wealth management',
    'retirement planning',
    'portfolio optimization',
    'longevity insurance',
    'financial planning',
    'AI-powered finance',
  ],
  authors: [{ name: 'Wealth Platform Team' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://wealth-platform.vercel.app',
    title: 'Wealth Platform - Longevity Focused Retirement',
    description:
      'Convert your transactions into an adaptive retirement portfolio optimized for longevity with AI-powered analysis',
    siteName: 'Wealth Platform',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wealth Platform',
    description:
      'AI-powered wealth management for longevity-focused retirement planning',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Wealth Platform" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                const isDark = theme === 'dark' || (!theme && prefersDark);
                if (isDark) document.documentElement.classList.add('dark');
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider>
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
