import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export const metadata: Metadata = {
  title: 'Sonic Pulse - Outdoor Music Festival, Dhaka',
  description: "Two stages. 800+ festival-goers. Dawn till dusk. Sonic Pulse is Dhaka's largest outdoor music festival, presented by Dhaka Music Festival.",
  openGraph: {
    title: 'Sonic Pulse - Outdoor Music Festival, Dhaka',
    description: 'Two stages. 800+ festival-goers. Dawn till dusk.',
    type: 'website',
    locale: 'en_BD',
    siteName: 'Sonic Pulse',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col overflow-x-hidden" suppressHydrationWarning>
        {children}
      </body>
    </html>
  )
}
