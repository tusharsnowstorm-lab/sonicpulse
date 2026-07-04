import Link from 'next/link'

function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2"/>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2"/>
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function TikTokIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

const quickLinks = [
  { href: '/lineup', label: 'Lineup' },
  { href: '/schedule', label: 'Schedule' },
  { href: '/tickets', label: 'Tickets' },
  { href: '/faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
]

export default function Footer() {
  return (
    <footer style={{ background: 'var(--bg-elevated)', borderTop: '1px solid var(--border)' }}>
      <div className="max-w-[1200px] mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* About */}
          <div>
            <span
              className="block text-base font-black tracking-[0.2em] mb-3"
              style={{ fontFamily: 'var(--font-space-grotesk)', color: 'var(--accent-electric)' }}
            >
              SONIC PULSE
            </span>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Presented by Dhaka Music Festival. Bringing the underground to the open skies of Bangladesh.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-bold tracking-widest uppercase text-[var(--text-muted)] mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-[var(--text-muted)] hover:text-[var(--accent-electric)] transition-colors duration-150"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-bold tracking-widest uppercase text-[var(--text-muted)] mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-[var(--text-muted)]">
              <li>
                <a href="mailto:hello@sonicpulsefestival.com" className="hover:text-[var(--accent-electric)] transition-colors duration-150">
                  hello@sonicpulsefestival.com
                </a>
              </li>
              <li>
                <a href="mailto:press@sonicpulsefestival.com" className="hover:text-[var(--accent-electric)] transition-colors duration-150">
                  press@sonicpulsefestival.com
                </a>
              </li>
              <li className="text-xs pt-1">Bashundhara, Dhaka, Bangladesh</li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-xs font-bold tracking-widest uppercase text-[var(--text-muted)] mb-4">Follow Us</h3>
            <div className="flex items-center gap-4">
              <a href="https://instagram.com/sonicpulsefestival" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-[var(--text-muted)] hover:text-[var(--accent-electric)] transition-colors duration-150">
                <InstagramIcon />
              </a>
              <a href="#" aria-label="Facebook" className="text-[var(--text-muted)] hover:text-[var(--accent-electric)] transition-colors duration-150">
                <FacebookIcon />
              </a>
              <a href="#" aria-label="TikTok" className="text-[var(--text-muted)] hover:text-[var(--accent-electric)] transition-colors duration-150">
                <TikTokIcon />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[var(--text-muted)]">
          <span>© 2025 Dhaka Music Festival. All rights reserved.</span>
          <span>Sonic Pulse — 25 September 2026 · Dhaka, BD</span>
        </div>
      </div>
    </footer>
  )
}
