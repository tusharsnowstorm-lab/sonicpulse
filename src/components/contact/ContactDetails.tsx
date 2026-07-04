'use client'
import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(email)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex items-center gap-2">
      <a href={`mailto:${email}`} className="text-sm hover:text-[var(--accent-electric)] transition-colors" style={{ color: 'var(--text-primary)' }}>
        {email}
      </a>
      <button onClick={copy} className="p-1 text-[var(--text-muted)] hover:text-[var(--accent-electric)] transition-colors" aria-label="Copy email">
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
    </div>
  )
}

export default function ContactDetails() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xs font-bold tracking-[0.3em] uppercase mb-4" style={{ fontFamily: 'var(--font-jetbrains-mono)', color: 'var(--accent-volt)' }}>
          General Inquiries
        </h3>
        <CopyEmail email="hello@sonicpulsefestival.com" />
        <p className="mt-2 text-xs text-[var(--text-muted)]">We typically respond within 24 hours.</p>
      </div>

      <div>
        <h3 className="text-xs font-bold tracking-[0.3em] uppercase mb-4" style={{ fontFamily: 'var(--font-jetbrains-mono)', color: 'var(--accent-volt)' }}>
          Press & Media
        </h3>
        <CopyEmail email="press@sonicpulsefestival.com" />
      </div>

      <div>
        <h3 className="text-xs font-bold tracking-[0.3em] uppercase mb-4" style={{ fontFamily: 'var(--font-jetbrains-mono)', color: 'var(--accent-volt)' }}>
          WhatsApp
        </h3>
        <a
          href="https://wa.me/8801700000000"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm transition-colors"
          style={{ color: 'var(--accent-electric)' }}
        >
          +880 1700 000 000 →
        </a>
        <p className="mt-1 text-xs text-[var(--text-muted)]">For quick questions only.</p>
      </div>

      <div>
        <h3 className="text-xs font-bold tracking-[0.3em] uppercase mb-4" style={{ fontFamily: 'var(--font-jetbrains-mono)', color: 'var(--accent-volt)' }}>
          Instagram
        </h3>
        <a
          href="https://instagram.com/sonicpulsefestival"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm transition-colors"
          style={{ color: 'var(--accent-electric)' }}
        >
          @sonicpulsefestival →
        </a>
      </div>
    </div>
  )
}
