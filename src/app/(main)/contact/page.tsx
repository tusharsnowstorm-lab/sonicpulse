import type { Metadata } from 'next'
import ContactDetails from '@/components/contact/ContactDetails'
import ContactForm from '@/components/contact/ContactForm'

export const metadata: Metadata = {
  title: 'Contact — Sonic Pulse',
  description: 'Get in touch with the Sonic Pulse team.',
}

export default function ContactPage() {
  return (
    <div className="max-w-[1200px] mx-auto px-4 py-12 md:py-20">
      <div className="mb-12">
        <p
          className="text-[10px] tracking-[0.3em] uppercase mb-2"
          style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-jetbrains-mono)' }}
        >
          Get In Touch
        </p>
        <h1
          className="text-4xl md:text-5xl font-black glow-heading"
          style={{ fontFamily: 'var(--font-space-grotesk)', color: 'var(--text-primary)' }}
        >
          CONTACT
        </h1>
      </div>

      <div className="grid md:grid-cols-2 gap-12 md:gap-20">
        <ContactDetails />
        <ContactForm />
      </div>
    </div>
  )
}
