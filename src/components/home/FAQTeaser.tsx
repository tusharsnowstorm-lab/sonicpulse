import Section from '@/components/ui/Section'
import { PillLink } from '@/components/ui/PillButton'
import { faqs } from '@/data/faq'
import { AccordionItem } from '@/components/ui/Accordion'

const preview = faqs.slice(0, 3)

export default function FAQTeaser() {
  return (
    <Section eyebrow="FAQ" title="Got questions?">
      <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'left' }}>
        {preview.map((item) => (
          <AccordionItem key={item.id} question={item.question} answer={item.answer} />
        ))}
      </div>
      <PillLink href="/faq" variant="outline" style={{ marginTop: 36 }}>
        See all FAQs →
      </PillLink>
    </Section>
  )
}
