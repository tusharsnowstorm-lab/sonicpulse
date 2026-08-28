'use client'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import Link from 'next/link'

type AccordionItemProps = {
  question: string
  answer: string
  link?: { href: string; label: string }
  defaultOpen?: boolean
}

export function AccordionItem({ question, answer, link, defaultOpen = false }: AccordionItemProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div
      className="border-b border-[var(--border)]"
      style={open ? { borderLeft: '2px solid var(--accent-magenta)', paddingLeft: '12px' } : {}}
    >
      <button
        className="w-full flex items-center justify-between gap-4 py-5 text-left cursor-pointer"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="text-[var(--text-primary)] font-semibold text-sm md:text-base pr-4">
          {question}
        </span>
        <ChevronDown
          size={18}
          className="shrink-0 transition-transform duration-250"
          style={{
            color: open ? 'var(--accent-magenta)' : 'var(--text-muted)',
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </button>
      <div
        className="overflow-hidden transition-all duration-250"
        style={{ maxHeight: open ? '400px' : '0' }}
      >
        <p className="text-[var(--text-muted)] text-sm leading-relaxed">{answer}</p>
        {link && (
          <Link
            href={link.href}
            className="inline-block text-sm font-semibold mt-2"
            style={{ color: 'var(--accent-magenta)', touchAction: 'manipulation' }}
          >
            {link.label}
          </Link>
        )}
        <div className="pb-5" />
      </div>
    </div>
  )
}

type AccordionProps = {
  items: { id: string; question: string; answer: string; link?: { href: string; label: string } }[]
}

export default function Accordion({ items }: AccordionProps) {
  return (
    <div className="divide-y divide-[var(--border)]">
      {items.map((item) => (
        <AccordionItem key={item.id} question={item.question} answer={item.answer} link={item.link} />
      ))}
    </div>
  )
}
