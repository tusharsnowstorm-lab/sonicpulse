import Link from 'next/link'
import { faqs } from '@/data/faq'
import { AccordionItem } from '@/components/ui/Accordion'

const preview = faqs.slice(0, 3)

export default function FAQTeaser() {
  return (
    <section className="py-12 md:py-20 px-4" style={{ background: 'var(--bg-surface)' }}>
      <div className="max-w-[1200px] mx-auto">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p
              className="text-[10px] tracking-[0.3em] uppercase mb-2"
              style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-jetbrains-mono)' }}
            >
              FAQ
            </p>
            <h2
              className="text-2xl md:text-3xl font-black glow-heading"
              style={{ fontFamily: 'var(--font-space-grotesk)', color: 'var(--text-primary)' }}
            >
              GOT QUESTIONS?
            </h2>
          </div>
          <Link
            href="/faq"
            className="text-xs tracking-widest uppercase transition-colors duration-150 whitespace-nowrap"
            style={{ color: 'var(--accent-magenta)', fontFamily: 'var(--font-jetbrains-mono)' }}
          >
            See all FAQs →
          </Link>
        </div>

        <div className="max-w-2xl">
          {preview.map((item) => (
            <AccordionItem key={item.id} question={item.question} answer={item.answer} />
          ))}
        </div>
      </div>
    </section>
  )
}
