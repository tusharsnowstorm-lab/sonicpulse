import type { Metadata } from 'next'
import FAQList from '@/components/faq/FAQList'
import PageHeader from '@/components/ui/PageHeader'

export const metadata: Metadata = {
  title: 'FAQ — Sonic Pulse',
  description: 'Answers to common questions about Sonic Pulse.',
}

export default function FAQPage() {
  return (
    <div className="max-w-[1200px] mx-auto px-4" style={{ padding: '64px 6vw 100px' }}>
      <PageHeader eyebrow="Got questions?" title="FAQ" />
      <div className="max-w-3xl">
        <FAQList />
      </div>
    </div>
  )
}
