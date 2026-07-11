import Link from 'next/link'

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function TikTokIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

const eventLinks = [
  { href: '/lineup', label: 'Lineup' },
  { href: '/schedule', label: 'Schedule' },
  { href: '/tickets', label: 'Tickets' },
]

const supportLinks = [
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
  { href: '/policy', label: 'Policy' },
]

const accountLinks = [
  { href: '/login', label: 'Sign in' },
  { href: '/dashboard', label: 'Dashboard' },
]

function LinkColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-label-muted)', marginBottom: 16, fontFamily: 'var(--font-montserrat)', fontWeight: 600 }}>
        {title}
      </p>
      <ul style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {links.map(({ href, label }) => (
          <li key={href}>
            <Link href={href} style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.5)', fontFamily: 'var(--font-montserrat)' }}>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Footer() {
  return (
    <footer style={{ background: '#000', borderTop: '1px solid var(--border)' }}>
      <div className="max-w-[1200px] mx-auto px-4" style={{ padding: '64px 6vw' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          <div style={{ gridColumn: 'span 2' }}>
            <span
              style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.32em', fontFamily: 'var(--font-montserrat)', color: '#fff' }}
            >
              SONIC PULSE
            </span>
            <p style={{ fontSize: 13.5, fontWeight: 500, color: 'rgba(255,255,255,0.65)', lineHeight: 1.65, marginTop: 14, maxWidth: 280 }}>
              Bangladesh&apos;s first sunset-to-sunrise music festival. Presented by Dhaka Music Festival.
            </p>
            <div className="flex items-center gap-4" style={{ marginTop: 22 }}>
              <a href="https://instagram.com/sonicpulsefestival" target="_blank" rel="noopener noreferrer" aria-label="Instagram" style={{ color: 'rgba(255,255,255,0.65)' }}>
                <InstagramIcon />
              </a>
              <a href="#" aria-label="Facebook" style={{ color: 'rgba(255,255,255,0.65)' }}>
                <FacebookIcon />
              </a>
              <a href="#" aria-label="TikTok" style={{ color: 'rgba(255,255,255,0.65)' }}>
                <TikTokIcon />
              </a>
            </div>
          </div>

          <LinkColumn title="Event" links={eventLinks} />
          <LinkColumn title="Support" links={supportLinks} />
          <LinkColumn title="Account" links={accountLinks} />
        </div>

        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-2"
          style={{ marginTop: 56, paddingTop: 24, borderTop: '1px solid var(--border)', fontSize: 11.5, color: 'rgba(255,255,255,0.5)' }}
        >
          <span>© {new Date().getFullYear()} Sonic Pulse</span>
          <span>25 September 2026 · Dhaka</span>
        </div>
      </div>
    </footer>
  )
}
