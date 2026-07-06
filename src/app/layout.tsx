import type { Metadata, Viewport } from 'next'
import { Montserrat } from 'next/font/google'
import './globals.css'

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '900'],
  variable: '--font-montserrat',
  display: 'swap',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#050508',
}

export const metadata: Metadata = {
  title: 'Sonic Pulse - Outdoor Music Festival',
  description: "Two stages. 800+ festival-goers. Dawn till dusk. Sonic Pulse is Bangladesh's largest outdoor music festival, presented by Dhaka Music Festival.",
  openGraph: {
    title: 'Sonic Pulse - Outdoor Music Festival',
    description: 'Two stages. 800+ festival-goers. Dawn till dusk.',
    type: 'website',
    locale: 'en_BD',
    siteName: 'Sonic Pulse',
  },
  robots: { index: true, follow: true },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Sonic Pulse',
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={montserrat.variable} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
