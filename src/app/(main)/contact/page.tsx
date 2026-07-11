import type { Metadata } from 'next'
import ContactDetails from '@/components/contact/ContactDetails'
import ContactForm from '@/components/contact/ContactForm'
import PageHeader from '@/components/ui/PageHeader'

export const metadata: Metadata = {
  title: 'Contact — Sonic Pulse',
  description: 'Get in touch with the Sonic Pulse team.',
}

export default function ContactPage() {
  return (
    <div className="max-w-[1200px] mx-auto px-4" style={{ padding: '64px 6vw 100px' }}>
      <PageHeader eyebrow="Get in touch" title="Contact" />
      <div className="grid md:grid-cols-2 gap-12 md:gap-20">
        <ContactDetails />
        <ContactForm />
      </div>
    </div>
  )
}
