import type { Metadata } from 'next'
import FAQList from '@/components/faq/FAQList'

export const metadata: Metadata = {
  title: 'FAQ — Sonic Pulse',
  description: 'Answers to common questions about Sonic Pulse 2025.',
}

export default function FAQPage() {
  return (
    <div className="max-w-[1200px] mx-auto px-4 py-12 md:py-20">
      <div className="mb-12">
        <p
          className="text-[10px] tracking-[0.3em] uppercase mb-2"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-jetbrains-mono)' }}
        >
          Got Questions?
        </p>
        <h1
          className="text-4xl md:text-5xl font-black glow-heading"
          style={{ fontFamily: 'var(--font-space-grotesk)', color: 'var(--text-primary)' }}
        >
          FAQ
        </h1>
      </div>

      <div className="max-w-3xl">
        <FAQList />
      </div>
    </div>
  )
}
