'use client'
import { useState } from 'react'
import { faqs } from '@/data/faq'
import { AccordionItem } from '@/components/ui/Accordion'
import FAQSearch from './FAQSearch'

const categories = Array.from(new Set(faqs.map((f) => f.category)))

export default function FAQList() {
  const [search, setSearch] = useState('')

  const filtered = search.trim()
    ? faqs.filter(
        (f) =>
          f.question.toLowerCase().includes(search.toLowerCase()) ||
          f.answer.toLowerCase().includes(search.toLowerCase())
      )
    : faqs

  const grouped = categories.reduce<Record<string, typeof faqs>>((acc, cat) => {
    const items = filtered.filter((f) => f.category === cat)
    if (items.length) acc[cat] = items
    return acc
  }, {})

  return (
    <div>
      <div className="mb-8 max-w-md">
        <FAQSearch value={search} onChange={setSearch} />
      </div>

      {Object.keys(grouped).length === 0 && (
        <p className="text-[var(--text-muted)] text-sm">No questions match your search.</p>
      )}

      <div className="space-y-10">
        {Object.entries(grouped).map(([category, items]) => (
          <section key={category}>
            <h2
              className="text-xs font-bold tracking-[0.3em] uppercase mb-4"
              style={{ fontFamily: 'var(--font-jetbrains-mono)', color: 'var(--accent-volt)' }}
            >
              {category}
            </h2>
            {items.map((item) => (
              <AccordionItem key={item.id} question={item.question} answer={item.answer} />
            ))}
          </section>
        ))}
      </div>
    </div>
  )
}
